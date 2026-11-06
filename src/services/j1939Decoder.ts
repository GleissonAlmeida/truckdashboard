/**
 * SAE J1939 Protocol Parser, Encoder, and Decoders
 * Compliant with ISO 11898 CAN 2.0B 29-bit Extended Frame
 */

import { J1939Frame, J1939_PGN, TruckClusterState, DiagnosticTroubleCode, J1939Scenario } from '../types/j1939';

export { J1939_PGN };

// Parse 29-bit CAN Identifier
export function parseCanId(canId: number): {
  priority: number;
  edp: number;
  dp: number;
  pf: number;
  ps: number;
  pgn: number;
  sourceAddress: number;
  destAddress?: number;
} {
  const priority = (canId >> 26) & 0x07;
  const edp = (canId >> 25) & 0x01;
  const dp = (canId >> 24) & 0x01;
  const pf = (canId >> 16) & 0xff;
  const ps = (canId >> 8) & 0xff;
  const sourceAddress = canId & 0xff;

  let pgn: number;
  let destAddress: number | undefined = undefined;

  if (pf < 240) {
    // PDU1 format (point-to-point)
    pgn = (dp << 16) | (pf << 8);
    destAddress = ps;
  } else {
    // PDU2 format (broadcast)
    pgn = (dp << 16) | (pf << 8) | ps;
  }

  return { priority, edp, dp, pf, ps, pgn, sourceAddress, destAddress };
}

// Build 29-bit CAN Identifier
export function buildCanId(priority: number, pgn: number, sourceAddress: number, destAddress = 0xff): number {
  const dp = (pgn >> 16) & 0x01;
  const pf = (pgn >> 8) & 0xff;
  const ps = pf < 240 ? destAddress & 0xff : pgn & 0xff;

  return ((priority & 0x07) << 26) | (dp << 24) | (pf << 16) | (ps << 8) | (sourceAddress & 0xff);
}

// Name lookup for standard PGNs
export function getPgnName(pgn: number): string {
  switch (pgn) {
    case J1939_PGN.EEC1:
      return 'EEC1 (Engine Speed & Torque)';
    case J1939_PGN.EEC2:
      return 'EEC2 (Accelerator Pedal & Load)';
    case J1939_PGN.CCVS:
      return 'CCVS (Vehicle Speed & Brakes)';
    case J1939_PGN.ET1:
      return 'ET1 (Coolant & Oil Temp)';
    case J1939_PGN.DD:
      return 'DD (Fuel Level & Dash Display)';
    case J1939_PGN.DM1:
      return 'DM1 (Active DTCs & Warning Lamps)';
    case J1939_PGN.EFL_P1:
      return 'EFL/P1 (Engine Oil Pressure)';
    case J1939_PGN.AIR1_2:
      return 'AIR (Pneumatic Brakes Supply)';
    case J1939_PGN.LIGHTING:
      return 'LIGHT (Turn Signals & Lighting)';
    case J1939_PGN.VEP:
      return 'VEP (Battery Potential)';
    case J1939_PGN.VD:
      return 'VD (Vehicle Distance & Odometer)';
    case J1939_PGN.ETC2:
      return 'ETC2 (Transmission Gear)';
    default:
      return `PGN ${pgn} (0x${pgn.toString(16).toUpperCase()})`;
  }
}

// Name lookup for Source Addresses (ECU names)
export function getSourceName(sa: number): string {
  switch (sa) {
    case 0x00:
      return 'Engine #1 (ECU)';
    case 0x03:
      return 'Transmission (TCU)';
    case 0x0b:
      return 'Brakes (EBS/ABS)';
    case 0x17:
      return 'Instrument Cluster (IC)';
    case 0x21:
      return 'Body Controller (BCM)';
    case 0x31:
      return 'Tire Pressure (TPMS)';
    case 0x3d:
      return 'Retarder / Aux Brake';
    default:
      return `ECU 0x${sa.toString(16).padStart(2, '0').toUpperCase()}`;
  }
}

