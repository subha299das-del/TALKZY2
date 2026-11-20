const express = require('express');
const crypto = require('crypto');
const path = require('path');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { promisify } = require('util');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || '').trim().toLowerCase();
const OWNER_PASSWORD = String(process.env.OWNER_PASSWORD || '');
const JWT_SECRET = String(process.env.JWT_SECRET || '');
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SUPABASE_SECRET_KEY = String(process.env.SUPABASE_SECRET_KEY || '').trim();
const production = process.env.NODE_ENV === 'production';
const scryptAsync = promisify(crypto.scrypt);

if (process.env.RENDER === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

if (
  !OWNER_EMAIL ||
  OWNER_PASSWORD.length < 16 ||
  Buffer.byteLength(JWT_SECRET, 'utf8') < 32
) {
  throw new Error(
    'Set OWNER_EMAIL, OWNER_PASSWORD (16+ characters), and JWT_SECRET (32+ bytes).'
  );
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
    .upsert({ id: 1, settings: config }, { onConflict: 'id' });

  if (error) throw error;
}

function constantTimeEqual(left, right) {
  const a = crypto.createHash('sha256').update(String(left)).digest();
  const b = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

async function makePasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

async function checkPassword(password, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash.includes(':')) return false;

  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !/^[a-f0-9]{128}$/i.test(expectedHex || '')) return false;

  const actual = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');

  return expected.length === actual.length &&
    crypto.timingSafeEqual(actual, expected);
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

const roomCreateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many room creation attempts. Please wait and try again.' }
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

async function userAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);

  if (!match) {
    return res.status(401).json({ error: 'Please sign in first.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(match[1]);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    req.talkzyUser = data.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed.' });
  }
}

async function getRoom(roomId) {
  const { data, error } = await supabase
    .from('talkzy_rooms')
    .select('id, owner_id, room_name, description, room_dp_url, room_type, password_hash, status, created_at, closed_at, room_talkzy_id, country_name')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function isRoomAdmin(roomId, userId) {
  const { data, error } = await supabase
    .from('talkzy_room_admins')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function isRoomMember(roomId, userId) {
  const { data, error } = await supabase
    .from('talkzy_room_members')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function canManageRoom(room, userId) {
  return room.owner_id === userId || await isRoomAdmin(room.id, userId);
}

async function requireRoom(req, res) {
  const room = await getRoom(req.params.roomId);

  if (!room) {
    res.status(404).json({ error: 'Room not found.' });
    return null;
  }

  return room;
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

  if (!constantTimeEqual(email, OWNER_EMAIL) ||
      !constantTimeEqual(password, OWNER_PASSWORD)) {
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

        if (key === 'logoUrl' && req.body[key] !== '' &&
            !/^https:\/\/\S+$/i.test(req.body[key])) {
          return res.status(400).json({ error: 'Logo URL must start with https://.' });
        }

        next[key] = req.body[key];
      }
    }

    for (const key of colourFields) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] !== 'string' ||
            !/^#[0-9a-fA-F]{6}$/.test(req.body[key])) {
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

// List active public rooms. Locked rooms are never listed here.
app.get('/api/rooms', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('talkzy_rooms')
      .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, room_talkzy_id, country_name')
      .eq('status', 'active')
      .eq('room_type', 'public')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.set('Cache-Control', 'no-store').json({
      rooms: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Could not load public rooms:', error.message);
    res.status(500).json({ error: 'Could not load public rooms.' });
  }
});

// =========================================
// GET MY ROOMS (PUBLIC + LOCKED)
// =========================================

app.get('/api/rooms/mine', userAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('talkzy_rooms')
      .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, room_talkzy_id, country_name')
      .eq('owner_id', req.talkzyUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.set('Cache-Control', 'no-store').json({
      rooms: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Could not load owner rooms:', error.message);
    res.status(500).json({
      error: 'Could not load your rooms.'
    });
  }
});


// Create a new public room.

// Create a new room — public or locked.
// Each user can create only one room ever.

app.post('/api/rooms', userAuth, roomCreateLimiter, async (req, res) => {
  const roomName = String(req.body?.roomName || '').trim();
  const description = String(req.body?.description || '').trim();
  const roomDpUrl = String(req.body?.roomDpUrl || '').trim();
  const roomType = String(req.body?.roomType || 'public');
  const password = String(req.body?.password || '');

  if (roomName.length < 3 || roomName.length > 40) {
    return res.status(400).json({
      error: 'Room name must be between 3 and 40 characters.'
    });
  }

  if (description.length > 200) {
    return res.status(400).json({
      error: 'Description cannot exceed 200 characters.'
    });
  }

  if (!['public', 'locked'].includes(roomType)) {
    return res.status(400).json({
      error: 'Room type must be public or locked.'
    });
  }

  if (roomType === 'locked' && !password.trim()) {
    return res.status(400).json({
      error: 'A password is required for a locked room.'
    });
  }

  if (
    roomType === 'locked' &&
    (password.length < 4 || password.length > 64)
  ) {
    return res.status(400).json({
      error: 'Room password must be between 4 and 64 characters.'
    });
  }

  if (roomDpUrl.length > 1000) {
    return res.status(400).json({
      error: 'Room picture URL is too long.'
    });
  }

  if (roomDpUrl) {
    try {
      const parsedUrl = new URL(roomDpUrl);

      if (parsedUrl.protocol !== 'https:') {
        throw new Error('HTTPS required');
      }
    } catch {
      return res.status(400).json({
        error: 'Room picture must be a valid HTTPS URL.'
      });
    }
  }

  try {
    const passwordHash = roomType === 'locked'
      ? await makePasswordHash(password)
      : null;

    const { data, error } = await supabase
      .from('talkzy_rooms')
      .insert({
        owner_id: req.talkzyUser.id,
        room_name: roomName,
        description,
        room_type: roomType,
        password_hash: passwordHash,
        room_dp_url: roomDpUrl || null
      })
      .select(
        'id, room_name, description, room_type, room_dp_url, status, created_at, room_talkzy_id, country_name'
      )
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'You have already created a room. Each user can create only one room ever.'
        });
      }

      throw error;
    }

    return res.status(201).json({ room: data });
  } catch (error) {
    console.error('Room creation failed:', error.message);

    return res.status(500).json({
      error: 'Could not create room.'
    });
  }
});


