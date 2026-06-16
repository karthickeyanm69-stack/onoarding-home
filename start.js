import { spawn } from 'child_process';
import os from 'os';

const isWin = os.platform() === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('Starting local mock Supabase server and client front-end...');

// Spawn mock server with shell: true for Windows command compatibility
const server = spawn(npmCmd, ['run', 'server'], { stdio: 'inherit', shell: true });

// Spawn vite web app with shell: true for Windows command compatibility
const client = spawn(npmCmd, ['run', 'dev'], { stdio: 'inherit', shell: true });

function terminateAll() {
  console.log('\nStopping servers...');
  try {
    server.kill();
  } catch (e) {}
  try {
    client.kill();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', terminateAll);
process.on('SIGTERM', terminateAll);

server.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
  if (code !== 0) terminateAll();
});

client.on('exit', (code) => {
  console.log(`Vite client exited with code ${code}`);
  if (code !== 0) terminateAll();
});
