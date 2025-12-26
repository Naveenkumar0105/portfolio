---
description: How to update the portfolio and push changes to GitHub
---

Whenever you make changes to your code (edit HTML, CSS, JS, etc.), follow these steps to publish them:

1.  **Check Status** (Optional but good practice):
    To see which files have changed:
    ```bash
    git status
    ```

2.  **Stage Changes**:
    To prepare all your changes for uploading:
    ```bash
    git add .
    ```

3.  **Commit Changes**:
    Save your changes with a descriptive message (replace "Update" with what you did):
    ```bash
    git commit -m "Update: Changed colors and fixed typo"
    ```

4.  **Push to GitHub**:
    Send your changes to the live website:
    ```bash
    git push
    ```

GitHub Pages will automatically detect the new push and update your live site within 1-2 minutes.