// Join a public room, or join a locked room with its password.
app.post('/api/rooms/:roomId/join', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.status !== 'active') {
      return res.status(409).json({ error: 'This room is closed.' });
    }

    const userId = req.talkzyUser.id;
    const { data: kicked, error: kickCheckError } = await supabase
      .from('talkzy_room_kicklist')
      .select('user_id')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (kickCheckError) throw kickCheckError;
    if (kicked) return res.status(403).json({ error: 'You are on this room’s kick list and cannot rejoin.' });
    const manager = await canManageRoom(room, userId);
    const alreadyMember = await isRoomMember(room.id, userId);

    if (room.room_type === 'locked' && !manager && !alreadyMember) {
      const password = String(req.body?.password || '');
      const { data, error } = await supabase
        .from('talkzy_rooms')
        .select('password_hash')
        .eq('id', room.id)
        .single();

      if (error) throw error;

      const valid = await checkPassword(password, data.password_hash);
      if (!valid) {
        return res.status(403).json({ error: 'Incorrect room password.' });
      }
    }

    const { error } = await supabase
      .from('talkzy_room_members')
      .upsert(
        { room_id: room.id, user_id: userId, role: 'listener' },
        { onConflict: 'room_id,user_id', ignoreDuplicates: true }
      );

    if (error) throw error;

    return res.status(200).json({ joined: true, roomId: room.id });
  } catch (error) {
    console.error('Could not join room:', error.message);
    res.status(500).json({ error: 'Could not join this room.' });
  }
});


// =========================================
// GET MY JOINED ROOMS
// =========================================

app.get('/api/rooms/joined', userAuth, async (req, res) => {
  try {
    const userId = req.talkzyUser.id;

    // Find rooms this user has joined.
    const { data: memberships, error: memberError } = await supabase
      .from('talkzy_room_members')
      .select('room_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;

    const roomIds = (memberships || []).map(item => item.room_id);

    if (roomIds.length === 0) {
      return res.json({
        rooms: [],
        count: 0
      });
    }

    // Get the active rooms from those memberships.
    const { data: rooms, error: roomError } = await supabase
      .from('talkzy_rooms')
      .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, room_talkzy_id, country_name')
      .in('id', roomIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (roomError) throw roomError;

    return res.json({
      rooms: rooms || [],
      count: rooms?.length || 0
    });

  } catch (error) {
    console.error('Could not load joined rooms:', error.message);

    return res.status(500).json({
      error: 'Could not load joined rooms.'
    });
  }
});

 // =========================================
 // GET MY FOLLOWED ROOMS
 // =========================================

app.get('/api/rooms/followed', userAuth, async (req, res) => {
  try {
    const userId = req.talkzyUser.id;

    const { data: follows, error: followError } = await supabase
      .from('talkzy_room_follows')
      .select('room_id')
      .eq('user_id', userId);

    if (followError) throw followError;

    const roomIds = (follows || []).map(item => item.room_id);

    if (roomIds.length === 0) {
      return res.json({ rooms: [], count: 0 });
    }

    const { data: rooms, error: roomError } = await supabase
      .from('talkzy_rooms')
      .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, room_talkzy_id, country_name')
      .in('id', roomIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (roomError) throw roomError;

    return res.json({
      rooms: rooms || [],
      count: rooms?.length || 0
    });

  } catch (error) {
    console.error('Could not load followed rooms:', error.message);
    return res.status(500).json({
      error: 'Could not load followed rooms.'
    });
  }
});


// =========================================
// FOLLOW A ROOM
// =========================================

app.post('/api/rooms/:roomId/follow', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.status !== 'active') {
      return res.status(409).json({ error: 'This room is closed.' });
    }

    const { error } = await supabase
      .from('talkzy_room_follows')
      .upsert(
        {
          user_id: req.talkzyUser.id,
          room_id: room.id
        },
        {
          onConflict: 'user_id,room_id',
          ignoreDuplicates: true
        }
      );

    if (error) throw error;

    return res.json({ followed: true, roomId: room.id });

  } catch (error) {
    console.error('Could not follow room:', error.message);
    return res.status(500).json({
      error: 'Could not follow this room.'
    });
  }
});


