import pandas as pd


def load_dataset(path):

    df = pd.read_csv(path, low_memory=False)

    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])

    df = df.sort_values("timestamp").reset_index(drop=True)

    return df