import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from xgboost import XGBClassifier, XGBRegressor

from config import KPI_COLUMNS


def train_model(dataset_path="final_trainable_dataset.csv"):

    print("\n==============================")
    print("Training XGBoost Models")
    print("==============================")

    df = pd.read_csv(dataset_path)

    print("Dataset shape:", df.shape)

    X = df[KPI_COLUMNS]

    y_class = df["risk_class"]
    y_score = df["risk_score"]

    # ------------------------------
    # Encode class labels
    # ------------------------------

    label_encoder = LabelEncoder()

    y_class_encoded = label_encoder.fit_transform(y_class)

    print("Class mapping:")
    for i, c in enumerate(label_encoder.classes_):
        print(i, "→", c)

    # ------------------------------
    # Split
    # ------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_class_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_class_encoded
    )

    # ------------------------------
    # Classifier
    # ------------------------------

    print("\nTraining risk_class model")

    clf = XGBClassifier(
        n_estimators=600,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        n_jobs=-1
    )

    clf.fit(X_train, y_train)

    acc = clf.score(X_test, y_test)

    print("Classification accuracy:", acc)

    joblib.dump(clf, "risk_model.pkl")
    joblib.dump(label_encoder, "label_encoder.pkl")

    print("Saved → risk_model.pkl")
    print("Saved → label_encoder.pkl")

    # ------------------------------
    # Regressor
    # ------------------------------

    print("\nTraining risk_score model")

    X_train2, X_test2, y_train2, y_test2 = train_test_split(
        X,
        y_score,
        test_size=0.2,
        random_state=42
    )

    reg = XGBRegressor(
        n_estimators=600,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        n_jobs=-1
    )

    reg.fit(X_train2, y_train2)

    joblib.dump(reg, "risk_score_model.pkl")

    print("Saved → risk_score_model.pkl")

    return clf, reg