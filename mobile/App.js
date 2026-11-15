import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || '';

const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://talkzy2.onrender.com'
).replace(/\/+$/, '');

const BUCKET = 'talkzy-profiles';

const C = {
  bg: '#090D18',
  panel: '#141B2B',
  panel2: '#1B2538',
  text: '#F4F7FF',
  muted: '#9AA8C0',
  accent: '#7C5CFC',
  line: '#29344A',
  danger: '#FF6B78',
  gold: '#FFC857'
};

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const raw = await response.text();

  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

function Brand({ small = false }) {
  const size = small ? 48 : 100;

  return (
    <View
      style={{
        alignItems: 'center',
        marginBottom: small ? 8 : 22
      }}
    >
      <Image
        source={require('./assets/talkzy-icon.png')}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain'
        }}
      />

      <Text
        style={{
          color: C.text,
          fontSize: small ? 21 : 30,
          fontWeight: '900',
          letterSpacing: 3,
          marginTop: 5
        }}
      >
        TALKZY
      </Text>

      {!small && (
        <Text style={{ color: C.muted, marginTop: 4 }}>
          Talk. Connect. Belong.
        </Text>
      )}
    </View>
  );
}

function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: secondary
          ? C.panel2
          : danger
          ? '#632B3A'
          : C.accent,
        padding: 14,
        borderRadius: 13,
        alignItems: 'center',
        marginTop: 10,
        opacity: disabled ? 0.55 : 1
      }}
    >
      <Text
        style={{
          color: C.text,
          fontWeight: '800',
          fontSize: 15
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: C.muted, marginBottom: 6, fontSize: 13 }}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#71809A"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={{
          backgroundColor: C.panel2,
          color: C.text,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 13
        }}
      />
    </View>
  );
}

function Card({ children, style = {} }) {
  return (
    <View
      style={{
        backgroundColor: C.panel,
        borderWidth: 1,
        borderColor: C.line,
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        ...style
      }}
    >
      {children}
    </View>
  );
}

function Heading({ children }) {
  return (
    <Text
      style={{
        color: C.text,
        fontSize: 23,
        fontWeight: '900',
        marginBottom: 8
      }}
    >
      {children}
    </Text>
  );
}

function SectionTitle({ children }) {
  return (
    <Text
      style={{
        color: C.text,
        fontSize: 17,
        fontWeight: '900',
        marginTop: 20,
        marginBottom: 10
      }}
    >
      {children}
    </Text>
  );
}

