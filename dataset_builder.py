import pandas as pd
import random

from config import WINDOW_STEPS, KPI_COLUMNS
from alarm_labeling import risk_class_from_alarm_state
from risk_scoring import compute_risk_score


def build_training_dataset(df):

    print("\n================================")
    print("Building ML Training Dataset")
    print("================================")

    samples = []

    alarm_rows = df[df["alarm_code"].notna()]

    print(f"Detected {len(alarm_rows)} alarm events")

    # ------------------------------
    # Alarm Samples
    # ------------------------------

    for idx, row in alarm_rows.iterrows():

        past_idx = idx - WINDOW_STEPS

        if past_idx < 0:
            continue

        past_row = df.iloc[past_idx]

        sample = {}

        # KPIs
        for kpi in KPI_COLUMNS:
            sample[kpi] = past_row.get(kpi, 0)

        alarm_code = row["alarm_code"]
        op_state = row.get("op_state", 0)

        risk_class = risk_class_from_alarm_state(alarm_code, op_state)

        if risk_class == "No Risk":
            risk_score = 0
        else:
            risk_score = compute_risk_score(past_row, alarm_code, op_state)

        sample["alarm_code"] = alarm_code
        sample["op_state"] = op_state
        sample["risk_class"] = risk_class
        sample["risk_score"] = risk_score

        samples.append(sample)

    alarm_count = len(samples)

    print(f"Alarm samples created: {alarm_count}")

    # ------------------------------
    # No Risk Samples
    # ------------------------------

    candidate_indices = []

    for i in range(len(df) - WINDOW_STEPS):

        current_alarm = df.loc[i, "alarm_code"]
        future_alarm = df.loc[i + WINDOW_STEPS, "alarm_code"]

        if pd.isna(current_alarm) and pd.isna(future_alarm):
            candidate_indices.append(i)

    no_risk_indices = random.sample(
        candidate_indices,
        min(alarm_count, len(candidate_indices))
    )

    print(f"No-Risk samples added: {len(no_risk_indices)}")

    for idx in no_risk_indices:

        row = df.iloc[idx]

        sample = {}

        for kpi in KPI_COLUMNS:
            sample[kpi] = row.get(kpi, 0)

        sample["alarm_code"] = 0
        sample["op_state"] = row.get("op_state", 0)
        sample["risk_class"] = "No Risk"
        sample["risk_score"] = 0

        samples.append(sample)

    final_dataset = pd.DataFrame(samples)

    print("--------------------------------")
    print(f"Final dataset shape: {final_dataset.shape}")
    print("Risk class distribution:")
    print(final_dataset["risk_class"].value_counts())
    print("--------------------------------\n")

    return final_dataset