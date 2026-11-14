import { spawn } from 'node:child_process';
import http from 'node:http';
import electronPath from 'electron';

const DEV_URL = 'http://localhost:3000';
const CHECK_URL = 'http://127.0.0.1:3000';

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get(CHECK_URL, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkServerReady()) return true;
    await new Promise((r) => setTimeout(r, 350));
  }
  return false;
}

async function run() {
  let viteProc = null;
  const alreadyRunning = await checkServerReady();

  if (!alreadyRunning) {
    const isWin = process.platform === 'win32';
    viteProc = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: isWin,
      env: process.env,
    });
  }

  const ready = await waitForServer();
  if (!ready) {
    console.error('Failed to start Vite dev server on port 3000.');
    if (viteProc) viteProc.kill();
    process.exit(1);
  }

  const electronProc = spawn(String(electronPath), ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_START_URL: DEV_URL,
    },
  });

  const cleanup = () => {
    if (viteProc && !viteProc.killed) {
      viteProc.kill();
    }
  };

  electronProc.on('close', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}

run();
