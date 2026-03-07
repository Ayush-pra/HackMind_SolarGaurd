import pandas as pd
import re


def flatten_inverter_data(df):

    inverter_pattern = r"inverters\[(\d+)\]\."

    inverter_ids = set()

    for col in df.columns:

        match = re.search(inverter_pattern, col)

        if match:
            inverter_ids.add(int(match.group(1)))

    inverter_ids = sorted(list(inverter_ids))

    rows = []

    for _, row in df.iterrows():

        base_data = {
            "timestamp": row["timestamp"]
        }

        for inv in inverter_ids:

            inverter_data = base_data.copy()

            inverter_data["inverter_id"] = inv

            prefix = f"inverters[{inv}]."

            for col in df.columns:

                if col.startswith(prefix):

                    new_col = col.replace(prefix, "")

                    inverter_data[new_col] = row[col]

            rows.append(inverter_data)

    return pd.DataFrame(rows)