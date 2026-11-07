import React, { useState } from 'react';
import { Copy, Check, FileCode, Code, Download, Terminal, FolderTree } from 'lucide-react';

interface TrampolineCodeViewerProps {
  oilCode: string;
  cCode: string;
  theme?: 'light' | 'dark';
}

export const TrampolineCodeViewer: React.FC<TrampolineCodeViewerProps> = ({ oilCode, cCode, theme = 'light' }) => {
  const isLight = theme === 'light';
  const [activeFileId, setActiveFileId] = useState<
    'tasks_c' | 'oil' | 'j1939_c' | 'j1939_h' | 'gauges_c' | 'main_c' | 'types_h' | 'queue_c' | 'makefile'
  >('tasks_c');
  const [copied, setCopied] = useState(false);

  const j1939Header = `/**
 * @file j1939.h
 * @brief SAE J1939 Protocol Stack Engine Header for Heavy-Duty Vehicles
 * @standards SAE J1939-21, SAE J1939-71, SAE J1939-73
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

#ifdef __cplusplus
}
#endif

#endif /* J1939_H */`;

  const j1939Source = `/**
 * @file j1939.c
 * @brief SAE J1939 Protocol Stack Engine Implementation
 */

#include "j1939.h"
#include <string.h>

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

bool J1939_Decode_EEC1(const uint8_t *data, uint8_t dlc, float *out_rpm, float *out_torque)
{
    if (!data || dlc < 5) return false;
    uint16_t raw_rpm = (uint16_t)data[3] | ((uint16_t)data[4] << 8U);
    if (raw_rpm <= 0xFA00U && out_rpm) *out_rpm = (float)raw_rpm * 0.125f;
    if (dlc >= 3 && out_torque) *out_torque = (float)data[2] - 125.0f;
    return true;
}

bool J1939_Decode_CCVS(const uint8_t *data, uint8_t dlc, float *out_speed, bool *out_park_brake, bool *out_cruise)
{
    if (!data || dlc < 3) return false;
    if (out_park_brake) *out_park_brake = ((data[0] >> 2U) & 0x03U) == 0x01U;
    uint16_t raw_speed = (uint16_t)data[1] | ((uint16_t)data[2] << 8U);
    if (raw_speed <= 0xFA00U && out_speed) *out_speed = (float)raw_speed / 256.0f;
    if (dlc >= 4 && out_cruise) *out_cruise = (data[3] & 0x01U) != 0U;
    return true;
}

bool J1939_Decode_ET1(const uint8_t *data, uint8_t dlc, float *out_coolant_temp, float *out_oil_temp)
{
    if (!data || dlc < 1) return false;
    if (data[0] <= 0xFAU && out_coolant_temp) *out_coolant_temp = (float)data[0] - 40.0f;
    return true;
}

bool J1939_Decode_DD(const uint8_t *data, uint8_t dlc, float *out_fuel_level)
{
    if (!data || dlc < 2) return false;
    if (data[1] <= 0xFAU && out_fuel_level) *out_fuel_level = (float)data[1] * 0.4f;
    return true;
}

bool J1939_Decode_EFL_P1(const uint8_t *data, uint8_t dlc, float *out_oil_pressure)
{
    if (!data || dlc < 4) return false;
    if (data[3] <= 0xFAU && out_oil_pressure) *out_oil_pressure = (float)data[3] * 0.04f;
    return true;
}

bool J1939_Process_DM1(const uint8_t *data, uint8_t dlc, TruckClusterState_t *state, DtcRegistry_t *dtc_reg)
{
    if (!data || dlc < 2 || !state) return false;

    uint8_t mil        = (data[0] >> 6U) & 0x03U;
    uint8_t red_stop   = (data[0] >> 4U) & 0x03U;
    uint8_t amber_warn = (data[0] >> 2U) & 0x03U;

    state->mil_active           = (mil > 0U);
    state->red_stop_lamp        = (red_stop > 0U);
    state->amber_warning_lamp   = (amber_warn > 0U);
    state->general_fault_active = (red_stop > 0U) || (amber_warn > 0U);

    if (mil == 0U && red_stop == 0U && amber_warn == 0U) {
        if (dtc_reg) dtc_reg->count = 0U;
        return true;
    }

    if (dlc >= 6 && dtc_reg) {
        uint32_t spn = (uint32_t)data[2] | ((uint32_t)data[3] << 8U) | (((uint32_t)data[4] & 0xE0U) << 11U);
        uint8_t fmi  = data[4] & 0x1FU;
        uint8_t oc   = data[5] & 0x7FU;

        if (spn > 0U && dtc_reg->count < MAX_ACTIVE_DTCS) {
            DtcRecord_t *rec = &dtc_reg->dtcs[dtc_reg->count++];
            rec->spn = spn;
            rec->fmi = fmi;
            rec->occurrence_count = oc;
            rec->severity = (red_stop > 0U) ? 2U : 1U;
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
}`;

  const gaugesSource = `/**
 * @file cluster_gauges.c
 * @brief Needle Dynamics, Low-pass IIR Damping, and Telltale State Machine
 */

#include "cluster_gauges.h"
#include <math.h>

void Cluster_UpdateNeedleFilter(GaugeStepper_t *gauge, float target, float dt_seconds)
{
    if (!gauge) return;
    if (target < gauge->min_range) target = gauge->min_range;
    if (target > gauge->max_range) target = gauge->max_range;
    gauge->target_value = target;

    float alpha = gauge->damping_factor;
    if (dt_seconds > 0.0f) {
        alpha = 1.0f - expf(-gauge->damping_factor * dt_seconds * 30.0f);
    }
    if (alpha > 1.0f) alpha = 1.0f;

    gauge->current_value += (gauge->target_value - gauge->current_value) * alpha;
}

void Cluster_ProcessGauges(ClusterGauges_t *cg, const TruckClusterState_t *telemetry, float dt_seconds)
{
    if (!cg || !telemetry) return;
    Cluster_UpdateNeedleFilter(&cg->speed_gauge, telemetry->vehicle_speed_kmh, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->rpm_gauge, telemetry->engine_rpm, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->fuel_gauge, telemetry->fuel_level_pct, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->coolant_gauge, telemetry->coolant_temp_c, dt_seconds);
    Cluster_UpdateNeedleFilter(&cg->oil_gauge, telemetry->oil_pressure_bar, dt_seconds);

    /* Eco-band detection (1000 - 1600 RPM) */
    cg->in_eco_band = (telemetry->engine_rpm >= 1000.0f && telemetry->engine_rpm <= 1600.0f);
}

void Cluster_ProcessTelltales(ClusterGauges_t *cg, TruckClusterState_t *telemetry, uint32_t elapsed_ms)
{
    if (!cg || !telemetry) return;
    cg->blinker_timer_ms += elapsed_ms;

    /* 1.5 Hz Frequency (333ms on / 333ms off) */
    cg->blinker_phase_1_5hz = ((cg->blinker_timer_ms % 666U) < 333U);

    telemetry->fuel_reserve_warning = (telemetry->fuel_level_pct <= 15.0f);
    telemetry->coolant_high_warning  = (telemetry->coolant_temp_c >= 102.0f);
}`;

  const mainSource = `/**
 * @file main.c
 * @brief Standalone Testbench and Embedded Main Entry for Truck Instrument Cluster in C
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "tpl_os.h"
#include "cluster_tasks.h"
#include "j1939.h"

int main(int argc, char *argv[])
{
    (void)argc;
    (void)argv;

    printf("Iniciando Firmware do Instrument Cluster em C com Trampoline RTOS...\\n");
    StartupHook();

    uint32_t sim_clock_ms = 0;
    const uint32_t step_ms = 10;

    while (sim_clock_ms <= 150000U) /* 150 segundos = 2m30s */
    {
        /* 1. Executa as tarefas periódicas OSEK conforme os períodos definidos */
        if (sim_clock_ms % 10U == 0U)  Task_CanRx_func();
        if (sim_clock_ms % 20U == 0U)  Task_J1939_Decode_func();
        if (sim_clock_ms % 33U == 0U)  Task_Cluster_Gauges_func();
        if (sim_clock_ms % 50U == 0U)  Task_Warning_Lamps_func();
        if (sim_clock_ms % 100U == 0U) Task_Diagnostics_DM1_func();

        sim_clock_ms += step_ms;
    }

    printf("Simulação de 150 segundos concluída com sucesso.\\n");
    ShutdownHook(E_OK);
    return 0;
}`;

  const makefileContent = `# Makefile for Heavy Commercial Truck Instrument Cluster Module (ICM)
# Target: Trampoline RTOS (OSEK/VDX 2.2.3 / AUTOSAR OS 4.2) & Standalone Testbench

CC ?= gcc
CFLAGS ?= -Wall -Wextra -O2 -std=c99 -Iinclude -D_POSIX_C_SOURCE=200809L
LDFLAGS ?= -lm

SRCS = src/main.c src/cluster_tasks.c src/j1939.c src/cluster_gauges.c src/can_queue.c
TARGET = bin/truck_cluster_sim

all: $(TARGET)

$(TARGET): $(SRCS)
	mkdir -p bin
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET) $(LDFLAGS)

run: $(TARGET)
	./$(TARGET)

oil_gen: cluster.oil
	goil --target=posix/linux --templates=/opt/trampoline/goil/templates/ cluster.oil`;

  const typesHeader = `/**
 * @file cluster_types.h
 * @brief Common Types and Data Structures for Truck Instrument Cluster Module (ICM)
 */

#ifndef CLUSTER_TYPES_H
#define CLUSTER_TYPES_H

#include <stdint.h>
#include <stdbool.h>

#define MAX_ACTIVE_DTCS   16U

typedef struct {
    uint32_t can_id;
    uint8_t  dlc;
    uint8_t  data[8];
    uint32_t timestamp_ms;
} CanRawFrame_t;

typedef struct {
    float    vehicle_speed_kmh;   /* 0.0 - 140.0 km/h (SPN 84) */
    float    engine_rpm;          /* 0.0 - 3000.0 RPM (SPN 190) */
    float    fuel_level_pct;      /* 0.0 - 100.0 % (SPN 96) */
    float    coolant_temp_c;      /* 40.0 - 120.0 °C (SPN 110) */
    bool     turn_left_active;    /* Seta Esquerda (1.5 Hz) */
    bool     turn_right_active;   /* Seta Direita (1.5 Hz) */
    bool     hazard_active;       /* Pisca-Alerta */
    bool     mil_active;          /* Check Engine (MIL) */
    bool     general_fault_active;/* Falha Geral (Amber/Stop) */
    bool     red_stop_lamp;       /* Stop Engine Vermelho */
    float    oil_pressure_bar;    /* Pressão Óleo (SPN 100) */
    float    air_pressure_circuit1;
    float    air_pressure_circuit2;
    float    battery_voltage;     /* Sistema 24V */
    int8_t   current_gear;        /* N, R, 1..12 */
    bool     parking_brake;
    bool     fuel_reserve_warning;
    bool     coolant_high_warning;
} TruckClusterState_t;

#endif /* CLUSTER_TYPES_H */`;

  const queueSource = `/**
 * @file can_queue.c
 * @brief Thread-safe CAN Frame Ring Buffer Implementation
 */

#include "can_queue.h"
#include <string.h>

void CanQueue_Init(CanRingBuffer_t *q)
{
    if (!q) return;
    memset(q->buffer, 0, sizeof(q->buffer));
    q->head = 0; q->tail = 0; q->count = 0;
}

bool CanQueue_Push(CanRingBuffer_t *q, const CanRawFrame_t *frame)
{
    if (!q || !frame || q->count >= CAN_FIFO_CAPACITY) return false;
    q->buffer[q->head] = *frame;
    q->head = (q->head + 1U) % CAN_FIFO_CAPACITY;
    q->count++;
    return true;
}

bool CanQueue_Pop(CanRingBuffer_t *q, CanRawFrame_t *frame)
{
    if (!q || !frame || q->count == 0) return false;
    *frame = q->buffer[q->tail];
    q->tail = (q->tail + 1U) % CAN_FIFO_CAPACITY;
    q->count--;
    return true;
}

uint16_t CanQueue_GetCount(const CanRingBuffer_t *q)
{
    return q ? q->count : 0;
}`;

  // File dictionary
  const fileMap = {
    tasks_c: {
      name: 'cluster_tasks.c',
      path: '/firmware/src/cluster_tasks.c',
      label: 'Tarefas OSEK (5 Tarefas)',
      code: cCode,
      lang: 'C',
    },
    oil: {
      name: 'cluster.oil',
      path: '/firmware/cluster.oil',
      label: 'Configuração OIL (OSEK 2.5)',
      code: oilCode,
      lang: 'OIL',
    },
    j1939_c: {
      name: 'j1939.c',
      path: '/firmware/src/j1939.c',
      label: 'Pilha J1939 & DM11',
      code: j1939Source,
      lang: 'C',
    },
    j1939_h: {
      name: 'j1939.h',
      path: '/firmware/include/j1939.h',
      label: 'Header J1939 & PGNs',
      code: j1939Header,
      lang: 'C Header',
    },
    gauges_c: {
      name: 'cluster_gauges.c',
      path: '/firmware/src/cluster_gauges.c',
      label: 'Filtro Inércia Agulhas & Setas',
      code: gaugesSource,
      lang: 'C',
    },
    main_c: {
      name: 'main.c',
      path: '/firmware/src/main.c',
      label: 'Main & Dashboard ANSI',
      code: mainSource,
      lang: 'C',
    },
    types_h: {
      name: 'cluster_types.h',
      path: '/firmware/include/cluster_types.h',
      label: 'Tipos & Telemetria',
      code: typesHeader,
      lang: 'C Header',
    },
    queue_c: {
      name: 'can_queue.c',
      path: '/firmware/src/can_queue.c',
      label: 'Fila CAN FIFO (PCP)',
      code: queueSource,
      lang: 'C',
    },
    makefile: {
      name: 'Makefile',
      path: '/firmware/Makefile',
      label: 'Makefile (GCC & goil)',
      code: makefileContent,
      lang: 'Make',
    },
  };

  const currentFile = fileMap[activeFileId];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`w-full rounded-2xl border overflow-hidden flex flex-col gap-0 transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-md'
          : 'bg-slate-900 border-slate-800 text-slate-200 shadow-xl'
      }`}
    >
      {/* Header with Project Explorer title & Actions */}
      <div
        className={`flex flex-wrap items-center justify-between px-4 py-3 border-b gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                Firmware C Completo (Trampoline RTOS)
              </span>
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>
                9 Arquivos em /firmware
              </span>
            </div>
            <h3 className={`text-sm font-bold tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{currentFile.path}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={`Baixar ${currentFile.name}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar {currentFile.name}</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors shadow-xs cursor-pointer ${
              isLight
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div
        className={`flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b overflow-x-auto text-xs font-mono ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        {(Object.keys(fileMap) as Array<keyof typeof fileMap>).map((key) => {
          const file = fileMap[key];
          const isActive = activeFileId === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFileId(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-white text-cyan-800 border border-cyan-400 shadow-xs font-bold'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-200 border border-transparent'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {key === 'oil' ? (
                <FileCode className={`w-3 h-3 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
              ) : (
                <Code className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
              )}
              <span>{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Editor Preview */}
      <div
        className={`p-4 overflow-x-auto max-h-[550px] font-mono text-xs leading-relaxed select-text border-b ${
          isLight
            ? 'bg-[#f8fafc] text-slate-800 border-slate-200'
            : 'bg-[#070b14] text-slate-300 border-slate-800'
        }`}
      >
        <div
          className={`text-[11px] mb-2 border-b pb-1 flex justify-between ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-500'
          }`}
        >
          <span>// {currentFile.path} ({currentFile.label})</span>
          <span>{currentFile.lang}</span>
        </div>
        <pre className="whitespace-pre">
          <code>{currentFile.code}</code>
        </pre>
      </div>

      {/* Terminal Compilation Command Instructions Footer */}
      <div
        className={`px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2 ${
          isLight ? 'bg-slate-50 text-slate-600 border-t border-slate-200' : 'bg-slate-950 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
          <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Compilar no terminal:</span>
          <code
            className={`px-2 py-0.5 rounded border ${
              isLight ? 'bg-white text-emerald-800 border-slate-300' : 'bg-slate-900 text-emerald-300 border-slate-800'
            }`}
          >
            cd firmware && make && ./bin/truck_cluster_sim
          </code>
        </div>
        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          Padronização: OSEK/VDX 2.2.3 · AUTOSAR OS 4.2 · SAE J1939
        </div>
      </div>
    </div>
  );
};
