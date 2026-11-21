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

const roomEntryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many room entry/password attempts. Wait 15 minutes and try again.' }
});

const roomMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'You are sending messages too quickly. Please wait a moment.' }
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
    .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, closed_at, room_talkzy_id, country_name')
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

async function isRoomVisitor(roomId, userId) {
  const { data, error } = await supabase
    .from('talkzy_room_visitors')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .gt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function getRoomTouristPermissions(roomId) {
  const { data, error } = await supabase.from('talkzy_room_settings')
    .select('tourists_on_mic, tourists_send_text, tourists_send_pic')
    .eq('room_id', roomId).maybeSingle();
  if (error) throw error;
  return data || { tourists_on_mic: true, tourists_send_text: true, tourists_send_pic: false };
}

async function canEnterRoom(room, userId) {
  if (!room || room.status !== 'active') return false;
  return room.owner_id === userId ||
    await isRoomAdmin(room.id, userId) ||
    await isRoomMember(room.id, userId) ||
    await isRoomVisitor(room.id, userId);
}

async function canManageRoom(room, userId) {
  if (!room || room.status !== 'active') return false;
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

async function removeUserRoomMusic(roomId, userId) {
  const { data: previous, error: readError } = await supabase.from('talkzy_room_music_state')
    .select('queue').eq('room_id', roomId).eq('user_id', userId).maybeSingle();
  if (readError) throw readError;
  const paths = (Array.isArray(previous?.queue) ? previous.queue : [])
    .map(item => item?.object_path)
    .filter(path => typeof path === 'string' && path.startsWith(`${userId}/${roomId}/`) && !path.includes('..'));
  const { error: deleteError } = await supabase.from('talkzy_room_music_state')
    .delete().eq('room_id', roomId).eq('user_id', userId);
  if (deleteError) throw deleteError;
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from('talkzy-room-music').remove(paths);
    if (storageError) throw storageError;
  }
}

async function clearUserRoomChat(roomId, userId) {
  const { error } = await supabase.from('talkzy_room_chat_clears')
    .upsert({ room_id: roomId, user_id: userId, cleared_at: new Date().toISOString() }, { onConflict: 'room_id,user_id' });
  if (error) throw error;
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
    // Fetch the owner's room history once. Active rooms are displayed in Mine,
    // while any historical room keeps the one-time creation restriction in place.
    const { data: ownedRooms, error } = await supabase
      .from('talkzy_rooms')
      .select('id, owner_id, room_name, description, room_dp_url, room_type, status, created_at, room_talkzy_id, country_name')
      .eq('owner_id', req.talkzyUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const allOwnedRooms = ownedRooms || [];
    const activeRooms = allOwnedRooms.filter(room => room.status === 'active');

    res.set('Cache-Control', 'no-store').json({
      rooms: activeRooms,
      count: activeRooms.length,
      hasEverCreatedRoom: allOwnedRooms.length > 0
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
    if (passwordHash) {
      const { error: passwordError } = await supabase.from('talkzy_room_passwords')
        .insert({ room_id: data.id, password_hash: passwordHash });
      if (passwordError) {
        await supabase.from('talkzy_rooms').delete().eq('id', data.id);
        throw passwordError;
      }
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

// ENTER A PUBLIC/LOCKED ROOM AS A VISITOR WITHOUT CREATING MEMBERSHIP
app.post('/api/rooms/:roomId/visit', userAuth, roomEntryLimiter, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const userId = req.talkzyUser.id;
    const { data: kicked, error: kickError } = await supabase.from('talkzy_room_kicklist')
      .select('user_id').eq('room_id', room.id).eq('user_id', userId).maybeSingle();
    if (kickError) throw kickError;
    if (kicked) return res.status(403).json({ error: 'You are on this room’s Kick List.' });
    if (room.owner_id === userId || await isRoomAdmin(room.id, userId) || await isRoomMember(room.id, userId)) {
      return res.status(200).json({ visited: true, mode: 'member', roomId: room.id });
    }
    if (room.room_type === 'locked') {
      const password = String(req.body?.password || '');
      const { data, error } = await supabase.from('talkzy_room_passwords').select('password_hash').eq('room_id', room.id).maybeSingle();
      if (error) throw error;
      if (!data || !await checkPassword(password, data.password_hash)) return res.status(403).json({ error: 'Incorrect room password.' });
    }
    const { error } = await supabase.from('talkzy_room_visitors').upsert({
      room_id: room.id, user_id: userId, visited_at: new Date().toISOString(), last_seen_at: new Date().toISOString()
    }, { onConflict: 'room_id,user_id' });
    if (error) throw error;
    res.json({ visited: true, mode: 'tourist', roomId: room.id });
  } catch (error) {
    console.error('Could not enter room as tourist:', error.message);
    res.status(500).json({ error: 'Could not enter this room as a tourist.' });
  }
});

app.post('/api/rooms/:roomId/visit/ping', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const { data, error } = await supabase.from('talkzy_room_visitors')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('room_id', room.id).eq('user_id', req.talkzyUser.id)
      .select('room_id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(403).json({ error: 'Your tourist visit has expired. Re-enter the room.' });
    res.json({ active: true });
  } catch (error) {
    console.error('Could not refresh tourist visit:', error.message);
    res.status(500).json({ error: 'Could not refresh your room visit.' });
  }
});

app.post('/api/rooms/:roomId/leave-visit', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    const userId = req.talkzyUser.id;
    await clearUserRoomChat(room.id, userId);
    const { error: seatError } = await supabase.from('talkzy_room_mic_seats')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (seatError) throw seatError;
    const { error } = await supabase.from('talkzy_room_visitors').delete()
      .eq('room_id', room.id).eq('user_id', userId);
    if (error) throw error;
    const { error: presenceError } = await supabase.from('talkzy_room_presence').delete()
      .eq('room_id', room.id).eq('user_id', userId);
    if (presenceError) throw presenceError;
    await removeUserRoomMusic(room.id, userId);
    res.json({ left: true });
  } catch (error) {
    console.error('Could not leave tourist visit:', error.message);
    res.status(500).json({ error: 'Could not leave this room.' });
  }
});

app.get('/api/rooms/:roomId/messages', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!await canEnterRoom(room, req.talkzyUser.id)) return res.status(403).json({ error: 'Enter the room first.' });
    const { data: clearMarker, error: markerError } = await supabase.from('talkzy_room_chat_clears')
      .select('cleared_at').eq('room_id', room.id).eq('user_id', req.talkzyUser.id).maybeSingle();
    if (markerError) throw markerError;
    let messageQuery = supabase.from('talkzy_room_messages')
      .select('id, sender_id, message_type, message_text, image_url, created_at')
      .eq('room_id', room.id).order('created_at', { ascending: false }).limit(100);
    if (clearMarker?.cleared_at) messageQuery = messageQuery.gt('created_at', clearMarker.cleared_at);
    const { data, error } = await messageQuery;
    if (error) throw error;
    const ids = [...new Set((data || []).map(m => m.sender_id))];
    const { data: profiles, error: profileError } = ids.length
      ? await supabase.from('talkzy_profiles').select('id, display_name, avatar_url, talkzy_id').in('id', ids)
      : { data: [], error: null };
    if (profileError) throw profileError;
    const latestMessagesChronological = (data || []).slice().reverse();
    res.set('Cache-Control', 'no-store').json({ messages: latestMessagesChronological.map(m => ({
      ...m, sender: (profiles || []).find(p => p.id === m.sender_id) || null
    })) });
  } catch (error) {
    console.error('Could not load room messages:', error.message);
    res.status(500).json({ error: 'Could not load room messages.' });
  }
});

