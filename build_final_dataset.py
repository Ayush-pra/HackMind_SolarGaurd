import pandas as pd

from data_loader import load_dataset
from flatten_inverters import flatten_inverter_data
from kpi_engineering import compute_kpis
from dataset_builder import build_training_dataset
from preprocessing import preprocess_dataset
from final_dataset_cleaning import clean_final_dataset

print("\n====================================")
print("Solar Inverter Failure Dataset Builder")
print("====================================")

print("\nLoading datasets...")

plant2 = load_dataset("plant_2.csv")
plant3 = load_dataset("plant_3.csv")

print("Datasets loaded successfully")

print("\nCleaning datasets...")

plant2 = preprocess_dataset(plant2)
plant3 = preprocess_dataset(plant3)

print("Dataset cleaning completed")

print("\nFlattening inverter telemetry...")

plant2 = flatten_inverter_data(plant2)
plant3 = flatten_inverter_data(plant3)

print("Flattening completed")

print("\nComputing KPIs...")

plant2 = compute_kpis(plant2)
plant3 = compute_kpis(plant3)

print("KPI generation completed")

print("\nBuilding labeled dataset...")

dataset2 = build_training_dataset(plant2)
dataset3 = build_training_dataset(plant3)

print("Label generation completed")

print("\nCombining datasets...")

final_dataset = pd.concat([dataset2, dataset3])
final_dataset = clean_final_dataset(final_dataset)

print(f"Final dataset size: {final_dataset.shape}")

final_dataset.to_csv("final_dataset.csv", index=False)

print("\nFinal dataset saved as final_dataset.csv")
print("\nPipeline completed successfully 🚀")