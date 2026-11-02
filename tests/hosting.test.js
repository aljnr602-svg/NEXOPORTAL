'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('Hosting HTTPS: acepta su origen, protege cookies y rechaza otro sitio', async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'nexo-hosting-'));
  const base = 'http://127.0.0.1:3398';
  const origin = 'https://nexo-hosting.example';
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: '3398',
      DATA_DIR: temp,
      PUBLIC_ORIGIN: origin
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const stopped = new Promise((resolve) => child.once('exit', resolve));
      child.kill();
      await stopped;
    }
    fs.rmSync(temp, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Servidor no disponible')), 10000);
    child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    child.once('error', (e) => { clearTimeout(timer); reject(e); });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error('Servidor terminó: ' + code));
    });
  });
  const post = (route, data, source = origin, cookie) => fetch(base + '/api/' + route, {
    method: 'POST',
    headers: {
      Origin: source,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(data)
  });
  const registration = {
    name: 'Prueba Hosting', email: 'hosting@example.com',
    password: 'Prueba1234', career: 'Contaduría Pública', bio: ''
  };
  assert.equal((await post('register', registration, 'https://otro.example')).status, 403);
  const registered = await post('register', registration);
  assert.equal(registered.status, 200);
  assert.match(registered.headers.get('set-cookie'), /; Secure/);
  const cookie = registered.headers.get('set-cookie').split(';')[0];
  const account = await fetch(base + '/api/bank', { headers: { Cookie: cookie } });
  assert.equal(account.status, 200);
  const logout = await post('logout', {}, origin, cookie);
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0; Secure/);
});
