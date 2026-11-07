import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { TruckClusterState } from '../types/j1939';

interface TelltaleLightsProps {
  state: TruckClusterState;
  blinkerPhase: boolean; // 1.5 Hz flash phase
  compact?: boolean;
  theme?: 'light' | 'dark';
}

export const TelltaleLights: React.FC<TelltaleLightsProps> = ({ state, blinkerPhase, compact = false, theme = 'light' }) => {
  const isLight = theme === 'light';
  // Flash indicators when active
  const isLeftTurnActive = (state.turnLeft || state.hazardLights) && blinkerPhase;
  const isRightTurnActive = (state.turnRight || state.hazardLights) && blinkerPhase;
  const isLowFuel = state.fuelLevel <= 15;
  const isHighCoolant = state.coolantTemp >= 102;
  const isLowOil = state.oilPressure < 1.2;
  const isLowAir = state.airPressure1 < 6.5 || state.airPressure2 < 6.5;

  const inactiveIconColor = isLight ? 'text-slate-300' : 'text-slate-800';

  return (
    <div
      className={`w-full flex items-center justify-between px-6 py-2.5 rounded-xl transition-all ${
        isLight
          ? 'bg-white/95 border border-slate-300 shadow-md text-slate-800'
          : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-inner text-slate-200'
      } ${compact ? 'text-xs' : ''}`}
    >
      {/* LEFT TURN SIGNAL */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-150 ${
            isLeftTurnActive
              ? isLight
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-500 scale-105 shadow-sm font-bold'
                : 'bg-emerald-500/20 text-emerald-400 cluster-glow-emerald border border-emerald-500/60 scale-105'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Indicador de Seta Esquerda (J1939 PGN 65088)"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M14 6l-6 6 6 6V6z" />
          </svg>
          <span className="text-[10px] font-mono font-bold ml-1 hidden sm:inline">SETA ESQ</span>
        </div>

        {/* PARKING BRAKE */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            state.parkingBrake
              ? isLight
                ? 'bg-rose-100 text-rose-700 border border-rose-400 shadow-xs'
                : 'bg-rose-500/20 text-rose-500 cluster-glow-rose border border-rose-500/50'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Freio de Estacionamento / Parking Brake (P)"
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-full border border-current font-bold text-[10px]">
            (P)
          </div>
        </div>

        {/* HIGH BEAM */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            state.highBeam
              ? isLight
                ? 'bg-blue-100 text-blue-700 border border-blue-400 shadow-xs'
                : 'bg-blue-500/20 text-blue-400 cluster-glow-cyan border border-blue-500/50'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Farol Alto"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8V4zm2 2h6v2h-6V6zm0 5h7v2h-7v-2zm0 5h6v2h-6v-2z" />
          </svg>
        </div>
      </div>

      {/* CENTER PRIMARY ALERTS: CHECK ENGINE & FALHA GERAL */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* CHECK ENGINE (MIL - Malfunction Indicator Lamp) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            state.checkEngine
              ? isLight
                ? 'bg-amber-100 text-amber-800 border-amber-400 shadow-sm animate-pulse'
                : 'bg-amber-500/20 text-amber-400 cluster-glow-amber border-amber-500/60 animate-pulse'
              : isLight
              ? 'text-slate-400 border-slate-200 bg-slate-50'
              : 'text-slate-800 border-slate-900 bg-slate-950/40'
          }`}
          title="Indicador de Falha no Motor / MIL (J1939 DM1 PGN 65226)"
        >
          {/* Custom Engine Silhouette SVG */}
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M7 4V2H5v2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3h10v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2V2h-2v2H7zm0 4h10v7H7V8z" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold font-mono tracking-tight leading-none">
              CHECK ENGINE
            </span>
            <span className="text-[9px] font-sans opacity-80 leading-none mt-0.5">
              {state.checkEngine ? 'Falha no Motor' : 'Motor Nominal'}
            </span>
          </div>
        </div>

        {/* FALHA GERAL (Master Amber Warning / Red Stop Engine) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            state.generalFailure
              ? isLight
                ? 'bg-rose-100 text-rose-800 border-rose-400 shadow-sm animate-pulse'
                : 'bg-rose-500/25 text-rose-400 cluster-glow-rose border-rose-500/70 animate-pulse'
              : isLight
              ? 'text-slate-400 border-slate-200 bg-slate-50'
              : 'text-slate-800 border-slate-900 bg-slate-950/40'
          }`}
          title="Indicação de Falha Geral / Alerta Mestre (Master Warning Lamp)"
        >
          {state.generalFailure ? (
            <AlertOctagon className={`w-6 h-6 ${isLight ? 'text-rose-600' : 'text-rose-500'}`} />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold font-mono tracking-tight leading-none">
              {state.generalFailure ? 'STOP / FALHA GERAL' : 'SISTEMA GERAL'}
            </span>
            <span className="text-[9px] font-sans opacity-80 leading-none mt-0.5">
              {state.generalFailure ? 'Alerta Crítico Ativo' : 'Parâmetros OK'}
            </span>
          </div>
        </div>

        {/* LOW OIL PRESSURE */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            isLowOil
              ? isLight
                ? 'bg-rose-100 text-rose-700 border border-rose-400 shadow-xs animate-bounce'
                : 'bg-rose-500/20 text-rose-500 cluster-glow-rose border border-rose-500/50 animate-bounce'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Pressão de Óleo Baixa"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.5 7.5L16 5V3H8v3l-2.5 2.5C4.6 9.4 4 10.6 4 12c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6 0-1.4-.6-2.6-1.5-4.5zM12 16c-2.2 0-4-1.8-4-4h8c0 2.2-1.8 4-4 4z" />
          </svg>
        </div>

        {/* HIGH COOLANT TEMP */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            isHighCoolant
              ? isLight
                ? 'bg-rose-100 text-rose-700 border border-rose-400 shadow-xs animate-pulse'
                : 'bg-rose-500/20 text-rose-500 cluster-glow-rose border border-rose-500/50 animate-pulse'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Superaquecimento do Arrefecimento (> 102°C)"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 0 0-3 3v7.2a5 5 0 1 0 6 0V5a3 3 0 0 0-3-3zm0 18a3 3 0 0 1-2-5.2V5a1 1 0 0 1 2 0v9.8a3 3 0 0 1 0 5.2z" />
          </svg>
        </div>

        {/* LOW FUEL LAMP */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            isLowFuel
              ? isLight
                ? 'bg-amber-100 text-amber-700 border border-amber-400 shadow-xs'
                : 'bg-amber-500/20 text-amber-500 cluster-glow-amber border border-amber-500/50'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Reserva de Combustível (≤ 15%)"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 10V6c0-1.1-.9-2-2-2h-3V2H6v18h10v-5h1c.6 0 1 .4 1 1v4c0 .6.4 1 1 1s1-.4 1-1v-5.5c0-1.4-1.1-2.5-2.5-2.5h-.5v-2h2zm-7 2H8V6h4v6z" />
          </svg>
        </div>

        {/* LOW AIR PRESSURE */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            isLowAir
              ? isLight
                ? 'bg-rose-100 text-rose-700 border border-rose-400 shadow-xs'
                : 'bg-rose-500/20 text-rose-500 cluster-glow-rose border border-rose-500/50'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Pressão dos Freios Pneumáticos Baixa (< 6.5 bar)"
        >
          <span className="text-[10px] font-mono font-bold">AIR !</span>
        </div>
      </div>

      {/* RIGHT TURN SIGNAL & CRUISE */}
      <div className="flex items-center gap-3">
        {/* CRUISE CONTROL */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            state.cruiseControl
              ? isLight
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-400 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-400 cluster-glow-emerald border border-emerald-500/50'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Piloto Automático / Cruise Control"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 4a8 8 0 0 0-8 8h2a6 6 0 1 1 12 0h2a8 8 0 0 0-8-8zm-1 5v4.4l3.1 1.8.9-1.5-2.5-1.5V9h-1.5z" />
          </svg>
        </div>

        {/* SEATBELT */}
        <div
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
            !state.seatbelt
              ? isLight
                ? 'bg-rose-100 text-rose-700 border border-rose-400 shadow-xs animate-pulse'
                : 'bg-rose-500/20 text-rose-500 cluster-glow-rose border border-rose-500/50 animate-pulse'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Cinto de Segurança"
        >
          <CheckCircle2 className="w-5 h-5" />
        </div>

        {/* RIGHT TURN SIGNAL */}
        <div
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-150 ${
            isRightTurnActive
              ? isLight
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-500 scale-105 shadow-sm font-bold'
                : 'bg-emerald-500/20 text-emerald-400 cluster-glow-emerald border border-emerald-500/60 scale-105'
              : `${inactiveIconColor} border border-transparent`
          }`}
          title="Indicador de Seta Direita (J1939 PGN 65088)"
        >
          <span className="text-[10px] font-mono font-bold mr-1 hidden sm:inline">SETA DIR</span>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M10 6l6 6-6 6V6z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
