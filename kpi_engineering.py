import pandas as pd
import numpy as np


def compute_kpis(df):

    print("\nComputing KPIs...")

    df = df.copy()

    # -------------------------------------------------
    # Identify PV voltage and current columns
    # -------------------------------------------------

    pv_voltage_cols = [c for c in df.columns if "pv" in c and "voltage" in c]
    pv_current_cols = [c for c in df.columns if "pv" in c and "current" in c]

    print(f"Detected {len(pv_voltage_cols)} PV voltage channels")
    print(f"Detected {len(pv_current_cols)} PV current channels")

    # -------------------------------------------------
    # Aggregate PV statistics
    # -------------------------------------------------

    if pv_voltage_cols:
        df["avg_pv_voltage"] = df[pv_voltage_cols].mean(axis=1)
        df["voltage_std"] = df[pv_voltage_cols].std(axis=1)

    if pv_current_cols:
        df["avg_pv_current"] = df[pv_current_cols].mean(axis=1)
        df["current_std"] = df[pv_current_cols].std(axis=1)

    # -------------------------------------------------
    # DC Power (solar input power)
    # -------------------------------------------------

    if "avg_pv_voltage" in df.columns and "avg_pv_current" in df.columns:
        df["dc_power"] = df["avg_pv_voltage"] * df["avg_pv_current"]

    # -------------------------------------------------
    # Inverter efficiency
    # -------------------------------------------------

    if "power" in df.columns and "dc_power" in df.columns:
        df["efficiency"] = df["power"] / (df["dc_power"] + 1e-6)

    # -------------------------------------------------
    # Temperature
    # -------------------------------------------------

    if "temp" not in df.columns:
        df["temp"] = 0

    # -------------------------------------------------
    # Power stability (short-term fluctuations)
    # -------------------------------------------------

    if "power" in df.columns:

        df["power_drop"] = df.groupby("inverter_id")["power"].pct_change(fill_method=None)

        df["power_std_6h"] = (
            df.groupby("inverter_id")["power"]
            .rolling(72)
            .std()
            .reset_index(level=0, drop=True)
        )

    # -------------------------------------------------
    # Voltage deviation (daily baseline)
    # -------------------------------------------------

    if "avg_pv_voltage" in df.columns:

        df["voltage_dev"] = abs(
            df["avg_pv_voltage"]
            - df.groupby("inverter_id")["avg_pv_voltage"]
            .rolling(288)
            .mean()
            .reset_index(level=0, drop=True)
        )

    # -------------------------------------------------
    # Current deviation
    # -------------------------------------------------

    if "avg_pv_current" in df.columns:

        df["current_dev"] = abs(
            df["avg_pv_current"]
            - df.groupby("inverter_id")["avg_pv_current"]
            .rolling(288)
            .mean()
            .reset_index(level=0, drop=True)
        )

    # -------------------------------------------------
    # String imbalance indicators
    # -------------------------------------------------

    if "current_std" in df.columns:
        df["current_imbalance"] = df["current_std"]

    if "voltage_std" in df.columns:
        df["voltage_imbalance"] = df["voltage_std"]

    # -------------------------------------------------
    # Efficiency trend (slow degradation indicator)
    # -------------------------------------------------

    if "efficiency" in df.columns:

        df["efficiency_trend"] = (
            df.groupby("inverter_id")["efficiency"]
            .rolling(288)
            .mean()
            .reset_index(level=0, drop=True)
        )

    print("KPI generation completed")
    df = df.reset_index(drop=True)
    df = df.sort_values(["inverter_id", "timestamp"]).reset_index(drop=True)
    return df