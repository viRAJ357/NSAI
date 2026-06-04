import sqlite3
import requests
from langchain.tools import tool
import streamlit as st
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

DB_PATH = "travel.db"

@st.cache_data(ttl=3600)
def query_db(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(query, params)
    columns = [desc[0] for desc in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

@tool
def search_flights(source: str, destination: str) -> str:
    """
    Search for flights between a source and destination.
    Args:
        source: The starting city.
        destination: The destination city.
    Returns:
        JSON string of available flights.
    """
    results = query_db("SELECT * FROM flights WHERE source = ? AND destination = ?", (source, destination))
    if not results:
        return f"No flights found from {source} to {destination}."
    import json
    return json.dumps(results, indent=2)

@tool
def recommend_hotels(city: str) -> str:
    """
    Recommend hotels in a specific city.
    Args:
        city: The city where the hotel is located.
    Returns:
        JSON string of available hotels.
    """
    results = query_db("SELECT * FROM hotels WHERE city = ? ORDER BY rating DESC", (city,))
    if not results:
        return f"No hotels found in {city}."
    import json
    return json.dumps(results, indent=2)

@tool
def discover_places(city: str) -> str:
    """
    Discover places and tourist attractions in a specific city.
    Args:
        city: The city to find places in.
    Returns:
        JSON string of attractions.
    """
    results = query_db("SELECT * FROM places WHERE city = ? ORDER BY rating DESC", (city,))
    if not results:
        return f"No places found in {city}."
    import json
    return json.dumps(results, indent=2)

@tool
def lookup_weather(latitude: float, longitude: float) -> str:
    """
    Look up the 7-day weather forecast for a given location using latitude and longitude.
    Args:
        latitude: Latitude of the location.
        longitude: Longitude of the location.
    Returns:
        JSON string of the daily maximum temperature.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&daily=temperature_2m_max&timezone=auto"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        daily = data.get("daily", {})
        dates = daily.get("time", [])
        temps = daily.get("temperature_2m_max", [])
        
        forecast = [{"date": d, "max_temp_C": t} for d, t in zip(dates, temps)]
        import json
        return json.dumps(forecast, indent=2)
    except Exception as e:
        return f"Error fetching weather: {str(e)}"

@tool
def estimate_budget(flight_cost: float, hotel_cost_per_night: float, nights: int, daily_local_expenses: float) -> str:
    """
    Estimate the total budget for the trip.
    Args:
        flight_cost: The total cost of flights.
        hotel_cost_per_night: The cost of the hotel per night.
        nights: Number of nights staying.
        daily_local_expenses: Estimated daily local expenses (food, travel, etc.).
    Returns:
        A formatted string with the budget breakdown and total cost.
    """
    total_hotel = hotel_cost_per_night * nights
    total_local = daily_local_expenses * (nights + 1) # assuming days = nights + 1
    total_cost = flight_cost + total_hotel + total_local
    
    breakdown = (
        f"Budget Breakdown:\n"
        f"- Flight: ₹{flight_cost}\n"
        f"- Hotel ({nights} nights): ₹{total_hotel}\n"
        f"- Food & Travel: ₹{total_local}\n"
        f"-------------------------------------\n"
        f"Total Cost: ₹{total_cost}"
    )
    return breakdown

@tool
def search_web(query: str) -> str:
    """
    Search the live web for general information, current events, or questions outside of travel planning.
    Args:
        query: The search query to run on DuckDuckGo.
    Returns:
        String containing snippets of search results.
    """
    try:
        wrapper = DuckDuckGoSearchAPIWrapper(max_results=3)
        search = DuckDuckGoSearchResults(api_wrapper=wrapper)
        return search.run(query)
    except Exception as e:
        return f"Error executing web search: {str(e)}"

@tool
def read_document(file_path: str) -> str:
    """
    Read and extract text content from a PDF, CSV, or plain text file.
    Args:
        file_path: The absolute path to the file on the local system.
    Returns:
        Extracted text content from the file.
    """
    import os
    if not os.path.exists(file_path):
        return f"Error: File not found at '{file_path}'"
    
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == '.pdf':
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text[:5000] if text else "Could not extract text from PDF."
        elif ext == '.csv':
            import pandas as pd
            df = pd.read_csv(file_path)
            return f"CSV loaded with {len(df)} rows and {len(df.columns)} columns.\nColumns: {list(df.columns)}\n\nFirst 10 rows:\n{df.head(10).to_markdown(index=False)}"
        elif ext == '.xlsx':
            import pandas as pd
            df = pd.read_excel(file_path)
            return f"Excel loaded with {len(df)} rows and {len(df.columns)} columns.\nColumns: {list(df.columns)}\n\nFirst 10 rows:\n{df.head(10).to_markdown(index=False)}"
        elif ext in ['.txt', '.md', '.py', '.js', '.html', '.css', '.json']:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content[:5000]
        else:
            return f"Unsupported file type: {ext}"
    except Exception as e:
        return f"Error reading file: {str(e)}"

@tool
def run_python_code(code: str) -> str:
    """
    Execute Python code for data analysis, complex math calculations, generating statistics, or solving problems.
    The code runs in a sandboxed environment. Use 'print()' to output results.
    Common libraries available: math, statistics, datetime, json, os.
    Args:
        code: Python code string to execute.
    Returns:
        The printed output from executing the code.
    """
    import io
    import sys
    import math
    import statistics
    import datetime
    import json as json_lib
    
    old_stdout = sys.stdout
    sys.stdout = buffer = io.StringIO()
    
    allowed_globals = {
        "__builtins__": __builtins__,
        "math": math,
        "statistics": statistics,
        "datetime": datetime,
        "json": json_lib,
    }
    
    try:
        # Try importing optional heavy libs
        try:
            import pandas as pd
            allowed_globals["pd"] = pd
        except ImportError:
            pass
            
        exec(code, allowed_globals)
        output = buffer.getvalue()
        return output if output else "Code executed successfully (no print output)."
    except Exception as e:
        return f"Error executing code: {str(e)}"
    finally:
        sys.stdout = old_stdout

# List of tools to be used by the agent
travel_tools = [search_flights, recommend_hotels, discover_places, lookup_weather, estimate_budget, search_web, read_document, run_python_code]
