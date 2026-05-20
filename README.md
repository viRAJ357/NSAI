# Agentic AI-Based Travel Planning Assistant

This project is an automated AI Travel Planning Assistant built with Python, LangChain, and Streamlit. It uses an Agentic AI workflow to autonomously create optimized trip itineraries based on user preferences.

## Features
- **LangChain ReAct Agent**: Understands travel queries, calls tools, and generates structured itineraries.
- **SQLite Database Integration**: Flight, Hotel, and Places datasets are ingested from JSON into an optimized SQLite database.
- **Live Weather**: Integrates with the free Open-Meteo API.
- **Beautiful UI**: A highly responsive, premium Streamlit interface with custom CSS.

## Project Structure
- `data/`: Contains mock JSON files (`flights.json`, `hotels.json`, `places.json`).
- `database.py`: Initializes `travel.db` from JSON files.
- `tools.py`: LangChain tools for searching DB and calling APIs.
- `agent.py`: Agent configuration and prompt engineering.
- `app.py`: Streamlit frontend application.

## Setup Instructions

1. **Install Requirements**:
   ```bash
   pip install langchain langchain-google-genai streamlit requests
   ```

2. **Initialize Database**:
   ```bash
   python database.py
   ```
   This command creates the SQLite database and loads the mock data. *(You can replace the JSON files in the `data/` folder with the real ones and re-run this command).*

3. **Run the Application**:
   ```bash
   streamlit run app.py
   ```

4. **Using the App**:
   - Get a free Google Gemini API key.
   - Enter it in the sidebar.
   - Ask the agent to plan your trip! (e.g., "Plan a 3-day trip from Delhi to Goa").
