
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert, Image, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://talkzy2.onrender.com').replace(/\/+$/, '');
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
  green: '#42D6A4'
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
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }

  return data;
}

function Brand({ small = false }) {
  return (
    <View style={{ alignItems: 'center', marginBottom: small ? 10 : 22 }}>
      <View style={{
        width: small ? 48 : 66,
        height: small ? 48 : 66,
        borderRadius: 20,
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ color: '#fff', fontSize: small ? 25 : 34, fontWeight: '900' }}>T</Text>
      </View>
      <Text style={{
        color: C.text,
        fontSize: small ? 22 : 30,
        fontWeight: '900',
        letterSpacing: 3,
        marginTop: 8
      }}>TALKZY</Text>
      {!small && <Text style={{ color: C.muted, marginTop: 4 }}>Talk. Connect. Belong.</Text>}
    </View>
  );
}

function Btn({ title, onPress, secondary = false, danger = false, disabled = false }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: secondary ? C.panel2 : danger ? '#632B3A' : C.accent,
        padding: 14,
        borderRadius: 13,
        alignItems: 'center',
        marginTop: 10,
        opacity: disabled ? 0.55 : 1
      }}>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>{title}</Text>
    </TouchableOpacity>
  );
}

function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: C.muted, marginBottom: 6, fontSize: 13 }}>{label}</Text>
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

