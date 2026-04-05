from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse, ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from routes.document_qa_route import document_router
from routes.visual_qa_route import image_router
from routes.video_qa_route import video_router

app = FastAPI(default_response_class=ORJSONResponse)


BLOCKED_PATTERNS = [".env", ".git", "phpinfo", ".php", "wp-login", "laravel", "xampp"]

@app.middleware("http")
async def block_scanners(request: Request, call_next):
    path = request.url.path.lower()
    if any(pattern in path for pattern in BLOCKED_PATTERNS):
        return ORJSONResponse(
            status_code=403,
            content={"detail": "Access forbidden: security scan detected."}
        )
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://eduverse.cortexruntime.info",
    ],
    allow_origin_regex = r"https://(?:.*\.)?cortexruntime\.info",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(document_router)
app.include_router(image_router)
app.include_router(video_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