app.delete('/api/rooms/:roomId/messages', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!(await canManageRoom(room, req.talkzyUser.id))) {
      return res.status(403).json({ error: 'Only the room owner or an admin can clear room chat.' });
    }

    const { data: existing, error: readError } = await supabase.from('talkzy_room_messages')
      .select('id, image_url').eq('room_id', room.id);
    if (readError) throw readError;

    const { error: deleteError } = await supabase.from('talkzy_room_messages')
      .delete().eq('room_id', room.id);
    if (deleteError) throw deleteError;

    const publicPrefix = '/storage/v1/object/public/talkzy-rooms/';
    const imagePaths = (existing || []).map(item => {
      const url = String(item.image_url || '');
      const index = url.indexOf(publicPrefix);
      if (index < 0) return null;
      try { return decodeURIComponent(url.slice(index + publicPrefix.length).split('?')[0]); }
      catch { return null; }
    }).filter(Boolean);
    if (imagePaths.length) {
      const { error: storageError } = await supabase.storage.from('talkzy-rooms').remove(imagePaths);
      if (storageError) console.error('Could not remove cleared room chat images:', storageError.message);
    }

    res.json({ cleared: true, deletedCount: (existing || []).length });
  } catch (error) {
    console.error('Could not clear room chat:', error.message);
    res.status(500).json({ error: 'Could not clear room chat.' });
  }
});

app.post('/api/rooms/:roomId/messages', userAuth, roomMessageLimiter, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const userId = req.talkzyUser.id;
    const member = room.owner_id === userId || await isRoomAdmin(room.id, userId) || await isRoomMember(room.id, userId);
    const tourist = !member && await isRoomVisitor(room.id, userId);
    if (!member && !tourist) return res.status(403).json({ error: 'Enter the room first.' });
    const type = req.body?.type === 'image' ? 'image' : 'text';
    const permissions = tourist ? await getRoomTouristPermissions(room.id) : null;
    if (tourist && type === 'text' && !permissions.tourists_send_text) return res.status(403).json({ error: 'The room owner has disabled text messages for tourists.' });
    if (tourist && type === 'image' && !permissions.tourists_send_pic) return res.status(403).json({ error: 'The room owner has disabled picture sharing for tourists.' });
    const messageText = type === 'text' ? String(req.body?.text || '').trim() : '';
    const imageUrl = type === 'image' ? String(req.body?.imageUrl || '').trim() : null;
    if (type === 'text' && (!messageText || messageText.length > 1000)) return res.status(400).json({ error: 'Text must be 1–1000 characters.' });
    if (type === 'image' && !/^https:\/\/\S+$/i.test(imageUrl || '')) return res.status(400).json({ error: 'A secure image URL is required.' });
    const { data, error } = await supabase.from('talkzy_room_messages').insert({
      room_id: room.id, sender_id: userId, message_type: type, message_text: messageText, image_url: imageUrl
    }).select('id, sender_id, message_type, message_text, image_url, created_at').single();
    if (error) throw error;
    res.status(201).json({ message: data });
  } catch (error) {
    console.error('Could not send room message:', error.message);
    res.status(500).json({ error: 'Could not send room message.' });
  }
});

