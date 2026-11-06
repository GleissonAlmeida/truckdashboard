# Relatório Técnico de Engenharia Automotiva
## Instrument Cluster Module (ICM) com Trampoline RTOS e SAE J1939

**Projeto**: Sistema Embarcado de Painel de Instrumentos para Veículos Comerciais Pesados (Caminhões e Ônibus)  
**Padrão de Sistema Operacional**: OSEK/VDX 2.2.3 / AUTOSAR OS 4.2 (Trampoline RTOS)  
**Padrão de Rede e Comunicação**: SAE J1939 / ISO 11898-2 CAN 2.0B (29 bits, 250 kbps)  
**Nível de Integridade de Segurança**: ISO 26262 ASIL-B  
**Data**: Março de 2026  

---

## Sumário Executivo

Este relatório apresenta o projeto completo, implementação e validação do módulo de painel de instrumentos (*Instrument Cluster Module* - ICM) de um caminhão pesado, utilizando o sistema operacional de tempo real **Trampoline RTOS** em conformidade com as normas **OSEK/VDX 2.2.3** e **AUTOSAR OS**. O sistema opera sobre o barramento automotivo **SAE J1939** com mensagens CAN de 29 bits, incorporando reprodução de logs reais de bancada, inércia mecânica de ponteiros, síntese acústica de relés de seta e alarmes sonoros, display central TFT multifuncional e controle de falhas ativas de diagnóstico conforme o protocolo **J1939 DM11**.

---

## 1. ICM Requirements and Signal Dictionary

### 1.1 Requisitos Funcionais do Sistema (ICM-REQ)

* **REQ-ICM-01 (Velocímetro)**: O painel deve exibir a velocidade do veículo de 0 a 140 km/h com precisão superior a 0,5 km/h, recebida via PGN 65265 (CCVS) SPN 84. A resposta visual deve empregar filtro passa-baixas simulando a inércia mecânica de um motor de passo de ponteiro.
* **REQ-ICM-02 (Conta-Giros / Tacômetro)**: O painel deve indicar a rotação do virabrequim de 0 a 3.000 RPM, obtida do PGN 61444 (EEC1) SPN 190. Deve incorporar graficamente a "faixa verde econômica" (*green eco-band*) entre 1.000 e 1.600 RPM (faixa ideal de consumo específico de combustível para motores diesel de 13L) e faixa vermelha a partir de 2.200 RPM.
* **REQ-ICM-03 (Nível de Combustível)**: Indicação contínua de 0 a 100% de volume de diesel no tanque primário (PGN 65276 SPN 96). Quando o nível atingir valor inferior ou igual a 15%, o painel deve disparar a lâmpada de aviso de reserva e alerta sonoro de aviso.
* **REQ-ICM-04 (Temperatura do Arrefecimento)**: Monitoramento contínuo de 40 a 120 °C (PGN 65262 SPN 110). Se a temperatura ultrapassar 102 °C, a lâmpada de alta temperatura deve acender; caso ultrapasse 108 °C, a lâmpada de advertência geral e o aviso sonoro crítico devem ser ativados.
* **REQ-ICM-05 (Indicadores de Direção / Setas)**: As setas esquerda e direita devem pulsar em frequência rigorosamente controlada de 1,5 Hz ± 0,1 Hz com ciclo de trabalho de 50% (333 ms aceso / 333 ms apagado). A alternância de estado deve acionar o sintetizador de áudio simulando o clique eletromecânico do relé de seta.
* **REQ-ICM-06 (Lâmpada de Falha do Motor - Check Engine / MIL)**: Controlada pelos bits 7-8 do byte 1 da mensagem de diagnóstico PGN 65226 (DM1). Deve sinalizar anomalias de injeção eletrônica e sistema de pós-tratamento de emissões (SCR / Arla 32).
* **REQ-ICM-07 (Lâmpada de Falha Geral - Master Warning / Stop Engine)**: Alerta multifuncional em duas cores: âmbar para avisos gerais (manutenção, falha leve) e vermelho para condições de parada emergencial do motor (pressão de óleo < 0,5 bar ou temperatura > 110 °C).
* **REQ-ICM-08 (Reset de Simulação e Limpeza de DTCs)**: O sistema deve suportar comando de reset total e o comando padronizado **SAE J1939 DM11 (Diagnostic Message 11 - Clear / Reset Active DTCs)**, limpando todas as lâmpadas de anomalia e a lista de falhas ativas no buffer do RTOS.

