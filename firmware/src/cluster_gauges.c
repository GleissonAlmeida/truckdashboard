/**
 * @file cluster_gauges.c
 * @brief Needle Dynamics, Low-pass IIR Damping, and Telltale State Machine
 */

#include "cluster_gauges.h"
#include <math.h>

void Cluster_InitGauges(ClusterGauges_t *cg)
{
    if (!cg) return;

    /* Speedometer: 0 to 140 km/h */
    cg->speed_gauge.current_value  = 0.0f;
    cg->speed_gauge.target_value   = 0.0f;
    cg->speed_gauge.velocity       = 0.0f;
    cg->speed_gauge.damping_factor = 0.18f;
    cg->speed_gauge.min_range      = 0.0f;
    cg->speed_gauge.max_range      = 140.0f;

    /* Tachometer: 0 to 3000 RPM */
    cg->rpm_gauge.current_value    = 0.0f;
    cg->rpm_gauge.target_value     = 0.0f;
    cg->rpm_gauge.velocity         = 0.0f;
    cg->rpm_gauge.damping_factor   = 0.22f;
    cg->rpm_gauge.min_range        = 0.0f;
    cg->rpm_gauge.max_range        = 3000.0f;

    /* Fuel Gauge: 0 to 100% */
    cg->fuel_gauge.current_value   = 50.0f;
    cg->fuel_gauge.target_value    = 50.0f;
    cg->fuel_gauge.velocity        = 0.0f;
    cg->fuel_gauge.damping_factor  = 0.05f; /* Slow damping for liquid sloshing */
    cg->fuel_gauge.min_range       = 0.0f;
    cg->fuel_gauge.max_range       = 100.0f;

    /* Coolant Temperature: 40 to 120 °C */
    cg->coolant_gauge.current_value  = 70.0f;
    cg->coolant_gauge.target_value   = 70.0f;
    cg->coolant_gauge.velocity       = 0.0f;
    cg->coolant_gauge.damping_factor = 0.08f;
    cg->coolant_gauge.min_range      = 40.0f;
    cg->coolant_gauge.max_range      = 120.0f;

    /* Oil Pressure: 0 to 8 bar */
    cg->oil_gauge.current_value    = 4.5f;
    cg->oil_gauge.target_value     = 4.5f;
    cg->oil_gauge.velocity         = 0.0f;
    cg->oil_gauge.damping_factor   = 0.15f;
    cg->oil_gauge.min_range        = 0.0f;
    cg->oil_gauge.max_range        = 8.0f;

    cg->blinker_timer_ms = 0;
    cg->blinker_phase_1_5hz = false;
    cg->relay_click_triggered = false;
    cg->in_eco_band = false;
}

void Cluster_UpdateNeedleFilter(GaugeStepper_t *gauge, float target, float dt_seconds)
{
    if (!gauge) return;

    /* Clamp target to valid gauge limits */
    if (target < gauge->min_range) target = gauge->min_range;
    if (target > gauge->max_range) target = gauge->max_range;
    gauge->target_value = target;

    /* First-order exponential low-pass filter: y(t) = y(t-1) + alpha * (x(t) - y(t-1)) */
    float alpha = gauge->damping_factor;
    if (dt_seconds > 0.0f) {
        alpha = 1.0f - expf(-gauge->damping_factor * dt_seconds * 30.0f);
    }
    if (alpha > 1.0f) alpha = 1.0f;

    float delta = gauge->target_value - gauge->current_value;
    gauge->current_value += delta * alpha;

    /* Prevent asymptotic micro-jitter */
    if (fabsf(gauge->current_value - gauge->target_value) < 0.02f) {
        gauge->current_value = gauge->target_value;
    }
}

void Cluster_ProcessGauges(ClusterGauges_t *cg, const TruckClusterState_t *telemetry, float dt_seconds)
{
    if (!cg || !telemetry) return;

    Cluster_UpdateNeedleFilter(&cg->speed_gauge, telemetry->vehicle_speed_kmh, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->rpm_gauge, telemetry->engine_rpm, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->fuel_gauge, telemetry->fuel_level_pct, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->coolant_gauge, telemetry->coolant_temp_c, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->oil_gauge, telemetry->oil_pressure_bar, dt_seconds);

    /* Eco-band detection (1000 - 1600 RPM for maximum diesel torque and minimum specific fuel consumption) */
    cg->in_eco_band = (telemetry->engine_rpm >= 1000.0f && telemetry->engine_rpm <= 1600.0f);
}

void Cluster_ProcessTelltales(ClusterGauges_t *cg, TruckClusterState_t *telemetry, uint32_t elapsed_ms)
{
    if (!cg || !telemetry) return;

    cg->blinker_timer_ms += elapsed_ms;

    /* 1.5 Hz Turn Signal Frequency: Period = 1000ms / 1.5 = 666.6ms */
    /* Duty Cycle: 333ms ON / 333ms OFF */
    bool prev_phase = cg->blinker_phase_1_5hz;
    cg->blinker_phase_1_5hz = ((cg->blinker_timer_ms % 666U) < 333U);

    /* Detect edge transition for electromechanical relay click sound */
    cg->relay_click_triggered = (cg->blinker_phase_1_5hz != prev_phase) &&
                                (telemetry->turn_left_active || telemetry->turn_right_active || telemetry->hazard_active);

    /* Evaluate critical thresholds for warning lamps */
    telemetry->fuel_reserve_warning = (telemetry->fuel_level_pct <= 15.0f);
    telemetry->coolant_high_warning  = (telemetry->coolant_temp_c >= 102.0f);

    /* If coolant exceeds 108°C or oil pressure drops below 0.8 bar, escalate general fault */
    if (telemetry->coolant_temp_c > 108.0f || telemetry->oil_pressure_bar < 0.8f) {
        telemetry->general_fault_active = true;
        if (telemetry->oil_pressure_bar < 0.5f) {
            telemetry->red_stop_lamp = true;
        }
    }
}