app.post('/api/rooms/:roomId/join', userAuth, roomEntryLimiter, async (req, res) => {
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
      const { data, error } = await supabase.from('talkzy_room_passwords')
        .select('password_hash').eq('room_id', room.id).maybeSingle();
      if (error) throw error;

      const valid = Boolean(data) && await checkPassword(password, data.password_hash);
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
    await supabase.from('talkzy_room_visitors').delete().eq('room_id', room.id).eq('user_id', userId);

    return res.status(200).json({ joined: true, roomId: room.id, mode: 'member' });
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

    // Clear this user's chat history cutoff and all room-bound live state.
    await clearUserRoomChat(room.id, userId);
    const { error: memberError } = await supabase.from('talkzy_room_members')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (memberError) throw memberError;
    const { error: seatError } = await supabase.from('talkzy_room_mic_seats')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (seatError) throw seatError;
    const { error: visitorError } = await supabase.from('talkzy_room_visitors')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (visitorError) throw visitorError;
    const { error: presenceError } = await supabase.from('talkzy_room_presence')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (presenceError) throw presenceError;
    await removeUserRoomMusic(room.id, userId);

    return res.json({ left: true, roomId: room.id });

  } catch (error) {
    console.error('Could not leave room:', error.message);
    return res.status(500).json({
      error: 'Could not leave this room.'
    });
  }
});


// =========================================
// CLOSE ROOM — MAIN OWNER ONLY
// =========================================

app.post('/api/rooms/:roomId/close', ownerAuth, async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const { data: room, error: roomError } = await supabase
      .from('talkzy_rooms')
      .select('id, status')
      .eq('id', roomId)
      .maybeSingle();
    if (roomError) throw roomError;
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    if (room.status === 'closed') {
      return res.json({ closed: true, roomId, alreadyClosed: true });
    }

    const { error: closeError } = await supabase
      .from('talkzy_rooms')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', roomId)
      .eq('status', 'active');
    if (closeError) throw closeError;

    // Remove live presence and mic occupancy so the closed room is not
    // represented as active anywhere in the app.
    const { data: musicRows, error: musicReadError } = await supabase.from('talkzy_room_music_state')
      .select('queue').eq('room_id', roomId);
    if (musicReadError) console.error('Room closed but music read cleanup failed:', musicReadError.message);
    const musicPaths = (musicRows || []).flatMap(row => Array.isArray(row.queue) ? row.queue.map(item => item?.object_path) : [])
      .filter(path => typeof path === 'string' && !path.includes('..'));
    const musicCleanup = await supabase.from('talkzy_room_music_state').delete().eq('room_id', roomId);
    if (musicCleanup.error) console.error('Room closed but music state cleanup failed:', musicCleanup.error.message);
    if (musicPaths.length) {
      const { error: musicStorageError } = await supabase.storage.from('talkzy-room-music').remove(musicPaths);
      if (musicStorageError) console.error('Room closed but music files cleanup failed:', musicStorageError.message);
    }
    await supabase.from('talkzy_room_youtube_state').delete().eq('room_id', roomId);

    const cleanupResults = await Promise.all([
      supabase.from('talkzy_room_mic_seats').delete().eq('room_id', roomId),
      supabase.from('talkzy_room_presence').delete().eq('room_id', roomId),
      supabase.from('talkzy_room_visitors').delete().eq('room_id', roomId)
    ]);
    const cleanupError = cleanupResults.find(result => result.error)?.error;
    if (cleanupError) console.error('Room closed but presence cleanup incomplete:', cleanupError.message);

    return res.json({ closed: true, roomId });
  } catch (error) {
    console.error('Could not close room:', error.message);
    return res.status(500).json({ error: 'Could not close room.' });
  }
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

    const passwordHash = roomType === 'locked' ? await makePasswordHash(password) : null;
    if (roomType === 'locked') {
      const { error: passwordError } = await supabase.from('talkzy_room_passwords')
        .upsert({ room_id: room.id, password_hash: passwordHash }, { onConflict: 'room_id' });
      if (passwordError) throw passwordError;
    }

    const { data, error } = await supabase.from('talkzy_rooms')
      .update({ room_type: roomType })
      .eq('id', room.id)
      .select('id, room_name, description, room_type, status')
      .single();
    if (error) throw error;

    if (roomType === 'public') {
      const { error: deletePasswordError } = await supabase.from('talkzy_room_passwords')
        .delete().eq('room_id', room.id);
      if (deletePasswordError) throw deletePasswordError;
    }
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

    const { error } = await supabase.from('talkzy_room_members')
      .delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (error) throw error;

    const { error: adminError } = await supabase.from('talkzy_room_admins')
      .delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (adminError) throw adminError;
    await clearUserRoomChat(room.id, req.params.userId);
    const { error: seatError } = await supabase.from('talkzy_room_mic_seats')
      .delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (seatError) throw seatError;
    const { error: visitorError } = await supabase.from('talkzy_room_visitors')
      .delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (visitorError) throw visitorError;
    const { error: presenceError } = await supabase.from('talkzy_room_presence')
      .delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (presenceError) throw presenceError;
    await removeUserRoomMusic(room.id, req.params.userId);
    res.json({ removed: true });
  } catch (error) {
    console.error('Could not remove room member:', error.message);
    res.status(500).json({ error: 'Could not remove room member.' });
  }
});

