#!/usr/bin/env node
// jellyfin-mcp@0.4.3 emits its `initialize` response TWICE (identical id:1 result).
// supergateway routes the first, then throws "No connection established for request
// ID: 1" on the second and the whole gateway process dies. Two consecutive identical
// JSON-RPC *responses* with the same id are never valid, so drop the repeat.
// Remove this shim if upstream (lidless-labs/jellyctrl) ever ships a fix.
import { spawn } from 'node:child_process';
import readline from 'node:readline';

const child = spawn('node', ['node_modules/jellyfin-mcp/dist/mcp-bin.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

process.stdin.pipe(child.stdin);

let last = null;
readline.createInterface({ input: child.stdout }).on('line', (line) => {
  const trimmed = line.trim();
  if (trimmed) {
    let msg = null;
    try { msg = JSON.parse(trimmed); } catch { /* pass non-JSON through */ }
    const isResponse = msg && msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined);
    if (isResponse) {
      if (last === trimmed) {
        process.stderr.write(`[dedupe] dropped duplicate response id=${msg.id}\n`);
        return;
      }
      last = trimmed;
    }
  }
  process.stdout.write(line + '\n');
});

child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
