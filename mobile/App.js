 import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  
  TouchableOpacity,
  Pressable,
  ScrollView,
  StatusBar,
    Alert,
  Share,
  Image,
  ActivityIndicator,
Modal,
Platform

} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
const MIC_ON_ICON = require('./assets/mic_on.png');
const MIC_OFF_ICON = require('./assets/mic_off.png');
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
  primary: '#7C5CFC',
  card: '#141B2B',
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
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error('Could not verify your login session.');
  }

  const accessToken = sessionData?.session?.access_token;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
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
 const [selectedOfficialEvent, setSelectedOfficialEvent] = useState(null);
 const [activeEventSection, setActiveEventSection] = useState('rank');
 const [eventInfoPopup, setEventInfoPopup] = useState(null);
 const [eventCountdown, setEventCountdown] = useState({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
});
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
 const [officialEvents, setOfficialEvents] = useState([]);
const [loadingOfficialEvents, setLoadingOfficialEvents] = useState(false);
 const [eventDraft, setEventDraft] = useState({
  event_name: '',
  poster_uri: null,
  background_uri: null,
  border_uri: null,
  duration: '7_days',
  start_at: '',
  rules: '',
  gifts: [
    { name: '', coin_value: '', image_uri: null },
    { name: '', coin_value: '', image_uri: null },
    { name: '', coin_value: '', image_uri: null }
  ],
  top_rewards: [
    { description: '' },
    { description: '' },
    { description: '' }
  ],
  milestones: []
});
 
 const [showEventPreview, setShowEventPreview] = useState(false);
  const [popularPage, setPopularPage] = useState('main');
  const [mineTab, setMineTab] = useState('Recent');
  const [countrySearch, setCountrySearch] = useState('');
 
const [selectedCountry, setSelectedCountry] = useState(null);
const [showCountryRooms, setShowCountryRooms] = useState(false);
const [showCountryRegion, setShowCountryRegion] = useState(false);
 const [countryRoomsFromRegion, setCountryRoomsFromRegion] = useState(false);
         
  // COMMUNITY ACTIVITY STATES
const [showMySubscription, setShowMySubscription] = useState(false);
const [showCreateRoomActivity, setShowCreateRoomActivity] = useState(false);
const [subscriptionTab, setSubscriptionTab] = useState('My Subscription');
 
const [activityTitle, setActivityTitle] = useState('');
const [activityDescription, setActivityDescription] = useState('');
const [activitySelectedRoom, setActivitySelectedRoom] = useState(null);
const [activityPoster, setActivityPoster] = useState(null);
 const [showPosterOptions, setShowPosterOptions] = useState(false);
 const [showPosterTemplates, setShowPosterTemplates] = useState(false);
const [showPosterEditor, setShowPosterEditor] = useState(false);
 const [activityPosterTemplate, setActivityPosterTemplate] = useState(null);
 
const [activityDate, setActivityDate] = useState('');
const [activityStartTime, setActivityStartTime] = useState('');
const [activityEndTime, setActivityEndTime] = useState('');
 
 
  const [hotEventIndex, setHotEventIndex] = useState(0);
const hotEventsScrollRef = useRef(null);

  const [rooms, setRooms] = useState([]);
 const [roomDetailsVisible, setRoomDetailsVisible] = useState(false);
const [roomDetailsTab, setRoomDetailsTab] = useState('Information');
const [roomDetails, setRoomDetails] = useState(null);
const [memberSearch, setMemberSearch] = useState('');
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
 const [isRoomMinimized, setIsRoomMinimized] = useState(false);
 const [showRoomMenu, setShowRoomMenu] = useState(false);
 const [isOnMic, setIsOnMic] = useState(false);
 const [myMicSeat, setMyMicSeat] = useState(null);
 const [isMicMuted, setIsMicMuted] = useState(false);
 const [micCount, setMicCount] = useState(8);
const [micSeats, setMicSeats] = useState([]);
const micSeatLoadVersionRef = useRef(0);
 const [showMicCountPicker, setShowMicCountPicker] = useState(false);
 
async function loadRoomMicSeats(roomId) {
  if (!roomId) return;

  const requestVersion = ++micSeatLoadVersionRef.current;

  try {
    const result = await api(`/api/rooms/${roomId}/mic-seats`);

    // Ignore stale requests that finish after a newer seat update/load.
    if (requestVersion !== micSeatLoadVersionRef.current) return;

    setMicCount(result.micCount || 8);
    setMicSeats(result.seats || []);

    const myUserId = session?.user?.id;

    const mySeat = (result.seats || []).find(
      seat => seat.user_id === myUserId
    );

    if (mySeat) {
      setIsOnMic(true);
      setMyMicSeat(mySeat.seat_number);
      setIsMicMuted(!!mySeat.is_muted);
    } else {
      setIsOnMic(false);
      setMyMicSeat(null);
      setIsMicMuted(false);
    }
  } catch (error) {
    if (requestVersion === micSeatLoadVersionRef.current) {
      console.log(
        'Microphone seats loading error:',
        error.message
      );
    }
  }
}