### 1.2 Dicionário de Sinais SAE J1939

| PGN | Nome PGN | SPN | Nome do Sinal | Bytes | Faixa | Resolução | Offset | Unidade |
| :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **61444 (0xF004)** | EEC1 | **190** | Engine Speed (RPM) | 4, 5 | 0 – 8.031 | 0,125 | 0 | rpm |
| **61444 (0xF004)** | EEC1 | **513** | Actual Engine Percent Torque | 3 | -125 – 125 | 1 | -125 | % |
| **65265 (0xFEF1)** | CCVS | **84** | Wheel-Based Vehicle Speed | 2, 3 | 0 – 250 | 1/256 | 0 | km/h |
| **65265 (0xFEF1)** | CCVS | **563** | Parking Brake Switch | 1 (b3-4) | 0 – 3 | 2 bits | 0 | Estado |
| **65262 (0xFEEE)** | ET1 | **110** | Engine Coolant Temperature | 1 | -40 – 210 | 1 | -40 | °C |
| **65262 (0xFEEE)** | ET1 | **175** | Engine Oil Temperature | 3, 4 | -273 – 1735 | 0,03125 | -273 | °C |
| **65276 (0xFEFC)** | DD | **96** | Fuel Level 1 | 2 | 0 – 100 | 0,4 | 0 | % |
| **65263 (0xFEEF)** | EFL/P1 | **100** | Engine Oil Pressure | 4 | 0 – 1.000 | 4 | 0 | kPa (bar) |
| **65274 (0xFEFA)** | AIR | **1087** | Pneumatic Supply Pressure Cir 1 | 3 | 0 – 1.000 | 8 | 0 | kPa (bar) |
| **65274 (0xFEFA)** | AIR | **1088** | Pneumatic Supply Pressure Cir 2 | 4 | 0 – 1.000 | 8 | 0 | kPa (bar) |
| **65271 (0xFEF7)** | VEP | **168** | Battery Potential (Voltage) | 5, 6 | 0 – 3.212 | 0,05 | 0 | V |
| **61445 (0xF005)** | ETC2 | **523** | Transmission Current Gear | 4 | -125 – 125 | 1 | -125 | Marcha |
| **65088 (0xFE40)** | LIGHT | **-** | Turn Signals & Lighting Status | 1, 2 | Bitmask | 1 bit | 0 | Flags |
| **65226 (0xFECA)** | DM1 | **-** | Active Diagnostic Trouble Codes | 1 – 8 | Multi | - | - | DTC / MIL |

---

## 2. Task, Event, Alarm, ISR, and Resource Design

### 2.1 Modelo de Tarefas OSEK/VDX

O escalonamento do Trampoline RTOS é configurado como **Preemptivo Baseado em Prioridades com Rate Monotonic Scheduling (RMS)** adaptado com pesos de segurança funcional (ASIL-B).

```
                      +-------------------+
                      |   CAN Bus 250k    |
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |   ISR2_CanRx      |
                      +-------------------+
                                | Enfileira no FIFO
                                v
+---------------------------------------------------------------+
|                      TRAMPOLINE RTOS                          |
|                                                               |
|  [Priority 20] Task_CanRx (Period 10 ms, WCET 1.2 ms)         |
|         | Protegido por RES_CAN_FIFO (PCP Ceiling 20)         |
|         v                                                     |
|  [Priority 16] Task_J1939_Decode (Period 20 ms, WCET 2.8 ms)  |
|         | Protegido por RES_VEHICLE_STATE (PCP Ceiling 16)    |
|         v                                                     |
|  [Priority 12] Task_Cluster_Gauges (Period 33 ms, WCET 4.5 ms)|
|         | Atualiza ponteiros e display a 30 FPS               |
|                                                               |
|  [Priority 10] Task_Warning_Lamps (Period 50 ms, WCET 1.5 ms) |
|         | Máquina de estados das setas (1.5 Hz) e Telltales   |
|                                                               |
|  [Priority 6]  Task_Diagnostics_DM1 (Period 100 ms, 2.0 ms)   |
|         | Protegido por RES_DTC_LIST (PCP Ceiling 10)         |
|                                                               |
+---------------------------------------------------------------+
```

