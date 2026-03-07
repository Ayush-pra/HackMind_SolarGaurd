import pandas as pd
import joblib
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.model_selection import StratifiedKFold
from sklearn.model_selection import RandomizedSearchCV

from sklearn.preprocessing import LabelEncoder3

from sklearn.metrics import classification_report
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import r2_score

from xgboost import XGBClassifier
from xgboost import XGBRegressor
from xgboost import plot_importance

import matplotlib.pyplot as plt

from config import KPI_COLUMNS


print("\n==============================")
print("Main Risk Prediction Model")
print("==============================")


# ------------------------------------------------
# Load dataset
# ------------------------------------------------

df = pd.read_csv("final_trainable_dataset.csv")

print("Dataset:", df.shape)

print("\nCleaning dataset...")

# Replace infinities
df.replace([np.inf, -np.inf], np.nan, inplace=True)

before_rows = len(df)

# Drop NaN rows
df.dropna(inplace=True)

after_rows = len(df)

print(f"Dropped {before_rows - after_rows} rows containing NaN/inf")

# Clip numeric columns only
numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].clip(-1e6, 1e6)

print("Dataset cleaned successfully")


# ------------------------------------------------
# Feature sets
# ------------------------------------------------

FEATURES_WITH_ALARM = KPI_COLUMNS + ["op_state", "alarm_code"]
FEATURES_NO_ALARM = KPI_COLUMNS + ["op_state"]


# ------------------------------------------------
# Encode classes
# ------------------------------------------------

encoder = LabelEncoder3()

df["risk_class_encoded"] = encoder.fit_transform(df["risk_class"])

joblib.dump(encoder, "main_label_encoder.pkl")


# ------------------------------------------------
# Classification dataset
# ------------------------------------------------

X = df[FEATURES_NO_ALARM]
y = df["risk_class_encoded"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ------------------------------------------------
# XGBoost classifier
# ------------------------------------------------

model = XGBClassifier(
    objective="multi:softprob",
    eval_metric="mlogloss",
    tree_method="hist",     # FIXED
    n_jobs=-1,
    random_state=42
)


param_grid = {

    "n_estimators": [300, 500, 700],

    "max_depth": [5, 7, 9],

    "learning_rate": [0.01, 0.05, 0.1],

    "subsample": [0.7, 0.8, 1.0],

    "colsample_bytree": [0.7, 0.8, 1.0]
}


cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


search = RandomizedSearchCV(
    model,
    param_grid,
    n_iter=5,
    scoring="f1_weighted",
    cv=cv,
    verbose=2,
    n_jobs=-1
)


print("\nTraining classifier with hyperparameter tuning")

search.fit(X_train, y_train)


best_model = search.best_estimator_

print("Best parameters:", search.best_params_)


# ------------------------------------------------
# Feature importance
# ------------------------------------------------

print("\nPlotting feature importance...")

plt.figure(figsize=(10,6))

plot_importance(
    best_model,
    importance_type="gain",
    max_num_features=15
)

plt.title("XGBoost Feature Importance")

plt.tight_layout()

plt.show()


# ------------------------------------------------
# Evaluate classifier
# ------------------------------------------------

preds = best_model.predict(X_test)

print("\nClassification report")

print(classification_report(y_test, preds))


joblib.dump(best_model, "main_risk_classifier.pkl")

print("Saved classifier")


# ------------------------------------------------
# Risk score regression
# ------------------------------------------------

print("\nTraining risk score regressor")


X_reg = df[FEATURES_NO_ALARM]
y_reg = df["risk_score"]


X_train2, X_test2, y_train2, y_test2 = train_test_split(
    X_reg,
    y_reg,
    test_size=0.2,
    random_state=42
)


reg = XGBRegressor(
    n_estimators=500,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    tree_method="hist",   # FIXED
    n_jobs=-1,
    random_state=42
)


reg.fit(X_train2, y_train2)


preds2 = reg.predict(X_test2)


print("MAE:", mean_absolute_error(y_test2, preds2))
print("R2:", r2_score(y_test2, preds2))


joblib.dump(reg, "main_risk_regressor.pkl")

print("Saved regressor")