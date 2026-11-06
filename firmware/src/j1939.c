/**
 * @file j1939.c
 * @brief SAE J1939 Protocol Stack Engine Implementation
 */

#include "j1939.h"
#include <string.h>
#include <stdio.h>

void J1939_ParseHeader(uint32_t can_id, J1939_Header_t *header)
{
    if (!header) return;

    header->priority       = (uint8_t)((can_id >> 26U) & 0x07U);
    header->edp            = (uint8_t)((can_id >> 25U) & 0x01U);
    header->dp             = (uint8_t)((can_id >> 24U) & 0x01U);
    header->pf             = (uint8_t)((can_id >> 16U) & 0xFFU);
    header->ps             = (uint8_t)((can_id >> 8U) & 0xFFU);
    header->source_address = (uint8_t)(can_id & 0xFFU);

    if (header->pf < 240U) {
        /* PDU1: Peer-to-Peer */
        header->pgn = ((uint32_t)header->dp << 16U) | ((uint32_t)header->pf << 8U);
        header->dest_address = header->ps;
    } else {
        /* PDU2: Broadcast */
        header->pgn = ((uint32_t)header->dp << 16U) | ((uint32_t)header->pf << 8U) | (uint32_t)header->ps;
        header->dest_address = 0xFFU;
    }
}

uint32_t J1939_ExtractPGN(uint32_t can_id)
{
    uint8_t dp = (uint8_t)((can_id >> 24U) & 0x01U);
    uint8_t pf = (uint8_t)((can_id >> 16U) & 0xFFU);
    uint8_t ps = (uint8_t)((can_id >> 8U) & 0xFFU);

    if (pf < 240U) {
        return ((uint32_t)dp << 16U) | ((uint32_t)pf << 8U);
    } else {
        return ((uint32_t)dp << 16U) | ((uint32_t)pf << 8U) | (uint32_t)ps;
    }
}

uint32_t J1939_BuildCanId(uint8_t priority, uint32_t pgn, uint8_t source_address, uint8_t dest_address)
{
    uint8_t dp = (uint8_t)((pgn >> 16U) & 0x01U);
    uint8_t pf = (uint8_t)((pgn >> 8U) & 0xFFU);
    uint8_t ps = (pf < 240U) ? dest_address : (uint8_t)(pgn & 0xFFU);

    return (((uint32_t)(priority & 0x07U)) << 26U) |
           (((uint32_t)dp) << 24U) |
           (((uint32_t)pf) << 16U) |
           (((uint32_t)ps) << 8U)  |
           ((uint32_t)source_address);
}

bool J1939_Decode_EEC1(const uint8_t *data, uint8_t dlc, float *out_rpm, float *out_torque)
{
    if (!data || dlc < 5) return false;

    /* Byte 3-4: SPN 190 Engine Speed -> 0.125 rpm/bit, offset 0 */
    uint16_t raw_rpm = (uint16_t)data[3] | ((uint16_t)data[4] << 8U);
    if (raw_rpm <= 0xFA00U) {
        if (out_rpm) *out_rpm = (float)raw_rpm * 0.125f;
    }

    /* Byte 2: SPN 513 Actual Engine Percent Torque -> 1 %/bit, offset -125% */
    if (dlc >= 3 && out_torque) {
        *out_torque = (float)data[2] - 125.0f;
    }

    return true;
}

bool J1939_Decode_CCVS(const uint8_t *data, uint8_t dlc, float *out_speed, bool *out_park_brake, bool *out_cruise)
{
    if (!data || dlc < 3) return false;

    /* Byte 0 bits 3-4: Parking Brake Switch (01 = Parked/Set) */
    if (out_park_brake) {
        *out_park_brake = ((data[0] >> 2U) & 0x03U) == 0x01U;
    }

    /* Byte 1-2: SPN 84 Wheel-Based Vehicle Speed -> 1/256 km/h per bit */
    uint16_t raw_speed = (uint16_t)data[1] | ((uint16_t)data[2] << 8U);
    if (raw_speed <= 0xFA00U) {
        if (out_speed) *out_speed = (float)raw_speed / 256.0f;
    }

    /* Byte 3 bit 0: Cruise Control Active */
    if (dlc >= 4 && out_cruise) {
        *out_cruise = (data[3] & 0x01U) != 0U;
    }

    return true;
}

bool J1939_Decode_ET1(const uint8_t *data, uint8_t dlc, float *out_coolant_temp, float *out_oil_temp)
{
    if (!data || dlc < 1) return false;

    /* Byte 0: SPN 110 Engine Coolant Temperature -> 1 °C/bit, offset -40 °C */
    if (data[0] <= 0xFAU && out_coolant_temp) {
        *out_coolant_temp = (float)data[0] - 40.0f;
    }

    /* Byte 2-3: SPN 175 Engine Oil Temperature -> 0.03125 °C/bit, offset -273 °C */
    if (dlc >= 4 && out_oil_temp) {
        uint16_t raw = (uint16_t)data[2] | ((uint16_t)data[3] << 8U);
        if (raw <= 0xFA00U) {
            *out_oil_temp = ((float)raw * 0.03125f) - 273.0f;
        }
    }

    return true;
}