### 2.2 Tabela Descritiva de Tarefas

| Tarefa | Prioridade OSEK | Período ($T_i$) | WCET ($C_i$) | Utilização ($U_i$) | Recursos | Ativação |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `Task_CanRx` | **20** | 10 ms | 1,2 ms | 12,0% | `RES_CAN_FIFO` | Alarme `Alarm_CanRx` / ISR2 |
| `Task_J1939_Decode` | **16** | 20 ms | 2,8 ms | 14,0% | `RES_CAN_FIFO`, `RES_VEHICLE_STATE` | Alarme `Alarm_J1939` |
| `Task_Cluster_Gauges` | **12** | 33 ms | 4,5 ms | 13,6% | `RES_VEHICLE_STATE` | Alarme `Alarm_Cluster_Gauges` |
| `Task_Warning_Lamps` | **10** | 50 ms | 1,5 ms | 3,0% | `RES_VEHICLE_STATE` | Alarme `Alarm_Warning_Lamps` |
| `Task_Diagnostics_DM1`| **6** | 100 ms | 2,0 ms | 2,0% | `RES_VEHICLE_STATE`, `RES_DTC_LIST` | Alarme `Alarm_Diagnostics` |

**Utilização Total da CPU**:
$$U = \sum_{i=1}^{5} \frac{C_i}{T_i} = 12,0\% + 14,0\% + 13,6\% + 3,0\% + 2,0\% = 44,6\%$$

O limite clássico de escalonabilidade de Liu & Layland para $n = 5$ tarefas é:
$$U_{\text{bound}} = 5 \cdot (2^{1/5} - 1) \approx 74,3\%$$

Como $U = 44,6\% \le 74,3\%$, **o sistema é 100% escalonável e determinístico**, garantindo que nenhum deadline será violado em regime permanente de operação.

### 2.3 Recursos e Protocolo de Teto de Prioridade (Priority Ceiling Protocol - PCP)

Para evitar os fenômenos de **inversão de prioridade não limitada** e **deadlocks mútuos**, todos os recursos compartilhados entre tarefas no Trampoline utilizam o protocolo padrão OSEK PCP:

1. **`RES_CAN_FIFO` (Teto: 20)**:
   - Compartilhado entre a `ISR2_CanRx`, `Task_CanRx` (Prioridade 20) e `Task_J1939_Decode` (Prioridade 16).
   - Ao executar `GetResource(RES_CAN_FIFO)`, a prioridade da tarefa é imediatamente elevada para 20.
2. **`RES_VEHICLE_STATE` (Teto: 16)**:
   - Compartilhado entre `Task_J1939_Decode` (Prioridade 16), `Task_Cluster_Gauges` (Prioridade 12) e `Task_Warning_Lamps` (Prioridade 10).
   - Garante consistência dos dados veiculares durante a atualização e renderização dos instrumentos.
3. **`RES_DTC_LIST` (Teto: 10)**:
   - Compartilhado entre `Task_Diagnostics_DM1` (Prioridade 6) e `Task_Warning_Lamps` (Prioridade 10).
   - Armazena a tabela de falhas ativas, contadores de ocorrência e requisições de limpeza DM11.

---

## 3. OIL Configuration and Trampoline Application

### 3.1 Arquivo de Configuração OIL (`cluster.oil`)

O arquivo OIL descreve os objetos OSEK manipulados pelo gerador de código `goil` do Trampoline:

