/**
 * @file can_queue.h
 * @brief Thread-safe CAN Frame Ring Buffer FIFO for OSEK RTOS
 */

#ifndef CAN_QUEUE_H
#define CAN_QUEUE_H

#include "cluster_types.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    CanRawFrame_t buffer[CAN_FIFO_CAPACITY];
    uint16_t head;
    uint16_t tail;
    uint16_t count;
    uint32_t overflows;
} CanRingBuffer_t;

void CanQueue_Init(CanRingBuffer_t *q);
bool CanQueue_Push(CanRingBuffer_t *q, const CanRawFrame_t *frame);
bool CanQueue_Pop(CanRingBuffer_t *q, CanRawFrame_t *frame);
bool CanQueue_IsEmpty(const CanRingBuffer_t *q);
uint16_t CanQueue_GetCount(const CanRingBuffer_t *q);

#ifdef __cplusplus
}
#endif

#endif /* CAN_QUEUE_H */
