#!/bin/bash
# Script to sync frontend folder with feature-frontend-dataset-viewer branch

echo "Syncing frontend folder with feature-frontend-dataset-viewer branch..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Stash any local changes
git stash

# Checkout the frontend branch
git checkout feature-frontend-dataset-viewer

# Copy all files except .github and lerobot
rsync -av --exclude='.github' --exclude='lerobot' --exclude='.git' . ../frontend-temp/

# Go back to integration branch
git checkout $CURRENT_BRANCH

# Apply the changes
rsync -av --delete --exclude='.github' --exclude='lerobot' ../frontend-temp/ frontend/

# Clean up
rm -rf ../frontend-temp

# Restore stashed changes if any
git stash pop 2>/dev/null || true

echo "Frontend sync complete!"