// Convert byte array to formatted hex string
export function bytesToHex(data: number[]): string {
  return data.map((b) => (b & 0xff).toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

// Create a J1939 frame object
export function createJ1939Frame(
  timestamp: number,
  canId: number,
  data: number[],
  id = Math.random().toString(36).substring(2, 9)
): J1939Frame {
  const parsed = parseCanId(canId);
  return {
    id,
    timestamp,
    canId,
    priority: parsed.priority,
    pgn: parsed.pgn,
    pgnHex: `0x${parsed.pgn.toString(16).padStart(4, '0').toUpperCase()}`,
    pgnName: getPgnName(parsed.pgn),
    sourceAddress: parsed.sourceAddress,
    sourceName: getSourceName(parsed.sourceAddress),
    destAddress: parsed.destAddress,
    dlc: data.length,
    data,
    dataHex: bytesToHex(data),
  };
}

// Process a single incoming J1939 CAN frame and update the truck cluster state
export function decodeJ1939FrameToState(
  frame: J1939Frame,
  currentState: TruckClusterState
): TruckClusterState {
  const next = { ...currentState, lastUpdatedTimestamp: frame.timestamp };
  const d = frame.data;

  switch (frame.pgn) {
    case J1939_PGN.EEC1: {
      // Byte 3-4: Engine Speed (SPN 190) -> 0.125 rpm/bit
      if (d.length >= 5) {
        const rawRpm = d[3] | (d[4] << 8);
        if (rawRpm <= 0xfa00) {
          next.rpm = Math.round(rawRpm * 0.125);
        }
      }
      break;
    }

    case J1939_PGN.CCVS: {
      // Byte 1-2: Wheel-based Vehicle Speed (SPN 84) -> 1/256 km/h per bit
      if (d.length >= 3) {
        const rawSpeed = d[1] | (d[2] << 8);
        if (rawSpeed <= 0xfa00) {
          next.speed = parseFloat((rawSpeed / 256.0).toFixed(1));
        }
      }
      // Byte 0 bits 3-4: Parking Brake Switch (01 = set)
      if (d.length >= 1) {
        const pb = (d[0] >> 2) & 0x03;
        next.parkingBrake = pb === 1;
      }
      // Byte 3 bit 0: Cruise control active
      if (d.length >= 4) {
        next.cruiseControl = (d[3] & 0x01) === 1;
      }
      break;
    }

    case J1939_PGN.ET1: {
      // Byte 0: Engine Coolant Temperature (SPN 110) -> 1 °C/bit, offset -40 °C
      if (d.length >= 1) {
        if (d[0] !== 0xff && d[0] !== 0xfe) {
          next.coolantTemp = d[0] - 40;
        }
      }
      break;
    }

    case J1939_PGN.DD: {
      // Byte 1: Fuel Level 1 (SPN 96) -> 0.4 %/bit, 0 to 100%
      if (d.length >= 2) {
        if (d[1] !== 0xff && d[1] !== 0xfe) {
          next.fuelLevel = Math.round(d[1] * 0.4);
        }
      }
      break;
    }

    case J1939_PGN.DM1: {
      // Byte 0: Lamp Status
      // bits 7-8: Malfunction Indicator Lamp (MIL / Check Engine) -> 01 = on, 10/11 = flash
      // bits 5-6: Red Stop Lamp -> 01 = on, 10/11 = flash
      // bits 3-4: Amber Warning Lamp (Falha Geral) -> 01 = on, 10/11 = flash
      if (d.length >= 2) {
        const mil = (d[0] >> 6) & 0x03;
        const redStop = (d[0] >> 4) & 0x03;
        const amberWarn = (d[0] >> 2) & 0x03;

        next.checkEngine = mil > 0;
        next.generalFailure = amberWarn > 0 || redStop > 0;

        // Decode DTCs if data has DTC block (bytes 2-5)
        if (d.length >= 6) {
          const spn = d[2] | (d[3] << 8) | ((d[4] & 0xe0) << 11);
          const fmi = d[4] & 0x1f;
          const oc = d[5] & 0x7f;

          if (spn > 0 && spn < 524287) {
            const dtcInfo = getDtcDescription(spn, fmi);
            const exists = next.activeDTCs.some((dtc) => dtc.spn === spn && dtc.fmi === fmi);
            if (!exists) {
              next.activeDTCs = [
                ...next.activeDTCs,
                {
                  spn,
                  fmi,
                  occurrenceCount: oc,
                  description: dtcInfo.desc,
                  spnName: dtcInfo.name,
                  severity: redStop > 0 ? 'red' : 'amber',
                },
              ];
            }
          } else if (mil === 0 && amberWarn === 0 && redStop === 0) {
            // No active DTCs
            next.activeDTCs = [];
          }
        }
      }
      break;
    }

    case J1939_PGN.LIGHTING: {
      // Byte 0: Turn Signals & Hazard
      if (d.length >= 1) {
        next.turnLeft = (d[0] & 0x01) !== 0;
        next.turnRight = (d[0] & 0x02) !== 0;
        next.hazardLights = (d[0] & 0x04) !== 0;
      }
      // Byte 1: High Beam
      if (d.length >= 2) {
        next.highBeam = (d[1] & 0x01) !== 0;
      }
      break;
    }

    case J1939_PGN.EFL_P1: {
      // Byte 3: Engine Oil Pressure (SPN 100) -> 4 kPa/bit = 0.04 bar/bit
      if (d.length >= 4 && d[3] !== 0xff) {
        next.oilPressure = parseFloat((d[3] * 0.04).toFixed(1));
      }
      break;
    }

    case J1939_PGN.AIR1_2: {
      // Byte 2: Air Pressure Circuit 1 (SPN 1087) -> 8 kPa/bit = 0.08 bar/bit
      // Byte 3: Air Pressure Circuit 2 (SPN 1088) -> 8 kPa/bit = 0.08 bar/bit
      if (d.length >= 4) {
        if (d[2] !== 0xff) next.airPressure1 = parseFloat((d[2] * 0.08).toFixed(1));
        if (d[3] !== 0xff) next.airPressure2 = parseFloat((d[3] * 0.08).toFixed(1));
      }
      break;
    }

    case J1939_PGN.VEP: {
      // Byte 4-5: Battery Potential (SPN 168) -> 0.05 V/bit
      if (d.length >= 6) {
        const rawVolt = d[4] | (d[5] << 8);
        if (rawVolt <= 0xfa00) {
          next.batteryVoltage = parseFloat((rawVolt * 0.05).toFixed(1));
        }
      }
      break;
    }

    case J1939_PGN.VD: {
      // Byte 0-3: Total Vehicle Distance (SPN 917) -> 0.005 km/bit
      if (d.length >= 4) {
        const rawDist = d[0] | (d[1] << 8) | (d[2] << 16) | (d[3] << 24);
        if (rawDist > 0 && rawDist < 0xfffffffe) {
          next.odometerKm = parseFloat((rawDist * 0.005).toFixed(1));
        }
      }
      break;
    }

    case J1939_PGN.ETC2: {
      // Byte 3: Selected Gear (offset -125: 125 = Neutral, 126 = 1st, 124 = Reverse)
      if (d.length >= 4) {
        const rawGear = d[3] - 125;
        if (rawGear === 0) next.currentGear = 'N';
        else if (rawGear < 0) next.currentGear = 'R';
        else next.currentGear = `${rawGear}`;
      }
      break;
    }
  }

  return next;
}

// SPN and FMI Diagnostic lookup
export function getDtcDescription(spn: number, fmi: number): { name: string; desc: string } {
  let name = `SPN ${spn}`;
  let desc = `Falha no subsistema automotivo (SPN ${spn}, FMI ${fmi})`;

  switch (spn) {
    case 110:
      name = 'Temperatura do Líquido de Arrefecimento (ECT)';
      if (fmi === 0) desc = 'Temperatura do líquido de arrefecimento acima da faixa crítica máxima';
      else if (fmi === 1) desc = 'Temperatura do líquido de arrefecimento abaixo do normal';
      else desc = 'Sinal inválido no sensor de temperatura do arrefecimento';
      break;
    case 100:
      name = 'Pressão do Óleo do Motor';
      if (fmi === 1) desc = 'Pressão de óleo do motor perigosamente baixa - Risco de travamento';
      else desc = 'Falha no circuito ou sensor de pressão do óleo lubrificante';
      break;
    case 190:
      name = 'Rotação do Motor (RPM)';
      if (fmi === 0) desc = 'Sobrerrotação crítica do motor (Overspeed)';
      else desc = 'Sinal de rotação do sensor de fase/virabrequim instável';
      break;
    case 96:
      name = 'Nível de Combustível';
      if (fmi === 1) desc = 'Nível de combustível em reserva crítica';
      else desc = 'Circuito aberto ou curto no sensor da boia de combustível';
      break;
    case 1087:
    case 1088:
      name = 'Pressão do Sistema Pneumático de Freios';
      desc = 'Pressão dos tanques de ar primário/secundário abaixo do limite seguro (6.0 bar)';
      break;
    case 168:
      name = 'Tensão da Bateria (Sistema 24V)';
      if (fmi === 1) desc = 'Subtensão no barramento principal de alimentação (< 22V)';
      else desc = 'Sobretensão no alternador ou regulador (> 29.5V)';
      break;
    case 102:
      name = 'Pressão de Sobrealimentação do Turbo';
      desc = 'Pressão do turboalimentador fora do mapa de injeção programado';
      break;
    case 91:
      name = 'Posição do Pedal do Acelerador';
      desc = 'Sinal de correlação do sensor duplo do pedal de aceleração divergente';
      break;
    case 105:
      name = 'Temperatura do Coletor de Admissão';
      desc = 'Alta temperatura do ar após o intercooler';
      break;
  }

  return { name, desc };
}

// Initial cluster state
export function getInitialClusterState(): TruckClusterState {
  return {
    speed: 0,
    rpm: 650, // Idle RPM
    fuelLevel: 82, // 82%
    coolantTemp: 85, // 85°C normal operating temp
    turnLeft: false,
    turnRight: false,
    checkEngine: false,
    generalFailure: false,
    airPressure1: 9.8,
    airPressure2: 9.6,
    oilPressure: 3.8,
    batteryVoltage: 27.6, // 24V commercial system running
    parkingBrake: true,
    highBeam: false,
    hazardLights: false,
    retarderActive: false,
    seatbelt: true,
    cruiseControl: false,
    currentGear: 'N',
    odometerKm: 342150.4,
    tripKm: 248.6,
    instantConsumption: 2.1,
    activeDTCs: [],
    lastUpdatedTimestamp: 0,
  };
}

// Log File Parsers (Support for Vector .asc, .trc, candump, CSV)
export function parseJ1939LogFile(content: string): J1939Frame[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith(';'));
  const frames: J1939Frame[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Format 1: candump format: "(123.456) can0 18F00400#0F7D801F40FFFFFF"
    const candumpMatch = line.match(/\(?([0-9.]+)\)?\s+(?:can\d|vcan\d)\s+([0-9A-Fa-f]{8})#([0-9A-Fa-f]+)/);
    if (candumpMatch) {
      const ts = parseFloat(candumpMatch[1]);
      const canId = parseInt(candumpMatch[2], 16);
      const hexStr = candumpMatch[3];
      const data: number[] = [];
      for (let j = 0; j < hexStr.length; j += 2) {
        data.push(parseInt(hexStr.substr(j, 2), 16));
      }
      frames.push(createJ1939Frame(ts, canId, data, `f_${i}`));
      continue;
    }

    // Format 2: CSV: "timestamp,can_id,dlc,d0,d1,d2,d3,d4,d5,d6,d7"
    if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3 && !isNaN(parseFloat(parts[0]))) {
        const ts = parseFloat(parts[0]);
        const canIdStr = parts[1].replace(/^0x/i, '');
        const canId = parseInt(canIdStr, 16);
        const dlc = parseInt(parts[2], 10) || 8;
        const data: number[] = [];
        for (let j = 3; j < Math.min(parts.length, 3 + dlc); j++) {
          const b = parts[j].startsWith('0x') ? parseInt(parts[j], 16) : parseInt(parts[j], 16);
          data.push(isNaN(b) ? 0 : b);
        }
        while (data.length < dlc) data.push(0);
        frames.push(createJ1939Frame(ts, canId, data, `f_${i}`));
        continue;
      }
    }

    // Format 3: Vector .asc format: "0.123 1 18F00400x Rx d 8 0F 7D 80 1F 40 FF FF FF"
    const ascMatch = line.match(/^([0-9.]+)\s+\d+\s+([0-9A-Fa-f]{8})x?\s+Rx\s+d\s+(\d+)\s+(.*)$/i);
    if (ascMatch) {
      const ts = parseFloat(ascMatch[1]);
      const canId = parseInt(ascMatch[2], 16);
      const dlc = parseInt(ascMatch[3], 10);
      const byteTokens = ascMatch[4].trim().split(/\s+/);
      const data = byteTokens.map((t) => parseInt(t, 16)).filter((n) => !isNaN(n));
      frames.push(createJ1939Frame(ts, canId, data, `f_${i}`));
      continue;
    }

    // Format 4: Plain space separated: "0.123 18F00400 8 0F 7D 80 1F 40 FF FF FF"
    const tokens = line.split(/\s+/);
    if (tokens.length >= 4 && !isNaN(parseFloat(tokens[0]))) {
      const ts = parseFloat(tokens[0]);
      const canId = parseInt(tokens[1].replace(/^0x/i, ''), 16);
      const dlc = parseInt(tokens[2], 10);
      const data = tokens.slice(3, 3 + dlc).map((t) => parseInt(t, 16)).filter((n) => !isNaN(n));
      if (!isNaN(canId) && data.length > 0) {
        frames.push(createJ1939Frame(ts, canId, data, `f_${i}`));
      }
    }
  }

  // Sort frames chronologically
  return frames.sort((a, b) => a.timestamp - b.timestamp);
}

