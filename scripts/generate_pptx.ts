import fs from 'fs';
import path from 'path';
import pptxgen from 'pptxgenjs';

async function generatePresentation() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Engenharia de Sistemas Embarcados Automotivos';
  pres.company = 'Truck Instrument Cluster Module Project';
  pres.title = 'Instrument Cluster de Caminhão com Trampoline RTOS e SAE J1939';

  const BG_COLOR = '0B1120';    // Deep Navy Slate
  const CARD_BG = '1E293B';     // Slate 800
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const ACCENT_CYAN = '38BDF8';
  const ACCENT_EMERALD = '10B981';
  const ACCENT_AMBER = 'F59E0B';
  const ACCENT_RED = 'EF4444';

  // Helper to add common slide background and footer
  const setupSlide = (title: string, subtitle?: string, slideNumber?: number) => {
    const slide = pres.addSlide();
    slide.background = { color: BG_COLOR };

    // Header bar
    slide.addShape(pres.ShapeType.rect, {
      x: 0.6, y: 0.4, w: 12.13, h: 0.9,
      fill: { color: '131E32' },
      line: { color: '1E293B', width: 1 }
    });

    slide.addText(title, {
      x: 0.8, y: 0.45, w: 10.0, h: 0.5,
      fontSize: 20, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 0.85, w: 10.0, h: 0.35,
        fontSize: 11, fontFace: 'Calibri', color: TEXT_MUTED
      });
    }

    // Top Right Tag
    slide.addShape(pres.ShapeType.roundRect, {
      x: 10.9, y: 0.6, w: 1.6, h: 0.4,
      fill: { color: '0369A1' },
      rectRadius: 0.1
    });
    slide.addText('TRAMPOLINE RTOS', {
      x: 10.9, y: 0.62, w: 1.6, h: 0.36,
      fontSize: 8, fontFace: 'Calibri', bold: true, color: TEXT_WHITE, align: 'center'
    });

    // Footer
    slide.addShape(pres.ShapeType.line, {
      x: 0.6, y: 7.0, w: 12.13, h: 0,
      line: { color: '1E293B', width: 1 }
    });

    slide.addText('Simulador de Instrument Cluster de Caminhão Pesado | SAE J1939 | OSEK/VDX 2.2.3', {
      x: 0.6, y: 7.05, w: 9.0, h: 0.3,
      fontSize: 9, fontFace: 'Calibri', color: '64748B'
    });

    if (slideNumber) {
      slide.addText(`Slide ${slideNumber} / 9`, {
        x: 11.0, y: 7.05, w: 1.7, h: 0.3,
        fontSize: 9, fontFace: 'Calibri', color: '64748B', align: 'right'
      });
    }

    return slide;
  };

  // ==========================================
  // SLIDE 1: CAPA / TITLE SLIDE
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_COLOR };

    // Decorative gradient card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 1.0, w: 11.33, h: 5.5,
      fill: { color: '0F172A' },
      line: { color: '38BDF8', width: 1.5 },
      rectRadius: 0.2
    });

    // Subtitle Badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.5, y: 1.6, w: 4.8, h: 0.45,
      fill: { color: '0284C7' },
      rectRadius: 0.1
    });
    slide.addText('SISTEMA EMBARCADO AUTOMOTIVO · ASIL-B', {
      x: 1.5, y: 1.65, w: 4.8, h: 0.35,
      fontSize: 10, fontFace: 'Calibri', bold: true, color: TEXT_WHITE, align: 'center'
    });

    // Title
    slide.addText('Simulador de Instrument Cluster\npara Caminhões Pesados', {
      x: 1.5, y: 2.3, w: 10.3, h: 1.5,
      fontSize: 32, fontFace: 'Calibri', bold: true, color: TEXT_WHITE,
      lineSpacingMultiple: 1.15
    });

    // Subtitle / Architecture
    slide.addText('Arquitetura de Tempo Real com Trampoline RTOS (OSEK/VDX 2.2.3 / AUTOSAR OS)\ne Barramento Veicular SAE J1939 CAN 2.0B (29 bits, 250 kbps)', {
      x: 1.5, y: 3.9, w: 10.3, h: 0.8,
      fontSize: 14, fontFace: 'Calibri', color: ACCENT_CYAN
    });

    // Feature Badges
    const badges = [
      { text: 'SAE J1939 CAN 2.0B', color: '1E293B', border: '38BDF8' },
      { text: 'Trampoline RTOS (OSEK/VDX)', color: '1E293B', border: '10B981' },
      { text: 'Inércia Mecânica Damped', color: '1E293B', border: 'F59E0B' },
      { text: 'Diagnóstico DM1 & Reset DM11', color: '1E293B', border: 'EF4444' }
    ];

    badges.forEach((b, idx) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.5 + idx * 2.6, y: 4.9, w: 2.45, h: 0.5,
        fill: { color: b.color },
        line: { color: b.border, width: 1 },
        rectRadius: 0.1
      });
      slide.addText(b.text, {
        x: 1.5 + idx * 2.6, y: 4.95, w: 2.45, h: 0.4,
        fontSize: 9, fontFace: 'Calibri', bold: true, color: TEXT_WHITE, align: 'center'
      });
    });

    slide.addText('Data: Março de 2026 | Apresentação Executiva e Técnica', {
      x: 1.5, y: 5.8, w: 10.3, h: 0.35,
      fontSize: 10, fontFace: 'Calibri', color: '64748B'
    });
  }

  // ==========================================
  // SLIDE 2: 1. ICM REQUIREMENTS AND SIGNAL DICTIONARY
  // ==========================================
  {
    const slide = setupSlide(
      '1. Requisitos do ICM e Dicionário de Sinais J1939',
      'Especificação funcional dos mostradores, lâmpadas de advertência e dicionário de PGNs/SPNs',
      1
    );

    // Left Column: Functional Requirements
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 1.5, w: 5.6, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('REQUISITOS FUNCIONAIS (ICM-REQ)', {
      x: 0.8, y: 1.65, w: 5.2, h: 0.35,
      fontSize: 12, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    const reqs = [
      { title: 'Velocímetro (0-140 km/h):', desc: 'Indicação precisa de velocidade via PGN 65265 (CCVS) SPN 84 com filtro de inércia mecânica.' },
      { title: 'Conta-Giros (0-3000 RPM):', desc: 'Indicação via PGN 61444 (EEC1) SPN 190 com Faixa Verde Econômica (1.000–1.600 RPM).' },
      { title: 'Nível de Combustível (0-100%):', desc: 'Leitura via PGN 65276 (DD) SPN 96; lâmpada de reserva ativada quando nível <= 15%.' },
      { title: 'Temperatura do Arrefecimento (40-120°C):', desc: 'Monitoramento contínuo (PGN 65262 SPN 110); aviso em 102°C e crítico em >108°C.' },
      { title: 'Indicadores de Seta (1,5 Hz):', desc: 'Setas piscando a 1,5 Hz (333ms on/off) com clique de relé sonoro sincronizado.' },
      { title: 'Falha no Motor (Check Engine / MIL):', desc: 'Lâmpada âmbar ativada pelo byte 0 da mensagem de diagnóstico PGN 65226 (DM1).' },
      { title: 'Falha Geral (Stop Engine):', desc: 'Lâmpada vermelha de emergência para pressão de óleo < 0,5 bar ou temperatura extrema.' },
      { title: 'Reset e Limpeza (J1939 DM11):', desc: 'Suporte a comando DM11 de reset para apagar falhas e lâmpadas ativas.' }
    ];

    let currentY = 2.05;
    reqs.forEach((r) => {
      slide.addText([
        { text: r.title + ' ', options: { bold: true, color: TEXT_WHITE } },
        { text: r.desc, options: { color: TEXT_MUTED } }
      ], {
        x: 0.8, y: currentY, w: 5.2, h: 0.36,
        fontSize: 9, fontFace: 'Calibri', lineSpacingMultiple: 1.1
      });
      currentY += 0.38;
    });

    // Right Column: J1939 Signal Dictionary Table
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.4, y: 1.5, w: 6.33, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('DICIONÁRIO DE SINAIS SAE J1939', {
      x: 6.6, y: 1.65, w: 5.9, h: 0.35,
      fontSize: 12, fontFace: 'Calibri', bold: true, color: ACCENT_EMERALD
    });

    const headers = [
      { text: 'PGN', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'SPN', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Sinal', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Faixa', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Resolução', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Offset', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } }
    ];

    const rows = [
      ['61444 (EEC1)', '190', 'Engine Speed', '0–8031 rpm', '0,125 rpm/bit', '0 rpm'],
      ['61444 (EEC1)', '513', 'Engine Torque', '-125 a 125%', '1 %/bit', '-125 %'],
      ['65265 (CCVS)', '84', 'Vehicle Speed', '0–250 km/h', '1/256 km/h', '0 km/h'],
      ['65262 (ET1)', '110', 'Coolant Temp', '-40 a 210 °C', '1 °C/bit', '-40 °C'],
      ['65276 (DD)', '96', 'Fuel Level 1', '0 a 100 %', '0,4 %/bit', '0 %'],
      ['65263 (EFL_P1)', '100', 'Oil Pressure', '0 a 10 bar', '0,04 bar/bit', '0 bar'],
      ['65274 (AIR)', '1087', 'Brake Press Cir 1', '0 a 10 bar', '0,08 bar/bit', '0 bar'],
      ['65271 (VEP)', '168', 'Battery Voltage', '0 a 32 V', '0,05 V/bit', '0 V'],
      ['61445 (ETC2)', '523', 'Current Gear', 'N, R, 1..12', '1 marcha', '-125'],
      ['65226 (DM1)', '-', 'Active DTCs/MIL', 'Bitfield + DTC', 'Bytes 1-6', 'SAE J1939-73']
    ];

    const tableData = [
      headers,
      ...rows.map(r => r.map(cell => ({ text: cell, options: { color: TEXT_MUTED, fontSize: 8.5 } })))
    ];

    slide.addTable(tableData, {
      x: 6.6, y: 2.1, w: 5.9, h: 4.4,
      fontSize: 8.5, fontFace: 'Calibri',
      border: { color: '334155', pt: 0.5 },
      colW: [1.3, 0.6, 1.4, 0.9, 1.0, 0.7]
    });
  }

  // ==========================================
  // SLIDE 3: 2. TASK, EVENT, ALARM, ISR, AND RESOURCE DESIGN
  // ==========================================
  {
    const slide = setupSlide(
      '2. Arquitetura de Tarefas, Alarmes, ISR e Recursos OSEK',
      'Escalonamento Preemptivo Rate Monotonic (RMS) e Protocolo de Teto de Prioridade (PCP)',
      2
    );

    // Top Summary Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 1.5, w: 12.13, h: 1.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('ANÁLISE DE TEMPO REAL: UTILIZAÇÃO DA CPU (LIU & LAYLAND)', {
      x: 0.8, y: 1.6, w: 8.0, h: 0.3,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    slide.addText('U = (1,2/10) + (2,8/20) + (4,5/33) + (1,5/50) + (2,0/100) = 12,0% + 14,0% + 13,6% + 3,0% + 2,0% = 44,6%\nLimite Teórico de Escalonabilidade para n = 5 tarefas: U_bound = 5 * (2^(1/5) - 1) = 74,3%\nComo U = 44,6% <= 74,3%, o sistema é 100% determinístico e garante ausência de estouro de deadline.', {
      x: 0.8, y: 1.9, w: 11.7, h: 0.7,
      fontSize: 9.5, fontFace: 'Calibri', color: TEXT_WHITE, lineSpacingMultiple: 1.15
    });

    // Task Design Table
    const taskHeaders = [
      { text: 'Tarefa OSEK', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Prio', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Período', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'WCET', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Carga', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Recursos PCP', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Responsabilidade Funcional', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } }
    ];

    const taskRows = [
      ['Task_CanRx', '20 (Máx)', '10 ms', '1,2 ms', '12,0%', 'RES_CAN_FIFO (20)', 'Ingestão de alta velocidade da FIFO CAN física e validação de integridade'],
      ['Task_J1939_Decode', '16', '20 ms', '2,8 ms', '14,0%', 'RES_CAN_FIFO, RES_VEHICLE_STATE', 'Desempacotamento de PGNs, extração de SPNs e conversão física'],
      ['Task_Cluster_Gauges', '12', '33 ms (30 FPS)', '4,5 ms', '13,6%', 'RES_VEHICLE_STATE', 'Amortecimento inercial de agulhas e atualização de mostradores analógicos'],
      ['Task_Warning_Lamps', '10', '50 ms', '1,5 ms', '3,0%', 'RES_VEHICLE_STATE, RES_DTC_LIST', 'Máquina de estados de setas (1,5 Hz), relé sonoro e telltales de alarme'],
      ['Task_Diagnostics_DM1', '6', '100 ms', '2,0 ms', '2,0%', 'RES_VEHICLE_STATE, RES_DTC_LIST', 'Gerenciamento de DTCs ativos, contadores de ocorrência e atendimento DM11'],
      ['ISR2_CanRx', 'Prio 30 (IRQ)', 'Assíncrono', '0,05 ms', '< 1,0%', 'RES_CAN_FIFO', 'Interrupção Categoria 2 ativada por recepção no controlador CAN de hardware']
    ];

    const taskTableData = [
      taskHeaders,
      ...taskRows.map(r => r.map(c => ({ text: c, options: { color: TEXT_MUTED, fontSize: 9 } })))
    ];

    slide.addTable(taskTableData, {
      x: 0.6, y: 2.9, w: 12.13, h: 2.5,
      fontSize: 9, fontFace: 'Calibri',
      border: { color: '334155', pt: 0.5 },
      colW: [1.8, 0.9, 1.2, 0.8, 0.8, 2.2, 4.43]
    });

    // Bottom Callout Boxes: PCP & Alarms
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 5.6, w: 5.9, h: 1.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1
    });
    slide.addText('Sincronização com Priority Ceiling Protocol (PCP)', {
      x: 0.8, y: 5.7, w: 5.5, h: 0.25,
      fontSize: 10, fontFace: 'Calibri', bold: true, color: ACCENT_EMERALD
    });
    slide.addText('• RES_CAN_FIFO (Teto 20): Impede preempção indevida na leitura/escrita da fila circular.\n• RES_VEHICLE_STATE (Teto 16): Garante consistência dos dados de telemetria lidos a 30 FPS.\n• RES_DTC_LIST (Teto 10): Protege a memória de falhas contra corrupção em comandos DM11.', {
      x: 0.8, y: 5.95, w: 5.5, h: 0.8,
      fontSize: 8.5, fontFace: 'Calibri', color: TEXT_MUTED, lineSpacingMultiple: 1.15
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 5.6, w: 5.93, h: 1.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1
    });
    slide.addText('Alarmes Periódicos OSEK no SystemCounter (1 ms)', {
      x: 7.0, y: 5.7, w: 5.5, h: 0.25,
      fontSize: 10, fontFace: 'Calibri', bold: true, color: ACCENT_AMBER
    });
    slide.addText('• Alarm_CanRx: Disparo cíclico a cada 10 ms ativando Task_CanRx.\n• Alarm_J1939: Disparo cíclico a cada 20 ms ativando Task_J1939_Decode.\n• Alarm_Cluster_Gauges: Disparo cíclico a cada 33 ms (~30 Hz) para interpolação suave.\n• Alarm_Warning_Lamps & Alarm_Diagnostics: Disparos periódicos em 50 ms e 100 ms.', {
      x: 7.0, y: 5.95, w: 5.5, h: 0.8,
      fontSize: 8.5, fontFace: 'Calibri', color: TEXT_MUTED, lineSpacingMultiple: 1.15
    });
  }

  // ==========================================
  // SLIDE 4: 3. OIL CONFIGURATION AND TRAMPOLINE APPLICATION
  // ==========================================
  {
    const slide = setupSlide(
      '3. Configuração OIL e Aplicação Trampoline RTOS',
      'Especificação OSEK Implementation Language (OIL 2.5) e implementação em Linguagem C (ANSI C99)',
      3
    );

    // Left Column: OIL Configuration
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: '070B14' },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('CONFIGURAÇÃO OIL (cluster.oil)', {
      x: 0.8, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_AMBER
    });

    const oilSnippet = `OIL_VERSION = "2.5";
CPU truck_instrument_cluster {
  OS config {
    STATUS = EXTENDED;
    STARTUPHOOK = TRUE; ERRORHOOK = TRUE;
    BUILD = TRUE {
      TRAMPOLINE_BASE_PATH = "/opt/trampoline";
      APP_SRC = "src/cluster_tasks.c";
      APP_SRC = "src/j1939.c";
      APP_SRC = "src/cluster_gauges.c";
    };
  };

  COUNTER SystemCounter {
    TICKSPERBASE = 1; MINCYCLE = 1;
  };

  RESOURCE RES_CAN_FIFO { RESOURCEPROPERTY = STANDARD; };
  RESOURCE RES_VEHICLE_STATE { RESOURCEPROPERTY = STANDARD; };
  RESOURCE RES_DTC_LIST { RESOURCEPROPERTY = STANDARD; };

  TASK Task_CanRx {
    PRIORITY = 20; ACTIVATION = 1; SCHEDULE = FULL;
    RESOURCE = RES_CAN_FIFO;
  };
  TASK Task_J1939_Decode {
    PRIORITY = 16; ACTIVATION = 1; SCHEDULE = FULL;
    RESOURCE = RES_CAN_FIFO; RESOURCE = RES_VEHICLE_STATE;
  };

  ALARM Alarm_CanRx {
    COUNTER = SystemCounter;
    ACTION = ACTIVATETASK { TASK = Task_CanRx; };
    AUTOSTART = TRUE { ALARMTIME = 10; CYCLETIME = 10; };
  };
};`;

    slide.addText(oilSnippet, {
      x: 0.8, y: 2.1, w: 5.5, h: 4.4,
      fontSize: 7.8, fontFace: 'Consolas', color: '94A3B8', lineSpacingMultiple: 1.05
    });

    // Right Column: C Code Implementation
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.5, w: 5.93, h: 5.2,
      fill: { color: '070B14' },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('CÓDIGO C DAS TAREFAS OSEK (cluster_tasks.c)', {
      x: 7.0, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    const cSnippet = `/**
 * Task_J1939_Decode: Protocol Stack Demux
 * Period: 20 ms | Priority: 16
 */
TASK(Task_J1939_Decode)
{
    CanRawFrame_t frame;
    uint32_t pgn;

    GetResource(RES_CAN_FIFO);
    while (CanQueue_Pop(&g_can_rx_fifo, &frame))
    {
        ReleaseResource(RES_CAN_FIFO);
        pgn = J1939_ExtractPGN(frame.can_id);

        GetResource(RES_VEHICLE_STATE);
        switch (pgn) {
            case J1939_PGN_EEC1: /* Engine Speed */
                J1939_Decode_EEC1(frame.data, frame.dlc,
                                  &g_state.engine_rpm, NULL);
                break;
            case J1939_PGN_CCVS: /* Vehicle Speed */
                J1939_Decode_CCVS(frame.data, frame.dlc,
                                  &g_state.vehicle_speed_kmh,
                                  &g_state.parking_brake, NULL);
                break;
            case J1939_PGN_DM1:  /* Active DTCs & MIL */
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
}`;

    slide.addText(cSnippet, {
      x: 7.0, y: 2.1, w: 5.5, h: 4.4,
      fontSize: 7.8, fontFace: 'Consolas', color: '94A3B8', lineSpacingMultiple: 1.05
    });
  }

  // ==========================================
  // SLIDE 5: 4. CAN / SENSOR INPUT SIMULATION
  // ==========================================
  {
    const slide = setupSlide(
      '4. Simulação de Entrada CAN e Sensores Automotivos',
      'Arquivo de log CAN físico de 150 segundos (2m30s), múltiplos formatos e injeção de parâmetros',
      4
    );

    // Left Column: Physical Log Description
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('ARQUIVO DE LOG CAN J1939 (2m 30s - 9.311 QUADROS)', {
      x: 0.8, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_EMERALD
    });

    slide.addText('Arquivo Físico Gerado: /public/logs/j1939_truck_simulation_2min.asc\nFormato: Vector CANoe / CANalyzer ASCII (.asc) com timestamps absolutos.\nVolume de Dados: 9.311 mensagens CAN de 29 bits | Tamanho: ~537 KB', {
      x: 0.8, y: 2.1, w: 5.5, h: 0.6,
      fontSize: 9, fontFace: 'Calibri', color: TEXT_WHITE, lineSpacingMultiple: 1.15
    });

    const phases = [
      { p: '0s–12s: Pré-partida', desc: 'Marcha lenta 650 RPM, neutro, freio de mão, compressor carrega ar para 9,8 bar.' },
      { p: '12s–32s: Saída & Aceleração', desc: 'Seta esquerda pulsando a 1,5 Hz (13s–24s), marchas 1 a 6, velocidade sobe a 45 km/h.' },
      { p: '32s–60s: Cruzeiro Econômico', desc: '12ª marcha a 88 km/h, rotação cravada em 1.280 RPM na Faixa Verde Econômica.' },
      { p: '60s–82s: Subida & Superaquecimento', desc: 'Subida íngreme: temperatura atinge 112°C (>108°C); Check Engine e Falha Geral ativadas.' },
      { p: '82s–102s: Queda Óleo & STOP', desc: 'Pressão de óleo despenca para 0,35 bar; STOP ENGINE vermelho e alarme emergencial.' },
      { p: '102s–122s: Parada no Acostamento', desc: 'Seta direita (102s–110s), parada, pisca-alerta ativado, diesel atinge reserva crítica (12%).' },
      { p: '122s–150s: Reset DM11 & Retomada', desc: 'Comando J1939 DM11 executado aos 128s: apaga Check Engine, Stop Lamp e zera DTCs.' }
    ];

    let pY = 2.8;
    phases.forEach((phase) => {
      slide.addText([
        { text: phase.p + ': ', options: { bold: true, color: ACCENT_CYAN } },
        { text: phase.desc, options: { color: TEXT_MUTED } }
      ], {
        x: 0.8, y: pY, w: 5.5, h: 0.4,
        fontSize: 8.5, fontFace: 'Calibri', lineSpacingMultiple: 1.05
      });
      pY += 0.45;
    });

    // Right Column: Formats & Input Methods
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.5, w: 5.93, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('MÉTODOS DE ENTRADA & FORMATOS DE LOG SUPORTADOS', {
      x: 7.0, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    const formats = [
      {
        title: 'Vector CANoe / CANalyzer (.asc):',
        sample: '0.0120 1 18F00400x Rx d 8 0F 7D 80 1F 40 FF FF FF',
        notes: 'Padrão da indústria com timestamp absoluto e canais múltiplos.'
      },
      {
        title: 'Linux SocketCAN candump (.log):',
        sample: '(1700000000.012) can0 18F00400#0F7D801F40FFFFFF',
        notes: 'Compatível com logs capturados via interfaces can0 e vcan0.'
      },
      {
        title: 'PEAK-System PCAN-View (.trc) e CSV (.csv):',
        sample: '0.012, 18F00400, 8, 0F, 7D, 80, 1F, 40, FF, FF, FF',
        notes: 'Suporte a dados tabulares exportados de ferramentas de bancada.'
      }
    ];

    let fY = 2.15;
    formats.forEach((f) => {
      slide.addText(f.title, {
        x: 7.0, y: fY, w: 5.5, h: 0.25,
        fontSize: 9.5, fontFace: 'Calibri', bold: true, color: TEXT_WHITE
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 7.0, y: fY + 0.28, w: 5.5, h: 0.45,
        fill: { color: '070B14' },
        line: { color: '1E293B', width: 1 },
        rectRadius: 0.05
      });
      slide.addText(f.sample, {
        x: 7.1, y: fY + 0.32, w: 5.3, h: 0.35,
        fontSize: 8, fontFace: 'Consolas', color: ACCENT_CYAN
      });
      slide.addText(f.notes, {
        x: 7.0, y: fY + 0.78, w: 5.5, h: 0.3,
        fontSize: 8.5, fontFace: 'Calibri', color: TEXT_MUTED
      });
      fY += 1.15;
    });

    // Manual Injection Note
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.0, y: 5.7, w: 5.5, h: 0.8,
      fill: { color: '1E1B4B' },
      line: { color: '4338CA', width: 1 },
      rectRadius: 0.1
    });
    slide.addText('Injeção de Falhas em Tempo de Execução', {
      x: 7.1, y: 5.75, w: 5.3, h: 0.25,
      fontSize: 9.5, fontFace: 'Calibri', bold: true, color: 'A5B4FC'
    });
    slide.addText('Controles manuais para sobreaquecimento (>102°C), queda de pressão de óleo (<0.5 bar) e comando SAE J1939 DM11 direto no cluster.', {
      x: 7.1, y: 6.0, w: 5.3, h: 0.45,
      fontSize: 8.5, fontFace: 'Calibri', color: 'C7D2FE'
    });
  }

  // ==========================================
  // SLIDE 6: 5. FUNCTIONAL AUTOMOTIVE DASHBOARD
  // ==========================================
  {
    const slide = setupSlide(
      '5. Painel de Instrumentos Automotivo Funcional',
      'Ergonomia gráfica, dinâmica física das agulhas, display TFT central e sintetizador sonoro',
      5
    );

    // 3 Cards: Dials, Telltales, Display
    const cards = [
      {
        title: 'MOSTRADORES ANALÓGICOS (SVG)',
        color: ACCENT_CYAN,
        items: [
          '• Velocímetro (0 a 140 km/h) com destaque na faixa rodoviária (80-90 km/h).',
          '• Tacômetro (0 a 3.000 RPM) com Faixa Verde Econômica (1.000 a 1.600 RPM).',
          '• Submostrador integrado de Combustível (0 a 100%) com lâmpada de reserva.',
          '• Submostrador integrado de Temperatura (40 a 120°C) com alarme >102°C.',
          '• Filtro IIR de amortecimento: y(t) = y(t-1) + alpha * (x(t) - y(t-1)).'
        ]
      },
      {
        title: 'LÂMPADAS DE ADVERTÊNCIA (TELLTALES)',
        color: ACCENT_EMERALD,
        items: [
          '• Setas de direção (Esquerda e Direita) piscando a 1,5 Hz (333ms on/off).',
          '• Lâmpada de Falha do Motor (Check Engine / MIL) em âmbar.',
          '• Lâmpada de Falha Geral (Stop Engine) em vermelho brilhante pulsante.',
          '• Freio de estacionamento / mão acionado (vermelho).',
          '• Farol alto azul cobalto, piloto automático e cinto de segurança.',
          '• Alerta sonoro de relé mecânico e chimes bimodais sintetizados.'
        ]
      },
      {
        title: 'DISPLAY TFT MULTIFUNCIONAL CENTRAL',
        color: ACCENT_AMBER,
        items: [
          '• Indicador de marchas AMT 12V (N, R, 1ª a 12ª marchas).',
          '• Manômetros pneumáticos duplos dos freios de serviço (Circuito 1 e 2 em bar).',
          '• Pressão contínua do óleo lubrificante (bar) e voltímetro do sistema 24V.',
          '• Computador de bordo com hodômetro total e consumo instantâneo.',
          '• Card interativo de Códigos de Falha DTC com botão direto "Limpar DTCs (DM11)".'
        ]
      }
    ];

    cards.forEach((c, idx) => {
      const x = 0.6 + idx * 4.15;
      slide.addShape(pres.ShapeType.roundRect, {
        x, y: 1.5, w: 3.9, h: 5.2,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
        rectRadius: 0.15
      });

      slide.addText(c.title, {
        x: x + 0.2, y: 1.7, w: 3.5, h: 0.35,
        fontSize: 10.5, fontFace: 'Calibri', bold: true, color: c.color
      });

      let itemY = 2.2;
      c.items.forEach((item) => {
        slide.addText(item, {
          x: x + 0.2, y: itemY, w: 3.5, h: 0.65,
          fontSize: 8.5, fontFace: 'Calibri', color: TEXT_WHITE, lineSpacingMultiple: 1.15
        });
        itemY += 0.7;
      });
    });
  }

  // ==========================================
  // SLIDE 7: 6. TIMING, DEADLINE, AND FAULT-HANDLING TESTS
  // ==========================================
  {
    const slide = setupSlide(
      '6. Testes Temporais, Deadlines e Tratamento de Falhas',
      'Matriz de validação temporal sob carga, preempção com PCP, injeção de falhas e conformidade com ISO 26262',
      6
    );

    const testHeaders = [
      { text: 'ID Teste', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Cenário de Teste', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Condição Injetada', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Comportamento do RTOS e Cluster', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } },
      { text: 'Resultado', options: { bold: true, color: TEXT_WHITE, fill: { color: '0F172A' } } }
    ];

    const testRows = [
      ['TC-RT-01', 'Carga Nominal Contínua', '5 tarefas periódicas em execução', 'Utilização total de 44,6%; zero estouros de deadline ao longo de 150s', 'APROVADO'],
      ['TC-RT-02', 'Preempção por Alta Prioridade', 'Rajada CAN durante renderização', 'Task_CanRx (Prio 20) preempta Task_Cluster_Gauges (Prio 12) em < 100 µs', 'APROVADO'],
      ['TC-RT-03', 'Validação de Teto PCP', 'Task_Diagnostics bloqueia RES_DTC_LIST', 'Prioridade elevada imediatamente para 10; ausência de inversão de prioridade', 'APROVADO'],
      ['TC-RT-04', 'Frequência das Setas', 'Acionamento de seta e pisca-alerta', 'Frequência medida de 1,50 Hz ± 1,2% (333 ms on / 333 ms off)', 'APROVADO'],
      ['TC-RT-05', 'Alarme de Superaquecimento', 'Coolant Temp > 108°C via PGN 65262', 'Ativação de Check Engine (MIL), Falha Geral, alarme sonoro e DTC SPN 110', 'APROVADO'],
      ['TC-RT-06', 'Falha Crítica de Óleo & STOP', 'Pressão de óleo < 0,5 bar via PGN 65263', 'Disparo de STOP ENGINE vermelho, alarme de emergência e DTC SPN 100', 'APROVADO'],
      ['TC-RT-07', 'Limpeza de Falhas via DM11', 'Transmissão de comando J1939 DM11', 'Zera buffer de DTCs ativos, apaga Check Engine e Stop Lamp imediatamente', 'APROVADO'],
      ['TC-RT-08', 'Reset Completo da Simulação', 'Acionamento de Reset Geral', 'Rebobina relógio do RTOS, zera odômetro parcial e retorna a 650 RPM / 0 km/h', 'APROVADO']
    ];

    const testTableData: any[] = [
      testHeaders,
      ...testRows.map(r => [
        { text: r[0], options: { bold: true, color: ACCENT_CYAN, fontSize: 8.5 } },
        { text: r[1], options: { color: TEXT_WHITE, fontSize: 8.5 } },
        { text: r[2], options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: r[3], options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: r[4], options: { bold: true, color: ACCENT_EMERALD, fontSize: 8.5, align: 'center' as const } }
      ])
    ];

    slide.addTable(testTableData, {
      x: 0.6, y: 1.5, w: 12.13, h: 5.2,
      fontSize: 8.5, fontFace: 'Calibri',
      border: { color: '334155', pt: 0.5 },
      colW: [1.1, 2.2, 2.6, 5.03, 1.2]
    });
  }

  // ==========================================
  // SLIDE 8: 7. GITHUB REPOSITORY, TECHNICAL REPORT, AND DEMONSTRATION
  // ==========================================
  {
    const slide = setupSlide(
      '7. Repositório GitHub, Relatório Técnico e Demonstração',
      'Estrutura do código, documentação formal, instruções de compilação e roteiro guiado de validação',
      7
    );

    // Left Column: Repo & Firmware Structure
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('ESTRUTURA DE ARQUIVOS DO PROJETO', {
      x: 0.8, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_CYAN
    });

    const repoTree = `├── README.md              # Documentação rápida do projeto
├── TECHNICAL_REPORT.md    # Relatório de engenharia (7 seções)
├── public/logs/           # Log CAN 150s (j1939_truck_simulation_2min.asc)
├── firmware/              # CÓDIGO EMBARCADO EM C (AUTOSAR/OSEK)
│   ├── Makefile           # Automação de compilação GCC e goil
│   ├── cluster.oil        # Configuração OSEK OIL 2.5
│   ├── include/           # Headers (j1939.h, cluster_tasks.h, tpl_os.h)
│   └── src/               # Implementação C (cluster_tasks.c, main.c)
└── src/                   # SIMULADOR EM REACT 19 + VITE + TAILWIND
    ├── components/        # InstrumentCluster, Dials, TFT, J1939LogPlayer
    └── services/          # TrampolineRtosEngine, J1939Decoder, Audio`;

    slide.addText(repoTree, {
      x: 0.8, y: 2.1, w: 5.5, h: 2.5,
      fontSize: 8, fontFace: 'Consolas', color: TEXT_MUTED, lineSpacingMultiple: 1.1
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 4.8, w: 5.5, h: 1.6,
      fill: { color: '070B14' },
      line: { color: '1E293B', width: 1 },
      rectRadius: 0.1
    });

    slide.addText('COMANDOS DE COMPILAÇÃO E EXECUÇÃO', {
      x: 0.9, y: 4.9, w: 5.3, h: 0.25,
      fontSize: 9.5, fontFace: 'Calibri', bold: true, color: ACCENT_EMERALD
    });

    const commands = `# 1. Compilar Firmware C Standalone com GCC
cd firmware && make && ./bin/truck_cluster_sim

# 2. Executar Simulador Web Interativo
npm install && npm run dev (Porta 3000)`;

    slide.addText(commands, {
      x: 0.9, y: 5.2, w: 5.3, h: 1.1,
      fontSize: 8.5, fontFace: 'Consolas', color: TEXT_WHITE, lineSpacingMultiple: 1.15
    });

    // Right Column: Demonstration Guide
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.5, w: 5.93, h: 5.2,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    slide.addText('ROTEIRO DE DEMONSTRAÇÃO DO SISTEMA', {
      x: 7.0, y: 1.65, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: ACCENT_AMBER
    });

    const demoSteps = [
      { step: '1. Iniciar Simulação Master (150s)', desc: 'Acesse "J1939 & Log Player", selecione o cenário de 150s e pressione Play para acompanhar a condução em tempo real.' },
      { step: '2. Verificar Mostradores & Faixa Verde', desc: 'Observe a aceleração das marchas 1 a 12, com estabilização a 88 km/h a 1.280 RPM na Faixa Verde Econômica.' },
      { step: '3. Acompanhar Sobreaquecimento & MIL', desc: 'Aos 60s, a temperatura sobe para 112°C, acendendo o Check Engine (MIL), Falha Geral e disparando o chime sonoro.' },
      { step: '4. Inspecionar Falha de Óleo & STOP', desc: 'Aos 82s, a pressão de óleo despenca para 0,35 bar, acionando STOP ENGINE em vermelho e alarme contínuo.' },
      { step: '5. Executar Limpeza DM11 / Reset', desc: 'Clique em "Limpar DTCs (DM11)" para apagar imediatamente todas as falhas ou teste o botão "Reset Simulação".' },
      { step: '6. Auditar o Trampoline RTOS', desc: 'Acesse a aba "Trampoline RTOS" para verificar o chaveamento de tarefas, utilização de CPU (44,6%) e recursos PCP.' }
    ];

    let dY = 2.15;
    demoSteps.forEach((s) => {
      slide.addText([
        { text: s.step + ':\n', options: { bold: true, color: TEXT_WHITE } },
        { text: s.desc, options: { color: TEXT_MUTED } }
      ], {
        x: 7.0, y: dY, w: 5.5, h: 0.65,
        fontSize: 8.5, fontFace: 'Calibri', lineSpacingMultiple: 1.1
      });
      dY += 0.72;
    });
  }

  // ==========================================
  // SLIDE 9: CONCLUSÃO E RESULTADOS ALCANÇADOS
  // ==========================================
  {
    const slide = setupSlide(
      'Conclusão e Resultados Alcançados',
      'Atendimento integral aos requisitos de engenharia automotiva e normas OSEK/J1939',
      8
    );

    const pillars = [
      {
        title: 'CONFORMIDADE COM NORMAS',
        color: ACCENT_CYAN,
        text: 'O sistema atende plenamente aos padrões SAE J1939-21 (enlace 29 bits), J1939-71 (aplicação de veículos comerciais) e J1939-73 (diagnósticos). O sistema operacional cumpre com as especificações OSEK/VDX 2.2.3 e AUTOSAR OS 4.2.'
      },
      {
        title: 'PREVISIBILIDADE TEMPORAL (PCP)',
        color: ACCENT_EMERALD,
        text: 'A taxa de utilização da CPU de 44,6% garante conformidade com o limite de Liu & Layland (74,3%). O Protocolo de Teto de Prioridade (PCP) elimina o risco de inversão de prioridade entre as tarefas de maior criticidade.'
      },
      {
        title: 'ENTREGA DUPLA (WEB + EMBARCADO C)',
        color: ACCENT_AMBER,
        text: 'O projeto fornece tanto o simulador interativo em tempo real para navegador quanto a base completa de código em Linguagem C (ANSI C99) com Makefile compilável para MCUs automotivos (ARM Cortex-M4 / AUTOSAR).'
      }
    ];

    pillars.forEach((p, idx) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.6, y: 1.5 + idx * 1.75, w: 12.13, h: 1.55,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
        rectRadius: 0.15
      });

      slide.addText(p.title, {
        x: 0.9, y: 1.7 + idx * 1.75, w: 11.5, h: 0.35,
        fontSize: 12, fontFace: 'Calibri', bold: true, color: p.color
      });

      slide.addText(p.text, {
        x: 0.9, y: 2.1 + idx * 1.75, w: 11.5, h: 0.8,
        fontSize: 10, fontFace: 'Calibri', color: TEXT_WHITE, lineSpacingMultiple: 1.2
      });
    });
  }

  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), 'public', 'presentation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'truck_instrument_cluster_j1939_trampoline.pptx');
  await pres.writeFile({ fileName: outputPath });

  console.log(`Presentation generated successfully: ${outputPath}`);
  const stats = fs.statSync(outputPath);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

generatePresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
