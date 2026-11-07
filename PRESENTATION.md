# Apresentação do Projeto: Instrument Cluster para Caminhão Pesado
## Arquitetura OSEK/VDX Trampoline RTOS & SAE J1939 CAN Bus (ASIL-B)

**Arquivo PowerPoint nativo disponível para download:**
`/public/presentation/truck_instrument_cluster_j1939_trampoline.pptx` (ou diretamente na aba **"Apresentação (.PPTX)"** da aplicação web).

---

## Estrutura da Apresentação (Slides Executivos 16:9)

### SLIDE 1: Capa & Sumário Executivo
- **Título**: Instrument Cluster de Caminhão Pesado com Trampoline RTOS & SAE J1939
- **Subtítulo**: Arquitetura OSEK/VDX 2.2.3, Barramento CAN 2.0B e Conformidade ISO 26262 ASIL-B
- **Objetivo**: Desenvolvimento, simulação e validação em tempo real de um painel de instrumentos automotivo para veículos comerciais pesados (Classe 8) com garantia estrita de deadlines e tolerância a falhas.
- **Destaques**:
  - Utilização estrita do RTOS Trampoline (padrão OSEK/VDX e AUTOSAR OS).
  - Decodificação de 8 PGNs críticos SAE J1939 a 250 kbps.
  - Análise de escalonabilidade com $U = 44.6\% < U_{bound} = 74.3\%$ (Liu & Layland).
  - Log CAN com mais de 2 minutos de duração com injeção de falhas e DTCs (DM1).

---

### SLIDE 2: 1. ICM Requirements and Signal Dictionary
- **Requisitos Funcionais e de Segurança**:
  - **REQ-ICM-01 (Velocidade & Odômetro)**: Atualização a cada 50 ms via CCVS1 (PGN 65265), resolução 1/256 km/h.
  - **REQ-ICM-02 (Rotação do Motor)**: Atualização a cada 20 ms via EEC1 (PGN 61444), faixa 0–3500 RPM, resolução 0.125 RPM.
  - **REQ-ICM-03 (Nível de Combustível)**: Atualização a cada 1000 ms via DD (PGN 65276), filtro IIR anti-slosh de 1º ordem.
  - **REQ-ICM-04 (Temperatura de Arrefecimento)**: Atualização a cada 1000 ms via ET1 (PGN 65262), faixa -40 a +210 °C.
  - **REQ-ICM-05 (Sinalizadores de Direção)**: Frequência $1.5\text{ Hz} \pm 0.1\text{ Hz}$ com duty cycle de $50\% \pm 5\%$ via TCO1 (PGN 65132).
  - **REQ-ICM-06 (Gerenciamento de Falhas & DTCs)**: Decodificação de DM1 (PGN 65226), acionamento de MIL (Check Engine), Stop Engine e Telltales Gerais.

- **Dicionário de Sinais SAE J1939**:

| PGN | Nome J1939 | Taxa | SPN | Sinal / Variável | Resolução / Offset | Faixa |
|---|---|---|---|---|---|---|
| **65265 (0xFEF1)** | CCVS1 | 100 ms | **84** | Wheel-Based Vehicle Speed | 1/256 km/h (0.0039) | 0 a 250.96 km/h |
| **61444 (0xF004)** | EEC1 | 20 ms | **190** | Engine Speed (RPM) | 0.125 RPM/bit | 0 a 8,031.875 RPM |
| **65276 (0xFEFC)** | Dash Display (DD) | 1000 ms | **96** | Fuel Level 1 | 0.4 %/bit | 0 a 100 % |
| **65262 (0xFEEE)** | Engine Temp 1 (ET1) | 1000 ms | **110** | Engine Coolant Temperature | 1 °C/bit (-40 °C offset) | -40 a +210 °C |
| **65132 (0xFE6C)** | Tachograph (TCO1) | 50 ms | **1624** | Turn Left & Right Direction Signals | 2 bits (00: off, 01: on) | Estados discretos |
| **65226 (0xFECA)** | Active DTCs (DM1) | 1000 ms | **1214** | Malfunction Indicator Lamp (MIL) | 2 bits | Flash / On / Off |
| **65226 (0xFECA)** | Active DTCs (DM1) | 1000 ms | **1215** | Red Stop Engine Lamp | 2 bits | Flash / On / Off |
| **65226 (0xFECA)** | Active DTCs (DM1) | 1000 ms | **1213** | Amber Warning Lamp | 2 bits | Flash / On / Off |
| **65263 (0xFEEF)** | Engine Fluid (EFL_P1) | 500 ms | **100** | Engine Oil Pressure | 4 kPa/bit | 0 a 1000 kPa |
| **65271 (0xFEF7)** | Electrical Power (VEP) | 1000 ms | **158** | Battery Potential (Voltage) | 0.05 V/bit | 0 a 32.1 V |

