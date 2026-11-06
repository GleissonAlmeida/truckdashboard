/**
 * @file cluster_types.h
 * @brief Common Types and Data Structures for Truck Instrument Cluster Module (ICM)
 * @standards SAE J1939, ISO 11898-2 CAN 2.0B, OSEK/VDX 2.2.3
 */

#ifndef CLUSTER_TYPES_H
#define CLUSTER_TYPES_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define MAX_ACTIVE_DTCS         16U
#define CAN_FIFO_CAPACITY       64U

/**
 * Raw 29-bit CAN Frame Structure
 */
typedef struct {
    uint32_t can_id;      /**< 29-bit Extended Identifier */
    uint8_t  dlc;         /**< Data Length Code (typically 8) */
    uint8_t  data[8];     /**< Payload bytes */
    uint32_t timestamp_ms;/**< Reception timestamp in milliseconds */
} CanRawFrame_t;

/**
 * Parsed SAE J1939 29-bit Identifier Bitfields
 */
typedef struct {
    uint8_t  priority;       /**< 3 bits (0-7, 0 is highest) */
    uint8_t  edp;            /**< 1 bit: Extended Data Page */
    uint8_t  dp;             /**< 1 bit: Data Page */
    uint8_t  pf;             /**< 8 bits: PDU Format */
    uint8_t  ps;             /**< 8 bits: PDU Specific (DA or GE) */
    uint32_t pgn;            /**< 18 bits: Parameter Group Number */
    uint8_t  source_address; /**< 8 bits: Source Address (SA) */
    uint8_t  dest_address;   /**< 8 bits: Destination Address (PDU1) or 0xFF (PDU2) */
} J1939_Header_t;

/**
 * Diagnostic Trouble Code (DTC) according to SAE J1939-73 DM1
 */
typedef struct {
    uint32_t spn;              /**< Suspect Parameter Number (19 bits) */
    uint8_t  fmi;              /**< Failure Mode Identifier (5 bits) */
    uint8_t  occurrence_count; /**< Occurrence Count (7 bits) */
    uint8_t  severity;         /**< 0: Info, 1: Amber Warning, 2: Red Stop */
    char     description[48];  /**< Human-readable diagnostic description */
} DtcRecord_t;

/**
 * Active DTC Registry Buffer
 */
typedef struct {
    DtcRecord_t dtcs[MAX_ACTIVE_DTCS];
    uint8_t     count;
    uint32_t    last_clear_timestamp;
    bool        dm11_clear_requested;
} DtcRegistry_t;

/**
 * Primary Vehicle State Telemetry (Instrument Cluster Data Model)
 */
typedef struct {
    /* Primary Gauges requested by user */
    float    vehicle_speed_kmh;   /**< Speedometer: 0.0 - 140.0 km/h (SPN 84) */
    float    engine_rpm;          /**< Tachometer: 0.0 - 3000.0 RPM (SPN 190) */
    float    fuel_level_pct;      /**< Fuel Gauge: 0.0 - 100.0 % (SPN 96) */
    float    coolant_temp_c;      /**< Coolant Gauge: 40.0 - 120.0 °C (SPN 110) */

    /* Telltale Warning Lights requested by user */
    bool     turn_left_active;    /**< Indicador de Seta Esquerda (1.5 Hz) */
    bool     turn_right_active;   /**< Indicador de Seta Direita (1.5 Hz) */
    bool     hazard_active;       /**< Pisca-Alerta (Hazard Lights) */
    bool     mil_active;          /**< Indicador de Falha no Motor (Check Engine / MIL) */
    bool     general_fault_active;/**< Indicação de Falha Geral (Amber Warning / Stop Engine) */
    bool     red_stop_lamp;       /**< Parada Imediata (Red Stop Engine) */
    bool     amber_warning_lamp;  /**< Advertência Âmbar */

    /* Secondary Heavy Truck Telemetry */
    float    oil_pressure_bar;    /**< Engine Oil Pressure (SPN 100) */
    float    air_pressure_circuit1;/**< Brake Pneumatic Pressure Cir 1 (SPN 1087) */
    float    air_pressure_circuit2;/**< Brake Pneumatic Pressure Cir 2 (SPN 1088) */
    float    battery_voltage;     /**< System 24V Electrical Potential (SPN 168) */
    int8_t   current_gear;        /**< 0 = 'N', -1 = 'R', 1..12 = 1st..12th (SPN 523) */
    bool     parking_brake;       /**< Freio de estacionamento / mão */
    bool     high_beam;           /**< Farol alto */
    bool     cruise_control;      /**< Piloto automático ativo */
    bool     fuel_reserve_warning;/**< Combustível na reserva (<= 15%) */
    bool     coolant_high_warning;/**< Superaquecimento (> 102°C) */
    float    odometer_km;         /**< Total vehicle distance (SPN 245) */
    uint32_t last_update_ms;      /**< Timestamp of last CAN packet */
} TruckClusterState_t;

/**
 * Filtered Stepper Motor Gauge for Smooth Needle Dynamics
 */
typedef struct {
    float current_value; /**< Currently rendered needle position */
    float target_value;  /**< Target sensor value from CAN bus */
    float velocity;      /**< Dynamic needle velocity */
    float damping_factor;/**< IIR damping coefficient (e.g. 0.18f) */
    float min_range;     /**< Gauge lower limit */
    float max_range;     /**< Gauge upper limit */
} GaugeStepper_t;

#ifdef __cplusplus
}
#endif

#endif /* CLUSTER_TYPES_H */
