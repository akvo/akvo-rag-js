---
description: How to release the Akvo RAG widget to npm
---

# Release Workflow

Follow these steps to release a new version of the Akvo RAG widget.

## 1. Preparation
1. Ensure you are on the `main` branch: `git checkout main`
2. Pull the latest changes: `git pull origin main`
3. Merge your feature branch into `main` (if not already done): `git merge <feature-branch>`

## 2. Versioning
1. Choose the version bump type (patch, minor, or major).
2. Run the version command:
   ```bash
   npm version <patch|minor|major>
   ```
   *This will update `package.json`, commit the change, and create a git tag.*

## 3. Build & Verify
1. Run the production build:
   ```bash
   npm run build
   ```
2. Verify that the `dist/` directory contains the updated assets.

## 4. Push to Remote
1. Push the commit and the new tag to GitHub:
   ```bash
   git push origin main --tags
   ```

## 5. Publish to NPM
1. Publish the package:
   ```bash
   npm publish --access public
   ```

---
> [!IMPORTANT]
> Ensure you are logged into npm before running the publish command (`npm login`).