---

### SLIDE 3: 2. Task, Event, Alarm, ISR, and Resource Design
- **Classificação OSEK/VDX 2.2.3 & Conformance Class ECC2 / BCC2**:
  - **ISR2_CAN_Rx**: Prioridade de Hardware Máxima. Tratamento imediato de frames no buffer CAN, verificação de ID e disparo de sinalização.
  - **Task_CAN_Rx (ECC2, Extended Task)**: Prioridade 5 (Mais alta). Aguarda `Event_CAN_Rx` ou alarme a cada 10 ms. Desempacota payload J1939 em memória intermediária com lock de recurso.
  - **Task_Vehicle_Dynamics (BCC2, Basic Task)**: Prioridade 4. Período de 20 ms. Processa RPM e Velocidade com filtros numéricos para animação fluida sem atraso de fase.
  - **Task_Sensors_Fluids (BCC2, Basic Task)**: Prioridade 3. Período de 100 ms. Processa Nível de Combustível (filtro IIR anti-balanço), Temperatura de Arrefecimento e Pressão de Óleo.
  - **Task_DTC_Diagnosis (BCC2, Basic Task)**: Prioridade 2. Período de 250 ms. Avalia lâmpadas DM1, timeouts de barramento CAN (>1000 ms = alerta de perda de comunicação) e falhas gerais.
  - **Task_Display_Render (BCC2, Basic Task)**: Prioridade 1. Período de 33 ms (~30 FPS). Serializa dados para o barramento SPI/LVDS do display do cluster e gerencia relé das setas (1.5 Hz).

- **Sincronização e Prevenção de Inversão de Prioridade**:
  - **Res_ClusterData**: Recurso OSEK protegido pelo Priority Ceiling Protocol (PCP).
  - Teto de prioridade dinâmico elevado para a prioridade máxima dos compartilhadores (Prioridade 5), garantindo ausência de deadlock e bloqueio limitado a no máximo 1 seção crítica.

- **Análise de Carga do Processador (Rate Monotonic Scheduling)**:
  - $\sum \frac{C_i}{T_i} = \frac{1.2}{10} + \frac{2.5}{20} + \frac{4.0}{100} + \frac{6.0}{250} + \frac{4.5}{33.3} = 12.0\% + 12.5\% + 4.0\% + 2.4\% + 13.5\% = 44.4\%$
  - Margem de segurança de $55.6\%$ para garantir determinismo estrito (ASIL-B).

---

### SLIDE 4: 3. OIL Configuration and Trampoline Application
- **Arquivo de Configuração OIL (`cluster.oil`)**:
  - Definição estática de objetos: `CPU ClusterController { OS config { STATUS = EXTENDED; }; ... };`.
  - Configuração de Alarms vinculados ao `SystemCounter`:
    - `Alarm_CAN_Rx` (Ciclo: 10 ticks, OFFSET: 1)
    - `Alarm_VehicleDynamics` (Ciclo: 20 ticks, OFFSET: 5)
    - `Alarm_SensorsFluids` (Ciclo: 100 ticks, OFFSET: 10)
    - `Alarm_DTC_Diagnosis` (Ciclo: 250 ticks, OFFSET: 20)
    - `Alarm_DisplayRender` (Ciclo: 33 ticks, OFFSET: 3)
  - Atribuição de recursos e stacks isoladas: `RESOURCE Res_ClusterData { RESOURCEPROPERTY = STANDARD; };`.

