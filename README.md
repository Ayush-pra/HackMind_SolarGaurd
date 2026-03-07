# SolarGuard AI — Smart Solar Inverter Failure Prediction

SolarGuard AI is an **AI-driven predictive maintenance system for solar inverters**.  
It analyzes inverter telemetry data, computes domain-specific KPIs, predicts failure risk using machine learning, and generates **explainable insights for engineers**.

The system combines **Machine Learning, Explainable AI, and Large Language Models** to detect early signs of inverter degradation and prevent unexpected downtime.

---

# Project Overview

Solar power plants rely heavily on inverters to convert DC energy from photovoltaic panels into usable AC power. Failure or degradation of inverters can cause:

- Energy production losses
- Increased maintenance costs
- Reduced plant efficiency

Traditional monitoring systems mainly provide **real-time telemetry**, but they lack **predictive intelligence**.

SolarGuard AI solves this by providing:

- Predictive maintenance
- Risk classification
- Risk scoring
- Failure explanation for engineers

---

# Key Features

## Predictive Failure Detection
Uses **XGBoost machine learning models** to classify inverter health:

- No Risk
- Degradation Risk
- Shutdown Risk

---

## Risk Score Prediction
A regression model predicts **risk severity (0-100)** to estimate the likelihood of failure.

---

## KPI Engineering
Instead of raw telemetry, the system generates meaningful **performance indicators**:

- Efficiency
- Power drop
- Voltage deviation
- Current deviation
- Voltage imbalance
- Current imbalance
- Power stability
- Efficiency trend

These KPIs help detect **early degradation patterns**.

---

## Explainable AI
The system extracts **top contributing features** for each prediction and generates an **AI explanation of failure causes** using an LLM.

Engineers receive:

- Root cause analysis
- Critical KPIs
- Maintenance recommendations

---

## Real-Time Monitoring
The architecture supports real-time telemetry ingestion and prediction through a microservice architecture.

---
Telemetry Data
↓
Backend API (Node.js)
↓
KPI Engineering
↓
FastAPI ML Service
↓
XGBoost Prediction
↓
Top Feature Extraction
↓
LLM Failure Explanation
↓
MongoDB Storage
↓
React Dashboard


---

# Machine Learning Pipeline

The ML workflow is divided into **two stages**:

## Offline Training Pipeline

Used to build and train the machine learning models.
Raw Telemetry Dataset
↓
Dataset Cleaning
↓
KPI Feature Engineering
↓
Label Generation
↓
Final Trainable Dataset
↓
Train/Test Split
↓
Model Training (XGBoost)
↓
Model Evaluation
↓
Save Models (.pkl)


---

## Online Prediction Pipeline

Used in production when telemetry data is received.
Frontend
↓
Backend Controller
↓
Telemetry History Buffer
↓
KPI Calculation
↓
FastAPI ML Service
↓
Risk Prediction
↓
LLM Failure Explanation
↓
MongoDB
↓
Frontend Dashboard

---

# Machine Learning Models

## Classification Model

Algorithm:
XgboostClassifier

---


Predicts inverter health category:

- No Risk
- Degradation Risk
- Shutdown Risk

### Performance

Accuracy: 99%


| Class | Precision | Recall | F1 |
|------|------|------|------|
| No Risk | 1.00 | 1.00 | 1.00 |
| Degradation Risk | 0.99 | 0.99 | 0.99 |
| Shutdown Risk | 0.96 | 0.94 | 0.95 |

---

## Risk Score Regression Model

Algorithm: XgBoostRegressor
Performance : 
MAE : 4.96
R2- score: 0.87


---

# Important KPIs Used

| KPI | Description |
|---|---|
| efficiency | inverter conversion efficiency |
| power_drop | sudden output drop |
| voltage_dev | voltage deviation from baseline |
| current_dev | abnormal current variation |
| current_imbalance | PV string current imbalance |
| voltage_imbalance | PV string voltage mismatch |
| power_std_6h | short-term power fluctuation |
| efficiency_trend | long-term performance degradation |

---

# Tech Stack

## Frontend
- React
- Chart visualization

## Backend
- Node.js
- Express.js
- MongoDB

## ML Service
- FastAPI
- Python
- XGBoost
- SHAP (feature importance)

## AI Explanation
- Groq Llama LLM




