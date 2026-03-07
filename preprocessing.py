import pandas as pd
import numpy as np


def preprocess_dataset(df):

    print("\n==============================")
    print("Starting Dataset Preprocessing")
    print("==============================")

    print(f"Initial dataset shape: {df.shape}")

    df = df.copy()

    # ------------------------------------------------
    # Remove duplicate rows
    # ------------------------------------------------

    before = len(df)
    df = df.drop_duplicates()
    after = len(df)

    print(f"Removed {before-after} duplicate rows")

    # ------------------------------------------------
    # Remove fully empty columns
    # ------------------------------------------------

    before_cols = df.shape[1]

    df = df.dropna(axis=1, how="all")

    after_cols = df.shape[1]

    print(f"Removed {before_cols-after_cols} empty columns")

    # ------------------------------------------------
    # Convert numeric columns
    # ------------------------------------------------

    print("Converting numeric columns where possible...")

    for col in df.columns:

        if df[col].dtype == "object":

            try:
                df[col] = pd.to_numeric(df[col])
            except:
                pass

    print("Numeric conversion completed")

    # ------------------------------------------------
    # Replace infinite values
    # ------------------------------------------------

    inf_count = np.isinf(df.select_dtypes(include=np.number)).sum().sum()

    if inf_count > 0:
        print(f"Replacing {inf_count} infinite values")

    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # ------------------------------------------------
    # Timestamp handling
    # ------------------------------------------------

    if "timestamp" in df.columns:

        print("Processing timestamps...")

        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

        df = df.sort_values("timestamp")

        df = df.reset_index(drop=True)

        print("Timestamp sorting completed")

    # ------------------------------------------------
    # Missing value analysis
    # ------------------------------------------------

    total_missing = df.isna().sum().sum()

    print(f"Total missing values detected: {total_missing}")

    numeric_cols = df.select_dtypes(include=[np.number]).columns

    # Forward fill

    print("Applying forward fill to numeric telemetry data...")

    df[numeric_cols] = df[numeric_cols].ffill()

    # Backward fill

    print("Applying backward fill...")

    df[numeric_cols] = df[numeric_cols].bfill()

    # Remaining NaN

    remaining_nan = df[numeric_cols].isna().sum().sum()

    if remaining_nan > 0:

        print(f"Filling remaining {remaining_nan} NaN values with 0")

        df[numeric_cols] = df[numeric_cols].fillna(0)

    # ------------------------------------------------
    # Sensor spike removal
    # ------------------------------------------------

    print("Detecting and clipping sensor outliers using IQR method...")

    for col in numeric_cols:

        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)

        iqr = q3 - q1

        lower = q1 - 3 * iqr
        upper = q3 + 3 * iqr

        df[col] = df[col].clip(lower, upper)

    print("Outlier clipping completed")

    # ------------------------------------------------
    # Sensor sanity limits
    # ------------------------------------------------

    print("Applying sensor sanity limits...")

    if "power" in df.columns:
        df["power"] = df["power"].clip(lower=0)

    if "temp" in df.columns:
        df["temp"] = df["temp"].clip(-40, 120)

    if "freq" in df.columns:
        df["freq"] = df["freq"].clip(45, 65)

    print("Sensor sanity checks completed")

    # ------------------------------------------------
    # Timestamp gap detection
    # ------------------------------------------------

    if "timestamp" in df.columns:

        print("Checking for timestamp gaps...")

        time_diff = df["timestamp"].diff()

        expected = pd.Timedelta(minutes=5)

        gap_mask = time_diff > expected

        gaps = gap_mask.sum()

        if gaps > 0:

            print(f"WARNING: Detected {gaps} timestamp gaps")

        else:

            print("No timestamp gaps detected")

    print("----------------------------------")
    print(f"Final cleaned dataset shape: {df.shape}")
    print("Dataset preprocessing completed")
    print("----------------------------------\n")

    return df