# Base image with Python
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create a working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Install uv (or fallback to pip if needed)
RUN pip install --upgrade pip \
    && pip install uv

# Install dependencies using uv (if you use uv with pyproject.toml)
RUN uv pip install --system --no-deps .

# Expose FastAPI's default port
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
