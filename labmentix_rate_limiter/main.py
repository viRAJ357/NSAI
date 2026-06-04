from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
import uvicorn

app = FastAPI(title="Labmentix Rate Limiter", description="A demo of a Sliding Window Log Rate Limiter")

# In-memory storage for rate limiting
# Structure: { "ip_address": [timestamp1, timestamp2, ...] }
request_history = defaultdict(list)

RATE_LIMIT = 10  # Max requests allowed
TIME_WINDOW = 60 # In seconds (1 minute)

@app.middleware("http")
async def rate_limiter_middleware(request: Request, call_next):
    # 1. Identify the user (using IP address)
    client_ip = request.client.host
    current_time = time.time()
    
    # 2. Get the user's request history
    user_requests = request_history[client_ip]
    
    # 3. Clean up: filter out requests that are older than our TIME_WINDOW
    # This slides the 60-second window forward
    user_requests = [req_time for req_time in user_requests if current_time - req_time < TIME_WINDOW]
    
    # 4. The Gatekeeper: check if the user has exceeded the limit in the current window
    if len(user_requests) >= RATE_LIMIT:
        # Save the cleaned-up history back so it doesn't leak memory infinitely for blocked users
        request_history[client_ip] = user_requests
        return JSONResponse(
            status_code=429,
            content={"detail": "Too Many Requests. Please try again later.", "limit": RATE_LIMIT, "window": TIME_WINDOW}
        )
    
    # 5. Allow access: add the current timestamp to the user's history
    user_requests.append(current_time)
    request_history[client_ip] = user_requests
    
    # 6. Proceed to the actual endpoint logic
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    return {"message": "Welcome to the Labmentix Rate-Limited API!"}

@app.get("/data")
async def get_data():
    return {"data": "Here is your secure, rate-limited data. You successfully bypassed the rate limiter middleware."}

if __name__ == "__main__":
    print("Starting Labmentix API Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