// =========================================
// UNFOLLOW A ROOM
// =========================================

app.delete('/api/rooms/:roomId/follow', userAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('talkzy_room_follows')
      .delete()
      .eq('user_id', req.talkzyUser.id)
      .eq('room_id', req.params.roomId);

    if (error) throw error;

    return res.json({ followed: false });

  } catch (error) {
    console.error('Could not unfollow room:', error.message);
    return res.status(500).json({
      error: 'Could not unfollow this room.'
    });
  }
});




// Leave a room. Room owners cannot leave their own room.
app.post('/api/rooms/:roomId/leave', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.status !== 'active') {
      return res.status(409).json({
        error: 'This room is closed.'
      });
    }

    const userId = req.talkzyUser.id;

    if (room.owner_id === userId) {
      return res.status(403).json({
        error: 'Room owners cannot leave their own room.'
      });
    }

    // Remove admin privileges first.
    const { error: adminError } = await supabase
      .from('talkzy_room_admins')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', userId);

    if (adminError) throw adminError;

    // Remove room membership.
    const { error: memberError } = await supabase
      .from('talkzy_room_members')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', userId);

    if (memberError) throw memberError;

    return res.json({
      left: true,
      roomId: room.id
    });

  } catch (error) {
    console.error('Could not leave room:', error.message);
    return res.status(500).json({
      error: 'Could not leave this room.'
    });
  }
});


// =========================================
// CLOSE ROOM
// MAIN OWNER ADMIN PANEL ONLY — TO BE CONNECTED LATER
// =========================================

app.post('/api/rooms/:roomId/close', (req, res) => {
  return res.status(403).json({
    error: 'Room closure is restricted to the TALKZY Main Owner.'
  });
});


// Change a room between public and locked. Only the owner can change this.
app.patch('/api/rooms/:roomId/type', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.owner_id !== req.talkzyUser.id) {
      return res.status(403).json({ error: 'Only the room owner can change room privacy.' });
    }

    if (room.status !== 'active') {
      return res.status(409).json({ error: 'This room is closed.' });
    }

    const roomType = String(req.body?.roomType || '');
    const password = String(req.body?.password || '');

    if (!['public', 'locked'].includes(roomType)) {
      return res.status(400).json({ error: 'Room type must be public or locked.' });
    }

    if (roomType === 'locked' &&
    (password.trim().length < 4 || password.length > 64)) {
      return res.status(400).json({
        error: 'A new locked-room password must be 4 to 64 characters.'
      });
    }

    const passwordHash = roomType === 'locked'
      ? await makePasswordHash(password)
      : null;

    const { data, error } = await supabase
      .from('talkzy_rooms')
      .update({ room_type: roomType, password_hash: passwordHash })
      .eq('id', room.id)
      .select('id, room_name, description, room_type, status')
      .single();

    if (error) throw error;

    res.json({ room: data });
  } catch (error) {
    console.error('Could not change room privacy:', error.message);
    res.status(500).json({ error: 'Could not change room privacy.' });
  }
});

// Add a room admin. The target user must already be a room member.
app.post('/api/rooms/:roomId/admins', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') {
  return res.status(409).json({
    error: 'Cannot manage admins in a closed room.'
  });
    }

    if (room.owner_id !== req.talkzyUser.id) {
      return res.status(403).json({ error: 'Only the room owner can appoint admins.' });
    }

    const userId = String(req.body?.userId || '').trim();

    if (!userId || userId === room.owner_id) {
      return res.status(400).json({ error: 'Enter a valid member user ID.' });
    }

    if (!await isRoomMember(room.id, userId)) {
      return res.status(400).json({ error: 'That user must join the room before becoming an admin.' });
    }

    const { error } = await supabase
      .from('talkzy_room_admins')
      .upsert(
        { room_id: room.id, user_id: userId },
        { onConflict: 'room_id,user_id' }
      );

    if (error) throw error;

    res.status(201).json({ adminAdded: true, userId });
  } catch (error) {
    console.error('Could not add room admin:', error.message);
    res.status(500).json({ error: 'Could not add this room admin.' });
  }
});

