# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Frontend via FastAPI
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies needed for scientific libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgdal-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY ai_models/ ./backend/ai_models/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup working directory for backend execution
WORKDIR /app/backend
RUN mkdir -p data pretrained_weights

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
