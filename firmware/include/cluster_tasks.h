/**
 * @file cluster_tasks.h
 * @brief OSEK/VDX Trampoline RTOS Tasks, Resources, and Alarms Definitions
 */

#ifndef CLUSTER_TASKS_H
#define CLUSTER_TASKS_H

#include "tpl_os.h"
#include "cluster_types.h"
#include "can_queue.h"
#include "cluster_gauges.h"
#include "j1939.h"

#ifdef __cplusplus
extern "C" {
#endif

/* OSEK Resource Identifiers (Configured with Priority Ceiling Protocol) */
#define RES_CAN_FIFO          1U  /**< Priority Ceiling = 20 */
#define RES_VEHICLE_STATE     2U  /**< Priority Ceiling = 16 */
#define RES_DTC_LIST          3U  /**< Priority Ceiling = 10 */

/* OSEK Task Declarations */
DeclareTask(Task_CanRx);
DeclareTask(Task_J1939_Decode);
DeclareTask(Task_Cluster_Gauges);
DeclareTask(Task_Warning_Lamps);
DeclareTask(Task_Diagnostics_DM1);

/* ISR Declarations */
void ISR2_CanRx_Handler(const CanRawFrame_t *frame);

/* Cluster System APIs */
void Cluster_System_Init(void);
void Cluster_System_Reset(void);
void Cluster_System_TriggerDM11_Clear(void);
const TruckClusterState_t* Cluster_GetTelemetryReadonly(void);
const ClusterGauges_t* Cluster_GetGaugesReadonly(void);
const DtcRegistry_t* Cluster_GetDtcRegistryReadonly(void);

#ifdef __cplusplus
}
#endif

#endif /* CLUSTER_TASKS_H */