// Export frames to Vector .ASC format
export function exportFramesToAsc(frames: J1939Frame[]): string {
  let out = `date ${new Date().toUTCString()}\n`;
  out += `base hex  timestamps absolute\n`;
  out += `internal events logged\n`;
  out += `// J1939 CAN Log Exported from Truck Cluster Trampoline RTOS Simulator\n`;
  out += `// Columns: Timestamp(s) Channel CAN_IDx Dir DLC Data(Hex)\n\n`;

  for (const f of frames) {
    const canIdHex = f.canId.toString(16).padStart(8, '0').toUpperCase();
    const tsStr = f.timestamp.toFixed(4).padStart(9, ' ');
    out += `${tsStr} 1  ${canIdHex}x   Rx   d ${f.dlc}  ${f.dataHex}\n`;
  }

  return out;
}

// Generate Realistic Pre-built Scenarios
export function generatePrebuiltScenarios(): J1939Scenario[] {
  return [
    createHighwayScenario(),
    createMountainOverheatScenario(),
    createUrbanTurnSignalsScenario(),
    createCriticalOilFailureScenario(),
  ];
}

/**
 * Scenario 1: Highway Long-Haul
 * 45-ton truck accelerating on highway, cruising at 85 km/h, normal parameters.
 */
function createHighwayScenario(): J1939Scenario {
  const frames: J1939Frame[] = [];
  const duration = 25; // seconds
  const stepMs = 50; // 50ms intervals = 20Hz update

  let speed = 0;
  let rpm = 650;
  let gear = 1;
  let fuel = 85;
  let temp = 82;
  let odo = 342150.0;

  for (let t = 0; t <= duration; t += stepMs / 1000) {
    const timeMs = Math.round(t * 1000);

    // Profile: 0-6s acceleration, 6-20s highway cruising at 85 km/h, 20-25s braking
    if (t < 2) {
      gear = 1;
      rpm = 650 + t * 400;
      speed = t * 5;
    } else if (t < 5) {
      gear = 4;
      rpm = 1100 + (t - 2) * 200;
      speed = 10 + (t - 2) * 12;
    } else if (t < 8) {
      gear = 8;
      rpm = 1250 + (t - 5) * 100;
      speed = 46 + (t - 5) * 12;
    } else if (t < 20) {
      gear = 12; // Top cruising gear
      rpm = 1280 + Math.sin(t * 2) * 30; // 1280 RPM cruising in green eco-band
      speed = 84 + Math.sin(t) * 2;
    } else {
      // Gentle braking
      gear = 10;
      rpm = 1100 - (t - 20) * 100;
      speed = Math.max(40, 84 - (t - 20) * 8);
    }

    fuel = Math.max(10, 85 - t * 0.05);
    temp = 82 + Math.min(8, t * 0.3);
    odo += (speed * (stepMs / 1000)) / 3600;

    // Send EEC1 (PGN 61444, SA 0x00) every 50ms
    if (timeMs % 50 === 0) {
      const rawRpm = Math.round(rpm / 0.125);
      const eec1Id = buildCanId(3, J1939_PGN.EEC1, 0x00);
      const eec1Data = [0x0f, 0x7d, 0x80, rawRpm & 0xff, (rawRpm >> 8) & 0xff, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), eec1Id, eec1Data));
    }

    // Send CCVS (PGN 65265, SA 0x00) every 100ms
    if (timeMs % 100 === 0) {
      const rawSpeed = Math.round(speed * 256.0);
      const ccvsId = buildCanId(6, J1939_PGN.CCVS, 0x00);
      const parkBrake = speed < 1 ? 0x04 : 0x00;
      const cruise = t >= 10 && t <= 19 ? 0x01 : 0x00;
      const ccvsData = [parkBrake, rawSpeed & 0xff, (rawSpeed >> 8) & 0xff, cruise, 0x55, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ccvsId, ccvsData));
    }

    // Send ET1 (PGN 65262, SA 0x00) every 500ms
    if (timeMs % 500 === 0) {
      const et1Id = buildCanId(6, J1939_PGN.ET1, 0x00);
      const rawTemp = Math.round(temp + 40);
      const et1Data = [rawTemp, 0x50, 0x60, 0x1f, 0xff, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), et1Id, et1Data));
    }

    // Send DD (PGN 65276, SA 0x17) every 1000ms
    if (timeMs % 1000 === 0) {
      const ddId = buildCanId(6, J1939_PGN.DD, 0x17);
      const rawFuel = Math.round(fuel / 0.4);
      const ddData = [0xff, rawFuel, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ddId, ddData));
    }

    // Send ETC2 Gear (PGN 61445, SA 0x03) every 200ms
    if (timeMs % 200 === 0) {
      const etc2Id = buildCanId(3, J1939_PGN.ETC2, 0x03);
      const rawGear = gear + 125;
      const etc2Data = [0xff, 0xff, 0xff, rawGear, 0xff, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), etc2Id, etc2Data));
    }

    // Send Pneumatic Air Pressure (PGN 65274, SA 0x0b) every 500ms
    if (timeMs % 500 === 0) {
      const airId = buildCanId(6, J1939_PGN.AIR1_2, 0x0b);
      const p1 = Math.round(9.8 / 0.08);
      const p2 = Math.round(9.6 / 0.08);
      const airData = [0xff, 0xff, p1, p2, 0xff, 0xff, 0xff, 0xff];
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), airId, airData));
    }
  }

  return {
    id: 'highway-drive',
    title: 'Rodovia SP-330 (Velocidade de Cruzeiro 45t)',
    description: 'Caminhão carregado acelerando na rodovia e atingindo velocidade estável de 85 km/h a 1.280 RPM na faixa verde econômica.',
    durationSeconds: duration,
    framesCount: frames.length,
    keyEvents: [
      'Saída em 1ª marcha (0 a 10 km/h)',
      'Escalonamento da caixa automatizada até 12ª marcha',
      'Cruzeiro econômico em 85 km/h @ 1280 RPM',
      'Temperatura estável em 88°C, consumo otimizado',
    ],
    frames,
  };
}

