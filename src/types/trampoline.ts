/**
 * Trampoline RTOS (OSEK/VDX & AUTOSAR OS) Architecture Types
 */

export type OsekTaskState = 'SUSPENDED' | 'READY' | 'RUNNING' | 'WAITING';

export interface TrampolineTask {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher number = higher priority in OSEK
  autostart: boolean;
  activation: number; // Max pending activations (usually 1)
  schedule: 'FULL' | 'NON'; // Preemptive or non-preemptive
  periodMs: number; // Execution period or event-driven
  wcetMs: number; // Worst-Case Execution Time in ms
  state: OsekTaskState;
  activationsCount: number;
  totalExecutionMs: number;
  cpuPercentage: number;
  lastStartMs: number;
  stackUsageBytes: number;
  stackSizeMax: number;
  resourcesUsed: string[];
}

export interface TrampolineAlarm {
  id: string;
  name: string;
  counterName: string;
  cycleTimeMs: number;
  action: 'ACTIVATETASK' | 'SETEVENT' | 'ALARMCALLBACK';
  targetTask: string;
  targetEvent?: string;
  nextExpiryMs: number;
  enabled: boolean;
}

export interface TrampolineResource {
  id: string;
  name: string;
  ceilingPriority: number; // Priority Ceiling Protocol (PCP)
  lockedByTask: string | null;
  lockTimestamp: number | null;
}

export interface TrampolineEvent {
  mask: string; // Hex mask e.g. 0x01
  name: string;
  targetTask: string;
}

export interface SchedulerTraceEntry {
  id: string;
  timestamp: number; // RTOS microsecond / millisecond clock
  type: 'TASK_ACTIVATE' | 'TASK_START' | 'TASK_PREEMPT' | 'TASK_TERMINATE' | 'RESOURCE_LOCK' | 'RESOURCE_RELEASE' | 'ALARM_FIRE' | 'CAN_ISR';
  taskName: string;
  details: string;
}

export interface TrampolineOsMetrics {
  systemTickMs: number;
  cpuLoadPercent: number;
  activeTask: string | null;
  contextSwitchCount: number;
  interruptCount: number;
  freeMemoryBytes: number;
  totalMemoryBytes: number;
  conformanceClass: 'BCC1' | 'BCC2' | 'ECC1' | 'ECC2';
}
