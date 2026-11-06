import React, { useState } from 'react';
import { BookOpen, Cpu, Radio, Gauge, ShieldAlert, FileText, Check, Copy } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'cluster' | 'rtos' | 'j1939' | 'logs' | 'reset'>('cluster');
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    // Readme text
    const text = `# Documentação Técnica - Instrument Cluster Trampoline RTOS & SAE J1939\nConsulte o arquivo README.md na raiz do projeto para o texto completo.`;
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
              <span>Documentação Técnica do Sistema</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Versão 1.2 · ISO 17356 &amp; SAE J1939</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Manual de Engenharia do Instrument Cluster de Caminhão
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
                Restaura todos os registradores da ECU aos parâmetros nominais de fábrica (Marcha lenta em 650 RPM, Velocidade 0 km/h, Combustível em 82%, Arrefecimento em 85°C, Freio de mão puxado e ponto morto `N`). Rebobina o leitor de log para o quadro zero e reinicia o relógio do Trampoline RTOS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
