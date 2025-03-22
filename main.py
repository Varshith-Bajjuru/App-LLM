from flask import Flask, request, jsonify
import requests
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

GEMINI_API_KEY = "your_gemini_api_key_here"
GEMINI_API_URL = "https://api.gemini.com/v1/chat/completions"

def query_gemini(prompt):
    """Function to send a request to the Gemini AI API."""
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}", "Content-Type": "application/json"}
    payload = {"messages": [{"role": "user", "content": prompt}]}
    
    try:
        response = requests.post(GEMINI_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error querying Gemini API: {e}")
        return {"error": str(e)}

@app.route("/chat", methods=["POST"])
def chat():
    """Flask route to handle user queries."""
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Missing 'prompt' in request"}), 400
    
    prompt = data["prompt"]
    gemini_response = query_gemini(prompt)
    return jsonify(gemini_response)

@app.route("/history", methods=["GET"])
def history():
    """Endpoint to fetch chat history."""
    return jsonify({"message": "Chat history feature coming soon!"})

@app.route("/status", methods=["GET"])
def status():
    """Endpoint to check API status."""
    return jsonify({"status": "running", "message": "Gemini AI Chatbot API is operational."})

@app.route("/")
def home():
    return "Gemini AI Chatbot API is running!"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
