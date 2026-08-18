from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def index():
    return jsonify({"framework": "flask", "status": "ok"})


@app.get("/health")
def health():
    return jsonify({"framework": "flask", "status": "healthy"})
