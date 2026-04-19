FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run init_db.py then start uvicorn from within app/ so that relative imports
# (from db import pg, from services import ..., from auth import ...) resolve
# against app/ as the Python path root. PORT is injected by Render; defaults to 8000.
CMD ["sh", "-c", "python /app/app/init_db.py && cd /app/app && uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]