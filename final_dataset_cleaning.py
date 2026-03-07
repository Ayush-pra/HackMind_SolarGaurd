import pandas as pd
import numpy as np

def clean_final_dataset(df):

    print("\n==============================")
    print("Cleaning Final Dataset")
    print("==============================")

    print(f"Initial shape: {df.shape}")

    # -------------------------------
    # Remove duplicate rows
    # -------------------------------

    before = len(df)
    df = df.drop_duplicates()
    after = len(df)

    print(f"Removed duplicates: {before - after}")

    # -------------------------------
    # Drop rows with invalid op_state
    # -------------------------------

    before = len(df)

    df = df[df["op_state"] != 20480]

    after = len(df)

    print(f"Dropped rows with op_state = 20480: {before - after}")

    # -------------------------------
    # Remove rows with missing values
    # -------------------------------

    before = len(df)

    df = df.dropna()

    after = len(df)

    print(f"Dropped rows with NaN: {before - after}")

    # ------------------------------------------------
    # Replace infinite values
    # ------------------------------------------------

    inf_count = np.isinf(df.select_dtypes(include=np.number)).sum().sum()

    if inf_count > 0:
        print(f"Replacing {inf_count} infinite values")

    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # -------------------------------
    # Clip unrealistic KPI values
    # -------------------------------

    if "power" in df.columns:
        df["power"] = df["power"].clip(lower=0)

    if "efficiency" in df.columns:
        df["efficiency"] = df["efficiency"].clip(0, 1)

    if "temp" in df.columns:
        df["temp"] = df["temp"].clip(-40, 120)

    # -------------------------------
    # Reset index
    # -------------------------------

    df = df.reset_index(drop=True)

    print(f"Final cleaned dataset shape: {df.shape}")

    print("Risk distribution:")

    print(df["risk_class"].value_counts())

    print("==============================\n")

    return df