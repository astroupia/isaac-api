#!/bin/bash

# Start script for Render deployment
echo "Starting ISAAC API..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=512"

# Start the application
echo "Starting application with memory optimization..."
pnpm run start:render 