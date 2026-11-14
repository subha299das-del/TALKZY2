
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || '').trim().toLowerCase();
const OWNER_PASSWORD = String(process.env.OWNER_PASSWORD || '');
const JWT_SECRET = String(process.env.JWT_SECRET || '');
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SUPABASE_SECRET_KEY = String(process.env.SUPABASE_SECRET_KEY || '').trim();
const production = process.env.NODE_ENV === 'production';

if (process.env.RENDER === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

if (
  !OWNER_EMAIL ||
  OWNER_PASSWORD.length < 16 ||
  Buffer.byteLength(JWT_SECRET, 'utf8') < 32
) {
  throw new Error('Set OWNER_EMAIL, OWNER_PASSWORD (16+ characters), and JWT_SECRET (32+ bytes).');
}

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in Render environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const initial = {
  appName: 'TALKZY',
  tagline: 'Talk • Connect • Earn',
  primary: '#8B5CF6',
  background: '#0B0812',
  card: '#171225',
  bannerTitle: 'Your voice. Your community.',
  bannerText: 'Join conversations and meet new people.',
  announcement: 'Welcome to TALKZY!',
  logoUrl: ''
};

const fieldLimits = {
  appName: 32,
  tagline: 80,
  bannerTitle: 80,
  bannerText: 240,
  announcement: 240,
  logoUrl: 500
};

const colourFields = ['primary', 'background', 'card'];

async function readConfig() {
  const { data, error } = await supabase
    .from('talkzy_config')
    .select('settings')
    .eq('id', 1)
    .single();

  if (error) throw error;

  return { ...initial, ...(data.settings || {}) };
}

async function writeConfig(config) {
  const { error } = await supabase
    .from('talkzy_config')
    .upsert(
      { id: 1, settings: config },
      { onConflict: 'id' }
    );

  if (error) throw error;
}

function constantTimeEqual(left, right) {
  const a = crypto.createHash('sha256').update(String(left)).digest();
  const b = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
}));

app.use((req, res, next) => {
  if (production && !req.secure) {
    return res.status(400).send('HTTPS is required. Open the secure https:// address.');
  }
  next();
});

app.use(express.json({ limit: '20kb', strict: true }));

app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: production ? '1h' : 0
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' }
});

function ownerAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);

  if (!match) {
    return res.status(401).json({ error: 'Owner sign-in required.' });
  }

  try {
    const payload = jwt.verify(match[1], JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'talkzy-owner-api',
      audience: 'talkzy-owner-dashboard'
    });

    if (payload.role !== 'owner' || payload.sub !== OWNER_EMAIL) {
      throw new Error('Invalid role');
    }

    req.owner = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Your owner session expired. Sign in again.' });
  }
}

app.get('/api/health', (req, res) =>
  res.set('Cache-Control', 'no-store').json({
    ok: true,
    service: 'TALKZY owner backend'
  })
);

app.get('/api/config', async (req, res) => {
  try {
    const config = await readConfig();
    res.set('Cache-Control', 'no-store').json(config);
  } catch (error) {
    console.error('Could not load interface config:', error.message);
    res.status(500).json({ error: 'Could not load saved settings.' });
  }
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!constantTimeEqual(email, OWNER_EMAIL) || !constantTimeEqual(password, OWNER_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid owner email or password.' });
  }

  const token = jwt.sign({ role: 'owner' }, JWT_SECRET, {
    algorithm: 'HS256',
    subject: OWNER_EMAIL,
    issuer: 'talkzy-owner-api',
    audience: 'talkzy-owner-dashboard',
    expiresIn: '2h'
  });

  res.set('Cache-Control', 'no-store').json({ token, expiresIn: 7200 });
});

app.put('/api/config', ownerAuth, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Send interface settings as a JSON object.' });
  }

  try {
    const next = await readConfig();

    for (const key of Object.keys(fieldLimits)) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] !== 'string' || req.body[key].length > fieldLimits[key]) {
          return res.status(400).json({
            error: `${key} must be text with no more than ${fieldLimits[key]} characters.`
          });
        }

        if (key === 'logoUrl' && req.body[key] !== '' && !/^https:\/\/\S+$/i.test(req.body[key])) {
          return res.status(400).json({
            error: 'Logo URL must start with https://.'
          });
        }

        next[key] = req.body[key];
      }
    }

    for (const key of colourFields) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(req.body[key])) {
          return res.status(400).json({
            error: `${key} must be a six-digit hex colour, such as #8B5CF6.`
          });
        }

        next[key] = req.body[key];
      }
    }

    await writeConfig(next);

    res.set('Cache-Control', 'no-store').json(next);
  } catch (error) {
    console.error('Could not save interface config:', error.message);
    res.status(500).json({
      error: 'Could not save settings. Check the Supabase database connection.'
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request.' });
  }

  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`TALKZY owner backend listening on port ${PORT}`)
);
         