/**
 * Scenario 2: Mountain Climb Heavy Overheat & General Fault
 * Truck climbs steep grade with maximum torque, coolant temperature rises > 108°C,
 * triggers Check Engine (MIL) and General Failure (Amber Warning) with active DTC SPN 110 FMI 0.
 */
function createMountainOverheatScenario(): J1939Scenario {
  const frames: J1939Frame[] = [];
  const duration = 25;
  const stepMs = 50;

  let speed = 65;
  let rpm = 1850;
  let temp = 88;
  let checkEngine = false;
  let generalFailure = false;

  for (let t = 0; t <= duration; t += stepMs / 1000) {
    const timeMs = Math.round(t * 1000);

    // Profile: High engine strain uphill
    if (t < 8) {
      temp = 88 + t * 1.5; // Rises to 100°C
      rpm = 1800 + Math.sin(t) * 80;
      speed = Math.max(45, 65 - t * 2.2);
    } else if (t < 15) {
      // Overheat zone (> 105°C) -> Triggers Amber Warning & Check Engine
      temp = 100 + (t - 8) * 1.6; // Reaches ~111°C
      checkEngine = true;
      generalFailure = true;
      speed = 38;
      rpm = 1950;
    } else {
      // Driver downshifts, limp mode, cooling down slowly
      temp = Math.max(98, 111 - (t - 15) * 1.2);
      speed = 28;
      rpm = 1400;
    }

    // Send EEC1
    if (timeMs % 50 === 0) {
      const rawRpm = Math.round(rpm / 0.125);
      const eec1Id = buildCanId(3, J1939_PGN.EEC1, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), eec1Id, [0x0f, 0xfa, 0xfa, rawRpm & 0xff, (rawRpm >> 8) & 0xff, 0xff, 0xff, 0xff]));
    }

    // Send CCVS
    if (timeMs % 100 === 0) {
      const rawSpeed = Math.round(speed * 256.0);
      const ccvsId = buildCanId(6, J1939_PGN.CCVS, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ccvsId, [0x00, rawSpeed & 0xff, (rawSpeed >> 8) & 0xff, 0x00, 0x00, 0xff, 0xff, 0xff]));
    }

    // Send ET1 (Coolant Temp)
    if (timeMs % 200 === 0) {
      const et1Id = buildCanId(6, J1939_PGN.ET1, 0x00);
      const rawTemp = Math.min(250, Math.round(temp + 40));
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), et1Id, [rawTemp, 0x55, 0x80, 0x22, 0xff, 0xff, 0xff, 0xff]));
    }

    // Send DM1 (DTC & Warning Lamps) every 500ms
    if (timeMs % 500 === 0) {
      const dm1Id = buildCanId(6, J1939_PGN.DM1, 0x00);
      let byte0 = 0x00;
      let dtcBytes = [0x00, 0x00, 0x00, 0x00];

      if (temp >= 105) {
        // MIL on (bits 7-8: 01 = 0x40) + Amber warning on (bits 3-4: 01 = 0x04)
        byte0 = 0x44;
        // SPN 110 (Coolant temp) = 0x0006E, FMI 0 (high severity) = 0x00
        // bytes[2] = 0x6E, bytes[3] = 0x00, bytes[4] = 0x00 (FMI 0), bytes[5] = 0x01 (count 1)
        dtcBytes = [0x6e, 0x00, 0x00, 0x01];
      }

      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), dm1Id, [byte0, 0xff, ...dtcBytes, 0xff, 0xff]));
    }

    // Fuel Level DD
    if (timeMs % 1000 === 0) {
      const ddId = buildCanId(6, J1939_PGN.DD, 0x17);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ddId, [0xff, Math.round(62 / 0.4), 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
    }
  }

  return {
    id: 'mountain-overheat',
    title: 'Subida de Serra com Superaquecimento e Falha Geral',
    description: 'Subida íngreme sob torque pleno: temperatura do arrefecimento atinge 111°C, disparando Check Engine e Falha Geral com código SPN 110.',
    durationSeconds: duration,
    framesCount: frames.length,
    keyEvents: [
      'Início de rampa forte: rotação sobe para 1.950 RPM sob carga 100%',
      'Temperatura do fluido de arrefecimento ultrapassa 105°C aos 8s',
      'Ativação do indicador de Falha no Motor (Check Engine MIL)',
      'Ativação da Lâmpada de Falha Geral (Alerta Âmbar)',
      'Registro do código DTC SPN 110 FMI 0 (Superaquecimento)',
    ],
    frames,
  };
}

