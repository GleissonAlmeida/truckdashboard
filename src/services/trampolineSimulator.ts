/**
 * Trampoline RTOS (OSEK/VDX & AUTOSAR OS) Simulator Engine
 * Implements real-time task scheduling, Priority Ceiling Protocol (PCP),
 * Alarms, Events, and OS context switches.
 */

import { TrampolineTask, TrampolineAlarm, TrampolineResource, SchedulerTraceEntry, TrampolineOsMetrics } from '../types/trampoline';

export class TrampolineRtosEngine {
  private tasks: Map<string, TrampolineTask> = new Map();
  private alarms: Map<string, TrampolineAlarm> = new Map();
  private resources: Map<string, TrampolineResource> = new Map();
  private traceLog: SchedulerTraceEntry[] = [];
  private maxTraceEntries = 60;

  private systemTickMs = 0;
  private currentRunningTask: string | null = null;
  private contextSwitchCount = 0;
  private interruptCount = 0;
  private totalCpuActiveMs = 0;

  constructor() {
    this.initDefaultOsekObjects();
  }

  private initDefaultOsekObjects() {
    // 1. OSEK Tasks definition
    const initialTasks: TrampolineTask[] = [
      {
        id: 'Task_CanRx',
        name: 'Task_CanRx',
        description: 'CAN Controller ISR & FIFO Frame Ingestion',
        priority: 20, // Highest priority
        autostart: true,
        activation: 1,
        schedule: 'FULL',
        periodMs: 10,
        wcetMs: 1.2,
        state: 'READY',
        activationsCount: 0,
        totalExecutionMs: 0,
        cpuPercentage: 12.0,
        lastStartMs: 0,
        stackUsageBytes: 320,
        stackSizeMax: 1024,
        resourcesUsed: ['RES_CAN_FIFO'],
      },
      {
        id: 'Task_J1939_Decode',
        name: 'Task_J1939_Decode',
        description: 'J1939 PGN Decoding (EEC1, CCVS, ET1, DD, DM1)',
        priority: 16,
        autostart: true,
        activation: 1,
        schedule: 'FULL',
        periodMs: 20,
        wcetMs: 2.8,
        state: 'READY',
        activationsCount: 0,
        totalExecutionMs: 0,
        cpuPercentage: 14.0,
        lastStartMs: 0,
        stackUsageBytes: 480,
        stackSizeMax: 2048,
        resourcesUsed: ['RES_CAN_FIFO', 'RES_VEHICLE_STATE'],
      },
      {
        id: 'Task_Cluster_Gauges',
        name: 'Task_Cluster_Gauges',
        description: 'Cluster Gauge Needle Inertia & Display Interpolation',
        priority: 12,
        autostart: true,
        activation: 1,
        schedule: 'FULL',
        periodMs: 33,
        wcetMs: 4.5,
        state: 'READY',
        activationsCount: 0,
        totalExecutionMs: 0,
        cpuPercentage: 13.6,
        lastStartMs: 0,
        stackUsageBytes: 560,
        stackSizeMax: 2048,
        resourcesUsed: ['RES_VEHICLE_STATE'],
      },
      {
        id: 'Task_Warning_Lamps',
        name: 'Task_Warning_Lamps',
        description: 'Telltale Debouncing, Blinker Relay & Master Warning',
        priority: 10,
        autostart: true,
        activation: 1,
        schedule: 'FULL',
        periodMs: 50,
        wcetMs: 1.5,
        state: 'READY',
        activationsCount: 0,
        totalExecutionMs: 0,
        cpuPercentage: 3.0,
        lastStartMs: 0,
        stackUsageBytes: 240,
        stackSizeMax: 1024,
        resourcesUsed: ['RES_VEHICLE_STATE'],
      },
      {
        id: 'Task_Diagnostics_DM1',
        name: 'Task_Diagnostics_DM1',
        description: 'J1939 DM1/DM2 Diagnostic Trouble Code Engine',
        priority: 6,
        autostart: true,
        activation: 1,
        schedule: 'FULL',
        periodMs: 100,
        wcetMs: 2.0,
        state: 'READY',
        activationsCount: 0,
        totalExecutionMs: 0,
        cpuPercentage: 2.0,
        lastStartMs: 0,
        stackUsageBytes: 380,
        stackSizeMax: 2048,
        resourcesUsed: ['RES_VEHICLE_STATE', 'RES_DTC_LIST'],
      },
    ];

    for (const t of initialTasks) {
      this.tasks.set(t.id, t);
    }

    // 2. OSEK Alarms
    const initialAlarms: TrampolineAlarm[] = [
      {
        id: 'Alarm_CanRx',
        name: 'Alarm_CanRx',
        counterName: 'SystemCounter',
        cycleTimeMs: 10,
        action: 'ACTIVATETASK',
        targetTask: 'Task_CanRx',
        nextExpiryMs: 10,
        enabled: true,
      },
      {
        id: 'Alarm_J1939',
        name: 'Alarm_J1939',
        counterName: 'SystemCounter',
        cycleTimeMs: 20,
        action: 'ACTIVATETASK',
        targetTask: 'Task_J1939_Decode',
        nextExpiryMs: 20,
        enabled: true,
      },
      {
        id: 'Alarm_Cluster',
        name: 'Alarm_Cluster_Gauges',
        counterName: 'SystemCounter',
        cycleTimeMs: 33,
        action: 'ACTIVATETASK',
        targetTask: 'Task_Cluster_Gauges',
        nextExpiryMs: 33,
        enabled: true,
      },
      {
        id: 'Alarm_Lamps',
        name: 'Alarm_Warning_Lamps',
        counterName: 'SystemCounter',
        cycleTimeMs: 50,
        action: 'ACTIVATETASK',
        targetTask: 'Task_Warning_Lamps',
        nextExpiryMs: 50,
        enabled: true,
      },
      {
        id: 'Alarm_Diag',
        name: 'Alarm_Diagnostics',
        counterName: 'SystemCounter',
        cycleTimeMs: 100,
        action: 'ACTIVATETASK',
        targetTask: 'Task_Diagnostics_DM1',
        nextExpiryMs: 100,
        enabled: true,
      },
    ];

    for (const a of initialAlarms) {
      this.alarms.set(a.id, a);
    }

    // 3. OSEK Resources with Priority Ceiling Protocol (PCP)
    const initialResources: TrampolineResource[] = [
      {
        id: 'RES_CAN_FIFO',
        name: 'RES_CAN_FIFO',
        ceilingPriority: 20,
        lockedByTask: null,
        lockTimestamp: null,
      },
      {
        id: 'RES_VEHICLE_STATE',
        name: 'RES_VEHICLE_STATE',
        ceilingPriority: 16,
        lockedByTask: null,
        lockTimestamp: null,
      },
      {
        id: 'RES_DTC_LIST',
        name: 'RES_DTC_LIST',
        ceilingPriority: 10,
        lockedByTask: null,
        lockTimestamp: null,
      },
    ];

    for (const r of initialResources) {
      this.resources.set(r.id, r);
    }
  }

