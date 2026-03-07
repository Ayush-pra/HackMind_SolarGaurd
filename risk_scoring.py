from config import KPI_COLUMNS


STATE_SEVERITY_SCORE = {
    0: 0,
    4: 0,
    3: 20,
    7: 25,
    8: 60,
    5120: 70,
    4608: 70,
    37120: 80,
    21760: 80,
    33280: 85,
    -1: 40
}


ALARM_SEVERITY_SCORE = {
    0: 0,
    2: 25,
    4: 30,
    8: 35,
    9: 40,
    10: 40,
    39: 50,
    100: 80,
    556: 85,
    559: 85,
    581: 90
}


def compute_risk_score(row, alarm_code, op_state):

    kpi_score = 0

    for kpi in KPI_COLUMNS:

        value = abs(row.get(kpi, 0))

        kpi_score += min(value, 1) * 10

    alarm_score = ALARM_SEVERITY_SCORE.get(alarm_code, 0)

    state_score = STATE_SEVERITY_SCORE.get(op_state, 0)

    total_score = kpi_score + alarm_score + state_score

    return min(total_score, 100)