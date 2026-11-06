/**
 * @file cluster_gauges.h
 * @brief Needle Dynamics Smoothing, Telltales, and Warning Lamp Management
 */

#ifndef CLUSTER_GAUGES_H
#define CLUSTER_GAUGES_H

#include "cluster_types.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    GaugeStepper_t speed_gauge;
    GaugeStepper_t rpm_gauge;
    GaugeStepper_t fuel_gauge;
    GaugeStepper_t coolant_gauge;
    GaugeStepper_t oil_gauge;

    uint32_t blinker_timer_ms;
    bool     blinker_phase_1_5hz; /**< Flashes at 1.5 Hz (333ms on / 333ms off) */
    bool     relay_click_triggered;
    bool     in_eco_band;         /**< True when RPM is 1000-1600 */
} ClusterGauges_t;

void Cluster_InitGauges(ClusterGauges_t *cg);
void Cluster_UpdateNeedleFilter(GaugeStepper_t *gauge, float target, float dt_seconds);
void Cluster_ProcessGauges(ClusterGauges_t *cg, const TruckClusterState_t *telemetry, float dt_seconds);
void Cluster_ProcessTelltales(ClusterGauges_t *cg, TruckClusterState_t *telemetry, uint32_t elapsed_ms);

#ifdef __cplusplus
}
#endif

#endif /* CLUSTER_GAUGES_H */
