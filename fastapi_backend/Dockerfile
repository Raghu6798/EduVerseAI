# Stage 1: Build stage
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS builder

# Enable bytecode compilation and set environment
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
# This only runs if uv.lock or pyproject.toml changes
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Copy the source code and sync the project
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


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
