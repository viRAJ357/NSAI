from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from tools import travel_tools

def get_agent(api_key: str):
    """
    Initializes the LangChain agent with the given Gemini API key.
    """
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    
    system_prompt = """You are an expert AI Travel Planning Assistant.
Your goal is to autonomously create optimized trip itineraries based on user preferences.
You must use the provided tools to gather real-time data about flights, hotels, places, and weather.
When providing the final output, structure it exactly as follows:

Trip Summary
Flight Option Selected
Hotel Recommendation
Day-wise Itinerary
Weather for Each Day
Budget Breakdown

Always explain the reasoning for your choices briefly if requested. Provide outputs in a clean, human-readable format.
Do NOT hallucinate flight or hotel data; ALWAYS use the tools to fetch data from the database.
If no data is found for a specific request, inform the user politely and provide alternative suggestions based on available data.
"""

    agent_executor = create_react_agent(llm, travel_tools, prompt=system_prompt)
    return agent_executor
