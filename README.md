# Simulador de Instrument Cluster de Caminhão com Trampoline RTOS e SAE J1939

Simulador automotivo realista de alta fidelidade para **Instrument Cluster (Painel de Instrumentos)** de veículos comerciais pesados (caminhões e carretas), arquitetado sobre os padrões do sistema operacional de tempo real **Trampoline RTOS (conforme OSEK/VDX 2.2.3 e AUTOSAR OS 4.2)** e do barramento de comunicação veicular **SAE J1939 (CAN 2.0B 29 bits, 250 kbps)**.

---

## 1. Visão Geral do Sistema

O sistema simula a ECU (Electronic Control Unit) de um painel de instrumentos de caminhão pesado (padrões Scania, Volvo FH, Mercedes-Benz Actros e MAN). A aplicação integra um leitor e reprodutor de arquivos de log CAN J1939 reais e pré-configurados, dinâmica mecânica de ponteiros analógicos, lâmpadas de advertência (*telltales*), avisos sonoros sintetizados e um display multifuncional TFT central.

### Principais Indicadores do Painel:
* **Velocímetro (Velocidade)**: Mostrador analógico de 0 a 140 km/h com amortecimento físico de agulha e destaque na faixa de cruzeiro rodoviário (80–90 km/h com limitador de velocidade).
* **Conta-Giros (Rotação do Motor - RPM)**: Mostrador analógico de 0 a 3.000 RPM com faixa verde econômica (*green eco-band* entre 1.000 e 1.600 RPM para torque máximo e menor consumo específico de diesel), faixa azul e faixa vermelha de perigo.
* **Nível de Combustível**: Submostrador integrado de 0 a 100% com lâmpada de aviso de reserva crítica ativada quando o tanque atinge $\le 15\%$.
* **Temperatura do Líquido de Arrefecimento**: Submostrador integrado de 40 a 120°C com indicação de superaquecimento e alerta crítico quando ultrapassa 102°C.
* **Indicadores de Seta (Esquerda e Direita)**: Setas verdes pulsantes operando na frequência padrão de 1,5 Hz (333 ms ligado / 333 ms desligado), acompanhadas pelo som eletromecânico autêntico de clique de relé veicular via Web Audio API.
* **Indicador de Falha no Motor (Check Engine / MIL)**: Lâmpada de anomalia de injeção e emissões (*Malfunction Indicator Lamp*), controlada pela decodificação do byte 0 da mensagem J1939 DM1.
* **Indicação de Falha Geral (Master Warning / Stop Engine)**: Alerta luminoso mestre (âmbar para advertência e vermelho para parada imediata do veículo) acompanhado por avisos sonoros de emergência e exibição textual dos códigos de falha (DTC) no display TFT.
* **Display Multifuncional TFT Central**: Indicador de marcha da transmissão automatizada (AMT 12V: Ponto Morto `N`, Ré `R`, 1ª a 12ª marchas), pressão dupla dos circuitos pneumáticos de freio (Circuitos 1 e 2 em bar), pressão do óleo lubrificante, tensão da bateria (sistema 24V), hodômetro total e trip.

---

## 2. Arquitetura Trampoline RTOS (OSEK/VDX & AUTOSAR OS)

O firmware do Instrument Cluster foi modelado de acordo com a especificação OSEK/VDX e configurado através de arquivos OIL (*OSEK Implementation Language*).

### Tabela de Tarefas OSEK:

| Tarefa | Prioridade | Período (ms) | Escalonamento | WCET (ms) | Recursos Protegidos (PCP) | Descrição |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`Task_CanRx`** | 20 (Máxima) | 10 | FULL (Preemptiva) | 1,2 | `RES_CAN_FIFO` | Ingestão de quadros CAN da FIFO de hardware e validação de CRC/ID. |
| **`Task_J1939_Decode`** | 16 | 20 | FULL (Preemptiva) | 2,8 | `RES_CAN_FIFO`, `RES_VEHICLE_STATE` | Decodificação dos PGNs (EEC1, CCVS, ET1, DD, DM1) e extração de SPNs. |
| **`Task_Cluster_Gauges`** | 12 | 33 (~30 FPS) | FULL (Preemptiva) | 4,5 | `RES_VEHICLE_STATE` | Filtro passa-baixa e interpolação de inércia física das agulhas dos mostradores. |
| **`Task_Warning_Lamps`** | 10 | 50 | FULL (Preemptiva) | 1,5 | `RES_VEHICLE_STATE` | Máquina de estados das setas (1,5 Hz), debounce de falhas e acionamento de lâmpadas. |
| **`Task_Diagnostics_DM1`** | 6 | 100 | FULL (Preemptiva) | 2,0 | `RES_VEHICLE_STATE`, `RES_DTC_LIST` | Gerenciamento de códigos DTC ativos, freeze frames e contadores de ocorrência. |

