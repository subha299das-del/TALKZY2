 import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
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
Platform,
Animated,
Dimensions

} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import RoomMusicPanel from './RoomMusicPanel';

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

const YOUTUBE_PLAYER_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#player{margin:0;width:100%;height:100%;background:#000;overflow:hidden}</style></head><body><div id="player"></div><script src="https://www.youtube.com/iframe_api"></script><script>let player;function onYouTubeIframeAPIReady(){player=new YT.Player('player',{height:'100%',width:'100%',videoId:'',playerVars:{playsinline:1,controls:0,rel:0,modestbranding:1,fs:0,disablekb:1},events:{onReady:function(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage('ready')},onStateChange:function(e){if(e.data===0&&window.ReactNativeWebView)window.ReactNativeWebView.postMessage('ended')}}})}setInterval(function(){if(player&&player.getCurrentTime&&player.getPlayerState&&player.getPlayerState()===1&&window.ReactNativeWebView)window.ReactNativeWebView.postMessage('time:'+player.getCurrentTime())},2000);function talkzyLoad(id,seconds,playing){if(!player||!player.loadVideoById)return;if(id){player.loadVideoById({videoId:id,startSeconds:Math.max(0,seconds||0)});if(!playing)player.pauseVideo()}}function talkzySync(seconds,playing){if(!player||!player.getCurrentTime)return;let current=player.getCurrentTime();if(Math.abs(current-(seconds||0))>3)player.seekTo(seconds||0,true);if(playing)player.playVideo();else player.pauseVideo()}function talkzyPlay(){if(player)player.playVideo()}function talkzyPause(){if(player)player.pauseVideo()}function talkzySetVolume(v){if(player&&player.setVolume)player.setVolume(Math.max(0,Math.min(100,Number(v)||0)))}</script></body></html>`;


const C = {
  // TALKZY signature palette: Midnight Aurora
  bg: '#080B18', panel: '#11172B', panel2: '#1A2340',
  text: '#F5F6FF', muted: '#9CA9C9',
  accent: '#9366FF', primary: '#9366FF', card: '#11172B',
  line: '#293453', danger: '#FF6685', gold: '#FFD27A',
  teal: '#43DCC5', pink: '#F27BC2', glow: 'rgba(147,102,255,0.22)'
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



function seatShortName(value) {
  const name = String(value || 'User').trim();
  if (!name || name.toLowerCase() === 'you') return 'YO...';
  return name.slice(0, 2).toUpperCase() + '...';
}

function WorldLuckyBagTicker({ notification, onPress }) {
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    if (!notification) return;
    translateX.setValue(Dimensions.get('window').width);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -430,
        duration: 10500,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [notification?.id, translateX]);

  if (!notification) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        marginHorizontal: 9,
        marginTop: 5,
        marginBottom: 5,
        height: 48,
        overflow: 'hidden',
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: '#C18BFF',
        backgroundColor: '#210B43',
        shadowColor: '#A855F7',
        shadowOpacity: 0.42,
        shadowRadius: 8,
        elevation: 8
      }}
    >
      <View style={{
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: '#3B126C',
        opacity: 0.72
      }} />
      <Animated.View
        style={{
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          width: 430,
          transform: [{ translateX }]
        }}
      >
        <Text style={{ fontSize: 25, marginLeft: 7, marginRight: 9 }}>🎁</Text>
        <Text style={{ color: '#FFE7A0', fontSize: 13, fontWeight: '900' }}>
          {notification.senderName || 'Someone'}
        </Text>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#F8D56B', marginHorizontal: 8 }} />
        <Text style={{ fontSize: 17 }}>🪙</Text>
        <Text style={{ color: '#FFD95C', fontSize: 14, fontWeight: '900', marginLeft: 4 }}>
          {Number(notification.coinAmount || 0).toLocaleString()}
        </Text>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#F8D56B', marginHorizontal: 8 }} />
        <View style={{
          backgroundColor: '#5A2497',
          borderWidth: 1,
          borderColor: '#C18BFF',
          borderRadius: 12,
          paddingHorizontal: 9,
          paddingVertical: 5
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>
            Room #{notification.roomNumber || '—'}
          </Text>
        </View>
        <Text style={{ color: '#E7C7FF', fontSize: 22, fontWeight: '900', marginLeft: 13, marginRight: 15 }}>››</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function Brand({ small = false }) {
  const size = small ? 48 : 92;
  return (
    <View style={{ alignItems: 'center', marginBottom: small ? 8 : 24 }}>
      {!small && <View style={{
        width: 142, height: 142, borderRadius: 71, alignItems: 'center',
        justifyContent: 'center', marginBottom: 8,
        backgroundColor: 'rgba(147,102,255,0.09)',
        borderWidth: 1, borderColor: 'rgba(147,102,255,0.28)'
      }}>
        <View style={{ position: 'absolute', width: 122, height: 122,
          borderRadius: 61, borderWidth: 1, borderColor: 'rgba(67,220,197,0.34)' }} />
        <View style={{ position: 'absolute', width: 106, height: 106,
          borderRadius: 53, backgroundColor: 'rgba(147,102,255,0.16)' }} />
        <Image source={require('./assets/talkzy-icon.png')} style={{
          width: size, height: size, resizeMode: 'contain'
        }} />
        <View style={{ position: 'absolute', right: 12, top: 23, width: 10,
          height: 10, borderRadius: 5, backgroundColor: C.teal }} />
        <View style={{ position: 'absolute', left: 13, bottom: 25, width: 7,
          height: 7, borderRadius: 4, backgroundColor: C.pink }} />
      </View>}
      {small && <Image source={require('./assets/talkzy-icon.png')} style={{
        width: size, height: size, resizeMode: 'contain'
      }} />}
      <Text style={{ color: C.text, fontSize: small ? 21 : 32,
        fontWeight: '900', letterSpacing: small ? 3 : 5, marginTop: small ? 5 : 0 }}>
        TALKZY
      </Text>
      {!small && <>
        <Text style={{ color: C.teal, marginTop: 8, fontSize: 10,
          fontWeight: '900', letterSpacing: 2.4 }}>YOUR VOICE. YOUR PEOPLE.</Text>
        <Text style={{ color: C.muted, marginTop: 7, fontSize: 13 }}>
          Talk. Connect. Belong.
        </Text>
      </>}
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
        backgroundColor: secondary ? C.panel2 : danger ? '#482238' : C.accent,
        borderWidth: 1,
        borderColor: secondary ? '#354365' : danger ? '#8D3B60' : '#B69AFF',
        paddingVertical: 15, paddingHorizontal: 16, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginTop: 11,
        opacity: disabled ? 0.48 : 1,
        shadowColor: secondary ? 'transparent' : C.accent,
        shadowOpacity: secondary ? 0 : 0.28, shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 }, elevation: secondary ? 0 : 4
      }}
    >
      <Text
        style={{
          color: C.text, fontWeight: '900', fontSize: 14, letterSpacing: 0.45
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
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: C.teal, marginBottom: 8, fontSize: 10,
        fontWeight: '900', letterSpacing: 1.25 }}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#7885A7"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={{
          backgroundColor: '#0C1225', color: C.text,
          borderWidth: 1, borderColor: '#303D60', borderRadius: 15,
          paddingHorizontal: 16, paddingVertical: 15, fontSize: 14
        }}
      />
    </View>
  );
}

