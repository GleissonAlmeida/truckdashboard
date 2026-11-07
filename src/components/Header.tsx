import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Truck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: 'cluster' | 'player' | 'inspector' | 'code' | 'docs';
  onChangeTab: (tab: 'cluster' | 'player' | 'inspector' | 'code' | 'docs') => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  hasActiveFaults: boolean;
  onClearFaults: () => void;
  onFullReset: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onChangeTab,
  isAudioMuted,
  onToggleAudio,
  hasActiveFaults,
  onClearFaults,
  onFullReset,
  theme = 'light',
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`w-full flex items-center justify-between gap-8 px-6 py-4 border-b backdrop-blur-md sticky top-0 z-50 transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-950/80 border-slate-800/80 text-white'
      }`}
    >
      {/* Zone 1: Brand Wordmark (Single text element in display face, no pills) */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div
          className={`p-1.5 rounded-lg border ${
            isLight
              ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
          }`}
        >
          <Truck className="w-5 h-5" />
        </div>
        <span
          className={`text-lg font-bold tracking-tight font-mono ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          TRUCK CLUSTER <span className="text-cyan-600 font-sans">RTOS</span>
        </span>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line links with active state) */}
      <nav
        className={`hidden md:flex items-center gap-6 text-sm font-medium ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        <button
          onClick={() => onChangeTab('cluster')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'cluster'
              ? isLight
                ? 'text-cyan-600 font-bold border-b-2 border-cyan-600'
                : 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : isLight
              ? 'hover:text-slate-900'
              : 'hover:text-white'
          }`}
        >
          Instrument Cluster
        </button>

        <button
          onClick={() => onChangeTab('player')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'player'
              ? isLight
                ? 'text-cyan-600 font-bold border-b-2 border-cyan-600'
                : 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : isLight
              ? 'hover:text-slate-900'
              : 'hover:text-white'
          }`}
        >
          Reprodutor J1939
        </button>

        <button
          onClick={() => onChangeTab('inspector')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'inspector'
              ? isLight
                ? 'text-cyan-600 font-bold border-b-2 border-cyan-600'
                : 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : isLight
              ? 'hover:text-slate-900'
              : 'hover:text-white'
          }`}
        >
          Inspetor RTOS
        </button>

        <button
          onClick={() => onChangeTab('code')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'code'
              ? isLight
                ? 'text-cyan-600 font-bold border-b-2 border-cyan-600'
                : 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : isLight
              ? 'hover:text-slate-900'
              : 'hover:text-white'
          }`}
        >
          Firmware C &amp; OIL
        </button>

        <button
          onClick={() => onChangeTab('docs')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'docs'
              ? isLight
                ? 'text-cyan-600 font-bold border-b-2 border-cyan-600'
                : 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : isLight
              ? 'hover:text-slate-900'
              : 'hover:text-white'
          }`}
        >
          Documentação
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Theme Toggle, Reset Simulação, Limpar DTCs, Audio Mute Toggle) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 shadow-sm ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
            }`}
            title={isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isLight ? 'Tema Escuro' : 'Tema Claro'}</span>
          </button>
        )}

        {hasActiveFaults && (
          <button
            onClick={onClearFaults}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 animate-pulse ${
              isLight
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 shadow-sm'
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/50'
            }`}
            title="Limpar todos os flags de DTC e apagar lâmpadas de Check Engine / Falha Geral"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Limpar DTCs</span>
          </button>
        )}

        <button
          onClick={onFullReset}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 shadow-sm ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Reiniciar Simulação: restaura parâmetros de fábrica, rebobina o log e limpa todos os DTCs"
        >
          <span>Reset Simulação</span>
        </button>

        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
            isAudioMuted
              ? isLight
                ? 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              : isLight
              ? 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100 shadow-sm'
              : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900'
          }`}
          title={isAudioMuted ? 'Ativar Áudio dos Relés e Alarmes' : 'Silenciar Áudio'}
        >
          {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isAudioMuted ? 'Mudo' : 'Som'}</span>
        </button>
      </div>
    </header>
  );
};
