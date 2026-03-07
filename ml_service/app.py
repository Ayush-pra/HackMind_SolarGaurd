from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

from llm_explainer import generate_summary

app = FastAPI(title="Solar Inverter ML Service")


# -------------------------------
# Load models
# -------------------------------

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


# -------------------------------
# Input schema
# -------------------------------

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
    op_state: int


class PredictionResponse(BaseModel):
    risk_class: str
    risk_score: float
    top_features: list
    failure_summary: str


# -------------------------------
# Prediction endpoint
# -------------------------------

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: Features):

    if classifier is None or regressor is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="Models not loaded")

    print("Received features:", features.dict())

    try:

        df = pd.DataFrame([{
            "power": features.power,
            "temp": features.temp,
            "efficiency": features.efficiency if features.efficiency is not None else 0,
            "power_drop": features.power_drop if features.power_drop is not None else 0,
            "voltage_dev": features.voltage_dev if features.voltage_dev is not None else 0,
            "current_dev": features.current_dev if features.current_dev is not None else 0,
            "current_imbalance": features.current_imbalance if features.current_imbalance is not None else 0,
            "voltage_imbalance": features.voltage_imbalance if features.voltage_imbalance is not None else 0,
            "power_std_6h": features.power_std_6h if features.power_std_6h is not None else 0,
            "efficiency_trend": features.efficiency_trend if features.efficiency_trend is not None else 0,
            "op_state": int(features.op_state)
        }])

        print("Input dataframe:", df)

        # Predict class
        class_encoded = int(classifier.predict(df)[0])

        if class_encoded >= len(label_encoder):
            raise ValueError("Invalid class prediction")

        risk_class = label_encoder[class_encoded]

        # Predict risk score
        risk_score = float(regressor.predict(df)[0])
        risk_score = round(risk_score, 2)

        # ---------------------------
        # Feature importance
        # ---------------------------

        importance = classifier.feature_importances_
        feature_names = df.columns
        feature_scores = dict(zip(feature_names, importance))

        sorted_features = sorted(
            feature_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]

        top_features = [
            {
                "feature": f,
                "value": float(df.iloc[0][f])
            }
            for f, _ in sorted_features
        ]

        print("Top features:", top_features)

        # ---------------------------
        # LLM explanation
        # ---------------------------

        failure_summary = generate_summary(risk_class, risk_score, top_features)

        print("Failure summary:", failure_summary)

        return PredictionResponse(
            risk_class=risk_class,
            risk_score=risk_score,
            top_features=top_features,
            failure_summary=failure_summary
        )

    except Exception as e:
        print("Prediction error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Health check
# -------------------------------

@app.get("/health")
async def health_check():
    try:
        models_loaded = classifier is not None and regressor is not None and label_encoder is not None
        return {
            "status": "healthy" if models_loaded else "unhealthy",
            "models_loaded": models_loaded
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/models")
async def get_model_info():

    if classifier is None or regressor is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    return {
        "classifier": type(classifier).__name__,
        "regressor": type(regressor).__name__,
        "label_encoder": type(label_encoder).__name__,
        "features": [
            "power","temp","efficiency","power_drop","voltage_dev",
            "current_dev","current_imbalance","voltage_imbalance",
            "power_std_6h","efficiency_trend","op_state"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)