function Card({ children, style = {} }) {
  return (
    <View
      style={{
        backgroundColor: C.panel, borderWidth: 1, borderColor: '#263252',
        borderRadius: 21, padding: 17, marginBottom: 14,
        shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 }, elevation: 2, ...style
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
        color: C.text, fontSize: 25, fontWeight: '900',
        letterSpacing: -0.55, marginBottom: 9
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
        color: C.text, fontSize: 16, fontWeight: '900',
        letterSpacing: 0.25, marginTop: 22, marginBottom: 12
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
        backgroundColor: active ? 'rgba(147,102,255,0.22)' : '#121A30',
        paddingHorizontal: 17, paddingVertical: 11, borderRadius: 15,
        marginRight: 8, borderWidth: 1,
        borderColor: active ? C.accent : '#2A3655',
        shadowColor: active ? C.accent : 'transparent',
        shadowOpacity: active ? 0.22 : 0, shadowRadius: 8, elevation: active ? 2 : 0
      }}
    >
      <Text style={{ color: active ? '#D7C7FF' : C.muted,
        fontWeight: '900', fontSize: 12, letterSpacing: 0.25 }}>
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
const [roomSettingName, setRoomSettingName] = useState('');
const [roomSettingAnnouncement, setRoomSettingAnnouncement] = useState('');
const [roomSettingDp, setRoomSettingDp] = useState(null);
const [touristsOnMic, setTouristsOnMic] = useState(true);
const [touristsSendText, setTouristsSendText] = useState(true);
const [touristsSendPic, setTouristsSendPic] = useState(false);
const [roomSettingSaving, setRoomSettingSaving] = useState(false);
const [roomSettingsSubpage, setRoomSettingsSubpage] = useState(null);
const [roomSettingsReturnScreen, setRoomSettingsReturnScreen] = useState('main');
const [roomSettingAdmins, setRoomSettingAdmins] = useState([]);
const [roomSettingKicked, setRoomSettingKicked] = useState([]);
const [roomSettingMembers, setRoomSettingMembers] = useState([]);
const [roomActivities, setRoomActivities] = useState([]);
const [loadingRoomActivities, setLoadingRoomActivities] = useState(false);
const [showRoomActivityComposer, setShowRoomActivityComposer] = useState(false);
const [roomActivityTitle, setRoomActivityTitle] = useState('');
const [roomActivityDescription, setRoomActivityDescription] = useState('');
const [roomActivityPoster, setRoomActivityPoster] = useState(null);
const [roomActivitySaving, setRoomActivitySaving] = useState(false);




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
 const [roomDetailMembers, setRoomDetailMembers] = useState([]);
 const [loadingRoomDetailMembers, setLoadingRoomDetailMembers] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [followedRooms, setFollowedRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [hasEverCreatedRoom, setHasEverCreatedRoom] = useState(false);
  const [roomCreationEligibilityLoaded, setRoomCreationEligibilityLoaded] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomDpUri, setRoomDpUri] = useState(null);
const [roomDpUploading, setRoomDpUploading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [worldLuckyBagNotification, setWorldLuckyBagNotification] = useState(null);
const [worldLuckyBagQueue, setWorldLuckyBagQueue] = useState([]);
 const [isRoomMinimized, setIsRoomMinimized] = useState(false);
 const [showRoomMenu, setShowRoomMenu] = useState(false);
 const [isOnMic, setIsOnMic] = useState(false);
 const [myMicSeat, setMyMicSeat] = useState(null);
 const [isMicMuted, setIsMicMuted] = useState(false);
 const [micGame, setMicGame] = useState(null);
 const [micCount, setMicCount] = useState(8);
const [micSeats, setMicSeats] = useState([]);
const [micControls, setMicControls] = useState([]);
const [showMicControlPopup, setShowMicControlPopup] = useState(false);
const [micControlSeat, setMicControlSeat] = useState(null);
const [roomPresence, setRoomPresence] = useState([]);
const [roomPresenceLoading, setRoomPresenceLoading] = useState(false);
const [showRoomUsers, setShowRoomUsers] = useState(false);
const micSeatLoadVersionRef = useRef(0);
 const [showMicCountPicker, setShowMicCountPicker] = useState(false);
 const [micLayout, setMicLayout] = useState('eight');
 const MIC_LAYOUTS = {
 seven:{count:7,label:'7 Mics',rows:[[1,2],[3,4,5,6,7]]}, eight:{count:8,label:'8 Mics',rows:[[1,2,3,4],[5,6,7,8]]},
 ten_couple:{count:10,label:'10 Mics · Couple',rows:[[1,2],[3,4,5,6],[7,8,9,10]]}, ten_standard:{count:10,label:'10 Mics · Standard',rows:[[1,2,3,4,5],[6,7,8,9,10]]},
 eleven:{count:11,label:'11 Mics',rows:[[1],[2,3,4,5,6],[7,8,9,10,11]]}, twelve:{count:12,label:'12 Mics',rows:[[1,2],[3,4,5,6,7],[8,9,10,11,12]]},
 fourteen:{count:14,label:'14 Mics',rows:[[1,2],[3,4,5,6],[7,8,9,10],[11,12,13,14]]}, fifteen:{count:15,label:'15 Mics',rows:[[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15]]},
 sixteen:{count:16,label:'16 Mics',rows:[[1],[2,3,4,5,6],[7,8,9,10,11],[12,13,14,15,16]]}, seventeen:{count:17,label:'17 Mics',rows:[[1,2],[3,4,5,6,7],[8,9,10,11,12],[13,14,15,16,17]]}
 };

 
async function loadRoomMicSeats(roomId) {
  if (!roomId) return;

  const requestVersion = ++micSeatLoadVersionRef.current;

  try {
    const result = await api(`/api/rooms/${roomId}/mic-seats`);

    // Ignore stale requests that finish after a newer seat update/load.
    if (requestVersion !== micSeatLoadVersionRef.current) return;

    setMicCount(result.micCount || 8);
    setMicLayout(result.micLayout || 'eight');
    setMicSeats(result.seats || []);
    setMicControls(result.micControls || []);

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

async function loadRoomPresence(roomId, showLoader = false) {
  if (!roomId) return;
  if (showLoader) setRoomPresenceLoading(true);
  try {
    const result = await api(`/api/rooms/${roomId}/presence`);
    if (selectedRoom?.id === roomId) setRoomPresence(Array.isArray(result.users) ? result.users : []);
  } catch (error) {
    console.log('Room presence loading error:', error.message);
  } finally {
    if (showLoader) setRoomPresenceLoading(false);
  }
}

// WORLD LUCKY BAG BROADCAST RECEIVER (sender integration will publish on this channel)
useEffect(() => {
  if (!session?.user?.id) return;
  const channel = supabase.channel('talkzy-world-lucky-bag-notifications')
    .on('broadcast', { event: 'world_lucky_bag' }, ({ payload }) => {
      if (payload) {
        const nextNotification = {
          id: payload.id || Date.now().toString(),
          senderName: payload.senderName,
          coinAmount: payload.coinAmount,
          roomNumber: payload.roomNumber,
          roomId: payload.roomId,
          room: payload.room
        };
        setWorldLuckyBagNotification(current => {
          if (!current) return nextNotification;
          setWorldLuckyBagQueue(queue => [...queue, nextNotification]);
          return current;
        });
      }
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [session?.user?.id]);

// Rotate queued World Lucky Bag notices instead of overlapping them.
useEffect(() => {
  if (!worldLuckyBagNotification) return;
  const timer=setTimeout(() => {
    setWorldLuckyBagQueue(queue => {
      if (queue.length) {
        setWorldLuckyBagNotification(queue[0]);
        return queue.slice(1);
      }
      setWorldLuckyBagNotification(null);
      return queue;
    });
  }, 12000);
  return () => clearTimeout(timer);
}, [worldLuckyBagNotification?.id]);

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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'talkzy_room_mic_controls', filter: `room_id=eq.${roomId}` }, () => loadRoomMicSeats(roomId))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedRoom?.id]);

// REALTIME ROOM APPROVAL SETTING SYNC
useEffect(() => {
  if (!selectedRoom?.id) return;
  const roomId = selectedRoom.id;
  let active = true;
  const loadApproval = async () => {
    const { data, error } = await supabase.from('talkzy_room_settings')
      .select('tourists_on_mic, tourists_send_text, tourists_send_pic')
      .eq('room_id', roomId).maybeSingle();
    if (!active || error || !data) return;
    setTouristsOnMic(data.tourists_on_mic);
    setTouristsSendText(data.tourists_send_text);
    setTouristsSendPic(data.tourists_send_pic);
  };
  loadApproval();
  const channel = supabase.channel(`room-approval-sync-${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'talkzy_room_settings', filter: `room_id=eq.${roomId}` }, loadApproval)
    .subscribe();
  return () => { active = false; supabase.removeChannel(channel); };
}, [selectedRoom?.id]);

// ROOM CHAT REALTIME UPDATES
useEffect(() => {
  if (!selectedRoom?.id) return;
  const roomId = selectedRoom.id;
  const channel = supabase.channel(`room-chat-sync-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'talkzy_room_messages', filter: `room_id=eq.${roomId}`
    }, () => loadRoomMessages(roomId))
    .on('postgres_changes', {
      event: 'DELETE', schema: 'public', table: 'talkzy_room_messages', filter: `room_id=eq.${roomId}`
    }, payload => {
      const deletedId = payload?.old?.id;
      if (deletedId) setRoomChatMessages(prev => prev.filter(item => item.id !== deletedId));
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [selectedRoom?.id]);

// Keep live room presence current for members, owners, admins and tourists.
useEffect(() => {
  if (!selectedRoom?.id) {
    setRoomPresence([]);
    return;
  }
  const roomId = selectedRoom.id;
  setRoomPresence([]);
  let active = true;
  const refresh = async () => {
    try {
      await api(`/api/rooms/${roomId}/presence/ping`, { method: 'POST' });
      if (active) await loadRoomPresence(roomId);
    } catch (error) {
      console.log('Room presence refresh:', error.message);
    }
  };
  refresh();
  const interval = setInterval(refresh, 20000);
  return () => {
    active = false;
    clearInterval(interval);
  };
}, [selectedRoom?.id]);

useEffect(() => {
  if (!selectedRoom?.id) return;
  let active = true;
  const refreshYoutube = async () => {
    try {
      const result = await api(`/api/rooms/${selectedRoom.id}/youtube`);
      if (!active) return;
      const state = result.state || { video_id: null, queue: [], is_playing: false, current_time_seconds: 0 };
      setYoutubeState(previous => {
        const unchanged =
          previous?.video_id === state.video_id &&
          previous?.is_playing === state.is_playing &&
          previous?.current_time_seconds === state.current_time_seconds &&
          previous?.updated_at === state.updated_at &&
          JSON.stringify(previous?.queue || []) === JSON.stringify(state.queue || []);
        return unchanged ? previous : state;
      });
      if (state.updated_at && state.updated_at !== youtubeLastUpdateRef.current) {
        youtubeLastUpdateRef.current = state.updated_at;
        if (state.video_id) {
          if (!youtubePanelDismissedRef.current) setShowYoutubePanel(true);
          const videoChanged = youtubeLoadedVideoRef.current !== state.video_id;
          const js = videoChanged
            ? `window.talkzyLoad && window.talkzyLoad('${state.video_id}', ${Number(state.current_time_seconds || 0)}, ${state.is_playing ? 'true' : 'false'});`
            : `window.talkzySync && window.talkzySync(${Number(state.current_time_seconds || 0)}, ${state.is_playing ? 'true' : 'false'});`;
          youtubeWebViewRef.current?.injectJavaScript(js + 'true;');
          youtubeLoadedVideoRef.current = state.video_id;
        } else {
          setShowYoutubePanel(false);
          youtubeLoadedVideoRef.current = null;
        }
      }
    } catch (error) {
      console.log('YouTube state refresh:', error.message);
    }
  };
  refreshYoutube();
  const interval = setInterval(refreshYoutube, 5000);
  return () => { active = false; clearInterval(interval); };
}, [selectedRoom?.id]);

const [isRoomSpeakerOn, setIsRoomSpeakerOn] = useState(true);
const [isRoomBellOn, setIsRoomBellOn] = useState(true);
const [showRoomMessageMenu, setShowRoomMessageMenu] = useState(false);
const [showRoomTools, setShowRoomTools] = useState(false);
const [showLuckyBagPopup, setShowLuckyBagPopup] = useState(false);
const [luckyBagTab, setLuckyBagTab] = useState('Room');
const [luckyBagCoins, setLuckyBagCoins] = useState(500);
const [luckyBagQuantity, setLuckyBagQuantity] = useState(1);
const [luckyBagCustomCoins, setLuckyBagCustomCoins] = useState('500');
const [luckyBagHistoryView, setLuckyBagHistoryView] = useState(false);
const [walletBalance, setWalletBalance] = useState(0);
const [luckyBagHistoryItems, setLuckyBagHistoryItems] = useState([]);
const [luckyBagHistoryLoading, setLuckyBagHistoryLoading] = useState(false);
const [luckyBagSending, setLuckyBagSending] = useState(false);
const [activeLuckyBags, setActiveLuckyBags] = useState([]);
const [claimingLuckyBagId, setClaimingLuckyBagId] = useState(null);
const luckyBagPulse = useRef(new Animated.Value(1)).current;
useEffect(() => { const pulse = Animated.loop(Animated.sequence([Animated.timing(luckyBagPulse, { toValue: 1.06, duration: 850, useNativeDriver: true }), Animated.timing(luckyBagPulse, { toValue: 1, duration: 850, useNativeDriver: true })])); pulse.start(); return () => pulse.stop(); }, [luckyBagPulse]);
async function loadLuckyBagHistory() {
  if (!session?.user?.id) return;
  setLuckyBagHistoryLoading(true);
  try {
    const uid=session.user.id;
    const [{data:ledger,error:ledgerError},{data:sent,error:sentError},{data:claims,error:claimsError}] = await Promise.all([
      supabase.from('talkzy_coin_ledger').select('id,amount,balance_after,event_type,reference_id,note,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(100),
      supabase.from('talkzy_lucky_bags').select('id,sender_id,room_id,scope,total_coins,remaining_coins,remaining_bags,status,created_at,expires_at').eq('sender_id',uid).order('created_at',{ascending:false}).limit(50),
      supabase.from('talkzy_lucky_bag_claims').select('id,bag_id,claimer_id,reward_coins,claimed_at').eq('claimer_id',uid).order('claimed_at',{ascending:false}).limit(50)
    ]);
    if(ledgerError) throw ledgerError;
    if(sentError) throw sentError;
    if(claimsError) throw claimsError;
    const sentBagIds=(sent||[]).map(x=>x.id);
    let sentClaims=[];
    if(sentBagIds.length) {
      const {data,error}=await supabase.from('talkzy_lucky_bag_claims').select('bag_id,claimer_id,reward_coins,claimed_at').in('bag_id',sentBagIds).order('claimed_at',{ascending:false});
      if(error) throw error;
      sentClaims=data||[];
    }
    const bagIds=[...new Set([...(sent||[]).map(x=>x.id),...(claims||[]).map(x=>x.bag_id)])];
    let bagDetails=[];
    if(bagIds.length) {
      const {data,error}=await supabase.from('talkzy_lucky_bags').select('id,sender_id,room_id,scope,total_coins,status,created_at').in('id',bagIds);
      if(error) throw error;
      bagDetails=data||[];
    }
    const profileIds=[...new Set([...bagDetails.map(x=>x.sender_id),...sentClaims.map(x=>x.claimer_id)])];
    let names={};
    if(profileIds.length) {
      const {data,error}=await supabase.from('talkzy_profiles').select('id,display_name').in('id',profileIds);
      if(error) throw error;
      names=Object.fromEntries((data||[]).map(p=>[p.id,p.display_name||'TALKZY User']));
    }
    const recipientNamesByBag={};
    sentClaims.forEach(claim => {
      (recipientNamesByBag[claim.bag_id] ||= []).push(names[claim.claimer_id]||'TALKZY User');
    });
    const bagMap=Object.fromEntries(bagDetails.map(b=>[b.id,{...b,recipientNames:recipientNamesByBag[b.id]||[]} ]));
    const events=[
      ...(ledger||[]).map(x=>({key:'ledger-'+x.id,type:x.event_type,amount:x.amount,created_at:x.created_at,note:x.note,reference_id:x.reference_id,balance_after:x.balance_after,bag:bagMap[x.reference_id],senderName:names[bagMap[x.reference_id]?.sender_id]||'TALKZY User'})),
      
    ];
    events.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    setLuckyBagHistoryItems(events.slice(0,100));
  } catch(error) {
    Alert.alert('History unavailable',error?.message||'Please try again.');
  } finally { setLuckyBagHistoryLoading(false); }
}

async function refreshActiveLuckyBags() {
  if (!session?.user?.id || !selectedRoom?.id) { setActiveLuckyBags([]); return; }
  try {
    const nowIso = new Date().toISOString();
    const { data: bags, error } = await supabase.from('talkzy_lucky_bags')
      .select('id,sender_id,room_id,scope,total_coins,remaining_coins,remaining_bags,expires_at,created_at')
      .eq('status','active').gt('expires_at',nowIso)
      .or('room_id.eq.' + selectedRoom.id + ',scope.eq.world')
      .order('created_at',{ascending:false}).limit(20);
    if (error) throw error;
    const list = bags || [];
    if (!list.length) { setActiveLuckyBags([]); return; }
    const senderIds = [...new Set(list.map(b => b.sender_id))];
    const bagIds = list.map(b => b.id);
    const [{ data: profiles }, { data: claims }] = await Promise.all([
      supabase.from('talkzy_profiles').select('id,display_name').in('id',senderIds),
      supabase.from('talkzy_lucky_bag_claims').select('bag_id').eq('claimer_id',session.user.id).in('bag_id',bagIds)
    ]);
    const nameMap = new Map((profiles || []).map(p => [p.id,p.display_name]));
    const claimed = new Set((claims || []).map(x => x.bag_id));
    setActiveLuckyBags(list.map(b => ({...b,senderName:nameMap.get(b.sender_id) || 'TALKZY User',alreadyClaimed:claimed.has(b.id)})));
  } catch (error) {
    console.log('Lucky Bag refresh:',error.message);
  }
}

async function claimLuckyBag(bag) {
  if (!bag?.id || claimingLuckyBagId) return;
  if (bag.alreadyClaimed) return Alert.alert('Lucky Bag', 'You already opened this bag.');
  setClaimingLuckyBagId(bag.id);
  try {
    const {data,error}=await supabase.rpc('talkzy_lucky_bag_claim',{p_bag_id:bag.id});
    if(error) throw error;
    if(data?.expired) {
      Alert.alert('Lucky Bag expired','Unclaimed coins are being refunded to the sender.');
    } else {
      setWalletBalance(Number(data?.balance ?? walletBalance));
      Alert.alert('Lucky Bag opened! 🎉','You received ' + Number(data?.reward_coins || 0).toLocaleString() + ' coins!');
    }
    await refreshActiveLuckyBags();
  } catch(error) {
    Alert.alert('Could not open Lucky Bag',error?.message || 'Please try again.');
    await refreshActiveLuckyBags();
  } finally {
    setClaimingLuckyBagId(null);
  }
}

useEffect(() => {
  let active = true;
  async function refreshWallet() {
    if (!session?.user?.id) { setWalletBalance(0); return; }
    const { data, error } = await supabase.from('talkzy_wallets').select('balance').eq('user_id', session.user.id).maybeSingle();
    if (!active) return;
    if (error) { console.log('Wallet balance load:', error.message); return; }
    setWalletBalance(Number(data?.balance || 0));
  }
  refreshWallet();
  const walletChannel = supabase.channel('talkzy-wallet-' + session?.user?.id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'talkzy_wallets', filter: 'user_id=eq.' + session?.user?.id }, refreshWallet)
    .subscribe();
  return () => { active = false; supabase.removeChannel(walletChannel); };
}, [session?.user?.id]);

useEffect(() => {
  if (!selectedRoom?.id || !session?.user?.id) { setActiveLuckyBags([]); return; }
  refreshActiveLuckyBags();
  const channel=supabase.channel('lucky-bag-room-feed-' + selectedRoom.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'talkzy_lucky_bags'},refreshActiveLuckyBags)
    .subscribe();
  const interval=setInterval(refreshActiveLuckyBags,5000);
  return () => { clearInterval(interval); supabase.removeChannel(channel); };
}, [selectedRoom?.id,session?.user?.id]);

async function sendLuckyBag() {
  if (!session?.user?.id) return Alert.alert('Login required', 'Please sign in again.');
  if (!selectedRoom?.id) return Alert.alert('Room required', 'Enter a room before sending a Lucky Bag.');
  const amount = Math.floor(Number(luckyBagCoins));
  const quantity = Math.floor(Number(luckyBagQuantity));
  if (!Number.isFinite(amount) || amount < 1 || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
    return Alert.alert('Invalid amount', 'Please choose a valid coin amount and bag quantity.');
  }
  const total = amount * quantity;
  if (total > walletBalance) return Alert.alert('Insufficient coins', 'Your balance is ' + walletBalance.toLocaleString() + ' coins. You need ' + total.toLocaleString() + ' coins.');
  setLuckyBagSending(true);
  try {
    const { data, error } = await supabase.rpc('talkzy_lucky_bag_send', {
      p_room_id: selectedRoom.id,
      p_scope: luckyBagTab.toLowerCase(),
      p_coin_amount_per_bag: amount,
      p_bag_count: quantity
    });
    if (error) throw error;
    setWalletBalance(Number(data?.balance ?? walletBalance - total));
    setShowLuckyBagPopup(false);
    if (luckyBagTab === 'World') {
      const tickerChannel = supabase.channel('talkzy-world-lucky-bag-notifications');
      tickerChannel.subscribe(status => {
        if (status === 'SUBSCRIBED') {
          tickerChannel.send({ type: 'broadcast', event: 'world_lucky_bag', payload: {
            id: data?.bag_id,
            senderName: profile?.display_name || 'TALKZY User',
            coinAmount: total,
            roomNumber: selectedRoom.room_talkzy_id || selectedRoom.room_name || 'Room',
            roomId: selectedRoom.id,
            room: selectedRoom
          }}).finally(() => supabase.removeChannel(tickerChannel));
        }
      });
    }
    Alert.alert('Lucky Bag sent! 🎉', total.toLocaleString() + ' coins deducted. Unclaimed coins will be refunded after 3 minutes.');
  } catch (error) {
    Alert.alert('Could not send Lucky Bag', error?.message || 'Please try again.');
    const { data } = await supabase.from('talkzy_wallets').select('balance').eq('user_id', session.user.id).maybeSingle();
    if (data) setWalletBalance(Number(data.balance || 0));
  } finally {
    setLuckyBagSending(false);
  }
}

const [showRoomThemeMenu, setShowRoomThemeMenu] = useState(false);
const [showYoutubePanel, setShowYoutubePanel] = useState(false);
const [showMusicPanel, setShowMusicPanel] = useState(false);
 const [musicMinimized, setMusicMinimized] = useState(false);
const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
const [youtubeBrowseTab, setYoutubeBrowseTab] = useState('All');
const [youtubeBrowseUrl, setYoutubeBrowseUrl] = useState('https://www.youtube.com/results?search_query=');
const [youtubeSelectedVideo, setYoutubeSelectedVideo] = useState(null);
const youtubeBrowseWebViewRef = useRef(null);
const [youtubeState, setYoutubeState] = useState({ video_id: null, queue: [], is_playing: false, current_time_seconds: 0, updated_at: null });
const [youtubeLoading, setYoutubeLoading] = useState(false);
const [youtubeSaving, setYoutubeSaving] = useState(false);
const [youtubeVolume, setYoutubeVolume] = useState(70);
const youtubeWebViewRef = useRef(null);
const youtubeLastUpdateRef = useRef(null);
const youtubeLoadedVideoRef = useRef(null);
const youtubePanelDismissedRef = useRef(false);
const youtubeLastPositionWriteRef = useRef(0);
 const [showRoomInfo, setShowRoomInfo] = useState(false);
const [showRoomGiftPanel, setShowRoomGiftPanel] = useState(false);
const [roomChatText, setRoomChatText] = useState('');
 const [roomChatMessages, setRoomChatMessages] = useState([]);
 const roomChatScrollRef = useRef(null);
  const [showJoinPassword, setShowJoinPassword] = useState(false);
const [joinPassword, setJoinPassword] = useState('');
const [joiningRoom, setJoiningRoom] = useState(false);
  const [joinTargetRoom, setJoinTargetRoom] = useState(null);
const [joinMode, setJoinMode] = useState('member');
const [isRoomTourist, setIsRoomTourist] = useState(false);

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

    // Wake the Render backend while the login screen is opening.
    // This lets the service start before the user finishes signing in.
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});

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

  // Start loading the creator's room once, in parallel with the profile lookup.
  // The local cache can populate Mine before the backend request completes.
  loadMyRooms(currentSession);

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
        setRoomSettingDp(result.assets[0].uri);
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

async function openRoomDetails(room) {
  setRoomDetails(room);
  setRoomDetailsTab('Information');
  setMemberSearch('');
  setRoomDetailMembers([]);
  setRoomDetailsVisible(true);
  if (isRoomTourist || !session?.access_token || !room?.id) return;
  setLoadingRoomDetailMembers(true);
  try {
    const result = await api(`/api/rooms/${room.id}/members`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    setRoomDetailMembers(Array.isArray(result.members) ? result.members : []);
  } catch (error) {
    Alert.alert('Room Members', error.message || 'Could not load room members.');
  } finally {
    setLoadingRoomDetailMembers(false);
  }
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
  if (!currentSession?.access_token || !currentSession?.user?.id) {
    setRoomCreationEligibilityLoaded(false);
    return;
  }

  const cacheKey = `talkzy_my_rooms_${currentSession.user.id}`;

  // Render cached room details immediately while the server request runs.
  // This prevents the user's room name/card from waiting for a cold backend.
  let hasCachedData = false;
  try {
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Array.isArray(cached.rooms)) {
        hasCachedData = true;
        setMyRooms(cached.rooms);
        setHasEverCreatedRoom(cached.hasEverCreatedRoom === true);
        setRoomCreationEligibilityLoaded(true);
      }
    }
  } catch (cacheError) {
    console.log('My room cache read:', cacheError.message);
  }

  if (!hasCachedData) setRoomCreationEligibilityLoaded(false);

  // Refresh in the background and update the cache for the next launch.
  try {
    const result = await api('/api/rooms/mine', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });

    const allRooms = Array.isArray(result.rooms) ? result.rooms : [];
    const eligibility = result.hasEverCreatedRoom === true;

    setMyRooms(allRooms);
    setHasEverCreatedRoom(eligibility);
    setRoomCreationEligibilityLoaded(true);

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        rooms: allRooms,
        hasEverCreatedRoom: eligibility,
        cachedAt: Date.now()
      }));
    } catch (cacheError) {
      console.log('My room cache write:', cacheError.message);
    }
  } catch (error) {
    // Cached room cards remain visible if the backend is asleep/offline.
    if (!hasCachedData) setRoomCreationEligibilityLoaded(false);
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

  // Room owners cannot follow their own rooms.
  if (room.owner_id === session?.user?.id) return;

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
    if (!session?.access_token) return Alert.alert('Login required', 'Please sign in again.');
    setJoinTargetRoom(room);
    setJoinPassword('');
    if (room.room_type === 'locked') {
      setJoinMode('member');
      setShowJoinPassword(true);
      return;
    }
    Alert.alert(
      room.room_name,
      'How would you like to enter this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Visit as Tourist', onPress: () => submitRoomVisit(room, '') },
        { text: 'Join as Member', onPress: () => submitRoomJoin(room, '') }
      ]
    );
  }

  async function submitRoomJoin(room, password) {
    if (!room || !session?.access_token) return Alert.alert('Error', 'Please sign in again.');
    try {
      setJoiningRoom(true);
      await api(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      await loadJoinedRooms();
      setIsRoomTourist(false);
      setShowJoinPassword(false); setJoinPassword(''); setJoinTargetRoom(null);
      Alert.alert('Success', `You have joined ${room.room_name} as a member.`);
    } catch (error) {
      Alert.alert('Unable to join', error.message || 'Could not join this room.');
    } finally { setJoiningRoom(false); }
  }

  async function submitRoomVisit(room, password) {
    if (!room || !session?.access_token) return Alert.alert('Error', 'Please sign in again.');
    try {
      setJoiningRoom(true);
      const result = await api(`/api/rooms/${room.id}/visit`, {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      setShowJoinPassword(false); setJoinPassword(''); setJoinTargetRoom(null);
      setSelectedRoom(room);
      setIsRoomTourist(result.mode === 'tourist');
      setIsRoomMinimized(false); setShowRoomMenu(false);
      setMicCount(8); setMicSeats([]); setIsOnMic(false); setMyMicSeat(null); setIsMicMuted(false);
      setRoomChatMessages([]);
      setScreen('roomInterior');
      loadRoomMicSeats(room.id);
      loadRoomMessages(room.id);
    } catch (error) {
      Alert.alert('Unable to visit', error.message || 'Could not enter this room as a tourist.');
    } finally { setJoiningRoom(false); }
  }

  async function openWorldLuckyBagRoom(notification) {
    if (!notification) return;
    const room = notification.room || rooms.find(item => item.id === notification.roomId) ||
      joinedRooms.find(item => item.id === notification.roomId) ||
      followedRooms.find(item => item.id === notification.roomId) ||
      myRooms.find(item => item.id === notification.roomId);
    if (!room) {
      return Alert.alert('Room unavailable', 'This room could not be found or may have closed.');
    }
    if (room.room_type === 'locked') {
      setJoinTargetRoom(room);
      setJoinMode('tourist');
      setJoinPassword('');
      setShowJoinPassword(true);
      return;
    }
    await submitRoomVisit(room, '');
  }

  async function sendRoomImage() {
    if (!selectedRoom?.id) return;
    if (isRoomTourist && !touristsSendPic) {
      return Alert.alert('Picture sharing disabled', 'The room owner does not allow tourists to send pictures.');
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Allow photo access to share a picture.');
      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.82 });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;
      const uri = picked.assets[0].uri;
      const response = await fetch(uri);
      const bytes = await response.blob();
      const path = `${session.user.id}/rooms/${selectedRoom.id}/messages/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('talkzy-rooms').upload(path, bytes, {
        contentType: 'image/jpeg', upsert: false
      });
      if (uploadError) throw uploadError;
      const imageUrl = supabase.storage.from('talkzy-rooms').getPublicUrl(path).data.publicUrl;
      const result = await api(`/api/rooms/${selectedRoom.id}/messages`, {
        method: 'POST', body: JSON.stringify({ type: 'image', imageUrl })
      });
      const item = result.message;
      setRoomChatMessages(prev => [...prev, {
        id: item.id, text: '📷 Photo', sender: profile?.display_name || displayName || 'You',
        senderId: session?.user?.id, image_url: imageUrl,
        time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      Alert.alert('Picture not sent', error.message || 'Could not share this picture.');
    }
  }

  async function loadRoomMessages(roomId) {
    if (!roomId) return;
    try {
      const result = await api(`/api/rooms/${roomId}/messages`);
      setRoomChatMessages((result.messages || []).map(item => ({
        id: item.id,
        text: item.message_type === 'image' ? '📷 Photo' : item.message_text,
        sender: item.sender?.display_name || 'TALKZY User',
        senderId: item.sender_id,
        avatar_url: item.sender?.avatar_url || null,
        time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        message_type: item.message_type,
        image_url: item.image_url
      })));
    } catch (error) { console.log('Room chat loading error:', error.message); }
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
setIsRoomTourist(false);
setIsRoomMinimized(false);

// Reset previous room microphone data
setMicCount(8);
setMicSeats([]);
setIsOnMic(false);
setMyMicSeat(null);
setIsMicMuted(false);

// Load this room's microphone data and room chat
loadRoomMicSeats(room.id);
loadRoomMessages(room.id);
setRoomChatMessages([]);

setScreen('roomInterior');
  }}
>
  <Card
      style={{
        padding: 12, marginBottom: 11, borderRadius: 18,
        borderColor: '#2B385B'
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
        onPress={() => openRoomSettings(room)}
        style={{ marginLeft: 5 }}
      >
        <Text style={{ color: C.gold, fontSize: 15 }}>
          ⚙
        </Text>
      </TouchableOpacity>
    )}
  </View>

  {/* ROOM ID */}
  <Text
    numberOfLines={1}
    style={{
      color: C.gold,
      fontSize: 10,
      fontWeight: '800',
      marginTop: 3
    }}
  >
    Room ID: {room.room_talkzy_id || '—'}
  </Text>

  {/* CREATOR'S COUNTRY */}
  <Text
    numberOfLines={1}
    style={{
      color: C.muted,
      fontSize: 10,
      marginTop: 2
    }}
  >
    🌍 {room.country_name || 'Country not set'}
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

function extractYouTubeVideoId(value) {
  const raw = String(value || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/i);
  return match ? match[1] : null;
}

async function loadYoutubeState(showErrors = false) {
  if (!selectedRoom?.id) return;
  try {
    setYoutubeLoading(true);
    const result = await api(`/api/rooms/${selectedRoom.id}/youtube`);
    const state = result.state || { video_id: null, queue: [], is_playing: false, current_time_seconds: 0 };
    setYoutubeState(state);
    if (state.video_id) setShowYoutubePanel(true);
    if (state.updated_at && state.updated_at !== youtubeLastUpdateRef.current) {
      youtubeLastUpdateRef.current = state.updated_at;
      const command = state.video_id
        ? `window.talkzySync && window.talkzySync(${Number(state.current_time_seconds || 0)}, ${state.is_playing ? 'true' : 'false'});`
        : '';
      if (command) youtubeWebViewRef.current?.injectJavaScript(command + 'true;');
    }
  } catch (error) {
    if (showErrors) Alert.alert('YouTube', error.message || 'Could not open YouTube for this room.');
  } finally {
    setYoutubeLoading(false);
  }
}

async function saveYoutubeState(nextState) {
  if (!selectedRoom?.id || youtubeSaving) return;
  try {
    setYoutubeSaving(true);
    const result = await api(`/api/rooms/${selectedRoom.id}/youtube`, {
      method: 'PUT',
      body: JSON.stringify({
        video_id: nextState.video_id || null,
        queue: Array.isArray(nextState.queue) ? nextState.queue.slice(0, nextState.video_id ? 19 : 20) : [],
        is_playing: Boolean(nextState.is_playing),
        current_time_seconds: Math.max(0, Number(nextState.current_time_seconds || 0))
      })
    });
    setYoutubeState(result.state);
    youtubeLastUpdateRef.current = result.state.updated_at;
    if (result.state.video_id) {
      const videoChanged = youtubeLoadedVideoRef.current !== result.state.video_id;
      const js = videoChanged
        ? `window.talkzyLoad && window.talkzyLoad('${result.state.video_id}', ${Number(result.state.current_time_seconds || 0)}, ${result.state.is_playing ? 'true' : 'false'});`
        : `window.talkzySync && window.talkzySync(${Number(result.state.current_time_seconds || 0)}, ${result.state.is_playing ? 'true' : 'false'});`;
      youtubeWebViewRef.current?.injectJavaScript(js + 'true;');
      youtubeLoadedVideoRef.current = result.state.video_id;
      youtubePanelDismissedRef.current = false;
      setShowYoutubePanel(true);
    } else {
      youtubeLoadedVideoRef.current = null;
    }
  } catch (error) {
    Alert.alert('YouTube control', error.message || 'Could not update YouTube.');
  } finally {
    setYoutubeSaving(false);
  }
}

async function getYoutubeMetadata(videoId) {
  try {
    const response = await fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId) + '&format=json');
    if (!response.ok) throw new Error('Metadata unavailable');
    const info = await response.json();
    return { video_id: videoId, title: String(info.title || 'YouTube video').slice(0, 120), author_name: info.author_name || '', thumbnail_url: info.thumbnail_url || ('https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg') };
  } catch {
    return { video_id: videoId, title: 'YouTube video', author_name: '', thumbnail_url: 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg' };
  }
}

async function addYoutubeItem(item) {
  const videoId = extractYouTubeVideoId(item?.video_id || item?.url);
  if (!videoId) return Alert.alert('Invalid YouTube link', 'Choose a valid YouTube video.');
  const count = (youtubeState.queue || []).length + (youtubeState.video_id ? 1 : 0);
  if (count >= 20) return Alert.alert('Playlist full', 'The room playlist is limited to 20 videos.');
  const meta = item?.title ? item : await getYoutubeMetadata(videoId);
  const next = youtubeState.video_id
    ? { ...youtubeState, queue: [...(youtubeState.queue || []), { video_id: videoId, title: String(meta.title || 'YouTube video').slice(0, 120), added_by: profile?.display_name || session?.user?.email?.split('@')[0] || 'Member' }] }
    : { ...youtubeState, video_id: videoId, is_playing: true, current_time_seconds: 0, queue: youtubeState.queue || [] };
  await saveYoutubeState(next);
  setYoutubeSelectedVideo(null);
  setYoutubeUrlInput('');
  Alert.alert('Added to playlist', meta.title || 'Video added');
}

async function addYoutubeVideo() {
  const videoId = extractYouTubeVideoId(youtubeUrlInput);
  if (!videoId) return Alert.alert('Invalid YouTube link', 'Paste a valid YouTube video URL or 11-character video ID.');
  const meta = await getYoutubeMetadata(videoId);
  await addYoutubeItem(meta);
}

async function advanceYoutubeQueue() {
  const queue = [...(youtubeState.queue || [])];
  const nextVideo = queue.shift();
  await saveYoutubeState({
    ...youtubeState,
    video_id: nextVideo?.video_id || null,
    queue,
    is_playing: Boolean(nextVideo),
    current_time_seconds: 0
  });
}

useEffect(() => {
  if (!micGame || micGame.phase !== 'spinning') return;
  const roomId = micGame.roomId;
  const gameKind = micGame.kind;
  const spinInterval = setInterval(() => {
    setMicGame(current => {
      if (!current || current.phase !== 'spinning' || current.roomId !== roomId) return current;
      return {
        ...current,
        value: gameKind === 'Lucky Number'
          ? String(Math.floor(Math.random() * 1000)).padStart(3, '0')
          : String(1 + Math.floor(Math.random() * 6))
      };
    });
  }, 85);

  const finishTimer = setTimeout(() => {
    clearInterval(spinInterval);
    const finalValue = gameKind === 'Lucky Number'
      ? String(Math.floor(Math.random() * 1000)).padStart(3, '0')
      : String(1 + Math.floor(Math.random() * 6));
    setMicGame(current => current && current.roomId === roomId
      ? { ...current, phase: 'result', value: finalValue }
      : current);

    (async () => {
      try {
        const chatText = gameKind === 'Lucky Number'
          ? `🍀 Lucky Number: ${finalValue}`
          : `🎲 Dice: ${finalValue}`;
        await api(`/api/rooms/${roomId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ type: 'text', text: chatText })
        });
        await loadRoomMessages(roomId);
      } catch (error) {
        Alert.alert('Game result', 'The result appeared on your mic, but could not be posted in chat.');
      }
    })();
  }, 2300);

  return () => {
    clearInterval(spinInterval);
    clearTimeout(finishTimer);
  };
}, [micGame?.roomId, micGame?.kind, micGame?.phase]);