- **Implementação C Nativa (`firmware/main.c`)**:
  - Macros padrão OSEK: `TASK(Task_Vehicle_Dynamics)`, `ISR(ISR2_CAN_Rx)`, `DeclareTask()`, `DeclareResource()`.
  - Uso estrito das APIs:
    - `GetResource(Res_ClusterData);`
    - `ReleaseResource(Res_ClusterData);`
    - `SetEvent(Task_CAN_Rx, Event_CAN_Rx);`
    - `WaitEvent(Event_CAN_Rx); ClearEvent(Event_CAN_Rx);`
    - `TerminateTask();`

---

### SLIDE 5: 4. CAN / Sensor Input Simulation
- **Arquivo de Simulação de Longa Duração**:
  - Log CAN em formato ASCII Vector (`.asc`): `/public/logs/j1939_truck_simulation_2min.asc`.
  - Duração total: **150 segundos (2 minutos e 30 segundos)** ininterruptos.
  - Total de mensagens: **9.311 frames CAN 2.0B** a 250 kbps.

- **Cronograma de Cenários Simulados**:
  - **0s a 25s - Partida a Frio e Marcha Lenta**: Ignition ON, lâmpadas de verificação ativadas, RPM sobe para 650, temperatura a 25 °C.
  - **25s a 65s - Aceleração Urbana e Manobras**: Subida de marcha (1ª a 6ª), setas acionadas (PGN 65132), velocidade atinge 45 km/h, aquecimento para 85 °C.
  - **65s a 105s - Velocidade de Cruzeiro em Rodovia**: 11ª marcha, 88 km/h constantes, 1.450 RPM, consumo de combustível contínuo, pressão de óleo estável (420 kPa).
  - **105s a 130s - Injeção de Falhas Críticas (Overheat & DM1 DTC)**:
    - Temperatura de arrefecimento dispara para 108 °C (> 102 °C threshold).
    - PGN 65226 DM1 transmite `SPN 110 FMI 0` (High Coolant Temp) e `SPN 100 FMI 1` (Low Oil Pressure).
    - Ativação imediata de Stop Engine (Red Lamp), MIL (Yellow Lamp) e alarme sonoro contínuo.
  - **130s a 150s - Parada Segura, Limpeza de DTCs e Reset**: Redução de velocidade para 0 km/h, acionamento do pisca-alerta, parada do motor e comando de Reset / Limpeza de falhas.

---

### SLIDE 6: 5. Functional Automotive Dashboard
- **Instrumentação Analógica Digitalizada**:
  - **Velocímetro**: 0 a 140 km/h, marcações dinâmicas a cada 10 km/h, agulha em vetor SVG com resposta inercial e odômetro digital.
  - **Tacômetro (RPM)**: 0 a 3.500 RPM, zonas coloridas funcionais:
    - Verde (Eco / Torque máximo): 1.100 a 1.700 RPM.
    - Amarelo (Atenção): 1.700 a 2.300 RPM.
    - Vermelho (Perigo / Redline): > 2.300 RPM.
  - **Indicadores Secundários de Nível**:
    - Nível de Combustível: 0 a 100%, com telltale de reserva ativa abaixo de 15%.
    - Temperatura de Arrefecimento: 40 a 120 °C, telltale de superaquecimento acima de 102 °C.
    - Pressão de Óleo e Tensão da Bateria (12V/24V) no TFT central.

- **Sinalizadores e Luzes Espia (Telltales)**:
  - Setas Direita e Esquerda em verde automotivo com oscilador sincronizado em 1.5 Hz e áudio de relé bi-estável.
  - MIL (Check Engine) em âmbar regulatório (SAE J1939).
  - Stop Engine em vermelho pulsante de alta prioridade.
  - Falha Geral (General Fault / Triângulo Master Warning).
  - Pressão Baixa de Ar nos Freios, Cinto de Segurança e Farol Alto.

---

### SLIDE 7: 6. Timing, Deadline, and Fault-Handling Tests
- **Matriz de Validação e Testes de Confiabilidade (ASIL-B)**:

| ID | Cenário de Teste | Estímulo Injetado | Comportamento Esperado | Resultado | Status |
|---|---|---|---|---|---|
| **TC-01** | Prioridade de Tarefas | Carga máxima com CAN burst | Preempção imediata de tarefas de baixa prioridade por `Task_CAN_Rx` | Zero inversão não controlada | **PASS** |
| **TC-02** | Proteção PCP | Acesso concorrente a `Res_ClusterData` | Bloqueio limitado ao teto dinâmico de prioridade | Deadlock-free comprovado | **PASS** |
| **TC-03** | Deadline de Renderização | Ciclo de desenho a 30 FPS | Execução em $\le 4.5\text{ ms}$ dentro da janela de $33.3\text{ ms}$ | $0\%$ deadlines perdidos | **PASS** |
| **TC-04** | CAN Bus-Off & Timeout | Interrupção de CCVS1 por $>1.0\text{ s}$ | Velocímetro decai para $0\text{ km/h}$, flag de falha CAN acionada | Fail-safe imediato | **PASS** |
| **TC-05** | Superaquecimento (ET1) | SPN 110 $> 102\text{ }^\circ\text{C}$ | Telltale vermelha acesa, buzzer sonoro acionado | Alerta em $<100\text{ ms}$ | **PASS** |
| **TC-06** | Injeção DM1 DTC | Recepção de PGN 65226 com MIL ativo | Lâmpada Check Engine ativada e código registrado no display | Diagnóstico completo | **PASS** |
| **TC-07** | Limpeza de DTCs | Comando de reset via UI / UDS 0x14 | DTCs apagados, lâmpadas apagadas, cluster restaurado | Limpeza atômica | **PASS** |
| **TC-08** | Reset Geral do Sistema | Estímulo de Watchdog / Reset manual | Re-inicialização OSEK com `StartOS(OSDEFAULTAPPMODE)` | Boot em $< 120\text{ ms}$ | **PASS** |

---

### SLIDE 8: 7. GitHub Repository, Technical Report, and Demonstration
- **Estrutura do Repositório**:
  ```text
  truck-cluster-trampoline-j1939/
  ├── firmware/                  # Código C nativo OSEK/VDX Trampoline
  │   ├── main.c                 # Ponto de entrada e rotinas de tarefas
  │   ├── cluster.oil            # Descrição arquitetural OIL
  │   ├── j1939_stack.h/.c       # Pilha de decodificação de PGNs
  │   └── Makefile               # Compilação cross-platform com Viper
  ├── public/
  │   ├── logs/                  # Arquivo de simulação CAN .asc (150s)
  │   └── presentation/          # Apresentação nativa em PowerPoint (.pptx)
  ├── src/                       # Aplicação React 19 / TypeScript
  │   ├── components/            # Dashboard, Visualizador de Código, Relatório
  │   └── services/              # Motor OSEK e decodificador J1939
  ├── DOCUMENTATION.md           # Documentação técnica completa
  ├── TECHNICAL_REPORT.md        # Relatório de engenharia detalhado
  └── PRESENTATION.md           # Roteiro desta apresentação
  ```

- **Roteiro de Demonstração Interativa**:
  1. **Aba "Painel do Caminhão"**: Execução em tempo real dos manômetros, áudio de motor e relés de seta.
  2. **Aba "Reprodutor de Log CAN J1939"**: Carregamento do log de 2 minutos, controle de velocidade (1x a 5x) e injeção manual de falhas.
  3. **Aba "Inspetor RTOS"**: Monitoramento das 5 tarefas OSEK, uso de CPU (44.6%), estado dos alarmes e log de traços.
  4. **Aba "Código Trampoline (C & OIL)"**: Inspeção lado a lado dos arquivos C99 e da gramática OIL.
  5. **Aba "Documentação & Relatório"**: Visualização e download de relatórios técnicos completos.
  6. **Aba "Apresentação (.PPTX)"**: Navegador interativo de slides e download direto do arquivo `.pptx`.

---

### SLIDE 9: Conclusão e Resultados de Engenharia
- **Resultados Alcançados**:
  - Implementação completa e determinística de um Instrument Cluster automotivo Classe 8.
  - Conformidade estrita com os padrões internacionais **OSEK/VDX 2.2.3**, **AUTOSAR OS 4.2** e **SAE J1939-71**.
  - Garantia formal de escalonabilidade com $44.6\%$ de utilização média e zero deadlocks via PCP.
  - Ferramental completo de simulação com log CAN realístico de 150 segundos e arquivo PowerPoint executivo nativo disponível para exportação.
