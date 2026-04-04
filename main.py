from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os

app = FastAPI(docs_url="/api-docs", redoc_url=None)

@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok"}, status_code=200)

@app.get("/")
def read_root():
    return FileResponse("index.html")

# Serve other static files
app.mount("/", StaticFiles(directory=".", html=False), name="static")
