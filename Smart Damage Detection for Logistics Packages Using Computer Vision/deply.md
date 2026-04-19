# LogiVision AI - Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Local Production Setup

#### 1. Backend Deployment
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Set production environment variables
export POSTGRES_DSN="postgresql://user:password@localhost:5432/logivision_prod"
export S3_BUCKET_NAME="your-production-bucket"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
export SECRET_KEY="your-super-secret-jwt-key"

# Run with Gunicorn (production server)
pip install gunicorn
gunicorn app.app:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 2. Frontend Deployment
```bash
# Navigate to frontend
cd frontend/angular-app

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or any static server
# Built files will be in dist/ folder
```

#### 3. Database Setup
```sql
-- Create production database
CREATE DATABASE logivision_prod;

-- Run your table creation scripts
-- (users, packages, inspection_images, predictions tables)
```

### Option 2: Docker Deployment

#### 1. Create Docker Files

**Backend Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/* /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: logivision
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      POSTGRES_DSN: postgresql://admin:admin123@postgres:5432/logivision
      S3_BUCKET_NAME: ${S3_BUCKET_NAME}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend/angular-app
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Option 3: Cloud Deployment (AWS)

#### 1. AWS Services Setup
- **EC2**: For hosting backend
- **RDS**: PostgreSQL database
- **S3**: Image storage (already configured)
- **CloudFront**: CDN for frontend
- **Route 53**: Domain management

#### 2. Backend on EC2
```bash
# Launch EC2 instance (Ubuntu 22.04)
# Install dependencies
sudo apt update
sudo apt install python3-pip nginx

# Clone your repository
git clone your-repo-url
cd your-project

# Install Python dependencies
pip3 install -r backend/requirements.txt

# Setup systemd service
sudo nano /etc/systemd/system/logivision.service
```

**systemd service file:**
```ini
[Unit]
Description=LogiVision AI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/your-project/backend
Environment=PATH=/home/ubuntu/.local/bin
ExecStart=/home/ubuntu/.local/bin/gunicorn app.app:app --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 3. Frontend on S3 + CloudFront
```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-frontend-bucket --delete

# Setup CloudFront distribution
# Point to S3 bucket
# Configure custom domain
```

### Option 4: Render (Recommended - Easy & Powerful)

#### 1. Backend Deployment on Render
```bash
# Create render.yaml in your project root
# Push to GitHub/GitLab
# Connect repository to Render
```

**render.yaml:**
```yaml
services:
  - type: web
    name: logivision-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app.app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: POSTGRES_DSN
        fromDatabase:
          name: logivision-db
          property: connectionString
      - key: S3_BUCKET_NAME
        value: your-s3-bucket
      - key: AWS_ACCESS_KEY_ID
        value: your-access-key
      - key: AWS_SECRET_ACCESS_KEY
        value: your-secret-key
      - key: SECRET_KEY
        generateValue: true

  - type: pserv
    name: logivision-db
    databaseName: logivision
    databaseUser: admin

  - type: web
    name: logivision-frontend
    env: static
    buildCommand: cd frontend/angular-app && npm install && npm run build
    staticPublishPath: frontend/angular-app/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

#### 2. Manual Setup (Alternative)

**Backend Service:**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new "Web Service"
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app.app:app --host 0.0.0.0 --port $PORT`
   - Environment: `Python 3`

**Database:**
1. Create "PostgreSQL" service
2. Copy connection string to backend environment variables

**Frontend Service:**
1. Create "Static Site"
2. Settings:
   - Build Command: `cd frontend/angular-app && npm install && npm run build`
   - Publish Directory: `frontend/angular-app/dist`

#### 3. Environment Variables (Render Dashboard)
```bash
POSTGRES_DSN=postgresql://user:pass@host:5432/db  # Auto-generated
S3_BUCKET_NAME=your-s3-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SECRET_KEY=auto-generated-by-render
```

### Option 5: Vercel + Railway (Easiest)

#### 1. Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend/angular-app
vercel --prod
```

#### 2. Backend on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

## 🔧 Production Configuration

### Environment Variables
```bash
# Backend (.env)
POSTGRES_DSN=postgresql://user:pass@host:5432/db
S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
SECRET_KEY=your-jwt-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend (environment.prod.ts)
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.com/api'
};
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/logivision/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 Pre-Deployment Checklist

- [ ] Update API URLs in frontend
- [ ] Set production environment variables
- [ ] Configure database connection
- [ ] Setup S3 bucket and permissions
- [ ] Test all endpoints
- [ ] Setup SSL certificates
- [ ] Configure domain DNS
- [ ] Setup monitoring and logging
- [ ] Create database backups
- [ ] Test file upload functionality

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS**: Use SSL certificates in production
3. **CORS**: Configure proper CORS settings
4. **Database**: Use strong passwords and restrict access
5. **S3**: Configure proper bucket policies
6. **JWT**: Use strong secret keys
7. **Rate Limiting**: Implement API rate limiting

## 📊 Monitoring

- Setup application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Setup uptime monitoring
- Monitor database performance
- Track S3 usage and costs

## 🚀 Quick Deploy Commands

```bash
# Full Docker deployment
docker-compose up -d

# Render (with render.yaml)
git push origin main  # Auto-deploys

# Frontend only (Vercel)
cd frontend/angular-app && vercel --prod

# Backend only (Railway)
cd backend && railway up
```