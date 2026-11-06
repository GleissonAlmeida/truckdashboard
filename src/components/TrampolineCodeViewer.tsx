import React, { useState } from 'react';
import { Copy, Check, FileCode, Code } from 'lucide-react';

interface TrampolineCodeViewerProps {
  oilCode: string;
  cCode: string;
}

export const TrampolineCodeViewer: React.FC<TrampolineCodeViewerProps> = ({ oilCode, cCode }) => {
  const [activeFile, setActiveFile] = useState<'oil' | 'c' | 'h'>('oil');
  const [copied, setCopied] = useState(false);

  const headerCode = `/**
 * @file j1939_stack.h
 * @brief SAE J1939 CAN Protocol Stack Definitions for Truck Cluster
 */

#ifndef J1939_STACK_H
#define J1939_STACK_H

#include <stdint.h>
#include <stdbool.h>

#define PGN_EEC1     61444U /* 0xF004: Electronic Engine Controller 1 */
#define PGN_CCVS     65265U /* 0xFEF1: Cruise Control / Vehicle Speed */
#define PGN_ET1      65262U /* 0xFEEE: Engine Temperature 1 */
#define PGN_DD       65276U /* 0xFEFC: Dash Display (Fuel Level) */
#define PGN_DM1      65226U /* 0xFECA: Active Diagnostic Trouble Codes */
#define PGN_EFL_P1   65263U /* 0xFEEF: Engine Oil Pressure */
#define PGN_AIR1_2   65274U /* 0xFEFA: Pneumatic Supply Pressure */
#define PGN_LIGHTING 65088U /* 0xFE40: Lighting & Turn Signals */

typedef struct {
    uint32_t can_id;
    uint8_t  dlc;
    uint8_t  data[8];
} CanRawFrame_t;

typedef struct {
    float    vehicle_speed;      /* km/h (SPN 84) */
    float    engine_rpm;         /* RPM (SPN 190) */
    float    coolant_temp;       /* °C (SPN 110) */
    float    fuel_level;         /* % (SPN 96) */
    float    oil_pressure;       /* bar (SPN 100) */
    float    air_pressure_1;     /* bar (SPN 1087) */
    float    air_pressure_2;     /* bar (SPN 1088) */
    bool     turn_left_active;
    bool     turn_right_active;
    bool     mil_active;         /* Check Engine Lamp */
    bool     general_fault_active;/* Amber Warning / Red Stop */
} TruckClusterState_t;

/* J1939 Function Prototypes */
uint32_t J1939_ExtractPGN(uint32_t can_id);
float    J1939_Decode_SPN190(const CanRawFrame_t *frame);
float    J1939_Decode_SPN84(const CanRawFrame_t *frame);
float    J1939_Decode_SPN110(const CanRawFrame_t *frame);
float    J1939_Decode_SPN96(const CanRawFrame_t *frame);

#endif /* J1939_STACK_H */`;

  const currentContent = activeFile === 'oil' ? oilCode : activeFile === 'c' ? cCode : headerCode;
  const currentFileName = activeFile === 'oil' ? 'cluster.oil' : activeFile === 'c' ? 'trampoline_tasks.c' : 'j1939_stack.h';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Top File Selector Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFile('oil')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeFile === 'oil'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>cluster.oil (Configuração OIL OSEK)</span>
          </button>

          <button
            onClick={() => setActiveFile('c')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeFile === 'c'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>trampoline_tasks.c (Código C OSEK)</span>
          </button>

          <button
            onClick={() => setActiveFile('h')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeFile === 'h'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>j1939_stack.h (Header J1939)</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-mono transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : `Copiar ${currentFileName}`}</span>
        </button>
      </div>

      {/* Code Editor Preview */}
      <div className="p-4 overflow-x-auto max-h-[550px] bg-[#0b101b] font-mono text-xs text-slate-300 leading-relaxed select-text">
        <pre className="whitespace-pre">
          <code>{currentContent}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Compilador Compatível: GCC ARM Embedded / Viper Trampoline Generator</span>
        <span>Padrão ISO 17356 OSEK/VDX 2.2.3</span>
      </div>
    </div>
  );
};
