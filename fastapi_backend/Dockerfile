# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables to prevent .pyc files and enable log output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI backend code into the container
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Command to run the FastAPI application using uvicorn (main.py contains `app`)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
