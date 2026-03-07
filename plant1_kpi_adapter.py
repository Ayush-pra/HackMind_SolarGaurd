import pandas as pd
import numpy as np


def compute_plant1_kpis(df):

    print("\nComputing Plant1 KPIs...")

    df = df.copy()

    # ------------------------------
    # efficiency
    # ------------------------------

    if "pv1_power" in df.columns:
        df["efficiency"] = df["power"] / (df["pv1_power"] + 1e-6)
    else:
        df["efficiency"] = 0

    # ------------------------------
    # power_drop
    # ------------------------------

    df["power_drop"] = df.groupby("inverter_id")["power"].pct_change(fill_method=None)

    # ------------------------------
    # voltage deviation
    # ------------------------------

    if all(c in df.columns for c in ["v_ab","v_bc","v_ca"]):

        df["avg_voltage"] = (
            df["v_ab"] + df["v_bc"] + df["v_ca"]
        ) / 3

        rolling_voltage = (
            df.groupby("inverter_id")["avg_voltage"]
            .rolling(288)
            .mean()
            .reset_index(level=0, drop=True)
        )

        df["voltage_dev"] = abs(df["avg_voltage"] - rolling_voltage)

    else:
        df["voltage_dev"] = 0


    # ------------------------------
    # current_dev (approx using power trend)
    # ------------------------------

    rolling_power = (
        df.groupby("inverter_id")["power"]
        .rolling(288)
        .mean()
        .reset_index(level=0, drop=True)
    )

    df["current_dev"] = abs(df["power"] - rolling_power)


    # ------------------------------
    # current imbalance (approx)
    # ------------------------------

    df["current_imbalance"] = (
        df.groupby("timestamp")["power"]
        .transform("std")
    )


    # ------------------------------
    # voltage imbalance
    # ------------------------------

    if all(c in df.columns for c in ["v_ab","v_bc","v_ca"]):

        df["voltage_imbalance"] = df[["v_ab","v_bc","v_ca"]].std(axis=1)

    else:
        df["voltage_imbalance"] = 0


    # ------------------------------
    # power_std_6h
    # ------------------------------

    df["power_std_6h"] = (
        df.groupby("inverter_id")["power"]
        .rolling(72)
        .std()
        .reset_index(level=0, drop=True)
    )


    # ------------------------------
    # efficiency trend
    # ------------------------------

    df["efficiency_trend"] = (
        df.groupby("inverter_id")["efficiency"]
        .rolling(288)
        .mean()
        .reset_index(level=0, drop=True)
    )


    print("Plant1 KPI generation completed")

    return df