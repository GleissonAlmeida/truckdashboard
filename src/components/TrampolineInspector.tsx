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
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top RTOS Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CARGA DA CPU</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.cpuLoadPercent.toFixed(1)}%
            </span>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  metrics.cpuLoadPercent > 70 ? 'bg-rose-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, metrics.cpuLoadPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* System Clock Tick */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CLOCK DO SISTEMA</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {(metrics.systemTickMs / 1000).toFixed(2)}s
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              {metrics.systemTickMs} ticks (1 ms base)
            </span>
          </div>
        </div>

        {/* Context Switches */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TROCAS DE CONTEXTO</span>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.contextSwitchCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Preempção OSEK Ativa
            </span>
          </div>
        </div>

        {/* Interrupts & Conformance */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CONFORMIDADE OS</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics.conformanceClass}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              AUTOSAR OS 4.2 / OSEK
            </span>
          </div>
        </div>
      </div>

      {/* Main OSEK Tasks Grid */}
      <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Tarefas OSEK/VDX de Tempo Real (Trampoline RTOS)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {onClearDTCs && (
              <button
                onClick={onClearDTCs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold shadow transition-colors"
                title="Limpar flags de DTC ativos (DM11)"
              >
                <span>Limpar DTCs</span>
              </button>
            )}

            {onFullReset && (
              <button
                onClick={onFullReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold shadow transition-colors"
                title="Reiniciar Kernel Trampoline RTOS e toda a simulação"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar RTOS</span>
              </button>
            )}

            <button
              onClick={onTriggerCanInterrupt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition-colors"
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
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-950'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-bold text-white">{task.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRunning
                          ? 'bg-cyan-500 text-slate-950'
                          : isReady
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{task.description}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prioridade:</span>
                    <span className="font-bold text-cyan-400">{task.priority} (Alta)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Período:</span>
                    <span>{task.periodMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">WCET Estimado:</span>
                    <span>{task.wcetMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stack Usado:</span>
                    <span>{task.stackUsageBytes} / {task.stackSizeMax} B</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
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
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Alarmes Periódicos OSEK (Trampoline)
            </h4>
          </div>
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                  <th className="py-1">Nome do Alarme</th>
                  <th className="py-1">Ciclo</th>
                  <th className="py-1">Ação</th>
                  <th className="py-1">Tarefa Alvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {alarms.map((a) => (
                  <tr key={a.id}>
                    <td className="py-1.5 text-emerald-400 font-semibold">{a.name}</td>
                    <td className="py-1.5">{a.cycleTimeMs} ms</td>
                    <td className="py-1.5 text-slate-400">{a.action}</td>
                    <td className="py-1.5 text-white font-bold">{a.targetTask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resources Table (Priority Ceiling Protocol) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Recursos com Protocolo de Teto de Prioridade (PCP)
            </h4>
          </div>
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                  <th className="py-1">Recurso OSEK</th>
                  <th className="py-1">Teto (PCP)</th>
                  <th className="py-1">Status de Bloqueio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td className="py-1.5 text-purple-400 font-semibold">{r.name}</td>
                    <td className="py-1.5 text-amber-300 font-bold">Pri {r.ceilingPriority}</td>
                    <td className="py-1.5">
                      {r.lockedByTask ? (
                        <span className="text-rose-400 font-bold">Bloqueado por {r.lockedByTask}</span>
                      ) : (
                        <span className="text-emerald-400">Livre</span>
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
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Log de Rastreamento do Escalonador Trampoline (Scheduler Trace)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Últimos {traceLog.length} eventos</span>
        </div>

        <div className="max-h-60 overflow-y-auto font-mono text-xs flex flex-col gap-1 divide-y divide-slate-800/50">
          {traceLog.map((entry) => {
            let badgeColor = 'text-slate-400 bg-slate-800';
            if (entry.type === 'CAN_ISR') badgeColor = 'text-rose-400 bg-rose-950/80 border border-rose-500/40';
            else if (entry.type === 'TASK_START') badgeColor = 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40';
            else if (entry.type === 'TASK_PREEMPT') badgeColor = 'text-amber-400 bg-amber-950/80 border border-amber-500/40';
            else if (entry.type === 'ALARM_FIRE') badgeColor = 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40';

            return (
              <div key={entry.id} className="pt-1 flex items-start gap-3">
                <span className="text-slate-500 text-[10px] tabular-nums shrink-0 mt-0.5">
                  {(entry.timestamp / 1000).toFixed(3)}s
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${badgeColor}`}>
                  {entry.type}
                </span>
                <span className="text-slate-300 font-semibold shrink-0">{entry.taskName}</span>
                <span className="text-slate-400 truncate">{entry.details}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
