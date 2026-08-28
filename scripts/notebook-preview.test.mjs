import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { assertPortAvailable, parseArgs, run } from './notebook-preview.mjs';

function capture() {
  let value = '';
  return { stream: { write(chunk) { value += chunk; } }, read: () => value };
}

test('parses the default and explicit port and rejects invalid input', () => {
  assert.deepEqual(parseArgs([]), { help: false, port: 4000 });
  assert.deepEqual(parseArgs(['--port', '4100']), { help: false, port: 4100 });
  for (const value of ['0', '65536', '4.2', 'abc']) assert.throws(() => parseArgs(['--port', value]), /Invalid port/);
  assert.throws(() => parseArgs(['--watch']), /Unknown option/);
});

test('detects an occupied port without opening a real test server', async () => {
  const fakeServer = new EventEmitter();
  fakeServer.unref = () => {};
  fakeServer.listen = () => queueMicrotask(() => fakeServer.emit('error', Object.assign(new Error('occupied'), { code: 'EADDRINUSE' })));
  await assert.rejects(assertPortAvailable(4000, { createServer: () => fakeServer }), /Port 4000 is unavailable/);
});

test('spawns Jekyll with drafts and the selected port, then returns its status', async () => {
  const child = new EventEmitter();
  child.kill = () => true;
  const calls = [];
  const stdout = capture();
  const promise = run(['--port', '4100'], {
    checkPort: async () => {}, stdout: stdout.stream, stderr: capture().stream,
    signals: new EventEmitter(),
    spawn(command, args, options) { calls.push({ command, args, options }); queueMicrotask(() => child.emit('exit', 7, null)); return child; },
  });
  assert.equal(await promise, 7);
  assert.deepEqual(calls[0], {
    command: 'bundle',
    args: ['exec', 'jekyll', 'serve', '--drafts', '--host', '127.0.0.1', '--port', '4100', '--livereload'],
    options: { stdio: 'inherit' },
  });
  assert.match(stdout.read(), /http:\/\/localhost:4100\/notebook\//);
});

test('refuses an occupied port before spawning', async () => {
  let spawned = false;
  const stderr = capture();
  const code = await run([], {
    checkPort: async () => { throw Object.assign(new Error('Port 4000 is unavailable. Try --port 4100.'), { exitCode: 1 }); },
    stderr: stderr.stream, stdout: capture().stream,
    spawn() { spawned = true; },
  });
  assert.equal(code, 1);
  assert.equal(spawned, false);
  assert.match(stderr.read(), /port 4100/i);
});

test('forwards termination signals to the child', async () => {
  const child = new EventEmitter();
  const killed = [];
  child.kill = (signal) => { killed.push(signal); return true; };
  const signals = new EventEmitter();
  const promise = run([], { checkPort: async () => {}, signals, spawn: () => child, stdout: capture().stream, stderr: capture().stream });
  await Promise.resolve();
  signals.emit('SIGTERM');
  child.emit('exit', null, 'SIGTERM');
  assert.equal(await promise, 143);
  assert.deepEqual(killed, ['SIGTERM']);
  assert.equal(signals.listenerCount('SIGTERM'), 0);
});