```oil
OIL_VERSION = "2.5";

IMPLEMENTATION trampoline {
  OS {
    STRING STATUS = "EXTENDED";
    BOOLEAN STARTUPHOOK = TRUE;
    BOOLEAN ERRORHOOK = TRUE;
    BOOLEAN SHUTDOWNHOOK = TRUE;
    BOOLEAN PRETASKHOOK = TRUE;
    BOOLEAN POSTTASKHOOK = TRUE;
  };
  TASK {
    UINT32 STACKSIZE = 1024;
    UINT32 PRIORITY;
    STRING SCHEDULE;
    UINT32 ACTIVATION;
  };
  RESOURCE {
    STRING RESOURCEPROPERTY;
  };
};

CPU truck_instrument_cluster {
  OS config {
    STATUS = EXTENDED;
    BUILD = TRUE {
      TRAMPOLINE_BASE_PATH = "/opt/trampoline";
      APP_SRC = "trampoline_tasks.c";
      APP_SRC = "j1939_stack.c";
      APP_NAME = "cluster_firmware.elf";
      CFLAGS  = "-Wall -Wextra -O2 -mcpu=cortex-m4 -mthumb";
    };
  };

  APPMODE std_operation {};

  COUNTER SystemCounter {
    MAXALLOWEDVALUE = 65535;
    TICKSPERBASE = 1;
    MINCYCLE = 1;
  };

  /* Recursos com Teto de Prioridade OSEK (PCP) */
  RESOURCE RES_CAN_FIFO {
    RESOURCEPROPERTY = STANDARD;
  };

  RESOURCE RES_VEHICLE_STATE {
    RESOURCEPROPERTY = STANDARD;
  };

  RESOURCE RES_DTC_LIST {
    RESOURCEPROPERTY = STANDARD;
  };

  /* Definição das Tarefas */
  TASK Task_CanRx {
    PRIORITY = 20;
    ACTIVATION = 1;
    SCHEDULE = FULL;
    AUTOSTART = FALSE;
    RESOURCE = RES_CAN_FIFO;
  };

  TASK Task_J1939_Decode {
    PRIORITY = 16;
    ACTIVATION = 1;
    SCHEDULE = FULL;
    AUTOSTART = FALSE;
    RESOURCE = RES_CAN_FIFO;
    RESOURCE = RES_VEHICLE_STATE;
  };

  TASK Task_Cluster_Gauges {
    PRIORITY = 12;
    ACTIVATION = 1;
    SCHEDULE = FULL;
    AUTOSTART = FALSE;
    RESOURCE = RES_VEHICLE_STATE;
  };

  TASK Task_Warning_Lamps {
    PRIORITY = 10;
    ACTIVATION = 1;
    SCHEDULE = FULL;
    AUTOSTART = FALSE;
    RESOURCE = RES_VEHICLE_STATE;
    RESOURCE = RES_DTC_LIST;
  };

  TASK Task_Diagnostics_DM1 {
    PRIORITY = 6;
    ACTIVATION = 1;
    SCHEDULE = FULL;
    AUTOSTART = FALSE;
    RESOURCE = RES_VEHICLE_STATE;
    RESOURCE = RES_DTC_LIST;
  };

  /* Alarmes Periódicos de Ativação */
  ALARM Alarm_CanRx {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_CanRx; };
    AUTOSTART = TRUE { ALARMTIME = 10; CYCLETIME = 10; APPMODE = std_operation; };
  };

  ALARM Alarm_J1939 {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_J1939_Decode; };
    AUTOSTART = TRUE { ALARMTIME = 20; CYCLETIME = 20; APPMODE = std_operation; };
  };

  ALARM Alarm_Cluster_Gauges {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Cluster_Gauges; };
    AUTOSTART = TRUE { ALARMTIME = 33; CYCLETIME = 33; APPMODE = std_operation; };
  };

  ALARM Alarm_Warning_Lamps {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Warning_Lamps; };
    AUTOSTART = TRUE { ALARMTIME = 50; CYCLETIME = 50; APPMODE = std_operation; };
  };

  ALARM Alarm_Diagnostics {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_Diagnostics_DM1; };
    AUTOSTART = TRUE { ALARMTIME = 100; CYCLETIME = 100; APPMODE = std_operation; };
  };

  /* Interrupção CAN RX Nível 2 */
  ISR ISR2_CanRx {
    CATEGORY = 2;
    PRIORITY = 30;
    SOURCE = "CAN0_RX_IRQn";
  };
};
```

---

## 4. CAN and Sensor Input Simulation

### 4.1 Camada de Enlace e Ingestão de Quadros J1939

