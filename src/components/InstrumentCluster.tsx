import React from 'react';
import { TruckClusterState } from '../types/j1939';
import { TelltaleLights } from './TelltaleLights';
import { ClusterDial } from './ClusterDial';
import { CenterDisplay } from './CenterDisplay';

interface InstrumentClusterProps {
  state: TruckClusterState;
  blinkerPhase: boolean;
  rtosTickMs: number;
  onClearDTCs?: () => void;
  theme?: 'light' | 'dark';
}

export const InstrumentCluster: React.FC<InstrumentClusterProps> = ({
  state,
  blinkerPhase,
  rtosTickMs,
  onClearDTCs,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Outer Truck Cluster Hood / Housing */}
      <div
        className={`w-full p-4 sm:p-7 rounded-3xl border-4 transition-all relative overflow-hidden ${
          isLight
            ? 'bg-gradient-to-b from-slate-100 via-white to-slate-200 border-slate-300 shadow-[0_20px_50px_rgba(100,116,139,0.25)]'
            : 'bg-gradient-to-b from-slate-900 via-[#0d1422] to-[#080d16] border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Subtle Top Glare / Glass Reflection Accent */}
        <div
          className={`absolute top-0 left-1/4 right-1/4 h-1 blur-sm bg-gradient-to-r from-transparent ${
            isLight ? 'via-cyan-600/30' : 'via-cyan-400/30'
          } to-transparent`}
        />

        {/* TOP ROW: WARNING TELLTALE LIGHTS RIBBON */}
        <div className="w-full mb-6">
          <TelltaleLights state={state} blinkerPhase={blinkerPhase} theme={theme} />
        </div>

        {/* MAIN GAUGES & TFT DISPLAY STAGE */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* LEFT GAUGE: TACHOMETER (Conta-Giros 0-3000 RPM) with Coolant Temp (Líquido de Arrefecimento) */}
          <div className="flex flex-col items-center">
            <ClusterDial
              type="rpm"
              value={state.rpm}
              subValue={state.coolantTemp}
              maxValue={3000}
              label="Rotação Motor"
              unit="RPM"
              subLabel="Arrefecimento"
              subUnit="°C"
              theme={theme}
            />
          </div>

          {/* CENTER: MULTI-FUNCTION TFT COLOR DISPLAY */}
          <div className="w-full lg:flex-1 flex justify-center">
            <CenterDisplay state={state} rtosTickMs={rtosTickMs} onClearDTCs={onClearDTCs} theme={theme} />
          </div>

          {/* RIGHT GAUGE: SPEEDOMETER (Velocímetro 0-140 km/h) with Fuel Level (Combustível) */}
          <div className="flex flex-col items-center">
            <ClusterDial
              type="speed"
              value={state.speed}
              subValue={state.fuelLevel}
              maxValue={140}
              label="Velocidade"
              unit="km/h"
              subLabel="Combustível"
              subUnit="%"
              theme={theme}
            />
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div
          className={`w-full mt-6 pt-3 border-t flex flex-wrap items-center justify-between text-xs font-mono transition-colors ${
            isLight ? 'border-slate-300 text-slate-600' : 'border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>
              SAE J1939 CAN BUS (250 kbps)
            </span>
            <span>·</span>
            <span>ISO 11898-2</span>
          </div>

          <div className="flex items-center gap-3">
            <span>TRAMPOLINE OSEK/VDX OS</span>
            <span>·</span>
            <span className={isLight ? 'text-slate-800 font-semibold' : 'text-slate-400'}>AUTOSAR 4.2 COMPLIANT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