// Remove a room admin. Only the owner can do this.
app.delete('/api/rooms/:roomId/admins/:userId', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
        if (room.status !== 'active') {
      return res.status(409).json({
        error: 'Cannot manage admins in a closed room.'
      });
        }

    if (room.owner_id !== req.talkzyUser.id) {
      return res.status(403).json({ error: 'Only the room owner can remove admins.' });
    }

    const { error } = await supabase
      .from('talkzy_room_admins')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', req.params.userId);

    if (error) throw error;

    res.json({ adminRemoved: true });
  } catch (error) {
    console.error('Could not remove room admin:', error.message);
    res.status(500).json({ error: 'Could not remove this room admin.' });
  }
});

// Promote a member to speaker or return them to listener. Owner/admin only.
app.patch('/api/rooms/:roomId/members/:userId/role', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') {
  return res.status(409).json({
    error: 'Cannot manage members in a closed room.'
  });
    }

    if (!await canManageRoom(room, req.talkzyUser.id)) {
      return res.status(403).json({ error: 'Only the owner or a room admin can manage speakers.' });
    }

    const role = String(req.body?.role || '');
    if (!['listener', 'speaker'].includes(role)) {
      return res.status(400).json({ error: 'Role must be listener or speaker.' });
    }

    if (req.params.userId === room.owner_id) {
  return res.status(400).json({
    error: 'The room owner role cannot be changed.'
  });
}
    
    const { data, error } = await supabase
      .from('talkzy_room_members')
      .update({ role })
      .eq('room_id', room.id)
      .eq('user_id', req.params.userId)
      .select('room_id, user_id, role')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Room member not found.' });
    }

    res.json({ member: data });
  } catch (error) {
    console.error('Could not change member role:', error.message);
    res.status(500).json({ error: 'Could not change member role.' });
  }
});

// Remove a member from a room. Owner or admin only.
app.delete('/api/rooms/:roomId/members/:userId', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (!await canManageRoom(room, req.talkzyUser.id)) {
      return res.status(403).json({ error: 'Only the owner or a room admin can remove members.' });
    }

    if (req.params.userId === room.owner_id) {
      return res.status(400).json({ error: 'The room owner cannot be removed.' });
    }

    const { error } = await supabase
      .from('talkzy_room_members')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', req.params.userId);

    if (error) throw error;

    await supabase
      .from('talkzy_room_admins')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', req.params.userId);

    res.json({ removed: true });
  } catch (error) {
    console.error('Could not remove room member:', error.message);
    res.status(500).json({ error: 'Could not remove room member.' });
  }
});

// List room members.
app.get('/api/rooms/:roomId/members', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') {
  return res.status(409).json({
    error: 'This room is closed.'
  });
    }

    const userId = req.talkzyUser.id;
    const allowed = await canManageRoom(room, userId) ||
      await isRoomMember(room.id, userId);

    if (!allowed) {
      return res.status(403).json({ error: 'Join the room to view its members.' });
    }

    const { data, error } = await supabase
      .from('talkzy_room_members')
      .select('user_id, role, joined_at')
      .eq('room_id', room.id);

    if (error) throw error;

    const userIds = (data || []).map(member => member.user_id);
    const { data: profiles, error: profileError } = userIds.length
      ? await supabase.from('talkzy_profiles')
          .select('id, talkzy_id, display_name, avatar_url, country')
          .in('id', userIds)
      : { data: [], error: null };
    if (profileError) throw profileError;
    const { data: adminRows, error: adminRowsError } = await supabase.from('talkzy_room_admins')
      .select('user_id').eq('room_id', room.id);
    if (adminRowsError) throw adminRowsError;
    const adminIds = new Set((adminRows || []).map(item => item.user_id));
    const membersWithProfiles = (data || []).map(member => {
      const profile = (profiles || []).find(item => item.id === member.user_id);
      return {
        ...member,
        talkzy_id: profile?.talkzy_id || null,
        display_name: profile?.display_name || 'TALKZY User',
        avatar_url: profile?.avatar_url || null,
        country: profile?.country || null,
        is_admin: adminIds.has(member.user_id)
      };
    });
    res.set('Cache-Control', 'no-store').json({ members: membersWithProfiles });
  } catch (error) {
    console.error('Could not load room members:', error.message);
    res.status(500).json({ error: 'Could not load room members.' });
  }
});

// =========================================
// ROOM CREATOR SETTINGS, ADMIN/KICK LISTS AND ROOM ACTIVITIES
// =========================================

