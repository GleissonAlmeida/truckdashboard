/**
 * @file j1939.h
 * @brief SAE J1939 Protocol Stack Engine Header for Heavy-Duty Vehicles
 * @standards SAE J1939-21 (Data Link Layer), SAE J1939-71 (Vehicle Application Layer),
 *            SAE J1939-73 (Diagnostics & Faults)
 */

#ifndef J1939_H
#define J1939_H

#include "cluster_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/* Standard SAE J1939 Parameter Group Numbers (PGNs) */
#define J1939_PGN_EEC1       61444U /* 0xF004: Electronic Engine Controller 1 (RPM, Torque) */
#define J1939_PGN_EEC2       61443U /* 0xF003: Electronic Engine Controller 2 (Throttle, Load) */
#define J1939_PGN_CCVS       65265U /* 0xFEF1: Cruise Control / Vehicle Speed */
#define J1939_PGN_ET1        65262U /* 0xFEEE: Engine Temperature 1 (Coolant, Oil Temp) */
#define J1939_PGN_DD         65276U /* 0xFEFC: Dash Display (Fuel Level 1) */
#define J1939_PGN_DM1        65226U /* 0xFECA: Active Diagnostic Trouble Codes & Lamps */
#define J1939_PGN_DM11       65235U /* 0xFED3: Clear/Reset Active Diagnostic Trouble Codes */
#define J1939_PGN_EFL_P1     65263U /* 0xFEEF: Engine Fluid Level/Pressure 1 (Oil Pressure) */
#define J1939_PGN_AIR1_2     65274U /* 0xFEFA: Pneumatic Supply Pressure (Brakes Cir 1 & 2) */
#define J1939_PGN_LIGHTING   65088U /* 0xFE40: Lighting & Turn Signal Status */
#define J1939_PGN_VEP        65271U /* 0xFEF7: Vehicle Electrical Power (Battery Potential) */
#define J1939_PGN_VD         65217U /* 0xFEC1: Vehicle Distance (High Resolution Odometer) */
#define J1939_PGN_ETC2       61445U /* 0xF005: Electronic Transmission Controller 2 (Gear) */

/* Known Source Addresses */
#define J1939_SA_ENGINE1     0x00U  /**< Engine #1 (ECU) */
#define J1939_SA_TRANSMISS   0x03U  /**< Transmission (TCU) */
#define J1939_SA_BRAKES      0x0BU  /**< Brakes / EBS Controller */
#define J1939_SA_CLUSTER     0x17U  /**< Instrument Cluster Module (ICM) */
#define J1939_SA_BODY        0x21U  /**< Body Control Module (BCM) */

/* 29-bit CAN ID parsing and creation */
void     J1939_ParseHeader(uint32_t can_id, J1939_Header_t *header);
uint32_t J1939_BuildCanId(uint8_t priority, uint32_t pgn, uint8_t source_address, uint8_t dest_address);
uint32_t J1939_ExtractPGN(uint32_t can_id);

/* PGN Decoders */
bool J1939_Decode_EEC1(const uint8_t *data, uint8_t dlc, float *out_rpm, float *out_torque);
bool J1939_Decode_CCVS(const uint8_t *data, uint8_t dlc, float *out_speed, bool *out_park_brake, bool *out_cruise);
bool J1939_Decode_ET1(const uint8_t *data, uint8_t dlc, float *out_coolant_temp, float *out_oil_temp);
bool J1939_Decode_DD(const uint8_t *data, uint8_t dlc, float *out_fuel_level);
bool J1939_Decode_EFL_P1(const uint8_t *data, uint8_t dlc, float *out_oil_pressure);
bool J1939_Decode_AIR(const uint8_t *data, uint8_t dlc, float *out_air1, float *out_air2);
bool J1939_Decode_LIGHTING(const uint8_t *data, uint8_t dlc, bool *out_turn_left, bool *out_turn_right, bool *out_hazard, bool *out_high_beam);
bool J1939_Decode_VEP(const uint8_t *data, uint8_t dlc, float *out_battery_v);
bool J1939_Decode_ETC2(const uint8_t *data, uint8_t dlc, int8_t *out_gear);
bool J1939_Decode_VD(const uint8_t *data, uint8_t dlc, float *out_odometer_km);

/* Diagnostic Messages Handling */
bool J1939_Process_DM1(const uint8_t *data, uint8_t dlc, TruckClusterState_t *state, DtcRegistry_t *dtc_reg);
void J1939_Process_DM11_Clear(TruckClusterState_t *state, DtcRegistry_t *dtc_reg);

/* Lookup Helpers */
const char* J1939_GetPgnName(uint32_t pgn);
const char* J1939_GetDtcDescription(uint32_t spn, uint8_t fmi);

#ifdef __cplusplus
}
#endif

#endif /* J1939_H */
