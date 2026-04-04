## 1. Deployment Configuration

### Target Space
- **Profile:** `GraziePrego`
- **Space:** `deepresearch`
- **Full Identifier:** `GraziePrego/deepresearch`
- **Frontend Port:** `7860` (mandatory for all Hugging Face Spaces)

### Deployment Method
Choose the correct SDK based on the app type based on the codebase language:

- **Gradio SDK** — for Gradio applications
- **Streamlit SDK** — for Streamlit applications
- **Docker SDK** — for all other applications (recommended default for flexibility)

### HF Token
- The environment variable **`HF_TOKEN` will always be provided at execution time**.
- Never hardcode the token. Always read it from the environment.
- All monitoring and log‑streaming commands rely on `HF_TOKEN`.

### Required Files
- `Dockerfile` (or `app.py` for Gradio/Streamlit SDKs)
- `README.md` with Hugging Face YAML frontmatter:
  ```yaml
  ---
  title: SprintFlow
  sdk: docker
  app_port: 7860
  ---
  ```
- `.hfignore` to exclude unnecessary files
- This `Agent.md` file (must be committed before deployment)

---

## 2. API Exposure and Documentation

### Mandatory Endpoints
Every deployment **must** expose:

- **`/health`**
  - Returns HTTP 200 when the app is ready.
  - Required for Hugging Face to transition the Space from *starting* → *running*.

- **`/api-docs`**
  - Documents **all** available API endpoints.
  - Must be reachable at:
    `https://GraziePrego-deepresearch.hf.space/api-docs`

### Functional Endpoints

### /health
- Method: GET
- Purpose: Check if the application is running
- Request: none
- Response:
  {
    "status": "ok"
  }

### /
- Method: GET
- Purpose: Serve the main index.html file
- Request: none
- Response: HTML content

All endpoints listed here **must** appear in `/api-docs`.

---

## 3. Deployment Workflow

Precondition: Use the huggingface hub cli hf to check that the space is empty of files nd delete any which are still in there and not belonging to the project to be uploaded

### Standard Deployment Command
After any code change, run:

```bash
hf upload GraziePrego/deepresearch --repo-type=space
---

Scan build and run logs # Get build logs (SSE) curl -N
-H "Authorization: Bearer HF_TOKEN"
"https://huggingface.co/api/spaces/GraziePrego/deepresearch/logs/build"

Get run logs (SSE) once the build logs succeed
curl -N
-H "Authorization: Bearer HF_TOKEN"
"https://huggingface.co/api/spaces/GraziePrego/deepresearch/logs/run"

after 300 seconds to see if the deployment has been successful, and if not, fix the errors of deployment, and redeploy and monitor in a cycle until the space is running and reacts to the api endpoints you created.
