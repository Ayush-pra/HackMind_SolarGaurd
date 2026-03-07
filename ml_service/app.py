from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

app = FastAPI(title="Solar Inverter ML Service")

# Load models
try:
    with open('main_risk_classifier.pkl', 'rb') as f:
        classifier = pickle.load(f)
    with open('main_risk_regressor.pkl', 'rb') as f:
        regressor = pickle.load(f)
    with open('main_label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    print("Models loaded successfully")
    print(f"Classifier classes: {classifier.classes_}")
    print(f"Label encoder: {label_encoder}")
except Exception as e:
    print(f"Error loading models: {e}")
    classifier = None
    regressor = None
    label_encoder = None

class Features(BaseModel):
    power: float
    temp: float
    efficiency: float | None = None
    power_drop: float | None = None
    voltage_dev: float | None = None
    current_dev: float | None = None
    current_imbalance: float | None = None
    voltage_imbalance: float | None = None
    power_std_6h: float | None = None
    efficiency_trend: float | None = None
    op_state: str

class PredictionResponse(BaseModel):
    risk_class: str
    risk_score: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: Features):
    if not classifier or not regressor or not label_encoder:
        raise HTTPException(status_code=500, detail="Models not loaded")

    print(f"Received features: {features.dict()}")

    # Convert to DataFrame
    data = {
        'power': [features.power],
        'temp': [features.temp],
        'efficiency': [features.efficiency],
        'power_drop': [features.power_drop],
        'voltage_dev': [features.voltage_dev],
        'current_dev': [features.current_dev],
        'current_imbalance': [features.current_imbalance],
        'voltage_imbalance': [features.voltage_imbalance],
        'power_std_6h': [features.power_std_6h],
        'efficiency_trend': [features.efficiency_trend],
        'op_state': [features.op_state],
    }
    df = pd.DataFrame(data)

    print(f"DataFrame before processing: {df.to_dict()}")

    # Handle missing values (fill with 0 or mean, depending on model training)
    df = df.fillna(0)

    # Note: label_encoder is for risk classes, not op_state
    # op_state is kept as string - assuming the model can handle it

    print(f"DataFrame after processing: {df.to_dict()}")

    # Predict
    try:
        risk_class_encoded = classifier.predict(df)[0]
        risk_score = regressor.predict(df)[0]

        print(f"Raw predictions - class_encoded: {risk_class_encoded}, score: {risk_score}")

        # Decode risk_class using label_encoder array
        risk_class = label_encoder[risk_class_encoded]

        print(f"Decoded risk_class: {risk_class}")

        return PredictionResponse(risk_class=risk_class, risk_score=float(risk_score))
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    try:
        models_loaded = classifier is not None and regressor is not None and label_encoder is not None
        return {
            "status": "healthy" if models_loaded else "unhealthy",
            "models_loaded": models_loaded,
            "model_info": {
                "classifier": type(classifier).__name__ if classifier else None,
                "regressor": type(regressor).__name__ if regressor else None,
                "label_encoder": "numpy.ndarray" if label_encoder is not None else None,
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@app.get("/models")
async def get_model_info():
    if not classifier or not regressor or not label_encoder:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return {
        "classifier": type(classifier).__name__,
        "regressor": type(regressor).__name__,
        "label_encoder": type(label_encoder).__name__,
        "features": ["power", "temp", "efficiency", "power_drop", "voltage_dev", "current_dev", 
                    "current_imbalance", "voltage_imbalance", "power_std_6h", "efficiency_trend", "op_state"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)