# ATS Resume Scanner - Deployment Guide

## Quick Start (Docker)

```bash
# Clone/navigate to the project
cd ats-system

# Build and start services
docker-compose up -d

# Check health
curl http://localhost:8000/api/v1/health
```

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Local Development
```bash
docker-compose up --build
```

#### Production
```bash
# Build production image
docker build -t ats-scanner:latest ./backend

# Run with environment variables
docker run -d \
  -p 8000:8000 \
  -e DEBUG=false \
  -e LOG_LEVEL=INFO \
  --name ats-scanner \
  ats-scanner:latest
```

### 2. AWS Deployment

#### ECS (Elastic Container Service)
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t ats-scanner ./backend
docker tag ats-scanner:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ats-scanner:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ats-scanner:latest
```

#### Elastic Beanstalk
1. Create `Dockerrun.aws.json`:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "your-dockerhub/ats-scanner",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8000"
    }
  ]
}
```

2. Deploy via EB CLI:
```bash
eb init -p docker ats-scanner
eb create ats-scanner-env
eb open
```

### 3. Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/ats-scanner ./backend

# Deploy to Cloud Run
gcloud run deploy ats-scanner \
  --image gcr.io/PROJECT_ID/ats-scanner \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 10 \
  --max-instances 10
```

### 4. Heroku Deployment

```bash
# Login and create app
heroku login
heroku create your-ats-scanner

# Add heroku.yml
heroku stack:set container

# Deploy
git push heroku main
```

Create `heroku.yml`:
```yaml
build:
  docker:
    web: backend/Dockerfile
run:
  web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 5. Railway/Render

1. Connect GitHub repository
2. Set build context to `./backend`
3. Add environment variables
4. Deploy

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | 0.0.0.0 |
| `PORT` | Server port | 8000 |
| `DEBUG` | Debug mode | false |
| `LOG_LEVEL` | Logging level | INFO |
| `ALLOWED_ORIGINS` | CORS origins | * |
| `MAX_FILE_SIZE` | Max upload size | 5242880 |
| `RATE_LIMIT` | Requests per minute | 60 |
| `CACHE_ENABLED` | Enable caching | true |
| `CACHE_TTL` | Cache TTL (seconds) | 3600 |

## Performance Tuning

### Memory Requirements
- Minimum: 1GB RAM
- Recommended: 2GB+ RAM (for ML models)

### CPU Requirements
- Minimum: 1 vCPU
- Recommended: 2+ vCPUs

### Scaling Recommendations

#### Horizontal Scaling
```yaml
# docker-compose.yml with multiple instances
services:
  ats-backend-1:
    build: ./backend
    ports:
      - "8000:8000"
  
  ats-backend-2:
    build: ./backend
    ports:
      - "8001:8000"
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
```

#### Load Balancer Configuration (nginx)
```nginx
upstream ats_backend {
    least_conn;
    server ats-backend-1:8000;
    server ats-backend-2:8000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://ats_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Regular security updates
- [ ] File upload validation
- [ ] Input sanitization
- [ ] Logging and monitoring

## Monitoring

### Health Check Endpoint
```bash
curl http://your-domain.com/api/v1/health
```

### Prometheus Metrics (Optional)
Add to `main.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

### Logging
Logs are output in JSON format for easy parsing:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "INFO",
  "message": "Resume scanned successfully",
  "score": 85.5,
  "file_type": "pdf"
}
```

## Troubleshooting

### Model Loading Issues
```bash
# Re-download spaCy model
docker exec -it ats-scanner python -m spacy download en_core_web_lg
```

### Memory Issues
- Increase container memory limit
- Use smaller transformer model: `all-MiniLM-L6-v2` (already default)

### Slow Response Times
- Enable caching (Redis)
- Use CDN for static assets
- Scale horizontally

## Frontend Integration

Update your frontend to point to the deployed API:

```javascript
// For production
const atsChecker = new ATSChecker('https://api.yourdomain.com/api/v1');

// For development
const atsChecker = new ATSChecker('http://localhost:8000/api/v1');
```

## API Documentation

Once deployed, access interactive API docs at:
- Swagger UI: `http://your-domain.com/docs`
- ReDoc: `http://your-domain.com/redoc`
