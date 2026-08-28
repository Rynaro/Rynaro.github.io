#!/usr/bin/env node
import { spawn } from 'node:child_process';
import net from 'node:net';
import { pathToFileURL } from 'node:url';

export const DEFAULT_PORT = 4000;

export class NotebookPreviewError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.exitCode = exitCode;
  }
}

export function parseArgs(argv) {
  let port = DEFAULT_PORT;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help') return { help: true, port };
    if (token !== '--port') throw new NotebookPreviewError(`Unknown option: ${token}`);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new NotebookPreviewError('Option --port requires a value from 1 to 65535.');
    }
    if (!/^\d+$/.test(value)) throw new NotebookPreviewError(`Invalid port: ${value}. Use a number from 1 to 65535.`);
    port = Number(value);
    if (port < 1 || port > 65535) throw new NotebookPreviewError(`Invalid port: ${value}. Use a number from 1 to 65535.`);
    index += 1;
  }
  return { help: false, port };
}

export function assertPortAvailable(port, { createServer = net.createServer } = {}) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref?.();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        reject(new NotebookPreviewError(`Port ${port} is unavailable. Try another one, for example: npm run notebook:preview -- --port ${port === 4000 ? 4100 : port + 1}`, 1));
      } else {
        reject(new NotebookPreviewError(`Could not check port ${port}: ${error.message}`, 1));
      }
    });
    server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
      server.close((error) => error ? reject(new NotebookPreviewError(`Could not release port ${port}: ${error.message}`, 1)) : resolve());
    });
  });
}

export const HELP = `Preview Notebook drafts

Usage:
  npm run notebook:preview
  npm run notebook:preview -- --port 4100

Options:
  --port <1-65535>  Local Jekyll port (default: 4000)
  --help            Show this help
`;

export async function run(argv, environment = {}) {
  const stdout = environment.stdout ?? process.stdout;
  const stderr = environment.stderr ?? process.stderr;
  const spawnChild = environment.spawn ?? spawn;
  const checkPort = environment.checkPort ?? assertPortAvailable;
  const signals = environment.signals ?? process;
  let options;
  try {
    options = parseArgs(argv);
    if (options.help) {
      stdout.write(HELP);
      return 0;
    }
    await checkPort(options.port);
  } catch (error) {
    stderr.write(`${error.message}\n`);
    return error.exitCode ?? 1;
  }

  const baseUrl = `http://localhost:${options.port}`;
  stdout.write(`Opening the Notebook with drafts enabled.\nNotebook: ${baseUrl}/notebook/\nDraft posts appear in the Notebook and at their generated post URLs.\nPress Ctrl-C to close the preview.\n\n`);

  const child = spawnChild('bundle', [
    'exec', 'jekyll', 'serve', '--drafts', '--host', '127.0.0.1', '--port', String(options.port), '--livereload',
  ], { stdio: 'inherit' });

  return new Promise((resolve) => {
    let settled = false;
    const forward = (signal) => child.kill(signal);
    const onSigint = () => forward('SIGINT');
    const onSigterm = () => forward('SIGTERM');
    const cleanup = () => {
      signals.off?.('SIGINT', onSigint);
      signals.off?.('SIGTERM', onSigterm);
    };
    const finish = (code) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(code);
    };
    signals.on?.('SIGINT', onSigint);
    signals.on?.('SIGTERM', onSigterm);
    child.once('error', (error) => {
      stderr.write(`Could not start Jekyll: ${error.message}\n`);
      finish(1);
    });
    child.once('exit', (code, signal) => {
      const signalExit = { SIGINT: 130, SIGTERM: 143 }[signal];
      finish(Number.isInteger(code) ? code : signalExit ?? 1);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await run(process.argv.slice(2));
}
