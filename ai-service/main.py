from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="Energy Audit AI Service")

# Configure Gemini if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class EnergyData(BaseModel):
    facilityType: str
    electricity: float
    gas: float
    hvac: float
    machinery: float
    lighting: float
    location: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "AI Service is running", "ai_enabled": bool(GEMINI_API_KEY)}

@app.post("/analyze")
def analyze_energy(data: EnergyData):
    total_consumption = data.electricity + data.gas + data.hvac + data.machinery + data.lighting
    
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""
            You are a professional Energy Efficiency Auditor. Analyze the following facility data:
            Facility Type: {data.facilityType}
            Location: {data.location or 'Unknown'}
            Monthly Consumption (in units/kWh equivalent):
            - Electricity: {data.electricity}
            - Gas: {data.gas}
            - HVAC: {data.hvac}
            - Machinery: {data.machinery}
            - Lighting: {data.lighting}
            Total Consumption: {total_consumption}
            
            Based on these metrics for this facility type, validate the proportion of consumption and provide an energy audit report formatted EXACTLY as a JSON object with no markdown formatting or extra text.
            The JSON MUST strictly match this exact structure:
            {{
                "summary": "A 2-3 sentence overview of the facility's efficiency and major problems.",
                "efficiency_score": <an integer between 0 and 100 based on realistic baselines for this facility type>,
                "flagged_areas": ["Name of Area 1", "Name of Area 2"],
                "recommendations": [
                    {{
                        "area": "Area Name",
                        "issue": "Specific issue identified from data",
                        "suggestion": "Specific, actionable improvement suggestion",
                        "estimated_saving": "A string like '10%' or '15%'"
                    }}
                ],
                "estimated_total_saving": "A string like '₹50,000' or '₹1,20,000' based on 15% to 20% of total consumption * assuming ₹8 per unit pricing",
                "carbon_reduction": "A string like '1200 kg CO2' representing estimated yearly reduction"
            }}
            Return ONLY the valid JSON object, nothing else.
            """
            
            response = model.generate_content(prompt)
            # Clean up potential markdown formatting in response
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            ai_data = json.loads(result_text.strip())
            return ai_data
            
        except Exception as e:
            print(f"Error calling Gemini AI: {e}")
            # Fallback to mock data if AI fails
            pass
            
    # Mock fallback logic
    efficiency_score = max(0, min(100, int(100 - (total_consumption / 100))))
    flagged_areas = []
    if data.hvac > 500: flagged_areas.append("HVAC")
    if data.machinery > 1000: flagged_areas.append("Machinery")
        
    recommendations = []
    if "HVAC" in flagged_areas:
        recommendations.append({"area": "HVAC", "issue": "High consumption detected compared to baseline.", "suggestion": "Implement smart thermostats and regular maintenance.", "estimated_saving": "15%"})
    if "Machinery" in flagged_areas:
        recommendations.append({"area": "Machinery", "issue": "Machinery consumption is abnormally high.", "suggestion": "Upgrade to high-efficiency motors (IE3/IE4).", "estimated_saving": "20%"})
        
    if not recommendations:
         recommendations.append({"area": "General", "issue": "Routine optimizations available.", "suggestion": "Switch to LED lighting to reduce baseline load.", "estimated_saving": "5%"})
        
    return {
        "summary": f"Energy audit complete for {data.facilityType}. Total identified consumption is {total_consumption} units. (Mock fallback result)",
        "efficiency_score": efficiency_score,
        "flagged_areas": flagged_areas,
        "recommendations": recommendations,
        "estimated_total_saving": f"₹{int(total_consumption * 0.15 * 8)}",
        "carbon_reduction": f"{int(total_consumption * 0.15 * 0.85)} kg CO2"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
