/**
 * @file cluster_tasks.c
 * @brief OSEK/VDX Trampoline RTOS Tasks Implementation for Truck Instrument Cluster
 * @standards OSEK/VDX 2.2.3, AUTOSAR OS 4.2, SAE J1939
 */

#include "cluster_tasks.h"
#include <string.h>

/* Global RTOS Protected State Variables */
static TruckClusterState_t g_telemetry_state;
static CanRingBuffer_t     g_can_rx_fifo;
static DtcRegistry_t       g_dtc_registry;
static ClusterGauges_t     g_gauges_state;

/**
 * StartupHook: Called by Trampoline OS before entering multitasking
 */
void StartupHook(void)
{
    Cluster_System_Init();
}

void ShutdownHook(StatusType Error)
{
    (void)Error;
}

void ErrorHook(StatusType Error)
{
    (void)Error;
}

void Cluster_System_Init(void)
{
    memset(&g_telemetry_state, 0, sizeof(g_telemetry_state));
    g_telemetry_state.engine_rpm          = 650.0f;  /* Idle RPM */
    g_telemetry_state.fuel_level_pct      = 52.0f;
    g_telemetry_state.coolant_temp_c      = 72.0f;
    g_telemetry_state.oil_pressure_bar    = 4.2f;
    g_telemetry_state.air_pressure_circuit1 = 9.8f;
    g_telemetry_state.air_pressure_circuit2 = 9.6f;
    g_telemetry_state.battery_voltage     = 28.0f;
    g_telemetry_state.parking_brake       = true;
    g_telemetry_state.odometer_km         = 345210.0f;

    CanQueue_Init(&g_can_rx_fifo);
    memset(&g_dtc_registry, 0, sizeof(g_dtc_registry));
    Cluster_InitGauges(&g_gauges_state);
}

void Cluster_System_Reset(void)
{
    GetResource(RES_CAN_FIFO);
    CanQueue_Init(&g_can_rx_fifo);
    ReleaseResource(RES_CAN_FIFO);

    GetResource(RES_VEHICLE_STATE);
    Cluster_System_Init();
    ReleaseResource(RES_VEHICLE_STATE);

    GetResource(RES_DTC_LIST);
    memset(&g_dtc_registry, 0, sizeof(g_dtc_registry));
    ReleaseResource(RES_DTC_LIST);
}

void Cluster_System_TriggerDM11_Clear(void)
{
    GetResource(RES_VEHICLE_STATE);
    GetResource(RES_DTC_LIST);

    J1939_Process_DM11_Clear(&g_telemetry_state, &g_dtc_registry);

    ReleaseResource(RES_DTC_LIST);
    ReleaseResource(RES_VEHICLE_STATE);
}

/**
 * ISR2_CanRx: Category 2 Interrupt Service Routine for CAN Reception
 */
void ISR2_CanRx_Handler(const CanRawFrame_t *frame)
{
    if (!frame) return;

    /* Enqueue frame to FIFO protected by resource RES_CAN_FIFO */
    GetResource(RES_CAN_FIFO);
    CanQueue_Push(&g_can_rx_fifo, frame);
    ReleaseResource(RES_CAN_FIFO);
}

/**
 * Task_CanRx: Hardware/Driver Ingestion and Queue Integrity Check
 * Priority: 20 (Highest Task Priority)
 * Period: 10 ms
 * WCET: 1.2 ms
 */
TASK(Task_CanRx)
{
    /* Poll and check CAN controller hardware FIFO */
    GetResource(RES_CAN_FIFO);
    /* In a real physical target, this task reads the CAN mailboxes / Rx buffers */
    uint16_t pending = CanQueue_GetCount(&g_can_rx_fifo);
    (void)pending;
    ReleaseResource(RES_CAN_FIFO);

    TerminateTask();
}

/**
 * Task_J1939_Decode: Protocol Stack and PGN Demultiplexer
 * Priority: 16
 * Period: 20 ms
 * WCET: 2.8 ms
 */
