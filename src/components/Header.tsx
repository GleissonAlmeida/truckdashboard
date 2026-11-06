import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Truck } from 'lucide-react';

interface HeaderProps {
  currentTab: 'cluster' | 'player' | 'inspector' | 'code';
  onChangeTab: (tab: 'cluster' | 'player' | 'inspector' | 'code') => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  hasActiveFaults: boolean;
  onClearFaults: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onChangeTab,
  isAudioMuted,
  onToggleAudio,
  hasActiveFaults,
  onClearFaults,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark (Single text element in display face, no pills) */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Truck className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-mono">
          TRUCK CLUSTER <span className="text-cyan-400 font-sans">RTOS</span>
        </span>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line links with active state) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onChangeTab('cluster')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'cluster'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : ''
          }`}
        >
          Instrument Cluster
        </button>

        <button
          onClick={() => onChangeTab('player')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'player'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : ''
          }`}
        >
          Reprodutor J1939
        </button>

        <button
          onClick={() => onChangeTab('inspector')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'inspector'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : ''
          }`}
        >
          Inspetor RTOS
        </button>

        <button
          onClick={() => onChangeTab('code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentTab === 'code'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : ''
          }`}
        >
          Arquitetura OIL &amp; C
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Audio Mute Toggle & Emergency Alarm Reset) */}
      <div className="flex items-center gap-3 shrink-0">
        {hasActiveFaults && (
          <button
            onClick={onClearFaults}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Resetar falhas ativas de motor e sistema"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Resetar Falhas</span>
          </button>
        )}

        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
            isAudioMuted
              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900'
          }`}
          title={isAudioMuted ? 'Ativar Áudio dos Relés e Alarmes' : 'Silenciar Áudio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isAudioMuted ? 'Mudo' : 'Sons Ativos'}</span>
        </button>
      </div>
    </header>
  );
};
