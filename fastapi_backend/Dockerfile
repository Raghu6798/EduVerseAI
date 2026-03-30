# Stage 1: Build stage
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS builder

# Enable bytecode compilation and set environment
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Create a virtual environment
RUN uv venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Install dependencies from requirements.txt
# This layer is cached until requirements.txt changes
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install -r requirements.txt


# Stage 2: Runtime stage
FROM python:3.11-slim-bookworm

# Set runtime environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Copy only the virtual environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Copy the rest of your application
COPY . /app

# Expose port and start the application
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
