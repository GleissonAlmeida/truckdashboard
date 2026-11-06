/**
 * J1939 CAN Protocol Types and Definitions
 * SAE J1939 Standard for Heavy-Duty Commercial Vehicles
 */

export interface J1939Frame {
  id: string; // Unique row ID
  timestamp: number; // in milliseconds or seconds from start
  canId: number; // 29-bit CAN ID (hex: e.g. 0x18F00400)
  priority: number; // 3 bits (0-7, 0 is highest priority)
  pgn: number; // Parameter Group Number (18 bits)
  pgnHex: string; // PGN formatted as 0xXXXX
  pgnName: string; // Human readable name (e.g., EEC1, CCVS, ET1, DD, DM1)
  sourceAddress: number; // 8 bits (e.g. 0x00 for Engine #1, 0x03 for Transmission)
  sourceName: string;
  destAddress?: number;
  dlc: number; // Data Length Code (usually 8 bytes)
  data: number[]; // 8 bytes [D0, D1, D2, D3, D4, D5, D6, D7]
  dataHex: string; // e.g. "0F 7D 80 1F 40 FF FF FF"
}

// Key SAE J1939 Parameter Group Numbers
export const J1939_PGN = {
  EEC1: 61444, // 0xF004 - Electronic Engine Controller 1 (RPM, Torque)
  EEC2: 61443, // 0xF003 - Electronic Engine Controller 2 (Accelerator pedal)
  CCVS: 65265, // 0xFEF1 - Cruise Control/Vehicle Speed (Speed, Brakes)
  ET1: 65262,  // 0xFEEE - Engine Temperature 1 (Coolant, Oil, Fuel Temp)
  DD: 65276,   // 0xFEFC - Dash Display (Fuel level, Washer fluid)
  DM1: 65226,  // 0xFECA - Active Diagnostic Trouble Codes (MIL, Stop, Warning)
  EFL_P1: 65263, // 0xFEEF - Engine Fluid Level/Pressure (Oil pressure)
  AIR1_2: 65274, // 0xFEFA - Pneumatic Supply Pressure (Air Brakes 1 & 2)
  LIGHTING: 65088, // 0xFE40 - Lighting Command/Status (Turn signals, high beam)
  VEP: 65271,  // 0xFEF7 - Vehicle Electrical Power (Battery voltage)
  VD: 65217,   // 0xFEC1 - High Resolution Vehicle Distance (Odometer)
  ETC2: 61445, // 0xF005 - Electronic Transmission Controller 2 (Gear)
} as const;

export interface DiagnosticTroubleCode {
  spn: number; // Suspect Parameter Number
  fmi: number; // Failure Mode Identifier
  occurrenceCount: number;
  description: string;
  spnName: string;
  severity: 'amber' | 'red' | 'info';
}

export interface TruckClusterState {
  // Primary Indicators requested by user
  speed: number;        // km/h (0 - 140)
  rpm: number;          // RPM (0 - 3000)
  fuelLevel: number;    // % (0 - 100)
  coolantTemp: number;  // °C (40 - 125)
  turnLeft: boolean;    // Indicador de seta esquerda
  turnRight: boolean;   // Indicador de seta direita
  checkEngine: boolean; // Indicador de falha no motor (MIL - Malfunction Indicator Lamp)
  generalFailure: boolean; // Indicador de falha geral (Amber Warning / Master Stop)

  // Secondary Heavy Truck Essentials
  airPressure1: number; // bar (0 - 12)
  airPressure2: number; // bar (0 - 12)
  oilPressure: number;  // bar (0 - 8)
  batteryVoltage: number; // V (20 - 30)
  parkingBrake: boolean;
  highBeam: boolean;
  hazardLights: boolean;
  retarderActive: boolean;
  seatbelt: boolean;
  cruiseControl: boolean;
  currentGear: string; // 'N', 'R', '1'..'12'
  odometerKm: number;
  tripKm: number;
  instantConsumption: number; // L/100km

  // Diagnostic Codes
  activeDTCs: DiagnosticTroubleCode[];
  lastUpdatedTimestamp: number;
}

export interface J1939Scenario {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  framesCount: number;
  keyEvents: string[];
  frames: J1939Frame[];
}
