import React, { useState } from 'react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Layers,
  Cpu,
  Radio,
  Gauge,
  ShieldAlert,
  GitBranch,
  Award
} from 'lucide-react';

export const PresentationView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'Simulador de Instrument Cluster de Caminhão Pesado',
      subtitle: 'Arquitetura de Tempo Real com Trampoline RTOS (OSEK/VDX 2.2.3 / AUTOSAR OS) e Barramento Veicular SAE J1939 CAN 2.0B',
      section: 'Capa / Introdução Executiva',
      icon: Award,
      content: (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-6 h-full">
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold tracking-widest uppercase">
            Sistema Embarcado Automotivo · Nível ASIL-B
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
            Instrument Cluster Module (ICM) com Trampoline RTOS &amp; SAE J1939
          </h1>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            Painel de instrumentos de alta fidelidade para caminhões comerciais pesados (45t), implementado conforme as normas internacionais OSEK/VDX 2.2.3, AUTOSAR OS e protocolo SAE J1939 com inércia física de agulhas e diagnóstico ativo.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-left">
              <span className="text-[11px] font-mono font-bold text-cyan-400 block uppercase">Comunicação</span>
              <span className="text-sm font-bold text-white">SAE J1939 (29 bits)</span>
              <span className="text-xs text-slate-400 block mt-0.5">250 kbps / PDU1 &amp; PDU2</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-left">
              <span className="text-[11px] font-mono font-bold text-emerald-400 block uppercase">Tempo Real</span>
              <span className="text-sm font-bold text-white">Trampoline RTOS</span>
              <span className="text-xs text-slate-400 block mt-0.5">OSEK/VDX · Carga 44,6%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-left">
              <span className="text-[11px] font-mono font-bold text-amber-400 block uppercase">Mecânica</span>
              <span className="text-sm font-bold text-white">Agulhas com Inércia</span>
              <span className="text-xs text-slate-400 block mt-0.5">Filtro IIR Passa-Baixa</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/40 text-left">
              <span className="text-[11px] font-mono font-bold text-rose-400 block uppercase">Diagnóstico</span>
              <span className="text-sm font-bold text-white">J1939 DM1 &amp; DM11</span>
              <span className="text-xs text-slate-400 block mt-0.5">Check Engine &amp; Reset</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: '1. ICM Requirements and Signal Dictionary',
      subtitle: 'Especificação funcional dos mostradores, lâmpadas de advertência e dicionário de sinais SAE J1939',
      section: 'Requisitos do Sistema & Dicionário J1939',
      icon: FileText,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full overflow-y-auto">
          {/* Requisitos */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <span>Requisitos Funcionais Principais (ICM-REQ)</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white block">REQ-01: Velocímetro (0 a 140 km/h)</span>
                <span className="text-slate-400">Recebido via PGN 65265 (CCVS) SPN 84 com filtro de inércia física simulando motor de passo.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white block">REQ-02: Conta-Giros / Tacômetro (0 a 3.000 RPM)</span>
                <span className="text-slate-400">Via PGN 61444 (EEC1) SPN 190 com Faixa Verde Econômica (*Green Eco-Band* 1.000–1.600 RPM).</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white block">REQ-03: Nível de Combustível (0 a 100%)</span>
                <span className="text-slate-400">Via PGN 65276 (DD) SPN 96; aciona lâmpada de reserva crítica quando nível for ≤ 15%.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white block">REQ-04: Temperatura do Arrefecimento (40 a 120°C)</span>
                <span className="text-slate-400">Via PGN 65262 (ET1) SPN 110; disparo de aviso em 102°C e sobreaquecimento crítico em &gt; 108°C.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white block">REQ-05: Setas (1,5 Hz) e Lâmpadas de Falha</span>
                <span className="text-slate-400">Setas a 1,5 Hz com relé acústico, Check Engine (MIL) e Falha Geral (Stop Engine) via DM1 e reset via DM11.</span>
              </div>
            </div>
          </div>

          {/* Dicionário de Sinais */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase font-mono tracking-wider">
              Dicionário de Sinais Normalizados J1939
            </h3>
            <div className="overflow-x-auto text-[11px] font-mono">
              <table className="w-full text-left border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-1.5">PGN</th>
                    <th className="p-1.5">SPN</th>
                    <th className="p-1.5">Sinal</th>
                    <th className="p-1.5">Resolução</th>
                    <th className="p-1.5">Offset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-400">
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">61444</td>
                    <td className="p-1.5 text-white">190</td>
                    <td className="p-1.5 text-slate-200">Engine Speed (RPM)</td>
                    <td className="p-1.5">0,125 rpm</td>
                    <td className="p-1.5">0</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65265</td>
                    <td className="p-1.5 text-white">84</td>
                    <td className="p-1.5 text-slate-200">Vehicle Speed (km/h)</td>
                    <td className="p-1.5">1/256 km/h</td>
                    <td className="p-1.5">0</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65262</td>
                    <td className="p-1.5 text-white">110</td>
                    <td className="p-1.5 text-slate-200">Coolant Temp (°C)</td>
                    <td className="p-1.5">1 °C</td>
                    <td className="p-1.5">-40 °C</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65276</td>
                    <td className="p-1.5 text-white">96</td>
                    <td className="p-1.5 text-slate-200">Fuel Level 1 (%)</td>
                    <td className="p-1.5">0,4 %</td>
                    <td className="p-1.5">0</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65263</td>
                    <td className="p-1.5 text-white">100</td>
                    <td className="p-1.5 text-slate-200">Oil Pressure (bar)</td>
                    <td className="p-1.5">0,04 bar</td>
                    <td className="p-1.5">0</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65274</td>
                    <td className="p-1.5 text-white">1087</td>
                    <td className="p-1.5 text-slate-200">Air Pressure Cir 1</td>
                    <td className="p-1.5">0,08 bar</td>
                    <td className="p-1.5">0</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">61445</td>
                    <td className="p-1.5 text-white">523</td>
                    <td className="p-1.5 text-slate-200">Current Gear (AMT)</td>
                    <td className="p-1.5">1 marcha</td>
                    <td className="p-1.5">-125</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-cyan-400 font-bold">65226</td>
                    <td className="p-1.5 text-white">-</td>
                    <td className="p-1.5 text-rose-300">Active DTCs / MIL</td>
                    <td className="p-1.5">Bitmask+DTC</td>
                    <td className="p-1.5">DM1/DM11</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: '2. Task, Event, Alarm, ISR, and Resource Design',
      subtitle: 'Escalonamento Preemptivo Rate Monotonic (RMS) e Protocolo de Teto de Prioridade (PCP)',
      section: 'Design de Tarefas & RTOS',
      icon: Layers,
      content: (
        <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
          {/* Liu & Layland Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Cálculo de Carga Total da CPU (Liu &amp; Layland)
              </span>
              <p className="text-sm font-mono text-white mt-1">
                U = (1,2/10) + (2,8/20) + (4,5/33) + (1,5/50) + (2,0/100) = <strong className="text-emerald-400">44,6%</strong>
              </p>
            </div>
            <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              <span>Limite Teórico: U_bound = 5 · (2^(1/5) - 1) = </span>
              <span className="text-amber-400 font-bold">74,3%</span>
              <span className="block text-[11px] text-emerald-400">44,6% ≤ 74,3% → 100% Determinístico sem estouro de deadline</span>
            </div>
          </div>

          {/* Tabela de Tarefas */}
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                  <th className="p-2">Tarefa OSEK</th>
                  <th className="p-2">Prioridade</th>
                  <th className="p-2">Período</th>
                  <th className="p-2">WCET</th>
                  <th className="p-2">Carga</th>
                  <th className="p-2">Recursos PCP</th>
                  <th className="p-2">Descrição Funcional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2 font-bold text-cyan-400">Task_CanRx</td>
                  <td className="p-2 text-amber-300 font-bold">20 (Máx)</td>
                  <td className="p-2">10 ms</td>
                  <td className="p-2">1,2 ms</td>
                  <td className="p-2 text-emerald-400">12,0%</td>
                  <td className="p-2 text-purple-300 font-bold">RES_CAN_FIFO (20)</td>
                  <td className="p-2 text-slate-400">Ingestão de alta velocidade da FIFO física e integridade</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">Task_J1939_Decode</td>
                  <td className="p-2 text-amber-300 font-bold">16</td>
                  <td className="p-2">20 ms</td>
                  <td className="p-2">2,8 ms</td>
                  <td className="p-2 text-emerald-400">14,0%</td>
                  <td className="p-2 text-purple-300 font-bold">RES_CAN_FIFO, RES_VEHICLE_STATE</td>
                  <td className="p-2 text-slate-400">Desempacotamento de PGNs e conversão física de sinais</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">Task_Cluster_Gauges</td>
                  <td className="p-2 text-amber-300 font-bold">12</td>
                  <td className="p-2">33 ms (~30 FPS)</td>
                  <td className="p-2">4,5 ms</td>
                  <td className="p-2 text-emerald-400">13,6%</td>
                  <td className="p-2 text-purple-300 font-bold">RES_VEHICLE_STATE (16)</td>
                  <td className="p-2 text-slate-400">Amortecimento inercial e interpolação dos mostradores</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">Task_Warning_Lamps</td>
                  <td className="p-2 text-amber-300 font-bold">10</td>
                  <td className="p-2">50 ms</td>
                  <td className="p-2">1,5 ms</td>
                  <td className="p-2 text-emerald-400">3,0%</td>
                  <td className="p-2 text-purple-300 font-bold">RES_VEHICLE_STATE, RES_DTC_LIST</td>
                  <td className="p-2 text-slate-400">Piscas (1,5 Hz), telltales e avisos acústicos de relé</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">Task_Diagnostics_DM1</td>
                  <td className="p-2 text-amber-300 font-bold">6</td>
                  <td className="p-2">100 ms</td>
                  <td className="p-2">2,0 ms</td>
                  <td className="p-2 text-emerald-400">2,0%</td>
                  <td className="p-2 text-purple-300 font-bold">RES_DTC_LIST (10)</td>
                  <td className="p-2 text-slate-400">Gerenciador de falhas ativas e atendimento ao DM11</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">Priority Ceiling Protocol (PCP)</span>
              <span className="text-slate-400">
                Evita inversão de prioridade clássica e deadlocks: ao travar um recurso, a tarefa herda imediatamente a prioridade máxima dos potenciais concorrentes.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Alarmes Periódicos no SystemCounter (1 ms)</span>
              <span className="text-slate-400">
                Alarm_CanRx (10ms), Alarm_J1939 (20ms), Alarm_Cluster_Gauges (33ms), Alarm_Warning_Lamps (50ms) e Alarm_Diagnostics (100ms).
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: '3. OIL Configuration and Trampoline Application',
      subtitle: 'Especificação OIL 2.5 e implementação do firmware em Linguagem C (ANSI C99 / AUTOSAR)',
      section: 'Configuração OIL & Código C',
      icon: Cpu,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full overflow-y-auto">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">Configuração OIL (cluster.oil)</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{`OIL_VERSION = "2.5";
CPU truck_instrument_cluster {
  OS config {
    STATUS = EXTENDED;
    STARTUPHOOK = TRUE;
    ERRORHOOK = TRUE;
  };
  COUNTER SystemCounter {
    MINCYCLE = 1; TICKSPERBASE = 1;
  };
  RESOURCE RES_CAN_FIFO { RESOURCEPROPERTY = STANDARD; };
  RESOURCE RES_VEHICLE_STATE { RESOURCEPROPERTY = STANDARD; };
  RESOURCE RES_DTC_LIST { RESOURCEPROPERTY = STANDARD; };

  TASK Task_CanRx {
    PRIORITY = 20; ACTIVATION = 1;
    SCHEDULE = FULL; RESOURCE = RES_CAN_FIFO;
  };
  TASK Task_J1939_Decode {
    PRIORITY = 16; ACTIVATION = 1;
    SCHEDULE = FULL;
    RESOURCE = RES_CAN_FIFO;
    RESOURCE = RES_VEHICLE_STATE;
  };
  ALARM Alarm_CanRx {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_CanRx; };
    AUTOSTART = TRUE { ALARMTIME = 10; CYCLETIME = 10; };
  };
};`}</pre>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Implementação C das Tarefas (cluster_tasks.c)</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{`TASK(Task_J1939_Decode)
{
    CanRawFrame_t frame;
    uint32_t pgn;

    GetResource(RES_CAN_FIFO);
    while (CanQueue_Pop(&g_can_rx_fifo, &frame)) {
        ReleaseResource(RES_CAN_FIFO);
        pgn = J1939_ExtractPGN(frame.can_id);

        GetResource(RES_VEHICLE_STATE);
        switch (pgn) {
            case J1939_PGN_EEC1:
                J1939_Decode_EEC1(frame.data, frame.dlc,
                                  &g_state.engine_rpm, NULL);
                break;
            case J1939_PGN_CCVS:
                J1939_Decode_CCVS(frame.data, frame.dlc,
                                  &g_state.vehicle_speed_kmh,
                                  &g_state.parking_brake, NULL);
                break;
            case J1939_PGN_DM1:
                GetResource(RES_DTC_LIST);
                J1939_Process_DM1(frame.data, frame.dlc,
                                  &g_state, &g_dtc_reg);
                ReleaseResource(RES_DTC_LIST);
                break;
        }
        ReleaseResource(RES_VEHICLE_STATE);
        GetResource(RES_CAN_FIFO);
    }
    ReleaseResource(RES_CAN_FIFO);
    TerminateTask();
}`}</pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: '4. CAN / Sensor Input Simulation',
      subtitle: 'Arquivo de log CAN de 150 segundos (2m30s), múltiplos formatos de trace e injeção de falhas',
      section: 'Simulação CAN & Log 2m30s',
      icon: Radio,
      content: (
        <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
          {/* Banner do Log Físico */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] uppercase">
                Log Físico Disponível
              </span>
              <h4 className="text-base font-bold text-white mt-1">/public/logs/j1939_truck_simulation_2min.asc</h4>
              <p className="text-xs text-slate-300">
                Padrão Vector CANoe/CANalyzer ASCII (.asc) · 150 segundos (2m 30s) · 9.311 mensagens CAN de 29 bits.
              </p>
            </div>
            <a
              href="/logs/j1939_truck_simulation_2min.asc"
              download="j1939_truck_simulation_2min.asc"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-colors shrink-0"
            >
              Baixar Arquivo .ASC (536 KB)
            </a>
          </div>

          {/* Timeline de 150 segundos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-0.5">0s – 12s: Pré-Partida &amp; Lenta</span>
              <span className="text-slate-300">Marcha lenta 650 RPM, neutro N, freio puxado, bateria sobe para 27,9V e ar para 9,8 bar.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-0.5">12s – 32s: Saída com Seta Esquerda</span>
              <span className="text-slate-300">Seta esquerda (1,5 Hz com relé), aceleração suave com marchas 1ª a 6ª até 45 km/h.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-0.5">32s – 60s: Cruzeiro na Faixa Verde</span>
              <span className="text-slate-300">12ª marcha a 88 km/h, rotação cravada em 1.280 RPM na Faixa Verde Econômica (1.000–1.600 RPM).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-0.5">60s – 82s: Subida &amp; Sobreaquecimento</span>
              <span className="text-slate-300">Temperatura sobe a 112°C (&gt;108°C); Check Engine (MIL), Falha Geral e DTC SPN 110 ativados.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-0.5">82s – 102s: Queda Óleo &amp; STOP ENGINE</span>
              <span className="text-slate-300">Óleo cai para 0,35 bar; STOP ENGINE vermelho pulsante, alarme sonoro contínuo e DTC SPN 100.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-purple-400 block mb-0.5">102s – 150s: DM11 Reset &amp; Retomada</span>
              <span className="text-slate-300">Acostamento com seta direita, pisca-alerta, reserva 12% e comando DM11 aos 128s apagando todas as falhas.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: '5. Functional Automotive Dashboard',
      subtitle: 'Ergonomia de cockpit rodoviário, mostradores analógicos, fita de telltales e display TFT',
      section: 'Painel Automotivo & Interface',
      icon: Gauge,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 h-full overflow-y-auto">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Mostradores Analógicos (SVG)</span>
            <ul className="text-xs text-slate-300 space-y-2 mt-1">
              <li>• <strong>Velocímetro</strong>: 0 a 140 km/h com zona de cruzeiro 80–90 km/h destacada.</li>
              <li>• <strong>Tacômetro</strong>: 0 a 3.000 RPM com Faixa Verde Econômica (1.000–1.600 RPM).</li>
              <li>• <strong>Nível de Combustível</strong>: 0 a 100% com indicador de reserva crítica (&le; 15%).</li>
              <li>• <strong>Temperatura Arrefecimento</strong>: 40 a 120°C com zona crítica &gt; 102°C.</li>
              <li>• <strong>Filtro IIR</strong>: y(t) = y(t-1) + &alpha; &middot; (x(t) - y(t-1)) para suavidade física.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Lâmpadas de Advertência (Telltales)</span>
            <ul className="text-xs text-slate-300 space-y-2 mt-1">
              <li>• <strong>Setas Esquerda e Direita</strong>: 1,5 Hz (333ms on/off) em verde esmeralda.</li>
              <li>• <strong>Check Engine (MIL)</strong>: Lâmpada de emissões e injeção em âmbar.</li>
              <li>• <strong>Falha Geral (Stop Engine)</strong>: Vermelho pulsante para parada emergencial.</li>
              <li>• <strong>Freio de Estacionamento</strong>: Vermelho ativo quando parado.</li>
              <li>• <strong>Farol Alto &amp; Cruise</strong>: Azul cobalto e verde indicação de cruzeiro.</li>
              <li>• <strong>Síntese Sonora</strong>: Clique de relé mecânico e bips veiculares Web Audio.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">Display TFT Central Multifunção</span>
            <ul className="text-xs text-slate-300 space-y-2 mt-1">
              <li>• <strong>Marcha AMT 12V</strong>: Neutro N, Ré R e 1ª a 12ª marchas à frente.</li>
              <li>• <strong>Freio Pneumático</strong>: Manômetros digitais duplos (Circuito 1 e 2 em bar).</li>
              <li>• <strong>Pressão do Óleo</strong>: Monitor contínuo (0 a 8 bar).</li>
              <li>• <strong>Tensão 24V</strong>: Voltímetro com indicação de carga do alternador.</li>
              <li>• <strong>Card Ativo DTC</strong>: Lista de falhas SPN/FMI com botão direto "Limpar DTCs (DM11)".</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: '6. Timing, Deadline, and Fault-Handling Tests',
      subtitle: 'Matriz de validação temporal sob carga contínua, preempção com PCP e tolerância a falhas',
      section: 'Testes de Tempo Real & Falhas',
      icon: ShieldAlert,
      content: (
        <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                  <th className="p-2">ID</th>
                  <th className="p-2">Caso de Teste</th>
                  <th className="p-2">Condição Injetada</th>
                  <th className="p-2">Comportamento Esperado do RTOS</th>
                  <th className="p-2">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-01</td>
                  <td className="p-2 font-bold text-white">Carga Nominal RMS</td>
                  <td className="p-2 text-slate-400">5 tarefas periódicas em execução</td>
                  <td className="p-2 text-slate-400">Zero estouros de deadline; carga estável em 44,6%</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-02</td>
                  <td className="p-2 font-bold text-white">Preempção de Alta Prioridade</td>
                  <td className="p-2 text-slate-400">Chegada de rajada CAN durante render</td>
                  <td className="p-2 text-slate-400">Task_CanRx (20) preempta Task_Cluster_Gauges (12) em &lt; 100 &mu;s</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-03</td>
                  <td className="p-2 font-bold text-white">Validação de Teto PCP</td>
                  <td className="p-2 text-slate-400">Task_Diagnostics bloqueia RES_DTC_LIST</td>
                  <td className="p-2 text-slate-400">Prioridade sobe para 10; sem inversão de prioridade</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-04</td>
                  <td className="p-2 font-bold text-white">Frequência das Setas</td>
                  <td className="p-2 text-slate-400">Acionamento de seta e pisca-alerta</td>
                  <td className="p-2 text-slate-400">Frequência medida de 1,50 Hz &plusmn; 1,2% (333ms on/off)</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-05</td>
                  <td className="p-2 font-bold text-white">Sobreaquecimento do Motor</td>
                  <td className="p-2 text-slate-400">Coolant Temp &gt; 108°C</td>
                  <td className="p-2 text-slate-400">Check Engine (MIL), Falha Geral, alarme sonoro e DTC SPN 110</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-06</td>
                  <td className="p-2 font-bold text-white">Queda de Pressão de Óleo</td>
                  <td className="p-2 text-slate-400">Pressão de óleo &lt; 0,5 bar</td>
                  <td className="p-2 text-slate-400">STOP ENGINE vermelho, alarme de emergência e DTC SPN 100</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-07</td>
                  <td className="p-2 font-bold text-white">Limpeza DM11 (Reset Falhas)</td>
                  <td className="p-2 text-slate-400">Comando J1939 DM11 executado</td>
                  <td className="p-2 text-slate-400">Zera activeDTCs, desliga Check Engine e Stop Lamp</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-cyan-400">TC-08</td>
                  <td className="p-2 font-bold text-white">Reset Geral da Simulação</td>
                  <td className="p-2 text-slate-400">Acionamento de Reset Simulação</td>
                  <td className="p-2 text-slate-400">Rebobina relógio do RTOS e restaura 650 RPM / 0 km/h</td>
                  <td className="p-2 text-emerald-400 font-bold">APROVADO</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: '7. Github Repository, Technical Report, and Demonstration',
      subtitle: 'Organização do repositório, documentação completa, compilação em C e roteiro guiado',
      section: 'Repositório & Demonstração',
      icon: GitBranch,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full overflow-y-auto text-xs">
          <div className="flex flex-col gap-3">
            <span className="font-mono font-bold text-cyan-400 uppercase text-sm">Estrutura do Repositório</span>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{`├── README.md               # Visão geral rápida
├── TECHNICAL_REPORT.md     # Relatório técnico (7 seções)
├── public/logs/            # Log 150s (.asc Vector)
├── public/presentation/    # Apresentação PowerPoint (.pptx)
├── firmware/               # CÓDIGO EMBARCADO EM C
│   ├── Makefile            # Compilação GCC / goil
│   ├── cluster.oil         # Configuração OSEK 2.5
│   ├── include/            # Headers (.h)
│   └── src/                # Fontes C (.c)
└── src/                    # SIMULADOR EM REACT 19`}</pre>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="font-bold text-emerald-400 block mb-1">Compilação C Standalone (GCC):</span>
              <code className="text-white block bg-slate-950 p-2 rounded border border-slate-800">
                cd firmware && make && ./bin/truck_cluster_sim
              </code>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono font-bold text-amber-400 uppercase text-sm">Roteiro de Demonstração Interativa</span>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-white block">1. Painel Principal:</span>
                <span className="text-slate-400">Verifique os mostradores com Faixa Verde (1.000–1.600 RPM) e display TFT com marchas e ar.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-white block">2. Reprodução do Log de 150s:</span>
                <span className="text-slate-400">Inicie o player e observe o sobreaquecimento (112°C), queda de óleo e setas a 1,5 Hz.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-white block">3. Limpeza de Falhas (DM11):</span>
                <span className="text-slate-400">Pressione "Limpar DTCs (DM11)" para apagar Check Engine e Stop Lamp em tempo de execução.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-white block">4. Auditoria do RTOS Trampoline:</span>
                <span className="text-slate-400">Inspecione as 5 tarefas, trocas de contexto, PCP e log do escalonador em tempo real.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: 'Conclusão e Resultados Alcançados',
      subtitle: 'Validação integral de engenharia automotiva, determinismo temporal e entrega de software duplo',
      section: 'Conclusão & Resultados',
      icon: Award,
      content: (
        <div className="flex flex-col gap-4 p-8 h-full justify-center max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40">
            <h3 className="text-base font-bold text-cyan-400 mb-2">Conformidade Plena com Normas Internacionais</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O projeto cumpre com rigor os requisitos das normas <strong>SAE J1939-21/71/73</strong> (enlace CAN 29 bits, aplicação veicular pesada e diagnósticos), <strong>OSEK/VDX 2.2.3</strong> e <strong>AUTOSAR OS 4.2</strong> para conformidade automotiva de segurança funcional ASIL-B.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40">
            <h3 className="text-base font-bold text-emerald-400 mb-2">Determinismo e Previsibilidade Temporal (PCP)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Com uma utilização de CPU de apenas <strong>44,6%</strong> (bem abaixo do teto de Liu &amp; Layland de 74,3%), o sistema garante margem de folga de 55,4% para expansões futuras, sem risco de inversão de prioridade graças ao uso do Priority Ceiling Protocol (PCP).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40">
            <h3 className="text-base font-bold text-amber-400 mb-2">Entrega Completa de Software (Web + Firmware C)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O projeto disponibiliza tanto o simulador interativo em navegador quanto o código-fonte em <strong>Linguagem C (ANSI C99)</strong> pronto para compilação em microcontroladores automotivos (ARM Cortex-M4), acompanhado do arquivo de log CAN físico de 150 segundos (9.311 quadros) e deste arquivo PowerPoint para apresentação.
            </p>
          </div>
        </div>
      )
    }
  ];

  const active = slides[currentSlide];
  const Icon = active.icon;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Slide Control Deck */}
      <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold text-cyan-400">
                Apresentação Executiva &amp; Técnica
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">Slide {currentSlide + 1} de {slides.length}</span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight">{active.section}</h2>
          </div>
        </div>

        {/* Action Controls & PowerPoint Download Button */}
        <div className="flex items-center gap-3">
          <a
            href="/presentation/truck_instrument_cluster_j1939_trampoline.pptx"
            download="truck_instrument_cluster_j1939_trampoline.pptx"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md shadow-emerald-950/40"
            title="Baixar arquivo nativo do PowerPoint (.pptx)"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PowerPoint (.PPTX)</span>
          </a>

          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              title="Slide Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-400">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              title="Próximo Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Canvas (16:9 Aspect Ratio Container) */}
      <div className="w-full rounded-2xl bg-[#090e17] border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[580px] max-h-[720px] relative">
        {/* Slide Header Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">{active.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{active.subtitle}</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0">
            Slide {currentSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide Body Content */}
        <div className="flex-1 overflow-y-auto">
          {active.content}
        </div>

        {/* Slide Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Simulador de Instrument Cluster de Caminhão Pesado | SAE J1939 | OSEK/VDX 2.2.3</span>
          <span>Engenharia de Software Automotivo (ASIL-B)</span>
        </div>
      </div>

      {/* Slide Thumbnails Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`px-3 py-2 rounded-xl text-left font-mono transition-all border shrink-0 ${
              currentSlide === idx
                ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-cyan-400 font-bold">Slide {idx + 1}</div>
            <div className="text-xs font-semibold truncate max-w-[140px]">{s.section}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
