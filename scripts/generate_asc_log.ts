import fs from 'fs';
import path from 'path';
import { generatePrebuiltScenarios, exportFramesToAsc } from '../src/services/j1939Decoder';

const scenarios = generatePrebuiltScenarios();
const masterScenario = scenarios[0]; // createFullMasterScenario

console.log(`Generating ASC log for: ${masterScenario.title}`);
console.log(`Duration: ${masterScenario.durationSeconds}s, Total Frames: ${masterScenario.frames.length}`);

const ascContent = exportFramesToAsc(masterScenario.frames);

const publicLogsDir = path.resolve(process.cwd(), 'public', 'logs');
if (!fs.existsSync(publicLogsDir)) {
  fs.mkdirSync(publicLogsDir, { recursive: true });
}

const targetFile = path.join(publicLogsDir, 'j1939_truck_simulation_2min.asc');
fs.writeFileSync(targetFile, ascContent, 'utf-8');

console.log(`Successfully generated: ${targetFile}`);
console.log(`File size: ${(Buffer.byteLength(ascContent, 'utf-8') / 1024).toFixed(1)} KB`);
