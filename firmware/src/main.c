/**
 * @file main.c
 * @brief Standalone Testbench and Embedded Main Entry for Truck Instrument Cluster in C
 * @standards OSEK/VDX 2.2.3, AUTOSAR OS 4.2, SAE J1939
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <math.h>

#include "tpl_os.h"
#include "cluster_tasks.h"
#include "j1939.h"

/* Simple POSIX emulation of OSEK primitives when compiling without goil */
static uint8_t g_current_ceiling_priority = 0;

StatusType GetResource(ResourceType ResID)
{
    if (ResID == RES_CAN_FIFO)      g_current_ceiling_priority = 20;
    else if (ResID == RES_VEHICLE_STATE) g_current_ceiling_priority = 16;
    else if (ResID == RES_DTC_LIST)      g_current_ceiling_priority = 10;
    return E_OK;
}

StatusType ReleaseResource(ResourceType ResID)
{
    (void)ResID;
    g_current_ceiling_priority = 0;
    return E_OK;
}

StatusType TerminateTask(void)
{
    return E_OK;
}

StatusType ActivateTask(TaskType TaskID)
{
    (void)TaskID;
    return E_OK;
}

/**
 * Render ANSI Terminal Truck Instrument Cluster Dashboard
 */
static void RenderTerminalDashboard(uint32_t sim_time_ms)
{
    const TruckClusterState_t *s = Cluster_GetTelemetryReadonly();
    const ClusterGauges_t *g = Cluster_GetGaugesReadonly();
    const DtcRegistry_t *dtc = Cluster_GetDtcRegistryReadonly();

    printf("\033[H\033[J"); /* Clear terminal screen */
    printf("================================================================================\n");
    printf("       SIMULADOR DE INSTRUMENT CLUSTER DE CAMINHÃO - TRAMPOLINE RTOS (C)        \n");
    printf("================================================================================\n");
    printf(" Tempo Simulado: %6.2f s | Trampoline OSEK OS: ATIVO | Prioridade Teto: %2d\n",
           (float)sim_time_ms / 1000.0f, g_current_ceiling_priority);
    printf("--------------------------------------------------------------------------------\n");

    /* Dials & Gauges */
    printf(" [VELOCÍMETRO]                   [CONTA-GIROS / TACÔMETRO]\n");
    printf("  Alvo:   %5.1f km/h              Alvo:   %5.0f RPM\n", s->vehicle_speed_kmh, s->engine_rpm);
    printf("  Agulha: %5.1f km/h              Agulha: %5.0f RPM %s\n",
           g->speed_gauge.current_value, g->rpm_gauge.current_value,
           g->in_eco_band ? "[FAIXA VERDE ECO]" : "");
    printf("\n");

    printf(" [NÍVEL DE COMBUSTÍVEL]          [TEMPERATURA ARREFECIMENTO]\n");
    printf("  Diesel: %5.1f %% %s             Temp:   %5.1f °C %s\n",
           s->fuel_level_pct, s->fuel_reserve_warning ? "[RESERVA CRÍTICA!]" : "",
           s->coolant_temp_c, s->coolant_high_warning ? "[SUPERAQUECIMENTO!]" : "");
    printf("\n");

    /* Telltale Status */
    printf(" [LÂMPADAS DE ADVERTÊNCIA / TELLTALES]\n");
    printf("  Seta Esquerda : %s               Seta Direita  : %s\n",
           (s->turn_left_active && g->blinker_phase_1_5hz) ? "\033[32m[<-- LIGADA]\033[0m" : "[    OFF   ]",
           (s->turn_right_active && g->blinker_phase_1_5hz) ? "\033[32m[LIGADA -->]\033[0m" : "[    OFF   ]");
    printf("  Check Engine  : %s               Falha Geral   : %s\n",
           s->mil_active ? "\033[33m[MIL ATIVA]\033[0m" : "[    OFF   ]",
           s->general_fault_active ? (s->red_stop_lamp ? "\033[31;1m[STOP ENGINE]\033[0m" : "\033[33m[ALERTA ÂMBAR]\033[0m") : "[    OFF   ]");
    printf("  Pisca-Alerta  : %s               Farol Alto    : %s\n",
           s->hazard_active ? "[ ATIVO ]" : "[  OFF  ]",
           s->high_beam ? "[ ATIVO ]" : "[  OFF  ]");
    printf("\n");

    /* TFT Multi-Display */
    printf(" [DISPLAY TFT CENTRAL]\n");
    printf("  Marcha AMT: %2d  |  Pressão Óleo: %4.2f bar  |  Bateria: %4.1f V\n",
           s->current_gear, s->oil_pressure_bar, s->battery_voltage);
    printf("  Freio Pneumático Cir 1: %4.2f bar  |  Cir 2: %4.2f bar  |  Hodômetro: %8.1f km\n",
           s->air_pressure_circuit1, s->air_pressure_circuit2, s->odometer_km);
    printf("--------------------------------------------------------------------------------\n");

    /* Active DTCs */
    printf(" [FALHAS DIAGNÓSTICO J1939 DM1 - TOTAL: %d]\n", dtc->count);
    if (dtc->count == 0) {
        printf("  Nenhum código de falha ativo (Buffer limpo via DM11 ou nominal)\n");
    } else {
        for (uint8_t i = 0; i < dtc->count; i++) {
            printf("  * SPN %6u, FMI %2u (OC: %2u) - %s [%s]\n",
                   dtc->dtcs[i].spn, dtc->dtcs[i].fmi, dtc->dtcs[i].occurrence_count,
                   dtc->dtcs[i].description,
                   dtc->dtcs[i].severity == 2 ? "VERMELHO/STOP" : "ÂMBAR/AVISO");
        }
    }
    printf("================================================================================\n");
    fflush(stdout);
}