### Mecanismos de Sincronização e Recursos:
* **Protocolo de Teto de Prioridade (Priority Ceiling Protocol - PCP)**: Evita inversão de prioridade clássica e bloqueios mútuos (*deadlocks*) entre as tarefas de maior e menor prioridade.
  - `RES_CAN_FIFO`: Teto de prioridade 20.
  - `RES_VEHICLE_STATE`: Teto de prioridade 16.
  - `RES_DTC_LIST`: Teto de prioridade 10.
* **Alarmes Periódicos OSEK**: Vinculados ao `SystemCounter` com resolução de 1 ms base (`Alarm_CanRx`, `Alarm_J1939`, `Alarm_Cluster_Gauges`, `Alarm_Warning_Lamps`, `Alarm_Diagnostics`).

---

## 3. Protocolo SAE J1939 & Mapeamento de PGNs e SPNs

A camada de rede opera sobre o padrão ISO 11898-2 CAN 2.0B com identificadores estendidos de 29 bits.

### Estrutura do Identificador CAN de 29 Bits:
```
+---------------+-------+------+----------------+----------------+----------------+
| Priority (3b) | EDP(1)| DP(1)| PDU Format(8b) | PDU Specif(8b) | Source Addr(8b)|
+---------------+-------+------+----------------+----------------+----------------+
```

### PGNs Implementados e Decodificados:

1. **PGN 61444 (0xF004) - EEC1 (Electronic Engine Controller 1)**:
   - **SPN 190 (Rotação do Motor)**: Bytes 4 e 5 $\rightarrow$ `(Byte[3] | (Byte[4] << 8)) * 0.125` RPM.
   - **SPN 513 (Torque Atual do Motor)**: Byte 3 $\rightarrow$ `Byte[2] - 125` %.
   - **SPN 512 (Demanda de Torque do Motorista)**: Byte 2 $\rightarrow$ `Byte[1] - 125` %.

2. **PGN 65265 (0xFEF1) - CCVS (Cruise Control / Vehicle Speed)**:
   - **SPN 84 (Velocidade do Veículo Baseada em Rodas)**: Bytes 2 e 3 $\rightarrow$ `(Byte[1] | (Byte[2] << 8)) / 256.0` km/h.
   - **Freio de Estacionamento**: Byte 1 (bits 3 e 4).
   - **Piloto Automático (Cruise Control Ativo)**: Byte 4 (bit 1).

3. **PGN 65262 (0xFEEE) - ET1 (Engine Temperature 1)**:
   - **SPN 110 (Temperatura do Líquido de Arrefecimento - ECT)**: Byte 1 $\rightarrow$ `Byte[0] - 40` °C (Faixa: -40 a +210 °C).
   - **SPN 174 (Temperatura do Combustível)**: Byte 2 $\rightarrow$ `Byte[1] - 40` °C.
   - **SPN 175 (Temperatura do Óleo do Motor)**: Bytes 3 e 4 $\rightarrow$ `(Byte[2] | (Byte[3] << 8)) * 0.03125 - 273` °C.

4. **PGN 65276 (0xFEFC) - DD (Dash Display)**:
   - **SPN 96 (Nível de Combustível 1)**: Byte 2 $\rightarrow$ `Byte[1] * 0.4` % (Faixa: 0 a 100%).
   - **SPN 80 (Nível do Fluido do Lavador do Para-brisa)**: Byte 1 $\rightarrow$ `Byte[0] * 0.4` %.

5. **PGN 65226 (0xFECA) - DM1 (Active Diagnostic Trouble Codes)**:
   - **Byte 1 - Status das Lâmpadas de Diagnóstico**:
     - Bits 7–8: Lâmpada de Falha no Motor (**MIL / Check Engine**).
     - Bits 5–6: Lâmpada de Parada Imediata (**Red Stop Lamp**).
     - Bits 3–4: Lâmpada de Advertência Âmbar (**Amber Warning Lamp / Falha Geral**).
   - **Bytes 3 a 6 - Código DTC Composto**:
     - **SPN** (Suspect Parameter Number - 19 bits).
     - **FMI** (Failure Mode Identifier - 5 bits).
     - **OC** (Occurrence Count - 7 bits).

6. **PGN 65088 (0xFE40) - LIGHTING (Comandos e Status de Iluminação)**:
   - Byte 1: Seta Esquerda (bit 0), Seta Direita (bit 1), Pisca-Alerta / Hazard (bit 2).
   - Byte 2: Farol Alto (bit 0).

