 import React, { useEffect, useState, useRef } from 'react';
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
    ActivityIndicator,
  Modal
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

  const profileLoadRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [screen, setScreen] = useState('login');
  const [popularReturnScreen, setPopularReturnScreen] = useState('main');
  const [activeTab, setActiveTab] = useState('Room');
  const [roomSettingsType, setRoomSettingsType] = useState('public');
const [roomSettingsPassword, setRoomSettingsPassword] = useState('');

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
  const [language, setLanguage] = useState('English');
const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);

  // ---------------------------------
  // ROOM STATES
  // ---------------------------------

  const [roomTab, setRoomTab] = useState('Mine');
  const [popularPage, setPopularPage] = useState('main');
  const [mineTab, setMineTab] = useState('Recent');
  const [countrySearch, setCountrySearch] = useState('');
  
  // COMMUNITY ACTIVITY STATES
const [showMySubscription, setShowMySubscription] = useState(false);
const [subscriptionTab, setSubscriptionTab] = useState('My Subscription');
 
  const [hotEventIndex, setHotEventIndex] = useState(0);
const hotEventsScrollRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [followedRooms, setFollowedRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);

  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomDpUri, setRoomDpUri] = useState(null);
const [roomDpUploading, setRoomDpUploading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showJoinPassword, setShowJoinPassword] = useState(false);
const [joinPassword, setJoinPassword] = useState('');
const [joiningRoom, setJoiningRoom] = useState(false);
  const [joinTargetRoom, setJoinTargetRoom] = useState(null);

  // ---------------------------------
  // OTHER TAB STATES
  // ---------------------------------

  const [gameTab, setGameTab] = useState('Hot Games');
  const [momentTab, setMomentTab] = useState('Follow');
  const [messageTab, setMessageTab] = useState('Message');

  
  // HOT EVENTS AUTO ROTATION
  useEffect(() => {
    const timer = setInterval(() => {
      setHotEventIndex(current => {
        const next = (current + 1) % 3;

        hotEventsScrollRef.current?.scrollTo({
          x: next * 270,
          animated: true
        });

        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);
  

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
  (_event, newSession) => {
    if (!mounted) return;

    setSession(newSession);

    if (newSession) {
      Promise.resolve().then(() => {
        if (mounted) {
          loadUserProfile(newSession);
        }
      });
    } else {
      profileLoadRef.current = null;
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
  const userId = currentSession?.user?.id;

  if (!userId) return;

  // Prevent duplicate profile loading for the same user
  if (
    profileLoadRef.current &&
    profileLoadRef.current.userId === userId
  ) {
    return profileLoadRef.current.promise;
  }

  const loadPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('talkzy_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (profileLoadRef.current?.promise !== loadPromise) {
  return;
      }

      // Check whether the profile is incomplete
      if (
        !data ||
        !data.display_name ||
        !data.gender ||
        !data.date_of_birth ||
        !data.country ||
        !data.language ||
        !data.bio
      ) {
        setProfile(data || null);
        setScreen('profile');
        return;
      }

      // Load completed profile
      setProfile(data);
      setDisplayName(data.display_name || '');
      setGender(data.gender || 'Male');
      setDateOfBirth(data.date_of_birth || '');
      setCountry(data.country || 'India');
      setLanguage(data.language || 'English');
      setBio(data.bio || '');
      setAvatarUri(data.avatar_url || null);

      setScreen('main');

      loadPublicRooms();
      loadMyRooms(currentSession);
      loadJoinedRooms(currentSession);
      loadFollowedRooms(currentSession);

    } catch (error) {
      console.log('Profile loading error:', error.message);

      Alert.alert(
        'Profile error',
        'Could not load your profile. Please try again.'
      );

      setScreen('profile');

    } finally {
      if (profileLoadRef.current?.promise === loadPromise) {
        profileLoadRef.current = null;
      }
    }
  })();

  profileLoadRef.current = {
    userId,
    promise: loadPromise
  };

  return loadPromise;
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
  // SELECT ROOM DISPLAY PICTURE
  // ---------------------------------

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
    
if (!gender || !country.trim() || !language.trim() || !bio.trim()) {
  Alert.alert(
    'Incomplete profile',
    'Please complete your gender, country, language and bio.'
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
  display_name: displayName.trim(),
  gender,
  date_of_birth: dateOfBirth,
  country: country.trim(),
  language: language.trim(),
  bio: bio.trim()
};

      if (uploadedAvatar) {
        profileData.avatar_url = uploadedAvatar;
      }

      const { data, error } = await supabase
  .from('talkzy_profiles')
  .update(profileData)
  .eq('id', userId)
  .select('*')
  .single();

      if (error) throw error;

      setProfile(data);
setAvatarUri(data.avatar_url || null);

setScreen('main');

loadPublicRooms();
loadMyRooms(session);
loadJoinedRooms(session);
loadFollowedRooms(session);


      Alert.alert(
        'Welcome to TALKZY!',
        `Your TALKZY ID is ${data.talkzy_id || 'being assigned'}.`
      );
    
} catch (error) {
  const errorDetails = {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    sessionUserId: session?.user?.id,
  };

  console.log(
    'PROFILE SAVE ERROR:',
    JSON.stringify(errorDetails, null, 2)
  );

  Alert.alert(
    'Profile save diagnostic',
    JSON.stringify(errorDetails, null, 2)
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

  
async function loadMyRooms(currentSession = session) {
  try {
    if (!currentSession?.access_token) return;

    const result = await api('/api/rooms/mine', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });

    const allRooms = Array.isArray(result.rooms)
      ? result.rooms
      : [];

    setMyRooms(allRooms);

  } catch (error) {
    console.log('My rooms:', error.message);
  }
}
   // ADD THE NEW FUNCTION HERE

async function loadJoinedRooms(currentSession = session) {
  try {
    if (!currentSession?.access_token) return;

    const result = await api('/api/rooms/joined', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });

    const allRooms = Array.isArray(result.rooms)
      ? result.rooms
      : [];

    setJoinedRooms(allRooms);

  } catch (error) {
    console.log('Joined rooms:', error.message);
  }
}
  
async function loadFollowedRooms(currentSession = session) {
  try {
    if (!currentSession?.access_token) return;

    const result = await api('/api/rooms/followed', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });

    const allRooms = Array.isArray(result.rooms)
      ? result.rooms
      : [];

    setFollowedRooms(allRooms);

  } catch (error) {
    console.log('Followed rooms:', error.message);
  }
}

async function toggleFollowRoom(room) {
  if (!room || !session?.access_token) {
    Alert.alert('Login required', 'Please sign in again.');
    return;
  }

  const isFollowing = followedRooms.some(
    item => item.id === room.id
  );

  try {
    const result = await api(
      `/api/rooms/${room.id}/follow`,
      {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    await loadFollowedRooms();

    Alert.alert(
      'Success',
      isFollowing
        ? 'Room unfollowed successfully.'
        : 'Room followed successfully.'
    );

  } catch (error) {
    Alert.alert(
      'Follow error',
      error.message || 'Could not update followed rooms.'
    );
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

    if (room.room_type === 'locked') {
      setJoinTargetRoom(room);
      setJoinPassword('');
      setShowJoinPassword(true);
      return;
    }

    await submitRoomJoin(room, '');
  }

  async function submitRoomJoin(room, password) {
    if (!room || !session?.access_token) {
      Alert.alert('Error', 'Please sign in again.');
      return;
    }

    try {
      setJoiningRoom(true);

      await api(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ password })
      });
      await loadJoinedRooms();
      
      setShowJoinPassword(false);
      setJoinPassword('');
      setJoinTargetRoom(null);

      Alert.alert(
        'Success',
        `You have joined ${room.room_name}.`
      );

    } catch (error) {
      Alert.alert(
        'Unable to join',
        error.message || 'Could not join this room.'
      );
    } finally {
      setJoiningRoom(false);
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

  try {
    setSaving(true);

    let roomDpUrl = null;

    // Upload room picture
    if (roomDpUri) {
      setRoomDpUploading(true);

      const response = await fetch(roomDpUri);
      const blob = await response.blob();

      const filePath =
        `${session.user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('talkzy-rooms')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('talkzy-rooms')
        .getPublicUrl(filePath);

      roomDpUrl = publicData.publicUrl;
    }

    // Create room
    await api('/api/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        roomName: roomName.trim(),
        description: roomDescription.trim(),
        roomType: 'public',
        roomDpUrl
      })
    });

    // Refresh room lists
    await loadPublicRooms();
    await loadMyRooms();

    // Clear creation form
    setRoomName('');
    setRoomDescription('');
    setRoomPassword('');
    setRoomType('public');
    setRoomDpUri(null);

    // Return to Mine
    setActiveTab('Room');
    setRoomTab('Mine');
    setMineTab('Recent');
    setScreen('main');

    Alert.alert(
      'Success',
      'Your room has been created successfully.'
    );

  } catch (error) {
    Alert.alert(
      'Room creation failed',
      error.message || 'Something went wrong.'
    );
  } finally {
    setRoomDpUploading(false);
    setSaving(false);
  }
}
  
  // =========================================
  // ROOM: SAVE ROOM SETTINGS
  // =========================================

  async function saveRoomSettings() {
    if (!selectedRoom) {
      Alert.alert('Error', 'No room selected.');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Login required', 'Please sign in again.');
      return;
    }

    if (
      roomSettingsType === 'locked' &&
      (
        roomSettingsPassword.length < 4 ||
        roomSettingsPassword.length > 64
      )
    ) {
      Alert.alert(
        'Password required',
        'Room password must be 4 to 64 characters.'
      );
      return;
    }

    try {
      setSaving(true);

      const result = await api(
        `/api/rooms/${selectedRoom.id}/type`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            roomType: roomSettingsType,
            password:
              roomSettingsType === 'locked'
                ? roomSettingsPassword
                : undefined
          })
        }
      );

      setSelectedRoom({
        ...selectedRoom,
        ...result.room
      });

      setRoomSettingsPassword('');

      await loadPublicRooms();
      await loadMyRooms();

      Alert.alert(
        'Success',
        'Room privacy settings updated.'
      );

      setScreen('main');

    } catch (error) {
      Alert.alert(
        'Update failed',
        error.message || 'Could not update room settings.'
      );
    } finally {
      setSaving(false);
    }
  }

  
  // =========================================
  // ROOM: JOIN ROOM
  // =========================================



function renderCreateRoom() {
  

  return (
    <Card>
      <Heading>Create your room</Heading>

      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 10
        }}
      >
        Room Display Picture
      </Text>

      <TouchableOpacity
        onPress={chooseRoomDp}
        disabled={saving}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          padding: 15,
          borderWidth: 1,
          borderColor: '#777777',
          borderStyle: 'dashed',
          borderRadius: 14
        }}
      >
        {roomDpUri ? (
          <Image
            source={{ uri: roomDpUri }}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55
            }}
          />
        ) : (
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: '#252535',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 35, color: '#FFFFFF' }}>
              +
            </Text>
          </View>
        )}

        <Text style={{ color: '#FFFFFF', marginTop: 10 }}>
          {roomDpUri ? 'Change Room Picture' : 'Choose Room Picture'}
        </Text>
      </TouchableOpacity>

      <Field
        label="Room name"
        value={roomName}
        onChangeText={setRoomName}
        placeholder="Enter room name"
      />

      <Field
        label="Room announcement"
        value={roomDescription}
        onChangeText={setRoomDescription}
        placeholder="Write your room announcement"
      />

      <Button
        title={
          saving
            ? roomDpUploading
              ? 'Uploading picture...'
              : 'Creating...'
            : 'Create Room'
        }
        onPress={createRoom}
        disabled={saving}
      />

      <Button
  title="Cancel"
  secondary
  onPress={() => {
    setRoomDpUri(null);
    setRoomName('');
    setRoomDescription('');
setRoomType('public');
setRoomPassword('');
setScreen('main');
  }}
/>
    </Card>
  );
          }


          
  // =========================================
  // ROOM: ROOM CARD
  // =========================================

  
function renderRoomCard(room, showJoin = true) {
  const isOwner =
    room.owner_id === session?.user?.id;

  return (
    <Card
      key={room.id}
      style={{
        padding: 10,
        marginBottom: 9,
        borderRadius: 12
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        {/* ROOM DP */}
        {room.room_dp_url ? (
          <Image
            source={{ uri: room.room_dp_url }}
            style={{
              width: 62,
              height: 62,
              borderRadius: 10,
              marginRight: 11
            }}
          />
        ) : (
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 10,
              backgroundColor: C.line,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 11
            }}
          >
            <Text style={{ fontSize: 25 }}>🎙️</Text>
          </View>
        )}

        {/* ROOM INFORMATION */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: C.text,
                fontSize: 14,
                fontWeight: '900',
                flexShrink: 1
              }}
            >
              {room.room_name}
            </Text>

            <View
              style={{
                backgroundColor: C.accent,
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 4,
                marginLeft: 6
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 8,
                  fontWeight: '900'
                }}
              >
                FAMILY
              </Text>
            </View>

            {isOwner && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedRoom(room);
                  setRoomSettingsType(
                    room.room_type || 'public'
                  );
                  setRoomSettingsPassword('');
                  setScreen('roomSettings');
                }}
                style={{ marginLeft: 7 }}
              >
                <Text style={{ color: C.gold, fontSize: 16 }}>
                  ⚙
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: C.muted,
              fontSize: 10,
              marginTop: 5
            }}
          >
            {room.country_flag || '🌍'} {room.country_name || 'Country not set'}
            {room.medals ? `  ${room.medals}` : ''}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: C.muted,
              fontSize: 11,
              marginTop: 5
            }}
          >
            {room.description || 'Welcome to TALKZY'}
          </Text>
        </View>

        {/* CURRENT ACTIVE USERS */}
        {typeof room.active_users === 'number' && (
          <Text
            style={{
              color: C.muted,
              fontSize: 11,
              marginLeft: 7
            }}
          >
            {room.active_users}
          </Text>
        )}
      </View>
    </Card>
  );
                    }


  // =========================================
  // ROOM: SETTINGS SCREEN
  // =========================================

  function renderRoomSettings() {
    if (!selectedRoom) {
      return (
        <Card>
          <Heading>Room not selected</Heading>
          <Button
            title="Back to Rooms"
            onPress={() => setScreen('main')}
          />
        </Card>
      );
    }

    return (
      <Card>
        <Heading>Room Settings</Heading>

        {selectedRoom.room_dp_url ? (
          <Image
            source={{ uri: selectedRoom.room_dp_url }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              alignSelf: 'center',
              marginVertical: 15
            }}
          />
        ) : null}

        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: 20
          }}
        >
          {selectedRoom.room_name}
        </Text>

        <SectionTitle>Room Privacy</SectionTitle>

        <View style={{ flexDirection: 'row', marginBottom: 18 }}>
          <Chip
            title="Public"
            active={roomSettingsType === 'public'}
            onPress={() => {
              setRoomSettingsType('public');
              setRoomSettingsPassword('');
            }}
          />

          <Chip
            title="Locked"
            active={roomSettingsType === 'locked'}
            onPress={() => setRoomSettingsType('locked')}
          />
        </View>

        {roomSettingsType === 'locked' && (
          <Field
            label="Room Password"
            value={roomSettingsPassword}
            onChangeText={setRoomSettingsPassword}
            placeholder="Enter a new password (4–64 characters)"
            secureTextEntry
          />
        )}

        <Button
          title={saving ? 'Saving...' : 'Save Settings'}
          onPress={saveRoomSettings}
          disabled={saving}
        />

        <Button
          title="Back to Rooms"
          secondary
          onPress={() => setScreen('main')}
        />
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
          onPress={() => setScreen('createRoom')}
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


        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          {['Recent', 'Joined', 'Follow'].map(item => (
            <Chip
              key={item}
              title={item}
              active={mineTab === item}
              onPress={() => {
  
setMineTab(item);

if (item === 'Joined') {
  loadJoinedRooms();
}

if (item === 'Follow') {
  loadFollowedRooms();
}
}}

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

            <SectionTitle>Recently Visited Rooms</SectionTitle>

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
  <>
    <SectionTitle>My Joined Rooms</SectionTitle>

    {joinedRooms.length === 0 ? (
      <ComingSoon
        title="No joined rooms"
        description="Rooms you join will appear here."
      />
    ) : (
      joinedRooms.map(room =>
        renderRoomCard(room, false)
      )
    )}

    <Button
      title="Refresh Joined Rooms"
      secondary
      onPress={loadJoinedRooms}
    />
  </>
)}

        {mineTab === 'Follow' && (
  <>
    <SectionTitle>My Followed Rooms</SectionTitle>

    {followedRooms.length === 0 ? (
      <ComingSoon
        title="No followed rooms"
        description="Follow your favourite rooms and they will appear here."
      />
    ) : (
      followedRooms.map(room => (
        <View key={room.id}>
          {renderRoomCard(room, false)}

          <Button
            title="Unfollow"
            secondary
            onPress={() => toggleFollowRoom(room)}
          />
        </View>
      ))
    )}

    <Button
      title="Refresh Followed Rooms"
      secondary
      onPress={loadFollowedRooms}
    />
  </>
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
      <SectionTitle>🔥 Hot Events</SectionTitle>

      
      <ScrollView
        ref={hotEventsScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 18 }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / 270
          );
          setHotEventIndex(Math.min(index, 2));
        }}
      >
        {[
          {
            title: 'TALKZY SPOTLIGHT',
            subtitle: 'Discover exciting community events',
            emoji: '🔥',
            color: '#7C3AED'
          },
          {
            title: 'VOICE ROOM CHALLENGE',
            subtitle: 'Join the excitement and participate',
            emoji: '🎤',
            color: '#E04F5F'
          },
          {
            title: 'GIFT FESTIVAL',
            subtitle: 'Celebrate with the TALKZY community',
            emoji: '🎁',
            color: '#D69B24'
          }
        ].map((event, index) => (
          <View
            key={index}
            style={{
              width: 260,
              height: 125,
              backgroundColor: event.color,
              borderRadius: 15,
              padding: 16,
              justifyContent: 'center',
              marginRight: 10
            }}
          >
            <Text style={{ fontSize: 25 }}>
              {event.emoji}
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 17,
              fontWeight: '900',
              marginTop: 5
            }}>
              {event.title}
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 11,
              marginTop: 5
            }}>
              {event.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 18
      }}>
        {[0, 1, 2].map(index => (
          <View
            key={index}
            style={{
              width: hotEventIndex === index ? 18 : 6,
              height: 6,
              borderRadius: 5,
              backgroundColor:
                hotEventIndex === index ? C.accent : C.line,
              marginHorizontal: 3
            }}
          />
        ))}
      </View>

              
      <SectionTitle>🏆 TALKZY Rankings</SectionTitle>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 18 }}
      >
        {[
          { emoji: '👑', title: 'Family Rankings', subtitle: 'Top TALKZY families' },
          { emoji: '🎁', title: 'Gift Rankings', subtitle: 'Top gift contributors' },
          { emoji: '❤️', title: 'CP Rankings', subtitle: 'Top TALKZY couples' }
        ].map((item, index) => (
          <View
            key={index}
            style={{
              width: 175,
              backgroundColor: C.panel,
              borderWidth: 1,
              borderColor: C.line,
              borderRadius: 14,
              padding: 15,
              marginRight: 10,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
            <Text
              style={{
                color: C.text,
                fontSize: 13,
                fontWeight: '900',
                marginTop: 8,
                textAlign: 'center'
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: C.muted,
                fontSize: 10,
                marginTop: 5,
                textAlign: 'center'
              }}
            >
              {item.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>
          
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => {
            loadPublicRooms();
            setScreen('hotRooms');
          }}
          style={{
            flex: 1,
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 13,
            padding: 18,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 25 }}>🔥</Text>
          <Text style={{ color: C.text, fontWeight: '900', marginTop: 6 }}>
            Hot Rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            loadPublicRooms();
            setScreen('newRooms');
          }}
          style={{
            flex: 1,
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 13,
            padding: 18,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 25 }}>✨</Text>
          <Text style={{ color: C.text, fontWeight: '900', marginTop: 6 }}>
            New Rooms
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function renderHotRooms() {
  return (
    <>
      <TouchableOpacity
        onPress={() => setScreen('main')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontSize: 23 }}>‹</Text>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginLeft: 10 }}>
          Hot Rooms
        </Text>
      </TouchableOpacity>

      {loadingRooms ? (
        <ActivityIndicator color={C.accent} />
      ) : rooms.length === 0 ? (
        <ComingSoon
          title="No hot rooms yet"
          description="Popular live rooms will appear here."
        />
      ) : (
        rooms.map(room => renderRoomCard(room))
      )}

      <Button
        title="Refresh Hot Rooms"
        secondary
        onPress={loadPublicRooms}
      />
    </>
  );
}

function renderNewRooms() {
  const newRooms = rooms
    .slice()
    .sort((a, b) =>
      new Date(b.created_at || 0) -
      new Date(a.created_at || 0)
    );

  return (
    <>
      <TouchableOpacity
        onPress={() => setScreen('main')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontSize: 23 }}>‹</Text>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginLeft: 10 }}>
          New Rooms
        </Text>
      </TouchableOpacity>

      {loadingRooms ? (
        <ActivityIndicator color={C.accent} />
      ) : newRooms.length === 0 ? (
        <ComingSoon
          title="No new rooms yet"
          description="Recently created public rooms will appear here."
        />
      ) : (
        newRooms.map(room => renderRoomCard(room))
      )}

      <Button
        title="Refresh New Rooms"
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
    <View style={{ padding: 20 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 20 }}>
        Discover Test Screen
      </Text>
    </View>
  );
  const countries = [
  // ASIA
  ['🇮🇳', 'India'],
  ['🇧🇩', 'Bangladesh'],
  ['🇳🇵', 'Nepal'],
  ['🇵🇰', 'Pakistan'],
  ['🇱🇰', 'Sri Lanka'],
  ['🇧🇹', 'Bhutan'],
  ['🇲🇻', 'Maldives'],
  ['🇦🇫', 'Afghanistan'],
  ['🇮🇷', 'Iran'],
  ['🇮🇶', 'Iraq'],
  ['🇮🇱', 'Israel'],
  ['🇵🇸', 'Palestine'],
  ['🇯🇴', 'Jordan'],
  ['🇱🇧', 'Lebanon'],
  ['🇸🇾', 'Syria'],
  ['🇸🇦', 'Saudi Arabia'],
  ['🇦🇪', 'United Arab Emirates'],
  ['🇶🇦', 'Qatar'],
  ['🇰🇼', 'Kuwait'],
  ['🇧🇭', 'Bahrain'],
  ['🇴🇲', 'Oman'],
  ['🇾🇪', 'Yemen'],
  ['🇹🇷', 'Turkey'],
  ['🇹🇭', 'Thailand'],
  ['🇻🇳', 'Vietnam'],
  ['🇲🇾', 'Malaysia'],
  ['🇸🇬', 'Singapore'],
  ['🇮🇩', 'Indonesia'],
  ['🇵🇭', 'Philippines'],
  ['🇯🇵', 'Japan'],
  ['🇰🇷', 'South Korea'],
  ['🇰🇵', 'North Korea'],
  ['🇲🇳', 'Mongolia'],
  ['🇰🇭', 'Cambodia'],
  ['🇱🇦', 'Laos'],
  ['🇲🇲', 'Myanmar'],
  ['🇧🇳', 'Brunei'],
  ['🇹🇱', 'Timor-Leste'],
  ['🇰🇿', 'Kazakhstan'],
  ['🇺🇿', 'Uzbekistan'],
  ['🇹🇲', 'Turkmenistan'],
  ['🇰🇬', 'Kyrgyzstan'],
  ['🇹🇯', 'Tajikistan'],
  ['🇦🇿', 'Azerbaijan'],
  ['🇦🇲', 'Armenia'],
  ['🇬🇪', 'Georgia'],
  ['🇨🇾', 'Cyprus'],
  ['🇷🇺', 'Russia'],

  // EUROPE
  ['🇬🇧', 'United Kingdom'],
  ['🇮🇪', 'Ireland'],
  ['🇫🇷', 'France'],
  ['🇩🇪', 'Germany'],
  ['🇮🇹', 'Italy'],
  ['🇪🇸', 'Spain'],
  ['🇵🇹', 'Portugal'],
  ['🇳🇱', 'Netherlands'],
  ['🇧🇪', 'Belgium'],
  ['🇱🇺', 'Luxembourg'],
  ['🇨🇭', 'Switzerland'],
  ['🇦🇹', 'Austria'],
  ['🇩🇰', 'Denmark'],
  ['🇸🇪', 'Sweden'],
  ['🇳🇴', 'Norway'],
  ['🇫🇮', 'Finland'],
  ['🇮🇸', 'Iceland'],
  ['🇵🇱', 'Poland'],
  ['🇨🇿', 'Czechia'],
  ['🇸🇰', 'Slovakia'],
  ['🇭🇺', 'Hungary'],
  ['🇷🇴', 'Romania'],
  ['🇧🇬', 'Bulgaria'],
  ['🇬🇷', 'Greece'],
  ['🇺🇦', 'Ukraine'],
  ['🇧🇾', 'Belarus'],
  ['🇲🇩', 'Moldova'],
  ['🇱🇹', 'Lithuania'],
  ['🇱🇻', 'Latvia'],
  ['🇪🇪', 'Estonia'],
  ['🇭🇷', 'Croatia'],
  ['🇸🇮', 'Slovenia'],
  ['🇷🇸', 'Serbia'],
  ['🇲🇪', 'Montenegro'],
  ['🇧🇦', 'Bosnia and Herzegovina'],
  ['🇲🇰', 'North Macedonia'],
  ['🇦🇱', 'Albania'],
  ['🇽🇰', 'Kosovo'],
  ['🇲🇹', 'Malta'],
  ['🇦🇩', 'Andorra'],
  ['🇲🇨', 'Monaco'],
  ['🇱🇮', 'Liechtenstein'],
  ['🇸🇲', 'San Marino'],
  ['🇻🇦', 'Vatican City'],

  // NORTH AMERICA AND CARIBBEAN
  ['🇺🇸', 'United States'],
  ['🇨🇦', 'Canada'],
  ['🇲🇽', 'Mexico'],
  ['🇬🇹', 'Guatemala'],
  ['🇧🇿', 'Belize'],
  ['🇭🇳', 'Honduras'],
  ['🇸🇻', 'El Salvador'],
  ['🇳🇮', 'Nicaragua'],
  ['🇨🇷', 'Costa Rica'],
  ['🇵🇦', 'Panama'],
  ['🇨🇺', 'Cuba'],
  ['🇯🇲', 'Jamaica'],
  ['🇭🇹', 'Haiti'],
  ['🇩🇴', 'Dominican Republic'],
  ['🇧🇸', 'Bahamas'],
  ['🇧🇧', 'Barbados'],
  ['🇹🇹', 'Trinidad and Tobago'],
  ['🇦🇬', 'Antigua and Barbuda'],
  ['🇩🇲', 'Dominica'],
  ['🇬🇩', 'Grenada'],
  ['🇰🇳', 'Saint Kitts and Nevis'],
  ['🇱🇨', 'Saint Lucia'],
  ['🇻🇨', 'Saint Vincent and the Grenadines'],

  // SOUTH AMERICA
  ['🇦🇷', 'Argentina'],
  ['🇧🇷', 'Brazil'],
  ['🇨🇱', 'Chile'],
  ['🇨🇴', 'Colombia'],
  ['🇵🇪', 'Peru'],
  ['🇻🇪', 'Venezuela'],
  ['🇪🇨', 'Ecuador'],
  ['🇧🇴', 'Bolivia'],
  ['🇵🇾', 'Paraguay'],
  ['🇺🇾', 'Uruguay'],
  ['🇬🇾', 'Guyana'],
  ['🇸🇷', 'Suriname'],

  // OCEANIA
  ['🇦🇺', 'Australia'],
  ['🇳🇿', 'New Zealand'],
  ['🇫🇯', 'Fiji'],
  ['🇵🇬', 'Papua New Guinea'],
  ['🇼🇸', 'Samoa'],
  ['🇹🇴', 'Tonga'],
  ['🇻🇺', 'Vanuatu'],
  ['🇸🇧', 'Solomon Islands'],
  ['🇰🇮', 'Kiribati'],
  ['🇹🇻', 'Tuvalu'],
  ['🇳🇷', 'Nauru'],
  ['🇵🇼', 'Palau'],
  ['🇲🇭', 'Marshall Islands'],
  ['🇫🇲', 'Micronesia']
];


  const filteredCountries = countries.filter(item =>
    item[1].toLowerCase().includes(countrySearch.toLowerCase())
  );
  return (
  <View style={{ padding: 20 }}>
    <Text style={{ color: C.text, fontSize: 20 }}>
      Discover Country Test
    </Text>
    <Text style={{ color: C.text }}>
      Countries found: {filteredCountries.length}
    </Text>
  </View>
);
  if (showMySubscription) {
    return (
      <>
        <Pressable
          onPress={() => setShowMySubscription(false)}
          style={{ marginBottom: 20 }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 16,
            fontWeight: '900'
          }}>
            ← Back to Discover
          </Text>
        </Pressable>

        <Text style={{
          color: C.text,
          fontSize: 22,
          fontWeight: '900',
          marginBottom: 20
        }}>
          💎 My Subscription
        </Text>

        <View style={{
          flexDirection: 'row',
          marginBottom: 20
        }}>
          {['My Subscription', 'Published Activities'].map(tab => (
            <Pressable
              key={tab}
              onPress={() => setSubscriptionTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                marginRight: 5,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor:
                  subscriptionTab === tab ? C.primary : C.panel
              }}
            >
              <Text style={{
                color: subscriptionTab === tab ? '#FFFFFF' : C.text,
                fontWeight: '900',
                fontSize: 12
              }}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {subscriptionTab === 'My Subscription' ? (
          <ComingSoon
            title="No Subscriptions Yet"
            description="Activities you subscribe to will appear here."
          />
        ) : (
          <>
            <Pressable
              onPress={() => Alert.alert(
                'Create Activity',
                'Activity creation will be available soon.'
              )}
              style={{ marginBottom: 15 }}
            >
              <Card style={{
                alignItems: 'center',
                padding: 20
              }}>
                <Text style={{
                  color: C.primary,
                  fontSize: 28
                }}>
                  ＋
                </Text>
                <Text style={{
                  color: C.text,
                  fontWeight: '900',
                  marginTop: 6
                }}>
                  Create New Activity
                </Text>
              </Card>
            </Pressable>

            <ComingSoon
              title="No Published Activities"
              description="Activities published by your rooms will appear here."
            />
          </>
        )}
      </>
    );
          }
          

  return (
    <>
      <Pressable
  onPress={() => setActiveGame('Greedy')}
  style={{ marginBottom: 15 }}
>
  <Card style={{ padding: 18, alignItems: 'center' }}>
    <Text style={{ fontSize: 22, fontWeight: '900', color: C.text }}>
      🏆 History Big Win
    </Text>
    <Text style={{ color: C.muted, marginTop: 8 }}>
      Play Greedy Game and win big!
    </Text>
    <Text style={{ color: C.primary, fontWeight: '900', marginTop: 10 }}>
      PLAY GREEDY GAME →
    </Text>
  </Card>
</Pressable>

      <SectionTitle>🌟 TALKZY Rankings</SectionTitle>

      <ComingSoon
        title="Discover Top Users"
        description="Explore top users and community rankings."
      />

      <SectionTitle>🌍 Recommended Countries</SectionTitle>

      <TextInput
        value={countrySearch}
        onChangeText={setCountrySearch}
        placeholder="Search country..."
        placeholderTextColor={C.muted}
        style={{
          backgroundColor: C.panel,
          color: C.text,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 12
        }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {filteredCountries.map((item, index) => (
          <View
            key={item[1]}
            style={{
              width: '48%',
              marginRight: index % 2 === 0 ? '2%' : 0,
              marginBottom: 8
            }}
          >
            <Card style={{ padding: 12 }}>
              <Text style={{ color: C.text, fontWeight: '800' }}>
                {item[0]} {item[1]}
              </Text>
            </Card>
          </View>
        ))}
      </View>

      {filteredCountries.length === 0 && (
        <ComingSoon
          title="No country found"
          description="Try searching with another country name."
        />
      )}

      
{/* COMMUNITY ACTIVITY */}

<View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 15
}}>
  <Text style={{
    color: C.text,
    fontSize: 19,
    fontWeight: '900'
  }}>
    🎉 Community Activity
  </Text>

  <Pressable
    onPress={() => setShowMySubscription(true)}
  >
    <Text style={{
      color: C.primary,
      fontWeight: '900',
      fontSize: 13
    }}>
      My Subscription →
    </Text>
  </Pressable>
</View>

{/* ACTIVITY POSTER GRID */}

<View style={{
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between'
}}>

  {[1, 2, 3, 4].map((item) => (
    <Pressable
      key={item}
      style={{
        width: '48%',
        marginBottom: 12
      }}
      onPress={() => Alert.alert(
        'Community Activity',
        'Activity details will be available soon.'
      )}
    >
      <Card style={{
        padding: 8,
        minHeight: 155,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 38 }}>
          {item === 1 ? '🎤' :
           item === 2 ? '🎉' :
           item === 3 ? '🎮' : '🎊'}
        </Text>

        <Text style={{
          color: C.text,
          fontWeight: '900',
          marginTop: 10
        }}>
          {item === 1 ? 'Voice Party' :
           item === 2 ? 'Special Event' :
           item === 3 ? 'Game Party' : 'Fun Gathering'}
        </Text>

        <Text style={{
          color: C.muted,
          fontSize: 11,
          marginTop: 5
        }}>
          TALKZY Community
        </Text>

        <Text style={{
          color: C.primary,
          fontSize: 11,
          marginTop: 8
        }}>
          ♡ 0 Likes
        </Text>
      </Card>
    </Pressable>
  ))}

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
            <Field
  label="Language"
  value={language}
  onChangeText={setLanguage}
  placeholder="Select your language"
/>

<Field
  label="Bio"
  value={bio}
  onChangeText={setBio}
  placeholder="Tell us about yourself"
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
  if (screen === 'roomSettings') {
    return renderRoomSettings();
  }

  if (screen === 'createRoom') {
    return renderCreateRoom();
  }

  if (screen === 'hotRooms') {
    return renderHotRooms();
  }

  if (screen === 'newRooms') {
    return renderNewRooms();
  }

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

const profileIncomplete =
  !profile ||
  !profile.display_name ||
  !profile.gender ||
  !profile.date_of_birth ||
  !profile.country ||
  !profile.language ||
  !profile.bio;

if (screen === 'profile' || profileIncomplete) {
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
        {!['roomSettings', 'createRoom'].includes(screen) && (
  <View style={{ paddingHorizontal: 15 }}>
    {renderMainHeader()}
  </View>
)}

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

      {!['roomSettings', 'createRoom', 'hotRooms', 'newRooms'].includes(screen) && renderBottomNavigation()}
<Modal
  visible={showJoinPassword}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setShowJoinPassword(false);
    setJoinPassword('');
    setJoinTargetRoom(null);
  }}
>
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      padding: 22
    }}
  >
    <View
      style={{
        backgroundColor: C.panel,
        padding: 22,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.gold
      }}
    >
      <Text
        style={{
          color: C.text,
          fontSize: 21,
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: 10
        }}
      >
        🔒 Private Room
      </Text>

      <Text
        style={{
          color: C.muted,
          textAlign: 'center',
          marginBottom: 18
        }}
      >
        Enter the password to join
        {joinTargetRoom
          ? ` ${joinTargetRoom.room_name}`
          : ' this room'}.
      </Text>

      <TextInput
        value={joinPassword}
        onChangeText={setJoinPassword}
        placeholder="Enter room password"
        placeholderTextColor={C.muted}
        secureTextEntry
        autoCapitalize="none"
        style={{
          color: C.text,
          backgroundColor: C.bg,
          borderWidth: 1,
          borderColor: C.gold,
          borderRadius: 12,
          padding: 14,
          marginBottom: 18
        }}
      />

      <Button
        title={joiningRoom ? 'Joining...' : 'Join Room'}
        onPress={() =>
          submitRoomJoin(joinTargetRoom, joinPassword)
        }
        disabled={joiningRoom || !joinPassword.trim()}
      />

      <Button
        title="Cancel"
        secondary
        onPress={() => {
          setShowJoinPassword(false);
          setJoinPassword('');
          setJoinTargetRoom(null);
        }}
      />
    </View>
  </View>
</Modal>
      
          </SafeAreaView>
  );
            }
            