TASK(Task_J1939_Decode)
{
    CanRawFrame_t frame;
    uint32_t pgn;

    GetResource(RES_CAN_FIFO);
    while (CanQueue_Pop(&g_can_rx_fifo, &frame))
    {
        ReleaseResource(RES_CAN_FIFO);

        pgn = J1939_ExtractPGN(frame.can_id);

        GetResource(RES_VEHICLE_STATE);
        switch (pgn)
        {
            case J1939_PGN_EEC1: {
                float rpm = 0.0f, torque = 0.0f;
                if (J1939_Decode_EEC1(frame.data, frame.dlc, &rpm, &torque)) {
                    g_telemetry_state.engine_rpm = rpm;
                }
                break;
            }

            case J1939_PGN_CCVS: {
                float speed = 0.0f;
                bool park_brake = false, cruise = false;
                if (J1939_Decode_CCVS(frame.data, frame.dlc, &speed, &park_brake, &cruise)) {
                    g_telemetry_state.vehicle_speed_kmh = speed;
                    g_telemetry_state.parking_brake     = park_brake;
                    g_telemetry_state.cruise_control   = cruise;
                }
                break;
            }

            case J1939_PGN_ET1: {
                float coolant = 0.0f, oil_t = 0.0f;
                if (J1939_Decode_ET1(frame.data, frame.dlc, &coolant, &oil_t)) {
                    g_telemetry_state.coolant_temp_c = coolant;
                }
                break;
            }

            case J1939_PGN_DD: {
                float fuel = 0.0f;
                if (J1939_Decode_DD(frame.data, frame.dlc, &fuel)) {
                    g_telemetry_state.fuel_level_pct = fuel;
                }
                break;
            }

            case J1939_PGN_EFL_P1: {
                float oil_p = 0.0f;
                if (J1939_Decode_EFL_P1(frame.data, frame.dlc, &oil_p)) {
                    g_telemetry_state.oil_pressure_bar = oil_p;
                }
                break;
            }

            case J1939_PGN_AIR1_2: {
                float air1 = 0.0f, air2 = 0.0f;
                if (J1939_Decode_AIR(frame.data, frame.dlc, &air1, &air2)) {
                    g_telemetry_state.air_pressure_circuit1 = air1;
                    g_telemetry_state.air_pressure_circuit2 = air2;
                }
                break;
            }

            case J1939_PGN_LIGHTING: {
                bool left = false, right = false, hazard = false, high_beam = false;
                if (J1939_Decode_LIGHTING(frame.data, frame.dlc, &left, &right, &hazard, &high_beam)) {
                    g_telemetry_state.turn_left_active  = left;
                    g_telemetry_state.turn_right_active = right;
                    g_telemetry_state.hazard_active     = hazard;
                    g_telemetry_state.high_beam         = high_beam;
                }
                break;
            }

            case J1939_PGN_VEP: {
                float volt = 0.0f;
                if (J1939_Decode_VEP(frame.data, frame.dlc, &volt)) {
                    g_telemetry_state.battery_voltage = volt;
                }
                break;
            }

            case J1939_PGN_ETC2: {
                int8_t gear = 0;
                if (J1939_Decode_ETC2(frame.data, frame.dlc, &gear)) {
                    g_telemetry_state.current_gear = gear;
                }
                break;
            }

            case J1939_PGN_VD: {
                float odo = 0.0f;
                if (J1939_Decode_VD(frame.data, frame.dlc, &odo)) {
                    g_telemetry_state.odometer_km = odo;
                }
                break;
            }

            case J1939_PGN_DM1: {
                GetResource(RES_DTC_LIST);
                J1939_Process_DM1(frame.data, frame.dlc, &g_telemetry_state, &g_dtc_registry);
                ReleaseResource(RES_DTC_LIST);
                break;
            }

            case J1939_PGN_DM11: {
                GetResource(RES_DTC_LIST);
                J1939_Process_DM11_Clear(&g_telemetry_state, &g_dtc_registry);
                ReleaseResource(RES_DTC_LIST);
                break;
            }

            default:
                break;
        }

        g_telemetry_state.last_update_ms = frame.timestamp_ms;
        ReleaseResource(RES_VEHICLE_STATE);

        GetResource(RES_CAN_FIFO);
    }
    ReleaseResource(RES_CAN_FIFO);

    TerminateTask();
}

/**
 * Task_Cluster_Gauges: Stepper Motor Physics and Low-Pass Smoothing
 * Priority: 12
 * Period: 33 ms (~30 FPS)
 * WCET: 4.5 ms
 */
TASK(Task_Cluster_Gauges)
{
    TruckClusterState_t local_state;

    GetResource(RES_VEHICLE_STATE);
    local_state = g_telemetry_state;
    ReleaseResource(RES_VEHICLE_STATE);

    /* Update gauge stepping with 33ms delta time */
    Cluster_ProcessGauges(&g_gauges_state, &local_state, 0.033f);

    TerminateTask();
}

/**
 * Task_Warning_Lamps: 1.5 Hz Blinker Timing, Debouncing, and Tell-Tales
 * Priority: 10
 * Period: 50 ms
 * WCET: 1.5 ms
 */
TASK(Task_Warning_Lamps)
{
    GetResource(RES_VEHICLE_STATE);

    Cluster_ProcessTelltales(&g_gauges_state, &g_telemetry_state, 50U);

    ReleaseResource(RES_VEHICLE_STATE);

    TerminateTask();
}

/**
 * Task_Diagnostics_DM1: Periodic Diagnostic Manager and Memory Retention
 * Priority: 6
 * Period: 100 ms
 * WCET: 2.0 ms
 */
TASK(Task_Diagnostics_DM1)
{
    GetResource(RES_DTC_LIST);

    /* Check if DM11 clear was requested */
    if (g_dtc_registry.dm11_clear_requested) {
        g_dtc_registry.dm11_clear_requested = false;
    }

    ReleaseResource(RES_DTC_LIST);

    TerminateTask();
}

const TruckClusterState_t* Cluster_GetTelemetryReadonly(void)
{
    return &g_telemetry_state;
}

const ClusterGauges_t* Cluster_GetGaugesReadonly(void)
{
    return &g_gauges_state;
}

const DtcRegistry_t* Cluster_GetDtcRegistryReadonly(void)
{
    return &g_dtc_registry;
}
