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
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentFrameIndex: number;
  totalFrames: number;
  onSeek: (index: number) => void;
  recentFrames: J1939Frame[];
  onUploadCustomLog: (frames: J1939Frame[], fileName: string) => void;
  clusterState: TruckClusterState;
  onManualOverride: (partial: Partial<TruckClusterState>) => void;
}

export const J1939LogPlayer: React.FC<J1939LogPlayerProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  isPlaying,
  onTogglePlay,
  onReset,
  playbackSpeed,
  onChangeSpeed,
  currentFrameIndex,
  totalFrames,
  onSeek,
  recentFrames,
  onUploadCustomLog,
  clusterState,
  onManualOverride,
}) => {
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `j1939_log_${activeScenario.id}.asc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredFrames = recentFrames.filter((f) => {
    if (pgnFilter === 'ALL') return true;
    return f.pgn === pgnFilter;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Playback Control Deck */}
      <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Active Scenario Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-cyan-400">Log J1939 Carregado</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-mono text-slate-400">{activeScenario.durationSeconds}s / {totalFrames} quadros</span>
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">{activeScenario.title}</h2>
            </div>
          </div>

          {/* Player Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Reiniciar Reprodução"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950'
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
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    playbackSpeed === spd
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Export and Upload Actions */}
            <button
              onClick={handleExportAsc}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Exportar como Vector .ASC"
            >
              <Download className="w-4 h-4" />
            </button>

            <label className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" title="Carregar Arquivo de Log CAN (.asc, .csv, .trc, candump)">
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
          <div className="flex justify-between text-xs font-mono text-slate-400">
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Tabs: Cenários Pré-carregados | Fluxo CAN Monitor | Controles Manuais */}
      <div className="w-full flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'scenarios'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cenários de Teste J1939 ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'stream'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Monitor de Barramento CAN ({filteredFrames.length} quadros)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'manual'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Controles Manuais & Injeção de Falhas
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: SCENARIOS LIST */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenario.id;
            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-cyan-400 font-semibold">{sc.durationSeconds}s · {sc.framesCount} quadros</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{sc.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{sc.description}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-2 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Eventos-Chave:</span>
                  <div className="flex flex-col gap-0.5 text-xs text-slate-300">
                    {sc.keyEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-500">›</span>
                        <span className="truncate">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT 2: CAN BUS MONITOR STREAM */}
      {activeTab === 'stream' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
          {/* PGN Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar por PGN:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              <button
                onClick={() => setPgnFilter('ALL')}
                className={`px-2 py-1 rounded ${
                  pgnFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.EEC1)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.EEC1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                EEC1 (RPM)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.CCVS)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.CCVS ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                CCVS (Velocidade)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.ET1)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.ET1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ET1 (Arrefecimento)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.DD)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.DD ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                DD (Combustível)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.DM1)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.DM1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                DM1 (DTC / Falhas)
              </button>
              <button
                onClick={() => setPgnFilter(J1939_PGN.LIGHTING)}
                className={`px-2 py-1 rounded ${
                  pgnFilter === J1939_PGN.LIGHTING ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
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
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-1.5 px-2">Tempo (s)</th>
                  <th className="py-1.5 px-2">ID CAN 29-bit</th>
                  <th className="py-1.5 px-2">PGN</th>
                  <th className="py-1.5 px-2">Nome PGN</th>
                  <th className="py-1.5 px-2">Origem (SA)</th>
                  <th className="py-1.5 px-2">DLC</th>
                  <th className="py-1.5 px-2">Dados (Hex)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFrames.map((frame, idx) => (
                  <tr
                    key={frame.id || idx}
                    onClick={() => setSelectedFrame(frame)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-1 px-2 text-cyan-400">{frame.timestamp.toFixed(4)}</td>
                    <td className="py-1 px-2 font-bold text-slate-300">
                      0x{frame.canId.toString(16).padStart(8, '0').toUpperCase()}
                    </td>
                    <td className="py-1 px-2 text-amber-400 font-semibold">{frame.pgnHex}</td>
                    <td className="py-1 px-2 text-slate-200 truncate max-w-[180px]">{frame.pgnName}</td>
                    <td className="py-1 px-2 text-slate-400">{frame.sourceName}</td>
                    <td className="py-1 px-2 text-slate-400">{frame.dlc}</td>
                    <td className="py-1 px-2 text-emerald-400 tracking-wider">{frame.dataHex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail Inspector when frame clicked */}
          {selectedFrame && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex flex-col gap-2">
              <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-slate-800 pb-1">
                <span>INSPEÇÃO DETALHADA: {selectedFrame.pgnName}</span>
                <button onClick={() => setSelectedFrame(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Prioridade:</span>
                  <span className="font-bold">{selectedFrame.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PGN Decimal:</span>
                  <span className="font-bold">{selectedFrame.pgn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Endereço Origem:</span>
                  <span className="font-bold">0x{selectedFrame.sourceAddress.toString(16).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp:</span>
                  <span className="font-bold">{selectedFrame.timestamp.toFixed(4)}s</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Bytes Individuais:</span>
                <div className="flex gap-2">
                  {selectedFrame.data.map((b, i) => (
                    <div key={i} className="flex flex-col items-center p-1 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500">B{i}</span>
                      <span className="font-bold text-cyan-300">0x{b.toString(16).padStart(2, '0').toUpperCase()}</span>
                      <span className="text-[9px] text-slate-400">{b}</span>
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
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                Controle Manual & Injeção de Falhas no Instrument Cluster
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Modo de Teste Interativo</span>
          </div>

          {/* SLIDERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Velocidade (Speed) */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Velocímetro (Speed)</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{clusterState.speed.toFixed(1)} km/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={140}
                step={0.5}
                value={clusterState.speed}
                onChange={(e) => onManualOverride({ speed: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 km/h</span>
                <span>80 (Cruzeiro)</span>
                <span>140 km/h</span>
              </div>
            </div>

            {/* Rotação do Motor (RPM) */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Conta-Giros (RPM)</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{Math.round(clusterState.rpm)} RPM</span>
              </div>
              <input
                type="range"
                min={0}
                max={3000}
                step={10}
                value={clusterState.rpm}
                onChange={(e) => onManualOverride({ rpm: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>650 (Marcha Lenta)</span>
                <span>1200-1600 (Eco)</span>
                <span>3000 RPM (Faixa Vermelha)</span>
              </div>
            </div>

            {/* Temperatura do Arrefecimento (Coolant) */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Líquido de Arrefecimento</span>
                <span className={`text-sm font-bold font-mono ${clusterState.coolantTemp >= 102 ? 'text-rose-400' : 'text-blue-400'}`}>
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
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>40°C (Frio)</span>
                <span>85°C (Ideal)</span>
                <span>102°C+ (Superaquecimento)</span>
              </div>
            </div>

            {/* Nível de Combustível (Fuel) */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Nível de Combustível</span>
                <span className={`text-sm font-bold font-mono ${clusterState.fuelLevel <= 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-amber-400"
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
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Interruptores de Setas & Falhas:</span>
            <div className="flex flex-wrap gap-3">
              {/* Seta Esquerda */}
              <button
                onClick={() => onManualOverride({ turnLeft: !clusterState.turnLeft, turnRight: false })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                  clusterState.turnLeft
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-950'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>◀ Seta Esquerda</span>
              </button>

              {/* Seta Direita */}
              <button
                onClick={() => onManualOverride({ turnRight: !clusterState.turnRight, turnLeft: false })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                  clusterState.turnRight
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-950'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>Seta Direita ▶</span>
              </button>

              {/* Pisca-Alerta */}
              <button
                onClick={() => onManualOverride({ hazardLights: !clusterState.hazardLights })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                  clusterState.hazardLights
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pisca-Alerta</span>
              </button>

              {/* Injetar Falha no Motor (Check Engine MIL) */}
              <button
                onClick={() => onManualOverride({ checkEngine: !clusterState.checkEngine })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                  clusterState.checkEngine
                    ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950 animate-pulse'
                    : 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{clusterState.checkEngine ? 'Falha Motor ATIVA' : 'Disparar Check Engine'}</span>
              </button>

              {/* Injetar Falha Geral (Master Warning / Stop) */}
              <button
                onClick={() => onManualOverride({ generalFailure: !clusterState.generalFailure })}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                  clusterState.generalFailure
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950 animate-pulse'
                    : 'bg-slate-800 text-rose-400 border-rose-500/40 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{clusterState.generalFailure ? 'Falha Geral ATIVA' : 'Disparar Falha Geral'}</span>
              </button>

              {/* Freio de Estacionamento */}
              <button
                onClick={() => onManualOverride({ parkingBrake: !clusterState.parkingBrake })}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                  clusterState.parkingBrake
                    ? 'bg-rose-900/60 text-rose-300 border-rose-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Freio de Mão (P)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
