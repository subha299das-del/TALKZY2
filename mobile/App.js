import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView,
  StatusBar, Alert, Image, ActivityIndicator
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const BUCKET = 'talkzy-profiles';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

const defaults = {
  appName: 'TALKZY',
  tagline: 'Talk • Connect • Earn',
  primary: '#8B5CF6',
  background: '#0B0812',
  card: '#171225',
  bannerTitle: 'Your voice. Your community.',
  bannerText: 'Join conversations and meet new people.',
  announcement: 'Welcome to TALKZY!'
};

function apiUrl(path) {
  if (!API_BASE_URL) throw new Error('TALKZY server address is not configured.');
  if (!API_BASE_URL.startsWith('https://')) throw new Error('TALKZY server address must use HTTPS.');
  return `${API_BASE_URL}${path}`;
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function Button({ title, onPress, outline = false, disabled = false }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: outline ? '#21182F' : '#8B5CF6',
        borderColor: '#63458B',
        borderWidth: outline ? 1 : 0,
        padding: 14, borderRadius: 13, alignItems: 'center',
        marginTop: 10, opacity: disabled ? 0.55 : 1
      }}
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>{title}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: '#CFC3DE', fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#82768F"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={{
          backgroundColor: '#171225', color: 'white', padding: 14,
          borderRadius: 12, borderWidth: 1, borderColor: '#38294A',
          minHeight: multiline ? 82 : 48, textAlignVertical: multiline ? 'top' : 'center'
        }}
      />
    </View>
  );
}