/**
 * Scenario 3: Urban Delivery with Turn Signals, Hazards, and Low Fuel
 * Flashes Left turn signal, turns, flashes Right turn signal, activates hazard lights, fuel < 10%
 */
function createUrbanTurnSignalsScenario(): J1939Scenario {
  const frames: J1939Frame[] = [];
  const duration = 24;
  const stepMs = 50;

  for (let t = 0; t <= duration; t += stepMs / 1000) {
    const timeMs = Math.round(t * 1000);

    let speed = 30;
    let rpm = 1200;
    let turnByte = 0x00;

    // Timeline:
    // 0s - 7s: Approaching intersection, turn left signal blinking
    // 7s - 12s: Stopped at red light
    // 12s - 18s: Turn right signal blinking into delivery bay
    // 18s - 24s: Hazard lights blinking (Pisca-Alerta)
    if (t < 7) {
      speed = Math.max(0, 35 - t * 5);
      rpm = 1200 - t * 80;
      turnByte = 0x01; // Seta esquerda ativa
    } else if (t < 12) {
      speed = 0;
      rpm = 650;
      turnByte = 0x00;
    } else if (t < 18) {
      speed = Math.min(25, (t - 12) * 5);
      rpm = 700 + (t - 12) * 120;
      turnByte = 0x02; // Seta direita ativa
    } else {
      speed = 0;
      rpm = 650;
      turnByte = 0x04; // Pisca-alerta (Hazard lights)
    }

    // Fuel level in critical reserve (8%)
    const fuel = Math.max(7, 9.5 - t * 0.08);

    // Send EEC1
    if (timeMs % 50 === 0) {
      const rawRpm = Math.round(rpm / 0.125);
      const eec1Id = buildCanId(3, J1939_PGN.EEC1, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), eec1Id, [0x0f, 0x50, 0x50, rawRpm & 0xff, (rawRpm >> 8) & 0xff, 0xff, 0xff, 0xff]));
    }

    // Send CCVS
    if (timeMs % 100 === 0) {
      const rawSpeed = Math.round(speed * 256.0);
      const ccvsId = buildCanId(6, J1939_PGN.CCVS, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ccvsId, [speed === 0 ? 0x04 : 0x00, rawSpeed & 0xff, (rawSpeed >> 8) & 0xff, 0x00, 0x00, 0xff, 0xff, 0xff]));
    }

    // Send Lighting Command (Turn Signals) every 100ms
    if (timeMs % 100 === 0) {
      const lightId = buildCanId(6, J1939_PGN.LIGHTING, 0x21); // Body Controller
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), lightId, [turnByte, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]));
    }

    // Send Fuel Level DD every 500ms
    if (timeMs % 500 === 0) {
      const ddId = buildCanId(6, J1939_PGN.DD, 0x17);
      const rawFuel = Math.round(fuel / 0.4);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ddId, [0xff, rawFuel, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
    }

    // Send ET1 Coolant temp
    if (timeMs % 1000 === 0) {
      const et1Id = buildCanId(6, J1939_PGN.ET1, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), et1Id, [Math.round(86 + 40), 0x50, 0x50, 0x20, 0xff, 0xff, 0xff, 0xff]));
    }
  }

  return {
    id: 'urban-turns',
    title: 'Percurso Urbano com Setas, Paradas e Reserva de Combustível',
    description: 'Manobras urbanas de entrega: acionamento de seta à esquerda, parada no semáforo, seta à direita, pisca-alerta e alerta de combustível na reserva (8%).',
    durationSeconds: duration,
    framesCount: frames.length,
    keyEvents: [
      'Acionamento da seta para a esquerda (0s - 7s)',
      'Frenagem total até imobilização no semáforo',
      'Acionamento da seta para a direita (12s - 18s)',
      'Estacionamento e acionamento do pisca-alerta',
      'Indicação contínua de combustível na reserva com lâmpada dedicada',
    ],
    frames,
  };
}

