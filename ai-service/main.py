import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

app = FastAPI(title="Auction AI Bidding Assistant")

# MySQL Connection (Optional for now, fallback to statistical defaults)
def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "auction_db")
        )
    except:
        return None

class BidInput(BaseModel):
    asset_type: str
    min_bid: float
    user_budget: float
    auction_id: Optional[int] = None

class BidSuggestion(BaseModel):
    safe_bid: float
    aggressive_bid: float
    win_probability: float
    insights: List[str]
    overbidding_warning: bool

@app.get("/")
async def root():
    return {"status": "AI Service Running"}

@app.post("/suggest", response_model=BidSuggestion)
async def suggest_bid(data: BidInput):
    # Logic:
    # 1. Safe Bid: Min Bid + 15% (Standard premium)
    # 2. Aggressive Bid: Min(User Budget, Min Bid + 45%)
    # 3. Probability: Simple logistic function based on bid vs min_bid ratio
    
    # Simulate historical lookup
    multiplier_map = {
        "art": 1.5,
        "real-estate": 1.2,
        "digital": 1.3,
        "default": 1.25
    }
    
    multiplier = multiplier_map.get(data.asset_type.lower(), multiplier_map["default"])
    
    safe_bid = data.min_bid * 1.1
    aggressive_bid = min(data.user_budget, data.min_bid * multiplier)
    
    # Overbidding warning if aggressive bid is very close to budget
    overbidding = aggressive_bid >= data.user_budget * 0.95
    
    # Calculate win probability (mocked logic based on bid strength)
    # If bid is 2x min_bid, probability is high
    ratio = aggressive_bid / data.min_bid if data.min_bid > 0 else 1
    win_prob = min(95.0, (ratio - 1) * 100) # Simple linear scale for demo
    
    insights = [
        f"The {data.asset_type} market is currently active.",
        f"Historically, winning bids for this category are {int((multiplier-1)*100)}% above floor price.",
        "Sealed bids prevent front-running, so your first bid counts."
    ]
    
    if overbidding:
        insights.append("WARNING: This bid consumes most of your budget.")

    return BidSuggestion(
        safe_bid=round(safe_bid, 4),
        aggressive_bid=round(aggressive_bid, 4),
        win_probability=round(max(5.0, win_prob), 2),
        insights=insights,
        overbidding_warning=overbidding
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