app.get('/api/rooms/:roomId/settings', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can view these settings.' });
    const { data, error } = await supabase.from('talkzy_room_settings')
      .select('tourists_on_mic, tourists_send_text, tourists_send_pic, updated_at')
      .eq('room_id', room.id).maybeSingle();
    if (error) throw error;
    res.set('Cache-Control', 'no-store').json({
      room: { id: room.id, room_name: room.room_name, description: room.description,
        room_dp_url: room.room_dp_url, room_type: room.room_type },
      settings: data || { tourists_on_mic: true, tourists_send_text: true, tourists_send_pic: false }
    });
  } catch (error) {
    console.error('Could not load room settings:', error.message);
    res.status(500).json({ error: 'Could not load room settings.' });
  }
});

app.patch('/api/rooms/:roomId/settings', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can change settings.' });
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });

    const body = req.body || {};
    const patch = {};
    if (body.roomName !== undefined) {
      const value = String(body.roomName).trim();
      if (!value || value.length > 40) return res.status(400).json({ error: 'Room name must be 1–40 characters.' });
      patch.room_name = value;
    }
    if (body.announcement !== undefined) {
      const value = String(body.announcement);
      if (value.length > 240) return res.status(400).json({ error: 'Announcement must be 240 characters or fewer.' });
      patch.description = value.trim();
    }
    if (body.roomDpUrl !== undefined) {
      const value = body.roomDpUrl === null ? null : String(body.roomDpUrl).trim();
      if (value && !/^https:\/\/\S+$/i.test(value)) return res.status(400).json({ error: 'Room DP must be a secure image URL.' });
      patch.room_dp_url = value;
    }
    let nextType = room.room_type;
    if (body.roomType !== undefined) {
      if (!['public','locked'].includes(body.roomType)) return res.status(400).json({ error: 'Room type must be public or locked.' });
      nextType = body.roomType;
    }
    let passwordHash = room.password_hash;
    if (body.password !== undefined && String(body.password).length) {
      const password = String(body.password);
      if (password.length < 4 || password.length > 64) return res.status(400).json({ error: 'Room password must be 4–64 characters.' });
      passwordHash = await makePasswordHash(password);
      nextType = 'locked';
    }
    if (nextType === 'locked' && !passwordHash) {
      return res.status(400).json({ error: 'Set a room password before switching this room to locked.' });
    }
    if (nextType === 'public') passwordHash = null;
    if (body.roomType !== undefined || body.password !== undefined) {
      patch.room_type = nextType;
      patch.password_hash = passwordHash;
    }
    const approval = {};
    for (const [key, column] of [
      ['touristsOnMic','tourists_on_mic'],
      ['touristsSendText','tourists_send_text'],
      ['touristsSendPic','tourists_send_pic']
    ]) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== 'boolean') return res.status(400).json({ error: key + ' must be true or false.' });
        approval[column] = body[key];
      }
    }
    let updatedRoom = room;
    if (Object.keys(patch).length) {
      const { data, error } = await supabase.from('talkzy_rooms').update(patch)
        .eq('id', room.id).eq('owner_id', req.talkzyUser.id)
        .select('id, owner_id, room_name, description, room_dp_url, room_type')
        .single();
      if (error) throw error;
      updatedRoom = data;
    }
    let settings = null;
    if (Object.keys(approval).length) {
      const { data, error } = await supabase.from('talkzy_room_settings')
        .upsert({ room_id: room.id, ...approval, updated_at: new Date().toISOString() }, { onConflict: 'room_id' })
        .select('tourists_on_mic, tourists_send_text, tourists_send_pic, updated_at').single();
      if (error) throw error;
      settings = data;
    } else {
      const { data, error } = await supabase.from('talkzy_room_settings')
        .select('tourists_on_mic, tourists_send_text, tourists_send_pic, updated_at')
        .eq('room_id', room.id).maybeSingle();
      if (error) throw error;
      settings = data || { tourists_on_mic: true, tourists_send_text: true, tourists_send_pic: false };
    }
    res.set('Cache-Control', 'no-store').json({ room: updatedRoom, settings });
  } catch (error) {
    console.error('Could not save room settings:', error.message);
    res.status(500).json({ error: 'Could not save room settings.' });
  }
});

app.get('/api/rooms/:roomId/admins', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can manage administrators.' });
    const { data, error } = await supabase.from('talkzy_room_admins')
      .select('user_id, created_at').eq('room_id', room.id).order('created_at', { ascending: false });
    if (error) throw error;
    const ids = (data || []).map(x => x.user_id);
    const { data: profiles, error: profileError } = ids.length
      ? await supabase.from('talkzy_profiles').select('id, talkzy_id, display_name, avatar_url').in('id', ids)
      : { data: [], error: null };
    if (profileError) throw profileError;
    res.json({ admins: (data || []).map(x => ({ ...x, ...(profiles || []).find(p => p.id === x.user_id) })) });
  } catch (error) {
    console.error('Could not load room admins:', error.message);
    res.status(500).json({ error: 'Could not load room administrators.' });
  }
});

