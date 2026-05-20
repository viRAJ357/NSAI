import json
import os

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# 1. Flights Mock Data
flights = [
    {"flight_id": "F101", "airline": "IndiGo", "source": "Delhi", "destination": "Goa", "departure": "14:00", "duration_hrs": 2.5, "price_inr": 4800},
    {"flight_id": "F102", "airline": "Air India", "source": "Delhi", "destination": "Goa", "departure": "10:30", "duration_hrs": 2.5, "price_inr": 5500},
    {"flight_id": "F103", "airline": "SpiceJet", "source": "Mumbai", "destination": "Goa", "departure": "16:00", "duration_hrs": 1.2, "price_inr": 2500},
    {"flight_id": "F104", "airline": "Vistara", "source": "Bangalore", "destination": "Goa", "departure": "09:00", "duration_hrs": 1.5, "price_inr": 3500},
    {"flight_id": "F105", "airline": "IndiGo", "source": "Delhi", "destination": "Manali", "departure": "18:00", "duration_hrs": 14, "price_inr": 1200}, # Assuming bus or indirect
    {"flight_id": "F106", "airline": "Air India", "source": "Mumbai", "destination": "Delhi", "departure": "08:00", "duration_hrs": 2.0, "price_inr": 4000}
]

with open('data/flights.json', 'w') as f:
    json.dump(flights, f, indent=4)

# 2. Hotels Mock Data
hotels = [
    {"hotel_id": "H101", "name": "Sea View Resort", "city": "Goa", "rating": 4.5, "price_per_night_inr": 3200, "amenities": ["Pool", "Free WiFi", "Breakfast"]},
    {"hotel_id": "H102", "name": "Taj Exotica", "city": "Goa", "rating": 5.0, "price_per_night_inr": 12000, "amenities": ["Private Beach", "Spa", "Luxury Dining"]},
    {"hotel_id": "H103", "name": "Budget Inn", "city": "Goa", "rating": 3.0, "price_per_night_inr": 1200, "amenities": ["Free WiFi"]},
    {"hotel_id": "H104", "name": "Snow Peak Hotel", "city": "Manali", "rating": 4.2, "price_per_night_inr": 2800, "amenities": ["Mountain View", "Heater"]},
    {"hotel_id": "H105", "name": "Delhi City Center Hotel", "city": "Delhi", "rating": 4.0, "price_per_night_inr": 4500, "amenities": ["Gym", "Breakfast"]}
]

with open('data/hotels.json', 'w') as f:
    json.dump(hotels, f, indent=4)

# 3. Places Mock Data
places = [
    {"place_id": "P101", "name": "Baga Beach", "city": "Goa", "type": "Beach", "rating": 4.6, "description": "Popular beach known for water sports and nightlife."},
    {"place_id": "P102", "name": "Basilica of Bom Jesus", "city": "Goa", "type": "Historical", "rating": 4.8, "description": "UNESCO World Heritage site."},
    {"place_id": "P103", "name": "Dudhsagar Waterfalls", "city": "Goa", "type": "Nature", "rating": 4.7, "description": "Four-tiered waterfall on the Mandovi River."},
    {"place_id": "P104", "name": "Rohtang Pass", "city": "Manali", "type": "Nature", "rating": 4.9, "description": "High mountain pass known for snow activities."},
    {"place_id": "P105", "name": "Red Fort", "city": "Delhi", "type": "Historical", "rating": 4.7, "description": "Historic fort in the city of Delhi."}
]

with open('data/places.json', 'w') as f:
    json.dump(places, f, indent=4)

print("Mock data generated successfully in 'data/' folder.")
