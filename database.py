import sqlite3
import json
import os

DB_PATH = "travel.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create Flights Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS flights (
            flight_id TEXT PRIMARY KEY,
            airline TEXT,
            source TEXT,
            destination TEXT,
            departure TEXT,
            duration_hrs REAL,
            price_inr REAL
        )
    ''')
    
    # Create Hotels Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hotels (
            hotel_id TEXT PRIMARY KEY,
            name TEXT,
            city TEXT,
            rating REAL,
            price_per_night_inr REAL,
            amenities TEXT
        )
    ''')
    
    # Create Places Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS places (
            place_id TEXT PRIMARY KEY,
            name TEXT,
            city TEXT,
            type TEXT,
            rating REAL,
            description TEXT
        )
    ''')
    
    # Create Indexes for optimization
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_flights_src_dst ON flights (source, destination)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels (city)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_places_city ON places (city)")
    
    conn.commit()
    conn.close()

def load_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Load Flights
    if os.path.exists('data/flights.json'):
        with open('data/flights.json', 'r') as f:
            flights = json.load(f)
            for flight in flights:
                cursor.execute('''
                    INSERT OR REPLACE INTO flights (flight_id, airline, source, destination, departure, duration_hrs, price_inr)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (flight['flight_id'], flight['airline'], flight['source'], flight['destination'], flight['departure'], flight['duration_hrs'], flight['price_inr']))
                
    # Load Hotels
    if os.path.exists('data/hotels.json'):
        with open('data/hotels.json', 'r') as f:
            hotels = json.load(f)
            for hotel in hotels:
                amenities = ",".join(hotel.get('amenities', []))
                cursor.execute('''
                    INSERT OR REPLACE INTO hotels (hotel_id, name, city, rating, price_per_night_inr, amenities)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (hotel['hotel_id'], hotel['name'], hotel['city'], hotel['rating'], hotel['price_per_night_inr'], amenities))
                
    # Load Places
    if os.path.exists('data/places.json'):
        with open('data/places.json', 'r') as f:
            places = json.load(f)
            for place in places:
                cursor.execute('''
                    INSERT OR REPLACE INTO places (place_id, name, city, type, rating, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (place['place_id'], place['name'], place['city'], place['type'], place['rating'], place['description']))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("Initializing Database...")
    init_db()
    print("Loading data from JSON to SQLite...")
    load_data()
    print("Data loaded successfully!")