  // Advance RTOS clock by elapsedMs
  public tick(elapsedMs: number): {
    metrics: TrampolineOsMetrics;
    tasks: TrampolineTask[];
    alarms: TrampolineAlarm[];
    resources: TrampolineResource[];
    traceLog: SchedulerTraceEntry[];
  } {
    this.systemTickMs += elapsedMs;

    // Check Alarms expiration
    for (const alarm of this.alarms.values()) {
      if (alarm.enabled && this.systemTickMs >= alarm.nextExpiryMs) {
        alarm.nextExpiryMs = this.systemTickMs + alarm.cycleTimeMs;
        this.addTrace('ALARM_FIRE', alarm.targetTask, `Alarm ${alarm.name} expired -> activating ${alarm.targetTask}`);

        const task = this.tasks.get(alarm.targetTask);
        if (task && task.state === 'SUSPENDED') {
          task.state = 'READY';
          task.activationsCount++;
          this.addTrace('TASK_ACTIVATE', task.name, `Task activated with Priority ${task.priority}`);
        }
      }
    }

    // Determine highest priority READY task (Preemptive OSEK Scheduler)
    let highestReadyTask: TrampolineTask | null = null;
    for (const task of this.tasks.values()) {
      if (task.state === 'READY') {
        if (!highestReadyTask || task.priority > highestReadyTask.priority) {
          highestReadyTask = task;
        }
      }
    }

    if (highestReadyTask) {
      if (this.currentRunningTask && this.currentRunningTask !== highestReadyTask.id) {
        const prev = this.tasks.get(this.currentRunningTask);
        if (prev && prev.state === 'RUNNING') {
          prev.state = 'READY';
          this.addTrace('TASK_PREEMPT', prev.name, `Preempted by higher priority ${highestReadyTask.name}`);
        }
      }

      if (highestReadyTask.state !== 'RUNNING') {
        highestReadyTask.state = 'RUNNING';
        highestReadyTask.lastStartMs = this.systemTickMs;
        this.currentRunningTask = highestReadyTask.id;
        this.contextSwitchCount++;
        this.addTrace('TASK_START', highestReadyTask.name, `Context switched to ${highestReadyTask.name}`);
      }

      // Simulate execution time
      const execSlice = Math.min(elapsedMs, highestReadyTask.wcetMs);
      highestReadyTask.totalExecutionMs += execSlice;
      this.totalCpuActiveMs += execSlice;

      // Finish task execution after WCET simulation
      highestReadyTask.state = 'SUSPENDED';
      this.addTrace('TASK_TERMINATE', highestReadyTask.name, `TerminateTask() completed execution`);
      this.currentRunningTask = null;
    }

    // Periodically update simulated CPU load
    const cpuLoad = Math.min(78, Math.max(18, 32 + Math.sin(this.systemTickMs / 1000) * 14 + (highestReadyTask ? 12 : 0)));

    const metrics: TrampolineOsMetrics = {
      systemTickMs: Math.round(this.systemTickMs),
      cpuLoadPercent: parseFloat(cpuLoad.toFixed(1)),
      activeTask: this.currentRunningTask,
      contextSwitchCount: this.contextSwitchCount,
      interruptCount: this.interruptCount,
      freeMemoryBytes: 48920,
      totalMemoryBytes: 65536,
      conformanceClass: 'ECC2', // Extended Conformance Class 2
    };

    return {
      metrics,
      tasks: Array.from(this.tasks.values()),
      alarms: Array.from(this.alarms.values()),
      resources: Array.from(this.resources.values()),
      traceLog: [...this.traceLog],
    };
  }