// Live room presence: active members, owner, admins and tourist visitors.
app.post('/api/rooms/:roomId/presence/ping', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const userId = req.talkzyUser.id;
    const owner = room.owner_id === userId;
    const admin = !owner && await isRoomAdmin(room.id, userId);
    const member = !owner && !admin && await isRoomMember(room.id, userId);
    const tourist = !owner && !admin && !member && await isRoomVisitor(room.id, userId);
    if (!owner && !admin && !member && !tourist) {
      return res.status(403).json({ error: 'Enter the room to appear in its live user list.' });
    }
    const presenceRole = owner ? 'owner' : admin ? 'admin' : tourist ? 'tourist' : 'member';
    const now = new Date().toISOString();
    const { error } = await supabase.from('talkzy_room_presence').upsert({
      room_id: room.id, user_id: userId, presence_role: presenceRole, last_seen_at: now
    }, { onConflict: 'room_id,user_id' });
    if (error) throw error;
    if (tourist) {
      const { error: visitorError } = await supabase.from('talkzy_room_visitors')
        .update({ last_seen_at: now }).eq('room_id', room.id).eq('user_id', userId);
      if (visitorError) throw visitorError;
    }
    res.json({ active: true, role: presenceRole });
  } catch (error) {
    console.error('Could not update room presence:', error.message);
    res.status(500).json({ error: 'Could not update room presence.' });
  }
});

// Personal room music streams. Each participant owns and controls only their own stream.
async function buildRoomMusicState(roomId, userId) {
  const { data: rows, error } = await supabase.from('talkzy_room_music_state')
    .select('room_id, user_id, queue, current_index, is_playing, current_time_seconds, repeat_mode, shuffle, volume, updated_at')
    .eq('room_id', roomId);
  if (error) throw error;
  const activeRows = rows || [];
  const userIds = activeRows.map(row => row.user_id);
  let profiles = [];
  if (userIds.length) {
    const { data, error: profileError } = await supabase.from('talkzy_profiles')
      .select('id, display_name, avatar_url').in('id', userIds);
    if (profileError) throw profileError;
    profiles = data || [];
  }
  const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
  const streams = [];
  for (const row of activeRows) {
    const queue = Array.isArray(row.queue) ? row.queue : [];
    const signedQueue = [];
    for (const item of queue) {
      const { data: signed, error: signError } = await supabase.storage
        .from('talkzy-room-music').createSignedUrl(item.object_path, 3600);
      if (signError) throw signError;
      signedQueue.push({ title: item.title, object_path: item.object_path, url: signed.signedUrl });
    }
    streams.push({
      user_id: row.user_id,
      display_name: profileMap.get(row.user_id)?.display_name || 'TALKZY User',
      avatar_url: profileMap.get(row.user_id)?.avatar_url || null,
      queue: signedQueue,
      current_index: row.current_index,
      is_playing: row.is_playing,
      current_time_seconds: row.current_time_seconds,
      repeat_mode: row.repeat_mode || 'off',
      shuffle: Boolean(row.shuffle),
      volume: Number(row.volume ?? 0.8),
      updated_at: row.updated_at,
      is_mine: row.user_id === userId
    });
  }
  return streams;
}

app.get('/api/rooms/:roomId/music', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!(await canEnterRoom(room, req.talkzyUser.id))) {
      return res.status(403).json({ error: 'Enter the room to hear its music streams.' });
    }
    const streams = await buildRoomMusicState(room.id, req.talkzyUser.id);
    res.set('Cache-Control', 'no-store').json({ streams });
  } catch (error) {
    console.error('Could not load room music streams:', error.message);
    res.status(500).json({ error: 'Could not load room music streams.' });
  }
});

