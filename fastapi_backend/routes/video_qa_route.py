
import os

import re
from urllib.parse import urlparse, parse_qs
import asyncio
import anyio

from fastapi import APIRouter, UploadFile, File, HTTPException, status,Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional,List

from supabase import create_client,Client

from google import genai
from google.genai import types
from fastapi.responses import JSONResponse
from loguru import logger

logger.add("video_qa.log", rotation="10 MB", retention="10 days", level="DEBUG")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    logger.success("Google GenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Google GenAI client: {str(e)}")
    raise

video_router = APIRouter(prefix="/video-qa", tags=["Video Question Answering"])

class YouTubeVideoRequest(BaseModel):
    url: HttpUrl

class VideoUploadResponse(BaseModel):
    response_text: str
    message: str

class TimestampEmbed(BaseModel):
    timestamp: str
    start_seconds: int
    embed_url: str

class YouTubeResponse(BaseModel):
    response_text: str
    message: str
    timestamps: List[TimestampEmbed] = []
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    jwt_token = auth_header.split(" ")[1]
    user_response = supabase.auth.get_user(jwt_token)
    logger.info(f"The user response is : {user_response}")
    if user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_response.user
 

def extract_timestamps(text: str) -> list[str]:
    """Extract timestamps from text using regex pattern"""
    pattern = r'(\d{1,2}:\d{2}(?::\d{2})?)'
    timestamps = re.findall(pattern, text)
    logger.debug(f"Extracted {len(timestamps)} timestamps from text")
    return timestamps

def ts_to_seconds(ts: str) -> int:
    """Convert timestamp string to seconds"""
    try:
        parts = list(map(int, ts.split(':')))
        if len(parts) == 3:
            return parts[0]*3600 + parts[1]*60 + parts[2]
        elif len(parts) == 2:
            return parts[0]*60 + parts[1]
        else:
            return int(parts[0])
    except Exception as e:
        logger.warning(f"Failed to convert timestamp {ts}: {str(e)}")
        raise ValueError(f"Invalid timestamp format: {ts}")

def build_embed_url(youtube_url: str, timestamp: str) -> tuple[str, int]:
    """Build YouTube embed URL with timestamp"""
    logger.debug(f"Building embed URL for {youtube_url} at {timestamp}")
    parsed_url = urlparse(youtube_url)
    video_id = None

    if 'youtu.be' in parsed_url.netloc:
        video_id = parsed_url.path.lstrip('/')
    elif 'youtube.com' in parsed_url.netloc:
        qs = parse_qs(parsed_url.query)
        video_id = qs.get('v', [None])[0]

    if not video_id:
        logger.error(f"Invalid YouTube URL format: {youtube_url}")
        raise ValueError("Invalid YouTube URL")

    start_seconds = ts_to_seconds(timestamp)
    embed_url = f"https://www.youtube.com/embed/{video_id}?start={start_seconds}&autoplay=1"
    logger.debug(f"Generated embed URL: {embed_url}")
    return embed_url, start_seconds

@video_router.post("/process-youtube", response_model=YouTubeResponse)
async def process_youtube_video(request: YouTubeVideoRequest):
    """Process YouTube video URL and generate summary"""
    logger.info(f"Processing YouTube video request for URL: {request.url}")
    logger.debug(f"Request details: {request.dict()}")

    try:
        logger.debug("Initializing Google GenAI content generation")
        response = client.models.generate_content(
            model='models/gemini-2.5-flash-preview-04-17',
            contents=types.Content(
                parts=[
                    types.Part(
                        file_data=types.FileData(file_uri=str(request.url))
                    ),
                    types.Part(text="Help me summarize important details from this lecture video in detail and also provide examples of your own to make the student understand it better")
                ]
            )
        )
        
        if not response.text:
            logger.error("Empty response received from GenAI model")
            raise HTTPException(status_code=500, detail="No transcription text returned from model")

        logger.info(f"Successfully generated content for video: {request.url}")
        logger.debug(f"Response text length: {len(response.text)} characters")

        # Process timestamps
        timestamps = extract_timestamps(response.text)
        logger.info(f"Found {len(timestamps)} timestamps in response")

        timestamp_embeds = []
        for ts in timestamps:
            try:
                embed_url, start_seconds = build_embed_url(str(request.url), ts)
                timestamp_embeds.append(TimestampEmbed(
                    timestamp=ts,
                    start_seconds=start_seconds,
                    embed_url=embed_url
                ))
                logger.debug(f"Processed timestamp {ts} -> {embed_url}")
            except Exception as e:
                logger.warning(f"Failed to process timestamp {ts}: {str(e)}")

        logger.success(f"Completed processing for YouTube video: {request.url}")
        return YouTubeResponse(
            response_text=response.text,
            message="YouTube video processed successfully",
            timestamps=timestamp_embeds
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing YouTube video: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing YouTube video: {str(e)}")

@video_router.post("/upload-video", response_model=VideoUploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Handle video file upload and processing"""
    logger.info(f"Starting video upload processing for file: {file.filename}")
    logger.debug(f"File details: {file.filename}, {file.content_type}")

    # Validate file extension
    allowed_ext = [".mp4", ".mov", ".avi", ".mkv"]
    if not any(file.filename.lower().endswith(ext) for ext in allowed_ext):
        logger.error(f"Invalid file extension for {file.filename}")
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Allowed: {allowed_ext}")

    try:
        # Save temporary file
        temp_path = f"temp_{file.filename}"
        logger.debug(f"Saving to temporary file: {temp_path}")
        
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)
        logger.info(f"Saved {len(contents)} bytes to temporary file")

        # Upload to GenAI
        logger.debug("Uploading file to Google GenAI")
        myfile = client.files.upload(file=temp_path)
        logger.info(f"File uploaded successfully, file ID: {myfile.id if hasattr(myfile, 'id') else 'N/A'}")

        # Generate content
        logger.debug("Generating video content summary")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                myfile,
                "Summarize this video. Then create a quiz with an answer key based on the information in this video."
            ]
        )

        # Clean up
        os.remove(temp_path)
        logger.debug(f"Removed temporary file: {temp_path}")

        if not response.text:
            logger.error("Empty response from GenAI model")
            raise HTTPException(status_code=500, detail="No response text returned from model")

        logger.success(f"Successfully processed uploaded video: {file.filename}")
        return VideoUploadResponse(
            response_text=response.text,
            message="Video file processed successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing uploaded video")

        raise HTTPException(status_code=500, detail=f"Error processing video file: {str(e)}")
    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.debug(f"Cleaned up temporary file: {temp_path}")
            except Exception as e:
                logger.warning(f"Failed to remove temporary file: {str(e)}")