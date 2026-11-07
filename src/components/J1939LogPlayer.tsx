import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Sliders,
  Filter,
  FileText,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { J1939Frame, J1939Scenario, TruckClusterState, J1939_PGN } from '../types/j1939';
import {
  parseJ1939LogFile,
  exportFramesToAsc,
  buildCanId,
  createJ1939Frame,
} from '../services/j1939Decoder';

interface J1939LogPlayerProps {
  scenarios: J1939Scenario[];
  activeScenario: J1939Scenario;
  onSelectScenario: (scenario: J1939Scenario) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onFullReset?: () => void;
  onClearDTCs?: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentFrameIndex: number;
  totalFrames: number;
  onSeek: (index: number) => void;
  recentFrames: J1939Frame[];
  onUploadCustomLog: (frames: J1939Frame[], fileName: string) => void;
  clusterState: TruckClusterState;
  onManualOverride: (partial: Partial<TruckClusterState>) => void;
  theme?: 'light' | 'dark';
}

export const J1939LogPlayer: React.FC<J1939LogPlayerProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  isPlaying,
  onTogglePlay,
  onReset,
  onFullReset,
  onClearDTCs,
  playbackSpeed,
  onChangeSpeed,
  currentFrameIndex,
  totalFrames,
  onSeek,
  recentFrames,
  onUploadCustomLog,
  clusterState,
  onManualOverride,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'stream' | 'manual' | 'scenarios'>('scenarios');
  const [pgnFilter, setPgnFilter] = useState<number | 'ALL'>('ALL');
  const [selectedFrame, setSelectedFrame] = useState<J1939Frame | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const frames = parseJ1939LogFile(content);
        if (frames.length > 0) {
          onUploadCustomLog(frames, file.name);
          setActiveTab('stream');
        } else {
          alert('Nenhum quadro CAN J1939 reconhecido no arquivo. Suporta formatos .asc, .csv, .trc, .log ou candump.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportAsc = () => {
    const ascContent = exportFramesToAsc(activeScenario.frames);
    const blob = new Blob([ascContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('link');
    const a = document.createElement('a');
    a.href = url;
    a.download = `j1939_log_${activeScenario.id}.asc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFrames = recentFrames.filter((f) => {
    if (pgnFilter === 'ALL') return true;
    return f.pgn === pgnFilter;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Playback Control Deck */}
      <div
        className={`w-full p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-md text-slate-800'
            : 'bg-slate-900 border-slate-800 shadow-xl text-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Active Scenario Title */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${
                isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  Log J1939 Carregado
                </span>
                <span className={isLight ? 'text-slate-300' : 'text-slate-500'}>·</span>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {activeScenario.durationSeconds}s / {totalFrames} quadros
                </span>
              </div>
              <h2 className={`text-base font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeScenario.title}
              </h2>
            </div>
          </div>

          {/* Player Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Rebobinar Log para o Início"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {onFullReset && (
              <button
                onClick={onFullReset}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-xs font-mono font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                }`}
                title="Reset Completo da Simulação (Limpa todos os DTCs, restaura parâmetros e reinicia RTOS)"
              >
                <span>Reset Geral</span>
              </button>
            )}

            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Reproduzir</span>
                </>
              )}
            </button>

            {/* Speed Multipliers */}
            <div
              className={`flex items-center rounded-lg p-1 border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
              }`}
            >
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-2 py-1 text-xs font-mono rounded cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Export and Upload Actions */}
            <a
              href="/logs/j1939_truck_simulation_2min.asc"
              download="j1939_truck_simulation_2min.asc"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all shadow-xs ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500'
              }`}
              title="Baixar Arquivo Físico de Log CAN Vector .ASC Completo (150 segundos / 2m30s - 9.311 quadros)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log 2m30s (.ASC)</span>
            </a>

            <button
              onClick={handleExportAsc}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Exportar Cenário Atual como Vector .ASC"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300'
              }`}
              title="Carregar Arquivo de Log CAN (.asc, .csv, .trc, candump)"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".asc,.trc,.csv,.log,.txt"
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex flex-col gap-1.5">
          <div className={`flex justify-between text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Quadro {currentFrameIndex + 1} de {totalFrames}</span>
            <span>
              {activeScenario.frames[currentFrameIndex]?.timestamp.toFixed(2) || '0.00'}s / {activeScenario.durationSeconds.toFixed(2)}s
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={currentFrameIndex}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-600 ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Tabs: Cenários Pré-carregados | Fluxo CAN Monitor | Controles Manuais */}
      <div className={`w-full flex items-center justify-between border-b ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'scenarios'
                ? isLight
                  ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs'
                  : 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cenários de Teste J1939 ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'stream'
                ? isLight
                  ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs'
                  : 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Monitor de Barramento CAN ({filteredFrames.length} quadros)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'manual'
                ? isLight
                  ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs'
                  : 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Controles Manuais & Injeção de Falhas
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: SCENARIOS LIST */}
      {activeTab === 'scenarios' && (
        <div className="flex flex-col gap-4">
          {/* Featured Master Scenario Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              isLight
                ? 'bg-gradient-to-r from-cyan-50/90 via-white to-emerald-50/90 border-cyan-300 shadow-sm text-slate-800'
                : 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border-cyan-500/40 shadow-xl text-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-lg border shrink-0 ${
                  isLight ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono tracking-wider ${
                      isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    Log Completo 2m 30s
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                      isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    9.311 Quadros CAN J1939
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                      isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Todos os 12 Itens do Projeto
                  </span>
                </div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Arquivo de Log CAN SAE J1939 (Duração: 150 segundos)
                </h3>
                <p className={`text-xs max-w-2xl mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Simulação contínua integrando: Velocímetro, RPM com faixa verde eco (1.000–1.600 RPM), Combustível até reserva crítica (12%),
                  Temperatura de arrefecimento (&gt;108°C), Setas 1,5 Hz e Pisca-alerta, Check Engine (MIL), Stop Engine (Falha Geral),
                  caixa AMT 12 marchas, freios pneumáticos, pressão de óleo e comando SAE J1939 DM11 de limpeza de DTCs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              {scenarios[0] && (
                <button
                  onClick={() => onSelectScenario(scenarios[0])}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    activeScenario.id === scenarios[0].id
                      ? isLight
                        ? 'bg-cyan-600 text-white shadow-cyan-200'
                        : 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {activeScenario.id === scenarios[0].id ? '✓ Cenário Carregado' : 'Carregar Cenário'}
                </button>
              )}
              <a
                href="/logs/j1939_truck_simulation_2min.asc"
                download="j1939_truck_simulation_2min.asc"
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs font-mono transition-all shadow-xs ${
                  isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/40'
                }`}
                title="Download do arquivo ASCII Vector CANoe (.asc)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .ASC</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((sc) => {
              const isSelected = sc.id === activeScenario.id;
              const isMaster = sc.id === 'master-full-simulation-2min';
              return (
                <div
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? isLight
                        ? 'bg-cyan-50/70 border-cyan-500 shadow-md text-slate-800'
                        : 'bg-cyan-950/20 border-cyan-500/80 shadow-lg shadow-cyan-950/50 text-slate-200'
                      : isMaster
                      ? isLight
                        ? 'bg-white border-cyan-300 hover:border-cyan-500 shadow-xs text-slate-800'
                        : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/60 text-slate-200'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs text-slate-800'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isLight ? 'text-cyan-800 font-bold' : 'text-cyan-400'}`}>
                          {sc.durationSeconds}s · {sc.framesCount} quadros
                        </span>
                        {isMaster && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isLight
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            2m 30s COMPLETO
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isLight ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-slate-950'
                          }`}
                        >
                          ATIVO
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-bold mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{sc.title}</h3>
                    <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{sc.description}</p>
                  </div>

                  <div className={`border-t pt-2 flex flex-col gap-1 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                    <span className={`text-[10px] uppercase font-mono font-semibold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Eventos-Chave:
                    </span>
                    <div className={`flex flex-col gap-0.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {sc.keyEvents.slice(0, isMaster ? 5 : 3).map((ev, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className={isLight ? 'text-cyan-700 font-bold' : 'text-cyan-500'}>›</span>
                          <span className="truncate">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CAN BUS MONITOR STREAM */}
      {activeTab === 'stream' && (
        <div
          className={`w-full rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-md text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          {/* PGN Filter Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 pb-2 border-b text-xs ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className={`flex items-center gap-1.5 font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar por PGN:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              <button
                onClick={() => setPgnFilter('ALL')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === 'ALL'
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.EEC1)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.EEC1
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                EEC1 (RPM)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.CCVS)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.CCVS
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                CCVS (Velocidade)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.ET1)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.ET1
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ET1 (Arrefecimento)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.DD)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.DD
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                DD (Combustível)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.DM1)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.DM1
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                DM1 (DTC / Falhas)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.LIGHTING)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  pgnFilter === J1939_PGN.LIGHTING
                    ? isLight
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                LIGHT (Setas)
              </button>
            </div>
          </div>

          {/* Frames Table */}
          <div className="w-full max-h-80 overflow-y-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] ${isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2 px-2">Tempo (s)</th>
                  <th className="py-2 px-2">ID CAN 29-bit</th>
                  <th className="py-2 px-2">PGN</th>
                  <th className="py-2 px-2">Nome PGN</th>
                  <th className="py-2 px-2">Origem (SA)</th>
                  <th className="py-2 px-2">DLC</th>
                  <th className="py-2 px-2">Dados (Hex)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {filteredFrames.map((frame, idx) => (
                  <tr
                    key={frame.id || idx}
                    onClick={() => setSelectedFrame(frame)}
                    className={`cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-cyan-50/60' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className={`py-1.5 px-2 font-medium ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>{frame.timestamp.toFixed(4)}</td>
                    <td className={`py-1.5 px-2 font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      0x{frame.canId.toString(16).padStart(8, '0').toUpperCase()}
                    </td>
                    <td className={`py-1.5 px-2 font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{frame.pgnHex}</td>
                    <td className={`py-1.5 px-2 truncate max-w-[180px] ${isLight ? 'text-slate-800 font-medium' : 'text-slate-200'}`}>{frame.pgnName}</td>
                    <td className={`py-1.5 px-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{frame.sourceName}</td>
                    <td className={`py-1.5 px-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{frame.dlc}</td>
                    <td className={`py-1.5 px-2 tracking-wider ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>{frame.dataHex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail Inspector when frame clicked */}
          {selectedFrame && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <div
                className={`flex justify-between items-center font-bold border-b pb-1 ${
                  isLight ? 'text-cyan-800 border-slate-200' : 'text-cyan-400 border-slate-800'
                }`}
              >
                <span>INSPEÇÃO DETALHADA: {selectedFrame.pgnName}</span>
                <button onClick={() => setSelectedFrame(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className={isLight ? 'text-slate-500 block' : 'text-slate-500 block'}>Prioridade:</span>
                  <span className="font-bold">{selectedFrame.priority}</span>
                </div>
                <div>
                  <span className={isLight ? 'text-slate-500 block' : 'text-slate-500 block'}>PGN Decimal:</span>
                  <span className="font-bold">{selectedFrame.pgn}</span>
                </div>
                <div>
                  <span className={isLight ? 'text-slate-500 block' : 'text-slate-500 block'}>Endereço Origem:</span>
                  <span className="font-bold">0x{selectedFrame.sourceAddress.toString(16).toUpperCase()}</span>
                </div>
                <div>
                  <span className={isLight ? 'text-slate-500 block' : 'text-slate-500 block'}>Timestamp:</span>
                  <span className="font-bold">{selectedFrame.timestamp.toFixed(4)}s</span>
                </div>
              </div>
              <div>
                <span className={isLight ? 'text-slate-500 block mb-1' : 'text-slate-500 block mb-1'}>Bytes Individuais:</span>
                <div className="flex gap-2">
                  {selectedFrame.data.map((b, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center p-1 rounded border ${
                        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400">B{i}</span>
                      <span className={`font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                        0x{b.toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                      <span className="text-[9px] text-slate-500">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: INTERACTIVE MANUAL OVERRIDES & FAULT INJECTION */}
      {activeTab === 'manual' && (
        <div
          className={`w-full rounded-2xl border p-5 flex flex-col gap-6 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-md text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="flex items-center gap-2">
              <Sliders className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
              <h3 className={`text-sm font-bold uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Controle Manual & Injeção de Falhas no Instrument Cluster
              </h3>
            </div>
            <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Modo de Teste Interativo</span>
          </div>

          {/* SLIDERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Velocidade (Speed) */}
            <div
              className={`flex flex-col gap-2 p-4 rounded-xl border ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Velocímetro (Speed)</span>
                <span className={`text-sm font-bold font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  {clusterState.speed.toFixed(1)} km/h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={140}
                step={0.5}
                value={clusterState.speed}
                onChange={(e) => onManualOverride({ speed: parseFloat(e.target.value) })}
                className={`w-full h-2 rounded-lg cursor-pointer accent-cyan-600 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 km/h</span>
                <span>80 (Cruzeiro)</span>
                <span>140 km/h</span>
              </div>
            </div>

            {/* Rotação do Motor (RPM) */}
            <div
              className={`flex flex-col gap-2 p-4 rounded-xl border ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Conta-Giros (RPM)</span>
                <span className={`text-sm font-bold font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  {Math.round(clusterState.rpm)} RPM
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={3000}
                step={10}
                value={clusterState.rpm}
                onChange={(e) => onManualOverride({ rpm: parseInt(e.target.value, 10) })}
                className={`w-full h-2 rounded-lg cursor-pointer accent-emerald-600 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>650 (Marcha Lenta)</span>
                <span>1200-1600 (Eco)</span>
                <span>3000 RPM (Faixa Vermelha)</span>
              </div>
            </div>

            {/* Temperatura do Arrefecimento (Coolant) */}
            <div
              className={`flex flex-col gap-2 p-4 rounded-xl border ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Líquido de Arrefecimento</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    clusterState.coolantTemp >= 102
                      ? isLight ? 'text-rose-600' : 'text-rose-400'
                      : isLight ? 'text-blue-700' : 'text-blue-400'
                  }`}
                >
                  {clusterState.coolantTemp}°C
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={125}
                step={1}
                value={clusterState.coolantTemp}
                onChange={(e) => onManualOverride({ coolantTemp: parseInt(e.target.value, 10) })}
                className={`w-full h-2 rounded-lg cursor-pointer accent-blue-600 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>40°C (Frio)</span>
                <span>85°C (Ideal)</span>
                <span>102°C+ (Superaquecimento)</span>
              </div>
            </div>

            {/* Nível de Combustível (Fuel) */}
            <div
              className={`flex flex-col gap-2 p-4 rounded-xl border ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nível de Combustível</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    clusterState.fuelLevel <= 15
                      ? isLight ? 'text-amber-700' : 'text-amber-400'
                      : isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  {clusterState.fuelLevel}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={clusterState.fuelLevel}
                onChange={(e) => onManualOverride({ fuelLevel: parseInt(e.target.value, 10) })}
                className={`w-full h-2 rounded-lg cursor-pointer accent-amber-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Vazio)</span>
                <span>≤15% (Lâmpada Reserva)</span>
                <span>100% (Cheio)</span>
              </div>
            </div>
          </div>

          {/* TOGGLE BUTTONS: TURN SIGNALS, CHECK ENGINE, FALHA GERAL */}
          <div className="flex flex-col gap-3">
            <span className={`text-xs font-mono uppercase font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Interruptores de Setas & Falhas:
            </span>
            <div className="flex flex-wrap gap-3">
              {/* Seta Esquerda */}
              <button
                onClick={() => onManualOverride({ turnLeft: !clusterState.turnLeft, turnRight: false })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                  clusterState.turnLeft
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>◀ Seta Esquerda</span>
              </button>

              {/* Seta Direita */}
              <button
                onClick={() => onManualOverride({ turnRight: !clusterState.turnRight, turnLeft: false })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                  clusterState.turnRight
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>Seta Direita ▶</span>
              </button>

              {/* Pisca-Alerta */}
              <button
                onClick={() => onManualOverride({ hazardLights: !clusterState.hazardLights })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                  clusterState.hazardLights
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pisca-Alerta</span>
              </button>

              {/* Injetar Falha no Motor (Check Engine MIL) */}
              <button
                onClick={() => onManualOverride({ checkEngine: !clusterState.checkEngine })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                  clusterState.checkEngine
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md animate-pulse'
                    : isLight
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{clusterState.checkEngine ? 'Falha Motor ATIVA' : 'Disparar Check Engine'}</span>
              </button>

              {/* Injetar Falha Geral (Master Warning / Stop) */}
              <button
                onClick={() => onManualOverride({ generalFailure: !clusterState.generalFailure })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                  clusterState.generalFailure
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-pulse'
                    : isLight
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                    : 'bg-slate-800 text-rose-400 border-rose-500/40 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{clusterState.generalFailure ? 'Falha Geral ATIVA' : 'Disparar Falha Geral'}</span>
              </button>

              {/* Freio de Estacionamento */}
              <button
                onClick={() => onManualOverride({ parkingBrake: !clusterState.parkingBrake })}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                  clusterState.parkingBrake
                    ? 'bg-rose-100 text-rose-800 border-rose-400'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Freio de Mão (P)
              </button>
            </div>
          </div>

          {/* DEDICATED SIMULATION RESET & DTC CLEAR PANEL (J1939 DM11) */}
          <div
            className={`flex flex-col gap-3 p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono uppercase font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Diagnóstico &amp; Reset de DTC (SAE J1939 DM11)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">· Comando de Limpeza</span>
              </div>
              <div className="text-xs font-mono">
                {clusterState.checkEngine || clusterState.generalFailure || clusterState.activeDTCs.length > 0 ? (
                  <span className={`font-bold ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                    ● Falhas Ativas: {clusterState.activeDTCs.length > 0 ? clusterState.activeDTCs.length : '1+'} (MIL / Stop)
                  </span>
                ) : (
                  <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    ● Flags de DTC Limpos (Sem Falhas)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {onClearDTCs && (
                <button
                  onClick={onClearDTCs}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm border border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                  title="Executa comando SAE J1939 DM11 para apagar falhas e zerar os flags de Check Engine e Falha Geral"
                >
                  <span>Limpar Flags de DTC (J1939 DM11)</span>
                </button>
              )}

              {onFullReset && (
                <button
                  onClick={onFullReset}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                  }`}
                  title="Restaura os mostradores aos valores nominais de fábrica, rebobina o log e zera todos os DTCs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Completo da Simulação</span>
                </button>
              )}
            </div>
            <p className={`text-[11px] font-sans leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              O botão <strong className={isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}>Limpar Flags de DTC</strong> simula o envio da mensagem diagnóstica SAE J1939 DM11 (Diagnostic Message 11 - Clear/Reset Active DTCs), apagando a lâmpada de anomalia do motor (MIL) e a falha geral. O <strong className={isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}>Reset Completo</strong> restaura também o velocímetro, conta-giros, combustível e arrefecimento aos valores de referência e rebobina o escalonador do Trampoline RTOS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