app.put('/api/rooms/:roomId/music/me', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!(await canEnterRoom(room, req.talkzyUser.id))) {
      return res.status(403).json({ error: 'Enter the room before sharing music.' });
    }
    const body = req.body || {};
    const inputQueue = body.queue === undefined ? [] : body.queue;
    if (!Array.isArray(inputQueue) || inputQueue.length > 20) {
      return res.status(400).json({ error: 'Your music list can contain up to 20 songs.' });
    }
    const queue = [];
    for (const item of inputQueue) {
      const objectPath = String(item?.object_path || '');
      const title = String(item?.title || '').trim().slice(0, 120);
      if (!objectPath.startsWith(`${req.talkzyUser.id}/${room.id}/`) ||
          objectPath.includes('..') || !title || objectPath.length > 500) {
        return res.status(400).json({ error: 'One of your music files is invalid.' });
      }
      queue.push({ object_path: objectPath, title });
    }
    const currentIndex = Number(body.current_index ?? 0);
    if (!Number.isInteger(currentIndex) || currentIndex < 0 ||
        (queue.length ? currentIndex >= queue.length : currentIndex !== 0)) {
      return res.status(400).json({ error: 'Invalid current song selection.' });
    }
    const currentTime = Number(body.current_time_seconds ?? 0);
    if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > 86400) {
      return res.status(400).json({ error: 'Invalid music playback position.' });
    }
    const volume = Number(body.volume ?? 0.8);
    if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
      return res.status(400).json({ error: 'Invalid music volume.' });
    }
    const payload = {
      room_id: room.id,
      user_id: req.talkzyUser.id,
      queue,
      current_index: currentIndex,
      is_playing: Boolean(body.is_playing) && queue.length > 0,
      current_time_seconds: currentTime,
      repeat_mode: ['off', 'one', 'all'].includes(body.repeat_mode) ? body.repeat_mode : 'off',
      shuffle: Boolean(body.shuffle),
      volume,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('talkzy_room_music_state')
      .upsert(payload, { onConflict: 'room_id,user_id' });
    if (error) throw error;
    const streams = await buildRoomMusicState(room.id, req.talkzyUser.id);
    const state = streams.find(stream => stream.user_id === req.talkzyUser.id) || null;
    res.set('Cache-Control', 'no-store').json({ state });
  } catch (error) {
    console.error('Could not update personal room music:', error.message);
    res.status(500).json({ error: 'Could not update your room music.' });
  }
});

app.delete('/api/rooms/:roomId/music/me', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    // A user may leave the room before the component cleanup request arrives.
    // Deleting is scoped to the authenticated user's own stream below, so it is
    // safe to allow cleanup after membership/visitor status has already ended.
    const { data: previous, error: readError } = await supabase.from('talkzy_room_music_state')
      .select('queue').eq('room_id', room.id).eq('user_id', req.talkzyUser.id).maybeSingle();
    if (readError) throw readError;
    const paths = (Array.isArray(previous?.queue) ? previous.queue : [])
      .map(item => item?.object_path).filter(path => typeof path === 'string');
    const { error } = await supabase.from('talkzy_room_music_state')
      .delete().eq('room_id', room.id).eq('user_id', req.talkzyUser.id);
    if (error) throw error;
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from('talkzy-room-music').remove(paths);
      if (storageError) console.error('Could not remove stopped room music files:', storageError.message);
    }
    res.json({ stopped: true });
  } catch (error) {
    console.error('Could not stop personal room music:', error.message);
    res.status(500).json({ error: 'Could not stop your room music.' });
  }
});

// Shared YouTube room state. Any room participant can view; only owner/admin can control.
app.get('/api/rooms/:roomId/youtube', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!(await canEnterRoom(room, req.talkzyUser.id))) {
      return res.status(403).json({ error: 'Enter the room to view its YouTube player.' });
    }
    const { data, error } = await supabase.from('talkzy_room_youtube_state')
      .select('room_id, video_id, queue, is_playing, current_time_seconds, updated_by, updated_at')
      .eq('room_id', room.id).maybeSingle();
    if (error) throw error;
    res.set('Cache-Control', 'no-store').json({
      state: data || { room_id: room.id, video_id: null, queue: [], is_playing: false, current_time_seconds: 0, updated_by: null, updated_at: null }
    });
  } catch (error) {
    console.error('Could not load shared YouTube state:', error.message);
    res.status(500).json({ error: 'Could not load the room YouTube player.' });
  }
});

app.put('/api/rooms/:roomId/youtube', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (!(await canManageRoom(room, req.talkzyUser.id))) {
      return res.status(403).json({ error: 'Only the room owner or an admin can control YouTube.' });
    }
    const body = req.body || {};
    const videoId = body.video_id == null || body.video_id === '' ? null : String(body.video_id);
    if (videoId && !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Enter a valid YouTube video link or ID.' });
    }
    const queueInput = body.queue === undefined ? [] : body.queue;
    const maxQueuedItems = videoId ? 19 : 20;
    if (!Array.isArray(queueInput) || queueInput.length > maxQueuedItems) {
      return res.status(400).json({ error: 'The room YouTube playlist can contain up to 20 videos including the current video.' });
    }
    const queue = [];
    for (const item of queueInput) {
      const id = String(item?.video_id || '');
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return res.status(400).json({ error: 'The queue contains an invalid YouTube video.' });
      }
      queue.push({ video_id: id, title: String(item?.title || 'YouTube video').slice(0, 120), added_by: String(item?.added_by || 'Member').slice(0, 40) });
    }
    const currentTime = Number(body.current_time_seconds ?? 0);
    if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > 86400) {
      return res.status(400).json({ error: 'Invalid YouTube playback position.' });
    }
    const payload = {
      room_id: room.id,
      video_id: videoId,
      queue,
      is_playing: Boolean(body.is_playing),
      current_time_seconds: currentTime,
      updated_by: req.talkzyUser.id,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('talkzy_room_youtube_state')
      .upsert(payload, { onConflict: 'room_id' })
      .select('room_id, video_id, queue, is_playing, current_time_seconds, updated_by, updated_at')
      .single();
    if (error) throw error;
    res.set('Cache-Control', 'no-store').json({ state: data });
  } catch (error) {
    console.error('Could not update shared YouTube state:', error.message);
    res.status(500).json({ error: 'Could not update the room YouTube player.' });
  }
});