bool J1939_Decode_DD(const uint8_t *data, uint8_t dlc, float *out_fuel_level)
{
    if (!data || dlc < 2) return false;

    /* Byte 1: SPN 96 Fuel Level 1 -> 0.4 %/bit, 0 to 100% */
    if (data[1] <= 0xFAU && out_fuel_level) {
        *out_fuel_level = (float)data[1] * 0.4f;
    }

    return true;
}

bool J1939_Decode_EFL_P1(const uint8_t *data, uint8_t dlc, float *out_oil_pressure)
{
    if (!data || dlc < 4) return false;

    /* Byte 3: SPN 100 Engine Oil Pressure -> 4 kPa/bit = 0.04 bar/bit */
    if (data[3] <= 0xFAU && out_oil_pressure) {
        *out_oil_pressure = (float)data[3] * 0.04f;
    }

    return true;
}

bool J1939_Decode_AIR(const uint8_t *data, uint8_t dlc, float *out_air1, float *out_air2)
{
    if (!data || dlc < 4) return false;

    /* Byte 2: SPN 1087 Pneumatic Circuit 1 -> 8 kPa/bit = 0.08 bar/bit */
    if (data[2] <= 0xFAU && out_air1) {
        *out_air1 = (float)data[2] * 0.08f;
    }

    /* Byte 3: SPN 1088 Pneumatic Circuit 2 -> 8 kPa/bit = 0.08 bar/bit */
    if (data[3] <= 0xFAU && out_air2) {
        *out_air2 = (float)data[3] * 0.08f;
    }

    return true;
}

bool J1939_Decode_LIGHTING(const uint8_t *data, uint8_t dlc, bool *out_turn_left, bool *out_turn_right, bool *out_hazard, bool *out_high_beam)
{
    if (!data || dlc < 1) return false;

    /* Byte 0: bit 0 = Left turn, bit 1 = Right turn, bit 2 = Hazard */
    if (out_turn_left)  *out_turn_left  = (data[0] & 0x01U) != 0U;
    if (out_turn_right) *out_turn_right = (data[0] & 0x02U) != 0U;
    if (out_hazard)     *out_hazard     = (data[0] & 0x04U) != 0U;

    /* Byte 1: bit 0 = High beam */
    if (dlc >= 2 && out_high_beam) {
        *out_high_beam = (data[1] & 0x01U) != 0U;
    }

    return true;
}

bool J1939_Decode_VEP(const uint8_t *data, uint8_t dlc, float *out_battery_v)
{
    if (!data || dlc < 6) return false;

    /* Byte 4-5: SPN 168 Battery Potential -> 0.05 V/bit */
    uint16_t raw = (uint16_t)data[4] | ((uint16_t)data[5] << 8U);
    if (raw <= 0xFA00U && out_battery_v) {
        *out_battery_v = (float)raw * 0.05f;
    }

    return true;
}

bool J1939_Decode_ETC2(const uint8_t *data, uint8_t dlc, int8_t *out_gear)
{
    if (!data || dlc < 4) return false;

    /* Byte 3: SPN 523 Transmission Current Gear -> offset -125 */
    if (data[3] <= 0xFAU && out_gear) {
        *out_gear = (int8_t)((int16_t)data[3] - 125);
    }

    return true;
}

bool J1939_Decode_VD(const uint8_t *data, uint8_t dlc, float *out_odometer_km)
{
    if (!data || dlc < 4) return false;

    /* Byte 0-3: SPN 245 High Resolution Total Vehicle Distance -> 0.125 km/bit */
    uint32_t raw = (uint32_t)data[0] |
                   ((uint32_t)data[1] << 8U) |
                   ((uint32_t)data[2] << 16U) |
                   ((uint32_t)data[3] << 24U);
    if (raw != 0xFFFFFFFFU && out_odometer_km) {
        *out_odometer_km = (float)raw * 0.125f;
    }

    return true;
}

const char* J1939_GetDtcDescription(uint32_t spn, uint8_t fmi)
{
    if (spn == 110U && fmi == 0U) {
        return "Temp Arrefecimento Acima do Limite Máximo";
    }
    if (spn == 100U && fmi == 1U) {
        return "Pressão de Óleo Abaixo do Limite Crítico";
    }
    if (spn == 190U && fmi == 0U) {
        return "Sobre-rotação do Virabrequim (Over-rev)";
    }
    if (spn == 96U && fmi == 1U) {
        return "Nível de Combustível em Reserva Crítica";
    }
    if (spn == 1087U && fmi == 1U) {
        return "Baixa Pressão Pneumática de Freio Circuito 1";
    }
    if (spn == 168U && fmi == 1U) {
        return "Subtensão no Barramento Elétrico de 24V";
    }
    return "Falha de Diagnóstico Genérica SAE J1939";
}

