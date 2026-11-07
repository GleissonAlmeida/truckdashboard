import React from 'react';
import { Cpu, Activity, Clock, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import {
  TrampolineTask,
  TrampolineAlarm,
  TrampolineResource,
  SchedulerTraceEntry,
  TrampolineOsMetrics,
} from '../types/trampoline';

interface TrampolineInspectorProps {
  metrics: TrampolineOsMetrics;
  tasks: TrampolineTask[];
  alarms: TrampolineAlarm[];
  resources: TrampolineResource[];
  traceLog: SchedulerTraceEntry[];
  onTriggerCanInterrupt: () => void;
  onFullReset?: () => void;
  onClearDTCs?: () => void;
  theme?: 'light' | 'dark';
}

export const TrampolineInspector: React.FC<TrampolineInspectorProps> = ({
  metrics,
  tasks,
  alarms,
  resources,
  traceLog,
  onTriggerCanInterrupt,
  onFullReset,
  onClearDTCs,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top RTOS Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>CARGA DA CPU</span>
            <Activity className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {metrics.cpuLoadPercent.toFixed(1)}%
            </span>
            <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              <div
                className={`h-full transition-all duration-300 ${
                  metrics.cpuLoadPercent > 70 ? 'bg-rose-500' : isLight ? 'bg-cyan-600' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, metrics.cpuLoadPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* System Clock Tick */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>CLOCK DO SISTEMA</span>
            <Clock className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {(metrics.systemTickMs / 1000).toFixed(2)}s
            </span>
            <span className={`text-[10px] font-mono block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              {metrics.systemTickMs} ticks (1 ms base)
            </span>
          </div>
        </div>

        {/* Context Switches */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>TROCAS DE CONTEXTO</span>
            <RefreshCw className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {metrics.contextSwitchCount.toLocaleString()}
            </span>
            <span className={`text-[10px] font-mono block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Preempção OSEK Ativa
            </span>
          </div>
        </div>

        {/* Interrupts & Conformance */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>CONFORMIDADE OS</span>
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {metrics.conformanceClass}
            </span>
            <span className={`text-[10px] font-mono block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              AUTOSAR OS 4.2 / OSEK
            </span>
          </div>
        </div>
      </div>

      {/* Main OSEK Tasks Grid */}
      <div
        className={`w-full rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-800 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        <div className={`flex flex-wrap items-center justify-between border-b pb-3 gap-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            <h3 className={`text-sm font-bold uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Tarefas OSEK/VDX de Tempo Real (Trampoline RTOS)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {onClearDTCs && (
              <button
                onClick={onClearDTCs}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-amber-600/80 hover:bg-amber-500 text-slate-950'
                }`}
                title="Limpar flags de DTC ativos (DM11)"
              >
                <span>Limpar DTCs</span>
              </button>
            )}

            {onFullReset && (
              <button
                onClick={onFullReset}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Reiniciar Kernel Trampoline RTOS e toda a simulação"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar RTOS</span>
              </button>
            )}

            <button
              onClick={onTriggerCanInterrupt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
              title="Disparar Interrupção de Hardware CAN (CAN0_Rx_IRQHandler)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Disparar ISR CAN</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isRunning = task.state === 'RUNNING';
            const isReady = task.state === 'READY';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isRunning
                    ? isLight
                      ? 'bg-cyan-50/90 border-cyan-500 shadow-sm text-slate-800'
                      : 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-950 text-slate-200'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{task.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRunning
                          ? isLight
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-500 text-slate-950'
                          : isReady
                          ? isLight
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isLight
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.state}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {task.description}
                  </p>
                </div>

                <div className={`border-t pt-2 grid grid-cols-2 gap-2 text-xs font-mono ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800/80 text-slate-300'}`}>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Prioridade:</span>
                    <span className={`font-bold ${isLight ? 'text-cyan-800 font-bold' : 'text-cyan-400'}`}>{task.priority} (Alta)</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Período:</span>
                    <span>{task.periodMs} ms</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>WCET Estimado:</span>
                    <span>{task.wcetMs} ms</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Stack Usado:</span>
                    <span>{task.stackUsageBytes} / {task.stackSizeMax} B</span>
                  </div>
                </div>

                <div className={`border-t pt-1.5 flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-500'}`}>
                  <span>Recursos: {task.resourcesUsed.join(', ')}</span>
                  <span>{task.activationsCount} ativ.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alarms and Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alarms Table */}
        <div
          className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <Clock className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
            <h4 className={`text-xs font-bold uppercase font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Alarmes Periódicos OSEK (Trampoline)
            </h4>
          </div>
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b text-[10px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-1">Nome do Alarme</th>
                  <th className="py-1">Ciclo</th>
                  <th className="py-1">Ação</th>
                  <th className="py-1">Tarefa Alvo</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
                {alarms.map((a) => (
                  <tr key={a.id}>
                    <td className={`py-1.5 font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{a.name}</td>
                    <td className="py-1.5">{a.cycleTimeMs} ms</td>
                    <td className={`py-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{a.action}</td>
                    <td className={`py-1.5 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{a.targetTask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resources Table (Priority Ceiling Protocol) */}
        <div
          className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className={`flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <Layers className={`w-4 h-4 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            <h4 className={`text-xs font-bold uppercase font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Recursos com Protocolo de Teto de Prioridade (PCP)
            </h4>
          </div>
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b text-[10px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-1">Recurso OSEK</th>
                  <th className="py-1">Teto (PCP)</th>
                  <th className="py-1">Status de Bloqueio</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td className={`py-1.5 font-semibold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>{r.name}</td>
                    <td className={`py-1.5 font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>Pri {r.ceilingPriority}</td>
                    <td className="py-1.5">
                      {r.lockedByTask ? (
                        <span className={`font-bold ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>Bloqueado por {r.lockedByTask}</span>
                      ) : (
                        <span className={isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'}>Livre</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scheduler Live Trace Log */}
      <div
        className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-800 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            <h4 className={`text-xs font-bold uppercase font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Log de Rastreamento do Escalonador Trampoline (Scheduler Trace)
            </h4>
          </div>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Últimos {traceLog.length} eventos</span>
        </div>

        <div className={`max-h-60 overflow-y-auto font-mono text-xs flex flex-col gap-1 divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/50'}`}>
          {traceLog.map((entry) => {
            let badgeColor = isLight ? 'text-slate-700 bg-slate-100' : 'text-slate-400 bg-slate-800';
            if (entry.type === 'CAN_ISR') {
              badgeColor = isLight ? 'text-rose-800 bg-rose-100 border border-rose-300' : 'text-rose-400 bg-rose-950/80 border border-rose-500/40';
            } else if (entry.type === 'TASK_START') {
              badgeColor = isLight ? 'text-cyan-800 bg-cyan-100 border border-cyan-300' : 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40';
            } else if (entry.type === 'TASK_PREEMPT') {
              badgeColor = isLight ? 'text-amber-800 bg-amber-100 border border-amber-300' : 'text-amber-400 bg-amber-950/80 border border-amber-500/40';
            } else if (entry.type === 'ALARM_FIRE') {
              badgeColor = isLight ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' : 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40';
            }

            return (
              <div key={entry.id} className="pt-1 flex items-start gap-3">
                <span className={`text-[10px] tabular-nums shrink-0 mt-0.5 ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  {(entry.timestamp / 1000).toFixed(3)}s
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${badgeColor}`}>
                  {entry.type}
                </span>
                <span className={`font-semibold shrink-0 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>{entry.taskName}</span>
                <span className={`truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{entry.details}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
