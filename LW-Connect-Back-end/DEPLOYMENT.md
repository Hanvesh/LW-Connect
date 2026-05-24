# LW-Connect Deployment Guide

## Prerequisites

- Python 3.12+
- PostgreSQL 14+ with pgvector extension
- Redis 7+
- Docker & Docker Compose (optional)

## Local Development Setup

### 1. Clone and Setup Environment

```bash
cd /home/hanvesh/Projects/LW-Connect

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb lwconnect

# Enable pgvector extension
psql lwconnect -c "CREATE EXTENSION vector;"

# Run migrations
alembic upgrade head

# Seed sample data
python scripts/seed.py
```

### 3. Start Services

**Terminal 1 - API Server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Celery Worker:**
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

**Terminal 3 - Redis (if not running):**
```bash
redis-server
```

### 4. Access Application

- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Deployment

### Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Initialize Database

```bash
# Run migrations
docker-compose exec app alembic upgrade head

# Seed data
docker-compose exec app python scripts/seed.py
```

## Production Deployment

### 1. Environment Configuration

Update `.env` for production:

```bash
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/lwconnect
REDIS_URL=redis://redis-host:6379/0
CORS_ORIGINS=["https://yourdomain.com"]
```

### 2. Database Migration

```bash
# Backup existing database
pg_dump lwconnect > backup.sql

# Run migrations
alembic upgrade head
```

### 3. Using Gunicorn (Production Server)

```bash
# Install gunicorn
pip install gunicorn

# Start with gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### 4. Systemd Service (Linux)

Create `/etc/systemd/system/lwconnect.service`:

```ini
[Unit]
Description=LW-Connect API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/lwconnect
Environment="PATH=/opt/lwconnect/venv/bin"
ExecStart=/opt/lwconnect/venv/bin/gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable lwconnect
sudo systemctl start lwconnect
sudo systemctl status lwconnect
```

### 5. Celery Worker Service

Create `/etc/systemd/system/lwconnect-worker.service`:

```ini
[Unit]
Description=LW-Connect Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/opt/lwconnect
Environment="PATH=/opt/lwconnect/venv/bin"
ExecStart=/opt/lwconnect/venv/bin/celery -A app.workers.celery_app worker \
  --loglevel=info \
  --logfile=/var/log/lwconnect/celery.log

[Install]
WantedBy=multi-user.target
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/lwconnect`:

```nginx
upstream lwconnect_api {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.lwconnect.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://lwconnect_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/lwconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.lwconnect.com
```

## AWS Deployment

### Using EC2

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install dependencies:
```bash
sudo apt update
sudo apt install python3.12 python3.12-venv postgresql-14 redis-server nginx
```

3. Follow production deployment steps above

### Using ECS/Fargate

1. Build and push Docker image:
```bash
docker build -t lwconnect:latest .
docker tag lwconnect:latest YOUR_ECR_REPO:latest
docker push YOUR_ECR_REPO:latest
```

2. Create ECS task definition with:
   - App container (lwconnect image)
   - Environment variables from Secrets Manager
   - RDS PostgreSQL database
   - ElastiCache Redis

3. Create ECS service with load balancer

### Using RDS for PostgreSQL

```bash
# Enable pgvector on RDS
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d lwconnect
CREATE EXTENSION vector;
```

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Database connection
psql $DATABASE_URL -c "SELECT 1;"

# Redis connection
redis-cli ping
```

### Logs

```bash
# Application logs
tail -f /var/log/lwconnect/app.log

# Celery logs
tail -f /var/log/lwconnect/celery.log

# Nginx logs
tail -f /var/log/nginx/access.log
```

## Backup Strategy

### Database Backup

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260524.sql
```

### Automated Backups (Cron)

```bash
# Add to crontab
0 2 * * * /opt/lwconnect/scripts/backup.sh
```

## Scaling

### Horizontal Scaling

- Run multiple API instances behind load balancer
- Scale Celery workers independently
- Use Redis for session storage

### Database Optimization

- Enable connection pooling
- Add indexes for frequently queried fields
- Use read replicas for analytics

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Secure environment variables
- [ ] Enable audit logging
- [ ] Regular backups

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql $DATABASE_URL -c "SELECT version();"
```

### Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

### Migration Issues
```bash
# Check current revision
alembic current

# Rollback one revision
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

## Performance Tuning

### Database
- Increase `shared_buffers` in postgresql.conf
- Tune `work_mem` and `maintenance_work_mem`
- Enable query logging for slow queries

### API
- Increase worker count based on CPU cores
- Enable response caching
- Use connection pooling

### Redis
- Increase `maxmemory` limit
- Configure eviction policy
- Enable persistence if needed