/**
 * Synthetic 150-second J1939 frame generator for testbench
 */
static void GenerateSimulationFramesAtTimestamp(uint32_t t_ms)
{
    float t = (float)t_ms / 1000.0f;
    CanRawFrame_t frame;
    frame.timestamp_ms = t_ms;
    frame.dlc = 8;

    /* Profile Variables */
    float speed = 0.0f;
    float rpm = 650.0f;
    int8_t gear = 0;
    float fuel = 52.0f;
    float temp = 72.0f;
    float oil = 4.3f;
    uint8_t turn_byte = 0x00;
    uint8_t mil = 0, red_stop = 0, amber_warn = 0;
    uint8_t dtc_bytes[4] = {0, 0, 0, 0};

    if (t < 12.0f) {
        speed = 0.0f; rpm = 650.0f; gear = 0; fuel = 52.0f; temp = 70.0f; oil = 4.2f;
    } else if (t < 32.0f) {
        float tr = t - 12.0f;
        speed = tr * 2.25f;
        rpm = 1100.0f + tr * 25.0f;
        gear = 1 + (int8_t)(tr / 3.5f);
        if (t >= 13.0f && t < 24.0f) turn_byte = 0x01; /* Left blinker */
        temp = 74.0f + tr * 0.4f;
    } else if (t < 60.0f) {
        float tr = t - 32.0f;
        speed = 45.0f + tr * 1.55f; if (speed > 88.0f) speed = 88.0f;
        gear = 12;
        rpm = 1280.0f; /* Green eco-band */
        temp = 86.0f;
        oil = 4.6f;
    } else if (t < 82.0f) {
        float tr = t - 60.0f;
        gear = 8;
        rpm = 1950.0f;
        speed = 52.0f;
        temp = 87.0f + tr * 1.15f; /* Overheat */
        if (t >= 71.0f) {
            mil = 1; amber_warn = 1;
            dtc_bytes[0] = 0x6E; dtc_bytes[1] = 0x00; dtc_bytes[2] = 0x00; dtc_bytes[3] = 0x01; /* SPN 110 FMI 0 */
        }
    } else if (t < 102.0f) {
        gear = 6; speed = 35.0f; rpm = 1300.0f;
        if (t >= 84.0f) {
            oil = 0.35f; /* Oil drop */
            mil = 1; red_stop = 1; amber_warn = 1;
            dtc_bytes[0] = 0x64; dtc_bytes[1] = 0x00; dtc_bytes[2] = 0x01; dtc_bytes[3] = 0x01; /* SPN 100 FMI 1 */
        }
    } else if (t < 122.0f) {
        if (t < 110.0f) { turn_byte = 0x02; speed = 10.0f; }
        else { turn_byte = 0x04; speed = 0.0f; gear = 0; }
        fuel = 12.0f; /* Critical reserve */
        oil = 0.35f; mil = 1; red_stop = 1; amber_warn = 1;
    } else {
        /* DM11 Clear phase at t=128s */
        fuel = 12.0f; temp = 84.0f; oil = 4.3f;
        if (t >= 128.0f) {
            mil = 0; red_stop = 0; amber_warn = 0;
            memset(dtc_bytes, 0, sizeof(dtc_bytes));
        } else {
            mil = 1; red_stop = 1; amber_warn = 1;
        }
        turn_byte = (t < 135.0f) ? 0x04 : 0x00;
        gear = (t >= 138.0f && t < 144.0f) ? -1 : 1;
    }

    /* Send EEC1 (every 50ms) */
    if (t_ms % 50U == 0U) {
        uint16_t raw_rpm = (uint16_t)(rpm / 0.125f);
        frame.can_id = J1939_BuildCanId(3, J1939_PGN_EEC1, 0x00, 0xFF);
        frame.data[0] = 0x0F; frame.data[1] = 0x7D; frame.data[2] = 0x80;
        frame.data[3] = (uint8_t)(raw_rpm & 0xFF);
        frame.data[4] = (uint8_t)((raw_rpm >> 8) & 0xFF);
        frame.data[5] = 0xFF; frame.data[6] = 0xFF; frame.data[7] = 0xFF;
        ISR2_CanRx_Handler(&frame);
    }

    /* Send CCVS (every 100ms) */
    if (t_ms % 100U == 0U) {
        uint16_t raw_spd = (uint16_t)(speed * 256.0f);
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_CCVS, 0x00, 0xFF);
        frame.data[0] = (speed == 0.0f) ? 0x04 : 0x00;
        frame.data[1] = (uint8_t)(raw_spd & 0xFF);
        frame.data[2] = (uint8_t)((raw_spd >> 8) & 0xFF);
        frame.data[3] = 0x00; frame.data[4] = 0x55;
        frame.data[5] = 0xFF; frame.data[6] = 0xFF; frame.data[7] = 0xFF;
        ISR2_CanRx_Handler(&frame);
    }

    /* Send LIGHTING (every 100ms) */
    if (t_ms % 100U == 0U) {
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_LIGHTING, 0x21, 0xFF);
        frame.data[0] = turn_byte;
        frame.data[1] = 0x00;
        ISR2_CanRx_Handler(&frame);
    }

    /* Send ET1 (every 200ms) */
    if (t_ms % 200U == 0U) {
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_ET1, 0x00, 0xFF);
        frame.data[0] = (uint8_t)(temp + 40.0f);
        frame.data[1] = 0x50; frame.data[2] = 0x60; frame.data[3] = 0x1F;
        ISR2_CanRx_Handler(&frame);
    }

    /* Send EFL/P1 (every 200ms) */
    if (t_ms % 200U == 0U) {
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_EFL_P1, 0x00, 0xFF);
        frame.data[3] = (uint8_t)(oil / 0.04f);
        ISR2_CanRx_Handler(&frame);
    }

    /* Send DM1 (every 500ms) */
    if (t_ms % 500U == 0U) {
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_DM1, 0x00, 0xFF);
        frame.data[0] = (uint8_t)((mil << 6) | (red_stop << 4) | (amber_warn << 2));
        frame.data[1] = 0xFF;
        frame.data[2] = dtc_bytes[0]; frame.data[3] = dtc_bytes[1];
        frame.data[4] = dtc_bytes[2]; frame.data[5] = dtc_bytes[3];
        frame.data[6] = 0xFF; frame.data[7] = 0xFF;
        ISR2_CanRx_Handler(&frame);
    }

    /* Send DD (every 1000ms) */
    if (t_ms % 1000U == 0U) {
        frame.can_id = J1939_BuildCanId(6, J1939_PGN_DD, 0x17, 0xFF);
        frame.data[1] = (uint8_t)(fuel / 0.4f);
        ISR2_CanRx_Handler(&frame);
    }

    /* Send ETC2 (every 200ms) */
    if (t_ms % 200U == 0U) {
        frame.can_id = J1939_BuildCanId(3, J1939_PGN_ETC2, 0x03, 0xFF);
        frame.data[3] = (uint8_t)(gear + 125);
        ISR2_CanRx_Handler(&frame);
    }
}

