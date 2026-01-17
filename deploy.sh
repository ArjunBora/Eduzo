#!/bin/bash

echo "Starting Deployment Process..."

# Pull latest changes
echo "Pulling latest code..."
git pull origin main

# Build and restart services
echo "Rebuilding containers..."
docker-compose up -d --build --remove-orphans

echo "Deployment Complete! Services are running."
docker-compose ps
