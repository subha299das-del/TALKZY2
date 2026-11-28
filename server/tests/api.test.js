'use strict';

const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');

// Keep the backend import isolated from every production secret and database.
process.env.NODE_ENV = 'test';
process.env.OWNER_EMAIL = 'test-owner@example.invalid';
process.env.OWNER_PASSWORD = 'test-only-password-not-used-in-production';
process.env.JWT_SECRET = 'test-only-jwt-secret-at-least-32-bytes-long';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-only-supabase-secret-key';

const app = require('../server');
let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

test('health endpoint responds without touching Supabase', async () => {
  const response = await request('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: 'TALKZY owner backend' });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('private room and chat APIs reject requests without a user session', async () => {
  const paths = [
    '/api/rooms/mine',
    '/api/rooms/test-room/messages',
    '/api/rooms/test-room/presence',
    '/api/rooms/test-room/music',
    '/api/rooms/test-room/youtube',
    '/api/rooms/test-room/mic-seats',
    '/api/games/royal-fruit/state',
    '/api/games/royal-fruit/history',
    '/api/games/royal-fruit/top-winners',
  ];

  for (const path of paths) {
    const response = await request(path);
    assert.equal(response.status, 401, `${path} must require authentication`);
    assert.match((await response.json()).error, /sign in/i);
  }
});

test('room mutations reject unauthenticated requests before processing data', async () => {
  const requests = [
    ['/api/rooms/test-room/messages', 'POST', { message: 'test message' }],
    ['/api/rooms/test-room/music/me', 'PUT', { queue: [] }],
    ['/api/rooms/test-room/youtube', 'PUT', { video_id: null, queue: [] }],
    ['/api/games/royal-fruit/bet', 'POST', { fruit: 'apple', amount: 100, requestKey: 'royal-fruit-test-12345' }],
  ];

  for (const [path, method, body] of requests) {
    const response = await request(path, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    assert.equal(response.status, 401, `${method} ${path} must authenticate before mutation`);
  }
});

test('owner dashboard login rejects incorrect credentials', async () => {
  const response = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'wrong@example.invalid', password: 'wrong-password' })
  });
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /invalid owner/i);
});

test('malformed JSON is rejected with a client error', async () => {
  const response = await request('/api/rooms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"roomName":'
  });
  assert.equal(response.status, 400);
});