export default function App() {
  const [config, setConfig] = useState(defaults);
  const [screen, setScreen] = useState('auth');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [ownerToken, setOwnerToken] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [draft, setDraft] = useState(defaults);

  useEffect(() => {
    refreshConfig();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        loadProfile(data.session);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        loadProfile(nextSession);
      } else {
        setProfile(null);
        setScreen('auth');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function refreshConfig() {
    try {
      const c = await readResponse(await fetch(apiUrl('/api/config')));
      setConfig({ ...defaults, ...c });
      setDraft({ ...defaults, ...c });
    } catch (_) {
      // The app can still open with its built-in design if the server is asleep.
    }
  }

  async function loadProfile(activeSession) {
    try {
      const { data, error } = await supabase
        .from('talkzy_profiles')
        .select('talkzy_id, display_name, age, gender, avatar_url')
        .eq('id', activeSession.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        Alert.alert('Profile setup', 'Your profile record was not found. Please contact TALKZY support.');
        return;
      }

      setProfile(data);
      setDisplayName(data.display_name || activeSession.user.user_metadata?.display_name || '');
      setAge(data.age ? String(data.age) : '');
      setGender(data.gender || '');
      setAvatarUri(data.avatar_url || '');

      if (!data.display_name || !data.age || !data.gender) {
        setScreen('profile');
      } else {
        setScreen('home');
      }
    } catch (error) {
      Alert.alert('Profile', error.message);
    }
  }

  async function signUp() {
    if (!displayName.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Check details', 'Enter your name, email and a password with at least 8 characters.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: displayName.trim() } }
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        await loadProfile(data.session);
      } else {
        Alert.alert('Verify your email', 'Check your email inbox, verify your address, then return and sign in.');
        setMode('login');
      }
    } catch (error) {
      Alert.alert('Sign up failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    if (!email.trim() || !password) {
      Alert.alert('Enter details', 'Enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password
      });
      if (error) throw error;
      setSession(data.session);
      await loadProfile(data.session);
    } catch (error) {
      Alert.alert('Sign in failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    try {
      setLoading(true);
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true }
      });
      if (error) throw error;
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code;
        if (code) {
          const { data: sessionData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(String(code));
          if (exchangeError) throw exchangeError;
          if (sessionData.session) {
            setSession(sessionData.session);
            await loadProfile(sessionData.session);
          }
        } else {
          const hash = result.url.split('#')[1] || '';
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { data: sessionData, error: setError } =
              await supabase.auth.setSession({ access_token, refresh_token });
            if (setError) throw setError;
            if (sessionData.session) await loadProfile(sessionData.session);
          }
        }
      }
    } catch (error) {
      Alert.alert('Google sign in', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8
    });
    if (!result.canceled && result.assets?.[0]?.uri) setAvatarUri(result.assets[0].uri);
  }

  async function saveProfile() {
    const numericAge = Number(age);
    if (!displayName.trim() || !Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {
      Alert.alert('Profile details', 'Enter a display name and a valid age between 13 and 120.');
      return;
    }
    if (!['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) {
      Alert.alert('Choose gender', 'Please select a gender option.');
      return;
    }
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      let publicAvatarUrl = profile?.avatar_url || null;

      if (avatarUri && !avatarUri.startsWith('http')) {
        const response = await fetch(avatarUri);
        const blob = await response.blob();
        const extension = (avatarUri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
        const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
        const filePath = `${session.user.id}/${Date.now()}.${safeExtension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, blob, {
            contentType: safeExtension === 'jpg' ? 'image/jpeg' : `image/${safeExtension}`,
            upsert: true
          });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        publicAvatarUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('talkzy_profiles')
        .update({
          display_name: displayName.trim(),
          age: numericAge,
          gender,
          avatar_url: publicAvatarUrl
        })
        .eq('id', session.user.id)
        .select('talkzy_id, display_name, age, gender, avatar_url')
        .single();

      if (error) throw error;
      setProfile(data);
      setAvatarUri(data.avatar_url || '');
      setScreen('home');
      Alert.alert('Profile saved', 'Your TALKZY profile has been saved.');
    } catch (error) {
      Alert.alert('Could not save profile', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setScreen('auth');
  }

  async function loadRooms() {
    try {
      const data = await readResponse(await fetch(apiUrl('/api/rooms')));
      setRooms(data.rooms || []);
    } catch (error) {
      Alert.alert('Rooms', error.message);
    }
  }

  async function createRoom() {
    if (!roomName.trim() || roomName.trim().length < 3) {
      Alert.alert('Room name', 'Enter a room name with at least 3 characters.');
      return;
    }
    if (roomType === 'locked' && roomPassword.length < 4) {
      Alert.alert('Room password', 'Set a room password with at least 4 characters.');
      return;
    }
    try {
      setLoading(true);
      const data = await readResponse(await fetch(apiUrl('/api/rooms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          roomName: roomName.trim(),
          description: roomDescription.trim(),
          roomType,
          password: roomType === 'locked' ? roomPassword : ''
        })
      }));
      Alert.alert('Room created', `Your room "${data.room?.room_name || roomName}" has been created. Voice streaming is not connected yet.`);
      setRoomName('');
      setRoomDescription('');
      setRoomPassword('');
      setScreen('rooms');
      loadRooms();
    } catch (error) {
      Alert.alert('Could not create room', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function ownerLogin() {
    try {
      setLoading(true);
      const data = await readResponse(await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, password: ownerPassword })
      }));
      setOwnerToken(data.token);
      setDraft({ ...config });
      setOwnerPassword('');
      setScreen('admin');
    } catch (error) {
      Alert.alert('Owner sign in', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setLoading(true);
      const data = await readResponse(await fetch(apiUrl('/api/config'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify(draft)
      }));
      setConfig({ ...defaults, ...data });
      Alert.alert('Published', 'TALKZY interface settings have been saved.');
      setScreen(session ? 'home' : 'auth');
    } catch (error) {
      Alert.alert('Could not publish', error.message);
    } finally {
      setLoading(false);
    }
  }

  const bg = config.background || defaults.background;
  const card = config.card || defaults.card;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle="light-content" />
      <ExpoStatusBar style="light" />
      <View style={{ paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: config.primary, fontWeight: '900', letterSpacing: 3, fontSize: 19 }}>{config.appName}</Text>
          <Text style={{ color: '#B9AEC8', fontSize: 11 }}>{config.tagline}</Text>
        </View>
        <TouchableOpacity onPress={() => setScreen('ownerLogin')}>
          <Text style={{ color: '#BCA5E8', fontWeight: '700' }}>Owner</Text>
        </TouchableOpacity>
      </View>

      {screen === 'auth' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ backgroundColor: card, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#45305F' }}>
            <Text style={{ color: 'white', fontSize: 27, fontWeight: '900' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={{ color: '#C3B8D1', marginTop: 7 }}>Talk • Connect • Make new friends</Text>
            {mode === 'signup' && (
              <Field label="Your display name" value={displayName} onChangeText={setDisplayName} />
            )}
            <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field label="Password (minimum 8 characters)" value={password} onChangeText={setPassword} secureTextEntry />
            <Button disabled={loading} title={loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} onPress={mode === 'login' ? signIn : signUp} />
            <Button disabled={loading} outline title="Continue with Google" onPress={googleSignIn} />
            <Button outline title={mode === 'login' ? 'Create a new account' : 'I already have an account'} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} />
          </View>
          <Text style={{ color: '#81758F', fontSize: 11, marginTop: 18, textAlign: 'center' }}>
            TALKZY uses email and Google sign-in. No mobile-number OTP is required.
          </Text>
        </ScrollView>
      )}

      {screen === 'profile' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 25, fontWeight: '900' }}>Set up your profile</Text>
          <Text style={{ color: '#B9AEC8', marginTop: 6 }}>Choose how other TALKZY members will see you.</Text>
          <TouchableOpacity onPress={choosePhoto} style={{ alignSelf: 'center', marginVertical: 20, width: 112, height: 112, borderRadius: 56, backgroundColor: card, borderWidth: 2, borderColor: config.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={{ width: 112, height: 112 }} /> : <Text style={{ color: 'white', textAlign: 'center' }}>Choose photo</Text>}
          </TouchableOpacity>
          <Button outline title="Choose profile picture" onPress={choosePhoto} />
          <Field label="Display name" value={displayName} onChangeText={setDisplayName} />
          <Field label="Age (13–120)" value={age} onChangeText={setAge} keyboardType="number-pad" />
          <Text style={{ color: '#CFC3DE', fontWeight: '700', marginTop: 16 }}>Gender</Text>
          {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
            <TouchableOpacity key={option} onPress={() => setGender(option)} style={{ padding: 13, borderRadius: 11, marginTop: 8, backgroundColor: gender === option ? '#49316B' : card, borderWidth: 1, borderColor: gender === option ? config.primary : '#38294A' }}>
              <Text style={{ color: 'white' }}>{gender === option ? '●  ' : '○  '}{option}</Text>
            </TouchableOpacity>
          ))}
          <Button disabled={loading} title={loading ? 'Saving…' : 'Save profile'} onPress={saveProfile} />
          <Button outline title="Sign out" onPress={signOut} />
        </ScrollView>
      )}

      {screen === 'home' && (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <View style={{ backgroundColor: card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#45305F' }}>
            <Text style={{ color: config.primary, fontWeight: '800' }}>WELCOME TO TALKZY</Text>
            <Text style={{ color: 'white', fontSize: 25, fontWeight: '900', marginTop: 8 }}>{profile?.display_name || 'TALKZY Member'}</Text>
            <Text style={{ color: '#C3B8D1', marginTop: 8 }}>Your TALKZY ID: {profile?.talkzy_id || 'Loading…'}</Text>
            {profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={{ width: 76, height: 76, borderRadius: 38, marginTop: 14 }} /> : null}
            <Button title="Edit profile" onPress={() => setScreen('profile')} />
          </View>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', marginTop: 22 }}>{config.bannerTitle}</Text>
          <Text style={{ color: '#C3B8D1', marginTop: 6 }}>{config.bannerText}</Text>
          <View style={{ backgroundColor: card, padding: 15, borderRadius: 14, marginTop: 16 }}>
            <Text style={{ color: config.primary, fontWeight: '800' }}>ANNOUNCEMENT</Text>
            <Text style={{ color: '#D8CDEA', marginTop: 6 }}>{config.announcement}</Text>
          </View>
          <Button title="Explore public rooms" onPress={() => { setScreen('rooms'); loadRooms(); }} />
          <Button outline title="Create a voice room" onPress={() => setScreen('createRoom')} />
          <Button outline title="Refresh home" onPress={refreshConfig} />
          <Button outline title="Sign out" onPress={signOut} />
          <Text style={{ color: '#81758F', fontSize: 11, marginTop: 16 }}>
            Room creation and discovery connect to your server. Live audio streaming is not yet integrated.
          </Text>
        </ScrollView>
      )}

      {screen === 'rooms' && (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Public voice rooms</Text>
          <Button title="Refresh rooms" onPress={loadRooms} />
          <Button outline title="Create a room" onPress={() => setScreen('createRoom')} />
          {rooms.length === 0 ? <Text style={{ color: '#B9AEC8', marginTop: 20 }}>No public rooms found. Refresh to check again.</Text> :
            rooms.map(room => (
              <View key={room.id} style={{ backgroundColor: card, padding: 15, borderRadius: 14, marginTop: 12 }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 17 }}>{room.room_name}</Text>
                <Text style={{ color: '#B9AEC8', marginTop: 5 }}>{room.description || 'No description'}</Text>
                <Text style={{ color: config.primary, marginTop: 7 }}>Public • Active</Text>
                <Text style={{ color: '#81758F', fontSize: 11, marginTop: 6 }}>Voice connection is not available yet.</Text>
              </View>
            ))
          }
          <Button outline title="Back home" onPress={() => setScreen('home')} />
        </ScrollView>
      )}

      {screen === 'createRoom' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Create a voice room</Text>
          <Field label="Room name" value={roomName} onChangeText={setRoomName} />
          <Field label="Description (optional)" value={roomDescription} onChangeText={setRoomDescription} multiline />
          <Text style={{ color: '#CFC3DE', fontWeight: '700', marginTop: 16 }}>Room type</Text>
          {['public', 'locked'].map(option => (
            <TouchableOpacity key={option} onPress={() => setRoomType(option)} style={{ padding: 13, borderRadius: 11, marginTop: 8, backgroundColor: roomType === option ? '#49316B' : card, borderWidth: 1, borderColor: roomType === option ? config.primary : '#38294A' }}>
              <Text style={{ color: 'white' }}>{roomType === option ? '●  ' : '○  '}{option === 'public' ? 'Public' : 'Locked (password required)'}</Text>
            </TouchableOpacity>
          ))}
          {roomType === 'locked' && <Field label="Room password (minimum 4 characters)" value={roomPassword} onChangeText={setRoomPassword} secureTextEntry />}
          <Button disabled={loading} title={loading ? 'Creating…' : 'Create room'} onPress={createRoom} />
          <Button outline title="Cancel" onPress={() => setScreen('home')} />
        </ScrollView>
      )}

      {screen === 'ownerLogin' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Owner sign in</Text>
          <Field label="Owner email" value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" />
          <Field label="Owner password" value={ownerPassword} onChangeText={setOwnerPassword} secureTextEntry />
          <Button disabled={loading} title={loading ? 'Please wait…' : 'Sign in as owner'} onPress={ownerLogin} />
          <Button outline title="Back" onPress={() => setScreen(session ? 'home' : 'auth')} />
        </ScrollView>
      )}

      {screen === 'admin' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>TALKZY interface control</Text>
          {[
            ['appName', 'App name'], ['tagline', 'Tagline'], ['primary', 'Accent colour (#RRGGBB)'],
            ['background', 'Background colour (#RRGGBB)'], ['card', 'Card colour (#RRGGBB)'],
            ['bannerTitle', 'Home banner title'], ['bannerText', 'Home banner text'], ['announcement', 'Announcement']
          ].map(([key, label]) => (
            <Field key={key} label={label} value={String(draft[key] ?? '')} onChangeText={value => setDraft(old => ({ ...old, [key]: value }))} />
          ))}
          <Button disabled={loading} title={loading ? 'Publishing…' : 'Publish changes'} onPress={saveSettings} />
          <Button outline title="Back" onPress={() => setScreen(session ? 'home' : 'auth')} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