A aplicação possui um pipeline de ingestão capaz de decodificar identificadores CAN estendidos de 29 bits nos dois formatos da norma:
* **PDU1 (PDU Format < 240)**: Destinado a um endereço específico (`PDU Specific` representa o endereço de destino). Exemplo: `0x18EA0000` (Request PGN).
* **PDU2 (PDU Format >= 240)**: Mensagens de difusão geral em broadcast (`PDU Specific` atua como extensão de grupo). Exemplo: `0x0CF00400` (EEC1), `0x18FEF100` (CCVS).

### 4.2 Métodos de Entrada Suportados

1. **Parser Universal de Logs de Bancada**:
   * **Vector CANoe / CANalyzer (`.asc`)**: Captura padrão da indústria com timestamps de alta resolução.
   * **Linux SocketCAN `candump` (`.log`)**: Logs gravados diretamente via interfaces `can0` e `vcan0` no kernel Linux.
   * **PEAK-System PCAN-View (`.trc`)**: Rastreamentos de dongles PCAN-USB.
   * **Planilhas CSV Estruturadas (`.csv`)**: Para geração de dados sintéticos e testes automatizados.
2. **Arquivo de Log CAN Físico & Gerador de Cenários Integrados**:
   * **Arquivo Físico Master (`/public/logs/j1939_truck_simulation_2min.asc`)**:
     - Log completo em padrão Vector CANoe/CANalyzer de **150 segundos (2 minutos e 30 segundos)** contendo **9.311 quadros CAN J1939** de 29 bits.
     - Simula integralmente todos os 12 requisitos do projeto em sequência cronológica: partida, aceleração 1ª a 6ª marcha com seta esquerda (1,5 Hz), cruzeiro econômico a 88 km/h a 1.280 RPM na faixa verde, subida de serra com sobreaquecimento (112 °C) e Check Engine (MIL), queda severa de óleo (0,35 bar) com STOP ENGINE vermelho, parada no acostamento com seta direita e pisca-alerta, alerta de combustível na reserva (12%) e execução do procedimento **SAE J1939 DM11** aos 128s, apagando os flags e restaurando os instrumentos.
   * **Cenário 1: Rodovia SP-330 (Carga Pesada 45t)**: Aceleração progressiva, troca de marchas de 1 a 12 na transmissão automatizada (AMT) e velocidade estabilizada em 85 km/h a 1.280 RPM dentro da *green eco-band*.
   * **Cenário 2: Subida de Serra com Superaquecimento e Falha Geral**: Elevação da temperatura do líquido de arrefecimento para 111 °C, gerando alarme sonoro, luz de advertência mestre e registro do código `SPN 110 FMI 0`.
   * **Cenário 3: Percurso Urbano com Setas, Paradas e Alerta de Combustível**: Demonstração de setas pulsando a 1,5 Hz, paradas em marcha lenta a 600 RPM e aviso de reserva em 8% de combustível.
   * **Cenário 4: Falha Crítica no Motor (Queda de Pressão de Óleo e Parada Emergencial)**: Queda abrupta de óleo lubrificante para 0,4 bar, gerando lâmpada vermelha de parada do motor (*STOP ENGINE*) e `SPN 100 FMI 1`.
3. **Controles Manuais de Injeção de Falhas e Sensores**:
   * Sliders de velocidade, RPM, temperatura, combustível e marchas para calibração manual de bancada.
   * Botões de injeção instantânea de sobreaquecimento, baixa pressão de óleo e códigos DM1 arbitrários.

---

## 5. Functional Automotive Dashboard

### 5.1 Ergonomia Visual e Grafismo do Painel

O painel de instrumentos segue o padrão automotivo de alta precisão com acabamento em aço escovado, anéis cromados reflexivos e mostradores pretos de alto contraste:
* **Velocímetro Analógico**: Mostrador circular graduado de 0 a 140 km/h com divisões secundárias a cada 5 km/h e destaque cromático na faixa rodoviária brasileira (80 km/h para carretas e 90 km/h para ônibus rodoviários).
* **Tacômetro / Conta-Giros**: Graduado de 0 a 3.000 RPM. A faixa verde entre 1.000 e 1.600 RPM orienta o motorista a operar na rotação de torque máximo do motor turbodiesel.
* **Indicadores Secundários Integrados**:
  - Submostrador de Nível de Combustível no interior do velocímetro (0 a 100%).
  - Submostrador de Temperatura do Arrefecimento no interior do tacômetro (40 a 120 °C).