app.get('/api/rooms/:roomId/presence', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    const userId = req.talkzyUser.id;
    const allowed = room.owner_id === userId || await isRoomAdmin(room.id, userId) ||
      await isRoomMember(room.id, userId) || await isRoomVisitor(room.id, userId);
    if (!allowed) return res.status(403).json({ error: 'Enter the room to view its live users.' });
    const cutoff = new Date(Date.now() - 75000).toISOString();
    const { error: staleCleanupError } = await supabase.from('talkzy_room_presence')
      .delete().eq('room_id', room.id).lt('last_seen_at', cutoff);
    if (staleCleanupError) throw staleCleanupError;
    const { data, error } = await supabase.from('talkzy_room_presence')
      .select('user_id, presence_role, last_seen_at').eq('room_id', room.id)
      .gte('last_seen_at', cutoff).order('last_seen_at', { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const ids = rows.map(row => row.user_id);
    const { data: profiles, error: profileError } = ids.length
      ? await supabase.from('talkzy_profiles').select('id, talkzy_id, display_name, avatar_url, country').in('id', ids)
      : { data: [], error: null };
    if (profileError) throw profileError;
    const users = rows.map(row => {
      const profile = (profiles || []).find(item => item.id === row.user_id);
      const role = row.presence_role;
      return {
        user_id: row.user_id,
        display_name: profile?.display_name || 'TALKZY User',
        talkzy_id: profile?.talkzy_id || null,
        avatar_url: profile?.avatar_url || null,
        country: profile?.country || null,
        level: null,
        badges: [role === 'owner' ? 'Room Owner' : role === 'admin' ? 'Admin' : role === 'tourist' ? 'Tourist' : 'Member'],
        presence_role: role,
        last_seen_at: row.last_seen_at
      };
    });
    res.set('Cache-Control', 'no-store').json({ users, total: users.length });
  } catch (error) {
    console.error('Could not load live room users:', error.message);
    res.status(500).json({ error: 'Could not load live room users.' });
  }
});

