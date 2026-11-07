import React from 'react';
import { TruckClusterState } from '../types/j1939';
import { AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface CenterDisplayProps {
  state: TruckClusterState;
  rtosTickMs: number;
  onClearDTCs?: () => void;
  theme?: 'light' | 'dark';
}

export const CenterDisplay: React.FC<CenterDisplayProps> = ({ state, rtosTickMs, onClearDTCs, theme = 'light' }) => {
  const isLight = theme === 'light';
  const isOverheating = state.coolantTemp >= 102;
  const isOilCritical = state.oilPressure < 1.2;
  const isAirCritical = state.airPressure1 < 6.5 || state.airPressure2 < 6.5;

  return (
    <div
      className={`w-full max-w-md h-full min-h-[300px] sm:min-h-[330px] rounded-2xl border-2 p-4 flex flex-col justify-between relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-300 shadow-xl text-slate-800'
          : 'bg-gradient-to-b from-slate-950 via-[#0c121e] to-slate-950 border-slate-800 shadow-2xl text-slate-200'
      }`}
    >
      {/* Background Subtle Tech Grid */}
      <div
        className={`absolute inset-0 bg-[size:16px_16px] pointer-events-none ${
          isLight
            ? 'bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)]'
        }`}
      />

      {/* Top Header: Clock, Ambient, Trampoline RTOS Status */}
      <div
        className={`flex items-center justify-between border-b pb-2 relative z-10 text-xs font-mono ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
        }`}
      >
        <div className={`flex items-center gap-1.5 font-bold tracking-tight ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>TRAMPOLINE OS</span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-500'}>·</span>
          <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}>{(rtosTickMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>24°C EXT</span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-500'}>·</span>
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>14:38</span>
        </div>
      </div>

      {/* Main Center Area: Active Gear & Primary Cruise / Status */}
      <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10">
        <div className="flex items-center gap-6">
          {/* Transmission Mode */}
          <div className="flex flex-col items-center font-mono text-xs">
            <span className={`text-[10px] ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>TRANSMISSÃO</span>
            <span
              className={`px-2 py-0.5 mt-0.5 rounded font-bold border ${
                isLight
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-xs'
                  : 'bg-slate-800/90 text-cyan-400 border-cyan-500/30'
              }`}
            >
              AMT 12V
            </span>
          </div>

          {/* LARGE CURRENT GEAR DISPLAY */}
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center transition-all ${
                isLight
                  ? 'bg-white border-2 border-slate-300 shadow-md'
                  : 'bg-slate-900 border-2 border-slate-700/80 shadow-inner'
              }`}
            >
              <span
                className={`text-4xl sm:text-5xl font-mono font-extrabold font-gauge ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {state.currentGear}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono mt-1 uppercase tracking-wider font-semibold ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {state.currentGear === 'N'
                ? 'Ponto Morto'
                : state.currentGear === 'R'
                ? 'Marcha Ré'
                : `Marcha ${state.currentGear}`}
            </span>
          </div>

          {/* Cruise or Drive Mode */}
          <div className="flex flex-col items-center font-mono text-xs">
            <span className={`text-[10px] ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>MODO</span>
            <span
              className={`px-2 py-0.5 mt-0.5 rounded font-bold border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-slate-800/90 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {state.cruiseControl ? 'CRUISE 85' : 'POWER ECO'}
            </span>
          </div>
        </div>

        {/* ACTIVE DTC WARNING BANNER (When Check Engine or Falha Geral is triggered) */}
        {(state.checkEngine || state.generalFailure || state.activeDTCs.length > 0) && (
          <div
            className={`w-full mt-3 p-2.5 rounded-lg flex flex-col gap-1.5 transition-all ${
              isLight
                ? 'bg-rose-50 border border-rose-300 text-rose-900 shadow-sm'
                : 'bg-rose-950/75 border border-rose-500/80 text-rose-200 shadow-lg shadow-rose-950/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold font-mono ${
                  isLight ? 'text-rose-700' : 'text-rose-400'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                <span>ALERTA DE DIAGNÓSTICO J1939 (DM1)</span>
              </div>
              {onClearDTCs && (
                <button
                  onClick={onClearDTCs}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-rose-800/80 hover:bg-rose-700 text-rose-100 border-rose-400/50'
                  }`}
                  title="Limpar códigos e apagar indicadores de falha"
                >
                  Limpar DTCs
                </button>
              )}
            </div>
            {state.activeDTCs.length > 0 ? (
              state.activeDTCs.map((dtc, idx) => (
                <div key={idx} className="text-[11px] font-mono leading-tight">
                  <span className={`font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>SPN {dtc.spn} / FMI {dtc.fmi}:</span>{' '}
                  <span className={isLight ? 'text-slate-900 font-medium' : 'text-white'}>{dtc.description}</span>
                </div>
              ))
            ) : (
              <div className={`text-[11px] font-mono leading-tight ${isLight ? 'text-rose-800' : 'text-rose-200'}`}>
                {isOverheating && 'Superaquecimento do Arrefecimento (> 102°C)'}
                {isOilCritical && 'Pressão de Óleo do Motor Crítica (< 1.2 bar)'}
                {!isOverheating && !isOilCritical && 'Falha geral detectada no barramento J1939'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lower Telemetry Bars: Air Pressure Circuit 1 & 2, Oil Pressure, Battery */}
      <div
        className={`grid grid-cols-2 gap-2 border-t pt-2.5 relative z-10 font-mono text-xs ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        {/* Air Brakes Circuit 1 & 2 */}
        <div
          className={`flex flex-col gap-1 p-2 rounded-lg border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex justify-between text-[10px]">
            <span className={isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'}>FREIO PNEUMÁTICO</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {state.airPressure1.toFixed(1)} / {state.airPressure2.toFixed(1)} bar
            </span>
          </div>
          {/* Dual bar meter */}
          <div className={`w-full h-2 rounded overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isAirCritical ? 'bg-rose-500' : (isLight ? 'bg-cyan-600' : 'bg-cyan-500')
              }`}
              style={{ width: `${Math.min(100, (state.airPressure1 / 12) * 100)}%` }}
            />
          </div>
          <div className={`w-full h-2 rounded overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isAirCritical ? 'bg-rose-500' : (isLight ? 'bg-cyan-600' : 'bg-cyan-500')
              }`}
              style={{ width: `${Math.min(100, (state.airPressure2 / 12) * 100)}%` }}
            />
          </div>
          <div className={`flex justify-between text-[8px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>CIRC 1</span>
            <span>CIRC 2</span>
          </div>
        </div>

        {/* Oil Pressure & Battery */}
        <div
          className={`flex flex-col gap-1 p-2 rounded-lg border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex justify-between text-[10px]">
            <span className={isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'}>PRESSÃO ÓLEO</span>
            <span className={`font-bold ${isOilCritical ? 'text-rose-600' : (isLight ? 'text-slate-800' : 'text-slate-300')}`}>
              {state.oilPressure.toFixed(1)} bar
            </span>
          </div>
          <div className={`w-full h-2 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isOilCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (state.oilPressure / 8) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] mt-1">
            <span className={isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'}>BATERIA 24V</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{state.batteryVoltage.toFixed(1)} V</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Odometer, Trip, Instant Consumption */}
      <div
        className={`flex items-center justify-between border-t pt-2 text-[11px] font-mono relative z-10 ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
        }`}
      >
        <div>
          <span className={`text-[9px] block leading-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>TOTAL ODO</span>
          <span className={`font-bold tabular-nums ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            {state.odometerKm.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km
          </span>
        </div>
        <div>
          <span className={`text-[9px] block leading-none text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>TRIP A</span>
          <span className={`font-bold tabular-nums ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{state.tripKm.toFixed(1)} km</span>
        </div>
        <div>
          <span className={`text-[9px] block leading-none text-right ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>CONSUMO</span>
          <span className={`font-bold tabular-nums ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{state.instantConsumption.toFixed(1)} L/100km</span>
        </div>
      </div>
    </div>
  );
};