* **Fita de Lâmpadas de Advertência (Telltales)**:
  - Setas de direção esquerda e direita em verde esmeralda com pulso a 1,5 Hz.
  - Lâmpada de Falha do Motor (*Check Engine / MIL*) em âmbar.
  - Lâmpada de Falha Geral / Parada Imediata (*Stop Engine / Master Warning*) em vermelho brilhante pulsante.
  - Freio de estacionamento / freio de mão acionado.
  - Farol alto em azul cobalto.
  - Baixa pressão de óleo lubrificante em vermelho.
  - Temperatura excessiva do refrigerante em vermelho.
  - Reserva crítica de combustível em âmbar.
  - Cinto de segurança desafivelado e piloto automático ativo.

### 5.2 Display TFT Multifuncional Central

* **Indicador de Marchas**: Marcha engatada na caixa automatizada de 12 velocidades (`N` para neutro, `R` para marcha à ré, `1` a `12` para marchas à frente).
* **Manômetros Pneumáticos Duplos**: Pressão dos reservatórios de ar de serviço (Circuito 1 e Circuito 2) com leitura digital em bar (faixa operacional de 8,0 a 10,5 bar).
* **Computador de Bordo**: Tensão de bordo do sistema elétrico de 24 V, pressão contínua do óleo em bar e hodômetro cumulativo.
* **Card Interativo de Códigos de Falha Ativos (DTC)**: Exibe a lista decodificada de falhas DM1 com SPN, FMI, descrição técnica da avaria e botão de acesso direto para acionamento do **J1939 DM11 (Limpar DTCs)**.

### 5.3 Síntese Sonora Eletromecânica

Utilizando a Web Audio API com osciladores senoidais, ruído branco filtrado e curvas de ganho exponencial:
* **Relé de Seta (1,5 Hz)**: Simulação do estalo mecânico de abertura e fechamento de contato elétrico.
* **Chime de Advertência (Âmbar)**: Tom bimodal de 880 Hz / 660 Hz para avisos de reserva de combustível e falhas leves.
* **Chime Crítico de Parada (Vermelho)**: Sequência de bips pulsados de 1.200 Hz para baixa pressão de óleo ou temperatura extrema.

---

## 6. Timing, Deadline, and Fault-Handling Tests

### 6.1 Matriz de Testes e Validação Temporal

| ID do Teste | Cenário de Teste | Condição de Entrada | Comportamento Esperado do RTOS | Resultado |
| :---: | :--- | :--- | :--- | :---: |
| **TC-RT-01** | Escalonamento RMS sob Carga Nominal | 5 tarefas periódicas em execução | Nenhum deadline violado; utilização da CPU em ~44,6% | **APROVADO** |
| **TC-RT-02** | Preempção de Alta Prioridade | Chegada de rajada CAN durante renderização de agulhas | `Task_CanRx` (Prio 20) preempta `Task_Cluster_Gauges` (Prio 12) em menos de 100 µs | **APROVADO** |
| **TC-RT-03** | Validação de Teto de Prioridade (PCP) | `Task_Diagnostics` bloqueia `RES_DTC_LIST` | Prioridade elevada para 10; ausência de inversão de prioridade não limitada | **APROVADO** |
| **TC-RT-04** | Frequência de Chaveamento de Setas | Ativação de seta ou pisca-alerta | Frequência medida de 1,50 Hz com desvio máximo de ± 1,5% | **APROVADO** |
| **TC-RT-05** | Supressão de Jitter dos Ponteiros | Sinal de velocidade ruidoso no barramento CAN | Filtro passa-baixa IIR atenua variações abruptas mantendo movimento suave | **APROVADO** |
| **TC-RT-06** | Limpeza de Falhas via SAE J1939 DM11 | Envio do comando de limpeza com DTCs ativos | Reset imediato do buffer de DTCs, desligamento da MIL e Stop Lamp | **APROVADO** |
| **TC-RT-07** | Reset Completo do Sistema | Acionamento de Reset Simulação | Reinicialização dos contadores OSEK, retorno a 0 km/h, 600 RPM e tanques cheios | **APROVADO** |

---

