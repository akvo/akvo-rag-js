---
description: How to release the Akvo RAG widget to npm
---

# Release Workflow

This workflow uses the `release.sh` script to automate the release process.

## Steps

1.  **Run the release script**:
    Execute the script from the root directory with the desired version bump type:
    ```bash
    ./release.sh <patch|minor|major>
    ```

2.  **Follow the prompts**:
    The script will:
    - Validate your branch and git status.
    - Bump the version in `package.json`.
    - Build the production bundle.
    - Push commits and tags to GitHub.
    - Publish the package to npm.

---
> [!IMPORTANT]
> Ensure you are logged into npm before running the script (`npm login`). You will be prompted for an OTP during the publish step if MFA is enabled.

> [!TIP]
> Use the `--dry-run` flag to verify the steps without making any changes:
> `./release.sh patch --dry-run`
