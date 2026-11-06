import React, { useState } from 'react';
import { BookOpen, Cpu, Radio, Gauge, ShieldAlert, FileText, Check, Copy, ArrowRight } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'report' | 'cluster' | 'rtos' | 'j1939' | 'logs' | 'reset'>('report');
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const text = `# RELATÓRIO TÉCNICO DE ENGENHARIA - ICM TRAMPOLINE RTOS & J1939\nConsulte o arquivo TECHNICAL_REPORT.md na raiz do projeto para o texto completo.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
              <span>Documentação &amp; Relatório Técnico Oficial</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">ISO 17356 &amp; SAE J1939</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Relatório de Engenharia do Instrument Cluster de Caminhão
            </h2>
          </div>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="w-full flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSection('report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'report'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Relatório Técnico (7 Seções)</span>
        </button>

        <button
          onClick={() => setActiveSection('cluster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'cluster'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>1. Painel de Instrumentos</span>
        </button>

        <button
          onClick={() => setActiveSection('rtos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'rtos'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>2. Trampoline RTOS</span>
        </button>

        <button
          onClick={() => setActiveSection('j1939')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'j1939'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>3. PGNs &amp; SPNs J1939</span>
        </button>

        <button
          onClick={() => setActiveSection('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'logs'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. Formatos de Log &amp; Cenários</span>
        </button>

        <button
          onClick={() => setActiveSection('reset')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeSection === 'reset'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>5. Reset &amp; Limpeza de DTCs</span>
        </button>
      </div>

      {/* TECHNICAL REPORT 7 SECTIONS */}
      {activeSection === 'report' && (
        <div className="w-full flex flex-col gap-6 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Executive Overview Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
              <span>Relatório Técnico Oficial</span>
              <span>·</span>
              <span>Documento RT-ICM-TR-J1939-2026</span>
              <span>·</span>
              <span>ISO 26262 ASIL-B</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Relatório de Engenharia: Instrument Cluster Module (ICM) com Trampoline RTOS &amp; SAE J1939
            </h3>
            <p className="text-xs text-slate-400 max-w-4xl">
              Este relatório apresenta a especificação, arquitetura de tempo real sobre Trampoline RTOS (OSEK/VDX 2.2.3 &amp; AUTOSAR OS 4.2), dicionário de sinais do barramento CAN SAE J1939, dinâmica física do painel, cenários de teste de tolerância a falhas e análise de escalonabilidade temporal.
            </p>
          </div>

          {/* 1. ICM REQUIREMENTS AND SIGNAL DICTIONARY */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">1.</span>
              <span>ICM Requirements and Signal Dictionary</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-cyan-300 uppercase font-mono">Requisitos Funcionais do Painel (FR)</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">FR-01:</strong> Velocidade de 0 a 140 km/h atualizada em periodicidade de 100 ms (CCVS).</li>
                  <li><strong className="text-slate-200">FR-02:</strong> RPM de 0 a 3.000 com Faixa Verde Econômica (1.000–1.600 RPM) a cada 50 ms (EEC1).</li>
                  <li><strong className="text-slate-200">FR-03:</strong> Nível de combustível (0–100%) com lâmpada de reserva ativada em nivel menor ou igual a 15% (DD).</li>
                  <li><strong className="text-slate-200">FR-04:</strong> Arrefecimento (40–120°C) com alarme de superaquecimento a partir de 102°C (ET1).</li>
                  <li><strong className="text-slate-200">FR-05:</strong> Setas direcionais a 1,5 Hz (333 ms on/off) com clique de relé sonoro.</li>
                  <li><strong className="text-slate-200">FR-06:</strong> Check Engine (MIL) e Falha Geral/Stop Engine decodificados do PGN 65226 (DM1).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-purple-300 uppercase font-mono">Requisitos Não-Funcionais (NFR)</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">NFR-01:</strong> Determinismo temporal com Trampoline RTOS, sem perdas de deadline (Di menor ou igual a Ti).</li>
                  <li><strong className="text-slate-200">NFR-02:</strong> Recursos protegidos por Protocolo de Teto de Prioridade (PCP) sem inversão de prioridade.</li>
                  <li><strong className="text-slate-200">NFR-03:</strong> Latência fim a fim (CAN para Display) menor que 50 ms.</li>
                  <li><strong className="text-slate-200">NFR-04:</strong> Renderização gráfica suave a 30 FPS com filtro de inércia física das agulhas.</li>
                </ul>
              </div>
            </div>

            {/* Signal Dictionary Table */}
            <div className="mt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase block mb-2">Dicionário de Sinais SAE J1939 (29-bit Extended CAN)</span>
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2 px-2">SPN</th>
                      <th className="py-2 px-2">Parâmetro</th>
                      <th className="py-2 px-2">PGN</th>
                      <th className="py-2 px-2">Origem</th>
                      <th className="py-2 px-2">Resolução / Offset</th>
                      <th className="py-2 px-2">Faixa</th>
                      <th className="py-2 px-2">Ciclo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 190</td>
                      <td className="py-1.5 px-2">Engine Speed (RPM)</td>
                      <td className="py-1.5 px-2 text-amber-400">61444 (EEC1)</td>
                      <td className="py-1.5 px-2">0x00 (ECU)</td>
                      <td className="py-1.5 px-2">0.125 RPM / 0</td>
                      <td className="py-1.5 px-2">0 a 8.031 RPM</td>
                      <td className="py-1.5 px-2">50 ms</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 84</td>
                      <td className="py-1.5 px-2">Wheel-Based Speed</td>
                      <td className="py-1.5 px-2 text-amber-400">65265 (CCVS)</td>
                      <td className="py-1.5 px-2">0x00 (ECU)</td>
                      <td className="py-1.5 px-2">1/256 km/h / 0</td>
                      <td className="py-1.5 px-2">0 a 250 km/h</td>
                      <td className="py-1.5 px-2">100 ms</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 110</td>
                      <td className="py-1.5 px-2">Coolant Temperature</td>
                      <td className="py-1.5 px-2 text-amber-400">65262 (ET1)</td>
                      <td className="py-1.5 px-2">0x00 (ECU)</td>
                      <td className="py-1.5 px-2">1 °C / -40 °C</td>
                      <td className="py-1.5 px-2">-40 a 210 °C</td>
                      <td className="py-1.5 px-2">1.000 ms</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 96</td>
                      <td className="py-1.5 px-2">Fuel Level 1</td>
                      <td className="py-1.5 px-2 text-amber-400">65276 (DD)</td>
                      <td className="py-1.5 px-2">0x17 (ICM)</td>
                      <td className="py-1.5 px-2">0.4 % / 0</td>
                      <td className="py-1.5 px-2">0 a 100 %</td>
                      <td className="py-1.5 px-2">1.000 ms</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 1213</td>
                      <td className="py-1.5 px-2">MIL (Check Engine)</td>
                      <td className="py-1.5 px-2 text-amber-400">65226 (DM1)</td>
                      <td className="py-1.5 px-2">0x00 (ECU)</td>
                      <td className="py-1.5 px-2">2 bits (01=ON)</td>
                      <td className="py-1.5 px-2">0 a 3</td>
                      <td className="py-1.5 px-2">Evento / 1s</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 100</td>
                      <td className="py-1.5 px-2">Engine Oil Pressure</td>
                      <td className="py-1.5 px-2 text-amber-400">65263 (EFL/P1)</td>
                      <td className="py-1.5 px-2">0x00 (ECU)</td>
                      <td className="py-1.5 px-2">0.04 bar / 0</td>
                      <td className="py-1.5 px-2">0 a 10 bar</td>
                      <td className="py-1.5 px-2">500 ms</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-cyan-400">SPN 1087/88</td>
                      <td className="py-1.5 px-2">Pneumatic Air Brakes 1/2</td>
                      <td className="py-1.5 px-2 text-amber-400">65274 (AIR)</td>
                      <td className="py-1.5 px-2">0x0B (EBS)</td>
                      <td className="py-1.5 px-2">0.08 bar / 0</td>
                      <td className="py-1.5 px-2">0 a 16 bar</td>
                      <td className="py-1.5 px-2">500 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. TASK, EVENT, ALARM, ISR, AND RESOURCE DESIGN */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">2.</span>
              <span>Task, Event, Alarm, ISR, and Resource Design</span>
            </h4>
            <p className="text-xs text-slate-400">
              O design de tempo real segue o padrão OSEK/VDX ECC2, estruturado com 5 tarefas preemptivas, 5 alarmes periódicos, 1 rotina de interrupção (ISR Cat 2) e 3 recursos com Protocolo de Teto de Prioridade (PCP).
            </p>
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-2">Tarefa OSEK</th>
                    <th className="py-2 px-2">Prioridade</th>
                    <th className="py-2 px-2">Período (Ti)</th>
                    <th className="py-2 px-2">WCET (Ci)</th>
                    <th className="py-2 px-2">Deadline (Di)</th>
                    <th className="py-2 px-2">Utilização (Ui)</th>
                    <th className="py-2 px-2">Recurso PCP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">Task_CanRx</td>
                    <td className="py-1.5 px-2 font-bold text-amber-300">20</td>
                    <td className="py-1.5 px-2">10 ms</td>
                    <td className="py-1.5 px-2">1,2 ms</td>
                    <td className="py-1.5 px-2">10 ms</td>
                    <td className="py-1.5 px-2 text-emerald-400">12,0 %</td>
                    <td className="py-1.5 px-2 text-purple-300">RES_CAN_FIFO (Ceiling 20)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">Task_J1939_Decode</td>
                    <td className="py-1.5 px-2 font-bold text-amber-300">16</td>
                    <td className="py-1.5 px-2">20 ms</td>
                    <td className="py-1.5 px-2">2,8 ms</td>
                    <td className="py-1.5 px-2">20 ms</td>
                    <td className="py-1.5 px-2 text-emerald-400">14,0 %</td>
                    <td className="py-1.5 px-2 text-purple-300">RES_VEHICLE_STATE (Ceiling 16)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">Task_Cluster_Gauges</td>
                    <td className="py-1.5 px-2 font-bold text-amber-300">12</td>
                    <td className="py-1.5 px-2">33 ms</td>
                    <td className="py-1.5 px-2">4,5 ms</td>
                    <td className="py-1.5 px-2">33 ms</td>
                    <td className="py-1.5 px-2 text-emerald-400">13,6 %</td>
                    <td className="py-1.5 px-2 text-purple-300">RES_VEHICLE_STATE (Ceiling 16)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">Task_Warning_Lamps</td>
                    <td className="py-1.5 px-2 font-bold text-amber-300">10</td>
                    <td className="py-1.5 px-2">50 ms</td>
                    <td className="py-1.5 px-2">1,5 ms</td>
                    <td className="py-1.5 px-2">50 ms</td>
                    <td className="py-1.5 px-2 text-emerald-400">3,0 %</td>
                    <td className="py-1.5 px-2 text-purple-300">RES_VEHICLE_STATE (Ceiling 16)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">Task_Diagnostics_DM1</td>
                    <td className="py-1.5 px-2 font-bold text-amber-300">6</td>
                    <td className="py-1.5 px-2">100 ms</td>
                    <td className="py-1.5 px-2">2,0 ms</td>
                    <td className="py-1.5 px-2">100 ms</td>
                    <td className="py-1.5 px-2 text-emerald-400">2,0 %</td>
                    <td className="py-1.5 px-2 text-purple-300">RES_DTC_LIST (Ceiling 16)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-purple-400 block mb-1">Cálculo de Carga Total da CPU:</span>
              <span>Carga total = 12,0% + 14,0% + 13,6% + 3,0% + 2,0% = 44,6%. A utilização está muito abaixo do limite teórico de Liu &amp; Layland (74,3%), garantindo 100% de previsibilidade temporal sem estouro de deadline.</span>
            </div>
          </div>

          {/* 3. OIL CONFIGURATION AND TRAMPOLINE APPLICATION */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">3.</span>
              <span>OIL Configuration and Trampoline Application</span>
            </h4>
            <p className="text-xs text-slate-400">
              O projeto foi integralmente reescrito em C puro e estruturado no diretório <code className="text-cyan-300 font-mono">/firmware</code> (9 arquivos-fonte em C e headers), acompanhado do arquivo de configuração OIL compilável com <code className="text-cyan-300 font-mono">goil</code> e Makefile para GCC nativo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Trecho OIL (cluster.oil)</span>
                <pre className="text-slate-400 whitespace-pre overflow-x-auto text-[11px]">
{`TASK Task_CanRx {
  PRIORITY = 20;
  AUTOSTART = TRUE { APPMODE = std_mode; };
  ACTIVATION = 1;
  SCHEDULE = FULL;
  RESOURCE = RES_CAN_FIFO;
};