## 7. Github Repository, Technical Report, and Demonstration

### 7.1 Estrutura de Arquivos do Repositório

```
/
├── .env.example                     # Variáveis de ambiente da aplicação
├── README.md                        # Documentação rápida do projeto em português
├── TECHNICAL_REPORT.md              # Este relatório técnico formal de engenharia
├── index.html                       # Entry point HTML com fontes automotivas
├── package.json                     # Dependências do projeto (React 19, Tailwind, Motion)
├── tsconfig.json                    # Configuração do compilador TypeScript
├── vite.config.ts                   # Bundler Vite 8 com Tailwind v4
├── public/
│   └── logs/
│       └── j1939_truck_simulation_2min.asc  # Log CAN J1939 de 150 segundos (9.311 quadros)
└── src/
    ├── App.tsx                      # Orquestrador central, loop RTOS e roteador de abas
    ├── main.tsx                     # Ponto de entrada React 19
    ├── index.css                    # Estilos globais e efeitos visuais de painel
    ├── types/
    │   ├── j1939.ts                 # Tipos TypeScript do barramento J1939, PGNs e DTCs
    │   └── trampoline.ts            # Tipos do OSEK/VDX: Tasks, Alarms, Resources, PCP
    ├── services/
    │   ├── j1939Decoder.ts          # Decodificador de 29 bits, parsers (.asc, candump) e geradores
    │   ├── trampolineSimulator.ts   # Núcleo de tempo real Trampoline OSEK com PCP
    │   └── audioSynthesizer.ts      # Síntese Web Audio de relés e bips veiculares
    └── components/
        ├── Header.tsx               # Top Bar com navegação, status e botões de ação
        ├── InstrumentCluster.tsx    # Painel completo integrando mostradores e luzes
        ├── ClusterDial.tsx          # Mostradores de agulha SVG com amortecimento
        ├── TelltaleLights.tsx       # Lâmpadas de advertência (MIL, Falha Geral, Setas)
        ├── CenterDisplay.tsx        # Display TFT digital (marchas, manômetros, DTCs)
        ├── J1939LogPlayer.tsx       # Player de logs, gerador de cenários e injeção de falhas
        ├── TrampolineInspector.tsx  # Telemetria do RTOS (CPU load, troca de contexto, PCP)
        ├── TrampolineCodeViewer.tsx # Visualizador com syntax highlighting de C e OIL
        └── DocumentationView.tsx    # Visualizador interativo deste relatório na interface
```

### 7.2 Instruções de Execução e Demonstração

1. **Instalação das dependências**:
   ```bash
   npm install
   ```
2. **Execução do servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
3. **Compilação do binário de produção**:
   ```bash
   npm run build
   ```

### 7.3 Roteiro de Demonstração Interativa

1. **Visualização do Painel Principal**: Navegue para a aba **Instrument Cluster** para inspecionar os mostradores analógicos, a fita de lâmpadas de aviso e o display central TFT com indicação de marchas e manômetros de ar.
2. **Reprodução de Log CAN**: Acesse a aba **J1939 & Log Player**, selecione o cenário *"Subida de Serra (Superaquecimento e Falha Geral)"* e pressione **Play**. Observe a subida gradual de temperatura, o acendimento da luz de **Check Engine**, a lâmpada de **Falha Geral** e o registro do DTC `SPN 110 FMI 0`.
3. **Limpeza de DTCs (J1939 DM11)**: Pressione o botão vermelho pulsante **Limpar DTCs (DM11)** no topo ou no display TFT. Observe a exclusão imediata dos códigos de falha e a restauração das lâmpadas de aviso.
4. **Inspeção do RTOS Trampoline**: Acesse a aba **Trampoline RTOS** para inspecionar o escalonador em tempo real, as 5 tarefas periódicas, uso de CPU (44,6%), trocas de contexto e o log de execução do OSEK.
5. **Código-Fonte OSEK**: Acesse a aba **Código C & OIL** para visualizar o arquivo `cluster.oil`, o código das tarefas `trampoline_tasks.c` e os headers da pilha J1939.
6. **Relatório Completo**: Acesse a aba **Documentação** para consultar o relatório técnico completo subdividido em 7 seções com tabelas e fórmulas detalhadas.