app.get('/api/rooms/:roomId/kicklist', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can view the kick list.' });
    const { data, error } = await supabase.from('talkzy_room_kicklist')
      .select('user_id, kicked_by, reason, created_at').eq('room_id', room.id).order('created_at', { ascending: false });
    if (error) throw error;
    const ids = (data || []).map(x => x.user_id);
    const { data: profiles, error: profileError } = ids.length
      ? await supabase.from('talkzy_profiles').select('id, talkzy_id, display_name, avatar_url').in('id', ids)
      : { data: [], error: null };
    if (profileError) throw profileError;
    res.json({ kicked: (data || []).map(x => ({ ...x, ...(profiles || []).find(p => p.id === x.user_id) })) });
  } catch (error) {
    console.error('Could not load room kick list:', error.message);
    res.status(500).json({ error: 'Could not load the kick list.' });
  }
});

app.delete('/api/rooms/:roomId/kicklist/:userId', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can remove people from the kick list.' });
    const { error } = await supabase.from('talkzy_room_kicklist').delete()
      .eq('room_id', room.id).eq('user_id', req.params.userId);
    if (error) throw error;
    res.json({ removed: true });
  } catch (error) {
    console.error('Could not update room kick list:', error.message);
    res.status(500).json({ error: 'Could not update the kick list.' });
  }
});

app.post('/api/rooms/:roomId/members/:userId/kick', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can kick members.' });
    if (req.params.userId === room.owner_id) return res.status(400).json({ error: 'The room creator cannot be kicked.' });
    const reason = String(req.body?.reason || '').trim().slice(0, 200);
    const { error: insertError } = await supabase.from('talkzy_room_kicklist')
      .upsert({ room_id: room.id, user_id: req.params.userId, kicked_by: req.talkzyUser.id, reason },
        { onConflict: 'room_id,user_id' });
    if (insertError) throw insertError;
    const { error: memberError } = await supabase.from('talkzy_room_members').delete()
      .eq('room_id', room.id).eq('user_id', req.params.userId);
    if (memberError) throw memberError;
    await supabase.from('talkzy_room_admins').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    await supabase.from('talkzy_room_mic_seats').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    res.json({ kicked: true });
  } catch (error) {
    console.error('Could not kick room member:', error.message);
    res.status(500).json({ error: 'Could not kick room member.' });
  }
});

app.get('/api/rooms/:roomId/activities', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    const owner = room.owner_id === req.talkzyUser.id;
    const member = owner || await isRoomMember(room.id, req.talkzyUser.id);
    if (!member) return res.status(403).json({ error: 'Join the room to view its activities.' });
    let query = supabase.from('talkzy_room_activities')
      .select('id, room_id, created_by, title, description, poster_url, starts_at, ends_at, status, published_at, created_at')
      .eq('room_id', room.id).order('starts_at', { ascending: true, nullsFirst: false });
    if (!owner) query = query.in('status', ['published','completed']);
    const { data, error } = await query;
    if (error) throw error;
    res.set('Cache-Control', 'no-store').json({ activities: data || [] });
  } catch (error) {
    console.error('Could not load room activities:', error.message);
    res.status(500).json({ error: 'Could not load room activities.' });
  }
});

app.post('/api/rooms/:roomId/activities', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can create room activities.' });
    const title = String(req.body?.title || '').trim();
    const description = String(req.body?.description || '').trim();
    const posterUrl = req.body?.posterUrl ? String(req.body.posterUrl).trim() : null;
    if (!title || title.length > 100) return res.status(400).json({ error: 'Activity title must be 1–100 characters.' });
    if (posterUrl && !/^https:\/\/\S+$/i.test(posterUrl)) return res.status(400).json({ error: 'Poster must be a secure image URL.' });
    const { data, error } = await supabase.from('talkzy_room_activities').insert({
      room_id: room.id, created_by: req.talkzyUser.id, title, description,
      poster_url: posterUrl, starts_at: req.body?.startsAt || null, ends_at: req.body?.endsAt || null
    }).select('*').single();
    if (error) throw error;
    res.status(201).json({ activity: data });
  } catch (error) {
    console.error('Could not create room activity:', error.message);
    res.status(500).json({ error: 'Could not create room activity.' });
  }
});