/**
 * Scenario 4: Critical Engine Failure (Oil Pressure Loss + Stop Engine)
 * Low oil pressure drops below 0.8 bar, rapid flashing Check Engine + Red Master Stop Engine.
 */
function createCriticalOilFailureScenario(): J1939Scenario {
  const frames: J1939Frame[] = [];
  const duration = 20;
  const stepMs = 50;

  for (let t = 0; t <= duration; t += stepMs / 1000) {
    const timeMs = Math.round(t * 1000);

    let speed = 75;
    let rpm = 1500;
    let oil = 4.2;

    if (t < 5) {
      // Normal running
      oil = 4.2;
    } else if (t < 10) {
      // Sudden oil pressure drop
      oil = Math.max(0.4, 4.2 - (t - 5) * 0.75);
      rpm = 1450;
      speed = 70;
    } else {
      // Driver emergency pull-over
      oil = 0.4;
      speed = Math.max(0, 70 - (t - 10) * 8);
      rpm = Math.max(600, 1400 - (t - 10) * 100);
    }

    // Send EFL/P1 (Oil pressure) every 100ms
    if (timeMs % 100 === 0) {
      const oilId = buildCanId(6, J1939_PGN.EFL_P1, 0x00);
      const rawOil = Math.round(oil / 0.04);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), oilId, [0xff, 0xff, 0xff, rawOil, 0xff, 0xff, 0xff, 0xff]));
    }

    // Send DM1 Diagnostic fault
    if (timeMs % 200 === 0) {
      const dm1Id = buildCanId(6, J1939_PGN.DM1, 0x00);
      let byte0 = 0x00;
      let dtcBytes = [0x00, 0x00, 0x00, 0x00];

      if (t >= 7) {
        // Red Stop Lamp ON (bits 5-6: 01 = 0x10) + MIL Lamp ON (bits 7-8: 01 = 0x40) + Amber (0x04)
        byte0 = 0x54;
        // SPN 100 (Oil Pressure) = 0x00064, FMI 1 (Low pressure) = 0x01
        dtcBytes = [0x64, 0x00, 0x01, 0x01];
      }

      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), dm1Id, [byte0, 0xff, ...dtcBytes, 0xff, 0xff]));
    }

    // EEC1
    if (timeMs % 50 === 0) {
      const rawRpm = Math.round(rpm / 0.125);
      const eec1Id = buildCanId(3, J1939_PGN.EEC1, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), eec1Id, [0x0f, 0x7d, 0x80, rawRpm & 0xff, (rawRpm >> 8) & 0xff, 0xff, 0xff, 0xff]));
    }

    // CCVS
    if (timeMs % 100 === 0) {
      const rawSpeed = Math.round(speed * 256.0);
      const ccvsId = buildCanId(6, J1939_PGN.CCVS, 0x00);
      frames.push(createJ1939Frame(parseFloat(t.toFixed(3)), ccvsId, [speed === 0 ? 0x04 : 0x00, rawSpeed & 0xff, (rawSpeed >> 8) & 0xff, 0x00, 0x00, 0xff, 0xff, 0xff]));
    }
  }

  return {
    id: 'oil-pressure-critical',
    title: 'Falha Crítica no Motor (Queda de Pressão de Óleo & Stop)',
    description: 'Queda súbita da pressão do óleo lubrificante para 0.4 bar, ativando luz de emergência vermelha (STOP ENGINE), Check Engine e DTC SPN 100 FMI 1.',
    durationSeconds: duration,
    framesCount: frames.length,
    keyEvents: [
      'Operação normal a 75 km/h com pressão de óleo em 4.2 bar',
      'Queda repentina de pressão de óleo aos 5s',
      'Disparo de STOP ENGINE (Lâmpada vermelha de parada imediata)',
      'Check Engine piscante e aviso sonoro de emergência',
      'Acostamento seguro e imobilização do veículo',
    ],
    frames,
  };
}