// REALTIME MICROPHONE SEAT SYNC
useEffect(() => {
  if (!selectedRoom?.id) return;

  const roomId = selectedRoom.id;

  const channel = supabase
    .channel(`room-mic-sync-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'talkzy_room_mic_seats',
        filter: `room_id=eq.${roomId}`
      },
      () => loadRoomMicSeats(roomId)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'talkzy_rooms',
        filter: `id=eq.${roomId}`
      },
      () => loadRoomMicSeats(roomId)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedRoom?.id]);
 
const [isRoomSpeakerOn, setIsRoomSpeakerOn] = useState(true);
const [isRoomBellOn, setIsRoomBellOn] = useState(true);
const [showRoomTools, setShowRoomTools] = useState(false);
 const [showRoomInfo, setShowRoomInfo] = useState(false);
const [showRoomGiftPanel, setShowRoomGiftPanel] = useState(false);
const [roomChatText, setRoomChatText] = useState('');
 const [roomChatMessages, setRoomChatMessages] = useState([]);
 const roomChatScrollRef = useRef(null);
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
// OFFICIAL EVENT COUNTDOWN
// ---------------------------------

useEffect(() => {
  const endTime = selectedOfficialEvent?.end_at;

  if (!endTime) {
    setEventCountdown({
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    });
    return;
  }

  function updateCountdown() {
    const difference =
      new Date(endTime).getTime() - Date.now();

    const remaining = Math.max(0, difference);

    const days = Math.floor(
      remaining / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (remaining / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (remaining / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (remaining / 1000) % 60
    );

    setEventCountdown({
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    });
  }

  updateCountdown();

  const timer = setInterval(updateCountdown, 1000);

  return () => clearInterval(timer);
}, [selectedOfficialEvent?.end_at]);

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
  // EVENTS: SELECT EVENT IMAGES
  // ---------------------------------

  async function chooseEventImage(field, giftIndex = null) {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo access to select event images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;

        setEventDraft(previous => {
          if (giftIndex !== null) {
            const updatedGifts = [...previous.gifts];

            updatedGifts[giftIndex] = {
              ...updatedGifts[giftIndex],
              image_uri: imageUri
            };

            return {
              ...previous,
              gifts: updatedGifts
            };
          }

          return {
            ...previous,
            [field]: imageUri
          };
        });
      }
    } catch (error) {
      Alert.alert('Image error', error.message);
    }
  }
 
  
  // ---------------------------------
  // SELECT ACTIVITY POSTER
  // ---------------------------------

  async function chooseActivityPoster() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo access to select an activity poster.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setActivityPoster(result.assets[0].uri);
setActivityPosterTemplate(null);
      }

    } catch (error) {
      Alert.alert(
        'Poster error',
        'Could not select the activity poster.'
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
// ROOM: OPEN ROOM DETAILS
// =========================================

function openRoomDetails(room) {
  setRoomDetails(room);
  setRoomDetailsTab('Information');
  setMemberSearch('');
  setRoomDetailsVisible(true);
}
 
// =========================================
// EVENTS: LOAD LIVE OFFICIAL EVENTS
// =========================================

async function loadOfficialEvents() {
  try {
    setLoadingOfficialEvents(true);

    const result = await api('/api/events/live');

    setOfficialEvents(
      Array.isArray(result.events)
        ? result.events
        : []
    );
  } catch (error) {
    console.log('Official events error:', error.message);
    Alert.alert('Events', 'Could not load official events.');
  } finally {
    setLoadingOfficialEvents(false);
  }
}

 // =========================================
// EVENTS: OPEN EVENT DETAIL
// =========================================

function openOfficialEvent(event) {
  setSelectedOfficialEvent(event);
  setActiveEventSection('rank');
  setRoomTab('Events');
  setActiveTab('Room');
  setScreen('eventDetail');
}

 
// =========================================
// EVENTS: BACK TO EVENTS LIST
// =========================================

function closeOfficialEvent() {
  setSelectedOfficialEvent(null);
  setActiveTab('Room');
  setRoomTab('Events');
  setScreen('main');
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
 if (roomType === 'locked' && !roomPassword.trim()) {
  Alert.alert('Password required', 'Please create a password for your locked room.');
  return;
 }
 if (
  roomType === 'locked' &&
(roomPassword.trim().length < 4 || roomPassword.trim().length > 64)
) {
  Alert.alert(
    'Invalid password',
    'Room password must be between 4 and 64 characters.'
  );
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
        roomType: roomType,
password: roomType === 'locked' ? roomPassword : null,
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
  <TouchableOpacity
  key={room.id}
  activeOpacity={0.85}
  onPress={() => {
    if (showJoin) {
      joinRoom(room);
      return;
    }

    setSelectedRoom(room);
setIsRoomMinimized(false);

// Reset previous room microphone data
setMicCount(8);
setMicSeats([]);
setIsOnMic(false);
setMyMicSeat(null);
setIsMicMuted(false);

// Load this room's microphone data
loadRoomMicSeats(room.id);

setScreen('roomInterior');
  }}
>
  <Card
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
<View
  style={{
    flex: 1,
    height: 62,
    justifyContent: 'center',
    marginRight: 4
  }}
>
  {/* ROOM NAME + FAMILY TAG */}
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

    {room.family_name ? (
      <Text
        numberOfLines={1}
        style={{
          color: C.accent,
          fontSize: 8,
          fontWeight: '900',
          marginLeft: 5,
          flexShrink: 1
        }}
      >
        [{room.family_name}]
      </Text>
    ) : null}

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
        style={{ marginLeft: 5 }}
      >
        <Text style={{ color: C.gold, fontSize: 15 }}>
          ⚙
        </Text>
      </TouchableOpacity>
    )}
  </View>

  {/* COUNTRY */}
  <Text
    numberOfLines={1}
    style={{
      color: C.muted,
      fontSize: 10,
      marginTop: 2
    }}
  >
    {room.country_flag || '🌍'} {room.country_name || 'Country not set'}
  </Text>

  {/* ANNOUNCEMENT - ONE LINE */}
  <Text
    numberOfLines={1}
    ellipsizeMode="tail"
    style={{
      color: C.muted,
      fontSize: 10,
      marginTop: 2
    }}
  >
    {room.description || 'Welcome to TALKZY'}
  </Text>
</View>

        {/* CURRENT ACTIVE USERS */}
<View
  style={{
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <Text style={{ fontSize: 15 }}>👥</Text>

  <Text
    style={{
      color: C.text,
      fontSize: 12,
      fontWeight: '900',
      marginTop: 2
    }}
  >
    {room.active_users ?? 0}
    </Text>
</View>

      </View>
    </Card>
  </TouchableOpacity>
  );
}

// =========================================
// ROOM: ROOM INTERIOR
// =========================================

function sendRoomChatMessage() {
  const message = roomChatText.trim();

  if (!message) return;

  setRoomChatMessages(prev => [
    ...prev,
    {
      id: Date.now().toString(),
      text: message,
      sender: 'You',
     time: new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
})
    }
  ]);

  setRoomChatText('');
             }

function renderRoomInterior() {
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

  const roomIsLocked = selectedRoom.room_type === 'locked';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, minHeight: 0 }}>

      {/* ROOM HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.line
        }}
      >

        {/* ROOM DP */}
        {selectedRoom.room_dp_url ? (
          <Image
            source={{ uri: selectedRoom.room_dp_url }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              marginRight: 10
            }}
          />
        ) : (
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              backgroundColor: C.line,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10
            }}
          >
            <Text style={{ fontSize: 27 }}>🎙️</Text>
          </View>
        )}

        {/* ROOM DETAILS */}
<View style={{ flex: 1 }}>
  <TouchableOpacity
    onPress={() => openRoomDetails(selectedRoom)}
    style={{ alignSelf: 'flex-start' }}
  >
    <Text
      style={{
        color: C.text,
        fontSize: 17,
        fontWeight: 'bold'
      }}
      numberOfLines={1}
    >
      {selectedRoom.room_name}
    </Text>
  </TouchableOpacity>

  {selectedRoom.family_name ? (
    <Text
      style={{
        color: C.text,
        fontSize: 11,
        marginTop: 2
      }}
    >
      🏷️ {selectedRoom.family_name}
    </Text>
  ) : null}

  <Text
    style={{
      color: C.muted,
      fontSize: 11,
      marginTop: 3
    }}
  >
    Owner ID: {selectedRoom.id}
  </Text>

  <Text
    style={{
      color: C.muted,
      fontSize: 11,
      marginTop: 2
    }}
  >
    Room Level: Not available
  </Text>
</View>

        {/* ROOM TYPE */}
        <TouchableOpacity
          style={{ paddingHorizontal: 7 }}
          onPress={() => {
            Alert.alert(
              'Room Type',
              roomIsLocked
                ? '🔒 Locked Room'
                : '🌐 Public Room'
            );
          }}
        >
          <Text style={{ fontSize: 22 }}>
            {roomIsLocked ? '🔒' : '🌐'}
          </Text>
        </TouchableOpacity>

        {/* SHARE */}
        <TouchableOpacity
          style={{ paddingHorizontal: 7 }}
          onPress={async () => {
            try {
              await Share.share({
                message: `Join my room "${selectedRoom.room_name}" on TALKZY!`
              });
            } catch (error) {
              console.log('Room share error:', error.message);
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>↗️</Text>
        </TouchableOpacity>

        {/* POWER MENU */}
        <TouchableOpacity
          style={{ paddingLeft: 7 }}
          onPress={() => setShowRoomMenu(!showRoomMenu)}
        >
          <Text style={{ fontSize: 24, color: C.text }}>
            ⏻
          </Text>
        </TouchableOpacity>

            </View>

      {/* ROOM TROPHY / COINS */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 4
        }}
      >
        <Text style={{ fontSize: 18 }}>🏆</Text>

        <Text
          style={{
            color: C.text,
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 6
          }}
        >
          0
        </Text>
      </View>

           {/* MICROPHONE SEATS */}
<View
  style={{
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 25
  }}
>
  {Array.from({ length: micCount }, (_, index) => index + 1).map((seat) => {

    const occupiedSeat = micSeats.find(
      item => item.seat_number === seat
    );

    const isMySeat =
      occupiedSeat?.user_id === session?.user?.id;

    const isOccupied = !!occupiedSeat;

    return (
      <TouchableOpacity
        key={seat}
        onPress={async () => {
          // Occupied by another person: no request needed.
          if (isOccupied && !isMySeat) {
            Alert.alert(
              'Seat occupied',
              `${occupiedSeat.display_name || 'Someone'} is already on this microphone.`
            );
            return;
          }

          const roomId = selectedRoom.id;
          const userId = session?.user?.id;
          const previousSeats = micSeats;

          // Invalidate any in-flight seat fetch before applying this tap.
          ++micSeatLoadVersionRef.current;

          try {
            // Optimistic UI: update the seat immediately.
            if (isMySeat) {
              setMicSeats(current => current.filter(
                item => item.user_id !== userId
              ));
              setIsOnMic(false);
              setMyMicSeat(null);
              setIsMicMuted(false);

              await api(`/api/rooms/${roomId}/mic-seats`, {
                method: 'DELETE'
              });
              return;
            }

            const optimisticSeat = {
              room_id: roomId,
              seat_number: seat,
              user_id: userId,
              display_name: profile?.display_name || displayName || 'You',
              avatar_url: profile?.avatar_url || avatarUri || null,
              is_muted: false
            };

            setMicSeats(current => [
              ...current.filter(item => item.user_id !== userId),
              optimisticSeat
            ]);
            setIsOnMic(true);
            setMyMicSeat(seat);
            setIsMicMuted(false);

            await api(
              `/api/rooms/${roomId}/mic-seats/${seat}`,
              { method: 'POST' }
            );
            // Realtime sync updates other participants. Avoid an extra GET here.
          } catch (error) {
            // Restore authoritative server state if the action fails.
            setMicSeats(previousSeats);
            await loadRoomMicSeats(roomId);
            Alert.alert(
              'Microphone error',
              error.message || 'Could not change microphone seat.'
            );
          }
        }}
        style={{
          width: '25%',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            borderWidth: 1.5,
            borderColor: isMySeat
              ? '#FF5B5B'
              : isOccupied
                ? C.accent
                : C.line,
            backgroundColor: isMySeat
              ? 'rgba(255,91,91,0.12)'
              : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {isOccupied ? (
            <>
              <Image
                source={
                  occupiedSeat.avatar_url
                    ? { uri: occupiedSeat.avatar_url }
                    : MIC_ON_ICON
                }
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 28,
                  resizeMode: 'cover'
                }}
              />

              {occupiedSeat.is_muted && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    backgroundColor: '#222222',
                    borderRadius: 12,
                    padding: 3
                  }}
                >
                  <Image
                    source={MIC_OFF_ICON}
                    style={{
                      width: 15,
                      height: 15,
                      resizeMode: 'contain'
                    }}
                  />
                </View>
              )}
            </>
          ) : (
            <Image
              source={MIC_ON_ICON}
              style={{
                width: 26,
                height: 26,
                resizeMode: 'contain'
              }}
            />
          )}
        </View>

        <Text
          style={{
            color: C.text,
            fontSize: 11,
            marginTop: 5,
            fontWeight: isMySeat ? 'bold' : 'normal'
          }}
        >
          {isOccupied
            ? (isMySeat
                ? (displayName || 'You')
                : (occupiedSeat.display_name || 'User'))
            : seat}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
                    

            {/* ROOM CHAT MESSAGES */}
{roomChatMessages.length > 0 && (
  <ScrollView
 ref={roomChatScrollRef}
onContentSizeChange={() =>
  roomChatScrollRef.current?.scrollToEnd({ animated: true })
 }
    style={{
      maxHeight: 160,
      marginTop: 10,
      marginBottom: 10
    }}
    contentContainerStyle={{
      paddingHorizontal: 12
    }}
  >
    {roomChatMessages.map((message) => (
      <View
        key={message.id}
        style={{
          backgroundColor: C.card,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 6,
          alignSelf: 'flex-start',
          maxWidth: '85%'
        }}
      >
        <Text
          style={{
            color: '#8E9AFF',
            fontSize: 11,
            fontWeight: 'bold',
            marginBottom: 3
          }}
        >
          {message.sender}
        </Text>

        <Text
  style={{
    color: C.text,
    fontSize: 14
  }}
>
  {message.text}
</Text>

<Text
  style={{
    color: C.muted,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4
  }}
>
  {message.time}
</Text>
      </View>
    ))}
  </ScrollView>
)}

{/* EMPTY ROOM SPACE */}
<View style={{ flexGrow: 1, minHeight: 120 }} />

      {/* ROOM GIFT PANEL */}
      {showRoomGiftPanel && (
        <View
          style={{
            backgroundColor: C.card,
            borderRadius: 14,
            marginHorizontal: 12,
            marginBottom: 10,
            padding: 14,
            borderWidth: 1,
            borderColor: C.line
          }}
        >
          <Text
            style={{
              color: C.text,
              fontSize: 15,
              fontWeight: 'bold',
              marginBottom: 12
            }}
          >
            Send a Gift 🎁
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: '🌹', name: 'Rose' },
              { icon: '❤️', name: 'Heart' },
              { icon: '💎', name: 'Diamond' },
              { icon: '🎂', name: 'Cake' },
              { icon: '🎸', name: 'Guitar' },
              { icon: '👑', name: 'Crown' },
              { icon: '🚗', name: 'Car' },
              { icon: '🎁', name: 'Gift Box' }
            ].map((gift) => (
              <TouchableOpacity
                key={gift.name}
                onPress={() => {
                  Alert.alert(
                    gift.name,
                    `${gift.name} gifting will be available soon.`
                  );
                }}
                style={{
                  width: '25%',
                  alignItems: 'center',
                  paddingVertical: 12
                }}
              >
                <Text style={{ fontSize: 27 }}>
                  {gift.icon}
                </Text>

                <Text
                  style={{
                    color: C.text,
                    fontSize: 11,
                    marginTop: 5
                  }}
                >
                  {gift.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ROOM TOOLS PANEL */}
      {showRoomTools && (
        <View
          style={{
            backgroundColor: C.card,
            borderRadius: 14,
            marginHorizontal: 12,
            marginBottom: 10,
            padding: 14,
            borderWidth: 1,
            borderColor: C.line
          }}
        >
          <Text
            style={{
              color: C.text,
              fontSize: 15,
              fontWeight: 'bold',
              marginBottom: 12
            }}
          >
            Room Tools
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: '👥', title: 'Members' },
              { icon: 'ℹ️', title: 'Room Info' },
              { icon: '📜', title: 'Room Rules' },
              { icon: '🔗', title: 'Share Room' },
             { icon: '🗑️', title: 'Clear Chat' }
            ].map((tool) => (
              <TouchableOpacity
                onPress={() => {
  if (tool.title === 'Share Room') {
    Share.share({
      message: `Join my room "${selectedRoom.room_name}" on TALKZY!`
    });
  } else if (tool.title === 'Clear Chat') {
    Alert.alert(
      'Clear Room Chat',
      'Are you sure you want to clear all chat messages?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setRoomChatMessages([])
        }
      ]
    );
  } else {
    Alert.alert(
      tool.title,
      `${tool.title} will be available soon.`
    );
  }
}}
                style={{
                  width: '50%',
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 25 }}>
                  {tool.icon}
                </Text>

                <Text
                  style={{
                    color: C.text,
                    fontSize: 12,
                    marginTop: 5
                  }}
                >
                  {tool.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

     {/* ROOM BOTTOM CONTROLS */}
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
paddingTop: 12,
paddingBottom: Platform.OS === 'android' ? 40 : 12,
borderTopWidth: 1,
    borderTopColor: C.line
  }}
>
  {/* CHAT BAR / CHAT ICON */}
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 150,
    marginRight: 4
  }}
>
  <View
    style={{
      flex: 1,
      height: 38,
      backgroundColor: C.card,
      borderRadius: 20,
      paddingHorizontal: 10,
      justifyContent: 'center'
    }}
  >
    <TextInput
      value={roomChatText}
      onChangeText={setRoomChatText}
      placeholder="Message..."
      placeholderTextColor={C.muted}
      onSubmitEditing={sendRoomChatMessage}
      returnKeyType="send"
      style={{
        color: C.text,
        fontSize: 12,
        padding: 0
      }}
    />
  </View>

  <TouchableOpacity
    onPress={sendRoomChatMessage}
    style={{
      width: 34,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>➤</Text>
  </TouchableOpacity>
</View>

  {/* MIC - MUTE / UNMUTE WHILE REMAINING ON SEAT */}
{isOnMic && (
  <TouchableOpacity
    onPress={async () => {
      const nextMuted = !isMicMuted;
      const previousMuted = isMicMuted;
      const roomId = selectedRoom.id;
      const userId = session?.user?.id;

      // Immediate visual response while the server saves the mute state.
      ++micSeatLoadVersionRef.current;
      setIsMicMuted(nextMuted);
      setMicSeats(current => current.map(item =>
        item.user_id === userId
          ? { ...item, is_muted: nextMuted }
          : item
      ));

      try {
        const result = await api(
          `/api/rooms/${roomId}/mic-seats/mute`,
          {
            method: 'PATCH',
            body: JSON.stringify({ isMuted: nextMuted })
          }
        );

        if (result?.seat) {
          setMicSeats(current => current.map(item =>
            item.user_id === userId
              ? { ...item, is_muted: !!result.seat.is_muted }
              : item
          ));
          setIsMicMuted(!!result.seat.is_muted);
        }
      } catch (error) {
        setIsMicMuted(previousMuted);
        setMicSeats(current => current.map(item =>
          item.user_id === userId
            ? { ...item, is_muted: previousMuted }
            : item
        ));
        await loadRoomMicSeats(roomId);
        Alert.alert(
          'Microphone',
          error.message || 'Could not change mute status.'
        );
      }
    }}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: isMicMuted ? '#555555' : '#D94B4B',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Image
  source={isMicMuted ? MIC_OFF_ICON : MIC_ON_ICON}
  style={{
    width: 22,
    height: 22,
    resizeMode: 'contain'
  }}
/>
  </TouchableOpacity>
)}

  {/* SPEAKER */}
  <TouchableOpacity
    onPress={() => setIsRoomSpeakerOn(!isRoomSpeakerOn)}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>
      {isRoomSpeakerOn ? '🔊' : '🔇'}
    </Text>
  </TouchableOpacity>

  {/* BELL */}
  <TouchableOpacity
    onPress={() => setIsRoomBellOn(!isRoomBellOn)}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>
      {isRoomBellOn ? '🔔' : '🔕'}
    </Text>
  </TouchableOpacity>

  {/* FOUR-SQUARE TOOLS */}
  <TouchableOpacity
    onPress={() => {
      setShowRoomTools(!showRoomTools);
      setShowRoomGiftPanel(false);
    }}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>⊞</Text>
  </TouchableOpacity>

  {/* GIFT */}
  <TouchableOpacity
    onPress={() => {
      setShowRoomGiftPanel(!showRoomGiftPanel);
      setShowRoomTools(false);
    }}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>🎁</Text>
  </TouchableOpacity>
</View>
        
            
  

      {/* POWER MENU */}
      {showRoomMenu && (
        <View
          style={{
            position: 'absolute',
            top: 75,
            right: 12,
            zIndex: 100,
            elevation: 10,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 12,
            width: 150,
            overflow: 'hidden'
          }}
        >

          {/* MINIMIZE */}
          <TouchableOpacity
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.line
            }}
            onPress={() => {
  setShowRoomMenu(false);
  setShowRoomTools(false);
  setShowRoomGiftPanel(false);
  setIsRoomMinimized(true);
  setScreen('main');
}}
          >
            <Text style={{ color: C.text, fontSize: 15 }}>
              Minimize
            </Text>
          </TouchableOpacity>

          {/* MIC SETTINGS - OWNER ONLY */}
          {selectedRoom?.owner_id === session?.user?.id && (
            <TouchableOpacity
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: C.line
              }}
              onPress={() => {
                setShowRoomMenu(false);
                setShowMicCountPicker(true);
              }}
            >
              <Text style={{ color: C.gold, fontSize: 15 }}>
                🎙 Mic Settings
              </Text>
            </TouchableOpacity>
          )}

          {/* EXIT */}
          <TouchableOpacity
            style={{ padding: 14 }}
            onPress={async () => {
  try {
    if (selectedRoom?.id) {
      await api(
        `/api/rooms/${selectedRoom.id}/mic-seats`,
        { method: 'DELETE' }
      );
    }
  } catch (error) {
    console.log('Seat release error:', error.message);
  }

  setShowRoomMenu(false);
  setShowRoomTools(false);
  setShowRoomGiftPanel(false);
  setIsOnMic(false);
  setMyMicSeat(null);
  setIsMicMuted(false);
  setIsRoomMinimized(false);
  setSelectedRoom(null);
  setMicSeats([]);
  setScreen('main');
}}
          >
            <Text style={{ color: '#FF5B5B', fontSize: 15 }}>
              Exit Room
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MICROPHONE COUNT PICKER */}
      <Modal
        visible={showMicCountPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMicCountPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: C.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: C.line,
              padding: 20
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 19,
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              🎙 Microphone Settings
            </Text>

            <Text
              style={{
                color: C.muted,
                fontSize: 13,
                textAlign: 'center',
                marginTop: 8,
                marginBottom: 20
              }}
            >
              Choose the number of microphone seats in your room.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              {[7, 8, 10, 11, 12, 14, 17].map((count) => (
                <TouchableOpacity
                  key={count}
                  onPress={async () => {
                    try {
                      const result = await api(
                        `/api/rooms/${selectedRoom.id}/mic-count`,
                        {
                          method: 'PATCH',
                          body: JSON.stringify({
                            micCount: count
                          })
                        }
                      );

                      setMicCount(result.micCount || count);
                      setShowMicCountPicker(false);

                      await loadRoomMicSeats(selectedRoom.id);

                    } catch (error) {
                      Alert.alert(
                        'Mic Settings',
                        error.message || 'Could not change microphone count.'
                      );
                    }
                  }}
                  style={{
                    width: '22%',
                    margin: '1.5%',
                    paddingVertical: 15,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor:
                      micCount === count ? C.accent : C.panel2,
                    borderWidth: 1,
                    borderColor:
                      micCount === count ? C.accent : C.line
                  }}
                >
                  <Text
                    style={{
                      color: C.text,
                      fontSize: 18,
                      fontWeight: 'bold'
                    }}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={{
                color: C.muted,
                fontSize: 11,
                textAlign: 'center',
                marginTop: 12
              }}
            >
              Seats above the selected limit will be removed automatically.
            </Text>

            <TouchableOpacity
              onPress={() => setShowMicCountPicker(false)}
              style={{
                marginTop: 18,
                padding: 12,
                borderRadius: 10,
                backgroundColor: C.panel2,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: C.text, fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
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
  // ROOM: MINE
  // =========================================

  function renderMine() {
    return (
      <>
        {myRooms.length === 0 ? (
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
) : (
  renderRoomCard(myRooms[0], false)
)}


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
             <SectionTitle>Public Rooms</SectionTitle>

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


function renderCountryRegion() {
  
  const filteredCountries = countries.filter(item =>
    item[1].toLowerCase().includes(countrySearch.toLowerCase())
  );

  const hotCountries = [
  ['🇮🇳', 'India'],
  ['🇧🇩', 'Bangladesh'],
  ['🇳🇵', 'Nepal'],
  ['🇵🇰', 'Pakistan'],
  ['🇺🇸', 'United States']
];

  const openCountry = (item) => {
    setSelectedCountry({
      flag: item[0],
      name: item[1]
    });
    setCountrySearch('');
    loadPublicRooms();
   setCountryRoomsFromRegion(true);
    setShowCountryRegion(false);
    setShowCountryRooms(true);
  };

  return (
    <>
      {/* HEADER */}
      <TouchableOpacity
        onPress={() => {
          setShowCountryRegion(false);
          setCountrySearch('');
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontSize: 25 }}>‹</Text>
        <Text style={{
          color: C.text,
          fontSize: 19,
          fontWeight: '900',
          marginLeft: 10
        }}>
          Country and Region
        </Text>
      </TouchableOpacity>

      {/* SEARCH */}
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
          padding: 13,
          marginBottom: 8
        }}
      />

      <Text style={{
        color: C.muted,
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 18
      }}>
        {filteredCountries.length} / {countries.length}
      </Text>

      {/* HOT COUNTRIES */}
      {!countrySearch.trim() && (
        <>
          <SectionTitle>🔥 Hot Countries</SectionTitle>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 18
          }}>
            {hotCountries.map(item => (
              <TouchableOpacity
                key={item[1]}
                onPress={() => openCountry(item)}
                style={{
                  width: '20%',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <Text style={{ fontSize: 25 }}>{item[0]}</Text>
                <Text style={{
                  color: C.text,
                  fontSize: 10,
                  textAlign: 'center'
                }}>
                  {item[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ALL COUNTRIES */}
      <SectionTitle>🌍 All Countries</SectionTitle>

      {filteredCountries.map(item => (
        <TouchableOpacity
          key={item[1]}
          onPress={() => openCountry(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: C.line
          }}
        >
          <Text style={{ fontSize: 23, marginRight: 13 }}>
            {item[0]}
          </Text>
          <Text style={{
            color: C.text,
            fontSize: 14,
            fontWeight: '700'
          }}>
            {item[1]}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
                   }
         
function renderCountryRooms() {
  const countryRooms = rooms
    .filter(room =>
      (room.country_name || '').trim().toLowerCase() ===
      (selectedCountry?.name || '').trim().toLowerCase()
    )
    .slice()
    .sort((a, b) => {
      const aLocked = a.room_type === 'private';
      const bLocked = b.room_type === 'private';

      if (aLocked !== bLocked) {
        return aLocked ? 1 : -1;
      }

      return (Number(b.active_users) || 0) -
             (Number(a.active_users) || 0);
    });

  return (
    <>
      {/* COUNTRY ROOMS HEADER */}
      <TouchableOpacity
        onPress={() => {
  setShowCountryRooms(false);

  if (countryRoomsFromRegion) {
    setShowCountryRegion(true);
    setCountryRoomsFromRegion(false);
  }
}}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontSize: 26 }}>‹</Text>

        <Text style={{
          color: C.text,
          fontSize: 18,
          fontWeight: '900',
          marginLeft: 10
        }}>
          {selectedCountry?.flag} {selectedCountry?.name} Rooms
        </Text>
      </TouchableOpacity>

      {loadingRooms ? (
        <ActivityIndicator color={C.accent} />
      ) : countryRooms.length === 0 ? (
        <ComingSoon
          title="No rooms yet"
          description={`No rooms are available in ${selectedCountry?.name || 'this country'} yet.`}
        />
      ) : (
        countryRooms.map(room => (
          <Card
            key={room.id}
            style={{
              padding: 9,
              marginBottom: 8,
              borderRadius: 11
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>

              {/* ROOM PICTURE */}
              {room.room_dp_url ? (
                <Image
                  source={{ uri: room.room_dp_url }}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 9,
                    marginRight: 9
                  }}
                />
              ) : (
                <View style={{
                  width: 58,
                  height: 58,
                  borderRadius: 9,
                  backgroundColor: C.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 9
                }}>
                  <Text style={{ fontSize: 24 }}>🎙️</Text>
                </View>
              )}

              {/* ROOM DETAILS */}
              <View style={{ flex: 1 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: C.text,
                      fontSize: 13,
                      fontWeight: '900',
                      flexShrink: 1
                    }}
                  >
                    {room.room_name}
                  </Text>

                  <View style={{
                    backgroundColor: C.accent,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: 5
                  }}>
                    <Text style={{
                      color: 'white',
                      fontSize: 8,
                      fontWeight: '900'
                    }}>
                      FAMILY
                    </Text>
                  </View>
                </View>

                <Text style={{
                  color: C.muted,
                  fontSize: 10,
                  marginTop: 4
                }}>
                  {room.country_flag || selectedCountry?.flag}
                  {'  '}
                  {room.medals || '🏅'}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    marginTop: 4
                  }}
                >
                  {room.description || 'Welcome to TALKZY'}
                </Text>
              </View>

              {/* ACTIVE USERS */}
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 7
              }}>
                <Text style={{
                  color: C.text,
                  fontSize: 12,
                  fontWeight: '800'
                }}>
                  👥 {Number(room.active_users) || 0}
                </Text>

                {room.room_type === 'private' && (
                  <Text style={{ fontSize: 10, marginTop: 3 }}>
                    🔒
                  </Text>
                )}
              </View>

            </View>
          </Card>
        ))
      )}
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


// TEMPORARY COUNTRY TEST
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
  // =========================================
  // ROOM: DISCOVER
  // =========================================

function renderDiscover() {
   const filteredCountries = countries.filter(item =>
    item[1].toLowerCase().includes(countrySearch.toLowerCase())
  );
  
// ORIGINAL DISCOVER CODE — KEEP THIS
    return (
    <>
      
{/* HISTORY BIG WIN */}

<Text style={{
  color: C.text,
  fontSize: 19,
  fontWeight: '900',
  marginBottom: 12
}}>
  🏆 History Big Win
</Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ marginBottom: 18 }}
>
  {[1, 2, 3, 4, 5].map((item) => (
    <Card
      key={item}
      style={{
        width: 145,
        padding: 12,
        marginRight: 10,
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 27 }}>💰</Text>

      <Text style={{
        color: C.text,
        fontWeight: '900',
        marginTop: 7
      }}>
        Greedy Win
      </Text>

      <Text style={{
        color: C.primary,
        fontSize: 15,
        fontWeight: '900',
        marginTop: 5
      }}>
        🪙 Winner
      </Text>

      <Text style={{
        color: C.muted,
        fontSize: 10,
        marginTop: 4
      }}>
        Win history
      </Text>
    </Card>
  ))}
</ScrollView>


      
{/* TALKZY RANKING POSTER */}

<Pressable
  onPress={() => Alert.alert(
    'TALKZY Ranking',
    'Full Ranking page will be connected next.'
  )}
  style={{ marginBottom: 15 }}
>
  <Card style={{
    padding: 0,
    height: 120,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.panel
  }}>
    <Text style={{
      color: C.primary,
      fontSize: 22,
      fontWeight: '900'
    }}>
      🏆 TALKZY RANKING
    </Text>

    <Text style={{
      color: C.text,
      fontSize: 12,
      marginTop: 8
    }}>
      Monthly Top 30 Players
    </Text>

    <Text style={{
      color: C.muted,
      fontSize: 11,
      marginTop: 5
    }}>
      Tap to View Ranking →
    </Text>
  </Card>
</Pressable>
       

      
<SectionTitle>🌍 Recommended Countries</SectionTitle>

<View style={{
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between'
}}>
  {countries.slice(0, 9).map((item) => (
    <Pressable
      key={item[1]}
      onPress={() => {
  setSelectedCountry({
    flag: item[0],
    name: item[1]
  });
  setCountryRoomsFromRegion(false);
  loadPublicRooms();
  setShowCountryRooms(true);
}}
      style={{
        width: '19%',
        marginBottom: 12
      }}
    >
      <Card style={{
        paddingVertical: 12,
        paddingHorizontal: 2,
        alignItems: 'center',
        minHeight: 75,
        justifyContent: 'center'
      }}>
        <Text style={{ fontSize: 23 }}>
          {item[0]}
        </Text>
        <Text style={{
          color: C.text,
          fontSize: 10,
          fontWeight: '800',
          textAlign: 'center',
          marginTop: 5
        }}
        numberOfLines={1}>
          {item[1]}
        </Text>
      </Card>
    </Pressable>
  ))}

  <Pressable
    onPress={() => {
  setCountrySearch('');
  setShowCountryRegion(true);
}}
    style={{
      width: '19%',
      marginBottom: 12
    }}
  >
    <Card style={{
      paddingVertical: 12,
      paddingHorizontal: 2,
      alignItems: 'center',
      minHeight: 75,
      justifyContent: 'center'
    }}>
      <Text style={{
        fontSize: 23,
        color: C.primary,
        fontWeight: '900'
      }}>
        ...
      </Text>
      <Text style={{
        color: C.text,
        fontSize: 10,
        fontWeight: '900',
        marginTop: 5
      }}>
        All
      </Text>
    </Card>
  </Pressable>
</View>
               
      {filteredCountries.length === 0 && (
        <ComingSoon
          title="No country found"
          description="Try searching with another country name."
        />
      )}

      

{/* COMMUNITY ACTIVITIES */}

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
    🎉 Community Activities
  </Text>

  <Pressable
    onPress={() => {
      setSubscriptionTab('My Subscription');
      setShowMySubscription(true);
    }}
  >
    <Text style={{
      color: C.primary,
      fontWeight: '900',
      fontSize: 13
    }}>
      Subscribe Activities →
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
  if (loadingOfficialEvents) {
    return (
      <View style={{ padding: 35, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.accent} />

        <Text
          style={{
            color: C.muted,
            fontSize: 12,
            marginTop: 12
          }}
        >
          Loading Events...
        </Text>
      </View>
    );
  }

  if (officialEvents.length === 0) {
    return (
      <View
        style={{
          backgroundColor: C.panel,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 16,
          padding: 30,
          alignItems: 'center',
          marginTop: 10
        }}
      >
        <Text style={{ fontSize: 38 }}>
          🏆
        </Text>

        <Text
          style={{
            color: C.text,
            fontSize: 16,
            fontWeight: '900',
            textAlign: 'center',
            marginTop: 12
          }}
        >
          No Live Events Right Now
        </Text>

        <Text
          style={{
            color: C.muted,
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 19,
            marginTop: 8
          }}
        >
          Stay tuned! Official TALKZY events and exciting rewards will appear here when they go live.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 15 }}>
      {officialEvents.map(event => (
        <Pressable
          key={event.id || event.event_name}
          onPress={() => openOfficialEvent(event)}
          style={{
            width: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: '#D6A84F'
          }}
        >
          {event.poster_url ? (
            <Image
              source={{ uri: event.poster_url }}
              style={{
                width: '100%',
                aspectRatio: 2
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                aspectRatio: 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#21183D'
              }}
            >
              <Text
                style={{
                  color: '#D6A84F',
                  fontSize: 16,
                  fontWeight: '900'
                }}
              >
                🏆 TALKZY EVENT
              </Text>

              <Text
                style={{
                  color: C.muted,
                  fontSize: 11,
                  marginTop: 6
                }}
              >
                Poster unavailable
              </Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
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

  if (item === 'Events') {
    loadOfficialEvents();
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
paddingBottom: Platform.OS === 'android' ? 28 : 8
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

  
function renderMySubscription() {
  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22
      }}>

        {/* BACK BUTTON */}
        <Pressable
          onPress={() => setShowMySubscription(false)}
          style={{ padding: 5 }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 25,
            fontWeight: '900'
          }}>
            ←
          </Text>
        </Pressable>

        {/* PAGE TITLE */}
        <Text style={{
          color: C.text,
          fontSize: 21,
          fontWeight: '900'
        }}>
          My Subscription
        </Text>

        {/* PLUS BUTTON */}
        <Pressable
          onPress={() => {
  setActivityPoster(null);
  setActivityPosterTemplate(null);

  setShowPosterOptions(false);
  setShowPosterTemplates(false);
  setShowPosterEditor(false);

  setActivityTitle('');
  setActivityDescription('');
  setActivityDate('');
  setActivityStartTime('');
  setActivityEndTime('');

  setShowCreateRoomActivity(true);
}}
          style={{ padding: 5 }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 29,
            fontWeight: '900'
          }}>
            ＋
          </Text>
        </Pressable>

      </View>

      {/* SUBSCRIPTION LIST EMPTY STATE */}
      <ComingSoon
        title="No Subscriptions Yet"
        description="Activities you subscribe to will appear here."
      />

    </View>
  );
}

function renderPosterOptions() {
  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
      }}>

        <Pressable
          onPress={() => setShowPosterOptions(false)}
          style={{
            position: 'absolute',
            left: 0,
            padding: 5
          }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 25,
            fontWeight: '900'
          }}>
            ←
          </Text>
        </Pressable>

        <Text style={{
          color: C.text,
          fontSize: 20,
          fontWeight: '900'
        }}>
          Choose Activity Poster
        </Text>

      </View>

      {/* APP PROVIDED POSTERS */}
      <Pressable
        onPress={() => setShowPosterTemplates(true)}
        style={{
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 16,
          padding: 22,
          marginBottom: 18
        }}
      >
        <Text style={{ fontSize: 38 }}>🎉</Text>

        <Text style={{
          color: C.text,
          fontSize: 17,
          fontWeight: '900',
          marginTop: 12
        }}>
          App Provided Posters
        </Text>

        <Text style={{
          color: C.muted,
          fontSize: 13,
          marginTop: 6
        }}>
          Choose from TALKZY's ready-made party poster collection.
        </Text>

        <Text style={{
          color: C.primary,
          fontWeight: '900',
          marginTop: 12
        }}>
          Browse Posters →
        </Text>
      </Pressable>

      {/* CUSTOMIZE POSTER */}
      <Pressable
        onPress={() => {
          setShowPosterOptions(false);
          setShowPosterEditor(true);
        }}
        style={{
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 16,
          padding: 22
        }}
      >
        <Text style={{ fontSize: 38 }}>🎨</Text>

        <Text style={{
          color: C.text,
          fontSize: 17,
          fontWeight: '900',
          marginTop: 12
        }}>
          Upload My Own Poster
        </Text>

        <Text style={{
          color: C.muted,
          fontSize: 13,
          marginTop: 6
        }}>
          Upload a poster from your mobile gallery for this party only. Upload it again if you want to use it for another party.
        </Text>

        <Text style={{
          color: C.primary,
          fontWeight: '900',
          marginTop: 12
        }}>
          Choose from Gallery →
        </Text>
      </Pressable>

    </View>
  );
                     }

function renderPosterEditor() {
  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
      }}>

        <Pressable
          onPress={() => {
            setShowPosterEditor(false);
            setShowPosterOptions(true);
          }}
          style={{
            position: 'absolute',
            left: 0,
            padding: 5
          }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 25,
            fontWeight: '900'
          }}>
            ←
          </Text>
        </Pressable>

        <Text style={{
          color: C.text,
          fontSize: 20,
          fontWeight: '900'
        }}>
          Upload My Own Poster
        </Text>

      </View>

      {/* POSTER PREVIEW */}
      <Pressable
        onPress={chooseActivityPoster}
        style={{
          height: 200,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 16,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {activityPoster ? (
          <Image
            source={{ uri: activityPoster }}
            style={{
              width: '100%',
              height: '100%'
            }}
            resizeMode="contain"
          />
        ) : (
          <>
            <Text style={{ fontSize: 45 }}>🖼️</Text>

            <Text style={{
              color: C.primary,
              fontWeight: '900',
              marginTop: 12
            }}>
              Choose Poster from Gallery
            </Text>

            <Text style={{
              color: C.muted,
              fontSize: 12,
              marginTop: 6
            }}>
              Select an image from your phone
            </Text>
          </>
        )}
      </Pressable>

      {/* CHOOSE AGAIN */}
      {activityPoster && (
        <Pressable
          onPress={chooseActivityPoster}
          style={{
            padding: 14,
            alignItems: 'center',
            marginTop: 12
          }}
        >
          <Text style={{
            color: C.primary,
            fontWeight: '900'
          }}>
            Choose Another Poster
          </Text>
        </Pressable>
      )}

      {/* USE POSTER */}
      <Pressable
        onPress={() => {
          if (!activityPoster) {
            Alert.alert(
              'Poster Required',
              'Please choose a poster first.'
            );
            return;
          }

          setShowPosterEditor(false);
        }}
        style={{
          backgroundColor: C.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 22
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: 15
        }}>
          Use This Poster
        </Text>
      </Pressable>

      <Text style={{
        color: C.muted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15
      }}>
        This poster will be used for this party only.
      </Text>

    </View>
  );
           }

function renderPosterTemplates() {
  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
      }}>

        <Pressable
          onPress={() => setShowPosterTemplates(false)}
          style={{
            position: 'absolute',
            left: 0,
            padding: 5
          }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 25,
            fontWeight: '900'
          }}>
            ←
          </Text>
        </Pressable>

        <Text style={{
          color: C.text,
          fontSize: 20,
          fontWeight: '900'
        }}>
          Official TALKZY Posters
        </Text>

      </View>

{/* OFFICIAL POSTER THEMES WILL APPEAR HERE */}

      {/* EMPTY GALLERY */}
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25
      }}>

        <Text style={{ fontSize: 55 }}>
          🎉
        </Text>

        <Text style={{
          color: C.text,
          fontSize: 18,
          fontWeight: '900',
          marginTop: 18,
          textAlign: 'center'
        }}>
          No Official Posters Available Yet
        </Text>

        <Text style={{
          color: C.muted,
          fontSize: 13,
          marginTop: 10,
          textAlign: 'center',
          lineHeight: 21
        }}>
          Official TALKZY poster themes will appear here when they are uploaded by the Main Owner or Assistant.
        </Text>

      </View>

    </View>
  );
}

function renderCreateRoomActivity() {
  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22
      }}>

        {/* BACK BUTTON */}
        <Pressable
          onPress={() => setShowCreateRoomActivity(false)}
          style={{
            position: 'absolute',
            left: 0,
            padding: 5
          }}
        >
          <Text style={{
            color: C.primary,
            fontSize: 25,
            fontWeight: '900'
          }}>
            ←
          </Text>
        </Pressable>

        {/* PAGE TITLE */}
        <Text style={{
          color: C.text,
          fontSize: 20,
          fontWeight: '900'
        }}>
          Create Room Activity
        </Text>

      </View>

      
<ScrollView
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
   
{/* ACTIVITY POSTER */}
<Text style={{
  color: C.text,
  fontSize: 16,
  fontWeight: '900',
  marginBottom: 12
}}>
  Activity Poster
</Text>

<Pressable
  onPress={() => setShowPosterOptions(true)}
  style={{
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden'
  }}
>
  {activityPoster || activityPosterTemplate ? (
    <Image
      source={{
  uri: activityPoster || activityPosterTemplate.image_url
}}
      style={{
        width: '100%',
        height: '100%'
      }}
      resizeMode="cover"
    />
  ) : (
    <>
      <Text style={{ fontSize: 38 }}>🖼️</Text>
      <Text style={{
        color: C.primary,
        fontWeight: '900',
        marginTop: 10
      }}>
        Choose Poster from Gallery
      </Text>
      <Text style={{
        color: C.muted,
        fontSize: 11,
        marginTop: 5
      }}>
        Select a 16:9 activity poster
      </Text>
    </>
  )}
</Pressable>

{/* ACTIVITY TITLE */}
<Text style={{
  color: C.text,
  fontSize: 15,
  fontWeight: '900',
  marginTop: 18,
  marginBottom: 8
}}>
  Activity Title
</Text>

<TextInput
  value={activityTitle}
  onChangeText={setActivityTitle}
  placeholder="Enter activity title"
  placeholderTextColor={C.muted}
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

{/* ACTIVITY DESCRIPTION */}
<Text style={{
  color: C.text,
  fontSize: 15,
  fontWeight: '900',
  marginTop: 18,
  marginBottom: 8
}}>
  Activity Description
</Text>

<TextInput
  value={activityDescription}
  onChangeText={setActivityDescription}
  placeholder="Tell everyone about your activity..."
  placeholderTextColor={C.muted}
  multiline
  numberOfLines={4}
  textAlignVertical="top"
  style={{
    backgroundColor: C.panel2,
    color: C.text,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 100
  }}
/>
 
</ScrollView>


    </View>
  );
}

function calculateEventEndAt() {
  if (!eventDraft.start_at) return '';

  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
      eventDraft.start_at.trim()
    );

  if (!match) return '';

  const [, year, month, day, hour, minute] = match;

  const start = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  if (
    start.getFullYear() !== Number(year) ||
    start.getMonth() !== Number(month) - 1 ||
    start.getDate() !== Number(day) ||
    start.getHours() !== Number(hour) ||
    start.getMinutes() !== Number(minute)
  ) {
    return '';
  }

  const end = new Date(start);

  if (eventDraft.duration === '7_days') {
    end.setDate(end.getDate() + 7);
  } else {
    const originalDay = end.getDate();

    end.setDate(1);
    end.setMonth(end.getMonth() + 1);

    const lastDay = new Date(
      end.getFullYear(),
      end.getMonth() + 1,
      0
    ).getDate();

    end.setDate(Math.min(originalDay, lastDay));
  }

  const pad = value => String(value).padStart(2, '0');

  return (
    `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}` +
    ` ${pad(end.getHours())}:${pad(end.getMinutes())}`
  );
}


  // =========================================
  // EVENTS: OFFICIAL EVENT MANAGEMENT LIST
  // =========================================

  function renderEventManagementList() {
    return (
      <View style={{ padding: 16, paddingBottom: 30 }}>

        <TouchableOpacity
          onPress={() => {
            setScreen('main');
            setActiveTab('Me');
          }}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 15,
            marginBottom: 20
          }}
        >
          <Text style={{ color: C.text, fontWeight: '800' }}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: C.text,
            fontSize: 22,
            fontWeight: '900',
            marginBottom: 22
          }}
        >
          Official Event Management
        </Text>

        <TouchableOpacity
          onPress={() => {
  setEventDraft({
    event_name: '',
    poster_uri: null,
    background_uri: null,
    border_uri: null,
    duration: '7_days',
    start_at: '',
    rules: '',
    gifts: [
      { name: '', coin_value: '', image_uri: null },
      { name: '', coin_value: '', image_uri: null },
      { name: '', coin_value: '', image_uri: null }
    ],
    top_rewards: [
      { description: '' },
      { description: '' },
      { description: '' }
    ],
    milestones: []
  });

  setShowEventPreview(false);
  setScreen('eventManagement');
}}
          style={{
            backgroundColor: C.accent,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginBottom: 25
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>
            + Create New Event
          </Text>
        </TouchableOpacity>

        {/* SCHEDULED EVENTS */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginBottom: 12
          }}
        >
          Scheduled Events
        </Text>

        <View
          style={{
            backgroundColor: C.panel,
            padding: 20,
            borderRadius: 12,
            marginBottom: 25
          }}
        >
          <Text style={{ color: C.muted, textAlign: 'center' }}>
            No Scheduled Events
          </Text>
        </View>

        {/* LIVE EVENTS */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginBottom: 12
          }}
        >
          Live Events
        </Text>

        <View
          style={{
            backgroundColor: C.panel,
            padding: 20,
            borderRadius: 12
          }}
        >
          <Text style={{ color: C.muted, textAlign: 'center' }}>
            No Live Events
          </Text>
        </View>

      </View>
    );
}
           

  // =========================================
  // EVENTS: OFFICIAL EVENT MANAGEMENT
  // =========================================

  function renderEventManagement() {
    return (
      <View style={{ padding: 16, paddingBottom: 30 }}>
         {/* BACK TO EVENT MANAGEMENT LIST */}
      <TouchableOpacity
        onPress={() => {
          setShowEventPreview(false);
          setScreen('eventManagementList');
        }}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: C.panel,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 15,
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontWeight: '800' }}>
          ← Back
        </Text>
      </TouchableOpacity>

        <Text
          style={{
            color: C.text,
            fontSize: 22,
            fontWeight: '900',
            marginBottom: 20
          }}
        >
          Create Official Event
        </Text>

        {/* EVENT NAME */}
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 8 }}>
          Event Name
        </Text>

        <TextInput
          value={eventDraft.event_name}
          onChangeText={value =>
            setEventDraft(previous => ({
              ...previous,
              event_name: value
            }))
          }
          placeholder="Enter event name"
          placeholderTextColor={C.muted}
          style={{
            backgroundColor: C.panel,
            color: C.text,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.line,
            padding: 14,
            marginBottom: 22
          }}
        />

        {/* EVENT POSTER */}
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 10 }}>
          Event Poster (16:8)
        </Text>

        <TouchableOpacity
          onPress={() => chooseEventImage('poster_uri')}
          style={{
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.accent,
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            marginBottom: 12
          }}
        >
          <Text style={{ color: C.text, fontWeight: '800' }}>
            Upload Event Poster
          </Text>
        </TouchableOpacity>

        {eventDraft.poster_uri && (
          <Image
            source={{ uri: eventDraft.poster_uri }}
            style={{
              width: '100%',
              aspectRatio: 2,
              borderRadius: 10,
              marginBottom: 22
            }}
            resizeMode="cover"
          />
        )}

        {/* EVENT BACKGROUND */}
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 10 }}>
          Event Background
        </Text>

        <TouchableOpacity
          onPress={() => chooseEventImage('background_uri')}
          style={{
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.accent,
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            marginBottom: 12
          }}
        >
          <Text style={{ color: C.text, fontWeight: '800' }}>
            Upload Event Background
          </Text>
        </TouchableOpacity>

        {eventDraft.background_uri && (
          <Image
            source={{ uri: eventDraft.background_uri }}
            style={{
              width: '100%',
              height: 150,
              borderRadius: 10,
              marginBottom: 22
            }}
            resizeMode="cover"
          />
        )}

        {/* BORDER DESIGN */}
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 10 }}>
          Event Border Design (Transparent PNG)
        </Text>

        <TouchableOpacity
          onPress={() => chooseEventImage('border_uri')}
          style={{
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.accent,
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            marginBottom: 12
          }}
        >
          <Text style={{ color: C.text, fontWeight: '800' }}>
            Upload Border Design
          </Text>
        </TouchableOpacity>
        {eventDraft.border_uri && (
          <Image
            source={{ uri: eventDraft.border_uri }}
            style={{
              width: '100%',
              height: 150,
              marginBottom: 22
            }}
            resizeMode="contain"
          />
        )}
             

        
        {/* EVENT GIFTS */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginBottom: 15
          }}
        >
          Event Gifts (Exactly 3)
        </Text>

        {eventDraft.gifts.map((gift, index) => (
          <View
            key={index}
            style={{
              backgroundColor: C.panel,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              padding: 14,
              marginBottom: 15
            }}
          >
            <Text
              style={{
                color: C.accent,
                fontWeight: '900',
                fontSize: 15,
                marginBottom: 12
              }}
            >
              Gift {index + 1}
            </Text>

            <TouchableOpacity
              onPress={() => chooseEventImage(null, index)}
              style={{
                backgroundColor: C.panel2,
                borderRadius: 10,
                padding: 14,
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <Text style={{ color: C.text, fontWeight: '800' }}>
                {gift.image_uri ? 'Change Gift Image' : 'Upload Gift Image'}
              </Text>
            </TouchableOpacity>

            {gift.image_uri && (
              <Image
                source={{ uri: gift.image_uri }}
                style={{
                  width: 85,
                  height: 85,
                  alignSelf: 'center',
                  marginBottom: 12
                }}
                resizeMode="contain"
              />
            )}

            <TextInput
              value={gift.name}
              onChangeText={value => {
                setEventDraft(previous => {
                  const updatedGifts = [...previous.gifts];
                  updatedGifts[index] = {
                    ...updatedGifts[index],
                    name: value
                  };
                  return { ...previous, gifts: updatedGifts };
                });
              }}
              placeholder="Enter gift name"
              placeholderTextColor={C.muted}
              style={{
                backgroundColor: C.panel2,
                color: C.text,
                borderRadius: 9,
                padding: 12,
                marginBottom: 10
              }}
            />

            <TextInput
              value={gift.coin_value}
              onChangeText={value => {
                setEventDraft(previous => {
                  const updatedGifts = [...previous.gifts];
                  updatedGifts[index] = {
                    ...updatedGifts[index],
                    coin_value: value
                  };
                  return { ...previous, gifts: updatedGifts };
                });
              }}
              placeholder="Gift coin value"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              style={{
                backgroundColor: C.panel2,
                color: C.text,
                borderRadius: 9,
                padding: 12
              }}
            />
          </View>
        ))}
         
        {/* EVENT DURATION */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginTop: 10,
            marginBottom: 12
          }}
        >
          Event Duration
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
          {[
            { label: '7 Days', value: '7_days' },
            { label: '1 Month', value: '1_month' }
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              onPress={() =>
                setEventDraft(previous => ({
                  ...previous,
                  duration: option.value
                }))
              }
              style={{
                flex: 1,
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor:
                  eventDraft.duration === option.value
                    ? C.accent
                    : C.panel,
                borderWidth: 1,
                borderColor: C.line
              }}
            >
              <Text style={{ color: C.text, fontWeight: '800' }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* EVENT START DATE AND TIME */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginBottom: 10
          }}
        >
          Event Start Date & Time
        </Text>

        <TextInput
          value={eventDraft.start_at}
          onChangeText={value =>
            setEventDraft(previous => ({
              ...previous,
              start_at: value
            }))
          }
          placeholder="YYYY-MM-DDTHH:MM"
          placeholderTextColor={C.muted}
          style={{
            backgroundColor: C.panel,
            color: C.text,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.line,
            padding: 14,
            marginBottom: 10
          }}
        />

        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>
          Enter the scheduled start time in India local time. The event end
          time will be calculated automatically from the selected duration.
        </Text>

        {/* AUTOMATIC EVENT END TIME */}
        <View
          style={{
            backgroundColor: C.panel,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.line,
            padding: 14,
            marginBottom: 22
          }}
        >
          <Text
            style={{
              color: C.text,
              fontWeight: '800',
              marginBottom: 8
            }}
          >
            Automatically Calculated End Date & Time
          </Text>

          <Text
            style={{
              color: C.accent,
              fontSize: 16,
              fontWeight: '900'
            }}
          >
            {calculateEventEndAt() || 'Enter a valid start date and time'}
          </Text>
        </View>


     {/* EVENT RULES */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginTop: 10,
            marginBottom: 12
          }}
        >
          Event Rules
        </Text>

        <TextInput
          value={eventDraft.rules}
          onChangeText={value =>
            setEventDraft(previous => ({
              ...previous,
              rules: value
            }))
          }
          placeholder="Write the rules and conditions of this event..."
          placeholderTextColor={C.muted}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: C.panel,
            color: C.text,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.line,
            padding: 14,
            minHeight: 130,
            marginBottom: 22
          }}
        />

        {/* TOP 3 WINNER REWARDS */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginBottom: 14
          }}
        >
          Top 3 Winner Rewards
        </Text>

        {eventDraft.top_rewards.map((reward, index) => (
          <View
            key={index}
            style={{
              backgroundColor: C.panel,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              padding: 14,
              marginBottom: 12
            }}
          >
            <Text
              style={{
                color: C.gold,
                fontWeight: '900',
                marginBottom: 10
              }}
            >
              {['🥇 First Place', '🥈 Second Place', '🥉 Third Place'][index]}
            </Text>

            <TextInput
              value={reward.description}
              onChangeText={value => {
                setEventDraft(previous => {
                  const updatedRewards = [...previous.top_rewards];

                  updatedRewards[index] = {
                    ...updatedRewards[index],
                    description: value
                  };

                  return {
                    ...previous,
                    top_rewards: updatedRewards
                  };
                });
              }}
              placeholder="Describe the winner reward..."
              placeholderTextColor={C.muted}
              multiline
              style={{
                backgroundColor: C.panel2,
                color: C.text,
                borderRadius: 9,
                padding: 12,
                minHeight: 65
              }}
            />
          </View>
        ))}
             
        {/* EVENT MILESTONES */}
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '900',
            marginTop: 12,
            marginBottom: 12
          }}
        >
          Event Milestones
        </Text>

        <Text
          style={{
            color: C.muted,
            fontSize: 12,
            marginBottom: 14
          }}
        >
          Add as many milestones as needed. Each milestone can reward gifts, coins, or VIP.
        </Text>

        {eventDraft.milestones.map((milestone, index) => (
          <View
            key={milestone.id || index}
            style={{
              backgroundColor: C.panel,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              padding: 14,
              marginBottom: 14
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14
              }}
            >
              <Text style={{ color: C.accent, fontWeight: '900' }}>
                Milestone {index + 1}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setEventDraft(previous => ({
                    ...previous,
                    milestones: previous.milestones.filter(
                      (_, i) => i !== index
                    )
                  }))
                }
              >
                <Text style={{ color: C.danger, fontWeight: '800' }}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={milestone.target}
              onChangeText={value => {
                setEventDraft(previous => {
                  const updated = [...previous.milestones];
                  updated[index] = {
                    ...updated[index],
                    target: value
                  };
                  return { ...previous, milestones: updated };
                });
              }}
              placeholder="Target coins spent"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              style={{
                backgroundColor: C.panel2,
                color: C.text,
                borderRadius: 9,
                padding: 12,
                marginBottom: 14
              }}
            />

            <Text
              style={{
                color: C.text,
                fontWeight: '800',
                marginBottom: 10
              }}
            >
              Reward Type
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginBottom: 14
              }}
            >
              {['gift', 'coins', 'vip'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setEventDraft(previous => {
                      const updated = [...previous.milestones];
                      updated[index] = {
                        ...updated[index],
                        reward_type: type
                      };
                      return { ...previous, milestones: updated };
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: 11,
                    borderRadius: 9,
                    alignItems: 'center',
                    backgroundColor:
                      milestone.reward_type === type
                        ? C.accent
                        : C.panel2
                  }}
                >
                  <Text style={{ color: C.text, fontWeight: '800' }}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={milestone.reward_description}
              onChangeText={value => {
                setEventDraft(previous => {
                  const updated = [...previous.milestones];
                  updated[index] = {
                    ...updated[index],
                    reward_description: value
                  };
                  return { ...previous, milestones: updated };
                });
              }}
              placeholder="Describe the milestone reward..."
              placeholderTextColor={C.muted}
              multiline
              style={{
                backgroundColor: C.panel2,
                color: C.text,
                borderRadius: 9,
                padding: 12,
                minHeight: 65
              }}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={() =>
            setEventDraft(previous => ({
              ...previous,
              milestones: [
                ...previous.milestones,
                {
                  id: `milestone-${Date.now()}`,
                  target: '',
                  reward_type: 'coins',
                  reward_description: ''
                }
              ]
            }))
          }
          style={{
            backgroundColor: C.panel,
            borderWidth: 1,
            borderColor: C.accent,
            borderRadius: 10,
            padding: 15,
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <Text style={{ color: C.accent, fontWeight: '900' }}>
            + Add Another Milestone
          </Text>
        </TouchableOpacity>
                     {/* PREVIEW EVENT BUTTON */}
        <TouchableOpacity
          onPress={handlePreviewEvent}
          style={{
            backgroundColor: C.accent,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 20
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '900'
            }}
          >
            Preview Event
          </Text>
        </TouchableOpacity>

      </View>
    );
                 }


function renderEventPreview() {
  return (
    <View style={{ padding: 16, paddingBottom: 35 }}>
   


      {/* BACK TO EVENT EDITING */}
      <TouchableOpacity
        onPress={() => setShowEventPreview(false)}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: C.panel,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 10,
          paddingVertical: 11,
          paddingHorizontal: 16,
          marginBottom: 18
        }}
      >
        <Text style={{ color: C.text, fontWeight: '800' }}>
          ← Back to Edit
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: C.text,
          fontSize: 22,
          fontWeight: '900',
          marginBottom: 18
        }}
      >
        Preview Official Event
      </Text>
         
      

      {/* EVENT POSTER */}
      {eventDraft.poster_uri ? (
        <Image
          source={{ uri: eventDraft.poster_uri }}
          style={{
            width: '100%',
            aspectRatio: 2,
            borderRadius: 12,
            marginBottom: 18
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            aspectRatio: 2,
            backgroundColor: C.panel,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 18
          }}
        >
          <Text style={{ color: C.muted }}>
            Event Poster Not Selected
          </Text>
        </View>
      )}

      {/* EVENT NAME */}
      <Text
        style={{
          color: C.text,
          fontSize: 21,
          fontWeight: '900',
          marginBottom: 18
        }}
      >
        {eventDraft.event_name || 'Untitled Event'}
      </Text>

      {/* EVENT BACKGROUND */}
      <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>
        Event Background
      </Text>

      {eventDraft.background_uri ? (
        <Image
          source={{ uri: eventDraft.background_uri }}
          style={{
            width: '100%',
            height: 150,
            borderRadius: 10,
            marginBottom: 18
          }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ color: C.muted, marginBottom: 18 }}>
          No background selected
        </Text>
      )}

      {/* BORDER DESIGN */}
      <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>
        Border Design
      </Text>

      {eventDraft.border_uri ? (
        <Image
          source={{ uri: eventDraft.border_uri }}
          style={{
            width: '100%',
            height: 150,
            marginBottom: 18
          }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ color: C.muted, marginBottom: 18 }}>
          No border design selected
        </Text>
      )}

      {/* EVENT DURATION */}
      <Text style={{ color: C.text, fontWeight: '900', marginBottom: 8 }}>
        Event Duration
      </Text>

      <Text style={{ color: C.muted, marginBottom: 18 }}>
        {eventDraft.duration === '7_days' ? '7 Days' : '1 Month'}
      </Text>

      {/* EVENT SCHEDULE */}
      <Text style={{ color: C.text, fontWeight: '900', marginBottom: 8 }}>
        Event Start
      </Text>

      <Text style={{ color: C.muted, marginBottom: 14 }}>
        {eventDraft.start_at || 'Not selected'}
      </Text>

      <Text style={{ color: C.text, fontWeight: '900', marginBottom: 8 }}>
        Event End
      </Text>

      <Text style={{ color: C.accent, marginBottom: 22 }}>
        {calculateEventEndAt() || 'Not calculated'}
      </Text>

      {/* EVENT GIFTS */}
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 14 }}>
        Event Gifts
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
        {eventDraft.gifts.map((gift, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              backgroundColor: C.panel,
              borderRadius: 10,
              padding: 8,
              alignItems: 'center'
            }}
          >
            {gift.image_uri ? (
              <Image
                source={{ uri: gift.image_uri }}
                style={{ width: 55, height: 55 }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: 28 }}>🎁</Text>
            )}

            <Text style={{ color: C.text, fontWeight: '800', textAlign: 'center' }}>
              {gift.name || `Gift ${index + 1}`}
            </Text>

            <Text style={{ color: C.gold, fontSize: 12 }}>
              {gift.coin_value || '0'} Coins
            </Text>
          </View>
        ))}
      </View>

      {/* EVENT RULES */}
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 10 }}>
        Event Rules
      </Text>

      <Text style={{ color: C.muted, marginBottom: 22 }}>
        {eventDraft.rules || 'No rules added yet.'}
      </Text>

      {/* TOP 3 REWARDS */}
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 12 }}>
        Top 3 Winner Rewards
      </Text>

      {eventDraft.top_rewards.map((reward, index) => (
        <View
          key={index}
          style={{
            backgroundColor: C.panel,
            padding: 12,
            borderRadius: 10,
            marginBottom: 10
          }}
        >
          <Text style={{ color: C.gold, fontWeight: '900' }}>
            {['🥇 First Place', '🥈 Second Place', '🥉 Third Place'][index]}
          </Text>

          <Text style={{ color: C.muted, marginTop: 6 }}>
            {reward.description || 'No reward added'}
          </Text>
        </View>
      ))}

      {/* MILESTONES */}
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 14, marginBottom: 12 }}>
        Event Milestones
      </Text>

      {eventDraft.milestones.length === 0 ? (
        <Text style={{ color: C.muted }}>
          No milestones added yet.
        </Text>
      ) : (
        eventDraft.milestones.map((milestone, index) => (
          <View
            key={milestone.id || index}
            style={{
              backgroundColor: C.panel,
              padding: 12,
              borderRadius: 10,
              marginBottom: 10
            }}
          >
            <Text style={{ color: C.accent, fontWeight: '900' }}>
              Milestone {index + 1}
            </Text>

            <Text style={{ color: C.text, marginTop: 6 }}>
              Target: {milestone.target || 'Not set'} Coins
            </Text>

            <Text style={{ color: C.text, marginTop: 5 }}>
              Reward Type: {(milestone.reward_type || 'coins').toUpperCase()}
            </Text>

            <Text style={{ color: C.muted, marginTop: 5 }}>
              {milestone.reward_description || 'No reward description'}
            </Text>
          </View>
        ))
      )}

      {/* PUBLISH EVENT BUTTON */}
      <TouchableOpacity
        disabled={true}
        style={{
          backgroundColor: C.panel2,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          padding: 17,
          alignItems: 'center',
          marginTop: 22,
          opacity: 0.55
        }}
      >
        <Text
          style={{
            color: C.muted,
            fontSize: 16,
            fontWeight: '900'
          }}
        >
          Publish Event
        </Text>
      </TouchableOpacity>

         
    </View>
  );
         }
           
function handlePreviewEvent() {
  if (!eventDraft.event_name.trim()) {
    Alert.alert('Missing Information', 'Please enter the event name.');
    return;
  }

  if (!eventDraft.poster_uri) {
    Alert.alert('Missing Information', 'Please upload the event poster.');
    return;
  }

  if (!eventDraft.background_uri) {
    Alert.alert('Missing Information', 'Please upload the event background.');
    return;
  }

  if (!eventDraft.border_uri) {
    Alert.alert('Missing Information', 'Please upload the border design.');
    return;
  }

  for (let i = 0; i < 3; i++) {
    const gift = eventDraft.gifts[i];

    if (
      !gift ||
      !gift.image_uri ||
      !gift.name.trim() ||
      !/^[1-9]\d*$/.test(String(gift.coin_value).trim())
    ) {
      Alert.alert(
        'Incomplete Gift',
        `Please complete Gift ${i + 1}: image, name and a valid coin value.`
      );
      return;
    }
  }

  const startValue = eventDraft.start_at.trim();
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(startValue);

  if (!dateMatch) {
    Alert.alert(
      'Invalid Start Time',
      'Enter the date and time in YYYY-MM-DDTHH:MM format.'
    );
    return;
  }

  const [, year, month, day, hour, minute] = dateMatch;
  const startDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  if (
    startDate.getFullYear() !== Number(year) ||
    startDate.getMonth() !== Number(month) - 1 ||
    startDate.getDate() !== Number(day) ||
    startDate.getHours() !== Number(hour) ||
    startDate.getMinutes() !== Number(minute)
  ) {
    Alert.alert('Invalid Start Time', 'Please enter a valid date and time.');
    return;
  }

  if (!eventDraft.rules.trim()) {
    Alert.alert('Missing Information', 'Please enter the event rules.');
    return;
  }
   if (startDate.getTime() <= Date.now()) {
    Alert.alert(
      'Invalid Start Time',
      'The event start time must be in the future.'
    );
    return;
   }

  for (let i = 0; i < 3; i++) {
    if (!eventDraft.top_rewards[i]?.description.trim()) {
      Alert.alert(
        'Missing Reward',
        `Please enter the reward for position ${i + 1}.`
      );
      return;
    }
  }

  for (let i = 0; i < eventDraft.milestones.length; i++) {
    const milestone = eventDraft.milestones[i];

    if (
  !/^[1-9]\d*$/.test(String(milestone.target).trim()) ||
  !milestone.reward_description.trim()
){
      Alert.alert(
        'Incomplete Milestone',
        `Please complete Milestone ${i + 1}, or remove it.`
      );
      return;
    }
  }

  setShowEventPreview(true);
                }

           
// =========================================
// EVENTS: EVENT DETAIL PAGE
// =========================================

function renderEventDetail() {
  const eventName =
    selectedOfficialEvent?.event_name ||
    selectedOfficialEvent?.name ||
    'Event Details';

  return (
    <View style={{ flex: 1, paddingBottom: 20 }}>

      {/* EVENT DETAIL HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: C.line,
          marginBottom: 18
        }}
      >
        <TouchableOpacity
          onPress={closeOfficialEvent}
          style={{ paddingRight: 14, paddingVertical: 5 }}
        >
          <Text style={{ color: C.text, fontSize: 28 }}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: '800',
            flex: 1
          }}
          numberOfLines={1}
        >
          {eventName}
        </Text>
      </View>

      
      {/* EVENT BANNER */}
<View
  style={{
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: '#D6A84F',
    marginBottom: 18
  }}
>
  {selectedOfficialEvent?.poster_url ? (
    <Image
      source={{ uri: selectedOfficialEvent.poster_url }}
      style={{
        width: '100%',
        aspectRatio: 2
      }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={{
        width: '100%',
        aspectRatio: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#21183D'
      }}
    >
      <Text
        style={{
          color: '#D6A84F',
          fontSize: 16,
          fontWeight: '800'
        }}
      >
        EVENT BANNER
      </Text>
    </View>
  )}
</View>

      {/* REWARDS & RULES BUTTON */}
      <TouchableOpacity
        onPress={() => setEventInfoPopup('options')}
        style={{
          backgroundColor: C.panel,
          borderWidth: 1,
          borderColor: C.accent,
          borderRadius: 12,
          padding: 15,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text
          style={{
            color: C.text,
            fontSize: 15,
            fontWeight: '800'
          }}
        >
          Rewards & Rules
        </Text>

        <Text style={{ color: C.accent, fontSize: 20 }}>
          ›
        </Text>
      </TouchableOpacity>

{/* EVENT GIFTS */}
      <View
        style={{
          backgroundColor: C.panel,
          borderRadius: 12,
          padding: 15,
          marginBottom: 20
        }}
      >
        <Text
          style={{
            color: C.text,
            fontSize: 17,
            fontWeight: '800',
            marginBottom: 15
          }}
        >
          Event Gifts
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          {(selectedOfficialEvent?.gifts || []).slice(0, 3).map((item, index) => (
            <View
              key={item.id || index}
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: C.panel2,
                borderRadius: 10,
                paddingVertical: 15,
                paddingHorizontal: 5
              }}
            >
              {item.image_url ? (
  <Image
    source={{ uri: item.image_url }}
    style={{
      width: 55,
      height: 55,
      resizeMode: 'contain'
    }}
  />
) : (
  <Text style={{ fontSize: 28 }}>
    🎁
  </Text>
)}

              <Text
                style={{
                  color: C.text,
                  fontSize: 12,
                  fontWeight: '800',
                  marginTop: 8
                }}
              >
                {item.name || `Gift ${index + 1}`}
              </Text>

              <Text
                style={{
                  color: C.gold,
                  fontSize: 12,
                  marginTop: 5
                }}
              >
                {Number(item.coin_value || 0).toLocaleString()} Coins
              </Text>
            </View>
          ))}
        </View>
      </View>

{/* COMPACT EVENT COUNTDOWN */}
<View
  style={{
    backgroundColor: '#24144D',
    borderWidth: 1,
    borderColor: '#9B79FF',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center'
  }}
>
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6
    }}
  >
    <Text
      style={{
        color: '#FFD36B',
        fontSize: 10,
        fontWeight: '900'
      }}
    >
      ENDS IN
    </Text>

    <Text
      style={{
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900'
      }}
    >
      {eventCountdown.days}d : {eventCountdown.hours}h : {eventCountdown.minutes}m : {eventCountdown.seconds}s
    </Text>
  </View>
</View>


           
      {/* RANK AND TASKS NAVIGATION */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: C.panel,
          borderRadius: 12,
          padding: 5,
          marginBottom: 18
        }}
      >
        {['rank', 'tasks'].map(section => (
          <TouchableOpacity
            key={section}
            onPress={() => setActiveEventSection(section)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 9,
              backgroundColor:
                activeEventSection === section
                  ? C.accent
                  : 'transparent'
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 15,
                fontWeight: '800'
              }}
            >
              {section === 'rank' ? 'Rank' : 'Tasks'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

         {/* RANK SECTION */}
{activeEventSection === 'rank' && (
  <View
    style={{
      backgroundColor: C.panel,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20
    }}
  >
    {/* LEADERBOARD TITLE */}
    <Text
      style={{
        color: C.text,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 5
      }}
    >
      🏆 Event Leaderboard
    </Text>

    <Text
      style={{
        color: C.muted,
        fontSize: 11,
        marginBottom: 16
      }}
    >
      Top 30 event participants
    </Text>

    {/* TOP 30 LEADERBOARD */}
    {Array.from({ length: 30 }, (_, index) => index + 1).map(rank => (
      <View
        key={rank}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor:
            rank === 1 ? '#3A3020' :
            rank === 2 ? '#292D38' :
            rank === 3 ? '#382820' :
            C.panel2,
          borderWidth: rank <= 3 ? 1 : 0,
          borderColor:
            rank === 1 ? '#D6A84F' :
            rank === 2 ? '#AAB5C5' :
            rank === 3 ? '#B87950' :
            'transparent',
          borderRadius: rank <= 3 ? 12 : 9,
          padding: rank <= 3 ? 13 : 10,
          marginBottom: 8
        }}
      >
        {/* RANK NUMBER */}
        <View
          style={{
            width: 32,
            alignItems: 'center',
            marginRight: 8
          }}
        >
          <Text
            style={{
              color:
                rank === 1 ? '#FFD36B' :
                rank === 2 ? '#C7D2E0' :
                rank === 3 ? '#CD8B5B' :
                C.muted,
              fontSize: rank <= 3 ? 18 : 13,
              fontWeight: '900'
            }}
          >
            {rank === 1 ? '🥇' :
             rank === 2 ? '🥈' :
             rank === 3 ? '🥉' :
             rank}
          </Text>
        </View>

        {/* PLAYER AVATAR */}
        <View
          style={{
            width: rank <= 3 ? 44 : 34,
            height: rank <= 3 ? 44 : 34,
            borderRadius: rank <= 3 ? 22 : 17,
            backgroundColor: C.panel,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            borderWidth: rank === 1 ? 2 : 0,
            borderColor: '#D6A84F'
          }}
        >
          <Text style={{ fontSize: rank <= 3 ? 21 : 16 }}>
            👤
          </Text>
        </View>

        {/* PLAYER INFORMATION */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: rank === 1 ? '#FFD36B' : C.text,
              fontSize: rank <= 3 ? 14 : 12,
              fontWeight: '900'
            }}
          >
            {rank === 1 ? '👑 Top Champion' :
             rank === 2 ? 'Silver Champion' :
             rank === 3 ? 'Bronze Champion' :
             'Player'}
          </Text>

          <Text
            style={{
              color: C.muted,
              fontSize: 10,
              marginTop: 4
            }}
          >
            TALKZY ID: —
          </Text>
        </View>

        {/* COINS */}
        <View
          style={{
            alignItems: 'flex-end'
          }}
        >
          <Text
            style={{
              color: rank <= 3 ? '#FFD36B' : C.gold,
              fontSize: rank <= 3 ? 13 : 11,
              fontWeight: '900'
            }}
          >
            0
          </Text>

          <Text
            style={{
              color: C.muted,
              fontSize: 9,
              marginTop: 2
            }}
          >
            Coins
          </Text>
        </View>
      </View>
    ))}

    {/* MY CONTRIBUTION */}
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: C.line,
        paddingTop: 16,
        marginTop: 8
      }}
    >
      <Text
        style={{
          color: C.accent,
          fontSize: 15,
          fontWeight: '900',
          marginBottom: 12
        }}
      >
        💎 My Contribution
      </Text>

      <View
        style={{
          backgroundColor: C.panel2,
          borderWidth: 1,
          borderColor: C.accent,
          borderRadius: 12,
          padding: 13,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* MY PROFILE */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: C.panel,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              overflow: 'hidden'
            }}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: 42, height: 42 }}
              />
            ) : (
              <Text style={{ fontSize: 20 }}>👤</Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: C.text,
                fontWeight: '900',
                fontSize: 13
              }}
            >
              {profile?.display_name || 'Your Name'}
            </Text>

            <Text
              style={{
                color: C.muted,
                fontSize: 10,
                marginTop: 4
              }}
            >
              TALKZY ID: {profile?.talkzy_id || '—'}
            </Text>
          </View>
        </View>

        {/* MY COINS */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: C.gold,
              fontSize: 16,
              fontWeight: '900'
            }}
          >
            0
          </Text>

          <Text
            style={{
              color: C.muted,
              fontSize: 10,
              marginTop: 2
            }}
          >
            Coins
          </Text>
        </View>
      </View>
    </View>
  </View>
)}

      {/* TASKS SECTION */}
{activeEventSection === 'tasks' && (
  <View
    style={{
      backgroundColor: C.panel,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20
    }}
  >
    {/* SECTION HEADER */}
    <Text
      style={{
        color: C.text,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 5
      }}
    >
      🏆 Event Milestones
    </Text>

    <Text
      style={{
        color: C.muted,
        fontSize: 11,
        marginBottom: 16
      }}
    >
      Complete milestones to unlock event rewards
    </Text>

    {/* MILESTONE CARDS */}
    {(selectedOfficialEvent?.milestones || []).map((task, index) => (
      <View
        key={task.id || index}
        style={{
          backgroundColor: C.panel2,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          padding: 14,
          marginBottom: 12
        }}
      >
        {/* MILESTONE TITLE */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text
            style={{
              color: C.text,
              fontSize: 14,
              fontWeight: '900'
            }}
          >
            🎯 Milestone {index + 1}
          </Text>

          <View
            style={{
              backgroundColor: '#34264F',
              borderRadius: 7,
              paddingHorizontal: 9,
              paddingVertical: 5
            }}
          >
            <Text
              style={{
                color: '#C7A8FF',
                fontSize: 10,
                fontWeight: '900'
              }}
            >
              TARGET
            </Text>
          </View>
        </View>

        {/* TARGET */}
        <Text
          style={{
            color: C.text,
            fontSize: 13,
            fontWeight: '700',
            marginTop: 10
          }}
        >
          {task.target}
        </Text>

        {/* REWARD */}
        <View
          style={{
            backgroundColor: '#33291A',
            borderRadius: 8,
            padding: 10,
            marginTop: 12
          }}
        >
          <Text
            style={{
              color: '#FFD36B',
              fontSize: 11,
              fontWeight: '900',
              marginBottom: 4
            }}
          >
            🎁 MILESTONE REWARD
          </Text>

          <Text
            style={{
              color: C.gold,
              fontSize: 13,
              fontWeight: '800'
            }}
          >
            {task.reward_description}
          </Text>
        </View>

        {/* PROGRESS */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            marginBottom: 7
          }}
        >
          <Text
            style={{
              color: C.text,
              fontSize: 11,
              fontWeight: '800'
            }}
          >
            Progress
          </Text>

          <Text
            style={{
              color: C.accent,
              fontSize: 11,
              fontWeight: '900'
            }}
          >
            0%
          </Text>
        </View>

        {/* PROGRESS BAR */}
        <View
          style={{
            height: 8,
            backgroundColor: C.line,
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          <View
            style={{
              width: '0%',
              height: 8,
              backgroundColor: C.accent,
              borderRadius: 10
            }}
          />
        </View>

        {/* STATUS */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10
          }}
        >
          <View
            style={{
              backgroundColor: '#382626',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 5
            }}
          >
            <Text
              style={{
                color: '#FF9999',
                fontSize: 10,
                fontWeight: '900'
              }}
            >
              ● NOT COMPLETED
            </Text>
          </View>

          <Text
            style={{
              color: C.muted,
              fontSize: 10,
              marginLeft: 8
            }}
          >
            Reward not received
          </Text>
        </View>
      </View>
    ))}

    {/* EMPTY STATE */}
    {(selectedOfficialEvent?.milestones || []).length === 0 && (
      <View
        style={{
          backgroundColor: C.panel2,
          borderRadius: 10,
          padding: 22,
          alignItems: 'center'
        }}
      >
        <Text style={{ fontSize: 30 }}>🎯</Text>

        <Text
          style={{
            color: C.text,
            fontWeight: '800',
            marginTop: 10
          }}
        >
          No Milestones Yet
        </Text>

        <Text
          style={{
            color: C.muted,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 6
          }}
        >
          Event milestones will appear here when they are added.
        </Text>
      </View>
    )}
  </View>
)}
      
           

       
      {/* REWARDS & RULES OPTIONS POPUP */}
      <Modal
        visible={eventInfoPopup === 'options'}
        transparent
        animationType="fade"
        onRequestClose={() => setEventInfoPopup(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: C.panel,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: C.line
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 19,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: 22
              }}
            >
              Rewards & Rules
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setEventInfoPopup('rules')}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                  Rules
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEventInfoPopup('rewards')}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                  Rewards
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setEventInfoPopup(null)}
              style={{ marginTop: 18, alignItems: 'center' }}
            >
              <Text style={{ color: C.muted, fontWeight: '700' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
                 
      {/* EVENT RULES POPUP */}
      <Modal
        visible={eventInfoPopup === 'rules'}
        transparent
        animationType="fade"
        onRequestClose={() => setEventInfoPopup('options')}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25
          }}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '75%',
              backgroundColor: C.panel,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: C.line
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 19,
                fontWeight: '800',
                marginBottom: 18
              }}
            >
              Event Rules
            </Text>

            <ScrollView>
              <Text style={{ color: C.muted, fontSize: 14, lineHeight: 23 }}>
                {selectedOfficialEvent?.rules || 'Event rules will appear here once configured by TALKZY management.'}
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setEventInfoPopup('options')}
              style={{
                backgroundColor: C.accent,
                padding: 13,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 18
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

   
      {/* EVENT REWARDS POPUP */}
      <Modal
        visible={eventInfoPopup === 'rewards'}
        transparent
        animationType="fade"
        onRequestClose={() => setEventInfoPopup('options')}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25
          }}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '75%',
              backgroundColor: C.panel,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: C.line
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 19,
                fontWeight: '800',
                marginBottom: 20
              }}
            >
              Winner Rewards
            </Text>

            {[1, 2, 3].map(rank => (
              <View
                key={rank}
                style={{
                  backgroundColor: C.panel2,
                  borderRadius: 10,
                  padding: 15,
                  marginBottom: 12
                }}
              >
                <Text
                  style={{
                    color: C.gold,
                    fontSize: 15,
                    fontWeight: '800',
                    marginBottom: 6
                  }}
                >
                  {rank === 1 ? '🥇 1st Place' :
                   rank === 2 ? '🥈 2nd Place' :
                   '🥉 3rd Place'}
                </Text>

                <Text style={{ color: C.text, fontSize: 13 }}>
                  {selectedOfficialEvent?.top_rewards?.[rank - 1]?.description ||
                    'Reward details will appear here.'}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setEventInfoPopup('options')}
              style={{
                backgroundColor: C.accent,
                padding: 13,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
                 

    </View>
  );
}


function renderMainContent() {
    if (screen === 'eventManagementList') {
    return renderEventManagementList();
    }
   if (showEventPreview) {
    return renderEventPreview();
}
    if (screen === 'eventManagement') {
    return renderEventManagement();
    }
   if (screen === 'eventDetail') {
    return renderEventDetail();
   }
   if (showPosterEditor) {
    return renderPosterEditor();
   }
 if (showPosterTemplates) {
  return renderPosterTemplates();
 }
   if (showPosterOptions) {
    return renderPosterOptions();
   }

  if (showCreateRoomActivity) {
    return renderCreateRoomActivity();
  }

  if (showMySubscription) {
    return renderMySubscription();
  }

  if (showCountryRegion) {
  return renderCountryRegion();
 }
   if (showCountryRooms) {
    return renderCountryRooms();
   }
   if (screen === 'roomInterior') {
    return renderRoomInterior();
   }
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
  !['roomInterior', 'roomSettings', 'createRoom', 'hotRooms', 'newRooms', 'eventDetail', 'eventManagement', 'eventManagementList'].includes(screen) &&    !showEventPreview &&
    !showCountryRooms &&
    !showCountryRegion &&
    !showMySubscription &&
    !showCreateRoomActivity &&
    !showPosterTemplates &&
    !showPosterOptions &&
    !showPosterEditor && (
      <View style={{ paddingHorizontal: 15 }}>
        {renderMainHeader()}
      </View>
    )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
  paddingHorizontal: screen === 'roomInterior' ? 0 : 15,
  paddingBottom: screen === 'roomInterior' ? 0 : 25,
  flexGrow: 1
}}
          keyboardShouldPersistTaps="handled"
        >
          {renderMainContent()}
        </ScrollView>
      </View>

                 {/* FLOATING MINI ROOM */}
      {isRoomMinimized && selectedRoom && screen !== 'roomInterior' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 14,
            marginHorizontal: 12,
            marginBottom: 8,
            padding: 10
          }}
        >
          {/* RESTORE ROOM */}
          <TouchableOpacity
            onPress={() => {
  setIsRoomMinimized(false);

  if (selectedRoom?.id) {
    loadRoomMicSeats(selectedRoom.id);
  }

  setScreen('roomInterior');
}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1
            }}
          >
            {selectedRoom.room_dp_url ? (
              <Image
                source={{ uri: selectedRoom.room_dp_url }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  marginRight: 10
                }}
              />
            ) : (
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: C.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10
                }}
              >
                <Text style={{ fontSize: 20 }}>🎙️</Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: C.text,
                  fontWeight: 'bold',
                  fontSize: 14
                }}
                numberOfLines={1}
              >
                {selectedRoom.room_name}
              </Text>

              <Text
                style={{
                  color: C.muted,
                  fontSize: 11,
                  marginTop: 3
                }}
              >
                Tap to return to room
              </Text>
            </View>

            <Text style={{ fontSize: 20, marginRight: 8 }}>
              {isOnMic ? '🎙️' : '🔊'}
            </Text>
          </TouchableOpacity>

          {/* EXIT MINI ROOM */}
          <TouchableOpacity
            onPress={() => {
              setIsRoomMinimized(false);
              setIsOnMic(false);
              setSelectedRoom(null);
              setShowRoomMenu(false);
              setShowRoomTools(false);
              setShowRoomGiftPanel(false);
            }}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 6
            }}
          >
            <Text style={{ color: '#FF5B5B', fontSize: 20 }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      )}

{!['roomInterior', 'roomSettings', 'createRoom', 'hotRooms', 'newRooms', 'eventDetail', 'eventManagement', 'eventManagementList'].includes(screen) &&
        !showEventPreview &&
        !showCountryRooms &&
        !showCountryRegion &&
        !showMySubscription &&
        !showCreateRoomActivity &&
        !showPosterOptions &&
        !showPosterTemplates &&
        !showPosterEditor &&
        renderBottomNavigation()}


{/* =========================================
    ROOM DETAILS POPUP
========================================= */}

<Modal
  visible={roomDetailsVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setRoomDetailsVisible(false)}
>
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.80)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15
    }}
  >
    <View
      style={{
        width: '100%',
        maxHeight: '85%',
        backgroundColor: C.panel,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.line,
        overflow: 'hidden'
      }}
    >
      {/* POPUP HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.line
        }}
      >
        <Text
          style={{
            color: C.text,
            fontSize: 19,
            fontWeight: '900',
            flex: 1
          }}
        >
          Room Details
        </Text>

        <TouchableOpacity
          onPress={() => setRoomDetailsVisible(false)}
          style={{ padding: 5 }}
        >
          <Text style={{ color: C.muted, fontSize: 23 }}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* THREE TABS */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: C.line
        }}
      >
        {['Information', 'Members', 'Activity'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setRoomDetailsTab(tab)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 11,
              marginHorizontal: 3,
              borderRadius: 9,
              backgroundColor:
                roomDetailsTab === tab
                  ? C.accent
                  : C.panel2
            }}
          >
            <Text
              style={{
                color: C.text,
                fontSize: 12,
                fontWeight: '900'
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ maxHeight: 480 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {roomDetails && (
          <>
            {/* INFORMATION TAB */}
            {roomDetailsTab === 'Information' && (
              <View>
                <Text
                  style={{
                    color: C.text,
                    fontSize: 20,
                    fontWeight: '900',
                    marginBottom: 18
                  }}
                >
                  {roomDetails.room_name || 'Room'}
                </Text>

                <View
                  style={{
                    backgroundColor: C.panel2,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12
                  }}
                >
                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    FAMILY
                  </Text>
                  <Text
                    style={{
                      color: C.text,
                      fontSize: 15,
                      fontWeight: '800',
                      marginTop: 5
                    }}
                  >
                    {roomDetails.family_name ||
                      roomDetails.family?.name ||
                      'Not assigned'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: C.panel2,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12
                  }}
                >
                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    ROOM LEVEL
                  </Text>
                  <Text
                    style={{
                      color: C.gold,
                      fontSize: 16,
                      fontWeight: '900',
                      marginTop: 5
                    }}
                  >
                    {roomDetails.level ??
                      roomDetails.room_level ??
                      1}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: C.panel2,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12
                  }}
                >
                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    ANNOUNCEMENT
                  </Text>
                  <Text
                    style={{
                      color: C.text,
                      fontSize: 13,
                      marginTop: 8,
                      lineHeight: 21
                    }}
                  >
                    {roomDetails.announcement ||
                      'No announcement available.'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: C.panel2,
                    padding: 14,
                    borderRadius: 12
                  }}
                >
                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    DESCRIPTION
                  </Text>
                  <Text
                    style={{
                      color: C.text,
                      fontSize: 13,
                      marginTop: 8
                    }}
                  >
                    {roomDetails.description ||
                      'Welcome to TALKZY'}
                  </Text>
                </View>
              </View>
            )}

            {/* MEMBERS TAB */}
            {roomDetailsTab === 'Members' && (
              <View>
                <Text style={{ color: C.text, fontWeight: '900' }}>
                  Room Members
                </Text>
                <Text style={{ color: C.muted, marginTop: 8 }}>
                  Member list will be connected in the next step.
                </Text>
              </View>
            )}

            {/* ACTIVITY TAB */}
            {roomDetailsTab === 'Activity' && (
              <View>
                <Text style={{ color: C.text, fontWeight: '900' }}>
                  Room Activities
                </Text>
                <Text style={{ color: C.muted, marginTop: 8 }}>
                  Completed activities and upcoming Room Party events
                  will appear here.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  </View>
</Modal>
                   

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
            
