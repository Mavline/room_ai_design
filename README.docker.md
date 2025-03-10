# Docker Deployment Guide

This guide explains how to deploy the Room AI Design application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Basic knowledge of Docker commands

## Files Overview

- `Dockerfile` - Contains instructions for building the Docker image
- `docker-compose.yml` - Defines the services, networks, and volumes for the application
- `.dockerignore` - Specifies which files should be excluded from the Docker build context

## Deployment Steps

### 1. Build the Docker Image

```bash
docker build -t room-ai-design .
```

This command builds a Docker image with the tag `room-ai-design`.

### 2. Run the Container

```bash
docker-compose up -d
```

The `-d` flag runs the container in detached mode (background).

### 3. Access the Application

Once the container is running, you can access the application at:

```
http://localhost:3000
```

## Managing the Container

### View Running Containers

```bash
docker ps
```

### View Container Logs

```bash
docker-compose logs -f
```

The `-f` flag follows the log output (similar to `tail -f`).

### Stop and Remove the Container

```bash
docker-compose down
```

### Restart the Container

```bash
docker-compose restart
```

## Environment Variables

The application requires certain environment variables to function properly. These are loaded from the `.env` file in the project root directory.

Required variables:
- `REPLICATE_API_KEY`
- `NEXT_PUBLIC_UPLOAD_API_KEY`

Optional variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Publishing to Docker Hub (Optional)

If you want to publish your image to Docker Hub:

1. Create a Docker Hub account if you don't have one
2. Log in to Docker Hub:
   ```bash
   docker login
   ```
3. Tag your image:
   ```bash
   docker tag room-ai-design your-username/room-ai-design:latest
   ```
4. Push the image:
   ```bash
   docker push your-username/room-ai-design:latest
   ```

## Troubleshooting

### Container Fails to Start

Check the logs:
```bash
docker-compose logs
```

### Port Conflicts

If port 3000 is already in use, you can modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Maps host port 3001 to container port 3000
```
