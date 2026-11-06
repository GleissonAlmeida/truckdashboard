import React from 'react';
import { TruckClusterState } from '../types/j1939';
import { AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface CenterDisplayProps {
  state: TruckClusterState;
  rtosTickMs: number;
  onClearDTCs?: () => void;
}

export const CenterDisplay: React.FC<CenterDisplayProps> = ({ state, rtosTickMs, onClearDTCs }) => {
  const isOverheating = state.coolantTemp >= 102;
  const isOilCritical = state.oilPressure < 1.2;
  const isAirCritical = state.airPressure1 < 6.5 || state.airPressure2 < 6.5;

  return (
    <div className="w-full max-w-md h-full min-h-[300px] sm:min-h-[330px] rounded-2xl bg-gradient-to-b from-slate-950 via-[#0c121e] to-slate-950 border-2 border-slate-800 p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Top Header: Clock, Ambient, Trampoline RTOS Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 relative z-10 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-bold tracking-tight">TRAMPOLINE OS</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{(rtosTickMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span>24°C EXT</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-bold">14:38</span>
        </div>
      </div>

      {/* Main Center Area: Active Gear & Primary Cruise / Status */}
      <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10">
        <div className="flex items-center gap-6">
          {/* Transmission Mode */}
          <div className="flex flex-col items-center text-slate-400 font-mono text-xs">
            <span className="text-[10px] text-slate-500">TRANSMISSÃO</span>
            <span className="px-2 py-0.5 mt-0.5 rounded bg-slate-800/90 text-cyan-400 font-bold border border-cyan-500/30">
              AMT 12V
            </span>
          </div>

          {/* LARGE CURRENT GEAR DISPLAY */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center shadow-inner">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white font-gauge">
                {state.currentGear}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
              {state.currentGear === 'N'
                ? 'Ponto Morto'
                : state.currentGear === 'R'
                ? 'Marcha Ré'
                : `Marcha ${state.currentGear}`}
            </span>
          </div>

          {/* Cruise or Drive Mode */}
          <div className="flex flex-col items-center text-slate-400 font-mono text-xs">
            <span className="text-[10px] text-slate-500">MODO</span>
            <span className="px-2 py-0.5 mt-0.5 rounded bg-slate-800/90 text-emerald-400 font-bold border border-emerald-500/30">
              {state.cruiseControl ? 'CRUISE 85' : 'POWER ECO'}
            </span>
          </div>
        </div>

        {/* ACTIVE DTC WARNING BANNER (When Check Engine or Falha Geral is triggered) */}
        {(state.checkEngine || state.generalFailure || state.activeDTCs.length > 0) && (
          <div className="w-full mt-3 p-2.5 rounded-lg bg-rose-950/75 border border-rose-500/80 text-rose-200 flex flex-col gap-1.5 shadow-lg shadow-rose-950/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-rose-400">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ALERTA DE DIAGNÓSTICO J1939 (DM1)</span>
              </div>
              {onClearDTCs && (
                <button
                  onClick={onClearDTCs}
                  className="px-2 py-0.5 rounded bg-rose-800/80 hover:bg-rose-700 text-rose-100 text-[10px] font-mono font-bold border border-rose-400/50 transition-colors"
                  title="Limpar códigos e apagar indicadores de falha"
                >
                  Limpar DTCs
                </button>
              )}
            </div>
            {state.activeDTCs.length > 0 ? (
              state.activeDTCs.map((dtc, idx) => (
                <div key={idx} className="text-[11px] font-mono leading-tight">
                  <span className="font-bold text-amber-300">SPN {dtc.spn} / FMI {dtc.fmi}:</span>{' '}
                  <span className="text-white">{dtc.description}</span>
                </div>
              ))
            ) : (
              <div className="text-[11px] font-mono leading-tight">
                {isOverheating && 'Superaquecimento do Arrefecimento (> 102°C)'}
                {isOilCritical && 'Pressão de Óleo do Motor Crítica (< 1.2 bar)'}
                {!isOverheating && !isOilCritical && 'Falha geral detectada no barramento J1939'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lower Telemetry Bars: Air Pressure Circuit 1 & 2, Oil Pressure, Battery */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2.5 relative z-10 font-mono text-xs">
        {/* Air Brakes Circuit 1 & 2 */}
        <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>FREIO PNEUMÁTICO</span>
            <span className="text-slate-300 font-bold">{state.airPressure1.toFixed(1)} / {state.airPressure2.toFixed(1)} bar</span>
          </div>
          {/* Dual bar meter */}
          <div className="w-full h-2 rounded bg-slate-800 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                isAirCritical ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (state.airPressure1 / 12) * 100)}%` }}
            />
          </div>
          <div className="w-full h-2 rounded bg-slate-800 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                isAirCritical ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (state.airPressure2 / 12) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-500">
            <span>CIRC 1</span>
            <span>CIRC 2</span>
          </div>
        </div>

        {/* Oil Pressure & Battery */}
        <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>PRESSÃO ÓLEO</span>
            <span className={`font-bold ${isOilCritical ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
              {state.oilPressure.toFixed(1)} bar
            </span>
          </div>
          <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOilCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (state.oilPressure / 8) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>BATERIA 24V</span>
            <span className="font-bold text-slate-300">{state.batteryVoltage.toFixed(1)} V</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Odometer, Trip, Instant Consumption */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] font-mono text-slate-400 relative z-10">
        <div>
          <span className="text-[9px] text-slate-500 block leading-none">TOTAL ODO</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {state.odometerKm.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block leading-none text-center">TRIP A</span>
          <span className="font-bold text-slate-200 tabular-nums">{state.tripKm.toFixed(1)} km</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block leading-none text-right">CONSUMO</span>
          <span className="font-bold text-slate-200 tabular-nums">{state.instantConsumption.toFixed(1)} L/100km</span>
        </div>
      </div>
    </div>
  );
};