7. **PGN 65263 (0xFEEF) - EFL/P1 (Engine Fluid Level/Pressure 1)**:
   - **SPN 100 (Pressão de Óleo do Motor)**: Byte 4 $\rightarrow$ `Byte[3] * 0.04` bar.

8. **PGN 65274 (0xFEFA) - AIR (Pressão de Alimentação Pneumática dos Freios)**:
   - **SPN 1087 (Circuito 1 de Freio Pneumático)**: Byte 3 $\rightarrow$ `Byte[2] * 0.08` bar.
   - **SPN 1088 (Circuito 2 de Freio Pneumático)**: Byte 4 $\rightarrow$ `Byte[3] * 0.08` bar.

9. **PGN 65271 (0xFEF7) - VEP (Vehicle Electrical Power)**:
   - **SPN 168 (Tensão da Bateria)**: Bytes 5 e 6 $\rightarrow$ `(Byte[4] | (Byte[5] << 8)) * 0.05` V.

10. **PGN 61445 (0xF005) - ETC2 (Electronic Transmission Controller 2)**:
    - Marcha Selecionada: Byte 4 (Offset -125: 125 = Neutro `N`, 124 = Ré `R`, 126 = 1ª marcha).

---

## 4. Cenários de Simulação Integrados

A aplicação inclui um log master de 150 segundos (2 minutos e 30 segundos) com mais de 9.300 quadros CAN J1939 integrando todos os requisitos do projeto, além de 4 cenários setoriais gravados em taxa de 20 Hz (50 ms):

* **Log Master Completo de 150 Segundos (Arquivo `/public/logs/j1939_truck_simulation_2min.asc` - 9.311 quadros)**:
  - Cobre integralmente todos os 12 itens do projeto:
    1. Velocidade de 0 a 88 km/h e retorno seguro.
    2. Rotação do motor (marcha lenta 650 RPM, trocas automatizadas 1ª a 12ª marcha e rotação de cruzeiro a 1.280 RPM na **faixa verde econômica**).
    3. Nível de combustível diminuindo até entrar na **reserva crítica ($\le 15\%$)** com lâmpada e aviso sonoro.
    4. Temperatura do líquido de arrefecimento subindo até sobreaquecimento crítico (**112°C > 108°C**) com alarme sonoro, retornando a 84°C.
    5. Indicadores de seta (Seta Esquerda a 1,5 Hz, Seta Direita a 1,5 Hz e Pisca-Alerta com relé sonoro).
    6. Indicador de Falha do Motor (**Check Engine / MIL**).
    7. Indicação de Falha Geral (**Alerta Âmbar** e **Red Stop Engine**).
    8. Transmissão automatizada AMT (Neutro `N`, Marcha Ré `R`, 1ª a 12ª marchas).
    9. Pressão dupla dos reservatórios pneumáticos de freio (Circuitos 1 e 2 em bar).
    10. Pressão de óleo lubrificante (4,5 bar normal, queda drástica para 0,35 bar provocando STOP ENGINE, restauração).
    11. Tensão da bateria do sistema veicular de 24 V (25,2 V a 28,1 V).
    12. Procedimento de diagnóstico e envio do comando **SAE J1939 DM11 (Clear Active DTCs)** aos 128s, apagando os flags de falha e restaurando os mostradores.

1. **Rodovia SP-330 (Carga Pesada 45t)**:
   - Partida em 1ª marcha, escalonamento automatizado até a 12ª marcha e velocidade de cruzeiro estabilizada em 85 km/h a 1.280 RPM na faixa verde econômica.
2. **Subida de Serra com Superaquecimento e Falha Geral**:
   - Subida com carga plena e rotação em 1.950 RPM. A temperatura do fluido de arrefecimento sobe progressivamente até atingir 111°C, disparando automaticamente a lâmpada de **Check Engine (MIL)**, a **Falha Geral** e registrando o código DTC `SPN 110 FMI 0` (*Coolant Temp Above Maximum*).
3. **Percurso Urbano com Setas, Paradas e Reserva de Combustível**:
   - Manobras com acionamento de seta à esquerda, desaceleração e parada em semáforo, acionamento de seta à direita, pisca-alerta e alerta contínuo de reserva de combustível (8%).
4. **Falha Crítica no Motor (Queda de Pressão de Óleo & Stop)**:
   - Operação normal a 75 km/h seguida de queda repentina da pressão do óleo para 0,4 bar, disparando o alarme sonoro de emergência, luz vermelha **STOP ENGINE**, Check Engine piscante e DTC `SPN 100 FMI 1` (*Low Oil Pressure*).

---

## 5. Formatos de Arquivos de Log Suportados

