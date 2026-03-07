# number of steps for 7 days (5 min interval)
WINDOW_STEPS = 2016


# KPIs used for ML training
KPI_COLUMNS = [
    "power",
    "temp",
    "efficiency",
    "power_drop",
    "voltage_dev",
    "current_dev",
    "current_imbalance",
    "voltage_imbalance",
    "power_std_6h",
    "efficiency_trend"
]


# Alarm severity groups
SHUTDOWN_ALARMS = {100, 556, 559, 581}

DEGRADATION_ALARMS = {2, 4, 8, 9, 10, 39}


# Operational state severity groups
SHUTDOWN_STATES = {8, 5120, 4608, 37120, 21760, 33280}

DEGRADATION_STATES = {3, 7}