#!/bin/bash

# Akvo RAG Widget Release Script
# Automates: Versioning -> Building -> Pushing -> Publishing

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# 1. Validation
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error_exit "You must be on the 'main' branch to release. Current branch: $CURRENT_BRANCH"
fi

if [ -n "$(git status --porcelain)" ]; then
    error_exit "You have uncommitted changes. Please commit or stash them first."
fi

# 2. Input
VERSION_TYPE=$1
DRY_RUN=$2

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${YELLOW}Usage: ./release.sh <patch|minor|major> [--dry-run]${NC}"
    exit 1
fi

echo -e "${GREEN}Starting $VERSION_TYPE release process...${NC}"

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo -e "${YELLOW}[DRY RUN MODE]${NC}"
    echo "1. Would run: npm version $VERSION_TYPE"
    echo "2. Would run: npm run build"
    echo "3. Would run: git push origin main --tags"
    echo "4. Would run: npm publish --access public"
    echo -e "${GREEN}Dry run complete.${NC}"
    exit 0
fi

# 3. Execution
echo -e "${GREEN}Step 1/4: Versioning...${NC}"
npm version "$VERSION_TYPE" || error_exit "NPM version bump failed."

echo -e "${GREEN}Step 2/4: Building...${NC}"
npm run build || error_exit "Build failed."

echo -e "${GREEN}Step 3/4: Pushing to remote...${NC}"
git push origin main --tags || error_exit "Git push failed."

echo -e "${GREEN}Step 4/4: Publishing to NPM...${NC}"
npm publish --access public || error_exit "NPM publish failed."

echo -e "${GREEN}Successfully released new $VERSION_TYPE version!${NC}"
