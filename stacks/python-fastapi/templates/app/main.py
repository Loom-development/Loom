from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def index() -> dict[str, str]:
    return {"framework": "fastapi", "status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"framework": "fastapi", "status": "healthy"}
