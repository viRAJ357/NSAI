import streamlit as st
import json
from agent import get_agent
import time

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="AI Travel Dashboard | Devsomeware Style",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- ADVANCED CSS INJECTION ---
def apply_advanced_css():
    st.markdown("""
        <style>
        /* Modern Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@500;700&display=swap');

        /* Base Variables matching the Devsomeware aesthetic */
        :root {
            --bg-color: #0a0a0a;
            --surface-color: #111111;
            --surface-light: #1a1a1a;
            --primary-gradient: linear-gradient(135deg, #7c3aed, #2563eb);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border-glow: rgba(124, 58, 237, 0.2);
            --accent-color: #3b82f6;
        }

        html, body, [class*="st-"] {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
        }

        /* Hide Top Padding and Menus */
        .block-container {
            padding-top: 1rem !important;
            padding-bottom: 2rem !important;
            max-width: 1200px;
        }
        
        /* Headers - Space Grotesk for that technical, structural look */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Space Grotesk', sans-serif !important;
            color: var(--text-main) !important;
        }

        /* Main Dashboard Title */
        .main-title {
            font-size: 3.5rem;
            font-weight: 800;
            background: -webkit-linear-gradient(45deg, #f8fafc, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 1.1rem;
            margin-bottom: 2rem;
            font-weight: 300;
        }

        /* Glassmorphism Containers / Metric Cards */
        div[data-testid="stMetricValue"], div[data-testid="stMetricLabel"] {
            font-family: 'Space Grotesk', sans-serif;
        }
        div[data-testid="metric-container"] {
            background-color: var(--surface-color);
            border: 1px solid #222;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        }
        div[data-testid="metric-container"]:hover {
            border-color: var(--accent-color);
            box-shadow: 0 0 15px var(--border-glow);
            transform: translateY(-2px);
        }

        /* Input Fields */
        .stTextInput>div>div>input {
            background-color: var(--surface-light);
            color: white;
            border-radius: 8px;
            border: 1px solid #333;
            padding: 14px;
            font-size: 15px;
            transition: all 0.3s ease;
        }
        .stTextInput>div>div>input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 10px var(--border-glow);
        }

        /* Sidebar Styling */
        section[data-testid="stSidebar"] {
            background-color: var(--surface-color) !important;
            border-right: 1px solid #222;
        }
        .sidebar-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Buttons (Gradient Glow) */
        .stButton>button {
            background: var(--primary-gradient);
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            border-radius: 8px;
            border: none;
            padding: 12px 24px;
            width: 100%;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stButton>button:hover {
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
            transform: translateY(-2px);
            color: white;
        }
        .stButton>button:active {
            transform: translateY(0);
        }

        /* Custom Chat Containers */
        .stChatMessage {
            background-color: transparent !important;
            border: none !important;
            padding: 1rem 0 !important;
        }
        
        .chat-bubble-assistant {
            background-color: var(--surface-color);
            border: 1px solid #222;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            font-size: 15px;
            line-height: 1.6;
        }
        .chat-bubble-user {
            background: var(--primary-gradient);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            color: white;
            font-size: 15px;
            font-weight: 500;
            margin-left: auto;
            max-width: 80%;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
        }

        /* Dataframes & Tables */
        .stDataFrame {
            background-color: var(--surface-color);
            border-radius: 8px;
            border: 1px solid #222;
        }
        
        /* Expanders */
        .streamlit-expanderHeader {
            background-color: var(--surface-light);
            border-radius: 8px;
            border: 1px solid #333;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
        }
        
        hr {
            border-color: #222;
        }
        </style>
    """, unsafe_allow_html=True)

apply_advanced_css()

# --- SIDEBAR CONFIGURATION ---
with st.sidebar:
    st.markdown('<div class="sidebar-title">⚡ AGENT CTRL</div>', unsafe_allow_html=True)
    st.markdown("Configure the intelligence engine.")
    
    api_key = st.text_input("Gemini API Key", type="password", placeholder="Enter Google API Key")
    
    st.markdown("---")
    st.markdown("### SYSTEM SPECS")
    
    # Progress bars simulating the "Delivery Timeline" from the image
    st.caption("AI REASONING")
    st.progress(100)
    st.caption("DATA FETCHING")
    st.progress(95)
    st.caption("ITINERARY OPTIMIZATION")
    st.progress(90)
    
    st.markdown("---")
    st.markdown("<span style='color:#7c3aed; font-family:Space Grotesk; font-weight:bold;'>{ SECURE INFRASTRUCTURE }</span>", unsafe_allow_html=True)
    st.caption("Agentic Workflow • SQLite Indexing • Live APIs")

# --- MAIN DASHBOARD UI ---
st.markdown('<h1 class="main-title">Intelligent Routing.<br>Industry grade. Real-time.</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">We ship production-ready travel itineraries at record speed without compromising quality. Powered by LangGraph & Gemini.</p>', unsafe_allow_html=True)

# Metrics Row simulating a complex dashboard
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("System Status", "ONLINE", "Latency: 24ms")
with col2:
    st.metric("Database Nodes", "3", "Flights, Hotels, Places")
with col3:
    st.metric("External APIs", "Open-Meteo", "Active")
with col4:
    st.metric("LLM Core", "Gemini 2.5", "ToolCalling Enabled")

st.markdown("---")

# --- CHAT INTERFACE ---
if "messages" not in st.session_state:
    st.session_state.messages = []
    
# Display Chat History with custom HTML for aesthetic
for message in st.session_state.messages:
    if message["role"] == "user":
        st.markdown(f'<div style="text-align: right;"><div class="chat-bubble-user">{message["content"]}</div></div>', unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="chat-bubble-assistant">{message["content"]}</div>', unsafe_allow_html=True)

# Chat Input at the bottom
prompt = st.chat_input("Enter destination, duration, and preferences (e.g., '3 days in Goa from Delhi')...")

if prompt:
    # Render user prompt immediately
    st.markdown(f'<div style="text-align: right;"><div class="chat-bubble-user">{prompt}</div></div>', unsafe_allow_html=True)
    st.session_state.messages.append({"role": "user", "content": prompt})

    if not api_key:
        st.error("⚠️ SYSTEM FAULT: Gemini API Key is missing. Please configure it in the sidebar.")
    else:
        with st.spinner("Processing request through neural pathways..."):
            try:
                # Add a small delay for dramatic effect in UI
                time.sleep(0.5)
                
                agent_executor = get_agent(api_key)
                response = agent_executor.invoke({"messages": [("user", prompt)]})
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
                
                # Render AI response
                st.markdown(f'<div class="chat-bubble-assistant">{output_text}</div>', unsafe_allow_html=True)
                st.session_state.messages.append({"role": "assistant", "content": output_text})
                
            except Exception as e:
                st.error(f"⚠️ EXECUTION ERROR: {str(e)}")
