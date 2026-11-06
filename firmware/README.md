# Firmware C do Instrument Cluster de Caminhão com Trampoline RTOS

Implementação completa em **linguagem C pura (padrão ANSI C99/C11)** para o módulo de painel de instrumentos automotivo (*Instrument Cluster Module* - ICM), projetado para execução no sistema operacional de tempo real **Trampoline RTOS (conforme OSEK/VDX 2.2.3 e AUTOSAR OS 4.2)** e barramento veicular **SAE J1939**.

---

## 1. Estrutura de Arquivos do Projeto em C

```
/firmware/
├── Makefile                      # Automação de compilação (GCC nativo & Trampoline)
├── cluster.oil                   # Configuração OSEK OIL (Tasks, Alarms, Resources, PCP)
├── README.md                     # Esta documentação do firmware C
├── include/
│   ├── tpl_os.h                  # Header da API padrão OSEK/VDX Trampoline RTOS
│   ├── cluster_types.h           # Definições de telemetria, quadros CAN e DTCs
│   ├── cluster_tasks.h           # Declaração das 5 tarefas OSEK e recursos PCP
│   ├── j1939.h                   # Stack SAE J1939, PGNs, SPNs e comando DM11
│   ├── cluster_gauges.h          # Filtros de inércia física das agulhas e lâmpadas
│   └── can_queue.h               # FIFO em anel de quadros CAN protegida por PCP
└── src/
    ├── main.c                    # Ponto de entrada, testbench C e dashboard ANSI
    ├── cluster_tasks.c           # Implementação das 5 tarefas OSEK (TASK) e ISR
    ├── j1939.c                   # Decodificador de PGNs, SPNs, DM1 e limpeza DM11
    ├── cluster_gauges.c          # Filtros IIR de amortecimento e máquina de setas (1,5 Hz)
    └── can_queue.c               # Implementação da fila circular de mensagens CAN
```

---

## 2. As 5 Tarefas OSEK no Firmware C

| Tarefa C | Prioridade | Período (ms) | Recurso OSEK (PCP) | Descrição |
| :--- | :---: | :---: | :--- | :--- |
| **`TASK(Task_CanRx)`** | 20 (Máxima) | 10 | `RES_CAN_FIFO` | Lê o hardware CAN e enfileira na FIFO de alta prioridade. |
| **`TASK(Task_J1939_Decode)`** | 16 | 20 | `RES_CAN_FIFO`, `RES_VEHICLE_STATE` | Desenfileira quadros e decodifica PGNs (EEC1, CCVS, ET1, DD, DM1). |
| **`TASK(Task_Cluster_Gauges)`**| 12 | 33 (~30 FPS) | `RES_VEHICLE_STATE` | Aplica o filtro de inércia de amortecimento das agulhas. |
| **`TASK(Task_Warning_Lamps)`** | 10 | 50 | `RES_VEHICLE_STATE`, `RES_DTC_LIST` | Máquina de estados das setas (1,5 Hz) e lâmpadas de advertência. |
| **`TASK(Task_Diagnostics_DM1)`**| 6 | 100 | `RES_DTC_LIST` | Gerenciador de códigos DTC e execução do comando DM11. |

---

## 3. Como Compilar e Executar o Código C

### Compilação Standalone com GCC:
```bash
cd firmware
make
./bin/truck_cluster_sim
```

### Compilação com Trampoline RTOS VIPER (goil):
```bash
goil --target=posix/linux --templates=/opt/trampoline/goil/templates/ cluster.oil
make -f truck_instrument_cluster/Makefile
```

---

## 4. Conformidade com Padrões

* **SAE J1939-21**: Identificadores CAN estendidos de 29 bits nos formatos PDU1 (ponto a ponto) e PDU2 (broadcast).
* **SAE J1939-71**: Decodificação física de velocidade (SPN 84), rotação (SPN 190), combustível (SPN 96), temperatura (SPN 110), óleo (SPN 100) e ar (SPN 1087/1088).
* **SAE J1939-73**: Tratamento de lâmpadas de diagnóstico DM1 e comando de reset DM11.
* **OSEK/VDX 2.2.3**: Rate Monotonic Scheduling (RMS) com protocolo de teto de prioridade (PCP) para garantir ausência total de inversão de prioridade.