function Chip({ title, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? C.accent : C.panel2,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: active ? C.accent : C.line
      }}
    >
      <Text style={{ color: C.text, fontWeight: '700' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function ComingSoon({ title, description }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
      <Text style={{ fontSize: 32, marginBottom: 10 }}>✨</Text>

      <Text
        style={{
          color: C.text,
          fontSize: 17,
          fontWeight: '900'
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: C.muted,
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 21
        }}
      >
        {description}
      </Text>

      <Text
        style={{
          color: C.gold,
          fontWeight: '800',
          marginTop: 12
        }}
      >
        COMING SOON
      </Text>
    </Card>
  );
          }
export default function App() {
  // ---------------------------------
  // MAIN APP STATES
  // ---------------------------------

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [screen, setScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('Room');

  // ---------------------------------
  // LOGIN / SIGNUP STATES
  // ---------------------------------

  const [authMode, setAuthMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ---------------------------------
  // PROFILE STATES
  // ---------------------------------

  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('India');
  const [avatarUri, setAvatarUri] = useState(null);

  // ---------------------------------
  // ROOM STATES
  // ---------------------------------

  const [roomTab, setRoomTab] = useState('Mine');
  const [mineTab, setMineTab] = useState('Recent');

  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);

  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomDpUri, setRoomDpUri] = useState(null);
const [roomDpUploading, setRoomDpUploading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // ---------------------------------
  // OTHER TAB STATES
  // ---------------------------------

  const [gameTab, setGameTab] = useState('Hot Games');
  const [momentTab, setMomentTab] = useState('Follow');
  const [messageTab, setMessageTab] = useState('Message');

  // ---------------------------------
  // LOAD SUPABASE SESSION
  // ---------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) {
          throw new Error(
            'Supabase settings are missing. Check your GitHub Actions secrets.'
          );
        }

        const {
          data: { session: currentSession },
          error
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        setSession(currentSession);

        if (currentSession) {
          await loadUserProfile(currentSession);
        } else {
          setScreen('login');
        }
      } catch (error) {
        console.log('Session loading error:', error.message);

        if (mounted) {
          setScreen('login');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession) {
          await loadUserProfile(newSession);
        } else {
          setProfile(null);
          setScreen('login');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------
  // LOAD USER PROFILE
  // ---------------------------------

  async function loadUserProfile(currentSession) {
    try {
      const userId = currentSession.user.id;

      const { data, error } = await supabase
        .from('talkzy_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.display_name) {
        setProfile(data || null);
        setScreen('profile');
        return;
      }

      setProfile(data);
      setDisplayName(data.display_name || '');
      setGender(data.gender || 'Male');
      setDateOfBirth(data.date_of_birth || '');
      setCountry(data.country || 'India');
      setAvatarUri(data.avatar_url || null);

      setScreen('main');
    } catch (error) {
      console.log('Profile loading error:', error.message);

      Alert.alert(
        'Profile error',
        'Could not load your profile. Please try again.'
      );

      setScreen('profile');
    }
  }

  // ---------------------------------
  // EMAIL SIGNUP
  // ---------------------------------

  async function signUp() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Your password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Both passwords must match.');
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        await loadUserProfile(data.session);
      } else {
        Alert.alert(
          'Check your email',
          'Your account has been created. If email confirmation is enabled, confirm your email and then sign in.'
        );

        setAuthMode('login');
        setScreen('login');
      }
    } catch (error) {
      Alert.alert('Signup failed', error.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------
  // EMAIL LOGIN
  // ---------------------------------

  async function signIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    try {
      setSaving(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        await loadUserProfile(data.session);
      }
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------
  // GOOGLE SIGN IN
  // ---------------------------------

  async function signInWithGoogle() {
    try {
      setSaving(true);

      const redirectUrl = Linking.createURL('auth/callback');

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true
          }
        });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('Google sign-in URL was not created.');
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success' && result.url) {
        const callbackUrl = new URL(result.url);

        const params = new URLSearchParams(
          callbackUrl.hash.replace(/^#/, '') ||
          callbackUrl.search.replace(/^\?/, '')
        );

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

          if (sessionError) throw sessionError;

          if (sessionData.session) {
            setSession(sessionData.session);
            await loadUserProfile(sessionData.session);
          }
        } else {
          Alert.alert(
            'Google sign-in',
            'The login callback did not contain a session. Please try again.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Google login failed', error.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------
  // SELECT PROFILE PHOTO
  // ---------------------------------

  async function chooseAvatar() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo access to select your profile picture.'
        );
        return;
      }
      
async function chooseRoomDp() {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow photo access to select your room picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setRoomDpUri(result.assets[0].uri);
    }
  } catch (error) {
    Alert.alert(
      'Picture error',
      'Could not select the room picture.'
    );
  }
}
      

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets?.length) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Photo error', error.message);
    }
  }

  // ---------------------------------
  // UPLOAD PROFILE PHOTO
  // ---------------------------------

  async function uploadAvatar(userId) {
    if (!avatarUri) return null;

    if (avatarUri.startsWith('http')) {
      return avatarUri;
    }

    const response = await fetch(avatarUri);
    const arrayBuffer = await response.arrayBuffer();

    const filePath = `${userId}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // ---------------------------------
  // SAVE / COMPLETE PROFILE
  // ---------------------------------

  async function completeProfile() {
    if (!session?.user?.id) {
      Alert.alert('Login required', 'Please sign in again.');
      setScreen('login');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Name required', 'Enter your display name.');
      return;
    }

    if (!dateOfBirth.trim()) {
      Alert.alert(
        'Date of birth required',
        'Enter your date of birth in YYYY-MM-DD format.'
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      Alert.alert(
        'Invalid date',
        'Use YYYY-MM-DD format, for example 2000-05-15.'
      );
      return;
    }

    try {
      setSaving(true);

      const userId = session.user.id;

      const uploadedAvatar = await uploadAvatar(userId);

      const profileData = {
        id: userId,
        display_name: displayName.trim(),
        gender,
        date_of_birth: dateOfBirth,
        country: country.trim() || 'India'
      };

      if (uploadedAvatar) {
        profileData.avatar_url = uploadedAvatar;
      }

      const { data, error } = await supabase
        .from('talkzy_profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarUri(data.avatar_url || null);
      setScreen('main');

      Alert.alert(
        'Welcome to TALKZY!',
        `Your TALKZY ID is ${data.talkzy_id || 'being assigned'}.`
      );
    } catch (error) {
      console.log('Profile save error:', error.message);

      Alert.alert(
        'Profile could not be saved',
        error.message
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------
  // SIGN OUT
  // ---------------------------------

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setProfile(null);
      setSession(null);
      setScreen('login');
      setAuthMode('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Sign out failed', error.message);
    }
  }

  // ---------------------------------
  // RELOAD PROFILE
  // ---------------------------------

  async function refreshProfile() {
    if (session) {
      await loadUserProfile(session);
    }
}
             
  // =========================================
  // ROOM: LOAD PUBLIC ROOMS
  // =========================================

  async function loadPublicRooms() {
    try {
      setLoadingRooms(true);

      const result = await api('/api/rooms');

      setRooms(
        Array.isArray(result.rooms)
          ? result.rooms
          : []
      );
    } catch (error) {
      console.log('Public rooms error:', error.message);
      Alert.alert('Rooms', 'Could not load public rooms.');
    } finally {
      setLoadingRooms(false);
    }
  }

  // =========================================
  // ROOM: LOAD MY ROOMS
  // =========================================

  async function loadMyRooms() {
    try {
      if (!session?.access_token) return;

      const result = await api('/api/rooms', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const allRooms = Array.isArray(result.rooms)
        ? result.rooms
        : [];

      setMyRooms(
        allRooms.filter(
          room => room.owner_id === session.user.id
        )
      );
    } catch (error) {
      console.log('My rooms:', error.message);
    }
  }

  // =========================================
  // ROOM: CREATE ROOM
  // =========================================

  async function createRoom() {
    if (!roomName.trim()) {
      Alert.alert('Room name', 'Please enter a room name.');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Login required', 'Please sign in again.');
      return;
    }

    if (roomType === 'locked' && !roomPassword.trim()) {
      Alert.alert(
        'Password required',
        'Please enter a password for your locked room.'
      );
      return;
    }

    try {
      setSaving(true);

      const result = await api('/api/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          roomName: roomName.trim(),
          description: roomDescription.trim(),
          roomType,
          password: roomType === 'locked'
            ? roomPassword
            : undefined
        })
      });

      Alert.alert(
        'Success',
        'Your room has been created successfully.'
      );

      setRoomName('');
      setRoomDescription('');
      setRoomPassword('');
      setRoomType('public');
      setShowCreateRoom(false);

      await loadPublicRooms();
      await loadMyRooms();
    } catch (error) {
      Alert.alert('Room creation failed', error.message);
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // ROOM: JOIN ROOM
  // =========================================

  async function joinRoom(room) {
    if (!session?.access_token) {
      Alert.alert('Login required', 'Please sign in again.');
      return;
    }

    try {
      const result = await api(
        `/api/rooms/${room.id}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({})
        }
      );

      Alert.alert(
        'Joined',
        `You joined ${room.room_name || 'the room'}.`
      );

      await loadPublicRooms();
      await loadMyRooms();
    } catch (error) {
      Alert.alert('Unable to join', error.message);
    }
  }

  // =========================================
  // ROOM: ROOM CARD
  // =========================================

  function renderRoomCard(room, showJoin = true) {
    return (
      <Card key={room.id}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: C.text,
                fontWeight: '900',
                fontSize: 16
              }}
            >
              🎙️ {room.room_name}
            </Text>

            <Text
              style={{
                color: C.muted,
                marginTop: 6
              }}
            >
              {room.description || 'Welcome to TALKZY room'}
            </Text>

            <Text
              style={{
                color: C.gold,
                fontSize: 12,
                marginTop: 7
              }}
            >
              {room.room_type === 'locked'
                ? '🔒 Private room'
                : '🌍 Public room'}
            </Text>
          </View>

          {showJoin && (
            <TouchableOpacity
              onPress={() => joinRoom(room)}
              style={{
                backgroundColor: C.accent,
                paddingHorizontal: 15,
                paddingVertical: 10,
                borderRadius: 10
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800' }}>
                Join
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  // =========================================
  // ROOM: CREATE ROOM FORM
  // =========================================

  function renderCreateRoom() {
    if (!showCreateRoom) return null;

    return (
      <Card>
        <Heading>Create your room</Heading>

        <Field
          label="Room name"
          value={roomName}
          onChangeText={setRoomName}
          placeholder="Enter room name"
        />

        <Field
          label="Room description"
          value={roomDescription}
          onChangeText={setRoomDescription}
          placeholder="Write something about your room"
        />

        <SectionTitle>Room type</SectionTitle>

        <View style={{ flexDirection: 'row' }}>
          <Chip
            title="Public"
            active={roomType === 'public'}
            onPress={() => setRoomType('public')}
          />

          <Chip
            title="Locked"
            active={roomType === 'locked'}
            onPress={() => setRoomType('locked')}
          />
        </View>

        {roomType === 'locked' && (
          <Field
            label="Room password"
            value={roomPassword}
            onChangeText={setRoomPassword}
            placeholder="Create a password"
            secureTextEntry
          />
        )}

        <Button
          title={saving ? 'Creating...' : 'Create Room'}
          onPress={createRoom}
          disabled={saving}
        />

        <Button
          title="Cancel"
          secondary
          onPress={() => setShowCreateRoom(false)}
        />
      </Card>
    );
  }

  // =========================================
  // ROOM: MINE
  // =========================================

  function renderMine() {
    return (
      <>
        <TouchableOpacity
          onPress={() => setShowCreateRoom(!showCreateRoom)}
          style={{
            backgroundColor: C.accent,
            padding: 17,
            borderRadius: 15,
            marginBottom: 15
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 17,
              fontWeight: '900',
              textAlign: 'center'
            }}
          >
            ＋ Create Your Room
          </Text>
        </TouchableOpacity>

        {renderCreateRoom()}

        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          {['Recent', 'Joined', 'Follow'].map(item => (
            <Chip
              key={item}
              title={item}
              active={mineTab === item}
              onPress={() => setMineTab(item)}
            />
          ))}
        </View>

        {mineTab === 'Recent' && (
          <>
            <SectionTitle>My Created Rooms</SectionTitle>

            {myRooms.length === 0 ? (
              <ComingSoon
                title="No created rooms"
                description="Create your first TALKZY room and invite your friends."
              />
            ) : (
              myRooms.map(room =>
                renderRoomCard(room, false)
              )
            )}

            <SectionTitle>Recently Available Rooms</SectionTitle>

            {rooms.length === 0 ? (
              <ComingSoon
                title="No rooms available"
                description="New public rooms will appear here."
              />
            ) : (
              rooms.map(room => renderRoomCard(room))
            )}
          </>
        )}

        {mineTab === 'Joined' && (
          <ComingSoon
            title="Joined Rooms"
            description="Your joined room history will appear here when membership history is connected."
          />
        )}

        {mineTab === 'Follow' && (
          <ComingSoon
            title="Followed Rooms"
            description="Your favourite rooms will appear here when room following is implemented."
          />
        )}
      </>
    );
  }

  // =========================================
  // ROOM: POPULAR
  // =========================================

  function renderPopular() {
    return (
      <>
        <SectionTitle>Special Events</SectionTitle>

        <ComingSoon
          title="Special Events"
          description="Discover special TALKZY activities and exclusive events."
        />

        <SectionTitle>Community Rankings</SectionTitle>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['🎁 Gifting Rank', '❤️ CP Rank', '👑 Family Rank'].map(item => (
            <View
              key={item}
              style={{
                width: '48%',
                marginRight: '2%',
                marginBottom: 10
              }}
            >
              <Card style={{ alignItems: 'center' }}>
                <Text style={{ color: C.text, fontWeight: '800' }}>
                  {item}
                </Text>
                <Text style={{ color: C.gold, marginTop: 7 }}>
                  Coming soon
                </Text>
              </Card>
            </View>
          ))}
        </View>

        <SectionTitle>Hot Rooms</SectionTitle>

        {loadingRooms ? (
          <ActivityIndicator color={C.accent} />
        ) : (
          rooms.slice(0, 10).map(room =>
            renderRoomCard(room)
          )
        )}

        <SectionTitle>New Rooms</SectionTitle>

        {rooms.length === 0 ? (
          <ComingSoon
            title="New rooms"
            description="Newly created rooms will appear here."
          />
        ) : (
          rooms.slice().reverse().slice(0, 10).map(room =>
            renderRoomCard(room)
          )
        )}

        <Button
          title="Refresh Rooms"
          secondary
          onPress={loadPublicRooms}
        />
      </>
    );
  }

  // =========================================
  // ROOM: DISCOVER
  // =========================================

  function renderDiscover() {
    return (
      <>
        <SectionTitle>🏆 History Big Win</SectionTitle>

        <ComingSoon
          title="Greedy Game Big Winner"
          description="The player with the highest Greedy game coin win will appear here once game history and coin records are connected."
        />

        <SectionTitle>🌟 TALKZY Rankings</SectionTitle>

        <ComingSoon
          title="Discover Top Users"
          description="Explore top users and community rankings."
        />

        <SectionTitle>🌍 Recommended Countries</SectionTitle>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[
            '🇮🇳 India',
            '🇧🇩 Bangladesh',
            '🇳🇵 Nepal',
            '🇵🇰 Pakistan',
            '🇱🇰 Sri Lanka',
            '🇦🇪 UAE'
          ].map(item => (
            <View
              key={item}
              style={{
                width: '48%',
                marginRight: '2%'
              }}
            >
              <Card>
                <Text style={{ color: C.text, fontWeight: '800' }}>
                  {item}
                </Text>
              </Card>
            </View>
          ))}
        </View>

        <SectionTitle>Community</SectionTitle>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Card style={{ alignItems: 'center' }}>
              <Text style={{ color: C.text, fontWeight: '900' }}>
                📊 Activity
              </Text>
              <Text style={{ color: C.muted, marginTop: 8 }}>
                Coming soon
              </Text>
            </Card>
          </View>

          <View style={{ flex: 1, marginLeft: 5 }}>
            <Card style={{ alignItems: 'center' }}>
              <Text style={{ color: C.text, fontWeight: '900' }}>
                💎 My Subscription
              </Text>
              <Text style={{ color: C.muted, marginTop: 8 }}>
                Coming soon
              </Text>
            </Card>
          </View>
        </View>
      </>
    );
  }

  // =========================================
  // ROOM: EVENTS
  // =========================================

  function renderEvents() {
    return (
      <>
        <Heading>Events</Heading>

        <Text style={{ color: C.muted, marginBottom: 15 }}>
          Discover all ongoing TALKZY events.
        </Text>

        <ComingSoon
          title="No active events"
          description="All ongoing events will be displayed here when the events system is connected."
        />
      </>
    );
  }

  // =========================================
  // ROOM MAIN SCREEN
  // =========================================

  function renderRoom() {
    return (
      <>
        <View style={{ flexDirection: 'row', marginBottom: 18 }}>
          {['Mine', 'Popular', 'Discover', 'Events'].map(item => (
            <Chip
              key={item}
              title={item}
              active={roomTab === item}
              onPress={() => {
                setRoomTab(item);

                if (item === 'Popular' || item === 'Mine') {
                  loadPublicRooms();
                  loadMyRooms();
                }
              }}
            />
          ))}
        </View>

        {roomTab === 'Mine' && renderMine()}
        {roomTab === 'Popular' && renderPopular()}
        {roomTab === 'Discover' && renderDiscover()}
        {roomTab === 'Events' && renderEvents()}
      </>
    );
          }
    
  // =========================================
  // GAMES SECTION
  // =========================================

  function renderGames() {
    const games = [
      { name: 'Greedy', emoji: '🎲' },
      { name: 'Ludo', emoji: '🎯' },
      { name: 'Carrom', emoji: '🔴' },
      { name: 'Quiz', emoji: '🧠' },
      { name: 'Lucky Wheel', emoji: '🎡' },
      { name: 'Fruit Game', emoji: '🍉' },
      { name: 'Cards', emoji: '🃏' },
      { name: 'Dice', emoji: '🎲' }
    ];

    return (
      <>
        {/* COIN BALANCE */}

        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 28
                }}
              />
            ) : (
              <View
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 28,
                  backgroundColor: C.panel2,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 25 }}>👤</Text>
              </View>
            )}

            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ color: C.muted }}>
                Your Coin Balance
              </Text>

              <Text
                style={{
                  color: C.gold,
                  fontSize: 24,
                  fontWeight: '900',
                  marginTop: 3
                }}
              >
                🪙 0
              </Text>

              <Text style={{ color: C.muted, fontSize: 11 }}>
                Wallet connection coming soon
              </Text>
            </View>
          </View>
        </Card>

        {/* HOT SOCIAL GAMES */}

        <Heading>Hot Social Games</Heading>

        <Text style={{ color: C.muted, marginBottom: 10 }}>
          Play and enjoy with your TALKZY friends.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {games.map(game => (
            <TouchableOpacity
              key={game.name}
              onPress={() =>
                Alert.alert(
                  game.name,
                  'This game will be available soon.'
                )
              }
              style={{
                width: '48%',
                marginRight: '2%',
                marginBottom: 10,
                backgroundColor: C.panel,
                borderColor: C.line,
                borderWidth: 1,
                borderRadius: 15,
                paddingVertical: 22,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 34 }}>
                {game.emoji}
              </Text>

              <Text
                style={{
                  color: C.text,
                  fontWeight: '900',
                  marginTop: 8
                }}
              >
                {game.name}
              </Text>

              <Text
                style={{
                  color: C.gold,
                  fontSize: 11,
                  marginTop: 5
                }}
              >
                Coming soon
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GAME ROOMS */}

        <SectionTitle>🎮 Game Rooms</SectionTitle>

        <ComingSoon
          title="Game Rooms"
          description="See rooms where users are playing games, join players and enjoy games together. Player counts will appear here when game rooms are connected."
        />
      </>
    );
  }

  // =========================================
  // MOMENT SECTION
  // =========================================

  function renderMoment() {
    const momentTabs = ['Follow', 'Trending', 'Topic'];

    return (
      <>
        {/* MOMENT TABS */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15
          }}
        >
          {momentTabs.map(item => (
            <Chip
              key={item}
              title={item}
              active={momentTab === item}
              onPress={() => setMomentTab(item)}
            />
          ))}
        </View>

        {/* WEEKLY TOPIC */}

        <SectionTitle>🔥 Weekly Topic Activity</SectionTitle>

        <Card>
          <Text
            style={{
              color: C.text,
              fontSize: 17,
              fontWeight: '900'
            }}
          >
            This Week on TALKZY
          </Text>

          <Text
            style={{
              color: C.muted,
              marginTop: 8,
              lineHeight: 21
            }}
          >
            Share your moments and participate in weekly community topics.
          </Text>

          <Text
            style={{
              color: C.gold,
              marginTop: 12,
              fontWeight: '800'
            }}
          >
            Weekly activities coming soon
          </Text>
        </Card>

        {/* MOMENT FEED */}

        <SectionTitle>
          {momentTab === 'Follow'
            ? 'Following Moments'
            : momentTab === 'Trending'
            ? 'Trending Moments'
            : 'Explore Topics'}
        </SectionTitle>

        <ComingSoon
          title="No moments yet"
          description="Your TALKZY moments feed will appear here. Share photos, videos and updates with your community once the moments service is connected."
        />

        {/* FLOATING CREATE MOMENT BUTTON */}

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Create Moment',
              'Moment posting will be available after the moments upload and database system is connected.'
            )
          }
          style={{
            position: 'absolute',
            right: 18,
            top: 230,
            width: 58,
            height: 58,
            borderRadius: 30,
            backgroundColor: C.accent,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 31,
              fontWeight: '400'
            }}
          >
            +
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  // =========================================
  // MESSAGE SECTION
  // =========================================

  function renderMessage() {
    return (
      <>
        {/* MESSAGE HEADER */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Heading>
            {messageTab === 'Message' ? 'Messages' : 'Friends'}
          </Heading>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Clear',
                  'Message clearing will be available when the messaging system is connected.'
                )
              }
              style={{
                backgroundColor: C.panel2,
                padding: 10,
                borderRadius: 10,
                marginRight: 8
              }}
            >
              <Text style={{ color: C.text, fontWeight: '800' }}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Add Friend',
                  'Friend search and requests will be available soon.'
                )
              }
              style={{
                backgroundColor: C.accent,
                padding: 10,
                borderRadius: 10
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800' }}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MESSAGE / FRIEND TABS */}

        <View
          style={{
            flexDirection: 'row',
            marginTop: 8,
            marginBottom: 18
          }}
        >
          <Chip
            title="Message"
            active={messageTab === 'Message'}
            onPress={() => setMessageTab('Message')}
          />

          <Chip
            title="Friends"
            active={messageTab === 'Friends'}
            onPress={() => setMessageTab('Friends')}
          />
        </View>

        {/* MESSAGE LIST */}

        {messageTab === 'Message' && (
          <>
            <SectionTitle>Notifications</SectionTitle>

            <Card>
              <Text style={{ color: C.text, fontWeight: '900' }}>
                🔔 System Notification
              </Text>

              <Text style={{ color: C.muted, marginTop: 6 }}>
                Important TALKZY system notifications will appear here.
              </Text>
            </Card>

            <Card>
              <Text style={{ color: C.text, fontWeight: '900' }}>
                📢 Official Announcement
              </Text>

              <Text style={{ color: C.muted, marginTop: 6 }}>
                Official updates and announcements will appear here.
              </Text>
            </Card>

            <Card>
              <Text style={{ color: C.text, fontWeight: '900' }}>
                ❤️ Moment Notification
              </Text>

              <Text style={{ color: C.muted, marginTop: 6 }}>
                Likes, comments and moment notifications will appear here.
              </Text>
            </Card>

            <SectionTitle>All Messages</SectionTitle>

            <ComingSoon
              title="No messages"
              description="Your conversations will appear here when the messaging system is connected."
            />
          </>
        )}

        {/* FRIENDS LIST */}

        {messageTab === 'Friends' && (
          <>
            <SectionTitle>My Friends</SectionTitle>

            <ComingSoon
              title="No friends yet"
              description="Your friends will appear here with their online, offline and in-room status."
            />
          </>
        )}
      </>
    );
                  }
                  
  // =========================================
  // PROFILE SCREEN
  // =========================================

  function renderProfile() {
    return (
      <>
        <Heading>My Profile</Heading>

        <Card style={{ alignItems: 'center' }}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 12
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: C.panel2,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}
            >
              <Text style={{ fontSize: 42 }}>👤</Text>
            </View>
          )}

          <Text
            style={{
              color: C.text,
              fontSize: 21,
              fontWeight: '900'
            }}
          >
            {profile?.display_name || displayName || 'TALKZY User'}
          </Text>

          <Text style={{ color: C.gold, marginTop: 8 }}>
            TALKZY ID: {profile?.talkzy_id || 'Not assigned'}
          </Text>

          <Text style={{ color: C.muted, marginTop: 6 }}>
            {profile?.country || country}
          </Text>
        </Card>

        <SectionTitle>Account Information</SectionTitle>

        <Card>
          <Text style={{ color: C.muted }}>Email</Text>
          <Text style={{ color: C.text, marginTop: 5 }}>
            {session?.user?.email || '-'}
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: C.line,
              marginVertical: 13
            }}
          />

          <Text style={{ color: C.muted }}>Gender</Text>
          <Text style={{ color: C.text, marginTop: 5 }}>
            {profile?.gender || gender}
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: C.line,
              marginVertical: 13
            }}
          />

          <Text style={{ color: C.muted }}>Date of Birth</Text>
          <Text style={{ color: C.text, marginTop: 5 }}>
            {profile?.date_of_birth || dateOfBirth || '-'}
          </Text>
        </Card>

        <Button
          title="Refresh Profile"
          secondary
          onPress={refreshProfile}
        />

        <Button
          title="Sign Out"
          danger
          onPress={signOut}
        />
      </>
    );
  }

  // =========================================
  // PROFILE COMPLETION SCREEN
  // =========================================

  function renderProfileSetup() {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <Brand small />

        <Heading>Complete Your Profile</Heading>

        <Text style={{ color: C.muted, marginBottom: 15 }}>
          Complete your details before entering TALKZY.
        </Text>

        <TouchableOpacity
          onPress={chooseAvatar}
          style={{ alignItems: 'center', marginVertical: 15 }}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{
                width: 105,
                height: 105,
                borderRadius: 55
              }}
            />
          ) : (
            <View
              style={{
                width: 105,
                height: 105,
                borderRadius: 55,
                backgroundColor: C.panel2,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: C.accent
              }}
            >
              <Text style={{ fontSize: 36 }}>📷</Text>
            </View>
          )}

          <Text
            style={{
              color: C.accent,
              marginTop: 10,
              fontWeight: '800'
            }}
          >
            Add Profile Picture
          </Text>
        </TouchableOpacity>

        <Field
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
        />

        <SectionTitle>Gender</SectionTitle>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['Male', 'Female', 'Other', 'Prefer not to say'].map(item => (
            <Chip
              key={item}
              title={item}
              active={gender === item}
              onPress={() => setGender(item)}
            />
          ))}
        </View>

        <Field
          label="Date of Birth (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="2000-05-15"
        />

        <Field
          label="Country"
          value={country}
          onChangeText={setCountry}
          placeholder="Enter your country"
        />

        <Button
          title={saving ? 'Saving Profile...' : 'Complete Profile'}
          onPress={completeProfile}
          disabled={saving}
        />
      </ScrollView>
    );
  }

  // =========================================
  // LOGIN / SIGNUP SCREEN
  // =========================================

  function renderAuth() {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: 35
        }}
      >
        <Brand />

        <Card>
          <Heading>
            {authMode === 'login'
              ? 'Welcome Back!'
              : 'Create Account'}
          </Heading>

          <Text style={{ color: C.muted, marginBottom: 10 }}>
            {authMode === 'login'
              ? 'Sign in to continue to TALKZY.'
              : 'Join TALKZY and connect with people.'}
          </Text>

          <Field
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          {authMode === 'signup' && (
            <Field
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          )}

          <Button
            title={
              saving
                ? 'Please wait...'
                : authMode === 'login'
                ? 'Login'
                : 'Create Account'
            }
            onPress={
              authMode === 'login'
                ? signIn
                : signUp
            }
            disabled={saving}
          />

          <Button
            title="Continue with Google"
            secondary
            onPress={signInWithGoogle}
            disabled={saving}
          />

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                setAuthMode(
                  authMode === 'login' ? 'signup' : 'login'
                );

                setPassword('');
                setConfirmPassword('');
              }}
            >
              <Text style={{ color: C.accent, fontWeight: '800' }}>
                {authMode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    );
  }

  // =========================================
  // BOTTOM NAVIGATION
  // =========================================

  function renderBottomNavigation() {
    const tabs = [
      { name: 'Room', icon: '🎙️' },
      { name: 'Games', icon: '🎮' },
      { name: 'Moment', icon: '📸' },
      { name: 'Message', icon: '💬' },
      { name: 'Me', icon: '👤' }
    ];

    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#111827',
          borderTopWidth: 1,
          borderTopColor: C.line,
          paddingTop: 9,
          paddingBottom: 8
        }}
      >
        {tabs.map(tab => {
          const active = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setActiveTab(tab.name)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 5
              }}
            >
              <Text style={{ fontSize: 21 }}>
                {tab.icon}
              </Text>

              <Text
                style={{
                  color: active ? C.accent : C.muted,
                  fontWeight: active ? '900' : '600',
                  fontSize: 11,
                  marginTop: 4
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // =========================================
  // MAIN HEADER
  // =========================================

  function renderMainHeader() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          marginBottom: 12
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('./assets/talkzy-icon.png')}
            style={{
              width: 38,
              height: 38,
              resizeMode: 'contain'
            }}
          />

          <Text
            style={{
              color: C.text,
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: 2,
              marginLeft: 8
            }}
          >
            TALKZY
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setActiveTab('Me')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.panel,
            padding: 7,
            borderRadius: 25
          }}
        >
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15
              }}
            />
          ) : (
            <Text style={{ fontSize: 23 }}>👤</Text>
          )}

          <Text
            style={{
              color: C.text,
              fontWeight: '800',
              marginHorizontal: 8
            }}
          >
            {profile?.display_name || 'My Account'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================================
  // MAIN SCREEN CONTENT
  // =========================================

  function renderMainContent() {
    if (activeTab === 'Room') return renderRoom();
    if (activeTab === 'Games') return renderGames();
    if (activeTab === 'Moment') return renderMoment();
    if (activeTab === 'Message') return renderMessage();
    if (activeTab === 'Me') return renderProfile();

    return renderRoom();
  }

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <StatusBar barStyle="light-content" />

        <Brand />

        <ActivityIndicator
          size="large"
          color={C.accent}
        />

        <Text style={{ color: C.muted, marginTop: 12 }}>
          Loading TALKZY...
        </Text>
      </SafeAreaView>
    );
  }

  // =========================================
  // AUTH SCREEN
  // =========================================

  if (!session || screen === 'login') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          paddingHorizontal: 18
        }}
      >
        <StatusBar barStyle="light-content" />
        {renderAuth()}
      </SafeAreaView>
    );
  }

  // =========================================
  // PROFILE SETUP SCREEN
  // =========================================

  if (screen === 'profile') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          paddingHorizontal: 18
        }}
      >
        <StatusBar barStyle="light-content" />
        {renderProfileSetup()}
      </SafeAreaView>
    );
  }

  // =========================================
  // FINAL MAIN APP
  // =========================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: C.bg
      }}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 15 }}>
          {renderMainHeader()}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 25
          }}
          keyboardShouldPersistTaps="handled"
        >
          {renderMainContent()}
        </ScrollView>
      </View>

      {renderBottomNavigation()}
    </SafeAreaView>
  );
            }
            
