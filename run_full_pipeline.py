import pandas as pd

from flatten_inverters import flatten_inverter_data
from kpi_engineering import compute_kpis
from dataset_builder import build_training_dataset
from final_dataset_cleaning import clean_final_dataset

from model_training import train_model
from plant1_inf import run_inference
from plant1_kpi_adapter import compute_plant1_kpis

from config import KPI_COLUMNS


print("\n========================================")
print("Solar Inverter Risk Prediction Pipeline")
print("========================================")


# =====================================================
# 1️⃣ Load Plant2 and Plant3 datasets
# =====================================================

print("\nLoading plant datasets...")

plant2 = pd.read_csv("plant_2.csv")
plant3 = pd.read_csv("plant_3.csv")

print("Plant2:", plant2.shape)
print("Plant3:", plant3.shape)


# =====================================================
# 2️⃣ Flatten inverter telemetry
# =====================================================

print("\nFlattening inverter telemetry...")

plant2 = flatten_inverter_data(plant2)
plant3 = flatten_inverter_data(plant3)


# =====================================================
# 3️⃣ KPI Engineering
# =====================================================

print("\nComputing KPIs...")

plant2 = compute_kpis(plant2)
plant3 = compute_kpis(plant3)


# =====================================================
# 4️⃣ Build labeled dataset (Plant2 + Plant3)
# =====================================================

print("\nBuilding labeled dataset...")

dataset2 = build_training_dataset(plant2)
dataset3 = build_training_dataset(plant3)

final_dataset = pd.concat(
    [dataset2, dataset3],
    ignore_index=True
)

print("Combined dataset:", final_dataset.shape)


# =====================================================
# 5️⃣ Clean dataset
# =====================================================

print("\nCleaning dataset...")

final_dataset = clean_final_dataset(final_dataset)

final_dataset.to_csv(
    "final_dataset_cleaned.csv",
    index=False
)

print("Saved → final_dataset_cleaned.csv")


# =====================================================
# 6️⃣ Train ML model
# =====================================================

print("\nTraining model...")

clf, reg = train_model("final_dataset_cleaned.csv")

print("Model trained and saved → risk_model.pkl")


# =====================================================
# 7️⃣ Process Plant1 dataset
# =====================================================

print("\nProcessing Plant1 dataset...")

plant1 = pd.read_csv("plant_1.csv")

print("Plant1:", plant1.shape)


# flatten
plant1 = flatten_inverter_data(plant1)

# KPI compute
plant1 = compute_plant1_kpis(plant1)

# ensure alarm_code exists (Plant1 has none)
plant1["alarm_code"] = 0


# =====================================================
# 8️⃣ Run inference on Plant1
# =====================================================

print("\nRunning risk prediction on Plant1...")

plant1_predictions = run_inference(plant1)

plant1_predictions.to_csv(
    "plant1_risk_predictions.csv",
    index=False
)

print("Saved → plant1_risk_predictions.csv")


# =====================================================
# 9️⃣ Ensure column compatibility
# =====================================================

print("\nAligning dataset columns...")

required_cols = KPI_COLUMNS + [
    "alarm_code",
    "op_state",
    "risk_class",
    "risk_score"
]

plant1_predictions = plant1_predictions[required_cols]
final_dataset = final_dataset[required_cols]


# =====================================================
# 🔟 Merge datasets
# =====================================================

print("\nCombining datasets...")

final_trainable_dataset = pd.concat(
    [final_dataset, plant1_predictions],
    ignore_index=True
)

print("Final dataset:", final_trainable_dataset.shape)


# =====================================================
# Save final dataset
# =====================================================

final_trainable_dataset.to_csv(
    "final_trainable_dataset.csv",
    index=False
)

print("\nSaved → final_trainable_dataset.csv")


print("\n========================================")
print("Pipeline Completed Successfully")
print("========================================")