from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from agent import get_agent
import logging
import traceback
import os

# Serve frontend files from the dark-gpt folder
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dark-gpt')

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.INFO)

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    history = data.get("history", [])
    prompt = data.get("prompt")
    attachment = data.get("attachment")
    api_key = data.get("api_key")
    
    if not prompt and not history and not attachment:
        return jsonify({"error": "Missing prompt, history, or attachment"}), 400
    if not api_key:
        return jsonify({"error": "Missing API key"}), 400

    try:
        logging.info(f"Received prompt: {prompt}")
        agent_executor = get_agent(api_key)
        
        # Format history for LangChain: list of tuples (role, content)
        messages_to_send = []
        for msg in history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            messages_to_send.append((role, content))
            
        # Add the current prompt if provided
        if prompt or attachment:
            content = []
            if prompt:
                content.append({"type": "text", "text": prompt})
            else:
                content.append({"type": "text", "text": "Analyze this attachment."})
                
            if attachment and attachment.get("type", "").startswith("image/"):
                content.append({
                    "type": "image_url",
                    "image_url": {"url": attachment["dataUrl"]}
                })
            elif attachment:
                # If it's a generic file but not an image, just pass the metadata for now
                # Or instruct the AI to read it if we had an upload pipeline
                content.append({"type": "text", "text": f"[User attached file: {attachment['name']}]"})

            messages_to_send.append(("user", content))
            
        response = agent_executor.invoke({"messages": messages_to_send})
        output_content = response["messages"][-1].content
        
        if isinstance(output_content, list):
            text_parts = []
            for block in output_content:
                if isinstance(block, dict) and "text" in block:
                    text_parts.append(block["text"])
                elif isinstance(block, str):
                    text_parts.append(block)
            output_text = "".join(text_parts)
        else:
            output_text = str(output_content)
            
        return jsonify({"response": output_text})
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logging.info("Starting NSAI API Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
