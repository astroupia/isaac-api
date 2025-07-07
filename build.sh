#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build the application
echo "Building application..."
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    exit 0
else
    echo "Build failed!"
    exit 1
fi 