app.patch('/api/rooms/:roomId/activities/:activityId', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can edit activities.' });
    const { data: existing, error: readError } = await supabase.from('talkzy_room_activities')
      .select('*').eq('id', req.params.activityId).eq('room_id', room.id).maybeSingle();
    if (readError) throw readError;
    if (!existing) return res.status(404).json({ error: 'Room activity not found.' });
    if (existing.status !== 'draft') return res.status(409).json({ error: 'Published activities are locked. Their poster cannot be changed.' });
    const patch = {};
    if (req.body?.title !== undefined) patch.title = String(req.body.title).trim();
    if (req.body?.description !== undefined) patch.description = String(req.body.description).trim();
    if (req.body?.posterUrl !== undefined) patch.poster_url = req.body.posterUrl || null;
    if (req.body?.startsAt !== undefined) patch.starts_at = req.body.startsAt || null;
    if (req.body?.endsAt !== undefined) patch.ends_at = req.body.endsAt || null;
    const { data, error } = await supabase.from('talkzy_room_activities').update(patch)
      .eq('id', existing.id).select('*').single();
    if (error) throw error;
    res.json({ activity: data });
  } catch (error) {
    if (/PUBLISHED_POSTER_LOCKED/.test(error.message || '')) return res.status(409).json({ error: 'A published activity poster cannot be changed.' });
    console.error('Could not update room activity:', error.message);
    res.status(500).json({ error: 'Could not update room activity.' });
  }
});

app.post('/api/rooms/:roomId/activities/:activityId/publish', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can publish activities.' });
    const { data, error } = await supabase.from('talkzy_room_activities')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', req.params.activityId).eq('room_id', room.id).eq('status', 'draft')
      .select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(409).json({ error: 'Only a draft activity can be published.' });
    res.json({ activity: data });
  } catch (error) {
    console.error('Could not publish room activity:', error.message);
    res.status(500).json({ error: 'Could not publish room activity.' });
  }
});

app.post('/api/rooms/:roomId/activities/:activityId/complete', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can complete activities.' });
    const { data, error } = await supabase.from('talkzy_room_activities')
      .update({ status: 'completed' })
      .eq('id', req.params.activityId).eq('room_id', room.id).eq('status', 'published')
      .select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(409).json({ error: 'Only a published activity can be marked completed.' });
    res.json({ activity: data });
  } catch (error) {
    console.error('Could not complete room activity:', error.message);
    res.status(500).json({ error: 'Could not complete room activity.' });
  }
});

app.delete('/api/rooms/:roomId/activities/:activityId', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can delete activities.' });
    const { data, error } = await supabase.from('talkzy_room_activities').delete()
      .eq('id', req.params.activityId).eq('room_id', room.id).eq('status', 'draft')
      .select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(409).json({ error: 'Only draft activities can be deleted.' });
    res.json({ deleted: true });
  } catch (error) {
    console.error('Could not delete room activity:', error.message);
    res.status(500).json({ error: 'Could not delete room activity.' });
  }
});

// =========================================
// TALKZY MICROPHONE SEAT API
// =========================================

// GET ROOM MICROPHONE SEATS
app.get('/api/rooms/:roomId/mic-seats', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.status !== 'active') {
      return res.status(409).json({ error: 'This room is closed.' });
    }

    const userId = req.talkzyUser.id;
    const allowed = await canManageRoom(room, userId) ||
      await isRoomMember(room.id, userId);

    if (!allowed) {
      return res.status(403).json({ error: 'Join the room first.' });
    }

    const { data: roomSettings, error: settingsError } = await supabase
  .from('talkzy_rooms')
  .select('mic_count, mic_layout')
  .eq('id', room.id)
  .single();

if (settingsError) throw settingsError;

const { data, error } = await supabase
  .from('talkzy_room_mic_seats')
  .select('room_id, seat_number, user_id, is_muted, updated_at')
  .eq('room_id', room.id)
  .order('seat_number');


if (error) throw error;

// LOAD PROFILES OF MICROPHONE SEAT OCCUPANTS
const userIds = (data || []).map(seat => seat.user_id);

let profiles = [];

if (userIds.length > 0) {
  const { data: profileData, error: profileError } = await supabase
    .from('talkzy_profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);

  if (profileError) throw profileError;

  profiles = profileData || [];
}

// ATTACH PROFILE DETAILS TO EACH SEAT
const seatsWithProfiles = (data || []).map(seat => {
  const profile = profiles.find(
    item => item.id === seat.user_id
  );

  return {
    ...seat,
    display_name: profile?.display_name || 'User',
    avatar_url: profile?.avatar_url || null
  };
});

res.set('Cache-Control', 'no-store').json({
  micCount: roomSettings.mic_count,
  micLayout: roomSettings.mic_layout || 'eight',
  seats: seatsWithProfiles
});
    
  } catch (error) {
    console.error('Could not load microphone seats:', error.message);
    res.status(500).json({ error: 'Could not load microphone seats.' });
  }
});