app.post('/api/rooms/:roomId/presence/leave', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    const userId = req.talkzyUser.id;

    // Write the personal chat cutoff FIRST. Even if presence/mic cleanup fails,
    // this user's old messages stay hidden. Shared messages are never deleted.
    const { data: clearMarker, error: clearMarkerError } = await supabase.from('talkzy_room_chat_clears')
      .upsert({ room_id: room.id, user_id: userId, cleared_at: new Date().toISOString() },
        { onConflict: 'room_id,user_id' })
      .select('cleared_at').single();
    if (clearMarkerError) throw clearMarkerError;

    // One exit endpoint cleans up both member and tourist room state.
    // Membership itself is intentionally preserved for ordinary members.
    const { error: seatError } = await supabase.from('talkzy_room_mic_seats')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (seatError) throw seatError;

    const { error: visitorError } = await supabase.from('talkzy_room_visitors')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (visitorError) throw visitorError;

    const { error: presenceError } = await supabase.from('talkzy_room_presence')
      .delete().eq('room_id', room.id).eq('user_id', userId);
    if (presenceError) throw presenceError;
    await removeUserRoomMusic(room.id, userId);

    res.set('Cache-Control', 'no-store').json({ left: true, clearedAt: clearMarker.cleared_at });
  } catch (error) {
    console.error('Could not complete room exit cleanup:', error.message);
    res.status(500).json({ error: 'Could not complete room exit cleanup.' });
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
    let passwordHash = null;
    if (room.room_type === 'locked') {
      const { data: savedPassword, error: passwordReadError } = await supabase.from('talkzy_room_passwords')
        .select('password_hash').eq('room_id', room.id).maybeSingle();
      if (passwordReadError) throw passwordReadError;
      passwordHash = savedPassword?.password_hash || null;
    }
    if (body.password !== undefined && String(body.password).length) {
      const password = String(body.password);
      if (password.length < 4 || password.length > 64) return res.status(400).json({ error: 'Room password must be 4–64 characters.' });
      passwordHash = await makePasswordHash(password);
      nextType = 'locked';
    }
    if (nextType === 'locked' && !passwordHash) {
      return res.status(400).json({ error: 'Set a room password before switching this room to locked.' });
    }
    if (body.roomType !== undefined || body.password !== undefined) patch.room_type = nextType;
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
    if ((body.roomType !== undefined || body.password !== undefined) && nextType === 'locked' && passwordHash) {
      const { error: passwordWriteError } = await supabase.from('talkzy_room_passwords')
        .upsert({ room_id: room.id, password_hash: passwordHash }, { onConflict: 'room_id' });
      if (passwordWriteError) throw passwordWriteError;
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
    if ((body.roomType !== undefined || body.password !== undefined) && nextType === 'public') {
      const { error: passwordDeleteError } = await supabase.from('talkzy_room_passwords')
        .delete().eq('room_id', room.id);
      if (passwordDeleteError) throw passwordDeleteError;
    }
    let settings = null;
    if (Object.keys(approval).length) {
      const { data, error } = await supabase.from('talkzy_room_settings')
        .upsert({ room_id: room.id, ...approval, updated_at: new Date().toISOString() }, { onConflict: 'room_id' })
        .select('tourists_on_mic, tourists_send_text, tourists_send_pic, updated_at').single();
      if (error) throw error;
      settings = data;
      if (settings.tourists_on_mic === false) {
        const { data: visitors, error: visitorError } = await supabase.from('talkzy_room_visitors')
          .select('user_id').eq('room_id', room.id);
        if (visitorError) throw visitorError;
        const visitorIds = (visitors || []).map(visitor => visitor.user_id);
        if (visitorIds.length) {
          const { error: seatCleanupError } = await supabase.from('talkzy_room_mic_seats')
            .delete().eq('room_id', room.id).in('user_id', visitorIds);
          if (seatCleanupError) throw seatCleanupError;
        }
      }
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
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    if (room.owner_id !== req.talkzyUser.id) return res.status(403).json({ error: 'Only the room creator can kick members.' });
    if (req.params.userId === room.owner_id) return res.status(400).json({ error: 'The room creator cannot be kicked.' });
    const reason = String(req.body?.reason || '').trim().slice(0, 200);
    const { error: insertError } = await supabase.from('talkzy_room_kicklist')
      .upsert({ room_id: room.id, user_id: req.params.userId, kicked_by: req.talkzyUser.id, reason },
        { onConflict: 'room_id,user_id' });
    if (insertError) throw insertError;
    await clearUserRoomChat(room.id, req.params.userId);
    const { error: memberError } = await supabase.from('talkzy_room_members').delete()
      .eq('room_id', room.id).eq('user_id', req.params.userId);
    if (memberError) throw memberError;
    const { error: adminDeleteError } = await supabase.from('talkzy_room_admins').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (adminDeleteError) throw adminDeleteError;
    const { error: visitorDeleteError } = await supabase.from('talkzy_room_visitors').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (visitorDeleteError) throw visitorDeleteError;
    const { error: seatDeleteError } = await supabase.from('talkzy_room_mic_seats').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (seatDeleteError) throw seatDeleteError;
    const { error: presenceDeleteError } = await supabase.from('talkzy_room_presence').delete().eq('room_id', room.id).eq('user_id', req.params.userId);
    if (presenceDeleteError) throw presenceDeleteError;
    await removeUserRoomMusic(room.id, req.params.userId);
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
    const tourist = !member && await isRoomVisitor(room.id, req.talkzyUser.id);
    if (!member && !tourist) return res.status(403).json({ error: 'Enter the room to view its activities.' });
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
        if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
        if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
        if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
        if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
        if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
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
    const allowed = await canEnterRoom(room, userId);
    if (!allowed) return res.status(403).json({ error: 'Enter the room first.' });

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
const { data: micControls, error: controlsError } = await supabase
  .from('talkzy_room_mic_controls')
  .select('seat_number, seat_closed, mic_closed, updated_by, updated_at')
  .eq('room_id', room.id);
if (controlsError) throw controlsError;

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
  seats: seatsWithProfiles,
  micControls: micControls || []
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
      eleven: 11, twelve: 12, fourteen: 14, seventeen: 17
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
    const member = await canManageRoom(room, userId) || await isRoomMember(room.id, userId);
    const tourist = !member && await isRoomVisitor(room.id, userId);
    if (!member && !tourist) return res.status(403).json({ error: 'Enter the room first.' });
    if (tourist) {
      const permissions = await getRoomTouristPermissions(room.id);
      if (!permissions.tourists_on_mic) return res.status(403).json({ error: 'The room owner has disabled microphone access for tourists.' });
    }

    const seatNumber = Number(req.params.seatNumber);
    if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 17) {
      return res.status(400).json({ error: 'Invalid microphone seat.' });
    }

    const { data: roomSettings, error: settingsError } = await supabase
  .from('talkzy_rooms')
  .select('mic_count')
  .eq('id', room.id)
  .single();

if (settingsError) throw settingsError;

const { data: seatControl } = await supabase
  .from('talkzy_room_mic_controls')
  .select('seat_closed')
  .eq('room_id', room.id)
  .eq('seat_number', seatNumber)
  .maybeSingle();
if (seatControl?.seat_closed) {
  return res.status(403).json({ error: 'This microphone seat is closed by the room owner or admin.' });
}

if (
  !Number.isInteger(seatNumber) ||
  seatNumber < 1 ||
  seatNumber > roomSettings.mic_count
) {
  return res.status(400).json({
    error: `Choose a seat from 1 to ${roomSettings.mic_count}.`
  });
}

    // Preserve the user's mute state when moving from one mic to another.
    const { data: previousSeat } = await supabase
      .from('talkzy_room_mic_seats')
      .select('is_muted')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle();
    const preservedMute = !!previousSeat?.is_muted;

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

    const { data: currentControl } = await supabase
      .from('talkzy_room_mic_controls')
      .select('mic_closed')
      .eq('room_id', room.id)
      .eq('seat_number', seatNumber)
      .maybeSingle();
    await supabase.from('talkzy_room_mic_seats')
      .update({
        is_muted: currentControl?.mic_closed ? true : preservedMute,
        updated_at: new Date().toISOString()
      })
      .eq('room_id', room.id)
      .eq('user_id', userId);

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


// ROOM OWNER / ADMIN MIC CONTROL: lock seat or force-close mic.
app.patch('/api/rooms/:roomId/mic-seats/:seatNumber/control', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const userId = req.talkzyUser.id;
    if (!(await canManageRoom(room, userId))) {
      return res.status(403).json({ error: 'Only the room owner or room admin can control microphone seats.' });
    }
    const seatNumber = Number(req.params.seatNumber);
    if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 17) {
      return res.status(400).json({ error: 'Invalid microphone seat.' });
    }
    const action = req.body?.action;
    if (!['close_seat', 'open_seat', 'close_mic', 'open_mic'].includes(action)) {
      return res.status(400).json({ error: 'Invalid microphone control action.' });
    }
    const updates = {
      room_id: room.id,
      seat_number: seatNumber,
      updated_by: userId,
      updated_at: new Date().toISOString()
    };
    if (action === 'close_seat') updates.seat_closed = true;
    if (action === 'open_seat') updates.seat_closed = false;
    if (action === 'close_mic') updates.mic_closed = true;
    if (action === 'open_mic') updates.mic_closed = false;

    const { data, error } = await supabase
      .from('talkzy_room_mic_controls')
      .upsert(updates, { onConflict: 'room_id,seat_number' })
      .select()
      .single();
    if (error) throw error;

    if (action === 'close_seat') {
      const { error: removeSeatError } = await supabase.from('talkzy_room_mic_seats').delete()
        .eq('room_id', room.id).eq('seat_number', seatNumber);
      if (removeSeatError) throw removeSeatError;
    } else if (action === 'close_mic') {
      const { error: forceMuteError } = await supabase.from('talkzy_room_mic_seats').update({ is_muted: true, updated_at: new Date().toISOString() })
        .eq('room_id', room.id).eq('seat_number', seatNumber);
      if (forceMuteError) throw forceMuteError;
    }
    res.set('Cache-Control', 'no-store').json({ success: true, control: data });
  } catch (error) {
    console.error('Could not update mic seat control:', error.message);
    res.status(500).json({ error: 'Could not update microphone seat control.' });
  }
});