ALARM Alarm_CanRx {
  COUNTER = SystemCounter;
  ACTION = ACTIVATETASK { TASK = Task_CanRx; };
  AUTOSTART = TRUE { ALARMTIME = 10; CYCLETIME = 10; };
};`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Trecho Código C (trampoline_tasks.c)</span>
                <pre className="text-slate-400 whitespace-pre overflow-x-auto text-[11px]">
{`TASK(Task_J1939_Decode)
{
    GetResource(RES_CAN_FIFO);
    while (CanQueue_Pop(&g_can_fifo, &frame)) {
        ReleaseResource(RES_CAN_FIFO);
        GetResource(RES_VEHICLE_STATE);
        // Decode EEC1, CCVS, ET1, DD, DM1
        ReleaseResource(RES_VEHICLE_STATE);
        GetResource(RES_CAN_FIFO);
    }
    ReleaseResource(RES_CAN_FIFO);
    TerminateTask();
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 4. CAN / SENSOR INPUT SIMULATION */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">4.</span>
              <span>CAN / Sensor Input Simulation</span>
            </h4>
            <p className="text-xs text-slate-400">
              O módulo reprodutor simula o transceiver CAN físico (ISO 11898-2) em taxa padrão de 250 kbps, suportando carregamento em tempo de execução de arquivos gravados em campo e execução do log mestre de 150 segundos (2m 30s) com todos os requisitos integrados:
            </p>
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-emerald-950/30 border border-cyan-500/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-400 text-sm block mb-1">
                  Log Master J1939 (150 segundos / 2m 30s - 9.311 quadros)
                </span>
                <span className="text-slate-300">
                  Arquivo físico em padrão Vector CANoe (.asc) contendo todos os 12 itens do projeto: partida, aceleração 1ª a 12ª, faixa verde eco a 1.280 RPM, arrefecimento &gt;108°C com Check Engine, perda de óleo (0,35 bar) com Stop Engine vermelho, setas 1,5 Hz e pisca-alerta, reserva de diesel e comando J1939 DM11 aos 128s restaurando todos os instrumentos.
                </span>
              </div>
              <a
                href="/logs/j1939_truck_simulation_2min.asc"
                download="j1939_truck_simulation_2min.asc"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-colors"
              >
                Baixar .ASC (536 KB)
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">Cenário 1: Rodovia SP-330</span>
                <span className="text-slate-400">Aceleração com 45t de carga até 85 km/h a 1.280 RPM na faixa verde econômica.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">Cenário 2: Subida de Serra</span>
                <span className="text-slate-400">Torque pleno em rampa íngreme: temperatura atinge 111°C disparando Check Engine e Falha Geral.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">Cenário 3: Percurso Urbano</span>
                <span className="text-slate-400">Uso de setas direcionais, paradas em semáforo, pisca-alerta e alerta contínuo de reserva a 8%.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-rose-500 block mb-1">Cenário 4: Falha de Pressão Óleo</span>
                <span className="text-slate-400">Queda abrupta da pressão de óleo para 0.4 bar disparando alarme urgente e lâmpada STOP ENGINE.</span>
              </div>
            </div>
          </div>

          {/* 5. FUNCTIONAL AUTOMOTIVE DASHBOARD */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">5.</span>
              <span>Functional Automotive Dashboard</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Conta-Giros &amp; Arrefecimento</span>
                <span className="text-slate-400">Escala 0–3.000 RPM, Faixa Verde (1.000–1.600 RPM) e termômetro integrado de arrefecimento (40–120°C).</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Display Central TFT</span>
                <span className="text-slate-400">Marcha AMT 12V (N, R, 1–12), manômetros duplos de freio pneumático (bar), pressão do óleo, bateria 24V e alertas DTC.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Velocímetro &amp; Combustível</span>
                <span className="text-slate-400">Escala 0–140 km/h com zona de cruzeiro 80–90 km/h e submostrador de combustível com lâmpada de reserva.</span>
              </div>
            </div>
          </div>

          {/* 6. TIMING, DEADLINE, AND FAULT-HANDLING TESTS */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">6.</span>
              <span>Timing, Deadline, and Fault-Handling Tests</span>
            </h4>
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-2">ID Teste</th>
                    <th className="py-2 px-2">Caso de Teste</th>
                    <th className="py-2 px-2">Condição Injetada</th>
                    <th className="py-2 px-2">Comportamento Esperado</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">TC-01</td>
                    <td className="py-1.5 px-2">Superaquecimento Motor</td>
                    <td className="py-1.5 px-2">Coolant Temp &gt; 102°C</td>
                    <td className="py-1.5 px-2">Check Engine + Falha Geral + Alarme sonoro + DTC SPN 110 FMI 0</td>
                    <td className="py-1.5 px-2 text-emerald-400 font-bold">APROVADO</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">TC-02</td>
                    <td className="py-1.5 px-2">Queda Pressão de Óleo</td>
                    <td className="py-1.5 px-2">Pressão Óleo &lt; 1.2 bar</td>
                    <td className="py-1.5 px-2">STOP ENGINE vermelho + Alarme de emergência + DTC SPN 100 FMI 1</td>
                    <td className="py-1.5 px-2 text-emerald-400 font-bold">APROVADO</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">TC-03</td>
                    <td className="py-1.5 px-2">Limpeza DTC (DM11)</td>
                    <td className="py-1.5 px-2">Execução DM11 Clear</td>
                    <td className="py-1.5 px-2">Apagar MIL, Stop Engine e zerar activeDTCs</td>
                    <td className="py-1.5 px-2 text-emerald-400 font-bold">APROVADO</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-cyan-400">TC-04</td>
                    <td className="py-1.5 px-2">Reset Completo Simulação</td>
                    <td className="py-1.5 px-2">Acionamento Reset Geral</td>
                    <td className="py-1.5 px-2">Restaurar registradores de fábrica (650 RPM, 0 km/h) e rebobinar RTOS</td>
                    <td className="py-1.5 px-2 text-emerald-400 font-bold">APROVADO</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. GITHUB REPOSITORY, TECHNICAL REPORT, AND DEMONSTRATION */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono">7.</span>
              <span>GitHub Repository, Technical Report, and Demonstration</span>
            </h4>
            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <p>
                O repositório do projeto contém os arquivos de implementação em C (<code className="text-cyan-300 font-mono">trampoline_tasks.c</code>), configuração OIL (<code className="text-cyan-300 font-mono">cluster.oil</code>), cabeçalhos (<code className="text-cyan-300 font-mono">j1939_stack.h</code>) e a documentação técnica integral em <strong className="text-cyan-400 font-mono">TECHNICAL_REPORT.md</strong> e <strong className="text-cyan-400 font-mono">README.md</strong>.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <span className="text-slate-500 block mb-1">Comandos de Build e Execução:</span>
                <span className="text-cyan-400 block">git clone &lt;repo-url&gt; &amp;&amp; cd &lt;repo&gt;</span>
                <span className="text-slate-300 block">npm install</span>
                <span className="text-slate-300 block">npm run dev      # Servidor de desenvolvimento na porta 3000</span>
                <span className="text-slate-300 block">npm run build    # Compilação otimizada para produção</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: INSTRUMENT CLUSTER */}
      {activeSection === 'cluster' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <span>Especificação dos Mostradores e Lâmpadas do Caminhão</span>
            </h3>
            <p className="text-slate-400">
              O cluster foi modelado para replicar com exatidão a ergonomia de cabines de veículos comerciais modernos (Scania Linha S/R, Volvo FH16 e Mercedes Actros), onde há mostradores analógicos para grandezas dinâmicas com alta taxa de leitura e um display central TFT colorido para dados de apoio e diagnóstico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-cyan-300 font-mono mb-1">Velocímetro (Speedometer)</h4>
              <p className="text-xs text-slate-400 mb-2">Faixa de 0 a 140 km/h. Decodificado a partir do PGN 65265 (CCVS) SPN 84.</p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li>Agulha física com amortecimento inercial de segunda ordem (30 FPS).</li>
                <li>Zona de cruzeiro comercial destacada em ciano (80–90 km/h).</li>
                <li>Submostrador inferior de Nível de Combustível (0 a 100%).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-emerald-300 font-mono mb-1">Conta-Giros (Tachometer)</h4>
              <p className="text-xs text-slate-400 mb-2">Faixa de 0 a 3.000 RPM. Decodificado a partir do PGN 61444 (EEC1) SPN 190.</p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li><strong className="text-emerald-400">Faixa Verde Econômica (1.000 a 1.600 RPM)</strong>: Região de torque plano e menor consumo específico de combustível (g/kWh).</li>
                <li>Faixa vermelha de corte e perigo mecânico (&gt; 2.400 RPM).</li>
                <li>Submostrador inferior de Temperatura do Arrefecimento (40 a 120°C).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-amber-300 font-mono mb-1">Check Engine (MIL - Falha no Motor)</h4>
              <p className="text-xs text-slate-400 mb-2">Decodificado do PGN 65226 (DM1), Byte 0, bits 7–8.</p>
              <p className="text-xs text-slate-300">
                Acende em amarelo/âmbar com ícone de bloco de motor quando a ECU do trem de força detecta anomalia no sistema de injeção, sobreaquecimento ou sensores fora da faixa operacional.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-rose-400 font-mono mb-1">Falha Geral (Master Warning / Stop)</h4>
              <p className="text-xs text-slate-400 mb-2">Decodificado do PGN 65226 (DM1), Byte 0, bits 3–6.</p>
              <p className="text-xs text-slate-300">
                Sinaliza falha mestre crítica (risco iminente de dano ao motor, como perda de lubrificação ou temperatura extrema &gt; 102°C). Emite aviso sonoro duplo e exibe o código SPN/FMI na tela central.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TRAMPOLINE RTOS */}
      {activeSection === 'rtos' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Arquitetura de Tempo Real Trampoline RTOS</span>
            </h3>
            <p className="text-slate-400">
              O **Trampoline RTOS** é um sistema operacional de tempo real open-source que implementa estritamente os padrões **OSEK/VDX 2.2.3** e **AUTOSAR OS 4.2**, projetado para ECUs automotivas com determinismo estrito e garantias de tempo limite de execução (WCET).
            </p>
          </div>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Tarefa OSEK</th>
                  <th className="py-2 px-3">Prioridade</th>
                  <th className="py-2 px-3">Período</th>
                  <th className="py-2 px-3">Escalonamento</th>
                  <th className="py-2 px-3">WCET</th>
                  <th className="py-2 px-3">Recurso (PCP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-bold">Task_CanRx</td>
                  <td className="py-2 px-3 font-bold text-amber-300">20 (Máxima)</td>
                  <td className="py-2 px-3">10 ms</td>
                  <td className="py-2 px-3 text-emerald-400">FULL</td>
                  <td className="py-2 px-3">1.2 ms</td>
                  <td className="py-2 px-3 text-purple-300">RES_CAN_FIFO</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-bold">Task_J1939_Decode</td>
                  <td className="py-2 px-3 font-bold text-amber-300">16</td>
                  <td className="py-2 px-3">20 ms</td>
                  <td className="py-2 px-3 text-emerald-400">FULL</td>
                  <td className="py-2 px-3">2.8 ms</td>
                  <td className="py-2 px-3 text-purple-300">RES_CAN_FIFO, RES_VEHICLE_STATE</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-bold">Task_Cluster_Gauges</td>
                  <td className="py-2 px-3 font-bold text-amber-300">12</td>
                  <td className="py-2 px-3">33 ms</td>
                  <td className="py-2 px-3 text-emerald-400">FULL</td>
                  <td className="py-2 px-3">4.5 ms</td>
                  <td className="py-2 px-3 text-purple-300">RES_VEHICLE_STATE</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-bold">Task_Warning_Lamps</td>
                  <td className="py-2 px-3 font-bold text-amber-300">10</td>
                  <td className="py-2 px-3">50 ms</td>
                  <td className="py-2 px-3 text-emerald-400">FULL</td>
                  <td className="py-2 px-3">1.5 ms</td>
                  <td className="py-2 px-3 text-purple-300">RES_VEHICLE_STATE</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-bold">Task_Diagnostics_DM1</td>
                  <td className="py-2 px-3 font-bold text-amber-300">6</td>
                  <td className="py-2 px-3">100 ms</td>
                  <td className="py-2 px-3 text-emerald-400">FULL</td>
                  <td className="py-2 px-3">2.0 ms</td>
                  <td className="py-2 px-3 text-purple-300">RES_VEHICLE_STATE, RES_DTC_LIST</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <h4 className="font-bold text-purple-400 font-mono mb-1">Protocolo de Teto de Prioridade (Priority Ceiling Protocol - PCP)</h4>
            <p className="text-slate-400">
              Para compartilhamento seguro das estruturas de estado do veículo e da fila de mensagens CAN entre tarefas com diferentes períodos, cada recurso OSEK possui um teto de prioridade igual à prioridade máxima das tarefas que o acessam. Quando a tarefa obtém o recurso via <code className="text-cyan-300 font-mono">GetResource(RES_VEHICLE_STATE)</code>, sua prioridade é temporariamente elevada, bloqueando qualquer tarefa concorrente e eliminando o risco de inversão de prioridade.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: J1939 PGNS AND SPNS */}
      {activeSection === 'j1939' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Especificação do Barramento CAN SAE J1939</span>
            </h3>
            <p className="text-slate-400">
              O protocolo SAE J1939 é a norma dominante para comunicação eletrônica de alta velocidade em veículos pesados (caminhões, ônibus, máquinas agrícolas e embarcações).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 61444 (0xF004) - EEC1</span>
              <span className="text-slate-400">SPN 190: Rotação do Motor (0.125 RPM/bit)</span>
              <span className="text-slate-500">Bytes 4 e 5: (B3 | (B4 &lt;&lt; 8)) * 0.125</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 65265 (0xFEF1) - CCVS</span>
              <span className="text-slate-400">SPN 84: Velocidade do Veículo (1/256 km/h/bit)</span>
              <span className="text-slate-500">Bytes 2 e 3: (B1 | (B2 &lt;&lt; 8)) / 256.0</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 65262 (0xFEEE) - ET1</span>
              <span className="text-slate-400">SPN 110: Temperatura do Arrefecimento (ECT)</span>
              <span className="text-slate-500">Byte 1: B0 - 40 (°C)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 65276 (0xFEFC) - DD</span>
              <span className="text-slate-400">SPN 96: Nível de Combustível (0.4 %/bit)</span>
              <span className="text-slate-500">Byte 2: B1 * 0.4 (%)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 65226 (0xFECA) - DM1</span>
              <span className="text-slate-400">Códigos de Diagnóstico Ativos (DTC)</span>
              <span className="text-slate-500">Byte 0: Lâmpadas MIL, Stop, Âmbar · Bytes 2-5: SPN &amp; FMI</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-cyan-400">PGN 65088 (0xFE40) - LIGHTING</span>
              <span className="text-slate-400">Status de Setas e Iluminação</span>
              <span className="text-slate-500">Byte 0: Bit 0 (Seta Esq), Bit 1 (Seta Dir), Bit 2 (Hazard)</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LOG FORMATS & SCENARIOS */}
      {activeSection === 'logs' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Formatos de Arquivos de Log Suportados</span>
            </h3>
            <p className="text-slate-400">
              O reprodutor J1939 possui analisador sintático inteligente que detecta automaticamente a formatação do arquivo carregado:
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">1. Vector CANoe / CANalyzer (.asc)</span>
              <pre className="text-slate-400 whitespace-pre overflow-x-auto">
{`0.0120 1 18F00400x Rx d 8 0F 7D 80 1F 40 FF FF FF
0.0240 1 18FEF100x Rx d 8 00 20 4E 00 FF FF FF FF`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">2. Linux SocketCAN candump (.log / .txt)</span>
              <pre className="text-slate-400 whitespace-pre overflow-x-auto">
{`(1700000000.012000) can0 18F00400#0F7D801F40FFFFFF
(1700000000.024000) can0 18FEF100#00204E00FFFFFFFF`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">3. Tabela CSV (.csv)</span>
              <pre className="text-slate-400 whitespace-pre overflow-x-auto">
{`timestamp,can_id,dlc,d0,d1,d2,d3,d4,d5,d6,d7
0.012,18F00400,8,0F,7D,80,1F,40,FF,FF,FF
0.024,18FEF100,8,00,20,4E,00,FF,FF,FF,FF`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: RESET AND DTC CLEARING */}
      {activeSection === 'reset' && (
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Mecanismos de Reset e Diagnóstico J1939 DM11</span>
            </h3>
            <p className="text-slate-400">
              O simulador disponibiliza comandos diagnósticos alinhados com o protocolo padrão SAE J1939-73 (Application Layer - Diagnostics):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-amber-300 font-mono mb-2">Limpar Flags de DTC (J1939 DM11)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simula o envio do pacote de diagnóstico <strong className="text-amber-400">DM11 (Diagnostic Message 11 - Clear/Reset Active DTCs)</strong>.
                Quando acionado, apaga imediatamente as lâmpadas de anomalia de injeção (Check Engine / MIL) e de Falha Geral (Amber/Red Stop), esvaziando a lista de códigos ativos e registrando a confirmação no histórico do RTOS.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-cyan-300 font-mono mb-2">Reset Completo da Simulação</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Restaura todos os registradores da ECU aos parâmetros nominais de fábrica (Marcha lenta em 650 RPM, Velocidade 0 km/h, Combustível em 82%, Arrefecimento em 85°C, Freio de mão puxado e ponto morto N). Rebobina o leitor de log para o quadro zero e reinicia o relógio do Trampoline RTOS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
