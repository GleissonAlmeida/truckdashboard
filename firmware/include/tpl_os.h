/**
 * @file tpl_os.h
 * @brief OSEK/VDX 2.2.3 and Trampoline RTOS Standard API Header
 * @target Commercial Truck Instrument Cluster Module (ICM)
 * @standards OSEK/VDX OS 2.2.3, AUTOSAR OS 4.2, ISO 26262 ASIL-B
 */

#ifndef TPL_OS_H
#define TPL_OS_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* OSEK Standard Status Codes */
typedef uint8_t StatusType;

#define E_OK                    0x00U
#define E_OS_ACCESS             0x01U
#define E_OS_CALLEVEL           0x02U
#define E_OS_ID                 0x03U
#define E_OS_LIMIT              0x04U
#define E_OS_NOFUNC             0x05U
#define E_OS_RESOURCE           0x06U
#define E_OS_STATE              0x07U
#define E_OS_VALUE              0x08U

/* Task States */
typedef enum {
    SUSPENDED = 0,
    READY     = 1,
    RUNNING   = 2,
    WAITING   = 3
} TaskStateType;

typedef uint8_t TaskType;
typedef uint8_t ResourceType;
typedef uint8_t EventMaskType;
typedef uint8_t AlarmType;
typedef uint32_t TickType;
typedef uint8_t AppModeType;

/* Application Modes */
#define OSDEFAULTAPPMODE        0x01U
#define std_operation           0x01U

/* Task Function Declaration Macros */
#define TASK(TaskName)          void TaskName##_func(void)
#define ISR(IsrName)            void IsrName##_func(void)

#define DeclareTask(TaskName)   extern void TaskName##_func(void)
#define DeclareResource(ResName)
#define DeclareAlarm(AlarmName)
#define DeclareEvent(EventName)

/* Core OSEK System Services */
StatusType ActivateTask(TaskType TaskID);
StatusType TerminateTask(void);
StatusType ChainTask(TaskType TaskID);
StatusType Schedule(void);
StatusType GetTaskID(TaskType *TaskID);
StatusType GetTaskState(TaskType TaskID, TaskStateType *State);

/* Priority Ceiling Protocol (PCP) Resource Services */
StatusType GetResource(ResourceType ResID);
StatusType ReleaseResource(ResourceType ResID);

/* Event Mechanism (Extended Tasks) */
StatusType SetEvent(TaskType TaskID, EventMaskType Mask);
StatusType ClearEvent(EventMaskType Mask);
StatusType GetEvent(TaskType TaskID, EventMaskType *Event);
StatusType WaitEvent(EventMaskType Mask);

/* Alarm and Counter Services */
StatusType SetRelAlarm(AlarmType AlarmID, TickType increment, TickType cycle);
StatusType SetAbsAlarm(AlarmType AlarmID, TickType start, TickType cycle);
StatusType CancelAlarm(AlarmType AlarmID);

/* Operating System Lifecycle */
void StartOS(AppModeType Mode);
void ShutdownOS(StatusType Error);

/* OSEK OS Hooks */
void StartupHook(void);
void ShutdownHook(StatusType Error);
void ErrorHook(StatusType Error);
void PreTaskHook(void);
void PostTaskHook(void);

#ifdef __cplusplus
}
#endif

#endif /* TPL_OS_H */
