from flask import Flask, request, jsonify
from flask_cors import CORS
from api.agent import get_agent
import sqlite3
import logging
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.INFO)

DB_PATH = "travel.db"

def init_auth_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT
            )
        ''')
        conn.commit()
        conn.close()
        logging.info("Auth table checked/initialized in travel.db")
    except Exception as e:
        logging.error(f"Error initializing auth database: {str(e)}")

# Initialize DB on startup
init_auth_db()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required registration fields"}), 400
    
    username = data.get("username").strip()
    email = data.get("email").strip()
    password = data.get("password")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (username, email, password))
        conn.commit()
        conn.close()
        logging.info(f"Registered user: {username}")
        return jsonify({"success": True, "message": "User registered successfully", "username": username, "email": email})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or Email already exists"}), 409
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400
    
    email = data.get("email").strip()
    password = data.get("password")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT username, email FROM users WHERE (email = ? OR username = ?) AND password = ?", (email, email, password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            logging.info(f"User logged in: {user[0]}")
            return jsonify({"success": True, "username": user[0], "email": user[1]})
        else:
            return jsonify({"error": "Invalid email/username or password"}), 401
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    history = data.get("history", [])
    prompt = data.get("prompt")
    attachment = data.get("attachment")
    api_key = data.get("api_key")
    
    # Advanced settings from UI
    active_app = data.get("active_app", "NSAI")
    persona = data.get("persona", "")
    web_search_enabled = data.get("web_search_enabled", False)
    model_version = data.get("model_version", "v4")
    custom_system_prompt = data.get("custom_system_prompt", "")
    
    if not prompt and not history and not attachment:
        return jsonify({"error": "Missing prompt, history, or attachment"}), 400
    if not api_key:
        return jsonify({"error": "Missing API key"}), 400

    try:
        logging.info(f"Chat request - App: {active_app}, Persona: '{persona}', Search: {web_search_enabled}, Version: {model_version}")
        agent_executor = get_agent(
            api_key=api_key,
            active_app=active_app,
            persona=persona,
            web_search_enabled=web_search_enabled,
            model_version=model_version,
            custom_system_prompt=custom_system_prompt
        )
        
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
