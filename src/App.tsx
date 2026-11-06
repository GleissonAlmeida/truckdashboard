import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { InstrumentCluster } from './components/InstrumentCluster';
import { J1939LogPlayer } from './components/J1939LogPlayer';
import { TrampolineInspector } from './components/TrampolineInspector';
import { TrampolineCodeViewer } from './components/TrampolineCodeViewer';
import { DocumentationView } from './components/DocumentationView';
import { TruckClusterState, J1939Scenario, J1939Frame } from './types/j1939';
import {
  getInitialClusterState,
  generatePrebuiltScenarios,
  decodeJ1939FrameToState,
} from './services/j1939Decoder';
import { TrampolineRtosEngine } from './services/trampolineSimulator';
import { truckAudio } from './services/audioSynthesizer';
import { Gauge, Radio, Cpu, FileCode2, BookOpen } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'cluster' | 'player' | 'inspector' | 'code' | 'docs'>('cluster');
  const [clusterState, setClusterState] = useState<TruckClusterState>(getInitialClusterState);
  const [scenarios, setScenarios] = useState<J1939Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<J1939Scenario | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [recentFrames, setRecentFrames] = useState<J1939Frame[]>([]);
  const [blinkerPhase, setBlinkerPhase] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Trampoline RTOS Engine instance
  const rtosEngineRef = useRef<TrampolineRtosEngine | null>(null);
  if (!rtosEngineRef.current) {
    rtosEngineRef.current = new TrampolineRtosEngine();
  }

  const [rtosData, setRtosData] = useState(() =>
    rtosEngineRef.current!.tick(0)
  );

  // Initialize Prebuilt Scenarios
  useEffect(() => {
    const list = generatePrebuiltScenarios();
    setScenarios(list);
    setActiveScenario(list[0]);
    setRecentFrames(list[0].frames.slice(0, 30));
  }, []);

  // Blinker relay timer (1.5 Hz = 333ms state flip)
  useEffect(() => {
    const blinkerInterval = setInterval(() => {
      setBlinkerPhase((prev) => {
        const next = !prev;
        // Trigger relay audio click if any blinker is active
        if (clusterState.turnLeft || clusterState.turnRight || clusterState.hazardLights) {
          truckAudio.playRelayClick(next);
        }
        return next;
      });
    }, 333);

    return () => clearInterval(blinkerInterval);
  }, [clusterState.turnLeft, clusterState.turnRight, clusterState.hazardLights]);

  // Audio alert trigger when fault activates
  const prevFaultsRef = useRef({ checkEngine: false, generalFailure: false });
  useEffect(() => {
    if (
      (!prevFaultsRef.current.checkEngine && clusterState.checkEngine) ||
      (!prevFaultsRef.current.generalFailure && clusterState.generalFailure)
    ) {
      if (clusterState.generalFailure) {
        truckAudio.playCriticalAlarm();
      } else {
        truckAudio.playWarningChime();
      }
    }
    prevFaultsRef.current = {
      checkEngine: clusterState.checkEngine,
      generalFailure: clusterState.generalFailure,
    };
  }, [clusterState.checkEngine, clusterState.generalFailure]);

  const simTimeRef = useRef(0);

  // Main RTOS Simulation & J1939 Frame Playback Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = setInterval(() => {
      const now = performance.now();
      const deltaMs = Math.min(100, now - lastTime);
      lastTime = now;

      // 1. Advance Trampoline RTOS Scheduler
      if (rtosEngineRef.current) {
        const updated = rtosEngineRef.current.tick(deltaMs);
        setRtosData(updated);
      }

      // 2. Advance J1939 Frame Player accurately based on simulated time
      if (isPlaying && activeScenario && activeScenario.frames.length > 0) {
        const elapsedSec = (deltaMs / 1000) * playbackSpeed;
        const prevTime = simTimeRef.current;
        let newTime = prevTime + elapsedSec;

        if (newTime >= activeScenario.durationSeconds) {
          // Loop back to start
          simTimeRef.current = 0;
          setCurrentFrameIndex(0);
          if (activeScenario.frames[0]) {
            setClusterState((prev) => decodeJ1939FrameToState(activeScenario.frames[0], prev));
          }
        } else {
          simTimeRef.current = newTime;

          // Process all frames that occurred up to newTime
          let lastIdx = currentFrameIndex;
          const framesToProcess: J1939Frame[] = [];

          for (let i = currentFrameIndex; i < activeScenario.frames.length; i++) {
            const f = activeScenario.frames[i];
            if (f.timestamp <= newTime) {
              framesToProcess.push(f);
              lastIdx = i;
            } else {
              break;
            }
          }

          if (framesToProcess.length > 0) {
            setClusterState((prev) => {
              let next = prev;
              for (const f of framesToProcess) {
                next = decodeJ1939FrameToState(f, next);
              }
              return next;
            });
            setCurrentFrameIndex(lastIdx);
            setRecentFrames((prevFrames) => {
              const newest = [...framesToProcess].reverse();
              return [...newest, ...prevFrames].slice(0, 50);
            });
          }
        }
      }
    }, 50); // 20 Hz simulation tick

    return () => clearInterval(loop);
  }, [isPlaying, activeScenario, playbackSpeed, currentFrameIndex]);

  // Handlers
  const handleSelectScenario = (sc: J1939Scenario) => {
    simTimeRef.current = 0;
    setActiveScenario(sc);
    setCurrentFrameIndex(0);
    setRecentFrames(sc.frames.slice(0, 30));
    if (sc.frames.length > 0) {
      setClusterState((prev) => decodeJ1939FrameToState(sc.frames[0], prev));
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    simTimeRef.current = 0;
    setCurrentFrameIndex(0);
    if (activeScenario && activeScenario.frames.length > 0) {
      setClusterState((prev) => decodeJ1939FrameToState(activeScenario.frames[0], prev));
    }
  };

  const handleSeek = (index: number) => {
    setCurrentFrameIndex(index);
    if (activeScenario && activeScenario.frames[index]) {
      simTimeRef.current = activeScenario.frames[index].timestamp;
      setClusterState((prev) => decodeJ1939FrameToState(activeScenario.frames[index], prev));
    }
  };

  const handleUploadCustomLog = (frames: J1939Frame[], fileName: string) => {
    const customScenario: J1939Scenario = {
      id: `custom-${Date.now()}`,
      title: `Log Carregado: ${fileName}`,
      description: `Arquivo customizado contendo ${frames.length} quadros J1939.`,
      durationSeconds: parseFloat((frames[frames.length - 1]?.timestamp || 30).toFixed(1)),
      framesCount: frames.length,
      keyEvents: ['Importação customizada de barramento CAN'],
      frames,
    };

    simTimeRef.current = 0;
    setScenarios((prev) => [customScenario, ...prev]);
    setActiveScenario(customScenario);
    setCurrentFrameIndex(0);
    setRecentFrames(frames.slice(0, 40));
    setIsPlaying(true);
  };

  const handleManualOverride = (partial: Partial<TruckClusterState>) => {
    setClusterState((prev) => ({ ...prev, ...partial }));
    if (rtosEngineRef.current) {
      rtosEngineRef.current.triggerCanInterrupt();
    }
  };

  const [showResetToast, setShowResetToast] = useState<string | null>(null);

  const handleClearDTCs = useCallback(() => {
    setClusterState((prev) => ({
      ...prev,
      checkEngine: false,
      generalFailure: false,
      activeDTCs: [],
    }));
    if (rtosEngineRef.current) {
      rtosEngineRef.current.recordDtcClear();
      setRtosData(rtosEngineRef.current.tick(0));
    }
    setShowResetToast('Flags de DTC limpos com sucesso (SAE J1939 DM11)! Lâmpadas de Check Engine e Falha Geral apagadas.');
    setTimeout(() => setShowResetToast(null), 4000);
  }, []);

  const handleFullReset = useCallback(() => {
    const initial = getInitialClusterState();
    setClusterState(initial);
    setCurrentFrameIndex(0);
    if (activeScenario && activeScenario.frames.length > 0) {
      setRecentFrames(activeScenario.frames.slice(0, 30));
    }
    if (rtosEngineRef.current) {
      rtosEngineRef.current.reset();
      setRtosData(rtosEngineRef.current.tick(0));
    }
    setShowResetToast('Simulação reiniciada por completo: mostradores restaurados aos valores padrão e todos os DTCs limpos.');
    setTimeout(() => setShowResetToast(null), 4000);
  }, [activeScenario]);

  const handleTriggerCanInterrupt = useCallback(() => {
    if (rtosEngineRef.current) {
      rtosEngineRef.current.triggerCanInterrupt();
    }
  }, []);

  const handleToggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    truckAudio.setMuted(next);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Universal Top Navigation Header */}
      <Header
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        hasActiveFaults={clusterState.checkEngine || clusterState.generalFailure || clusterState.activeDTCs.length > 0}
        onClearFaults={handleClearDTCs}
        onFullReset={handleFullReset}
      />

      {/* Floating Confirmation Toast for Reset & DTC Clearing */}
      {showResetToast && (
        <div className="w-full max-w-2xl mx-auto px-4 mt-3">
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-xl shadow-emerald-950/60 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{showResetToast}</span>
            </div>
            <button
              onClick={() => setShowResetToast(null)}
              className="text-emerald-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex items-center justify-between p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('cluster')}
            className={`flex-1 py-2 font-medium rounded-lg flex items-center justify-center gap-1.5 ${
              currentTab === 'cluster' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Cluster</span>
          </button>
          <button
            onClick={() => setCurrentTab('player')}
            className={`flex-1 py-2 font-medium rounded-lg flex items-center justify-center gap-1.5 ${
              currentTab === 'player' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>J1939</span>
          </button>
          <button
            onClick={() => setCurrentTab('inspector')}
            className={`flex-1 py-2 font-medium rounded-lg flex items-center justify-center gap-1.5 ${
              currentTab === 'inspector' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>RTOS</span>
          </button>
          <button
            onClick={() => setCurrentTab('code')}
            className={`flex-1 py-2 font-medium rounded-lg flex items-center justify-center gap-1.5 ${
              currentTab === 'code' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>OIL/C</span>
          </button>
          <button
            onClick={() => setCurrentTab('docs')}
            className={`flex-1 py-2 font-medium rounded-lg flex items-center justify-center gap-1.5 ${
              currentTab === 'docs' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
        </div>

        {/* ALWAYS RENDER INSTRUMENT CLUSTER AT TOP FOR QUICK VISUAL IMMERSION */}
        <section className="w-full">
          <InstrumentCluster
            state={clusterState}
            blinkerPhase={blinkerPhase}
            rtosTickMs={rtosData.metrics.systemTickMs}
            onClearDTCs={handleClearDTCs}
          />
        </section>

        {/* SECONDARY VIEW PANELS: J1939 PLAYER / RTOS INSPECTOR / OIL & C ARCHITECTURE / DOCUMENTATION */}
        <section className="w-full">
          {currentTab === 'cluster' && activeScenario && (
            <div className="w-full flex flex-col gap-6">
              {/* Quick Compact Player Bar directly below cluster */}
              <J1939LogPlayer
                scenarios={scenarios}
                activeScenario={activeScenario}
                onSelectScenario={handleSelectScenario}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onFullReset={handleFullReset}
                onClearDTCs={handleClearDTCs}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                currentFrameIndex={currentFrameIndex}
                totalFrames={activeScenario.frames.length}
                onSeek={handleSeek}
                recentFrames={recentFrames}
                onUploadCustomLog={handleUploadCustomLog}
                clusterState={clusterState}
                onManualOverride={handleManualOverride}
              />
            </div>
          )}

          {currentTab === 'player' && activeScenario && (
            <J1939LogPlayer
              scenarios={scenarios}
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onFullReset={handleFullReset}
              onClearDTCs={handleClearDTCs}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              currentFrameIndex={currentFrameIndex}
              totalFrames={activeScenario.frames.length}
              onSeek={handleSeek}
              recentFrames={recentFrames}
              onUploadCustomLog={handleUploadCustomLog}
              clusterState={clusterState}
              onManualOverride={handleManualOverride}
            />
          )}

          {currentTab === 'inspector' && (
            <TrampolineInspector
              metrics={rtosData.metrics}
              tasks={rtosData.tasks}
              alarms={rtosData.alarms}
              resources={rtosData.resources}
              traceLog={rtosData.traceLog}
              onTriggerCanInterrupt={handleTriggerCanInterrupt}
              onFullReset={handleFullReset}
              onClearDTCs={handleClearDTCs}
            />
          )}

          {currentTab === 'code' && rtosEngineRef.current && (
            <TrampolineCodeViewer
              oilCode={rtosEngineRef.current.getOilConfig()}
              cCode={rtosEngineRef.current.getCImplementationSource()}
            />
          )}

          {currentTab === 'docs' && <DocumentationView />}
        </section>
      </main>

      {/* Engineering Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Trampoline RTOS (OSEK/VDX 2.2.3 &amp; AUTOSAR OS 4.2) · Simulador SAE J1939</span>
          <span>ISO 11898-2 CAN 2.0B · 250 kbps · Heavy-Duty Commercial Vehicle Cluster</span>
        </div>
      </footer>
    </div>
  );
}