Você pode carregar seus próprios arquivos de log de barramento CAN gravados em bancada ou veículo real:

* **Vector CANoe / CANalyzer (`.asc`)**:
  ```
  0.0120 1 18F00400x Rx d 8 0F 7D 80 1F 40 FF FF FF
  0.0240 1 18FEF100x Rx d 8 00 20 4E 00 FF FF FF FF
  ```
* **Linux SocketCAN `candump` (`.log` / `.txt`)**:
  ```
  (1700000000.012) can0 18F00400#0F7D801F40FFFFFF
  (1700000000.024) can0 18FEF100#00204E00FFFFFFFF
  ```
* **Planilhas CSV (`.csv`)**:
  ```
  timestamp,can_id,dlc,d0,d1,d2,d3,d4,d5,d6,d7
  0.012,18F00400,8,0F,7D,80,1F,40,FF,FF,FF
  0.024,18FEF100,8,00,20,4E,00,FF,FF,FF,FF
  ```
* **PEAK-System Trace (`.trc`) e arquivos em texto puro**.

---

## 6. Recursos de Reset e Limpeza de DTCs (SAE J1939 DM11)

A aplicação conta com dois níveis de restauração:

1. **Limpeza de Flags de DTC (SAE J1939 DM11)**:
   - Executa a mensagem diagnóstica padrão DM11 (*Clear/Reset Active Diagnostic Trouble Codes*).
   - Apaga os alertas de **Check Engine (MIL)** e **Falha Geral (Master Warning / Stop)**.
   - Esvazia o vetor de falhas ativas e insere uma entrada correspondente no log de rastreamento do Trampoline RTOS.
2. **Reset Completo da Simulação**:
   - Restaura todos os mostradores aos parâmetros nominais de fábrica (Marcha lenta a 650 RPM, 0 km/h, 85°C, 82% combustível).
   - Rebobina o log CAN para o tempo inicial `0.00s`.
   - Reinicializa os contadores de ticks, trocas de contexto e alarmes do núcleo Trampoline RTOS.

---

## 7. Estrutura de Arquivos do Projeto

```
/
├── index.html                     # Ponto de entrada HTML com tipografia técnica
├── metadata.json                  # Metadados e identificação do app
├── package.json                   # Dependências e scripts npm
├── README.md                      # Documentação técnica completa do projeto
├── src/
│   ├── App.tsx                    # Componente raiz, loop RTOS e orquestração
│   ├── main.tsx                   # Inicialização React 19
│   ├── index.css                  # Tailwind CSS v4 e estilos de cluster
│   ├── types/
│   │   ├── j1939.ts               # Tipos do barramento J1939, DTCs e cluster
│   │   └── trampoline.ts          # Tipos de tarefas OSEK, alarmes, PCP e traces
│   ├── services/
│   │   ├── j1939Decoder.ts        # Parsers, decodificadores de PGN e 4 cenários
│   │   ├── trampolineSimulator.ts # Núcleo do escalonador OSEK e gerador OIL/C
│   │   └── audioSynthesizer.ts    # Síntese Web Audio para relé de seta e alarmes
│   └── components/
│       ├── Header.tsx             # Barra de navegação com contratos Top Bar
│       ├── InstrumentCluster.tsx  # Caixa do painel, moldura e montagem geral
│       ├── ClusterDial.tsx        # Mostradores SVG de alta fidelidade
│       ├── CenterDisplay.tsx      # Tela TFT colorida multifuncional
│       ├── TelltaleLights.tsx     # Lâmpadas de advertência (setas, MIL, Stop)
│       ├── J1939LogPlayer.tsx     # Reprodutor, monitor CAN e injeção de falhas
│       ├── TrampolineInspector.tsx# Inspetor de tarefas, CPU e traces do RTOS
│       ├── TrampolineCodeViewer.tsx# Visualizador de código OIL e fonte C
│       └── DocumentationView.tsx  # Aba interativa de documentação no app
```

---

## 8. Execução Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev

# Validação de tipos e lint
npm run lint

# Compilação de produção
npm run build
```

---

## 9. Conformidade Técnica e Normas

* **SAE J1939-21**: Data Link Layer (Frames de 29 bits, PGNs e endereçamento de rede).
* **SAE J1939-71**: Vehicle Application Layer (Definição de parâmetros físicos e SPNs).
* **SAE J1939-73**: Application Layer - Diagnostics (DM1 Active DTCs, DM11 Clear DTCs, MIL status).
* **ISO 17356 / OSEK-VDX OS 2.2.3**: Arquitetura de sistema operacional de tempo real automotivo.
* **AUTOSAR OS 4.2**: Gerenciamento de tarefas, prioridades estáticas e proteção por teto de prioridade.