export default function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('auth');
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [avatar, setAvatar] = useState('');

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [settingsText, setSettingsText] = useState('');

  const [config, setConfig] = useState({
    appName: 'TALKZY',
    maintenanceMode: false
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setScreen('home');
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession) {
          setScreen(current => current === 'auth' ? 'home' : current);
        } else {
          setProfile(null);
          setScreen('auth');
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadProfile();
      loadRooms();
      loadConfig();
    }
  }, [session?.user?.id]);

  async function loadConfig() {
    try {
      const data = await api('/api/config');
      setConfig(data.config || data || {});
    } catch (error) {
      console.log('Config:', error.message);
    }
  }

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('talkzy_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      const p = data || {};
      setProfile(p);
      setDisplayName(p.display_name || '');
      setGender(p.gender || '');
      setDob(p.date_of_birth || '');
      setCountry(p.country || '');
      setAvatar(p.avatar_url || '');

      if (!data) setScreen('profile');
    } catch (error) {
      Alert.alert('Profile', error.message);
    }
  }

  async function authenticate() {
    if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_KEY) {
      Alert.alert('Setup needed', 'Configure your Supabase URL and publishable key in your build environment.');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
        } else {
          Alert.alert('Check your email', 'Confirm your email, then sign in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;
        setSession(data.session);
      }
    } catch (error) {
      Alert.alert('Account', error.message);
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    try {
      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Google sign-in URL was not returned.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const fragment = result.url.split('#')[1] || '';
        const params = {};

        fragment.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });

        if (params.access_token && params.refresh_token) {
          const { data: authData, error: authError } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          });

          if (authError) throw authError;
          setSession(authData.session);
        } else {
          const parsed = Linking.parse(result.url);

          if (parsed.queryParams?.code) {
            const { data: authData, error: authError } =
              await supabase.auth.exchangeCodeForSession(String(parsed.queryParams.code));

            if (authError) throw authError;
            setSession(authData.session);
          }
        }
      }
    } catch (error) {
      Alert.alert('Google sign-in', error.message);
    }
  }
  async function choosePhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission',
        'Allow photo-library access to choose your profile picture.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  }

  async function saveProfile() {
    if (!displayName.trim()) {
      Alert.alert('Profile', 'Enter your display name.');
      return;
    }

    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert(
        'Date of birth',
        'Use YYYY-MM-DD format, for example 2000-05-21.'
      );
      return;
    }

    setBusy(true);

    try {
      let avatarUrl = avatar;

      if (avatar && avatar.startsWith('file://')) {
        const response = await fetch(avatar);
        const blob = await response.blob();

        const ext =
          avatar.split('.').pop()?.split('?')[0] || 'jpg';

        const path =
          `${session.user.id}/profile-${Date.now()}.${ext}`;

        const { error: uploadError } =
          await supabase.storage
            .from(BUCKET)
            .upload(path, blob, {
              contentType: blob.type || 'image/jpeg',
              upsert: true
            });

        if (uploadError) throw uploadError;

        const { data } =
          supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

        avatarUrl = data.publicUrl;
      }

      const payload = {
        id: session.user.id,
        display_name: displayName.trim(),
        gender: gender || null,
        date_of_birth: dob || null,
        country: country.trim() || null,
        avatar_url: avatarUrl || null
      };

      const { data, error } =
        await supabase
          .from('talkzy_profiles')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

      if (error) throw error;

      setProfile(data);
      setAvatar(data.avatar_url || '');
      setScreen('home');

      Alert.alert(
        'Saved',
        'Your TALKZY profile has been saved.'
      );
    } catch (error) {
      Alert.alert('Save profile', error.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadRooms() {
    try {
      const data = await api('/api/rooms');
      setRooms(data.rooms || []);
    } catch (error) {
      Alert.alert('Rooms', error.message);
    }
  }

  async function createRoom() {
    if (roomName.trim().length < 3) {
      Alert.alert(
        'Room name',
        'Enter at least 3 characters.'
      );
      return;
    }

    setBusy(true);

    try {
      const { data } = await supabase.auth.getSession();

      const result = await api('/api/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session?.access_token || ''}`
        },
        body: JSON.stringify({
          name: roomName.trim(),
          description: roomDescription.trim()
        })
      });

      setRoomName('');
      setRoomDescription('');

      await loadRooms();

      Alert.alert(
        'Room',
        result.message || 'Room created.'
      );
    } catch (error) {
      Alert.alert('Create room', error.message);
    } finally {
      setBusy(false);
    }
  }

  async function ownerLogin() {
    setBusy(true);

    try {
      const result = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: ownerEmail.trim(),
          password: ownerPassword
        })
      });

      const token = result.token || result.accessToken;

      if (!token) {
        throw new Error('The server did not return an owner token.');
      }

      await AsyncStorage.setItem('talkzy_owner_token', token);

      setSettingsText(
        JSON.stringify(result.settings || config, null, 2)
      );

      setScreen('owner');
    } catch (error) {
      Alert.alert('Owner login', error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings() {
    let parsed;

    try {
      parsed = JSON.parse(settingsText);
    } catch {
      Alert.alert('Settings', 'Enter valid JSON.');
      return;
    }

    setBusy(true);

    try {
      const token =
        await AsyncStorage.getItem('talkzy_owner_token');

      const result = await api('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(parsed)
      });

      setConfig(result.settings || parsed);

      Alert.alert('Settings', 'Settings saved.');
    } catch (error) {
      Alert.alert(
        'Settings',
        error.message +
        ' Your backend must support PUT /api/admin/settings.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setScreen('auth');
}
                  
  const page = {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20
  };

  const heading = {
    color: C.text,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 8
  };

  const note = {
    color: C.muted,
    lineHeight: 20,
    marginBottom: 12
  };

  const card = {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 14
  };

  if (busy && !session) {
    return (
      <SafeAreaView
        style={[page, { justifyContent: 'center' }]}
      >
        <ActivityIndicator
          color={C.accent}
          size="large"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={page}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
      />

      {/* LOGIN AND SIGNUP */}

      {screen === 'auth' && (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center'
          }}
        >
          <Brand />

          <Text style={[heading, { textAlign: 'center' }]}>
            {mode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </Text>

          <Text style={[note, { textAlign: 'center' }]}>
            Sign in with email or continue with Google.
          </Text>

          <View style={card}>
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Btn
              title={
                busy
                  ? 'Please wait…'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'
              }
              onPress={authenticate}
              disabled={busy}
            />

            <Btn
              title="Continue with Google"
              onPress={googleSignIn}
              secondary
            />

            <Btn
              title={
                mode === 'login'
                  ? 'Create a new account'
                  : 'I already have an account'
              }
              onPress={() =>
                setMode(
                  mode === 'login'
                    ? 'signup'
                    : 'login'
                )
              }
              secondary
            />
          </View>
        </ScrollView>
      )}

      {/* PROFILE */}

      {screen === 'profile' && (
        <ScrollView>
          <Brand small />

          <Text style={heading}>
            Complete your profile
          </Text>

          <Text style={note}>
            Add your details to continue to TALKZY.
          </Text>

          <View
            style={{
              alignItems: 'center',
              marginVertical: 12
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 52
                }}
              />
            ) : (
              <View
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 52,
                  backgroundColor: C.panel2,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ color: C.text, fontSize: 36 }}>
                  +
                </Text>
              </View>
            )}

            <Btn
              title="Choose profile picture"
              onPress={choosePhoto}
              secondary
            />
          </View>

          <Input
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={{ color: C.muted, marginTop: 14 }}>
            Gender
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            {[
              'Male',
              'Female',
              'Other',
              'Prefer not to say'
            ].map(g => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={{
                  padding: 10,
                  marginTop: 8,
                  borderRadius: 10,
                  backgroundColor:
                    gender === g ? C.accent : C.panel2
                }}
              >
                <Text
                  style={{
                    color: C.text,
                    fontSize: 12
                  }}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Date of birth (YYYY-MM-DD)"
            value={dob}
            onChangeText={setDob}
            placeholder="2000-05-21"
          />

          <Input
            label="Country"
            value={country}
            onChangeText={setCountry}
            placeholder="India"
          />

          <Btn
            title={busy ? 'Saving…' : 'Save Profile'}
            onPress={saveProfile}
            disabled={busy}
          />

          <Btn
            title="Sign Out"
            onPress={signOut}
            secondary
          />
        </ScrollView>
      )}

      {/* HOME */}

      {screen === 'home' && (
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Brand small />

            <TouchableOpacity
              onPress={() => setScreen('profile')}
            >
              <Text
                style={{
                  color: C.accent,
                  fontWeight: '800'
                }}
              >
                My Profile
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={heading}>
            Hello, {
              profile?.display_name ||
              session?.user?.email?.split('@')[0] ||
              'there'
            } 👋
          </Text>

          <Text style={note}>
            Find a room and start connecting.
          </Text>

          <View style={card}>
            <Text
              style={{
                color: C.text,
                fontSize: 18,
                fontWeight: '800'
              }}
            >
              Your TALKZY ID
            </Text>

            <Text
              style={{
                color: C.accent,
                fontSize: 24,
                fontWeight: '900',
                marginTop: 8
              }}
            >
              {profile?.talkzy_id || 'Being assigned'}
            </Text>

            <Text
              style={{
                color: C.muted,
                fontSize: 12,
                marginTop: 5
              }}
            >
              Your unique account ID appears here
              when assigned by the database.
            </Text>
          </View>

          <View style={card}>
            <Text
              style={{
                color: C.text,
                fontSize: 18,
                fontWeight: '800'
              }}
            >
              Create a room
            </Text>

            <Input
              label="Room name"
              value={roomName}
              onChangeText={setRoomName}
            />

            <Input
              label="Description (optional)"
              value={roomDescription}
              onChangeText={setRoomDescription}
            />

            <Btn
              title="Create Room"
              onPress={createRoom}
              disabled={busy}
            />
          </View>

          <View
            style={{
              marginTop: 22,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Text style={heading}>
              Discover rooms
            </Text>

            <TouchableOpacity onPress={loadRooms}>
              <Text
                style={{
                  color: C.accent,
                  fontWeight: '800'
                }}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {rooms.length === 0 ? (
            <Text style={note}>
              No rooms found yet. Create the first room.
            </Text>
          ) : (
            rooms.map((room, index) => (
              <View
                key={String(room.id || index)}
                style={card}
              >
                <Text
                  style={{
                    color: C.text,
                    fontSize: 17,
                    fontWeight: '800'
                  }}
                >
                  {room.name ||
                    room.room_name ||
                    'Untitled room'}
                </Text>

                <Text
                  style={{
                    color: C.muted,
                    marginTop: 5
                  }}
                >
                  {room.description ||
                    'Come in and say hello.'}
                </Text>

                <Text
                  style={{
                    color: C.green,
                    fontSize: 12,
                    marginTop: 8
                  }}
                >
                  {room.member_count ??
                    room.members_count ??
                    0} members
                </Text>
              </View>
            ))
          )}

          <Btn
            title="Owner / Admin"
            onPress={() => setScreen('ownerLogin')}
            secondary
          />

          <Btn
            title="Sign Out"
            onPress={signOut}
            danger
          />
        </ScrollView>
      )}

      {/* OWNER LOGIN */}

      {screen === 'ownerLogin' && (
        <ScrollView>
          <Brand small />

          <Text style={heading}>
            Owner access
          </Text>

          <Text style={note}>
            Sign in using the owner credentials
            configured on your backend.
          </Text>

          <Input
            label="Owner email"
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            keyboardType="email-address"
          />

          <Input
            label="Owner password"
            value={ownerPassword}
            onChangeText={setOwnerPassword}
            secureTextEntry
          />

          <Btn
            title="Sign In as Owner"
            onPress={ownerLogin}
            disabled={busy}
          />

          <Btn
            title="Back"
            onPress={() => setScreen('home')}
            secondary
          />
        </ScrollView>
      )}

      {/* OWNER SETTINGS */}

      {screen === 'owner' && (
        <ScrollView>
          <Brand small />

          <Text style={heading}>
            Owner settings
          </Text>

          <Text style={note}>
            Edit the JSON settings supported by your backend.
            Keep the JSON valid.
          </Text>

          <TextInput
            multiline
            value={settingsText}
            onChangeText={setSettingsText}
            autoCapitalize="none"
            style={{
              minHeight: 260,
              textAlignVertical: 'top',
              backgroundColor: C.panel2,
              color: C.text,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              padding: 14,
              fontFamily: 'monospace'
            }}
          />

          <Btn
            title="Save Settings"
            onPress={saveSettings}
            disabled={busy}
          />

          <Btn
            title="Back to TALKZY"
            onPress={() => setScreen('home')}
            secondary
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
  
