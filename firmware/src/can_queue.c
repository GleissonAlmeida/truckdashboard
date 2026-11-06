/**
 * @file can_queue.c
 * @brief Thread-safe CAN Frame Ring Buffer Implementation
 */

#include "can_queue.h"
#include <string.h>

void CanQueue_Init(CanRingBuffer_t *q)
{
    if (!q) return;
    memset(q->buffer, 0, sizeof(q->buffer));
    q->head = 0;
    q->tail = 0;
    q->count = 0;
    q->overflows = 0;
}

bool CanQueue_Push(CanRingBuffer_t *q, const CanRawFrame_t *frame)
{
    if (!q || !frame) return false;

    if (q->count >= CAN_FIFO_CAPACITY) {
        q->overflows++;
        return false; /* FIFO full */
    }

    q->buffer[q->head] = *frame;
    q->head = (q->head + 1U) % CAN_FIFO_CAPACITY;
    q->count++;

    return true;
}

bool CanQueue_Pop(CanRingBuffer_t *q, CanRawFrame_t *frame)
{
    if (!q || !frame || q->count == 0) return false;

    *frame = q->buffer[q->tail];
    q->tail = (q->tail + 1U) % CAN_FIFO_CAPACITY;
    q->count--;

    return true;
}

bool CanQueue_IsEmpty(const CanRingBuffer_t *q)
{
    return (!q || q->count == 0);
}

uint16_t CanQueue_GetCount(const CanRingBuffer_t *q)
{
    return q ? q->count : 0;
}