useEffect(() => {
  if (!micGame || micGame.phase !== 'result') return;
  const clearTimer = setTimeout(() => setMicGame(null), 4500);
  return () => clearTimeout(clearTimer);
}, [micGame?.phase, micGame?.roomId]);

async function sendRoomChatMessage() {
  const message = roomChatText.trim();
  if (!message || !selectedRoom?.id) return;
  if (isRoomTourist && !touristsSendText) {
    return Alert.alert('Text messages disabled', 'The room owner does not allow tourists to send text messages.');
  }
  try {
    const result = await api(`/api/rooms/${selectedRoom.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ type: 'text', text: message })
    });
    const item = result.message;
    setRoomChatMessages(prev => [...prev, {
      id: item.id, text: item.message_text, sender: profile?.display_name || displayName || 'You',
      senderId: session?.user?.id, time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setRoomChatText('');
  } catch (error) {
    Alert.alert('Message not sent', error.message || 'Could not send your message.');
  }
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
    <View style={{ flex: 1, backgroundColor: 'transparent', minHeight: 0 }}>

      {worldLuckyBagNotification && (
        <WorldLuckyBagTicker
          notification={worldLuckyBagNotification}
          onPress={() => openWorldLuckyBagRoom(worldLuckyBagNotification)}
        />
      )}

      {activeLuckyBags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 5, gap: 8 }}>
          {activeLuckyBags.map(bag => (
            <View key={bag.id} style={{ minWidth: 190, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: bag.scope === 'world' ? '#D7A74D' : '#B68AF2', backgroundColor: bag.scope === 'world' ? '#33210C' : '#26143D' }}>
              <Text style={{ color: '#FFE5A0', fontWeight: '900', fontSize: 12 }} numberOfLines={1}>🎁 {bag.senderName} · {bag.scope.toUpperCase()}</Text>
              <Text style={{ color: '#F8D66C', fontWeight: '900', marginTop: 3 }}>🪙 {Number(bag.remaining_coins).toLocaleString()} coins left</Text>
              <Text style={{ color: '#C7B4DE', fontSize: 10, marginTop: 2 }}>{bag.remaining_bags} claim{bag.remaining_bags===1?'':'s'} · expires in {Math.max(0,Math.ceil((new Date(bag.expires_at).getTime()-Date.now())/1000))}s</Text>
              <TouchableOpacity disabled={bag.alreadyClaimed || claimingLuckyBagId===bag.id || bag.sender_id===session?.user?.id} onPress={() => claimLuckyBag(bag)} style={{ marginTop: 7, paddingVertical: 7, borderRadius: 9, alignItems: 'center', backgroundColor: bag.alreadyClaimed ? '#51445F' : '#8B51D7', opacity: bag.sender_id===session?.user?.id ? 0.55 : 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 11 }}>{claimingLuckyBagId===bag.id ? 'OPENING…' : bag.alreadyClaimed ? 'ALREADY OPENED' : bag.sender_id===session?.user?.id ? 'YOUR LUCKY BAG' : '🎁 OPEN BAG'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ROOM NAME — prominent, always-visible interior header */}
      <View style={{ marginHorizontal: 12, marginTop: 2, marginBottom: 4, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: '#171D38', borderWidth: 1, borderColor: '#6651B8' }}>
        <Text style={{ color: '#BBA8FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.6, marginBottom: 3 }}>ROOM</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '900' }} numberOfLines={2}>{selectedRoom.room_name || selectedRoom.name || 'Room'}</Text>
      </View>

      {/* ROOM HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
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
<View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
  <TouchableOpacity
    onPress={() => openRoomDetails(selectedRoom)}
    style={{ alignSelf: 'stretch', minWidth: 0 }}
  >
    <Text
      style={{
        color: C.text,
        fontSize: 16,
        fontWeight: 'bold',
        flexShrink: 1
      }}
      numberOfLines={2}
    >
      {selectedRoom.room_name || selectedRoom.name || 'Room'}
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

  {isRoomTourist && (
    <Text style={{ color: '#F2C56B', fontSize: 9, fontWeight: '900', marginTop: 3, letterSpacing: 1 }}>
      TOURIST VISIT · NOT A MEMBER
    </Text>
  )}
  <Text
    style={{
      color: C.muted,
      fontSize: 11,
      marginTop: 3
    }}
  >
    Room ID: {selectedRoom.room_talkzy_id || '—'}
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

        {/* TOP-RIGHT ROOM ACTIONS + LIVE USERS PREVIEW */}
        <View style={{ alignItems: 'flex-end', marginLeft: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* ROOM TYPE + MICROPHONE LAYOUT */}
            <TouchableOpacity
              onPress={() => setShowMicCountPicker(true)}
              activeOpacity={0.75}
              style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 19 }}>🏠</Text>
            </TouchableOpacity>

            {/* SHARE */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={{ width: 34, height: 34, marginLeft: 6, borderRadius: 11, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
              onPress={async () => {
                try {
                  await Share.share({ message: `Join my room "${selectedRoom.room_name}" on TALKZY!` });
                } catch (error) {
                  console.log('Room share error:', error.message);
                }
              }}
            >
              <Text style={{ fontSize: 19, color: C.text }}>↗</Text>
            </TouchableOpacity>

            {/* POWER / EXIT MENU */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={{ width: 34, height: 34, marginLeft: 6, borderRadius: 11, backgroundColor: 'rgba(255, 82, 82, 0.12)', borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.28)', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowRoomMenu(!showRoomMenu)}
            >
              <Text style={{ fontSize: 21, color: '#FF6666' }}>⏻</Text>
            </TouchableOpacity>
          </View>

          {/* LIVE ROOM USERS PREVIEW */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setShowRoomUsers(true);
              loadRoomPresence(selectedRoom.id, true);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7, paddingVertical: 3, paddingHorizontal: 5, borderRadius: 12, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line }}
          >
            <Text style={{ color: C.muted, fontSize: 12, marginRight: 4 }}>👥</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
              {roomPresence.slice(0, 4).map((person, index) => (
                <View key={person.user_id} style={{ width: 19, height: 19, borderRadius: 10, overflow: 'hidden', borderWidth: 1.5, borderColor: C.panel2, marginLeft: index === 0 ? 0 : -5, backgroundColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
                  {person.avatar_url ? (
                    <Image source={{ uri: person.avatar_url }} style={{ width: 19, height: 19 }} />
                  ) : (
                    <Text style={{ color: C.text, fontSize: 8, fontWeight: '900' }}>{(person.display_name || 'U').slice(0, 1).toUpperCase()}</Text>
                  )}
                </View>
              ))}
            </View>
            <Text style={{ color: C.text, fontSize: 10, fontWeight: '900' }}>{roomPresence.length}</Text>
          </TouchableOpacity>
        </View>

            </View>

      {showYoutubePanel && (
        <View style={{ marginHorizontal: 10, marginTop: 10, padding: 11, borderRadius: 18, backgroundColor: '#101729', borderWidth: 1, borderColor: '#33415F' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: '#FF2638', alignItems: 'center', justifyContent: 'center', marginRight: 9 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '900' }}>▶</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>YouTube Room</Text>
              <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Watch together · synced playback</Text>
            </View>
            {youtubeLoading && <ActivityIndicator color={C.accent} size="small" />}
            <TouchableOpacity onPress={() => { youtubePanelDismissedRef.current = true; setShowYoutubePanel(false); }} style={{ paddingHorizontal: 9, paddingVertical: 6 }}>
              <Text style={{ color: C.muted, fontSize: 18, fontWeight: '900' }}>⌄</Text>
            </TouchableOpacity>
          </View>

          {youtubeState.video_id ? (
            <View style={{ height: 190, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }}>
              <WebView
                ref={youtubeWebViewRef}
                source={{ html: YOUTUBE_PLAYER_HTML }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                onMessage={(event) => {
                  const message = String(event.nativeEvent.data || '');
                  if (message === 'ready' && youtubeState.video_id) {
                    youtubeLoadedVideoRef.current = youtubeState.video_id;
                    youtubeWebViewRef.current?.injectJavaScript(
                      `window.talkzyLoad && window.talkzyLoad('${youtubeState.video_id}', ${Number(youtubeState.current_time_seconds || 0)}, ${youtubeState.is_playing ? 'true' : 'false'});window.talkzySetVolume && window.talkzySetVolume(${youtubeVolume});` + 'true;'
                    );
                  } else if (message.startsWith('time:')) {
                    const isController = selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin';
                    const now = Date.now();
                    if (isController && now - youtubeLastPositionWriteRef.current > 9000) {
                      youtubeLastPositionWriteRef.current = now;
                      const seconds = Number(message.slice(5));
                      if (Number.isFinite(seconds)) saveYoutubeState({ ...youtubeState, current_time_seconds: seconds });
                    }
                  } else if (message === 'ended') {
                    const isController = selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin';
                    if (isController) advanceYoutubeQueue();
                  }
                }}
                style={{ flex: 1, backgroundColor: '#000' }}
              />
            </View>
          ) : (
            <View style={{ minHeight: 112, borderRadius: 12, backgroundColor: '#080D18', alignItems: 'center', justifyContent: 'center', padding: 15, borderWidth: 1, borderColor: '#25314B' }}>
              <Text style={{ color: '#E5EAF7', fontSize: 13, fontWeight: '800' }}>Nothing playing yet</Text>
              <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>The owner or room admin can choose a video or song.</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9, backgroundColor: '#080D18', borderRadius: 11, padding: 8, borderWidth: 1, borderColor: '#26324B' }}>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginRight: 8 }}>MY VOLUME</Text>
            <TouchableOpacity onPress={() => { const n = Math.max(0, youtubeVolume - 10); setYoutubeVolume(n); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${n});true;`); }} style={{ paddingHorizontal: 11, paddingVertical: 4, borderRadius: 8, backgroundColor: C.panel2 }}><Text style={{ color: C.text, fontWeight: '900' }}>－</Text></TouchableOpacity>
            <Text style={{ color: C.teal, flex: 1, textAlign: 'center', fontWeight: '900', fontSize: 12 }}>{youtubeVolume}%</Text>
            <TouchableOpacity onPress={() => { const n = Math.min(100, youtubeVolume + 10); setYoutubeVolume(n); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${n});true;`); }} style={{ paddingHorizontal: 11, paddingVertical: 4, borderRadius: 8, backgroundColor: C.panel2 }}><Text style={{ color: C.text, fontWeight: '900' }}>＋</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { const n = youtubeVolume === 0 ? 70 : 0; setYoutubeVolume(n); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${n});true;`); }} style={{ marginLeft: 7, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: C.panel2 }}><Text style={{ color: C.text, fontSize: 10, fontWeight: '900' }}>{youtubeVolume === 0 ? 'UNMUTE' : 'MUTE'}</Text></TouchableOpacity>
          </View>

          {(selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin') && (
            <View style={{ marginTop: 11 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#080D18', borderRadius: 11, padding: 4, borderWidth: 1, borderColor: '#293650' }}>
                {['All', 'Music', 'Trending'].map(tab => (
                  <TouchableOpacity key={tab} onPress={() => {
                    setYoutubeBrowseTab(tab);
                    const query = youtubeSearchQuery.trim();
                    const url = tab === 'Trending'
                      ? 'https://www.youtube.com/feed/trending'
                      : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query) + (tab === 'Music' ? '&sp=EgIQAQ%3D%3D' : '');
                    setYoutubeBrowseUrl(url);
                  }} style={{ flex: 1, paddingVertical: 9, borderRadius: 8, backgroundColor: youtubeBrowseTab === tab ? '#39275C' : 'transparent', alignItems: 'center' }}>
                    <Text style={{ color: youtubeBrowseTab === tab ? '#DCCAFF' : C.muted, fontSize: 11, fontWeight: '900' }}>{tab === 'Trending' ? '🔥 ' : ''}{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TextInput value={youtubeSearchQuery} onChangeText={setYoutubeSearchQuery} placeholder="Search songs, artists or videos" placeholderTextColor={C.muted} returnKeyType="search" autoCapitalize="none" onSubmitEditing={() => { setYoutubeBrowseTab('All'); setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent(youtubeSearchQuery.trim())); }} style={{ flex: 1, color: C.text, backgroundColor: '#080D18', borderRadius: 10, borderWidth: 1, borderColor: '#293650', paddingHorizontal: 11, paddingVertical: 10, fontSize: 12 }} />
                <TouchableOpacity onPress={() => { setYoutubeBrowseTab('All'); setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent(youtubeSearchQuery.trim())); }} style={{ marginLeft: 7, backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' }}><Text style={{ color: '#FFF', fontWeight: '900' }}>Search</Text></TouchableOpacity>
              </View>
              <Text style={{ color: C.muted, fontSize: 9, marginTop: 5 }}>Tap a video result to preview it, then add it to the shared playlist.</Text>
              <View style={{ height: 250, marginTop: 7, borderRadius: 11, overflow: 'hidden', backgroundColor: '#080D18', borderWidth: 1, borderColor: '#26324B' }}>
                <WebView
                  ref={youtubeBrowseWebViewRef}
                  source={{ uri: youtubeBrowseUrl }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  onShouldStartLoadWithRequest={(request) => {
                    const url = String(request.url || '');
                    const id = extractYouTubeVideoId(url);
                    if (id && (/youtube\.com\/watch|youtu\.be\//i.test(url) || /youtube\.com\/shorts\//i.test(url))) {
                      getYoutubeMetadata(id).then(meta => setYoutubeSelectedVideo(meta));
                      return false;
                    }
                    return true;
                  }}
                />
              </View>
              {youtubeSelectedVideo && (
                <View style={{ flexDirection: 'row', marginTop: 9, padding: 9, backgroundColor: '#171F32', borderRadius: 11, borderWidth: 1, borderColor: '#4A3A70' }}>
                  <Image source={{ uri: youtubeSelectedVideo.thumbnail_url || ('https://img.youtube.com/vi/' + youtubeSelectedVideo.video_id + '/hqdefault.jpg') }} style={{ width: 96, height: 62, borderRadius: 7, backgroundColor: '#000' }} />
                  <View style={{ flex: 1, marginLeft: 9, justifyContent: 'center' }}>
                    <Text numberOfLines={2} style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>{youtubeSelectedVideo.title}</Text>
                    <Text numberOfLines={1} style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>{youtubeSelectedVideo.author_name || 'YouTube creator'}</Text>
                    <TouchableOpacity disabled={youtubeSaving} onPress={() => addYoutubeItem(youtubeSelectedVideo)} style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: C.accent, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>＋ ADD TO PLAYLIST</Text></TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={{ flexDirection: 'row', marginTop: 9 }}>
                <TextInput value={youtubeUrlInput} onChangeText={setYoutubeUrlInput} placeholder="Paste YouTube video link" placeholderTextColor={C.muted} autoCapitalize="none" style={{ flex: 1, color: C.text, backgroundColor: '#080D18', borderRadius: 9, borderWidth: 1, borderColor: '#293650', paddingHorizontal: 10, paddingVertical: 9, fontSize: 11 }} />
                <TouchableOpacity onPress={addYoutubeVideo} disabled={youtubeSaving} style={{ marginLeft: 7, backgroundColor: C.panel2, borderRadius: 9, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: C.line }}><Text style={{ color: C.teal, fontWeight: '900', fontSize: 11 }}>ADD</Text></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>SHARED PLAYLIST</Text>
              <Text style={{ color: C.teal, fontWeight: '900', fontSize: 11 }}>{(youtubeState.queue?.length || 0) + (youtubeState.video_id ? 1 : 0)}/20</Text>
            </View>
            {youtubeState.video_id && (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#172137', borderRadius: 10, marginBottom: 7 }}>
                <Image source={{ uri: 'https://img.youtube.com/vi/' + youtubeState.video_id + '/hqdefault.jpg' }} style={{ width: 86, height: 56, borderRadius: 7, backgroundColor: '#000' }} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: C.teal, fontSize: 9, fontWeight: '900' }}>NOW PLAYING</Text>
                  <Text numberOfLines={2} style={{ color: C.text, fontSize: 10, fontWeight: '800', marginTop: 3 }}>Video · {youtubeState.video_id}</Text>
                </View>
                {(selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin') && (
                  <TouchableOpacity onPress={() => saveYoutubeState({ ...youtubeState, video_id: null, is_playing: false, current_time_seconds: 0 })} style={{ padding: 5 }}><Text style={{ color: C.danger, fontWeight: '900' }}>✕</Text></TouchableOpacity>
                )}
              </View>
            )}
            {(youtubeState.queue || []).map((item, index) => (
              <View key={item.video_id + index} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#111A2B', borderRadius: 10, marginBottom: 6 }}>
                <Image source={{ uri: 'https://img.youtube.com/vi/' + item.video_id + '/hqdefault.jpg' }} style={{ width: 86, height: 56, borderRadius: 7, backgroundColor: '#000' }} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text numberOfLines={2} style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>{item.title || 'YouTube video'}</Text>
                  <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>Added by {item.added_by || 'Member'}</Text>
                </View>
                {(selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin') && (
                  <TouchableOpacity onPress={() => saveYoutubeState({ ...youtubeState, queue: youtubeState.queue.filter((_, i) => i !== index) })} style={{ padding: 5 }}><Text style={{ color: C.danger, fontSize: 11, fontWeight: '900' }}>✕</Text></TouchableOpacity>
                )}
              </View>
            ))}
            {!youtubeState.video_id && !(youtubeState.queue || []).length && <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', paddingVertical: 13 }}>Playlist is empty.</Text>}
            {(selectedRoom?.owner_id === session?.user?.id || roomPresence.find(person => person.user_id === session?.user?.id)?.presence_role === 'admin') && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.line, marginTop: 3 }}>
                <TouchableOpacity onPress={() => saveYoutubeState({ ...youtubeState, is_playing: !youtubeState.is_playing })}><Text style={{ color: C.text, fontWeight: '900' }}>{youtubeState.is_playing ? 'Ⅱ PAUSE' : '▶ PLAY'}</Text></TouchableOpacity>
                <TouchableOpacity onPress={advanceYoutubeQueue}><Text style={{ color: C.text, fontWeight: '900' }}>NEXT ⏭</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => saveYoutubeState({ ...youtubeState, video_id: null, is_playing: false, current_time_seconds: 0 })}><Text style={{ color: C.danger, fontWeight: '900' }}>STOP</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ROOM TROPHY / COINS */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingTop: 4,
          paddingBottom: 0
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
<View style={{ paddingHorizontal: 12, paddingTop: showYoutubePanel ? 6 : 16 }}>
  {(showYoutubePanel
    ? [((MIC_LAYOUTS[micLayout] || MIC_LAYOUTS.eight).rows.flat().slice(0, 8)), ((MIC_LAYOUTS[micLayout] || MIC_LAYOUTS.eight).rows.flat().slice(8, 16))]
    : (MIC_LAYOUTS[micLayout] || MIC_LAYOUTS.eight).rows
  ).filter(rowSeats => rowSeats.length > 0).map((rowSeats, rowIndex) => (
    <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#360D14', borderWidth: 1.5, borderColor: '#B88743', borderRadius: 17, paddingHorizontal: 3, paddingTop: 5, paddingBottom: 4, marginBottom: showYoutubePanel ? 8 : 14, shadowColor: '#D5A64E', shadowOpacity: 0.22, shadowRadius: 7, elevation: 4 }}>
      {rowSeats.map((seat) => {

    const occupiedSeat = micSeats.find(
      item => item.seat_number === seat
    );

    const isMySeat =
      occupiedSeat?.user_id === session?.user?.id;

    const isOccupied = !!occupiedSeat;
    const seatControl = micControls.find(item => item.seat_number === seat) || {};
    const seatIsClosed = !!seatControl.seat_closed;
    const seatMicIsClosed = !!seatControl.mic_closed;
    const isRoomOwner = selectedRoom?.owner_id === session?.user?.id;
    const isRoomAdmin = roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin');
    const canControlMics = isRoomOwner || isRoomAdmin;

    return (
      <TouchableOpacity
        key={seat}
        disabled={isRoomTourist && !touristsOnMic && !canControlMics}
        onPress={async () => {
          if (canControlMics) { setMicControlSeat(seat); setShowMicControlPopup(true); return; }
          if (seatIsClosed) { Alert.alert('Seat closed', 'The room owner or admin has closed this seat.'); return; }
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
          opacity: (isRoomTourist && !touristsOnMic) || (seatIsClosed && !canControlMics) ? 0.4 : 1,
          width: `${100 / rowSeats.length}%`,
          height: 88,
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: 0,
          paddingHorizontal: 1,
          paddingTop: 2,
          backgroundColor: '#581822',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#7E3B32',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          overflow: 'hidden'
        }}
      >
        <View
          style={{
            width: micCount >= 17 ? 42 : micCount >= 14 ? 46 : 50,
            height: micCount >= 17 ? 42 : micCount >= 14 ? 46 : 50,
            borderRadius: micCount >= 17 ? 21 : micCount >= 14 ? 23 : 25,
            borderWidth: 2,
            borderColor: isMySeat ? '#F6D37B' : isOccupied ? '#D5A64E' : '#9A613E',
            backgroundColor: '#320C13',
            shadowColor: '#D5A64E',
            shadowOpacity: 0.18,
            shadowRadius: 4,
            elevation: 2,
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
                  width: micCount >= 17 ? 39 : micCount >= 14 ? 43 : 47,
                  height: micCount >= 17 ? 39 : micCount >= 14 ? 43 : 47,
                  borderRadius: micCount >= 17 ? 20 : micCount >= 14 ? 22 : 24,
                  resizeMode: 'cover'
                }}
              />

              {micGame?.roomId === selectedRoom?.id && micGame?.seat === seat && (
                <View style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(10,12,20,0.88)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: micCount >= 17 ? 25 : micCount >= 14 ? 27 : 29
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: micGame.kind === 'Lucky Number' ? 15 : 22, fontWeight: '900' }}>
                    {micGame.value}
                  </Text>
                  <Text style={{ color: '#FFD66B', fontSize: 7, fontWeight: '900', marginTop: 1 }}>
                    {micGame.phase === 'spinning' ? 'SPINNING' : micGame.kind === 'Lucky Number' ? 'LUCKY' : 'DICE'}
                  </Text>
                </View>
              )}

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
          {seatIsClosed && (
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,8,27,0.78)', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
              <View style={{ width: 26, height: 20, borderWidth: 2, borderColor: '#C28BFF', borderRadius: 4, transform: [{ rotate: '-8deg' }] }}>
                <View style={{ position: 'absolute', width: 33, height: 3, backgroundColor: '#FF6685', top: 8, left: -4, transform: [{ rotate: '42deg' }] }} />
              </View>
            </View>
          )}
          {seatMicIsClosed && !seatIsClosed && (
            <View style={{ position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#142B3B', borderWidth: 1, borderColor: '#43DCC5', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#43DCC5', fontSize: 11, fontWeight: '900' }}>×</Text>
            </View>
          )}
        </View>

        <Text
          style={{
            color: C.text,
            fontSize: 11,
            marginTop: 5,
            fontWeight: 'bold'
          }}
        >
          {seat}
        </Text>
        <Text
            numberOfLines={1}
            style={{
              color: isMySeat ? C.accent : C.muted,
              fontSize: 9,
              marginTop: 2,
              maxWidth: '100%',
              textAlign: 'center'
            }}
          >
            {isOccupied ? seatShortName(isMySeat ? (displayName || profile?.display_name || 'You') : (occupiedSeat.display_name || 'User')) : ' '}
          </Text>
        )}
      </TouchableOpacity>
    );
      })}
    </View>
  ))}
</View>

<Modal visible={showMicControlPopup} transparent animationType="fade" onRequestClose={() => setShowMicControlPopup(false)}>
  <View style={{ flex: 1, backgroundColor: 'rgba(3,5,14,0.78)', justifyContent: 'center', padding: 22 }}>
    <View style={{ backgroundColor: '#11172B', borderRadius: 24, borderWidth: 1, borderColor: '#60439A', padding: 18, shadowColor: '#9366FF', shadowOpacity: 0.4, shadowRadius: 18, elevation: 14 }}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ color: '#F5F6FF', fontSize: 18, fontWeight: '900' }}>MIC CONTROL · {micControlSeat}</Text>
        <Text style={{ color: '#9CA9C9', fontSize: 11, marginTop: 4 }}>Room owner / admin controls</Text>
      </View>
      <TouchableOpacity onPress={() => {
        setShowMicControlPopup(false);
        const occupied = micSeats.find(item => item.seat_number === micControlSeat);
        if (micControls.find(x => x.seat_number === micControlSeat)?.seat_closed) { Alert.alert('Seat closed', 'Open the seat first before taking it.'); return; }
        if (occupied && occupied.user_id !== session?.user?.id) { Alert.alert('Seat occupied', 'This mic is already occupied. Takeover is not enabled.'); return; }
        (async () => { try {
          if (occupied?.user_id === session?.user?.id) await api(`/api/rooms/${selectedRoom.id}/mic-seats`, { method: 'DELETE' });
          else await api(`/api/rooms/${selectedRoom.id}/mic-seats/${micControlSeat}`, { method: 'POST' });
          await loadRoomMicSeats(selectedRoom.id);
        } catch (e) { Alert.alert('Mic error', e.message); } })();
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#241B43', borderWidth: 1, borderColor: '#9366FF', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#382564', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 23, color: '#C6A6FF' }}>♬</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>Take the mic</Text><Text style={{ color: '#B9A6F5', fontSize: 11, marginTop: 2 }}>Join this seat or leave it if it's yours</Text></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const closed = !!micControls.find(x => x.seat_number === micControlSeat)?.seat_closed; const action = closed ? 'open_seat' : 'close_seat';
        try { await api(`/api/rooms/${selectedRoom.id}/mic-seats/${micControlSeat}/control`, { method: 'PATCH', body: JSON.stringify({ action }) }); await loadRoomMicSeats(selectedRoom.id); setShowMicControlPopup(false); } catch (e) { Alert.alert('Control failed', e.message); }
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#28172F', borderWidth: 1, borderColor: '#B56BFF', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#46204D', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <View style={{ width: 24, height: 18, borderWidth: 2, borderColor: '#D5A3FF', borderRadius: 4 }}><View style={{ position: 'absolute', width: 30, height: 3, backgroundColor: '#FF6685', top: 7, left: -4, transform: [{ rotate: '42deg' }] }} /></View>
        </View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? 'Open seat' : 'Close seat'}</Text><Text style={{ color: '#D3A5FF', fontSize: 11, marginTop: 2 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? 'Allow anyone to sit again' : 'Block everyone, including owner/admin'}</Text></View>
        <Text style={{ color: '#D5A3FF', fontSize: 18 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? '↗' : '⛔'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const closed = !!micControls.find(x => x.seat_number === micControlSeat)?.mic_closed; const action = closed ? 'open_mic' : 'close_mic';
        try { await api(`/api/rooms/${selectedRoom.id}/mic-seats/${micControlSeat}/control`, { method: 'PATCH', body: JSON.stringify({ action }) }); await loadRoomMicSeats(selectedRoom.id); setShowMicControlPopup(false); } catch (e) { Alert.alert('Control failed', e.message); }
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#142B3B', borderWidth: 1, borderColor: '#43DCC5', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#1A4051', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ color: '#43DCC5', fontSize: 24, fontWeight: '900' }}>♩</Text><View style={{ position: 'absolute', width: 28, height: 2, backgroundColor: '#FF6685', transform: [{ rotate: '45deg' }] }} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? 'Open mic' : 'Close mic'}</Text><Text style={{ color: '#A6E8F1', fontSize: 11, marginTop: 2 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? 'Allow the seated user to unmute' : 'Force mute this seat, even for owner'}</Text></View>
        <Text style={{ color: '#43DCC5', fontSize: 18 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? '↗' : '🔇'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowMicControlPopup(false)} style={{ alignItems: 'center', paddingVertical: 11 }}><Text style={{ color: '#9CA9C9', fontWeight: '800' }}>Cancel</Text></TouchableOpacity>
    </View>
  </View>
</Modal>

                    
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
          {message.sender?.display_name || message.sender || 'TALKZY User'}
        </Text>

        {message.image_url ? (
          <Image source={{ uri: message.image_url }} style={{ width: 190, height: 140, borderRadius: 9, marginTop: 2 }} resizeMode="cover" />
        ) : (
          <Text style={{ color: C.text, fontSize: 14 }}>{message.text || message.message_text}</Text>
        )}

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

      {/* ROOM POPUPS: overlay the room without resizing or scrolling the full screen */}
      {(showRoomGiftPanel || showRoomTools) && (
        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 86,
            maxHeight: showRoomTools ? '48%' : '58%',
            backgroundColor: C.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: C.line,
            zIndex: 30,
            elevation: 18
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: 'bold' }}>
              {showRoomGiftPanel ? 'Send a Gift 🎁' : 'Room Tools'}
            </Text>
            <TouchableOpacity onPress={() => { setShowRoomGiftPanel(false); setShowRoomTools(false); }} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {showRoomGiftPanel ? (
              [
                { icon: '🌹', name: 'Rose' },
                { icon: '❤️', name: 'Heart' },
                { icon: '💎', name: 'Diamond' },
                { icon: '🎂', name: 'Cake' },
                { icon: '🎸', name: 'Guitar' },
                { icon: '👑', name: 'Crown' },
                { icon: '🚗', name: 'Car' },
                { icon: '🎁', name: 'Gift Box' }
              ].map(gift => (
                <TouchableOpacity
                  key={gift.name}
                  onPress={() => Alert.alert(gift.name, `${gift.name} gifting will be available soon.`)}
                  style={{ width: '25%', alignItems: 'center', paddingVertical: 12 }}
                >
                  <Text style={{ fontSize: 27 }}>{gift.icon}</Text>
                  <Text style={{ color: C.text, fontSize: 11, marginTop: 5 }}>{gift.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              (() => {
                const isCurrentRoomOwner = selectedRoom?.owner_id === session?.user?.id;
                const myPresence = roomPresence.find(person => person.user_id === session?.user?.id);
                const isCurrentRoomAdmin = myPresence?.presence_role === 'admin';
                const roomToolItems = [
                  { icon: '🎵', title: 'Music' },
                  ...((isCurrentRoomAdmin || isCurrentRoomOwner) ? [{ icon: '▶️', title: 'YouTube' }] : []),
                  { icon: '✨', title: 'Effect' },
                  { icon: '🎒', title: 'My Props' },
                  { icon: '🍀', title: 'Lucky Number' },
                  { icon: '🎲', title: 'Dice' },
                  { icon: '🎁', title: 'Lucky Bag' },
                  ...(isCurrentRoomAdmin || isCurrentRoomOwner ? [{ icon: '🗑️', title: 'Clear Chat' }] : []),
                  ...(isCurrentRoomOwner ? [{ icon: '🎉', title: 'Activity' }, { icon: '🎨', title: 'Theme' }] : [])
                ];
                return roomToolItems.map(tool => (
                  <TouchableOpacity
                    key={tool.title}
                    onPress={() => {
                      // Activity is exclusive to the original creator of this room.
                      // Admin and Main Owner roles never grant this permission.
                      if (tool.title === 'Activity' && selectedRoom?.owner_id !== session?.user?.id) {
                        setShowRoomTools(false);
                        return;
                      }
                      setShowRoomTools(false);
                      if (tool.title === 'Clear Chat') {
                        Alert.alert('Clear Room Chat', 'Are you sure you want to clear all chat messages?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Clear', style: 'destructive', onPress: async () => {
                            try {
                              await api(`/api/rooms/${selectedRoom.id}/messages`, { method: 'DELETE' });
                              setRoomChatMessages([]);
                            } catch (error) {
                              Alert.alert('Clear Chat', error.message || 'Could not clear room chat.');
                            }
                          } }
                        ]);
                      } else if (tool.title === 'Activity') {
                        // Open the same Create Activity page used by Subscribe Activities (+).
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
                      } else if (tool.title === 'YouTube') {
                        setShowYoutubePanel(true);
                        loadYoutubeState(true);
                      } else if (tool.title === 'Music') {
                        setShowMusicPanel(true);
                      } else if (tool.title === 'Theme') {
                        setShowRoomThemeMenu(true);
                      } else if (tool.title === 'Lucky Number' || tool.title === 'Dice') {
                        if (!isOnMic || myMicSeat == null) {
                          Alert.alert('Sit on a mic first!', 'Please sit on a microphone before playing.');
                        } else if (isRoomTourist && !touristsSendText) {
                          Alert.alert('Game unavailable', 'The room owner does not allow tourists to send text messages.');
                        } else {
                          setMicGame({
                            roomId: selectedRoom.id,
                            seat: myMicSeat,
                            kind: tool.title,
                            phase: 'spinning',
                            value: tool.title === 'Lucky Number' ? '000' : '1'
                          });
                        }
                      } else if (tool.title === 'Lucky Bag') {
                        setLuckyBagTab('Room');
                        setLuckyBagCoins(500);
                        setLuckyBagQuantity(1);
                        setLuckyBagHistoryView(false);
                        setShowLuckyBagPopup(true);
                      } else {
                        Alert.alert(tool.title, `${tool.title} will be available here soon.`);
                      }
                    }}
                    style={{ width: '33.333%', paddingVertical: 12, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 25 }}>{tool.icon}</Text>
                    <Text style={{ color: C.text, fontSize: 12, marginTop: 5 }}>{tool.title}</Text>
                  </TouchableOpacity>
                ));
              })()
            )}
          </ScrollView>
        </View>
      )}


      {showRoomThemeMenu && selectedRoom?.owner_id === session?.user?.id && (
        <View style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 86,
          backgroundColor: 'rgba(15, 19, 31, 0.96)',
          borderRadius: 16,
          padding: 15,
          borderWidth: 1,
          borderColor: C.line,
          zIndex: 42,
          elevation: 24
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>🎨 Room Theme</Text>
            <TouchableOpacity onPress={() => setShowRoomThemeMenu(false)} style={{ paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ minHeight: 112, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(255,255,255,0.035)', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
            <Text style={{ fontSize: 30, marginBottom: 7 }}>🖼️</Text>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>Room themes are coming soon</Text>
            <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 5 }}>Theme selection and customization will be added here later.</Text>
          </View>
        </View>
      )}

      <RoomMusicPanel visible={showMusicPanel} roomId={selectedRoom?.id} userId={session?.user?.id} api={api} supabase={supabase} colors={C} onClose={() => { setShowMusicPanel(false); setMusicMinimized(false); }} onMinimize={() => { setShowMusicPanel(false); setMusicMinimized(true); }} />
      {showLuckyBagPopup && (
        <Modal
          visible={showLuckyBagPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLuckyBagPopup(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(3,5,14,0.82)', justifyContent: 'center', paddingHorizontal: 15 }}>
            <View style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: '#7044B8', backgroundColor: '#120D25', maxHeight: '88%' }}>
              <View style={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 16, backgroundColor: '#28134B' }}>
                <TouchableOpacity onPress={() => setShowLuckyBagPopup(false)} style={{ position: 'absolute', right: 15, top: 14, zIndex: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: '#44266B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#E9D8FF', fontSize: 17, fontWeight: '800' }}>×</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Animated.View style={{ width: 88, height: 88, borderRadius: 27, backgroundColor: '#4B267B', borderWidth: 1.5, borderColor: '#E5C16B', alignItems: 'center', justifyContent: 'center', shadowColor: '#B56BFF', shadowOpacity: 0.55, shadowRadius: 18, elevation: 9, transform: [{ scale: luckyBagPulse }] }}>
                    <View style={{ position: 'absolute', width: 70, height: 70, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(226,190,255,0.35)' }} />
                    <Text style={{ fontSize: 50 }}>🧧</Text>
                    <Text style={{ position: 'absolute', bottom: -7, right: -7, fontSize: 24 }}>✨</Text>
                  </Animated.View>
                  <Text style={{ color: '#FFE7A8', fontSize: 22, fontWeight: '900', marginTop: 11, letterSpacing: 0.4 }}>LUCKY BAG</Text>
                  <Text style={{ color: '#CBB6F4', fontSize: 12, marginTop: 4 }}>Spread luck. Share the sparkle.</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: '#180D32', borderRadius: 15, padding: 4, marginTop: 18 }}>
                  {['Room', 'World'].map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setLuckyBagTab(tab)} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: luckyBagTab === tab ? '#8A55D8' : 'transparent', borderWidth: luckyBagTab === tab ? 1 : 0, borderColor: '#CBA8FF' }}>
                      <Text style={{ color: luckyBagTab === tab ? '#FFFFFF' : '#B9A5D8', fontWeight: '900', fontSize: 13 }}>{tab === 'World' ? '🌍  WORLD' : '🏠  ROOM'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 18 }}>
                {luckyBagHistoryView ? (
                  <View style={{ paddingBottom: 12 }}>
                    <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                      <Text style={{ color:'#F3E9FF',fontSize:16,fontWeight:'900' }}>📜 Transaction History</Text>
                      <TouchableOpacity onPress={loadLuckyBagHistory} style={{ paddingHorizontal:11,paddingVertical:7,borderRadius:10,backgroundColor:'#39205D' }}><Text style={{ color:'#DCC8FF',fontWeight:'800',fontSize:11 }}>↻ REFRESH</Text></TouchableOpacity>
                    </View>
                    {luckyBagHistoryLoading ? <Text style={{color:'#AA9BC5',textAlign:'center',padding:24}}>Loading history…</Text> : luckyBagHistoryItems.length===0 ? (
                      <View style={{alignItems:'center',paddingVertical:25}}><Text style={{fontSize:38}}>📭</Text><Text style={{color:'#AA9BC5',marginTop:8,textAlign:'center'}}>No Lucky Bag transactions yet.</Text></View>
                    ) : luckyBagHistoryItems.map(item => {
                      const isReceived=item.type==='lucky_bag_received'||item.type==='lucky_bag_claim';
                      const isRefund=item.type==='lucky_bag_refund';
                      const isSend=item.type==='lucky_bag_send';
                      const label=isReceived?'Lucky Bag Reward':isRefund?'Unclaimed Coins Refunded':isSend?'Lucky Bag Sent':item.type.replace(/_/g,' ');
                      const positive=item.amount>0;
                      const bag=item.bag;
                      return <View key={item.key} style={{padding:12,marginBottom:9,borderRadius:14,backgroundColor:'#211630',borderWidth:1,borderColor:'#49345F'}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                          <Text style={{color:'#EDE0FF',fontWeight:'900',fontSize:12,flex:1}}>{label}</Text>
                          <Text style={{color:positive?'#74E0A7':'#FF9A9A',fontWeight:'900',fontSize:14}}>{positive?'+':''}{Number(item.amount||0).toLocaleString()} 🪙</Text>
                        </View>
                        {isReceived && <Text style={{color:'#BDA8DA',fontSize:11,marginTop:5}}>From: {item.senderName||'TALKZY User'}</Text>}
                        {bag && <Text style={{color:'#BDA8DA',fontSize:11,marginTop:4}}>{bag.scope==='world'?'🌍 World':'🏠 Room'} · Bag {bag.status||''}</Text>}
                        {isSend && bag && <Text style={{color:'#BDA8DA',fontSize:11,marginTop:4}}>Claimed by: {bag.recipientNames.length?bag.recipientNames.join(', '):'No one yet'}</Text>}
                        {item.note && <Text style={{color:'#9F8AB9',fontSize:10,marginTop:4}}>{item.note}</Text>}
                        <Text style={{color:'#8C789F',fontSize:10,marginTop:5}}>{new Date(item.created_at).toLocaleString()} · Balance {Number(item.balance_after||0).toLocaleString()}</Text>
                      </View>;
                    })}
                    <TouchableOpacity onPress={() => setLuckyBagHistoryView(false)} style={{marginTop:8,alignSelf:'center',paddingHorizontal:20,paddingVertical:10,borderRadius:12,backgroundColor:'#39205D'}}><Text style={{color:'#DCC8FF',fontWeight:'800'}}>Back to Lucky Bag</Text></TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: '#F1E7FF', fontWeight: '900', fontSize: 14, marginBottom: 11 }}>Choose your bag amount</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {[250, 500, 1000, 5000].map(amount => (
                        <TouchableOpacity key={amount} onPress={() => { setLuckyBagCoins(amount); setLuckyBagCustomCoins(String(amount)); }} style={{ width: '48.5%', marginBottom: 10, paddingVertical: 13, paddingHorizontal: 10, borderRadius: 16, borderWidth: luckyBagCoins === amount ? 1.7 : 1, borderColor: luckyBagCoins === amount ? '#E9BD59' : '#49345F', backgroundColor: luckyBagCoins === amount ? '#39264A' : '#1D1531', alignItems: 'center' }}>
                          <Text style={{ fontSize: 21 }}>{amount >= 1000 ? '💎' : '🪙'}</Text>
                          <Text style={{ color: luckyBagCoins === amount ? '#FFE39A' : '#D6C6EF', fontSize: 16, fontWeight: '900', marginTop: 5 }}>{amount.toLocaleString()} Coins</Text>
                          {luckyBagCoins === amount && <View style={{ position: 'absolute', top: 7, right: 8, width: 17, height: 17, borderRadius: 9, backgroundColor: '#D9A93F', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#24152D', fontSize: 10, fontWeight: '900' }}>✓</Text></View>}
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={{ marginTop: 2, marginBottom: 14, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#8B67B5', backgroundColor: '#211433' }}>
                      <Text style={{ color: '#DCC8FF', fontWeight: '900', fontSize: 12, marginBottom: 8 }}>✨ CUSTOM COINS</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#120D25', borderRadius: 12, borderWidth: 1, borderColor: '#57416F', paddingHorizontal: 12 }}>
                        <Text style={{ fontSize: 18, marginRight: 8 }}>🪙</Text>
                        <TextInput value={luckyBagCustomCoins} onChangeText={value => { const digits = value.replace(/[^0-9]/g, '').slice(0, 9); setLuckyBagCustomCoins(digits); if (digits) setLuckyBagCoins(Math.max(1, Number(digits))); }} keyboardType="number-pad" placeholder="Enter coin amount" placeholderTextColor="#8D7BA8" style={{ flex: 1, color: '#FFE39A', fontWeight: '900', fontSize: 17, paddingVertical: 12 }} />
                      </View>
                      <Text style={{ color: '#9E8AB9', fontSize: 10, marginTop: 6 }}>Enter any amount of coins to personalize your bag.</Text>
                    </View>

                    <Text style={{ color: '#F1E7FF', fontWeight: '900', fontSize: 14, marginBottom: 10 }}>Bag quantity</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#211632', borderWidth: 1, borderColor: '#49345F' }}>
                      <TouchableOpacity onPress={() => setLuckyBagQuantity(q => Math.max(1, q - 1))} style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#39264A', borderWidth: 1, borderColor: '#76539C', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#E8D4FF', fontSize: 25, fontWeight: '900' }}>−</Text>
                      </TouchableOpacity>
                      <View style={{ alignItems: 'center', minWidth: 92, marginHorizontal: 20 }}>
                        <Text style={{ color: '#FFE39A', fontSize: 25, fontWeight: '900' }}>{luckyBagQuantity}</Text>
                        <Text style={{ color: '#BBA9D4', fontSize: 10, fontWeight: '800' }}>BAGS</Text>
                      </View>
                      <TouchableOpacity onPress={() => setLuckyBagQuantity(q => Math.min(99, q + 1))} style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#613B8D', borderWidth: 1, borderColor: '#C9A1FF', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 25, fontWeight: '900' }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 14, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: '#7C5BA5', backgroundColor: '#24143B', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 58, height: 58, borderRadius: 17, backgroundColor: '#4A2775', borderWidth: 1, borderColor: '#D7B66A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Text style={{ fontSize: 32 }}>🧧</Text>
                        <Text style={{ position: 'absolute', bottom: -5, right: -5, fontSize: 17 }}>✨</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#CDB8EE', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>BAG PREVIEW</Text>
                        <Text style={{ color: '#FFE39A', fontSize: 17, fontWeight: '900', marginTop: 3 }}>{luckyBagCoins.toLocaleString()} COINS</Text>
                        <Text style={{ color: '#BBA9D4', fontSize: 11, marginTop: 3 }}>{luckyBagQuantity} bag{luckyBagQuantity === 1 ? '' : 's'} · {luckyBagTab} delivery</Text>
                      </View>
                      <View style={{ backgroundColor: '#34204D', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: '#8E6DB4' }}>
                        <Text style={{ color: '#F0D9FF', fontSize: 10, fontWeight: '900' }}>READY</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 15, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: '#66502D', backgroundColor: '#30251A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ color: '#BFA77D', fontSize: 11, fontWeight: '800' }}>TOTAL COST</Text>
                        <Text style={{ color: '#FFE19A', fontSize: 20, fontWeight: '900', marginTop: 3 }}>🪙 {(luckyBagCoins * luckyBagQuantity).toLocaleString()}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#BFA77D', fontSize: 11 }}>BAGS</Text>
                        <Text style={{ color: '#F5D58A', fontSize: 18, fontWeight: '900', marginTop: 3 }}>{luckyBagQuantity}</Text>
                      </View>
                    </View>

                    <TouchableOpacity disabled={luckyBagSending} onPress={sendLuckyBag} style={{ marginTop: 14, paddingVertical: 15, borderRadius: 16, backgroundColor: '#8D51D6', borderWidth: 1, borderColor: '#C99BFF', alignItems: 'center', shadowColor: '#A56BFF', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>{luckyBagSending ? '⏳ SENDING...' : '🎁  SEND LUCKY BAG'}</Text>
                    </TouchableOpacity>
                  </>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#38284C' }}>
                  <View>
                    <Text style={{ color: '#AA9BC5', fontSize: 10, fontWeight: '800' }}>YOUR COIN BALANCE</Text>
                    <Text style={{ color: '#D9C9F4', fontSize: 13, fontWeight: '800', marginTop: 3 }}>🪙 {walletBalance.toLocaleString()} coins</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setLuckyBagHistoryView(true); loadLuckyBagHistory(); }} style={{ borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#2A1B42', borderWidth: 1, borderColor: '#594071' }}>
                    <Text style={{ color: '#DCC5FF', fontSize: 11, fontWeight: '900' }}>📜 HISTORY</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {musicMinimized && screen === 'roomInterior' && selectedRoom && !showRoomTools && !showRoomGiftPanel && !showRoomThemeMenu && !showYoutubePanel && (
        <TouchableOpacity
          onPress={() => { setMusicMinimized(false); setShowMusicPanel(true); }}
          style={{
            position: 'absolute',
            right: 12,
            bottom: Platform.OS === 'android' ? 94 : 70,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: C.accent,
            borderWidth: 2,
            borderColor: '#B9A5FF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 38,
            elevation: 22,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 3 }
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', lineHeight: 27 }}>♫</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 }}>MUSIC</Text>
        </TouchableOpacity>
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
    maxWidth: 190,
    marginRight: 4
  }}
>
  <View
    style={{
      flex: 1,
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: 20,
      paddingLeft: 10,
      paddingRight: 5
    }}
  >
    <TextInput
      value={roomChatText}
      onChangeText={setRoomChatText}
      placeholder={isRoomTourist && !touristsSendText ? 'Tourist chat disabled' : 'Message...'}
      placeholderTextColor={C.muted}
      onSubmitEditing={sendRoomChatMessage}
      editable={!(isRoomTourist && !touristsSendText)}
      returnKeyType="send"
      style={{ color: C.text, fontSize: 12, padding: 0, flex: 1 }}
    />
    <TouchableOpacity
      onPress={sendRoomImage}
      disabled={isRoomTourist && !touristsSendPic}
      style={{ width: 30, height: 32, alignItems: 'center', justifyContent: 'center', opacity: isRoomTourist && !touristsSendPic ? 0.35 : 1 }}
    >
      <Text style={{ fontSize: 17 }}>▣</Text>
    </TouchableOpacity>
  </View>

  <TouchableOpacity
    onPress={sendRoomChatMessage}
    disabled={isRoomTourist && !touristsSendText}
    style={{ opacity: isRoomTourist && !touristsSendText ? 0.4 : 1,
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

  {/* BELL - OPEN ROOM MESSAGE OPTIONS */}
  <TouchableOpacity
    onPress={() => setShowRoomMessageMenu(true)}
    style={{
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Text style={{ fontSize: 19 }}>🔔</Text>
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
  setShowRoomThemeMenu(false);
  setIsRoomMinimized(true);
  setScreen('main');
}}
          >
            <Text style={{ color: C.text, fontSize: 15 }}>
              Minimize
            </Text>
          </TouchableOpacity>

          {/* FOLLOW / UNFOLLOW ROOM - HIDE FOR ROOM OWNER */}
          {selectedRoom?.owner_id !== session?.user?.id && (
            <TouchableOpacity
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: C.line
              }}
              onPress={() => {
                setShowRoomMenu(false);
                toggleFollowRoom(selectedRoom);
              }}
            >
              <Text style={{ color: C.text, fontSize: 15 }}>
                {followedRooms.some(item => item.id === selectedRoom?.id)
                  ? 'Unfollow Room'
                  : 'Follow Room'}
              </Text>
            </TouchableOpacity>
          )}

          {/* EXIT */}
          <TouchableOpacity
            style={{ padding: 14 }}
            onPress={exitCurrentRoom}
          >
            <Text style={{ color: '#FF5B5B', fontSize: 15 }}>
              Exit Room
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ROOM TYPE / MICROPHONE LAYOUT POPUP */}
      <Modal visible={showMicCountPicker} transparent animationType="fade" onRequestClose={() => setShowMicCountPicker(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.72)', justifyContent:'center', alignItems:'center', padding:16 }}>
          <View style={{ width:'100%', maxHeight:'88%', backgroundColor:C.card, borderRadius:18, borderWidth:1, borderColor:C.line, padding:16 }}>
            <Text style={{ color:C.text, fontSize:19, fontWeight:'bold', textAlign:'center' }}>{roomIsLocked ? '🔒 Locked Room' : '🌐 Public Room'}</Text>
            <Text style={{ color:C.muted, fontSize:12, textAlign:'center', marginTop:5, marginBottom:14 }}>{selectedRoom?.owner_id === session?.user?.id ? 'Choose the microphone count and arrangement.' : 'Current microphone arrangement'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Object.entries(MIC_LAYOUTS).map(([layoutKey, layout]) => {
                const selected = micLayout === layoutKey;
                const canChange = selectedRoom?.owner_id === session?.user?.id;
                return (
                  <TouchableOpacity key={layoutKey} disabled={!canChange} onPress={async () => {
                    try {
                      const result = await api(`/api/rooms/${selectedRoom.id}/mic-count`, { method:'PATCH', body:JSON.stringify({ micCount:layout.count, micLayout:layoutKey }) });
                      setMicCount(result.micCount || layout.count); setMicLayout(result.micLayout || layoutKey);
                      await loadRoomMicSeats(selectedRoom.id);
                    } catch(error) { Alert.alert('Room Layout', error.message || 'Could not change microphone layout.'); }
                  }} style={{ padding:10, marginBottom:9, borderRadius:12, borderWidth:1.5, borderColor:selected ? C.accent : C.line, backgroundColor:selected ? C.panel2 : 'transparent', opacity:canChange ? 1 : 0.9 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <Text style={{ color:C.text, fontSize:13, fontWeight:'bold' }}>{layout.label}</Text>
                      <Text style={{ color:selected ? C.accent : C.muted, fontSize:11, fontWeight:'bold' }}>{selected ? '✓ Selected' : (canChange ? 'Select' : '')}</Text>
                    </View>
                    {layout.rows.map((previewRow,rowIndex) => <View key={rowIndex} style={{ flexDirection:'row', justifyContent:'center', marginBottom:4 }}>
                      {previewRow.map(seat => <View key={seat} style={{ width:19, height:19, borderRadius:10, borderWidth:1, borderColor:selected ? C.accent : C.muted, backgroundColor:selected ? C.accent : C.panel2, alignItems:'center', justifyContent:'center', marginHorizontal:3 }}><Text style={{ color:'#FFFFFF', fontSize:8 }}>{seat}</Text></View>)}
                    </View>)}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:8 }}>Seats above the selected limit are removed automatically. Only the room owner can change this setting.</Text>
            <TouchableOpacity onPress={() => setShowMicCountPicker(false)} style={{ marginTop:12, padding:12, borderRadius:10, backgroundColor:C.panel2, alignItems:'center' }}><Text style={{ color:C.text, fontWeight:'bold' }}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ROOM MESSAGE / FRIENDS POPUP */}
      <Modal visible={showRoomMessageMenu} transparent animationType="fade" onRequestClose={() => setShowRoomMessageMenu(false)}>
        <Pressable onPress={() => setShowRoomMessageMenu(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 14 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', marginBottom: 10 }}>Messages</Text>
            <TouchableOpacity
              onPress={() => { setShowRoomMessageMenu(false); setMessageTab('Message'); setActiveTab('Message'); }}
              style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 11, backgroundColor: C.panel, marginBottom: 8 }}
            >
              <Text style={{ fontSize: 18, marginRight: 11 }}>💬</Text>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '800' }}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowRoomMessageMenu(false); setMessageTab('Friends'); setActiveTab('Message'); }}
              style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 11, backgroundColor: C.panel }}
            >
              <Text style={{ fontSize: 18, marginRight: 11 }}>👥</Text>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '800' }}>Friends</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* LIVE ROOM USERS LIST */}
      <Modal visible={showRoomUsers} transparent animationType="slide" onRequestClose={() => setShowRoomUsers(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' }}>
          <View style={{ maxHeight: '78%', minHeight: '42%', backgroundColor: C.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: C.line, paddingHorizontal: 16, paddingTop: 17, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>People in this room</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{roomPresence.length} currently online</Text>
              </View>
              <TouchableOpacity onPress={() => loadRoomPresence(selectedRoom?.id, true)} style={{ paddingHorizontal: 10, paddingVertical: 7, marginRight: 7, borderRadius: 9, backgroundColor: C.panel2 }}>
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: '800' }}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRoomUsers(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.text, fontSize: 19 }}>×</Text>
              </TouchableOpacity>
            </View>
            {roomPresenceLoading ? (
              <Text style={{ color: C.muted, textAlign: 'center', padding: 24 }}>Loading room users…</Text>
            ) : roomPresence.length === 0 ? (
              <Text style={{ color: C.muted, textAlign: 'center', padding: 24 }}>No active users found.</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {roomPresence.map((person) => (
                  <View key={person.user_id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }}>
                    <View style={{ width: 25, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 7 }}>
                      <Text style={{ fontSize: 17 }}>
                        {person.presence_role === 'owner' ? '👑' : person.presence_role === 'admin' ? '🛡️' : person.presence_role === 'tourist' ? '🌐' : '👤'}
                      </Text>
                    </View>
                    {person.avatar_url ? (
                      <Image source={{ uri: person.avatar_url }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.line }} />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: C.text, fontSize: 17, fontWeight: '900' }}>{(person.display_name || 'U').slice(0, 1).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 11 }}>
                      <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }} numberOfLines={1}>{person.display_name || 'TALKZY User'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, minHeight: 18 }}>
                        <Text style={{ color: C.muted, fontSize: 10 }}>Level: {person.level || 'Not assigned'}</Text>
                        {/* Reserved inline space for future profile badges */}
                        <View style={{ flex: 1, minHeight: 18, marginLeft: 8 }} />
                      </View>
                    </View>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#35C987', marginLeft: 6 }} />
                  </View>
                ))}
              </ScrollView>
            )}
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
        <View style={{ flex: 1, backgroundColor: C.bg, padding: 18 }}>
          <Button title="Back to Rooms" onPress={() => setScreen('main')} />
        </View>
      );
    }

    const SettingCard = ({ icon, title, subtitle, children }) => (
      <View style={{ backgroundColor: '#121B2C', borderRadius: 18, borderWidth: 1, borderColor: '#273650', padding: 16, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: children ? 14 : 0 }}>
          <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#28234B', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>{title}</Text>
            {!!subtitle && <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{subtitle}</Text>}
          </View>
        </View>
        {children}
      </View>
    );

    const SettingRow = ({ icon, title, hint, onPress }) => (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#26334A' }}>
        <Text style={{ width: 30, fontSize: 17 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>{title}</Text>
          {!!hint && <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{hint}</Text>}
        </View>
        <Text style={{ color: C.muted, fontSize: 21 }}>›</Text>
      </TouchableOpacity>
    );

    const ApprovalRow = ({ title, subtitle, value, onChange }) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#26334A' }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{title}</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#0A1020', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: C.line }}>
          {[true, false].map(option => (
            <TouchableOpacity key={String(option)} onPress={() => onChange(option)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: value === option ? (option ? '#246B58' : '#633448') : 'transparent' }}>
              <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>{option ? 'YES' : 'NO'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: '#10182A' }}>
          <TouchableOpacity onPress={() => setScreen(roomSettingsReturnScreen || 'main')} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#202A40', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ color: C.text, fontSize: 25, marginTop: -2 }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Room Setting</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Manage your room your way</Text>
          </View>
          <View style={{ backgroundColor: '#29234B', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }}>
            <Text style={{ color: '#C8BFFF', fontSize: 10, fontWeight: '900' }}>OWNER</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 35 }} keyboardShouldPersistTaps="handled">
          <View style={{ borderRadius: 20, padding: 17, marginBottom: 17, backgroundColor: '#211D42', borderWidth: 1, borderColor: '#5546A1' }}>
            <Text style={{ color: '#C8BFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>ROOM CONTROL CENTRE</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 7 }}>{roomSettingName || selectedRoom.room_name || selectedRoom.name || 'Your Room'}</Text>
            <Text style={{ color: '#B9B4D8', fontSize: 12, marginTop: 5 }}>Personalise details, manage members and control room access.</Text>
          </View>

          <SettingCard icon="🏠" title="1. Room Information" subtitle="Update the identity and details of your room">
            <TouchableOpacity onPress={chooseRoomDp} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#26334A' }}>
              {roomSettingDp || selectedRoom.room_dp_url ? <Image source={{ uri: roomSettingDp || selectedRoom.room_dp_url }} style={{ width: 48, height: 48, borderRadius: 14, marginRight: 12 }} /> : <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#29344A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 22 }}>📷</Text></View>}
              <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '800', fontSize: 13 }}>Room DP</Text><Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>Change your room picture</Text></View>
              <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>ROOM NAME</Text>
              <TextInput value={roomSettingName} onChangeText={setRoomSettingName} placeholder={selectedRoom.room_name || 'Enter room name'} placeholderTextColor="#71809A" style={{ color: C.text, backgroundColor: '#0B1221', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 13 }} />
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>ROOM ANNOUNCEMENT</Text>
              <TextInput value={roomSettingAnnouncement} onChangeText={setRoomSettingAnnouncement} multiline placeholder="Write an announcement for your room..." placeholderTextColor="#71809A" style={{ color: C.text, minHeight: 78, textAlignVertical: 'top', backgroundColor: '#0B1221', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 13 }} />
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>ROOM PASSWORD</Text>
              <TextInput value={roomSettingsPassword} onChangeText={setRoomSettingsPassword} secureTextEntry placeholder="Set or change room password" placeholderTextColor="#71809A" style={{ color: C.text, backgroundColor: '#0B1221', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 13 }} />
              <Text style={{ color: C.muted, fontSize: 10, marginTop: 6 }}>Room privacy</Text>
              <View style={{ flexDirection: 'row', marginTop: 7, backgroundColor: '#0A1020', borderRadius: 11, padding: 4 }}>
                {['public','locked'].map(type => <TouchableOpacity key={type} onPress={() => setRoomSettingsType(type)} style={{ flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: roomSettingsType === type ? C.accent : 'transparent' }}><Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{type === 'public' ? 'PUBLIC' : 'LOCKED'}</Text></TouchableOpacity>)}
              </View>

            </View>
          </SettingCard>

          <SettingCard icon="🛡️" title="2. Room Management" subtitle="Manage trusted people and room access">
            <SettingRow icon="👑" title="Room Administrator List" hint="View and manage room administrators" onPress={() => loadRoomSettingsSubpage('admins')} />
            <SettingRow icon="🚫" title="Kick List" hint="View members removed from this room" onPress={() => loadRoomSettingsSubpage('kicklist')} />
            <SettingRow icon="👥" title="Manage Room Members" hint="Promote members or add administrators" onPress={() => loadRoomSettingsSubpage('members')} />
          </SettingCard>

          <SettingCard icon="🎮" title="3. Tools Game Settings" subtitle="More room tools and game controls">
            <View style={{ minHeight: 32 }} />
          </SettingCard>

          <SettingCard icon="🔐" title="4. Room Approval" subtitle="Choose what visitors are allowed to do">
            <ApprovalRow title="Tourists on mic" subtitle="Allow visitors to take a microphone seat" value={touristsOnMic} onChange={setTouristsOnMic} />
            <ApprovalRow title="Tourists send text" subtitle="Allow visitors to send chat messages" value={touristsSendText} onChange={setTouristsSendText} />
            <ApprovalRow title="Tourists send pic" subtitle="Allow visitors to share pictures in chat" value={touristsSendPic} onChange={setTouristsSendPic} />
          </SettingCard>
          <TouchableOpacity onPress={saveRoomSettings} disabled={roomSettingSaving} style={{ backgroundColor: '#7657F6', padding: 15, borderRadius: 14, alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{roomSettingSaving ? 'Saving...' : 'Save Room Settings'}</Text>
          </TouchableOpacity>
        <Modal visible={showRoomActivityComposer} transparent animationType="slide" onRequestClose={() => setShowRoomActivityComposer(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', padding: 18 }}>
            <View style={{ backgroundColor: C.panel, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 12 }}>Create Room Activity</Text>
              <TextInput value={roomActivityTitle} onChangeText={setRoomActivityTitle} placeholder="Activity title" placeholderTextColor={C.muted} style={{ color: C.text, backgroundColor: C.bg, borderRadius: 11, padding: 12, marginBottom: 10 }} />
              <TextInput value={roomActivityDescription} onChangeText={setRoomActivityDescription} multiline placeholder="Description (optional)" placeholderTextColor={C.muted} style={{ color: C.text, backgroundColor: C.bg, borderRadius: 11, padding: 12, minHeight: 75, textAlignVertical: 'top', marginBottom: 10 }} />
              <TouchableOpacity onPress={chooseRoomActivityPoster} style={{ padding: 12, borderRadius: 11, backgroundColor: C.panel2, marginBottom: 12, alignItems: 'center' }}><Text style={{ color: C.text, fontWeight: '800' }}>{roomActivityPoster ? '✓ Poster selected · Change poster' : '＋ Choose activity poster'}</Text></TouchableOpacity>
              {roomActivityPoster && <Image source={{ uri: roomActivityPoster }} style={{ width: '100%', height: 120, borderRadius: 10, marginBottom: 12 }} resizeMode="cover" />}
              <TouchableOpacity onPress={createAndPublishRoomActivity} disabled={roomActivitySaving} style={{ backgroundColor: C.accent, padding: 13, borderRadius: 11, alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{roomActivitySaving ? 'Publishing...' : 'Publish Activity'}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRoomActivityComposer(false)} style={{ padding: 12, alignItems: 'center' }}><Text style={{ color: C.muted, fontWeight: '800' }}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={!!roomSettingsSubpage} transparent animationType="slide" onRequestClose={() => setRoomSettingsSubpage(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'flex-end' }}>
            <View style={{ height: '78%', backgroundColor: C.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <TouchableOpacity onPress={() => setRoomSettingsSubpage(null)} style={{ padding: 8, marginRight: 8 }}><Text style={{ color: C.text, fontSize: 24 }}>‹</Text></TouchableOpacity>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{roomSettingsSubpage === 'admins' ? 'Room Administrator List' : roomSettingsSubpage === 'kicklist' ? 'Kick List' : 'Room Members'}</Text>
              </View>
              <ScrollView>
                {(roomSettingsSubpage === 'admins' ? roomSettingAdmins : roomSettingsSubpage === 'kicklist' ? roomSettingKicked : roomSettingMembers).map(item => (
                  <View key={item.user_id} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: C.line }}>
                    {item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }} /> : <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.panel2, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}><Text>👤</Text></View>}
                    <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '800' }}>{item.display_name || 'TALKZY User'}</Text><Text style={{ color: C.muted, fontSize: 11 }}>TALKZY ID: {item.talkzy_id || '—'}</Text></View>
                    {roomSettingsSubpage === 'admins' && <TouchableOpacity onPress={() => removeRoomAdmin(item.user_id)}><Text style={{ color: C.danger, fontWeight: '800' }}>Remove</Text></TouchableOpacity>}
                    {roomSettingsSubpage === 'kicklist' && <TouchableOpacity onPress={() => unkickRoomMember(item.user_id)}><Text style={{ color: '#65D6A5', fontWeight: '800' }}>Unblock</Text></TouchableOpacity>}
                    {roomSettingsSubpage === 'members' && <View style={{ alignItems: 'flex-end' }}>
                      {!item.is_admin && <TouchableOpacity onPress={() => addRoomAdmin(item.user_id)}><Text style={{ color: '#65D6A5', fontWeight: '800', marginBottom: 8 }}>Make Admin</Text></TouchableOpacity>}
                      <TouchableOpacity onPress={() => kickRoomMember(item.user_id)}><Text style={{ color: C.danger, fontWeight: '800' }}>Kick</Text></TouchableOpacity>
                    </View>}
                  </View>
                ))}
                {((roomSettingsSubpage === 'admins' && !roomSettingAdmins.length) || (roomSettingsSubpage === 'kicklist' && !roomSettingKicked.length) || (roomSettingsSubpage === 'members' && !roomSettingMembers.length)) && <Text style={{ color: C.muted, padding: 16 }}>No entries to show.</Text>}
              </ScrollView>
              <TouchableOpacity onPress={() => setRoomSettingsSubpage(null)} style={{ backgroundColor: C.panel2, borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 10 }}><Text style={{ color: C.text, fontWeight: '800' }}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
          <Text style={{ color: '#71809A', fontSize: 10, textAlign: 'center', marginTop: 2 }}>Room controls are reserved for the room creator.</Text>
        </ScrollView>
      </View>
    );
  }


  // =========================================
  // ROOM: MINE
  // =========================================

  function renderMine() {
    return (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 2 }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', letterSpacing: 0.2 }}>My Room</Text>
          <View style={{ backgroundColor: 'rgba(67,220,197,0.10)', borderWidth: 1, borderColor: 'rgba(67,220,197,0.30)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ color: C.teal, fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>MY SPACE</Text>
          </View>
        </View>
        {!roomCreationEligibilityLoaded ? (
          <View style={{ paddingVertical: 22, alignItems: 'center' }}>
            <ActivityIndicator color={C.accent} />
          </View>
        ) : !hasEverCreatedRoom && myRooms.length === 0 ? (
          <TouchableOpacity
            onPress={() => setScreen('createRoom')}
            style={{
              backgroundColor: '#6F4BD9', borderWidth: 1,
              borderColor: '#B69AFF', padding: 19, borderRadius: 19,
              marginBottom: 17, shadowColor: C.accent,
              shadowOpacity: 0.28, shadowRadius: 14, elevation: 4
            }}
          >
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '900', textAlign: 'center' }}>
              ＋ Create Your Room
            </Text>
          </TouchableOpacity>
        ) : myRooms.length > 0 ? (
          renderRoomCard(myRooms[0], false)
        ) : (
          <Text style={{ color: C.muted, textAlign: 'center', paddingVertical: 18 }}>
            You have already used your one-time room creation.
          </Text>
        )}


        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 4 }}>
          {['Recent', 'Joined', 'Follow'].map(item => {
            const active = mineTab === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => {
                  setMineTab(item);
                  if (item === 'Joined') loadJoinedRooms();
                  if (item === 'Follow') loadFollowedRooms();
                }}
                style={{ flex: 1, minWidth: 0, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit style={{
                  color: active ? '#F2ECFF' : '#9CA9C9',
                  fontSize: active ? 14 : 10,
                  fontWeight: active ? '900' : '600',
                  letterSpacing: active ? 0.2 : 0,
                  transform: [{ scale: active ? 1.06 : 1 }]
                }}>{item}</Text>
                {active && <View style={{ width: 18, height: 2, borderRadius: 2, backgroundColor: '#43DCC5', marginTop: 4 }} />}
              </TouchableOpacity>
            );
          })}
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
              rooms.map(room => (
                <View key={room.id}>
                  {renderRoomCard(room)}
                </View>
              ))
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
      <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginBottom: 3 }}>Trending on TALKZY</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginBottom: 5 }}>Popular rooms, community highlights and live events.</Text>
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
          description="Public rooms will appear here when owners create them."
        />
      ) : (
        rooms.slice().sort((a, b) => (Number(b.active_users) || 0) - (Number(a.active_users) || 0)).map(room => renderRoomCard(room))
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
      <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginBottom: 3 }}>Explore Communities</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Discover people, rooms and activities from around the world.</Text>
      
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
        {/* ROOM SCREEN INTRO */}
        <View style={{ paddingTop: 3, paddingBottom: 10 }}>
          <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.5 }}>Voice Rooms</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Find your people. Share your voice.</Text>
        </View>

        {/* ROOM SECTION NAVIGATION */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 2,
            paddingTop: 2,
            paddingBottom: 8,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(41,52,83,0.65)'
          }}
        >
          {['Mine', 'Popular', 'Discover', 'Events'].map(item => {
            const active = roomTab === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => {
                  setRoomTab(item);

                  if (item === 'Popular' || item === 'Mine') {
                    loadPublicRooms();
                    loadMyRooms();
                    if (item === 'Mine') loadFollowedRooms();
                  }

                  if (item === 'Events') {
                    loadOfficialEvents();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 38,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 1,
                  paddingVertical: 5
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    color: active ? '#F2ECFF' : '#9CA9C9',
                    fontSize: active ? 14 : 10,
                    fontWeight: active ? '900' : '600',
                    letterSpacing: active ? 0.2 : 0,
                    transform: [{ scale: active ? 1.06 : 1 }]
                  }}
                >
                  {item}
                </Text>
                {active && (
                  <View
                    style={{
                      width: 18,
                      height: 2,
                      borderRadius: 2,
                      backgroundColor: '#43DCC5',
                      marginTop: 4
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
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
                🪙 {walletBalance.toLocaleString()}
              </Text>

              <Text style={{ color: C.muted, fontSize: 11 }}>
                Your TALKZY wallet balance
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

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 4 }}>
          {momentTabs.map(item => {
            const active = momentTab === item;
            return (
              <TouchableOpacity key={item} activeOpacity={0.8} onPress={() => setMomentTab(item)}
                style={{ flex: 1, minWidth: 0, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={{
                  color: active ? '#F2ECFF' : '#9CA9C9',
                  fontSize: active ? 14 : 10,
                  fontWeight: active ? '900' : '600',
                  letterSpacing: active ? 0.2 : 0,
                  transform: [{ scale: active ? 1.06 : 1 }]
                }}>{item}</Text>
                {active && <View style={{ width: 18, height: 2, borderRadius: 2, backgroundColor: '#43DCC5', marginTop: 4 }} />}
              </TouchableOpacity>
            );
          })}
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

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 18, paddingHorizontal: 4 }}>
          {['Message', 'Friends'].map(item => {
            const active = messageTab === item;
            return (
              <TouchableOpacity key={item} activeOpacity={0.8} onPress={() => setMessageTab(item)}
                style={{ flex: 1, minWidth: 0, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={{
                  color: active ? '#F2ECFF' : '#9CA9C9',
                  fontSize: active ? 14 : 10,
                  fontWeight: active ? '900' : '600',
                  letterSpacing: active ? 0.2 : 0,
                  transform: [{ scale: active ? 1.06 : 1 }]
                }}>{item}</Text>
                {active && <View style={{ width: 18, height: 2, borderRadius: 2, backgroundColor: '#43DCC5', marginTop: 4 }} />}
              </TouchableOpacity>
            );
          })}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1, justifyContent: 'center',
          paddingTop: 22, paddingBottom: 42
        }}
      >
        <Brand />
        <View style={{ flexDirection: 'row', alignItems: 'center',
          justifyContent: 'center', marginBottom: 14 }}>
          <View style={{ width: 25, height: 1, backgroundColor: C.teal, opacity: 0.7 }} />
          <Text style={{ color: C.teal, fontSize: 9, fontWeight: '900',
            letterSpacing: 2, marginHorizontal: 10 }}>A WORLD OF VOICES</Text>
          <View style={{ width: 25, height: 1, backgroundColor: C.teal, opacity: 0.7 }} />
        </View>
        <Card style={{ padding: 20, backgroundColor: '#10172D',
          borderColor: '#35416A', borderRadius: 25 }}>
          <View style={{ width: 42, height: 4, borderRadius: 3,
            backgroundColor: C.teal, marginBottom: 17 }} />
          <Heading>
            {authMode === 'login'
              ? 'Welcome Back!'
              : 'Create Account'}
          </Heading>

          <Text style={{ color: C.muted, marginBottom: 10, lineHeight: 20, fontSize: 13 }}>
            {authMode === 'login'
              ? 'Your conversations, communities and favourite rooms are waiting.'
              : 'Find your people, join the conversation and make every moment count.'}
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
          backgroundColor: '#0D1326',
          borderTopWidth: 1, borderTopColor: '#263252',
          paddingTop: 9,
          paddingBottom: Platform.OS === 'android' ? 28 : 10,
          paddingHorizontal: 7
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
                alignItems: 'center', justifyContent: 'center',
                paddingVertical: 7, marginHorizontal: 2, borderRadius: 15,
                backgroundColor: active ? 'rgba(147,102,255,0.16)' : 'transparent',
                borderWidth: 1,
                borderColor: active ? 'rgba(147,102,255,0.30)' : 'transparent'
              }}
            >
              <Text style={{ fontSize: 20, opacity: active ? 1 : 0.72 }}>
                {tab.icon}
              </Text>

              <Text
                style={{
                  color: active ? '#D9CBFF' : '#8793B2',
                  fontWeight: active ? '900' : '700',
                  fontSize: 10, marginTop: 4, letterSpacing: 0.2
                }}
              >
                {tab.name}
              </Text>
              {active && <View style={{ width: 13, height: 3, borderRadius: 2,
                backgroundColor: C.teal, marginTop: 4 }} />}
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

          <View style={{ marginLeft: 9, justifyContent: 'center' }}>
            <Text style={{
              color: C.text, fontSize: 21, fontWeight: '900',
              letterSpacing: 3
            }}>TALKZY</Text>
            <Text style={{
              color: C.teal, fontSize: 8, fontWeight: '900',
              letterSpacing: 1.55, marginTop: 1
            }}>VOICE • ROOMS • COMMUNITY</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setActiveTab('Me')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#151D35', padding: 7, borderRadius: 25,
          borderWidth: 1, borderColor: '#303D60'
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
            {walletBalance.toLocaleString()}
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

        <ActivityIndicator
          size="large"
          color={C.accent}
        />

        <Text style={{ color: C.muted, marginTop: 12 }}>
          Loading...
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
        backgroundColor: screen === 'roomInterior' ? 'transparent' : C.bg,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0
      }}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, backgroundColor: screen === 'roomInterior' ? 'transparent' : C.bg }}>
        {screen !== 'roomInterior' && <>
          <View pointerEvents="none" style={{
            position: 'absolute', top: -95, left: -105,
            width: 250, height: 250, borderRadius: 125,
            backgroundColor: 'rgba(147,102,255,0.075)'
          }} />
          <View pointerEvents="none" style={{
            position: 'absolute', top: 170, right: -145,
            width: 245, height: 245, borderRadius: 123,
            backgroundColor: 'rgba(67,220,197,0.045)'
          }} />
        </>}

        {screen === 'roomInterior' ? (
          // Room interior stays fixed: only designated inner panels may scroll.
          <View style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent' }}>
            {renderMainContent()}
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1, backgroundColor: C.bg }}
            contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 25, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {renderMainHeader()}
            {renderMainContent()}
          </ScrollView>
        )}
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
            onPress={exitCurrentRoom}
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
            onPress={() => { setRoomDetailsTab(tab); if (tab === 'Activity') loadRoomActivities(roomDetails?.id); }}
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

                {roomDetails.owner_id === session?.user?.id && (
                  <TouchableOpacity
                    onPress={() => {
                      setRoomDetailsVisible(false);
                      openRoomSettings(roomDetails);
                    }}
                    activeOpacity={0.85}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B45C7', paddingVertical: 13, borderRadius: 13, marginTop: 16 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>⚙️  Settings</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* MEMBERS TAB */}
            {roomDetailsTab === 'Members' && (
              <View>
                <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>
                  Room Members ({roomDetailMembers.length})
                </Text>
                {loadingRoomDetailMembers ? (
                  <ActivityIndicator color={C.accent} />
                ) : roomDetailMembers.length === 0 ? (
                  <Text style={{ color: C.muted, marginTop: 8 }}>
                    No member records were returned for this room.
                  </Text>
                ) : roomDetailMembers
                  .filter(member => `${member.display_name || ''} ${member.talkzy_id || ''} ${member.user_id || ''}`.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map(member => (
                    <View key={member.user_id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
                      {member.avatar_url ? <Image source={{ uri: member.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.panel2, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}><Text>👤</Text></View>}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{member.display_name || 'TALKZY User'}</Text>
                        <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>TALKZY ID: {member.talkzy_id || '—'}</Text>
                      </View>
                      <Text style={{ color: C.gold, fontSize: 11, fontWeight: '800' }}>{member.is_admin ? 'ADMIN' : (member.role || 'Member')}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* ACTIVITY TAB */}
            {roomDetailsTab === 'Activity' && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>Room Activities</Text>
                  {roomDetails?.owner_id === session?.user?.id && <TouchableOpacity onPress={() => setShowRoomActivityComposer(true)}><Text style={{ color: C.accent, fontWeight: '900' }}>＋ Create</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => loadRoomActivities(roomDetails?.id)}><Text style={{ color: C.accent, fontWeight: '800' }}>Refresh</Text></TouchableOpacity>
                </View>
                {loadingRoomActivities ? <ActivityIndicator color={C.accent} /> :
                  roomActivities.length === 0 ? <Text style={{ color: C.muted, marginTop: 8 }}>No published room activities yet.</Text> :
                  roomActivities.map(activity => (
                    <View key={activity.id} style={{ backgroundColor: C.panel2, borderRadius: 13, padding: 12, marginBottom: 10 }}>
                      {activity.poster_url ? <Image source={{ uri: activity.poster_url }} style={{ width: '100%', height: 145, borderRadius: 10, marginBottom: 9 }} resizeMode="cover" /> : null}
                      <Text style={{ color: C.text, fontWeight: '900', fontSize: 14 }}>{activity.title}</Text>
                      {!!activity.description && <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>{activity.description}</Text>}
                      <Text style={{ color: C.gold, fontSize: 10, fontWeight: '800', marginTop: 8 }}>{String(activity.status || '').toUpperCase()}</Text>
                      {roomDetails?.owner_id === session?.user?.id && activity.status === 'published' && <TouchableOpacity onPress={() => completeRoomActivity(activity.id)} style={{ marginTop: 10, backgroundColor: '#244E43', borderRadius: 9, padding: 9, alignItems: 'center' }}><Text style={{ color: '#9CF0C9', fontSize: 11, fontWeight: '900' }}>Mark as completed</Text></TouchableOpacity>}
                    </View>
                  ))}
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
        Enter the password to {joinMode === 'tourist' ? 'visit' : 'join'}
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
        title={joiningRoom ? 'Please wait...' : joinMode === 'tourist' ? 'Visit as Tourist' : 'Join as Member'}
        onPress={() => joinMode === 'tourist' ? submitRoomVisit(joinTargetRoom, joinPassword) : submitRoomJoin(joinTargetRoom, joinPassword)}
        disabled={joiningRoom || !joinPassword.trim()}
      />

      <Button
        title="Visit as Tourist"
        secondary
        onPress={() => setJoinMode('tourist')}
        disabled={joiningRoom || joinMode === 'tourist'}
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
            
  async function exitCurrentRoom() {
    const roomId = selectedRoom?.id;
    const wasTourist = isRoomTourist;
    // Complete the server-side personal chat cutoff before allowing another room entry.
    // This prevents a fast re-entry from racing the leave request and loading stale chat.
    if (roomId) {
      try {
        await api(`/api/rooms/${roomId}/presence/leave`, { method: 'POST' });
      } catch (error) {
        console.log('Room exit cleanup error:', error.message);
        Alert.alert('Room exited', 'You left on this device, but server cleanup did not finish. Old chat may return until you reconnect.');
      }
    }
    // Clear local room UI after the personal cutoff is recorded.
    setShowRoomMenu(false);
    setShowRoomTools(false);
    setShowRoomGiftPanel(false);
    setShowRoomUsers(false);
    setShowRoomMessageMenu(false);
    setShowYoutubePanel(false);
    setIsOnMic(false);
    setMyMicSeat(null);
    setIsMicMuted(false);
    setIsRoomMinimized(false);
    setSelectedRoom(null);
    setMicSeats([]);
    setRoomPresence([]);
    setRoomChatMessages([]);
    setIsRoomTourist(false);
    ++micSeatLoadVersionRef.current;
    setScreen('main');

  }

  async function openRoomSettings(room) {
    if (!room?.id || room.owner_id !== session?.user?.id) {
      return Alert.alert('Room Settings', 'Only the original creator of this room can open these settings.');
    }

    // Open immediately with the room card data so the settings screen never
    // appears blank while the latest settings are being fetched.
    const initialRoom = {
      ...room,
      room_name: room.room_name || room.name || '',
      description: room.description || room.announcement || '',
      room_dp_url: room.room_dp_url || room.roomDpUrl || null
    };
    setRoomSettingsReturnScreen(screen === 'roomInterior' ? 'roomInterior' : 'main');
    setSelectedRoom(initialRoom);
    setRoomSettingsSubpage(null);
    setRoomSettingName(initialRoom.room_name);
    setRoomSettingAnnouncement(initialRoom.description);
    setRoomSettingDp(initialRoom.room_dp_url);
    setRoomSettingsPassword('');
    setRoomSettingsType(initialRoom.room_type || 'public');
    setTouristsOnMic(true);
    setTouristsSendText(true);
    setTouristsSendPic(false);
    setScreen('roomSettings');

    try {
      const result = await api(`/api/rooms/${room.id}/settings`);
      const latestRoom = {
        ...initialRoom,
        ...(result.room || {}),
        room_name: result.room?.room_name || initialRoom.room_name || 'Your Room',
        description: result.room?.description ?? initialRoom.description,
        room_dp_url: result.room?.room_dp_url ?? initialRoom.room_dp_url
      };
      setSelectedRoom(latestRoom);
      setTouristsOnMic(result.settings?.tourists_on_mic !== false);
      setTouristsSendText(result.settings?.tourists_send_text !== false);
      setTouristsSendPic(result.settings?.tourists_send_pic === true);
      setRoomSettingName(latestRoom.room_name);
      setRoomSettingAnnouncement(latestRoom.description || '');
      setRoomSettingDp(latestRoom.room_dp_url || null);
      setRoomSettingsType(latestRoom.room_type || 'public');
    } catch (e) {
      Alert.alert('Room Settings', e.message || 'Could not load room settings. You can still view the room details already loaded.');
    }
  }

  async function saveRoomSettings() {
    if (!selectedRoom?.id || selectedRoom.owner_id !== session?.user?.id) return;
    if (!roomSettingName.trim()) return Alert.alert('Room name required', 'Enter a room name.');
    try {
      setRoomSettingSaving(true);
      let roomDpUrl = roomSettingDp;
      if (roomDpUrl && !roomDpUrl.startsWith('http')) {
        const response = await fetch(roomDpUrl);
        const bytes = await response.arrayBuffer();
        const path = `${session.user.id}/rooms/${selectedRoom.id}/${Date.now()}.jpg`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
        if (error) throw error;
        roomDpUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      const result = await api(`/api/rooms/${selectedRoom.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({ roomName: roomSettingName.trim(), announcement: roomSettingAnnouncement, roomDpUrl,
          roomType: roomSettingsType, password: roomSettingsPassword || undefined,
          touristsOnMic, touristsSendText, touristsSendPic })
      });
      setSelectedRoom(old => ({ ...old, ...result.room }));
      setRoomDetails(old => old?.id === selectedRoom.id ? { ...old, ...result.room, announcement: result.room.description } : old);
      setRoomSettingDp(result.room.room_dp_url || null); setRoomSettingsPassword('');
      await Promise.all([loadMyRooms(), loadPublicRooms()]);
      Alert.alert('Saved', 'Your room settings have been updated.');
    } catch (e) { Alert.alert('Save failed', e.message); }
    finally { setRoomSettingSaving(false); }
  }

  async function loadRoomSettingsSubpage(page) {
    setRoomSettingsSubpage(page);
    try {
      const suffix = page === 'admins' ? 'admins' : page === 'kicklist' ? 'kicklist' : 'members';
      const result = await api(`/api/rooms/${selectedRoom.id}/${suffix}`);
      if (page === 'admins') setRoomSettingAdmins(result.admins || []);
      else if (page === 'kicklist') setRoomSettingKicked(result.kicked || []);
      else setRoomSettingMembers(result.members || []);
    } catch (e) { Alert.alert('Room Management', e.message); }
  }

  async function addRoomAdmin(userId) {
    try {
      await api(`/api/rooms/${selectedRoom.id}/admins`, { method: 'POST', body: JSON.stringify({ userId }) });
      Alert.alert('Administrator added', 'This member is now a room administrator.');
      await loadRoomSettingsSubpage('admins');
    } catch (e) { Alert.alert('Could not add administrator', e.message); }
  }

  async function chooseRoomActivityPoster() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission required', 'Allow photo access to choose an activity poster.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.85 });
    if (!result.canceled && result.assets?.[0]?.uri) setRoomActivityPoster(result.assets[0].uri);
  }

  async function createAndPublishRoomActivity() {
    if (!roomActivityTitle.trim()) return Alert.alert('Title required', 'Enter an activity title.');
    try {
      setRoomActivitySaving(true);
      let posterUrl = roomActivityPoster;
      if (posterUrl && !posterUrl.startsWith('http')) {
        const response = await fetch(posterUrl);
        const bytes = await response.arrayBuffer();
        const path = `${session.user.id}/rooms/${selectedRoom.id}/activities/${Date.now()}.jpg`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
        if (error) throw error;
        posterUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      const created = await api(`/api/rooms/${selectedRoom.id}/activities`, {
        method: 'POST', body: JSON.stringify({ title: roomActivityTitle.trim(), description: roomActivityDescription, posterUrl })
      });
      await api(`/api/rooms/${selectedRoom.id}/activities/${created.activity.id}/publish`, { method: 'POST' });
      setShowRoomActivityComposer(false); setRoomActivityTitle(''); setRoomActivityDescription(''); setRoomActivityPoster(null);
      await loadRoomActivities(selectedRoom.id);
      Alert.alert('Published', 'Your room activity is now visible to room members. Its poster is locked.');
    } catch (e) { Alert.alert('Activity error', e.message); }
    finally { setRoomActivitySaving(false); }
  }

  async function removeRoomAdmin(userId) {
    try { await api(`/api/rooms/${selectedRoom.id}/admins/${userId}`, { method: 'DELETE' }); setRoomSettingAdmins(items => items.filter(x => x.user_id !== userId)); }
    catch (e) { Alert.alert('Admin List', e.message); }
  }
  async function unkickRoomMember(userId) {
    try { await api(`/api/rooms/${selectedRoom.id}/kicklist/${userId}`, { method: 'DELETE' }); setRoomSettingKicked(items => items.filter(x => x.user_id !== userId)); }
    catch (e) { Alert.alert('Kick List', e.message); }
  }
  async function kickRoomMember(userId) {
    Alert.alert('Kick member?', 'This member will be removed and blocked from rejoining until unblocked from the Kick List.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Kick', style: 'destructive', onPress: async () => {
        try { await api(`/api/rooms/${selectedRoom.id}/members/${userId}/kick`, { method: 'POST' }); setRoomSettingMembers(items => items.filter(x => x.user_id !== userId)); }
        catch (e) { Alert.alert('Kick failed', e.message); }
      }}
    ]);
  }
  async function completeRoomActivity(activityId) {
    try {
      await api(`/api/rooms/${selectedRoom.id}/activities/${activityId}/complete`, { method: 'POST' });
      await loadRoomActivities(selectedRoom.id);
    } catch (e) { Alert.alert('Activity', e.message); }
  }

  async function loadRoomActivities(roomId) {
    if (!roomId) return;
    setLoadingRoomActivities(true);
    try { const result = await api(`/api/rooms/${roomId}/activities`); setRoomActivities(result.activities || []); }
    catch (e) { setRoomActivities([]); console.log('Room activities:', e.message); }
    finally { setLoadingRoomActivities(false); }
  }


