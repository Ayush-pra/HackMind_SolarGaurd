from config import (
    SHUTDOWN_ALARMS,
    DEGRADATION_ALARMS,
    SHUTDOWN_STATES,
    DEGRADATION_STATES
)


def alarm_severity(alarm):

    if alarm in SHUTDOWN_ALARMS:
        return 2

    if alarm in DEGRADATION_ALARMS:
        return 1

    return 0


def state_severity(state):

    if state in SHUTDOWN_STATES:
        return 2

    if state in DEGRADATION_STATES:
        return 1

    return 0


def risk_class_from_alarm_state(alarm_code, op_state):

    alarm_lvl = alarm_severity(alarm_code)
    state_lvl = state_severity(op_state)

    final_lvl = max(alarm_lvl, state_lvl)

    if final_lvl == 2:
        return "Shutdown Risk"

    if final_lvl == 1:
        return "Degradation Risk"

    return "No Risk"