# Makefile for Heavy Commercial Truck Instrument Cluster Module (ICM)
# Target: Trampoline RTOS (OSEK/VDX 2.2.3 / AUTOSAR OS 4.2) & Standalone Testbench

CC ?= gcc
CFLAGS ?= -Wall -Wextra -O2 -std=c99 -Iinclude -D_POSIX_C_SOURCE=200809L
LDFLAGS ?= -lm

SRC_DIR = src
INC_DIR = include
BUILD_DIR = build
BIN_DIR = bin

SRCS = $(SRC_DIR)/main.c \
       $(SRC_DIR)/cluster_tasks.c \
       $(SRC_DIR)/j1939.c \
       $(SRC_DIR)/cluster_gauges.c \
       $(SRC_DIR)/can_queue.c

OBJS = $(patsubst $(SRC_DIR)/%.c, $(BUILD_DIR)/%.o, $(SRCS))
TARGET = $(BIN_DIR)/truck_cluster_sim

.PHONY: all clean run help oil_gen

all: $(TARGET)

$(TARGET): $(OBJS) | $(BIN_DIR)
	@echo "[LD] $@"
	$(CC) $(OBJS) -o $@ $(LDFLAGS)
	@echo "Build complete: $@"

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c | $(BUILD_DIR)
	@echo "[CC] $<"
	$(CC) $(CFLAGS) -c $< -o $@

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

run: $(TARGET)
	@echo "Executando simulador C do Instrument Cluster..."
	./$(TARGET)

clean:
	rm -rf $(BUILD_DIR) $(BIN_DIR)
	@echo "Clean complete."

# Trampoline OIL generation rule using goil compiler
oil_gen: cluster.oil
	@echo "Executando compilador goil do Trampoline RTOS..."
	goil --target=posix/linux --templates=/opt/trampoline/goil/templates/ cluster.oil

help:
	@echo "Opções de compilação do Firmware C:"
	@echo "  make         - Compila o simulador em C com GCC"
	@echo "  make run     - Compila e executa o dashboard de terminal em C"
	@echo "  make clean   - Remove arquivos objetos e executáveis"
	@echo "  make oil_gen - Gera código Trampoline OSEK com 'goil' a partir de cluster.oil"