bool J1939_Process_DM1(const uint8_t *data, uint8_t dlc, TruckClusterState_t *state, DtcRegistry_t *dtc_reg)
{
    if (!data || dlc < 2 || !state) return false;

    /* Byte 0: Diagnostic Lamp Status */
    /* bits 7-8: Malfunction Indicator Lamp (MIL / Check Engine) */
    uint8_t mil = (data[0] >> 6U) & 0x03U;
    /* bits 5-6: Red Stop Lamp (Parada Imediata) */
    uint8_t red_stop = (data[0] >> 4U) & 0x03U;
    /* bits 3-4: Amber Warning Lamp (Falha Geral / Advertência) */
    uint8_t amber_warn = (data[0] >> 2U) & 0x03U;

    state->mil_active           = (mil > 0U);
    state->red_stop_lamp        = (red_stop > 0U);
    state->amber_warning_lamp   = (amber_warn > 0U);
    state->general_fault_active = (red_stop > 0U) || (amber_warn > 0U);

    /* If all lamps are OFF (e.g. following DM11 Clear command), clear active DTCs */
    if (mil == 0U && red_stop == 0U && amber_warn == 0U) {
        if (dtc_reg) {
            dtc_reg->count = 0U;
        }
        return true;
    }

    /* Extract DTC block (Bytes 2-5): SPN (19b), FMI (5b), OC (7b) */
    if (dlc >= 6 && dtc_reg) {
        uint32_t spn = (uint32_t)data[2] |
                       ((uint32_t)data[3] << 8U) |
                       (((uint32_t)data[4] & 0xE0U) << 11U);
        uint8_t fmi = data[4] & 0x1FU;
        uint8_t oc  = data[5] & 0x7FU;

        if (spn > 0U && spn < 524287U) {
            /* Check if DTC already exists in registry */
            bool exists = false;
            for (uint8_t i = 0; i < dtc_reg->count; i++) {
                if (dtc_reg->dtcs[i].spn == spn && dtc_reg->dtcs[i].fmi == fmi) {
                    dtc_reg->dtcs[i].occurrence_count = oc;
                    exists = true;
                    break;
                }
            }

            /* Add new DTC if registry not full */
            if (!exists && dtc_reg->count < MAX_ACTIVE_DTCS) {
                DtcRecord_t *rec = &dtc_reg->dtcs[dtc_reg->count];
                rec->spn = spn;
                rec->fmi = fmi;
                rec->occurrence_count = oc;
                rec->severity = (red_stop > 0U) ? 2U : 1U;
                strncpy(rec->description, J1939_GetDtcDescription(spn, fmi), sizeof(rec->description) - 1);
                rec->description[sizeof(rec->description) - 1] = '\0';
                dtc_reg->count++;
            }
        }
    }

    return true;
}

void J1939_Process_DM11_Clear(TruckClusterState_t *state, DtcRegistry_t *dtc_reg)
{
    if (state) {
        state->mil_active           = false;
        state->general_fault_active = false;
        state->red_stop_lamp        = false;
        state->amber_warning_lamp   = false;
    }

    if (dtc_reg) {
        memset(dtc_reg->dtcs, 0, sizeof(dtc_reg->dtcs));
        dtc_reg->count = 0U;
        dtc_reg->dm11_clear_requested = true;
    }
}

const char* J1939_GetPgnName(uint32_t pgn)
{
    switch (pgn) {
        case J1939_PGN_EEC1:     return "EEC1 (Engine Speed & Torque)";
        case J1939_PGN_EEC2:     return "EEC2 (Throttle & Load)";
        case J1939_PGN_CCVS:     return "CCVS (Vehicle Speed & Brakes)";
        case J1939_PGN_ET1:      return "ET1 (Coolant & Oil Temp)";
        case J1939_PGN_DD:       return "DD (Fuel Level & Dash)";
        case J1939_PGN_DM1:      return "DM1 (Active DTCs & Lamps)";
        case J1939_PGN_DM11:     return "DM11 (Clear Active DTCs)";
        case J1939_PGN_EFL_P1:   return "EFL/P1 (Oil Pressure)";
        case J1939_PGN_AIR1_2:   return "AIR (Brake Pneumatic)";
        case J1939_PGN_LIGHTING: return "LIGHTING (Turn Signals)";
        case J1939_PGN_VEP:      return "VEP (Battery Potential)";
        case J1939_PGN_VD:       return "VD (Vehicle Distance)";
        case J1939_PGN_ETC2:     return "ETC2 (Transmission Gear)";
        default:                 return "PGN Unknown";
    }
}
