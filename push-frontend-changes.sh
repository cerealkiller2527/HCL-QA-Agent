#!/bin/bash
# Script to push frontend folder changes back to feature-frontend-dataset-viewer branch

echo "Pushing frontend changes to feature-frontend-dataset-viewer branch..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create a temporary directory
TEMP_DIR=$(mktemp -d)

# Copy frontend folder to temp
cp -r frontend/* $TEMP_DIR/
cp -r frontend/.* $TEMP_DIR/ 2>/dev/null || true

# Stash current changes
git stash

# Checkout frontend branch
git checkout feature-frontend-dataset-viewer

# Remove all files except .git
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \;

# Copy files from temp
cp -r $TEMP_DIR/* .
cp -r $TEMP_DIR/.* . 2>/dev/null || true

# Stage and commit if there are changes
if ! git diff --quiet; then
    git add .
    git commit -m "Sync from integration branch: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Changes committed to feature-frontend-dataset-viewer branch"
else
    echo "No changes to commit"
fi

# Go back to integration branch
git checkout $CURRENT_BRANCH

# Restore stashed changes
git stash pop 2>/dev/null || true

# Clean up
rm -rf $TEMP_DIR

echo "Push complete! Don't forget to 'git push origin feature-frontend-dataset-viewer' if you want to update remote."