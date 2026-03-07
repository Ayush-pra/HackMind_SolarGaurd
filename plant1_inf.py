import joblib
import numpy as np
import pandas as pd

from config import KPI_COLUMNS


def run_inference(
        df,
        class_model_path="risk_model.pkl",
        score_model_path="risk_score_model.pkl",
        encoder_path="label_encoder.pkl"
):

    print("\n==============================")
    print("Plant1 Risk Prediction")
    print("==============================")

    # -----------------------------
    # Load models
    # -----------------------------

    clf = joblib.load(class_model_path)
    reg = joblib.load(score_model_path)
    label_encoder = joblib.load(encoder_path)

    print("Models loaded successfully")

    # -----------------------------
    # Ensure required columns
    # -----------------------------

    if "alarm_code" not in df.columns:
        df["alarm_code"] = 0

    # -----------------------------
    # Prepare features
    # -----------------------------

    X = df[KPI_COLUMNS].copy()

    # clean numeric problems
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X = X.fillna(0)
    X = X.clip(-1e6, 1e6)

    print("Feature matrix:", X.shape)

    # -----------------------------
    # Predict risk class
    # -----------------------------

    print("Predicting risk_class...")

    encoded_preds = clf.predict(X)

    df["risk_class"] = label_encoder.inverse_transform(encoded_preds)

    # -----------------------------
    # Predict risk score
    # -----------------------------

    print("Predicting risk_score...")

    scores = reg.predict(X)

    scores = np.clip(scores, 0, 100)

    df["risk_score"] = scores.astype(int)

    # enforce rule
    df.loc[df["risk_class"] == "No Risk", "risk_score"] = 0

    print("Prediction completed")

    return df