// CHANGE ROOM MICROPHONE COUNT AND LAYOUT (OWNER ONLY)
app.patch('/api/rooms/:roomId/mic-count', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (room.owner_id !== req.talkzyUser.id) {
      return res.status(403).json({ error: 'Only the room owner can change microphone layout.' });
    }

    const micCount = req.body?.micCount;
    const micLayout = req.body?.micLayout;
    const layouts = {
      seven: 7, eight: 8, ten_couple: 10, ten_standard: 10,
      eleven: 11, twelve: 12, fourteen: 14, fifteen: 15,
      sixteen: 16, seventeen: 17
    };
    if (!Object.prototype.hasOwnProperty.call(layouts, micLayout) || layouts[micLayout] !== micCount) {
      return res.status(400).json({ error: 'Choose a valid microphone layout and matching seat count.' });
    }

    // The RPC changes room settings and removes excess seats atomically.
    const { data, error } = await supabase.rpc('talkzy_set_room_mic_count', {
      p_room_id: room.id,
      p_user_id: req.talkzyUser.id,
      p_mic_count: micCount,
      p_mic_layout: micLayout
    });

    if (error) {
      if (/OWNER_ONLY/.test(error.message || '')) {
        return res.status(403).json({ error: 'Only the room owner can change microphone layout.' });
      }
      if (/ROOM_NOT_FOUND/.test(error.message || '')) {
        return res.status(409).json({ error: 'This room is no longer active.' });
      }
      if (error.code === '42883' || /talkzy_set_room_mic_count|mic_layout/i.test(error.message || '')) {
        return res.status(503).json({ error: 'Room layout database migration is required before this setting can be used.' });
      }
      throw error;
    }

    res.set('Cache-Control', 'no-store').json({
      success: true,
      micCount: data.micCount,
      micLayout: data.micLayout
    });
  } catch (error) {
    console.error('Could not change microphone layout:', error.message);
    res.status(500).json({ error: 'Could not change microphone layout.' });
  }
});

// TAKE OR SWITCH MICROPHONE SEAT
app.post('/api/rooms/:roomId/mic-seats/:seatNumber', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    if (room.status !== 'active') {
      return res.status(409).json({ error: 'This room is closed.' });
    }

    const userId = req.talkzyUser.id;
    const allowed = await canManageRoom(room, userId) ||
      await isRoomMember(room.id, userId);

    if (!allowed) {
      return res.status(403).json({ error: 'Join the room first.' });
    }

    const seatNumber = Number(req.params.seatNumber);

    const { data: roomSettings, error: settingsError } = await supabase
  .from('talkzy_rooms')
  .select('mic_count')
  .eq('id', room.id)
  .single();

if (settingsError) throw settingsError;

if (
  !Number.isInteger(seatNumber) ||
  seatNumber < 1 ||
  seatNumber > roomSettings.mic_count
) {
  return res.status(400).json({
    error: `Choose a seat from 1 to ${roomSettings.mic_count}.`
  });
}

    const { data, error } = await supabase.rpc('talkzy_take_mic_seat', {
      p_room_id: room.id,
      p_seat_number: seatNumber,
      p_user_id: userId
    });

    if (error) {
      if (error.message.includes('SEAT_TAKEN')) {
        return res.status(409).json({ error: 'This microphone is already occupied.' });
      }

      if (error.message.includes('INVALID_SEAT')) {
        return res.status(400).json({ error: 'Invalid microphone seat.' });
      }

      throw error;
    }

    res.set('Cache-Control', 'no-store').json({
      success: true,
      seat: data
    });
  } catch (error) {
    console.error('Could not take microphone seat:', error.message);
    res.status(500).json({ error: 'Could not take microphone seat.' });
  }
});


// LEAVE MICROPHONE SEAT
app.delete('/api/rooms/:roomId/mic-seats', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    const { error } = await supabase
      .from('talkzy_room_mic_seats')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', req.talkzyUser.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Could not leave microphone seat:', error.message);
    res.status(500).json({ error: 'Could not leave microphone seat.' });
  }
});


// MUTE OR UNMUTE MICROPHONE
app.patch('/api/rooms/:roomId/mic-seats/mute', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;

    const isMuted = req.body?.isMuted;

    if (typeof isMuted !== 'boolean') {
      return res.status(400).json({ error: 'Mute status must be true or false.' });
    }

    const { data, error } = await supabase
      .from('talkzy_room_mic_seats')
      .update({
        is_muted: isMuted,
        updated_at: new Date().toISOString()
      })
      .eq('room_id', room.id)
      .eq('user_id', req.talkzyUser.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'You are not occupying a microphone seat.' });
    }

    res.json({ success: true, seat: data });
  } catch (error) {
    console.error('Could not update microphone mute status:', error.message);
    res.status(500).json({ error: 'Could not update microphone mute status.' });
  }
});
      
// Handle unexpected errors.
app.use((error, req, res, next) => {
  console.error('Unexpected server error:', error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TALKZY owner backend listening on port ${PORT}`);
});