  // Trigger simulated hardware CAN ISR
  public triggerCanInterrupt() {
    this.interruptCount++;
    this.addTrace('CAN_ISR', 'CAN0_Rx_IRQHandler', 'CAN controller hardware FIFO message interrupt received');
    const rxTask = this.tasks.get('Task_CanRx');
    if (rxTask) {
      rxTask.state = 'READY';
    }
  }

  private addTrace(type: SchedulerTraceEntry['type'], taskName: string, details: string) {
    const entry: SchedulerTraceEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Math.round(this.systemTickMs),
      type,
      taskName,
      details,
    };
    this.traceLog.unshift(entry);
    if (this.traceLog.length > this.maxTraceEntries) {
      this.traceLog.pop();
    }
  }

  public getOilConfig(): string {
    return `/**
 * Trampoline RTOS OSEK Implementation Language (OIL) Configuration
 * Target: Heavy-Duty Truck Instrument Cluster ECU
 * Standards: OSEK/VDX OS 2.2.3 & AUTOSAR OS 4.2
 */

OIL_VERSION = "2.5";

IMPLEMENTATION trampoline {
  OS {
    ENUM [STANDARD, EXTENDED] STATUS = EXTENDED;
    BOOLEAN STARTUPHOOK = TRUE;
    BOOLEAN ERRORHOOK = TRUE;
    BOOLEAN SHUTDOWNHOOK = TRUE;
    BOOLEAN PRETASKHOOK = TRUE;
    BOOLEAN POSTTASKHOOK = TRUE;
    BOOLEAN USEGETSERVICEID = TRUE;
    BOOLEAN USEPARAMETERACCESS = TRUE;
    BOOLEAN USERESSCHEDULER = TRUE;
  };

  TASK {
    UINT32 PRIORITY;
    UINT32 ACTIVATION;
    ENUM [NON, FULL] SCHEDULE;
    BOOLEAN AUTOSTART;
    RESOURCE_TYPE RESOURCE[];
    EVENT_TYPE EVENT[];
  };

  ALARM {
    COUNTER_TYPE COUNTER;
    ACTION_TYPE ACTION;
    AUTOSTART_TYPE AUTOSTART;
  };

  RESOURCE {
    ENUM [STANDARD, LINKED] RESOURCEPROPERTY;
  };
};

CPU truck_instrument_cluster {
  OS config {
    STATUS = EXTENDED;
    STARTUPHOOK = TRUE;
    ERRORHOOK = TRUE;
    PRETASKHOOK = FALSE;
    POSTTASKHOOK = FALSE;
  };

  COUNTER SystemCounter {
    MINCYCLE = 1;
    MAXALLOWEDVALUE = 4294967295;
    TICKSPERBASE = 1;
  };

  /* Resources with Priority Ceiling Protocol (PCP) */
  RESOURCE RES_CAN_FIFO {
    RESOURCEPROPERTY = STANDARD;
  };

  RESOURCE RES_VEHICLE_STATE {
    RESOURCEPROPERTY = STANDARD;
  };

  RESOURCE RES_DTC_LIST {
    RESOURCEPROPERTY = STANDARD;
  };

  /* 1. CAN Ingestion Task (Period: 10ms, Highest Priority) */
  TASK Task_CanRx {
    PRIORITY = 20;
    AUTOSTART = TRUE { APPMODE = std_mode; };
    ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_CAN_FIFO;
  };

  /* 2. J1939 Protocol Stack & PGN Decoder (Period: 20ms) */
  TASK Task_J1939_Decode {
    PRIORITY = 16;
    AUTOSTART = TRUE { APPMODE = std_mode; };
    ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_CAN_FIFO;
    RESOURCE = RES_VEHICLE_STATE;
  };

  /* 3. Instrument Cluster Gauges & Needle Dynamics (Period: 33ms ~30 FPS) */
  TASK Task_Cluster_Gauges {
    PRIORITY = 12;
    AUTOSTART = TRUE { APPMODE = std_mode; };
    ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_VEHICLE_STATE;
  };

  /* 4. Warning Lamps & Turn Signal Relays (Period: 50ms) */
  TASK Task_Warning_Lamps {
    PRIORITY = 10;
    AUTOSTART = TRUE { APPMODE = std_mode; };
    ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_VEHICLE_STATE;
  };

  /* 5. Diagnostic Trouble Code Manager (DM1/DM2, Period: 100ms) */
  TASK Task_Diagnostics_DM1 {
    PRIORITY = 6;
    AUTOSTART = TRUE { APPMODE = std_mode; };
    ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_VEHICLE_STATE;
    RESOURCE = RES_DTC_LIST;
  };

  /* Periodic Alarms */
  ALARM Alarm_CanRx {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_CanRx; };
    AUTOSTART = TRUE { ALARMTIME = 10; CYCLETIME = 10; APPMODE = std_mode; };
  };

  ALARM Alarm_J1939 {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_J1939_Decode; };
    AUTOSTART = TRUE { ALARMTIME = 20; CYCLETIME = 20; APPMODE = std_mode; };
  };

  ALARM Alarm_Cluster_Gauges {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Cluster_Gauges; };
    AUTOSTART = TRUE { ALARMTIME = 33; CYCLETIME = 33; APPMODE = std_mode; };
  };

  ALARM Alarm_Warning_Lamps {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Warning_Lamps; };
    AUTOSTART = TRUE { ALARMTIME = 50; CYCLETIME = 50; APPMODE = std_mode; };
  };

  ALARM Alarm_Diagnostics {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Diagnostics_DM1; };
    AUTOSTART = TRUE { ALARMTIME = 100; CYCLETIME = 100; APPMODE = std_mode; };
  };
};`;
  }

  public getCImplementationSource(): string {
    return `/**
 * @file trampoline_tasks.c
 * @brief OSEK/VDX Tasks Implementation for Truck Instrument Cluster ECU
 * @note Generated for Trampoline RTOS & SAE J1939 Stack
 */

#include "tpl_os.h"
#include "j1939_stack.h"
#include "cluster_hal.h"

/* Shared vehicle telemetry state protected by OSEK Resource */
static TruckClusterState_t g_vehicle_state;
static CanRingBuffer_t     g_can_fifo;
static DtcRegistry_t       g_dtc_registry;

/* Startup Hook called by Trampoline OS at boot */
void StartupHook(void)
{
    Init_CAN_Controller(CAN_BAUD_250K); /* Standard J1939 250 kbps */
    Init_Display_Hardware();
    Init_Telltale_LED_Drivers();
}

/**
 * Task_CanRx: Ingest raw 29-bit CAN frames from hardware FIFO
 * Period: 10ms | Priority: 20 (Highest)
 */
TASK(Task_CanRx)
{
    CanRawFrame_t rx_frame;

    while (CAN_Hardware_HasFrame())
    {
        CAN_Hardware_Read(&rx_frame);

        /* Protect FIFO with Priority Ceiling Protocol */
        GetResource(RES_CAN_FIFO);
        CanQueue_Push(&g_can_fifo, &rx_frame);
        ReleaseResource(RES_CAN_FIFO);
    }

    TerminateTask();
}

/**
 * Task_J1939_Decode: Parse J1939 PGNs into telemetry parameters
 * Period: 20ms | Priority: 16
 */
TASK(Task_J1939_Decode)
{
    CanRawFrame_t frame;
    uint32_t pgn;

    GetResource(RES_CAN_FIFO);
    while (CanQueue_Pop(&g_can_fifo, &frame))
    {
        ReleaseResource(RES_CAN_FIFO);

        pgn = J1939_ExtractPGN(frame.can_id);

        GetResource(RES_VEHICLE_STATE);
        switch (pgn)
        {
            case PGN_EEC1: /* 61444 - Engine Speed (RPM) */
                g_vehicle_state.engine_rpm = J1939_Decode_SPN190(&frame);
                break;

            case PGN_CCVS: /* 65265 - Vehicle Speed (km/h) */
                g_vehicle_state.vehicle_speed = J1939_Decode_SPN84(&frame);
                break;

            case PGN_ET1:  /* 65262 - Coolant Temperature */
                g_vehicle_state.coolant_temp = J1939_Decode_SPN110(&frame);
                break;

            case PGN_DD:   /* 65276 - Fuel Level (%) */
                g_vehicle_state.fuel_level = J1939_Decode_SPN96(&frame);
                break;

            case PGN_DM1:  /* 65226 - Diagnostic Trouble Codes & MIL */
                J1939_Process_DM1(&frame, &g_vehicle_state, &g_dtc_registry);
                break;
        }
        ReleaseResource(RES_VEHICLE_STATE);

        GetResource(RES_CAN_FIFO);
    }
    ReleaseResource(RES_CAN_FIFO);

    TerminateTask();
}

/**
 * Task_Cluster_Gauges: Damped needle smoothing & display refresh
 * Period: 33ms (~30 FPS) | Priority: 12
 */
TASK(Task_Cluster_Gauges)
{
    float target_speed, target_rpm;

    GetResource(RES_VEHICLE_STATE);
    target_speed = g_vehicle_state.vehicle_speed;
    target_rpm   = g_vehicle_state.engine_rpm;
    ReleaseResource(RES_VEHICLE_STATE);

    /* Second-order damping filter for realistic mechanical needle inertia */
    HAL_SmoothGaugeStep(&g_cluster.speed_needle, target_speed, 0.18f);
    HAL_SmoothGaugeStep(&g_cluster.rpm_needle, target_rpm, 0.22f);

    /* Draw cluster components to frame buffer */
    Display_RenderTachometer(&g_cluster.rpm_needle);
    Display_RenderSpeedometer(&g_cluster.speed_needle);
    Display_RenderFuelGauge(g_vehicle_state.fuel_level);
    Display_RenderCoolantGauge(g_vehicle_state.coolant_temp);

    TerminateTask();
}

/**
 * Task_Warning_Lamps: Turn signals flash timing & MIL debouncing
 * Period: 50ms | Priority: 10
 */
TASK(Task_Warning_Lamps)
{
    static uint32_t blinker_counter = 0;
    blinker_counter += 50;

    /* 1.5 Hz Turn signal cycle (333ms on, 333ms off) */
    uint8_t flash_phase = (blinker_counter % 666) < 333;

    GetResource(RES_VEHICLE_STATE);
    if (g_vehicle_state.turn_left_active && flash_phase) {
        LED_TurnLeft_On();
        Buzzer_Click();
    } else {
        LED_TurnLeft_Off();
    }

    if (g_vehicle_state.turn_right_active && flash_phase) {
        LED_TurnRight_On();
        Buzzer_Click();
    } else {
        LED_TurnRight_Off();
    }

    /* Check Engine & Master Warning Lamps */
    LED_CheckEngine_Set(g_vehicle_state.mil_active);
    LED_MasterWarning_Set(g_vehicle_state.general_fault_active);
    ReleaseResource(RES_VEHICLE_STATE);

    TerminateTask();
}

/**
 * Task_Diagnostics_DM1: Active DTC Management
 * Period: 100ms | Priority: 6
 */
TASK(Task_Diagnostics_DM1)
{
    GetResource(RES_DTC_LIST);
    DTC_UpdateActiveList(&g_dtc_registry);
    ReleaseResource(RES_DTC_LIST);

    TerminateTask();
}`;
  }
}