// MUTE OR UNMUTE MICROPHONE
app.patch('/api/rooms/:roomId/mic-seats/mute', userAuth, async (req, res) => {
  try {
    const room = await requireRoom(req, res);
    if (!room) return;
    if (room.status !== 'active') return res.status(409).json({ error: 'This room is closed.' });
    const userId = req.talkzyUser.id;
    const member = await canManageRoom(room, userId) || await isRoomMember(room.id, userId);
    const tourist = !member && await isRoomVisitor(room.id, userId);
    if (!member && !tourist) return res.status(403).json({ error: 'Enter the room first.' });
    if (tourist) {
      const permissions = await getRoomTouristPermissions(room.id);
      if (!permissions.tourists_on_mic) return res.status(403).json({ error: 'The room owner has disabled microphone access for tourists.' });
    }

    const isMuted = req.body?.isMuted;

    if (typeof isMuted !== 'boolean') {
      return res.status(400).json({ error: 'Mute status must be true or false.' });
    }

    const { data: occupiedSeat } = await supabase
      .from('talkzy_room_mic_seats')
      .select('seat_number')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (!occupiedSeat) return res.status(404).json({ error: 'You are not occupying a microphone seat.' });
    const { data: micControl } = await supabase
      .from('talkzy_room_mic_controls')
      .select('mic_closed')
      .eq('room_id', room.id)
      .eq('seat_number', occupiedSeat.seat_number)
      .maybeSingle();
    if (micControl?.mic_closed && !isMuted) {
      return res.status(403).json({ error: 'This microphone is closed by the room owner or admin.' });
    }

    const { data, error } = await supabase
      .from('talkzy_room_mic_seats')
      .update({
        is_muted: isMuted,
        updated_at: new Date().toISOString()
      })
      .eq('room_id', room.id)
      .eq('user_id', userId)
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