/**
 * Main Entry Point for Embedded C / Standalone Testbench
 */
int main(int argc, char *argv[])
{
    (void)argc;
    (void)argv;

    printf("Iniciando Firmware do Instrument Cluster em C com Trampoline RTOS...\n");
    StartupHook();

    uint32_t sim_clock_ms = 0;
    const uint32_t step_ms = 10; /* 10 ms base scheduling tick */

    /* Run demonstration testbench */
    while (sim_clock_ms <= 150000U) /* 150 seconds = 2m30s */
    {
        /* 1. Generate CAN Bus Stimuli */
        GenerateSimulationFramesAtTimestamp(sim_clock_ms);

        /* 2. Run OSEK Alarms and Task Executions according to periods */
        if (sim_clock_ms % 10U == 0U) {
            Task_CanRx_func();
        }

        if (sim_clock_ms % 20U == 0U) {
            Task_J1939_Decode_func();
        }

        if (sim_clock_ms % 33U == 0U) {
            Task_Cluster_Gauges_func();
        }

        if (sim_clock_ms % 50U == 0U) {
            Task_Warning_Lamps_func();
        }

        if (sim_clock_ms % 100U == 0U) {
            Task_Diagnostics_DM1_func();
        }

        /* 3. Refresh display dashboard periodically (every 200ms) */
        if (sim_clock_ms % 200U == 0U) {
            RenderTerminalDashboard(sim_clock_ms);
        }

        sim_clock_ms += step_ms;
    }

    printf("\nSimulação concluída com sucesso (150 segundos).\n");
    ShutdownHook(E_OK);
    return 0;
}
