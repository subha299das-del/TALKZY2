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
Dimensions,
  BackHandler,
  Keyboard

} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import RoomShortcutIcon from './RoomShortcutIcon';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import RoomMusicPanel from './RoomMusicPanel';
import RoomGames from './RoomGames';

WebBrowser.maybeCompleteAuthSession();
const MIC_ON_ICON = require('./assets/mic_on.png');
const MIC_REACTION_FACE_LABELS = ["Welcome", "Thanks", "Like", "Happy", "Gosh", "Wronged", "Nausea", "Left kiss", "Right kiss", "Money face", "Party", "Fear", "Silence", "Cry", "Naughty", "Sweat", "LOL", "Cool", "Angry"];

function MicReactionSticker({ emoji, size = 48, direction }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 2, duration: 380, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 3, duration: 420, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 380, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [motion]);
  const scale = motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.92, 1.16, 0.98, 1.08] });
  const lift = motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [2, -5, 1, -2] });
  const tilt = motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: ["-4deg", "5deg", "-3deg", "2deg"] });
  return (
    <Animated.View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", transform: [{ translateY: lift }, { scale }, { rotate: tilt }, ...(direction === "left" ? [{ scaleX: -1 }] : [])] }}>
      <Text style={{ fontSize: size * 0.76, lineHeight: size, textAlign: "center", textShadowColor: "rgba(255,190,70,0.65)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }}>{emoji}</Text>
      <Text style={{ position: "absolute", top: 1, right: 1, fontSize: Math.max(8, size * 0.2), color: "#FFD778", textShadowColor: "#FF9F43", textShadowRadius: 5 }}>✦</Text>
    </Animated.View>
  );
}

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
  // Global TALKZY palette for screens outside the room interior.
  bg: '#080B18', panel: '#11172B', panel2: '#1A2340',
  text: '#F5F6FF', muted: '#9CA9C9',
  accent: '#9366FF', primary: '#9366FF', card: '#11172B',
  line: '#293453', danger: '#FF6685', gold: '#FFD27A',
  teal: '#43DCC5', pink: '#F27BC2', glow: 'rgba(147,102,255,0.22)'
};

// Room-only Black Marble Luxury palette. The main app theme remains unchanged.
const ROOM_C = {
  // Cool blue / cyan room palette inspired by the supplied room-interior reference.
  bg: '#061522', panel: '#0B2237', panel2: '#12334F',
  text: '#F0F8FF', muted: '#9CB9CC',
  accent: '#25A9D6', primary: '#25A9D6', card: '#0A1D30',
  line: '#24516D', danger: '#E46D83', gold: '#76D8F1',
  teal: '#4FE0D0', pink: '#9D9BFF', glow: 'rgba(37,169,214,0.22)'
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
  // Many authenticated actions already pass the current session token.
  // Avoid an additional Supabase session lookup when that header is present.
  const suppliedAuthorization =
    options.headers?.Authorization || options.headers?.authorization;
  let accessToken = null;

  if (!suppliedAuthorization) {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw new Error('Could not verify your login session.');
    }

    accessToken = sessionData?.session?.access_token;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
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
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('The request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}



function seatDisplayName(value, compact = false) {
  const name = String(value || 'User').trim() || 'User';
  if (!compact) return name;
  return name.split(/\\s+/).filter(Boolean).slice(0, 2).join(' ');
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

const ROOM_GAME_OPTIONS = [
  { name: 'Ludo', art: 'ludo' },
  { name: 'Carrom', art: 'carrom' },
  { name: 'Playcards – Breez', art: 'breez' },
  { name: 'UNO', art: 'uno' },
  { name: 'Monster Crush', art: 'monster' },
  { name: 'Truth and Dare', art: 'truth' },
  { name: 'Snakes and Ladders', art: 'snake' },
  { name: 'Jackaroo', art: 'jackaroo' },
  { name: 'Brainstorm', art: 'brain' },
  { name: '29', art: 'twentynine' }
];

function RoyalGameArtwork({ art }) {
  const gold = '#E8C477';
  const pale = '#F6E7C4';
  const gem = (color, size = 12) => (
    <View style={{ width: size, height: size, backgroundColor: color, borderWidth: 1, borderColor: '#F7DFA5', borderRadius: 3, transform: [{ rotate: '45deg' }], margin: 3 }} />
  );
  if (art === 'ludo') return (
    <View style={{ width: 48, height: 48, borderWidth: 2, borderColor: gold, borderRadius: 10, backgroundColor: '#21182B', padding: 6, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>
      {['#D94B58', '#4E91D6', '#55B879', '#E6B94F'].map((color, i) => <View key={i} style={{ width: 12, height: 12, borderRadius: 7, backgroundColor: color, borderWidth: 1.5, borderColor: '#F8E4B2' }} />)}
      <View style={{ position: 'absolute', width: 15, height: 15, backgroundColor: '#F1E2C1', borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: gold }}><Text style={{ color: '#261B2D', fontSize: 10, fontWeight: '900' }}>✦</Text></View>
    </View>
  );
  if (art === 'carrom') return (
    <View style={{ width: 50, height: 50, borderRadius: 9, borderWidth: 2, borderColor: gold, backgroundColor: '#3A2419', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: '#D6A85B', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 14, height: 14, borderRadius: 8, backgroundColor: '#E8C477', borderWidth: 2, borderColor: '#FFF0C7' }} />
        <View style={{ position: 'absolute', top: 3, left: 5, width: 7, height: 7, borderRadius: 5, backgroundColor: '#171018', borderWidth: 1, borderColor: gold }} />
        <View style={{ position: 'absolute', bottom: 3, right: 5, width: 7, height: 7, borderRadius: 5, backgroundColor: '#171018', borderWidth: 1, borderColor: gold }} />
      </View>
    </View>
  );
  if (art === 'breez') return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 27, height: 39, borderRadius: 5, backgroundColor: '#D9C39A', borderWidth: 1.5, borderColor: gold, transform: [{ rotate: '-17deg' }], left: 4, top: 6 }} />
      <View style={{ position: 'absolute', width: 27, height: 39, borderRadius: 5, backgroundColor: '#F4E9D2', borderWidth: 1.5, borderColor: gold, transform: [{ rotate: '15deg' }], right: 4, top: 6 }} />
      <View style={{ width: 27, height: 39, borderRadius: 5, backgroundColor: '#21172C', borderWidth: 1.5, borderColor: '#F1D38C', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: gold, fontSize: 17, fontWeight: '900' }}>A</Text><Text style={{ color: '#D9B76D', fontSize: 13 }}>♠</Text>
      </View>
    </View>
  );
  if (art === 'uno') return (
    <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: gold, backgroundColor: '#21172C', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 6, left: 17 }}>{gem('#D94B58', 10)}</View>
      <View style={{ position: 'absolute', top: 17, right: 5 }}>{gem('#4E91D6', 10)}</View>
      <View style={{ position: 'absolute', bottom: 6, left: 17 }}>{gem('#55B879', 10)}</View>
      <View style={{ position: 'absolute', top: 17, left: 5 }}>{gem('#E6B94F', 10)}</View>
      <Text style={{ color: gold, fontSize: 13, fontWeight: '900' }}>✦</Text>
    </View>
  );
  if (art === 'monster') return (
    <View style={{ width: 49, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 1, left: 7, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 3, borderBottomWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: gold, transform: [{ rotate: '-22deg' }] }} />
      <View style={{ position: 'absolute', top: 1, right: 7, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 8, borderBottomWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: gold, transform: [{ rotate: '22deg' }] }} />
      <View style={{ width: 40, height: 38, borderRadius: 15, backgroundColor: '#4B2A62', borderWidth: 2, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ width: 7, height: 9, borderRadius: 5, backgroundColor: '#F4E8C9' }} /><View style={{ width: 7, height: 9, borderRadius: 5, backgroundColor: '#F4E8C9' }} /></View>
        <View style={{ width: 15, height: 4, borderBottomWidth: 2, borderColor: '#F4E8C9', borderRadius: 8, marginTop: 5 }} />
      </View>
    </View>
  );
  if (art === 'truth') return (
    <View style={{ width: 49, height: 49, borderRadius: 25, borderWidth: 3, borderColor: gold, backgroundColor: '#302044', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 37, height: 37, borderRadius: 20, borderWidth: 1, borderColor: '#A9844D' }} />
      <Text style={{ color: pale, fontSize: 24, fontWeight: '900' }}>?</Text><Text style={{ position: 'absolute', bottom: 1, right: 5, color: gold, fontSize: 12 }}>✦</Text>
    </View>
  );
  if (art === 'snake') return (
    <View style={{ width: 52, height: 50, borderRadius: 9, borderWidth: 2, borderColor: gold, backgroundColor: '#21172C', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 12, top: 8, width: 22, height: 33, borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#D9B66D', justifyContent: 'space-evenly' }}>
        {[0,1,2,3].map(i => <View key={i} style={{ height: 2, backgroundColor: '#D9B66D' }} />)}
      </View>
      <Text style={{ color: '#6FC18B', fontSize: 27, fontWeight: '900', textShadowColor: '#D9B66D', textShadowRadius: 5 }}>S</Text>
    </View>
  );
  if (art === 'jackaroo') return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 40, height: 40, borderRadius: 9, backgroundColor: '#1E1828', borderWidth: 2, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: pale, fontSize: 18, fontWeight: '900' }}>♠</Text>
        <View style={{ position: 'absolute', top: 4, left: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#D94B58' }} />
        <View style={{ position: 'absolute', top: 4, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#4E91D6' }} />
        <View style={{ position: 'absolute', bottom: 4, left: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#55B879' }} />
        <View style={{ position: 'absolute', bottom: 4, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E6B94F' }} />
      </View>
    </View>
  );
  if (art === 'brain') return (
    <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: gold, backgroundColor: '#302044', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#E7C477', fontSize: 28, fontWeight: '900' }}>Ψ</Text>
      <Text style={{ position: 'absolute', top: 1, right: 5, color: pale, fontSize: 12 }}>✦</Text>
    </View>
  );
  return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 30, height: 41, borderRadius: 5, backgroundColor: '#E8D8B8', borderWidth: 1.5, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#25182E', fontSize: 10, fontWeight: '900' }}>29</Text><Text style={{ color: '#9B3443', fontSize: 17 }}>♥</Text>
      </View>
      <Text style={{ position: 'absolute', right: 1, bottom: 1, color: gold, fontSize: 16 }}>♠</Text>
    </View>
  );
}

export default function App() {
  // ---------------------------------
  // MAIN APP STATES
  // ---------------------------------

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const profileLoadRef = useRef(null);
  const activeAuthUserIdRef = useRef(null);
  const authStateVersionRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [screen, setScreen] = useState('login');
 const [selectedOfficialEvent, setSelectedOfficialEvent] = useState(null);
 const [showHotEventsPopup, setShowHotEventsPopup] = useState(false);
 const [eventFrontReturnScreen, setEventFrontReturnScreen] = useState('roomInterior');
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
 const [showRoomSettingsPasswordPopup, setShowRoomSettingsPasswordPopup] = useState(false);
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
  const [showCreateRoomPasswordPopup, setShowCreateRoomPasswordPopup] = useState(false);

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [pendingGameEntryName, setPendingGameEntryName] = useState(null);
  const [roomDpUri, setRoomDpUri] = useState(null);
const [roomDpUploading, setRoomDpUploading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const selectedRoomIdRef = useRef(null);
  selectedRoomIdRef.current = selectedRoom?.id || null;
  const roomDetailsIdRef = useRef(null);
  roomDetailsIdRef.current = roomDetails?.id || null;
  const activeUserIdRef = useRef(null);
  activeUserIdRef.current = session?.user?.id || null;
  const roomDetailsLoadVersionRef = useRef(0);
  const roomActivityLoadVersionRef = useRef(0);
  const roomSettingsLoadVersionRef = useRef(0);
  const [worldLuckyBagNotification, setWorldLuckyBagNotification] = useState(null);
const [worldLuckyBagQueue, setWorldLuckyBagQueue] = useState([]);
 const [isRoomMinimized, setIsRoomMinimized] = useState(false);
 const [showRoomMenu, setShowRoomMenu] = useState(false);
 const [isOnMic, setIsOnMic] = useState(false);
 const [myMicSeat, setMyMicSeat] = useState(null);
 const [isMicMuted, setIsMicMuted] = useState(false);
 const [showMicEmojiPicker, setShowMicEmojiPicker] = useState(false);
 const [showMicChatPopup, setShowMicChatPopup] = useState(false);
 const [showRoomChatComposer, setShowRoomChatComposer] = useState(false);
 const roomChatInputRef = useRef(null);
 const roomChatKeyboardShownRef = useRef(false);
 useEffect(() => {
   const keyboardShown = Keyboard.addListener('keyboardDidShow', () => {
     roomChatKeyboardShownRef.current = true;
   });
   const keyboardHidden = Keyboard.addListener('keyboardDidHide', () => {
     // Android can emit keyboardDidHide while the Modal is mounting.
     // Ignore that initial event; only close after this composer actually showed the keyboard.
     if (showRoomChatComposer && roomChatKeyboardShownRef.current) {
       roomChatKeyboardShownRef.current = false;
       setShowRoomChatComposer(false);
       setShowRoomChatActionMenu(false);
     }
   });
   return () => {
     keyboardShown.remove();
     keyboardHidden.remove();
   };
 }, [showRoomChatComposer]);
 const [showRoomChatActionMenu, setShowRoomChatActionMenu] = useState(false);
 const [isRoomChatMinimized, setIsRoomChatMinimized] = useState(false);
 const [roomReactions, setRoomReactions] = useState([]);
 const roomReactionChannelRef = useRef(null);
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
const micSeatActionVersionRef = useRef(0);
const micSeatActionInFlightRef = useRef(0);
const micSeatActionWaitersRef = useRef([]);

function beginMicSeatAction() {
  micSeatActionInFlightRef.current += 1;
}

function endMicSeatAction() {
  micSeatActionInFlightRef.current = Math.max(0, micSeatActionInFlightRef.current - 1);
  if (micSeatActionInFlightRef.current === 0) {
    micSeatActionWaitersRef.current.splice(0).forEach(resolve => resolve());
  }
}

function waitForMicSeatActions() {
  if (micSeatActionInFlightRef.current === 0) return Promise.resolve();
  return new Promise(resolve => micSeatActionWaitersRef.current.push(resolve));
}
const roomLeaveCleanupRef = useRef({});
const roomExitInProgressRef = useRef({});
const roomChatLocalCutoffRef = useRef({});
const roomChatActiveRoomIdRef = useRef(null);
const roomChatLoadVersionRef = useRef(0);
const worldLuckyBagSeenRef = useRef(new Set());
 const [showMicCountPicker, setShowMicCountPicker] = useState(false);
 const [micLayout, setMicLayout] = useState('eight');
 const MIC_LAYOUTS = {
 seven:{count:7,label:'7 Mics',rows:[[1,2],[3,4,5,6,7]]}, eight:{count:8,label:'8 Mics',rows:[[1,2,3,4],[5,6,7,8]]},
 ten_couple:{count:10,label:'10 Mics · Couple',rows:[[1,2],[3,4,5,6],[7,8,9,10]]}, ten_standard:{count:10,label:'10 Mics · Standard',rows:[[1,2,3,4,5],[6,7,8,9,10]]},
 eleven:{count:11,label:'11 Mics',rows:[[1],[2,3,4,5,6],[7,8,9,10,11]]}, twelve:{count:12,label:'12 Mics',rows:[[1,2],[3,4,5,6,7],[8,9,10,11,12]]},
 fourteen:{count:14,label:'14 Mics',rows:[[1,2],[3,4,5,6],[7,8,9,10],[11,12,13,14]]},
 seventeen:{count:17,label:'17 Mics',rows:[[1,2],[3,4,5,6,7],[8,9,10,11,12],[13,14,15,16,17]]}
 };

 
async function loadRoomMicSeats(roomId) {
  const requestUserId = activeAuthUserIdRef.current;
  if (!roomId || roomChatActiveRoomIdRef.current !== roomId || !requestUserId) return;

  const requestVersion = ++micSeatLoadVersionRef.current;
  const isCurrentRequest = () =>
    requestVersion === micSeatLoadVersionRef.current &&
    roomChatActiveRoomIdRef.current === roomId &&
    activeAuthUserIdRef.current === requestUserId;

  try {
    const result = await api(`/api/rooms/${roomId}/mic-seats`);

    // Ignore responses from an exited room, an old account, or an older seat request.
    if (!isCurrentRequest()) return;

    setMicCount(result.micCount || 8);
    setMicLayout(result.micLayout || 'eight');
    setMicSeats(result.seats || []);
    setMicControls(result.micControls || []);

    const myUserId = requestUserId;

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
    if (isCurrentRequest()) {
      console.log(
        'Microphone seats loading error:',
        error.message
      );
    }
  }
}

async function loadRoomPresence(roomId, showLoader = false) {
  const requestUserId = activeAuthUserIdRef.current;
  if (!roomId || selectedRoomIdRef.current !== roomId || !requestUserId) return;
  const isCurrentRequest = () =>
    selectedRoomIdRef.current === roomId &&
    activeAuthUserIdRef.current === requestUserId;
  if (showLoader) setRoomPresenceLoading(true);
  try {
    const result = await api(`/api/rooms/${roomId}/presence`);
    if (isCurrentRequest()) setRoomPresence(Array.isArray(result.users) ? result.users : []);
  } catch (error) {
    if (isCurrentRequest()) console.log('Room presence loading error:', error.message);
  } finally {
    if (showLoader && isCurrentRequest()) setRoomPresenceLoading(false);
  }
}

// WORLD LUCKY BAG BROADCAST RECEIVER (sender integration will publish on this channel)
useEffect(() => {
  if (!session?.user?.id) return;
  const notificationUserId = session.user.id;
  const channel = supabase.channel('talkzy-world-lucky-bag-notifications')
    .on('broadcast', { event: 'world_lucky_bag' }, ({ payload }) => {
      const bagId = String(payload?.id || '');
      if (!bagId || worldLuckyBagSeenRef.current.has(bagId)) return;
      worldLuckyBagSeenRef.current.add(bagId);
      (async () => {
        try {
          const { data: bag, error } = await supabase.from('talkzy_lucky_bags')
            .select('id,sender_id,room_id,scope,status,expires_at,total_coins')
            .eq('id', bagId).maybeSingle();
          if (error || !bag || bag.scope !== 'world' || bag.status !== 'active' ||
              new Date(bag.expires_at).getTime() <= Date.now() ||
              bag.sender_id === notificationUserId ||
              (payload.roomId && payload.roomId !== bag.room_id) ||
              activeAuthUserIdRef.current !== notificationUserId) {
            worldLuckyBagSeenRef.current.delete(bagId);
            return;
          }
          const { data: sender } = await supabase.from('talkzy_profiles')
            .select('display_name').eq('id', bag.sender_id).maybeSingle();
          if (activeAuthUserIdRef.current !== notificationUserId) {
            worldLuckyBagSeenRef.current.delete(bagId);
            return;
          }
          const cachedRoom = [rooms, joinedRooms, followedRooms, myRooms]
            .flat().find(item => item?.id === bag.room_id) || null;
          const roomFromPayload = payload.room?.id === bag.room_id ? payload.room : null;
          const nextNotification = {
            id: bag.id,
            senderName: sender?.display_name || 'TALKZY User',
            coinAmount: Number(bag.total_coins || 0),
            roomNumber: cachedRoom?.room_talkzy_id || cachedRoom?.room_name || roomFromPayload?.room_talkzy_id || roomFromPayload?.room_name || 'Room',
            roomId: bag.room_id,
            room: cachedRoom || roomFromPayload
          };
          setWorldLuckyBagNotification(current => {
            if (!current) return nextNotification;
            setWorldLuckyBagQueue(queue => queue.length < 20 ? [...queue, nextNotification] : queue);
            return current;
          });
        } catch (validationError) {
          worldLuckyBagSeenRef.current.delete(bagId);
          console.log('World Lucky Bag notification validation:', validationError.message);
        }
      })();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [session?.user?.id, rooms, joinedRooms, followedRooms, myRooms]);

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

// // APP-WIDE ANDROID BACK: mirror each screen's Back/Close behaviour.
// Native Modal components continue to use their own onRequestClose handlers.
// The shared YouTube player is intentionally excluded: Android Back must not
// invoke its main Close action.
useEffect(() => {
  const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
    // First dismiss the topmost open popup/panel. Only a subsequent Back
    // press may open the room Minimize / Exit menu.
    if (showRoomTools) { setShowRoomTools(false); return true; }
    if (showSpecialEffectSettings) { setShowSpecialEffectSettings(false); return true; }
    if (showRoomChatComposer) {
      Keyboard.dismiss();
      setShowRoomChatComposer(false);
      setShowRoomChatActionMenu(false);
      return true;
    }
    if (showRoomChatActionMenu) { setShowRoomChatActionMenu(false); return true; }
    if (showRoomShortcutsPage) { setShowRoomShortcutsPage(false); return true; }
    if (showMicEmojiPicker) { setShowMicEmojiPicker(false); return true; }
    if (showMicControlPopup) { setShowMicControlPopup(false); return true; }
    if (showRoomUsers) { setShowRoomUsers(false); return true; }
    if (showMicCountPicker) { setShowMicCountPicker(false); return true; }
    if (showRoomMessageMenu) { setShowRoomMessageMenu(false); return true; }
    if (showRoomInfo) { setShowRoomInfo(false); return true; }
    if (showRoomGiftQuantityOptions) { setShowRoomGiftQuantityOptions(false); return true; }
    if (showRoomGiftPanel) { setShowRoomGiftPanel(false); return true; }
    if (showGreedyPanel) { setShowGreedyPanel(false); return true; }
    if (showRoomGamePanel) { setShowRoomGamePanel(false); return true; }
    if (showRocketPanel) { setShowRocketPanel(false); return true; }
    if (showRoomThemeMenu) { setShowRoomThemeMenu(false); return true; }
    if (showLuckyBagOpenPopup) { setShowLuckyBagOpenPopup(false); return true; }
    if (showLuckyBagPopup) { setShowLuckyBagPopup(false); return true; }
    if (showHotEventsPopup) { setShowHotEventsPopup(false); return true; }
    if (showJoinPassword) { setShowJoinPassword(false); return true; }
    if (roomDetailsVisible) { setRoomDetailsVisible(false); return true; }
    if (showRoomMenu) { setShowRoomMenu(false); return true; }
    if (showMicChatPopup) { setShowMicChatPopup(false); return true; }
    if (showYoutubeVolumePopup) { setShowYoutubeVolumePopup(false); return true; }
    if (showYoutubeQueuePopup) { setShowYoutubeQueuePopup(false); return true; }
    if (showYoutubePicker) { setShowYoutubePicker(false); return true; }
    if (showYoutubePanel) { setShowYoutubePanel(false); return true; }
    if (showMusicPanel) { setShowMusicPanel(false); return true; }
    if (showRoomActivityComposer) { setShowRoomActivityComposer(false); return true; }
    if (showEventPreview) { setShowEventPreview(false); return true; }
    if (showCountryRooms) { setShowCountryRooms(false); return true; }
    if (showCountryRegion) { setShowCountryRegion(false); return true; }
    if (showMySubscription) { setShowMySubscription(false); return true; }
    if (showCreateRoomActivity) { setShowCreateRoomActivity(false); return true; }
    if (showPosterOptions) { setShowPosterOptions(false); return true; }
    if (showPosterTemplates) { setShowPosterTemplates(false); return true; }
    if (showPosterEditor) { setShowPosterEditor(false); return true; }
    if (showCreateRoomPasswordPopup) { setShowCreateRoomPasswordPopup(false); return true; }
    if (showCreateRoom) { setShowCreateRoom(false); return true; }
    if (eventInfoPopup) { setEventInfoPopup(null); return true; }

    if (selectedRoom?.id && screen === 'roomInterior') {
      // Android system Back opens the room's Minimize / Exit menu.
      // Do not route it to the separate chat-options menu.
      setShowRoomMenu(true);
      return true;
    }

    // Full-page flows: mirror their visible Back navigation.
    if (screen === 'eventDetail') {
      setScreen('eventFront');
      return true;
    }
    if (screen === 'eventFront') {
      setScreen(eventFrontReturnScreen || 'roomInterior');
      return true;
    }
    if (screen === 'eventManagement') {
      setScreen('eventManagementList');
      return true;
    }
    if (screen === 'eventManagementList' || screen === 'hotRooms' || screen === 'newRooms' || screen === 'createRoom') {
      setScreen('main');
      return true;
    }
    if (screen === 'roomSettings') {
      setScreen(roomSettingsReturnScreen || 'main');
      return true;
    }
    if (screen !== 'main' && screen !== 'login' && screen !== 'roomInterior') {
      setScreen('main');
      return true;
    }
    if (screen === 'main' && activeTab !== 'Room') {
      setActiveTab('Room');
      return true;
    }
    return false;
  });
  return () => subscription.remove();
}, [
  selectedRoom?.id, screen, eventFrontReturnScreen, roomSettingsReturnScreen, activeTab,
  showRoomTools, showSpecialEffectSettings, showRoomChatComposer, showRoomChatActionMenu,
  showRoomShortcutsPage, showMicEmojiPicker, showMicControlPopup, showRoomUsers,
  showMicCountPicker, showRoomMessageMenu, showRoomInfo, showRoomGiftQuantityOptions,
  showRoomGiftPanel, showGreedyPanel, showRoomGamePanel, showRocketPanel,
  showRoomThemeMenu, showLuckyBagPopup, showHotEventsPopup, showJoinPassword,
  roomDetailsVisible, showRoomMenu, showMicChatPopup, showYoutubeVolumePopup,
  showYoutubeQueuePopup, showYoutubePicker, showYoutubePanel, showMusicPanel,
  showRoomActivityComposer, showEventPreview, showCountryRooms, showCountryRegion,
  showMySubscription, showCreateRoomActivity, showPosterOptions, showPosterTemplates,
  showPosterEditor, showCreateRoomPasswordPopup, showCreateRoom, eventInfoPopup
]);

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
      payload => {
        if (payload?.new?.status && payload.new.status !== 'active') {
          if (selectedRoom?.id === roomId && !roomExitInProgressRef.current[roomId]) {
            exitCurrentRoom();
            Alert.alert('Room Closed', 'The Main Owner has closed this room.');
          }
          return;
        }
        loadRoomMicSeats(roomId);
      }
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

// ROOM-WIDE MIC REACTIONS: ephemeral broadcast, visible to everyone in this room.
function displayRoomReaction(payload) {
  if (!payload?.userId || !payload?.emoji) return;
  const reaction = {
    ...payload,
    id: payload.reactionId || `${payload.userId}-${Date.now()}`,
    progress: new Animated.Value(0)
  };
  setRoomReactions(current => [...current.filter(item => item.userId !== reaction.userId), reaction]);
  Animated.timing(reaction.progress, { toValue: 1, duration: 3000, useNativeDriver: true }).start();
  setTimeout(() => setRoomReactions(current => current.filter(item => item.id !== reaction.id)), 3000);
}

useEffect(() => {
  if (!selectedRoom?.id) {
    roomReactionChannelRef.current = null;
    setRoomReactions([]);
    return;
  }
  const channel = supabase.channel(`room-mic-reactions-${selectedRoom.id}`);
  channel.on('broadcast', { event: 'mic_reaction' }, ({ payload }) => {
    if (payload?.roomId === selectedRoom.id) displayRoomReaction(payload);
  }).subscribe(status => {
    if (status === 'SUBSCRIBED') roomReactionChannelRef.current = channel;
    if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      if (roomReactionChannelRef.current === channel) roomReactionChannelRef.current = null;
    }
  });
  return () => {
    if (roomReactionChannelRef.current === channel) roomReactionChannelRef.current = null;
    setRoomReactions([]);
    supabase.removeChannel(channel);
  };
}, [selectedRoom?.id]);

useEffect(() => {
  if (!isOnMic) {
    setShowMicEmojiPicker(false);
    setShowMicChatPopup(false);
  }
}, [isOnMic]);

async function sendRoomReaction(reaction) {
  if (!isOnMic || !selectedRoom?.id || !session?.user?.id) return;
  const payload = {
    roomId: selectedRoom.id,
    reactionId: `${session.user.id}-${Date.now()}`,
    userId: session.user.id,
    displayName: profile?.display_name || displayName || 'TALKZY User',
    avatarUrl: profile?.avatar_url || avatarUri || null,
    emoji: reaction.emoji,
    label: reaction.label || null,
    direction: reaction.direction || null
  };
  displayRoomReaction(payload);
  try {
    const channel = roomReactionChannelRef.current;
    if (channel) await channel.send({ type: 'broadcast', event: 'mic_reaction', payload });
  } catch (error) {
    console.log('Mic reaction broadcast error:', error?.message || error);
  }
  setShowMicEmojiPicker(false);
}

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
      if (active && selectedRoom?.id === roomId && /room is closed/i.test(error?.message || '') && !roomExitInProgressRef.current[roomId]) {
        exitCurrentRoom();
        Alert.alert('Room Closed', 'The Main Owner has closed this room.');
        return;
      }
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
const [showSpecialEffectSettings, setShowSpecialEffectSettings] = useState(false);
const [enterRoomEffectEnabled, setEnterRoomEffectEnabled] = useState(false);
const [giftEffectEnabled, setGiftEffectEnabled] = useState(false);
const [giftBannerEnabled, setGiftBannerEnabled] = useState(false);
const [showLuckyBagPopup, setShowLuckyBagPopup] = useState(false);
const [showLuckyBagOpenPopup, setShowLuckyBagOpenPopup] = useState(false);
const [selectedLuckyBag, setSelectedLuckyBag] = useState(null);
const [luckyBagTab, setLuckyBagTab] = useState('Room');
const [luckyBagCoins, setLuckyBagCoins] = useState(20000);
const [luckyBagQuantity, setLuckyBagQuantity] = useState(3);
const [luckyBagCustomCoins, setLuckyBagCustomCoins] = useState('500');
const [luckyBagHistoryView, setLuckyBagHistoryView] = useState(false);
const [walletBalance, setWalletBalance] = useState(0);
const [luckyBagHistoryItems, setLuckyBagHistoryItems] = useState([]);
const [luckyBagHistoryLoading, setLuckyBagHistoryLoading] = useState(false);
const [luckyBagSending, setLuckyBagSending] = useState(false);
const [activeLuckyBags, setActiveLuckyBags] = useState([]);
const luckyBagAutoOpenedRef = useRef(new Set());
const [claimingLuckyBagId, setClaimingLuckyBagId] = useState(null);
const luckyBagPulse = useRef(new Animated.Value(1)).current;
useEffect(() => { const pulse = Animated.loop(Animated.sequence([Animated.timing(luckyBagPulse, { toValue: 1.06, duration: 850, useNativeDriver: true }), Animated.timing(luckyBagPulse, { toValue: 1, duration: 850, useNativeDriver: true })])); pulse.start(); return () => pulse.stop(); }, [luckyBagPulse]);
async function loadLuckyBagHistory() {
  const uid = session?.user?.id;
  if (!uid) return;
  const isCurrentUserRequest = () => activeAuthUserIdRef.current === uid;
  setLuckyBagHistoryLoading(true);
  try {
    const [{data:ledger,error:ledgerError},{data:sent,error:sentError},{data:claims,error:claimsError}] = await Promise.all([
      supabase.from('talkzy_coin_ledger').select('id,amount,balance_after,event_type,reference_id,note,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(100),
      supabase.from('talkzy_lucky_bags').select('id,sender_id,room_id,scope,total_coins,remaining_coins,remaining_bags,status,created_at,expires_at').eq('sender_id',uid).order('created_at',{ascending:false}).limit(50),
      supabase.from('talkzy_lucky_bag_claims').select('id,bag_id,claimer_id,reward_coins,claimed_at').eq('claimer_id',uid).order('claimed_at',{ascending:false}).limit(50)
    ]);
    if(ledgerError) throw ledgerError;
    if(sentError) throw sentError;
    if(claimsError) throw claimsError;
    if (!isCurrentUserRequest()) return;
    const sentBagIds=(sent||[]).map(x=>x.id);
    let sentClaims=[];
    if(sentBagIds.length) {
      const {data,error}=await supabase.from('talkzy_lucky_bag_claims').select('bag_id,claimer_id,reward_coins,claimed_at').in('bag_id',sentBagIds).order('claimed_at',{ascending:false});
      if(error) throw error;
      sentClaims=data||[];
      if (!isCurrentUserRequest()) return;
    }
    const bagIds=[...new Set([...(sent||[]).map(x=>x.id),...(claims||[]).map(x=>x.bag_id)])];
    let bagDetails=[];
    if(bagIds.length) {
      const {data,error}=await supabase.from('talkzy_lucky_bags').select('id,sender_id,room_id,scope,total_coins,status,created_at').in('id',bagIds);
      if(error) throw error;
      bagDetails=data||[];
      if (!isCurrentUserRequest()) return;
    }
    const profileIds=[...new Set([...bagDetails.map(x=>x.sender_id),...sentClaims.map(x=>x.claimer_id)])];
    let names={};
    if(profileIds.length) {
      const {data,error}=await supabase.from('talkzy_profiles').select('id,display_name').in('id',profileIds);
      if(error) throw error;
      names=Object.fromEntries((data||[]).map(p=>[p.id,p.display_name||'TALKZY User']));
      if (!isCurrentUserRequest()) return;
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
    if (isCurrentUserRequest()) setLuckyBagHistoryItems(events.slice(0,100));
  } catch(error) {
    if (isCurrentUserRequest()) Alert.alert('History unavailable',error?.message||'Please try again.');
  } finally {
    if (isCurrentUserRequest()) setLuckyBagHistoryLoading(false);
  }
}

async function refreshActiveLuckyBags() {
  const roomId = selectedRoom?.id;
  const userId = session?.user?.id;
  if (!userId || !roomId) { setActiveLuckyBags([]); return; }
  const isCurrentRequest = () => selectedRoomIdRef.current === roomId && activeUserIdRef.current === userId;
  try {
    const nowIso = new Date().toISOString();
    const { data: bags, error } = await supabase.from('talkzy_lucky_bags')
      .select('id,sender_id,room_id,scope,total_coins,remaining_coins,remaining_bags,expires_at,created_at')
      .eq('status','active').gt('expires_at',nowIso)
      .or('room_id.eq.' + roomId + ',scope.eq.world')
      .order('created_at',{ascending:false}).limit(20);
    if (error) throw error;
    if (!isCurrentRequest()) return;
    const list = bags || [];
    if (!list.length) { setActiveLuckyBags([]); return; }
    const senderIds = [...new Set(list.map(b => b.sender_id))];
    const bagIds = list.map(b => b.id);
    const [{ data: profiles }, { data: claims }] = await Promise.all([
      supabase.from('talkzy_profiles').select('id,display_name').in('id',senderIds),
      supabase.from('talkzy_lucky_bag_claims').select('bag_id').eq('claimer_id',userId).in('bag_id',bagIds)
    ]);
    if (!isCurrentRequest()) return;
    const nameMap = new Map((profiles || []).map(p => [p.id,p.display_name]));
    const claimed = new Set((claims || []).map(x => x.bag_id));
    const nextBags = list.map(b => ({...b,senderName:nameMap.get(b.sender_id) || 'TALKZY User',alreadyClaimed:claimed.has(b.id)}));
    const unseenBag = nextBags.find(b => !luckyBagAutoOpenedRef.current.has(b.id) && !b.alreadyClaimed);
    nextBags.forEach(b => luckyBagAutoOpenedRef.current.add(b.id));
    setActiveLuckyBags(nextBags);
    if (unseenBag && !showLuckyBagOpenPopup) { setSelectedLuckyBag(unseenBag); setShowLuckyBagOpenPopup(true); }
  } catch (error) {
    if (isCurrentRequest()) console.log('Lucky Bag refresh:',error.message);
  }
}

async function claimLuckyBag(bag) {
  if (!bag?.id || claimingLuckyBagId) return;
  if (bag.alreadyClaimed) return Alert.alert('Lucky Bag', 'You already opened this bag.');
  const requestUserId = activeAuthUserIdRef.current;
  if (!requestUserId) return;
  const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
  setClaimingLuckyBagId(bag.id);
  try {
    const {data,error}=await supabase.rpc('talkzy_lucky_bag_claim',{p_bag_id:bag.id});
    if(error) throw error;
    if (!isCurrentUserRequest()) return;
    if(data?.expired) {
      Alert.alert('Lucky Bag expired','Unclaimed coins are being refunded to the sender.');
    } else {
      setWalletBalance(Number(data?.balance ?? walletBalance));
      Alert.alert('Lucky Bag opened! 🎉','You received ' + Number(data?.reward_coins || 0).toLocaleString() + ' coins!');
    }
    await refreshActiveLuckyBags();
  } catch(error) {
    if (isCurrentUserRequest()) {
      Alert.alert('Could not open Lucky Bag',error?.message || 'Please try again.');
      await refreshActiveLuckyBags();
    }
  } finally {
    if (isCurrentUserRequest()) setClaimingLuckyBagId(null);
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
  const allowedCoins = luckyBagTab === 'Room' ? [20000,200000,400000,600000] : [1000000,2000000,4000000,6000000];
  const allowedQuantities = luckyBagTab === 'Room' ? [3,9,12,15] : [30,50,70,100];
  if (!allowedCoins.includes(amount) || !allowedQuantities.includes(quantity)) return Alert.alert('Invalid selection', 'Choose one of the available coin and quantity options.');
  const total = amount * quantity;
  if (total > walletBalance) return Alert.alert('Insufficient coins', 'Your balance is ' + walletBalance.toLocaleString() + ' coins. You need ' + total.toLocaleString() + ' coins.');
  const requestUserId = session.user.id;
  const requestRoom = selectedRoom;
  const requestScope = luckyBagTab.toLowerCase();
  const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
  setLuckyBagSending(true);
  try {
    const { data, error } = await supabase.rpc('talkzy_lucky_bag_send', {
      p_room_id: requestRoom.id,
      p_scope: requestScope,
      p_coin_amount_per_bag: amount,
      p_bag_count: quantity
    });
    if (error) throw error;
    if (!isCurrentUserRequest()) return;
    setWalletBalance(Number(data?.balance ?? walletBalance - total));
    setShowLuckyBagPopup(false);
    luckyBagAutoOpenedRef.current.add(String(data?.bag_id || ''));
    const { data: createdBag, error: createdBagError } = await supabase.from('talkzy_lucky_bags').select('id,sender_id,room_id,scope,total_coins,remaining_coins,remaining_bags,expires_at,created_at').eq('id',data?.bag_id).maybeSingle();
    if (createdBagError) throw createdBagError;
    if (createdBag) { setSelectedLuckyBag({...createdBag,senderName:profile?.display_name || 'TALKZY User',alreadyClaimed:false}); setShowLuckyBagOpenPopup(true); }
    await refreshActiveLuckyBags();
    if (requestScope === 'world') {
      const tickerChannel = supabase.channel('talkzy-world-lucky-bag-notifications');
      tickerChannel.subscribe(status => {
        if (status === 'SUBSCRIBED') {
          tickerChannel.send({ type: 'broadcast', event: 'world_lucky_bag', payload: {
            id: data?.bag_id,
            senderName: profile?.display_name || 'TALKZY User',
            coinAmount: total,
            roomNumber: requestRoom.room_talkzy_id || requestRoom.room_name || 'Room',
            roomId: requestRoom.id,
            room: requestRoom
          }}).finally(() => supabase.removeChannel(tickerChannel));
        }
      });
    }
    Alert.alert('Lucky Bag sent! 🎉', total.toLocaleString() + ' coins deducted. Unclaimed coins will be refunded after 3 minutes.');
  } catch (error) {
    if (isCurrentUserRequest()) {
      Alert.alert('Could not send Lucky Bag', error?.message || 'Please try again.');
      const { data } = await supabase.from('talkzy_wallets').select('balance').eq('user_id', requestUserId).maybeSingle();
      if (isCurrentUserRequest() && data) setWalletBalance(Number(data.balance || 0));
    }
  } finally {
    if (isCurrentUserRequest()) setLuckyBagSending(false);
  }
}

const [showRoomThemeMenu, setShowRoomThemeMenu] = useState(false);
const [roomThemeTab, setRoomThemeTab] = useState('Theme');
const [roomThemePage, setRoomThemePage] = useState('catalog');
const [roomThemeDraftUri, setRoomThemeDraftUri] = useState(null);
const [roomThemeDuration, setRoomThemeDuration] = useState(7);
const [roomThemePreviewUri, setRoomThemePreviewUri] = useState(null);
const [roomThemeOwnItems, setRoomThemeOwnItems] = useState([]);
const [showYoutubePanel, setShowYoutubePanel] = useState(false);
const [showYoutubePicker, setShowYoutubePicker] = useState(false);
const [showYoutubeQueuePopup, setShowYoutubeQueuePopup] = useState(false);
const [showYoutubeVolumePopup, setShowYoutubeVolumePopup] = useState(false);
const [youtubePickedItem, setYoutubePickedItem] = useState(null);
const [showMusicPanel, setShowMusicPanel] = useState(false);
 const [musicMinimized, setMusicMinimized] = useState(false);
const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
const [youtubeBrowseTab, setYoutubeBrowseTab] = useState('All');
const [youtubeBrowseUrl, setYoutubeBrowseUrl] = useState('https://www.youtube.com/results?search_query=');
const [youtubeSelectedVideo, setYoutubeSelectedVideo] = useState(null);
const [youtubePreviewVideoId, setYoutubePreviewVideoId] = useState(null);
const youtubeBrowseWebViewRef = useRef(null);
const [youtubeState, setYoutubeState] = useState({ video_id: null, queue: [], is_playing: false, current_time_seconds: 0, updated_at: null });
const youtubeScreenVisible = Boolean(youtubeState.video_id || showYoutubePanel);
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
const [selectedRoomGift, setSelectedRoomGift] = useState('Rose');
const [roomGiftCategory, setRoomGiftCategory] = useState('Popular');
const [roomGiftQuantity, setRoomGiftQuantity] = useState('1');
const [showRoomGiftQuantityOptions, setShowRoomGiftQuantityOptions] = useState(false);
const [showGreedyPanel, setShowGreedyPanel] = useState(false);
const [showRoomGamePanel, setShowRoomGamePanel] = useState(false);
const [showRocketPanel, setShowRocketPanel] = useState(false);
const [treasureLevel, setTreasureLevel] = useState(1);
const [treasureRewardTab, setTreasureRewardTab] = useState('TOP 1');
const [showTreasureRules, setShowTreasureRules] = useState(false);
const [showRoomShortcutsPage, setShowRoomShortcutsPage] = useState(false);
const [roomShortcutCategory, setRoomShortcutCategory] = useState('Treasury');
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

  function resetAccountScopedUi() {
    setProfile(null);
    setMyRooms([]);
    setJoinedRooms([]);
    setFollowedRooms([]);
    setHasEverCreatedRoom(false);
    setRoomCreationEligibilityLoaded(false);
    setSelectedRoom(null);
    setRoomDetails(null);
    setRoomDetailsVisible(false);
    setRoomDetailMembers([]);
    setJoiningRoom(false);
    setSaving(false);
    setRoomDpUploading(false);
    setShowJoinPassword(false);
    setJoinPassword('');
    setJoinTargetRoom(null);
    setShowRoomMenu(false);
    setShowRoomTools(false);
    setShowRoomGiftPanel(false);
    setShowRoomThemeMenu(false);
    setShowRoomUsers(false);
    setShowRoomInfo(false);
    setShowRoomMessageMenu(false);
    setShowMicControlPopup(false);
    setShowMicEmojiPicker(false);
    setShowMicCountPicker(false);
    setShowRoomShortcutsPage(false);
    setShowLuckyBagPopup(false);
    setShowLuckyBagOpenPopup(false);
    setSelectedLuckyBag(null);
    setLuckyBagHistoryView(false);
    setShowYoutubePanel(false);
    setShowYoutubePicker(false);
    setShowMusicPanel(false);
    setMusicMinimized(false);
    setShowRoomActivityComposer(false);
    setShowCreateRoomActivity(false);
    setShowPosterOptions(false);
    setShowPosterTemplates(false);
    setShowPosterEditor(false);
    setMicGame(null);
    setShowRoomGamePanel(false);
    setShowGreedyPanel(false);
    setShowRocketPanel(false);
    setShowMicChatPopup(false);
    setIsRoomMinimized(false);
    setShowHotEventsPopup(false);
    setRoomChatMessages([]);
    setRoomChatText('');
    setShowRoomChatComposer(false);
    setShowRoomChatActionMenu(false);
    roomChatActiveRoomIdRef.current = null;
    ++roomChatLoadVersionRef.current;
    ++micSeatLoadVersionRef.current;
    ++micSeatActionVersionRef.current;
    setMicSeats([]);
    setMicControls([]);
    setMicCount(8);
    setMicLayout('eight');
    setIsOnMic(false);
    setMyMicSeat(null);
    setIsMicMuted(false);
    setRoomPresence([]);
    setRoomPresenceLoading(false);
    setIsRoomTourist(false);
    setActiveLuckyBags([]);
    setWalletBalance(0);
    setLuckyBagHistoryItems([]);
    setLuckyBagHistoryLoading(false);
    setLuckyBagSending(false);
    setClaimingLuckyBagId(null);
    setWorldLuckyBagNotification(null);
    setWorldLuckyBagQueue([]);
    setScreen('login');
  }

  useEffect(() => {
    let mounted = true;

    // Wake the Render backend while the login screen is opening.
    // This lets the service start before the user finishes signing in.
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});

    async function loadSession() {
      const requestAuthVersion = authStateVersionRef.current;
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

        if (!mounted || authStateVersionRef.current !== requestAuthVersion) return;

        activeAuthUserIdRef.current = currentSession?.user?.id || null;
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

    authStateVersionRef.current += 1;
    const nextUserId = newSession?.user?.id || null;
    const previousUserId = activeAuthUserIdRef.current;
    activeAuthUserIdRef.current = nextUserId;
    if (previousUserId && previousUserId !== nextUserId) {
      profileLoadRef.current = null;
      resetAccountScopedUi();
    }
    setSession(newSession);

    if (newSession) {
      Promise.resolve().then(() => {
        if (mounted && activeAuthUserIdRef.current === newSession.user.id) {
          loadUserProfile(newSession);
        }
      });
    } else {
      profileLoadRef.current = null;
      resetAccountScopedUi();
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
      const { data: privateProfile, error: privateProfileError } = await supabase
        .from('talkzy_profile_private')
        .select('date_of_birth')
        .eq('user_id', userId)
        .maybeSingle();
      if (privateProfileError) throw privateProfileError;
      const profileData = { ...(data || {}), date_of_birth: privateProfile?.date_of_birth || null };

      if (profileLoadRef.current?.promise !== loadPromise) {
        return;
      }

      // Check whether the profile is incomplete
      if (
        !data ||
        !profileData.display_name ||
        !profileData.gender ||
        !profileData.date_of_birth ||
        !profileData.country ||
        !profileData.language ||
        !profileData.bio
      ) {
        setProfile(data ? profileData : null);
        setScreen('profile');
        return;
      }

      // Load completed profile
      setProfile(profileData);
      setDisplayName(profileData.display_name || '');
      setGender(profileData.gender || 'Male');
      setDateOfBirth(profileData.date_of_birth || '');
      setCountry(profileData.country || 'India');
      setLanguage(profileData.language || 'English');
      setBio(profileData.bio || '');
      setAvatarUri(profileData.avatar_url || null);

      setScreen('main');

      loadPublicRooms();
      loadJoinedRooms(currentSession);
      loadFollowedRooms(currentSession);

    } catch (error) {
      if (profileLoadRef.current?.promise !== loadPromise || activeAuthUserIdRef.current !== userId) return;
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

    const userId = session?.user?.id;
    if (!userId) return Alert.alert('Session expired', 'Please sign in again.');
    const isCurrentUserRequest = () => activeAuthUserIdRef.current === userId;

    try {
      setSaving(true);

      const uploadedAvatar = await uploadAvatar(userId);
      if (!isCurrentUserRequest()) return;

      const publicProfileData = {
  display_name: displayName.trim(),
  gender,
  country: country.trim(),
  language: language.trim(),
  bio: bio.trim()
};

      if (uploadedAvatar) {
        publicProfileData.avatar_url = uploadedAvatar;
      }

      const { data, error } = await supabase
  .from('talkzy_profiles')
  .update(publicProfileData)
  .eq('id', userId)
  .select('*')
  .single();

      if (error) throw error;
      if (!isCurrentUserRequest()) return;
      const { error: privateProfileError } = await supabase
        .from('talkzy_profile_private')
        .upsert({ user_id: userId, date_of_birth: dateOfBirth }, { onConflict: 'user_id' });
      if (privateProfileError) throw privateProfileError;
      if (!isCurrentUserRequest()) return;

      const completedProfile = { ...data, date_of_birth: dateOfBirth };
      setProfile(completedProfile);
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
  if (!isCurrentUserRequest()) return;
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
  if (isCurrentUserRequest()) setSaving(false);
}
}

  // ---------------------------------
  // SIGN OUT
  // ---------------------------------

  async function signOut() {
    try {
      if (selectedRoom?.id) {
        try {
          await waitForMicSeatActions();
          await api(`/api/rooms/${selectedRoom.id}/presence/leave`, { method: 'POST' });
        } catch (cleanupError) { console.log('Sign-out room cleanup:', cleanupError.message); }
      }
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
  const requestVersion = ++roomDetailsLoadVersionRef.current;
  setRoomDetails(room);
  setRoomDetailsTab('Information');
  setMemberSearch('');
  setRoomDetailMembers([]);
  setRoomDetailsVisible(true);
  if (isRoomTourist || !session?.access_token || !room?.id) return;
  const userId = session.user.id;
  setLoadingRoomDetailMembers(true);
  try {
    const result = await api(`/api/rooms/${room.id}/members`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (roomDetailsLoadVersionRef.current !== requestVersion ||
        roomDetailsIdRef.current !== room.id || activeUserIdRef.current !== userId) return;
    setRoomDetailMembers(Array.isArray(result.members) ? result.members : []);
  } catch (error) {
    if (roomDetailsLoadVersionRef.current === requestVersion && roomDetailsIdRef.current === room.id) {
      Alert.alert('Room Members', error.message || 'Could not load room members.');
    }
  } finally {
    if (roomDetailsLoadVersionRef.current === requestVersion) setLoadingRoomDetailMembers(false);
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

function openHotEventFront(event) {
  setSelectedOfficialEvent(event);
  setActiveEventSection('rank');
  setEventFrontReturnScreen('roomInterior');
  setShowHotEventsPopup(false);
  setScreen('eventFront');
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
  const requestUserId = currentSession.user.id;
  if (activeAuthUserIdRef.current && activeAuthUserIdRef.current !== requestUserId) return;
  const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;

  const cacheKey = `talkzy_my_rooms_${requestUserId}`;

  // Render cached room details immediately while the server request runs.
  // This prevents the user's room name/card from waiting for a cold backend.
  let hasCachedData = false;
  try {
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (!isCurrentUserRequest()) return;
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

    if (!isCurrentUserRequest()) return;
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
    if (isCurrentUserRequest()) {
      if (!hasCachedData) setRoomCreationEligibilityLoaded(false);
      console.log('My rooms:', error.message);
    }
  }
}
   // ADD THE NEW FUNCTION HERE

async function loadJoinedRooms(currentSession = session) {
  try {
    if (!currentSession?.access_token) return;

    const requestUserId = currentSession.user.id;
    const result = await api('/api/rooms/joined', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });
    if (activeAuthUserIdRef.current !== requestUserId) return;

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

    const requestUserId = currentSession.user.id;
    const result = await api('/api/rooms/followed', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`
      }
    });
    if (activeAuthUserIdRef.current !== requestUserId) return;

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

  // Entry notices are local system chat items for this joining user only.
  // They are not written to the shared room-message table or broadcast to members.
  function createRoomEntryNotices(room) {
    const announcement = String(room?.announcement || room?.description || '').trim();
    return [
      { id: `entry-${room.id}-guidelines-${session?.user?.id}-${Date.now()}`, roomId: room.id, system: true, entryType: 'guidelines', sender: '', text: 'Welcome to the TALKZY. Please respect everyone and speak politely. Abusive language, third-party advertising, fake official information and politically sensitive topics are strictly prohibited. Please report such situations.' },
      { id: `entry-${room.id}-announcement-${session?.user?.id}-${Date.now()}`, roomId: room.id, system: true, entryType: 'announcement', sender: '', text: announcement || 'There is no announcement from the room owner.' },
      { id: `entry-${room.id}-welcome-${session?.user?.id}-${Date.now()}`, roomId: room.id, system: true, entryType: 'welcome', sender: '', text: `Welcome to ${room?.room_name || 'the room'}!` }
    ];
  }

  async function submitRoomJoin(room, password) {
    if (!room || !session?.access_token) return Alert.alert('Error', 'Please sign in again.');
    const requestUserId = session.user.id;
    const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
    try {
      const pendingLeave = roomLeaveCleanupRef.current[room.id];
      if (pendingLeave) await pendingLeave;
      if (!isCurrentUserRequest()) return;
      setJoiningRoom(true);
      await api(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      if (!isCurrentUserRequest()) return;
      await loadJoinedRooms();
      if (!isCurrentUserRequest()) return;
      setIsRoomTourist(false);
      setShowJoinPassword(false); setJoinPassword(''); setJoinTargetRoom(null);
      Alert.alert('Success', `You have joined ${room.room_name} as a member.`);
    } catch (error) {
      if (isCurrentUserRequest()) Alert.alert('Unable to join', error.message || 'Could not join this room.');
    } finally { if (isCurrentUserRequest()) setJoiningRoom(false); }
  }

  async function submitRoomVisit(room, password) {
    if (!room || !session?.access_token) return Alert.alert('Error', 'Please sign in again.');
    const requestUserId = session.user.id;
    const requestAccessToken = session.access_token;
    const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
    const cleanUpStaleVisit = async () => {
      try {
        await api(`/api/rooms/${room.id}/leave-visit`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${requestAccessToken}` }
        });
      } catch (cleanupError) {
        console.log('Stale tourist visit cleanup:', cleanupError.message);
      }
    };
    try {
      const pendingLeave = roomLeaveCleanupRef.current[room.id];
      if (pendingLeave) await pendingLeave;
      if (!isCurrentUserRequest()) return;
      setJoiningRoom(true);
      const result = await api(`/api/rooms/${room.id}/visit`, {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      if (!isCurrentUserRequest()) {
        await cleanUpStaleVisit();
        return;
      }
      try {
        await api(`/api/rooms/${room.id}/presence/ping`, { method: 'POST' });
      } catch (presenceError) {
        await cleanUpStaleVisit();
        throw presenceError;
      }
      if (!isCurrentUserRequest()) {
        await cleanUpStaleVisit();
        return;
      }
      setShowJoinPassword(false); setJoinPassword(''); setJoinTargetRoom(null);
      // A room entry never restores a previous microphone seat. Clear any stale
      // seat for this user before loading the room state, so sitting is manual.
      try { await api(`/api/rooms/${room.id}/mic-seats`, { method: 'DELETE' }); } catch (seatCleanupError) {
        console.log('Stale mic seat cleanup on entry:', seatCleanupError.message);
      }
      if (!isCurrentUserRequest()) {
        await cleanUpStaleVisit();
        return;
      }
      roomChatActiveRoomIdRef.current = room.id;
      ++roomChatLoadVersionRef.current;
      ++micSeatActionVersionRef.current;
      setShowRoomChatComposer(false);
      setRoomChatText('');
      setSelectedRoom(room);
      setIsRoomTourist(result.mode === 'tourist');
      setIsRoomMinimized(false); setShowRoomMenu(false);
      setMicCount(8); setMicSeats([]); setIsOnMic(false); setMyMicSeat(null); setIsMicMuted(false);
      setRoomChatMessages(createRoomEntryNotices(room));
      setScreen('roomInterior');
      loadRoomMicSeats(room.id);
      loadRoomMessages(room.id);
    } catch (error) {
      if (isCurrentUserRequest()) Alert.alert('Unable to visit', error.message || 'Could not enter this room as a tourist.');
    } finally { if (isCurrentUserRequest()) setJoiningRoom(false); }
  }

  async function openWorldLuckyBagRoom(notification) {
    if (!notification) return;
    try {
      const { data: bag, error } = await supabase.from('talkzy_lucky_bags')
        .select('id,room_id,scope,status,expires_at')
        .eq('id', notification.id).maybeSingle();
      if (error || !bag || bag.scope !== 'world' || bag.status !== 'active' ||
          new Date(bag.expires_at).getTime() <= Date.now()) {
        return Alert.alert('Lucky Bag Expired', 'This World Lucky Bag is no longer active.');
      }
      const actualRoomId = bag.room_id;
      const room = [rooms, joinedRooms, followedRooms, myRooms]
        .flat().find(item => item?.id === actualRoomId) ||
        (notification.room?.id === actualRoomId ? notification.room : null);
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
    } catch (validationError) {
      Alert.alert('Lucky Bag', validationError.message || 'Could not verify this notification.');
    }
  }

  async function sendRoomImage() {
    if (!selectedRoom?.id) return;
    const roomId = selectedRoom.id;
    if (isRoomTourist && !touristsSendPic) {
      return Alert.alert('Picture sharing disabled', 'The room owner does not allow tourists to share pictures.');
    }
    let uploadedPath = null;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Allow photo access to share a picture.');
      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.82 });
      const asset = picked.assets?.[0];
      if (picked.canceled || !asset?.uri) return;
      if (Number(asset.fileSize || 0) > 10 * 1024 * 1024) {
        return Alert.alert('Image too large', 'Choose a room photo smaller than 10 MB.');
      }
      const mimeType = String(asset.mimeType || 'image/jpeg').toLowerCase();
      const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' })[mimeType];
      if (!extension) return Alert.alert('Unsupported image', 'Choose a JPEG, PNG, WebP or HEIC image.');
      const response = await fetch(asset.uri);
      const bytes = await response.blob();
      if (bytes.size > 10 * 1024 * 1024) return Alert.alert('Image too large', 'Choose a room photo smaller than 10 MB.');
      uploadedPath = `${session.user.id}/rooms/${roomId}/messages/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('talkzy-room-chat').upload(uploadedPath, bytes, {
        contentType: mimeType, upsert: false
      });
      if (uploadError) throw uploadError;
      const result = await api(`/api/rooms/${roomId}/messages`, {
        method: 'POST', body: JSON.stringify({ type: 'image', imagePath: uploadedPath })
      });
      const item = result.message;
      if (roomChatActiveRoomIdRef.current === roomId) {
        setRoomChatMessages(prev => prev.some(existing => existing.id === item.id) ? prev : [...prev, {
          id: item.id, roomId, text: '📷 Photo', sender: profile?.display_name || displayName || 'You',
          senderId: session?.user?.id, message_type: 'image', image_url: item.image_url || null
        }]);
      }
    } catch (error) {
      if (uploadedPath) {
        try { await supabase.storage.from('talkzy-room-chat').remove([uploadedPath]); } catch {}
      }
      Alert.alert('Picture not sent', error.message || 'Could not share this picture.');
    }
  }


  async function loadRoomMessages(roomId) {
    if (!roomId || roomChatActiveRoomIdRef.current !== roomId) return;
    const requestVersion = ++roomChatLoadVersionRef.current;
    const isCurrentRoomRequest = () =>
      roomChatActiveRoomIdRef.current === roomId &&
      roomChatLoadVersionRef.current === requestVersion;
    try {
      const pendingLeave = roomLeaveCleanupRef.current[roomId];
      if (pendingLeave) await pendingLeave;
      if (!isCurrentRoomRequest()) return;
      const cutoffKey = `talkzy-room-chat-cutoff:${session?.user?.id || 'unknown'}:${roomId}`;
      const savedCutoff = Number(await AsyncStorage.getItem(cutoffKey)) || 0;
      if (!isCurrentRoomRequest()) return;
      const localCutoff = Math.max(roomChatLocalCutoffRef.current[roomId] || 0, savedCutoff);
      roomChatLocalCutoffRef.current[roomId] = localCutoff;
      const result = await api(`/api/rooms/${roomId}/messages`);
      if (!isCurrentRoomRequest()) return;
      const history = (result.messages || [])
        .filter(item => !localCutoff || new Date(item.created_at).getTime() > localCutoff)
        .map(item => ({
          id: item.id, roomId,
          text: item.message_type === 'image' ? '📷 Photo' : item.message_text,
          sender: item.sender?.display_name || 'TALKZY User',
          senderId: item.sender_id,
          avatar_url: item.sender?.avatar_url || null,
          message_type: item.message_type,
          image_url: item.image_url
        }));
      setRoomChatMessages(prev => [
        ...prev.filter(item => item.system && item.roomId === roomId),
        ...history
      ]);
    } catch (error) {
      if (isCurrentRoomRequest()) console.log('Room chat loading error:', error.message);
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

  const requestUserId = session.user.id;
  const requestAccessToken = session.access_token;
  const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;

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
      if (!isCurrentUserRequest()) return;

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
    const gameToStartAfterCreation = pendingGameEntryName;
    if (gameToStartAfterCreation) setPendingGameEntryName(null);
    if (!isCurrentUserRequest()) return;

    // Refresh room lists
    await loadPublicRooms();
    if (!isCurrentUserRequest()) return;
    await loadMyRooms();
    if (!isCurrentUserRequest()) return;

    if (gameToStartAfterCreation) {
      const refreshedRooms = await api('/api/rooms/mine');
      if (!isCurrentUserRequest()) return;
      const createdRoom = (refreshedRooms.rooms || []).find(room => room.owner_id === requestUserId) || refreshedRooms.rooms?.[0];
      if (createdRoom) {
        setRoomName('');
        setRoomDescription('');
        setRoomPassword('');
        setRoomType('public');
        setRoomDpUri(null);
        await enterOwnRoomForGame(createdRoom, gameToStartAfterCreation);
        return;
      }
    }

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
    if (isCurrentUserRequest()) Alert.alert(
      'Room creation failed',
      error.message || 'Something went wrong.'
    );
  } finally {
    if (isCurrentUserRequest()) {
      setRoomDpUploading(false);
      setSaving(false);
    }
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
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setShowCreateRoomPasswordPopup(true)}
        style={{
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#41445A',
          backgroundColor: '#171827',
          marginTop: 2,
          marginBottom: 8
        }}
      >
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Room password</Text>
          <Text style={{ color: '#A6A8B8', fontSize: 11, marginTop: 3 }}>
            {roomType === 'locked' ? 'Password protected' : 'Public room'}
          </Text>
        </View>
        <Text style={{ color: roomType === 'locked' ? '#F5C76B' : '#A6A8B8', fontSize: 12, fontWeight: '900' }}>
          {roomType === 'locked' ? 'LOCKED  ›' : 'UNLOCKED  ›'}
        </Text>
      </TouchableOpacity>

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
  onPress={async () => {
    if (showJoin) {
      joinRoom(room);
      return;
    }

    const requestUserId = session?.user?.id;
    if (!requestUserId) return;
    const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
    // Finish the previous room's server cleanup before entering again.
    const pendingLeave = roomLeaveCleanupRef.current[room.id];
    if (pendingLeave) await pendingLeave;
    if (!isCurrentUserRequest()) return;
    // Never carry a previous microphone seat into a new room entry.
    try { await api(`/api/rooms/${room.id}/mic-seats`, { method: 'DELETE' }); } catch (seatCleanupError) {
      console.log('Stale mic seat cleanup on entry:', seatCleanupError.message);
    }
    if (!isCurrentUserRequest()) return;
    try {
      await api(`/api/rooms/${room.id}/presence/ping`, { method: 'POST' });
    } catch (presenceError) {
      if (isCurrentUserRequest()) Alert.alert('Unable to enter room', presenceError.message || 'Could not establish your room connection. Please try again.');
      return;
    }
    if (!isCurrentUserRequest()) return;
    roomChatActiveRoomIdRef.current = room.id;
    ++roomChatLoadVersionRef.current;
    ++micSeatActionVersionRef.current;
    setShowRoomChatComposer(false);
    setRoomChatText('');
    setSelectedRoom(room);
setIsRoomTourist(false);
setIsRoomMinimized(false);

// Reset previous room microphone data
setMicCount(8);
setMicSeats([]);
setIsOnMic(false);
setMyMicSeat(null);
setIsMicMuted(false);

// Seed this user's chat with private, local room-entry notices before loading history.
setRoomChatMessages(createRoomEntryNotices(room));
// Load this room's microphone data and room chat
loadRoomMicSeats(room.id);
loadRoomMessages(room.id);

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
        onPress={(event) => {
          event.stopPropagation?.();
          openRoomSettings(room);
        }}
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

function isTrustedYouTubeNavigation(value) {
  const raw = String(value || '').trim();
  if (raw === 'about:blank') return true;
  const match = raw.match(/^https:\/\/([^/:?#]+)(?::\d+)?(?:[/?#]|$)/i);
  if (!match) return false;
  const host = match[1].toLowerCase();
  return [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtu.be',
    'www.youtu.be',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'consent.youtube.com'
  ].includes(host);
}

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
  const canControlYoutube = selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin');
  if (!canControlYoutube) {
    Alert.alert('YouTube controls restricted', 'Only the original Room Owner and authorized Room Admins can change the shared video or playlist.');
    return false;
  }
  if (!selectedRoom?.id || youtubeSaving) return false;
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
    return true;
  } catch (error) {
    Alert.alert('YouTube control', error.message || 'Could not update YouTube.');
    return false;
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
  const canBrowseYoutube = selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin');
  if (!canBrowseYoutube) {
    Alert.alert('YouTube access restricted', 'Only the original Room Owner and authorized Room Admins can browse, add or manage shared YouTube content.');
    return;
  }
  const videoId = extractYouTubeVideoId(item?.video_id || item?.url);
  if (!videoId) return Alert.alert('Invalid YouTube link', 'Choose a valid YouTube video.');
  const count = (youtubeState.queue || []).length + (youtubeState.video_id ? 1 : 0);
  if (count >= 20) return Alert.alert('Playlist full', 'The room playlist is limited to 20 videos.');
  const meta = item?.title ? item : await getYoutubeMetadata(videoId);
  const selectedEntry = { video_id: videoId, title: String(meta.title || 'YouTube video').slice(0, 120), added_by: profile?.display_name || session?.user?.email?.split('@')[0] || 'Member' };
  const alreadyPlaying = Boolean(youtubeState.video_id);
  const next = alreadyPlaying
    ? { ...youtubeState, queue: [...(youtubeState.queue || []), selectedEntry] }
    : { ...youtubeState, video_id: videoId, current_title: selectedEntry.title, is_playing: true, current_time_seconds: 0, queue: [...(youtubeState.queue || [])] };
  const saved = await saveYoutubeState(next);
  if (!saved) return;
  setYoutubeSelectedVideo(null);
  setYoutubePickedItem(null);
  setYoutubeUrlInput('');
  setShowYoutubePicker(false);
  setShowYoutubePanel(true);
  Alert.alert(alreadyPlaying ? 'Added to waiting queue' : 'Now playing', alreadyPlaying ? `${meta.title || 'Video'} will play after the current video.` : (meta.title || 'Video added'));
}

async function closeYoutubeScreen() {
  const canClose = selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin');
  if (!canClose) {
    Alert.alert('Not allowed', 'Only the Room Owner or an authorized Admin can close the shared YouTube screen.');
    return;
  }
  const preservedQueue = youtubeState.video_id
    ? [{ video_id: youtubeState.video_id, title: youtubeState.current_title || 'Previously playing video', added_by: 'Room playlist' }, ...(youtubeState.queue || [])].slice(0, 20)
    : [...(youtubeState.queue || [])].slice(0, 20);
  const saved = await saveYoutubeState({ ...youtubeState, video_id: null, queue: preservedQueue, is_playing: false, current_time_seconds: 0 });
  if (!saved) return;
  setShowYoutubePanel(false);
  setShowYoutubePicker(false);
  setShowYoutubeQueuePopup(false);
  setShowYoutubeVolumePopup(false);
  setYoutubeSelectedVideo(null);
  setYoutubePickedItem(null);
  setYoutubeUrlInput('');
  youtubePanelDismissedRef.current = true;
}

async function addYoutubeVideo() {
  const videoId = extractYouTubeVideoId(youtubeUrlInput);
  if (!videoId) return Alert.alert('Invalid YouTube link', 'Paste a valid YouTube video URL or 11-character video ID.');
  const meta = await getYoutubeMetadata(videoId);
  await addYoutubeItem(meta);
}

async function updateYoutubeQueue(nextQueue) {
  return saveYoutubeState({ ...youtubeState, queue: nextQueue });
}

async function removeYoutubeQueueItem(index) {
  const nextQueue = [...(youtubeState.queue || [])];
  nextQueue.splice(index, 1);
  await updateYoutubeQueue(nextQueue);
}

async function moveYoutubeQueueItem(index, direction) {
  const nextQueue = [...(youtubeState.queue || [])];
  const target = index + direction;
  if (target < 0 || target >= nextQueue.length) return;
  [nextQueue[index], nextQueue[target]] = [nextQueue[target], nextQueue[index]];
  await updateYoutubeQueue(nextQueue);
}

async function advanceYoutubeQueue() {
  const queue = [...(youtubeState.queue || [])];
  const nextVideo = queue.shift();
  await saveYoutubeState({ ...youtubeState, video_id: nextVideo?.video_id || null, current_title: nextVideo?.title || null, queue, is_playing: Boolean(nextVideo), current_time_seconds: 0 });
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
  const roomId = selectedRoom.id;
  try {
    const result = await api(`/api/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ type: 'text', text: message })
    });
    const item = result.message;
    if (roomChatActiveRoomIdRef.current === roomId) {
      setRoomChatMessages(prev => prev.some(existing => existing.id === item.id) ? prev : [...prev, {
        id: item.id, roomId, text: item.message_text, sender: profile?.display_name || displayName || 'You',
        senderId: session?.user?.id
      }]);
      setRoomChatText('');
    }
  } catch (error) {
    Alert.alert('Message not sent', error.message || 'Could not send your message.');
  }
}

function renderRoomInterior() {
  // Shadow the global palette only inside this room renderer.
  const C = ROOM_C;
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
  // Reserve a fixed vertical footprint for the microphone seats. The chat feed
  // below absorbs the remaining room height, so 14/17-mic rows never drift.
  const configuredMicRows = (MIC_LAYOUTS[micLayout] || MIC_LAYOUTS.eight).rows;
  const visibleMicRows = youtubeScreenVisible
    ? Array.from({ length: Math.ceil(configuredMicRows.flat().length / 8) }, (_, index) => configuredMicRows.flat().slice(index * 8, (index + 1) * 8)).filter(row => row.length > 0)
    : configuredMicRows.filter(row => row.length > 0);
  const micSeatRowHeight = youtubeScreenVisible ? 38 : (micCount >= 17 ? 72 : micCount >= 14 ? 78 : 94);
  const micSeatRowGap = youtubeScreenVisible ? 3 : (micCount >= 14 ? 4 : 7);
  const micSeatAreaHeight = 6 + visibleMicRows.length * (micSeatRowHeight + micSeatRowGap);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, minHeight: 0 }}>
      {!roomThemePreviewUri && (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#061522', overflow: 'hidden' }}>
          {/* Layered ambient lighting creates a full-screen voice lounge rather than a flat black panel. */}
          <View style={{ position: 'absolute', width: 310, height: 310, borderRadius: 155, top: -145, left: -105, backgroundColor: 'rgba(24,143,190,0.24)' }} />
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, top: '28%', right: -150, backgroundColor: 'rgba(54,91,190,0.20)' }} />
          <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, bottom: -190, left: '18%', backgroundColor: 'rgba(25,172,177,0.16)' }} />
          <View style={{ position: 'absolute', width: '145%', height: 1, top: '18%', left: '-18%', backgroundColor: 'rgba(105,218,244,0.20)', transform: [{ rotate: '-17deg' }] }} />
          <View style={{ position: 'absolute', width: '118%', height: 1, top: '43%', left: '-8%', backgroundColor: 'rgba(105,218,244,0.12)', transform: [{ rotate: '11deg' }] }} />
          <View style={{ position: 'absolute', width: '132%', height: 1, top: '69%', left: '-15%', backgroundColor: 'rgba(105,218,244,0.15)', transform: [{ rotate: '-9deg' }] }} />
          <View style={{ position: 'absolute', width: 1, height: '68%', top: '8%', left: '23%', backgroundColor: 'rgba(105,218,244,0.07)', transform: [{ rotate: '24deg' }] }} />
          <View style={{ position: 'absolute', width: 1, height: '74%', top: '22%', right: '19%', backgroundColor: 'rgba(105,218,244,0.08)', transform: [{ rotate: '-21deg' }] }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(1,8,18,0.24)' }} />
        </View>
      )}
      {roomThemePreviewUri && (
        <>
          <Image source={{ uri: roomThemePreviewUri }} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.72 }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5,8,18,0.24)' }} />
          <TouchableOpacity onPress={() => { setRoomThemePreviewUri(null); setRoomThemePage('custom'); setShowRoomThemeMenu(true); }} style={{ position: 'absolute', right: 12, bottom: Platform.OS === 'android' ? 100 : 78, zIndex: 80, elevation: 30, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 22, backgroundColor: '#5B45A8', borderWidth: 1, borderColor: '#D0C3FF' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>End Preview</Text>
          </TouchableOpacity>
        </>
      )}


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
              <TouchableOpacity disabled={bag.alreadyClaimed || claimingLuckyBagId===bag.id} onPress={() => { setSelectedLuckyBag(bag); setShowLuckyBagOpenPopup(true); }} style={{ marginTop: 7, paddingVertical: 7, borderRadius: 9, alignItems: 'center', backgroundColor: bag.alreadyClaimed ? '#51445F' : '#D9A43A' }}><Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 11 }}>{claimingLuckyBagId===bag.id ? 'OPENING…' : bag.alreadyClaimed ? 'ALREADY OPENED' : '🎁 OPEN BAG'}</Text></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ROOM HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >

        {/* ROOM DP — square identity tile with a champagne-gold frame; tap for room information */}
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => openRoomDetails(selectedRoom)}
          accessibilityRole="button"
          accessibilityLabel="Open room information"
          style={{ width: 64, height: 64, borderRadius: 10, marginRight: 11, padding: 3, borderWidth: 1.5, borderColor: C.gold, backgroundColor: '#17120A', alignItems: 'center', justifyContent: 'center', shadowColor: C.gold, shadowOpacity: 0.24, shadowRadius: 8, elevation: 4 }}
        >
          {selectedRoom.room_dp_url ? (
            <Image source={{ uri: selectedRoom.room_dp_url }} style={{ width: 54, height: 54, borderRadius: 7, borderWidth: 1, borderColor: '#8F713D' }} />
          ) : (
            <View style={{ width: 54, height: 54, borderRadius: 7, backgroundColor: '#211A10', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 25, color: C.gold }}>♬</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ROOM DETAILS */}
<View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
  <TouchableOpacity
    onPress={() => openRoomDetails(selectedRoom)}
    style={{ alignSelf: 'stretch', minWidth: 0 }}
  >
    <Text
      style={{
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.25,
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
      color: '#C4B89F',
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

      {/* YOUTUBE QUICK CONTROLS — shown only while the shared screen is open */}
      {youtubeScreenVisible && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginHorizontal: 12, marginTop: 4, marginBottom: 1, gap: 5 }}>
          <TouchableOpacity onPress={() => loadYoutubeState(true)} style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#53658C', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#F7F0E2', fontSize: 11, lineHeight: 13 }}>↻</Text>
          </TouchableOpacity>
          {(selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin')) && (
            <TouchableOpacity onPress={() => setShowYoutubeQueuePopup(true)} style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#53658C', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#F7F0E2', fontSize: 10, lineHeight: 12 }}>☷</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowYoutubeVolumePopup(true)} style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#53658C', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#F7F0E2', fontSize: 10, lineHeight: 12 }}>◖))</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SHARED YOUTUBE SCREEN — visible to the room while active, or locally when opened by a controller */}
      {youtubeScreenVisible && (
      <View style={{ marginHorizontal: 10, marginTop: 5, marginBottom: 5, height: 170, backgroundColor: '#050914', borderRadius: 13, borderWidth: 1, borderColor: '#8F713D', overflow: 'hidden' }}>
          {(selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin')) && (
            <TouchableOpacity onPress={closeYoutubeScreen} style={{ position: 'absolute', zIndex: 5, top: 7, right: 7, width: 27, height: 27, borderRadius: 14, backgroundColor: 'rgba(9,12,25,0.88)', borderWidth: 1, borderColor: '#E8C982', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 17, lineHeight: 20, fontWeight: '900' }}>✕</Text>
            </TouchableOpacity>
          )}
          {youtubeState.video_id ? (
            <WebView key={youtubeState.video_id} ref={youtubeWebViewRef} source={{ html: YOUTUBE_PLAYER_HTML }} originWhitelist={['https://www.youtube.com', 'https://www.youtube-nocookie.com', 'about:blank']} javaScriptEnabled domStorageEnabled allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false}
              onShouldStartLoadWithRequest={(request) => isTrustedYouTubeNavigation(request?.url)}
              onMessage={(event) => {
                const message = String(event.nativeEvent.data || '');
                if (message === 'ready' && youtubeState.video_id) {
                  youtubeLoadedVideoRef.current = youtubeState.video_id;
                  youtubeWebViewRef.current?.injectJavaScript(`window.talkzyLoad && window.talkzyLoad('${youtubeState.video_id}', ${Number(youtubeState.current_time_seconds || 0)}, ${youtubeState.is_playing ? 'true' : 'false'});window.talkzySetVolume && window.talkzySetVolume(${youtubeVolume});` + 'true;');
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
              style={{ flex: 1, backgroundColor: '#000' }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }}>
              <Text style={{ color: '#E8D7B1', fontSize: 13, fontWeight: '900', marginBottom: 6 }}>TALKZY · SHARED YOUTUBE</Text>
              <Text style={{ color: '#B7A98F', fontSize: 11, textAlign: 'center' }}>
                {selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin')
                  ? 'Choose Music or Video, select a result, then press ADD to start playback here.'
                  : 'Waiting for the Room Owner or an authorized Admin to add music or video.'}
              </Text>
            </View>
          )}
        </View>
      )}
      {/* The waiting queue is intentionally available only from the owner/admin queue icon. */}

      {/* OWNER / ADMIN QUEUE POPUP */}
      <Modal visible={showYoutubeQueuePopup} transparent animationType="fade" onRequestClose={() => setShowYoutubeQueuePopup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(2,4,12,0.82)', justifyContent: 'center', padding: 20 }}>
          <View style={{ maxHeight: '70%', backgroundColor: '#14110D', borderRadius: 18, borderWidth: 1, borderColor: '#8F713D', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#F5F6FF', fontSize: 14, fontWeight: '900' }}>YOUTUBE QUEUE · {youtubeState.queue?.length || 0}</Text>
              <TouchableOpacity onPress={() => setShowYoutubeQueuePopup(false)}><Text style={{ color: '#C4B89F', fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {(youtubeState.queue || []).length === 0 ? (
                <Text style={{ color: '#B7A98F', fontSize: 12, textAlign: 'center', paddingVertical: 22 }}>No videos waiting in the queue.</Text>
              ) : (youtubeState.queue || []).map((item, index) => (
                <View key={`${item.video_id || 'video'}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: index ? 1 : 0, borderTopColor: '#5A4528' }}>
                  <Text numberOfLines={2} style={{ color: '#F7F0E2', fontSize: 11, flex: 1, paddingRight: 8 }}>{index + 1}. {item.title || 'YouTube video'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity disabled={index === 0 || youtubeSaving} onPress={() => moveYoutubeQueueItem(index, -1)} style={{ paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: '#302719', opacity: index === 0 ? 0.35 : 1 }}><Text style={{ color: '#E3E8FF', fontSize: 11, fontWeight: '900' }}>↑</Text></TouchableOpacity>
                    <TouchableOpacity disabled={index === youtubeState.queue.length - 1 || youtubeSaving} onPress={() => moveYoutubeQueueItem(index, 1)} style={{ paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: '#302719', opacity: index === youtubeState.queue.length - 1 ? 0.35 : 1 }}><Text style={{ color: '#E3E8FF', fontSize: 11, fontWeight: '900' }}>↓</Text></TouchableOpacity>
                    <TouchableOpacity disabled={youtubeSaving} onPress={() => removeYoutubeQueueItem(index)} style={{ paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: '#48263A' }}><Text style={{ color: '#FFB5C5', fontSize: 10, fontWeight: '900' }}>✕</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PERSONAL VOLUME POPUP — affects only this participant's local player */}
      <Modal visible={showYoutubeVolumePopup} transparent animationType="fade" onRequestClose={() => setShowYoutubeVolumePopup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(2,4,12,0.82)', justifyContent: 'center', padding: 28 }}>
          <View style={{ backgroundColor: '#14110D', borderRadius: 18, borderWidth: 1, borderColor: '#8F713D', padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: '#F5F6FF', fontSize: 14, fontWeight: '900' }}>MY YOUTUBE VOLUME</Text>
              <TouchableOpacity onPress={() => setShowYoutubeVolumePopup(false)}><Text style={{ color: '#C4B89F', fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            <Text style={{ color: '#E8D7B1', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{youtubeVolume}%</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => { const v = Math.max(0, youtubeVolume - 10); setYoutubeVolume(v); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${v});true;`); }} style={{ width: 42, height: 38, borderRadius: 10, backgroundColor: '#302719', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 20 }}>−</Text></TouchableOpacity>
              <View style={{ flex: 1, marginHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                {[0,20,40,60,80,100].map(v => <TouchableOpacity key={v} onPress={() => { setYoutubeVolume(v); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${v});true;`); }} style={{ width: 8, height: 22, borderRadius: 4, backgroundColor: youtubeVolume >= v ? '#D8B66D' : '#5A4528' }} />)}
              </View>
              <TouchableOpacity onPress={() => { const v = Math.min(100, youtubeVolume + 10); setYoutubeVolume(v); youtubeWebViewRef.current?.injectJavaScript(`window.talkzySetVolume && window.talkzySetVolume(${v});true;`); }} style={{ width: 42, height: 38, borderRadius: 10, backgroundColor: '#302719', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 20 }}>＋</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* YOUTUBE SEARCH PICKER — separate popup for controllers */}
      <Modal visible={showYoutubePicker} transparent animationType="slide" onRequestClose={() => { setShowYoutubePicker(false); setYoutubePickedItem(null); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(2,4,12,0.88)', justifyContent: 'flex-end' }}>
          <View style={{ height: '88%', backgroundColor: '#14110D', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: '#8F713D', overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, backgroundColor: '#201A12' }}>
              <Text style={{ color: '#F7F0E2', fontSize: 15, fontWeight: '900' }}>Choose YouTube content</Text>
              <TouchableOpacity onPress={() => { setShowYoutubePicker(false); setYoutubePickedItem(null); }}><Text style={{ color: '#C4B89F', fontSize: 22 }}>✕</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 6 }}>
              {['Music', 'Video'].map(tab => (
                <TouchableOpacity key={tab} onPress={() => { setYoutubeBrowseTab(tab); setYoutubeSearchQuery(''); setYoutubePickedItem(null); setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent(tab === 'Music' ? 'music' : 'video')); }}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: youtubeBrowseTab === tab ? '#8F713D' : '#211A10', borderWidth: 1, borderColor: youtubeBrowseTab === tab ? '#D8B66D' : '#5A4528' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>{tab === 'Music' ? '♫ MUSIC' : '▶ VIDEO'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 9, marginBottom: 8, gap: 6 }}>
              <TextInput value={youtubeSearchQuery} onChangeText={setYoutubeSearchQuery} placeholder={youtubeBrowseTab === 'Music' ? 'Search music…' : 'Search videos…'} placeholderTextColor="#8290AE" autoCapitalize="none" returnKeyType="search"
                onSubmitEditing={() => { const q = youtubeSearchQuery.trim() || (youtubeBrowseTab === 'Music' ? 'music' : 'video'); setYoutubePickedItem(null); setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent(q)); }}
                style={{ flex: 1, color: '#FFFFFF', fontSize: 12, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#080706', borderRadius: 8, borderWidth: 1, borderColor: '#5A4528' }} />
              <TouchableOpacity onPress={() => { const q = youtubeSearchQuery.trim() || (youtubeBrowseTab === 'Music' ? 'music' : 'video'); setYoutubePickedItem(null); setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent(q)); }}
                style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#D8B45D' }}>
                <Text style={{ color: '#211A12', fontSize: 11, fontWeight: '900' }}>SEARCH</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginHorizontal: 9, marginBottom: 8, borderRadius: 9, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
              <WebView ref={youtubeBrowseWebViewRef} source={{ uri: youtubeBrowseUrl || ('https://www.youtube.com/results?search_query=' + encodeURIComponent(youtubeBrowseTab === 'Music' ? 'music' : 'video')) }} originWhitelist={['*']} setSupportMultipleWindows={false} javaScriptEnabled domStorageEnabled allowsInlineMediaPlayback
                injectedJavaScriptBeforeContentLoaded={`(function(){if(window.__talkzyPickerInstalled)return;window.__talkzyPickerInstalled=true;function pick(e){var n=e.target;var a=n&&n.closest?n.closest('a[href]'):null;var h=(a&&a.href)||'';var id=(n&&n.closest&&n.closest('[data-video-id]')&&n.closest('[data-video-id]').getAttribute('data-video-id'))||'';var m=h.match(/[?&]v=([A-Za-z0-9_-]{11})/)||h.match(/youtu\\.be\\/([A-Za-z0-9_-]{11})/)||h.match(/\\/shorts\\/([A-Za-z0-9_-]{11})/)||h.match(/\\/embed\\/([A-Za-z0-9_-]{11})/);id=(m&&m[1])||id;if(id&&/^[A-Za-z0-9_-]{11}$/.test(id)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('talkzy-select:'+id);}}document.addEventListener('click',pick,true);})();true;`}
                onMessage={(event) => {
                  const message = String(event.nativeEvent.data || '');
                  if (message.startsWith('talkzy-select:')) {
                    const id = message.slice('talkzy-select:'.length).trim();
                    if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
                      setYoutubePickedItem({ video_id: id, title: 'Loading selected video…' });
                      getYoutubeMetadata(id).then(meta => setYoutubePickedItem(meta));
                    }
                  }
                }}
                onShouldStartLoadWithRequest={(request) => {
                  const url = String(request?.url || '');
                  const id = extractYouTubeVideoId(url);
                  // Keep video selection inside TALKZY: capture video links instead of
                  // allowing Android to hand them to the installed YouTube app.
                  if (id && /(?:watch|youtu\.be|shorts|\/embed\/|\/live\/)/i.test(url)) {
                    setYoutubePickedItem({ video_id: id, title: 'Loading selected video…' });
                    getYoutubeMetadata(id).then(meta => setYoutubePickedItem(meta));
                    return false;
                  }
                  // The picker is an in-app browser only. Never hand untrusted redirects
                  // or external links to Android's intent resolver.
                  return isTrustedYouTubeNavigation(url);
                }}
                onOpenWindow={(event) => {
                  const url = String(event?.nativeEvent?.targetUrl || '');
                  const id = extractYouTubeVideoId(url);
                  if (id) {
                    setYoutubePickedItem({ video_id: id, title: 'Loading selected video…' });
                    getYoutubeMetadata(id).then(meta => setYoutubePickedItem(meta));
                  } else if (isTrustedYouTubeNavigation(url)) {
                    setYoutubeBrowseUrl(url);
                  }
                }}
                style={{ flex: 1 }} />
            </View>
            <View style={{ paddingHorizontal: 12, paddingBottom: 14, paddingTop: 8, backgroundColor: '#201A12', borderTopWidth: 1, borderTopColor: '#5A4528' }}>
              <Text numberOfLines={1} style={{ color: youtubePickedItem ? '#FFFFFF' : '#B7A98F', fontWeight: '800', fontSize: 11, marginBottom: 7 }}>
                {youtubePickedItem ? 'SELECTED: ' + (youtubePickedItem.title || 'YouTube video') : 'Select a video above to add it to the room'}
              </Text>
              <TouchableOpacity disabled={!youtubePickedItem || youtubeSaving} onPress={() => youtubePickedItem && addYoutubeItem(youtubePickedItem)} style={{ backgroundColor: youtubePickedItem ? '#8F713D' : '#302719', borderColor: youtubePickedItem ? '#E8C982' : '#5A4528', borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', opacity: youtubePickedItem && !youtubeSaving ? 1 : 0.65 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>{youtubeSaving ? 'ADDING…' : '＋ ADD ' + (youtubeBrowseTab === 'Music' ? 'SONG' : 'VIDEO')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ROOM TROPHY / COINS — compact row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingTop: 2,
          paddingBottom: 0
        }}
      >
        <Text style={{ fontSize: 13, lineHeight: 15 }}>🏆</Text>
        <Text
          style={{
            color: C.text,
            fontSize: 11,
            lineHeight: 14,
            fontWeight: 'bold',
            marginLeft: 4
          }}
        >
          0
        </Text>
      </View>


           {/* MICROPHONE SEATS */}
<View
  style={{ height: micSeatAreaHeight, flexGrow: 0, flexShrink: 0, alignSelf: 'stretch', paddingHorizontal: 12, paddingTop: youtubeScreenVisible ? 3 : 4, paddingBottom: 2 }}
>
  {visibleMicRows.map((rowSeats, rowIndex) => {
    const layoutRows = configuredMicRows;
    const maxSeatsPerRow = Math.max(...layoutRows.map(row => row.length));
    const isTopCoupleRow = !youtubeScreenVisible && rowIndex === 0 && rowSeats.length === 2;
    // Give each couple seat the same column width as a regular seat below.
    const couplePairWidth = `${200 / maxSeatsPerRow}%`;
    return (
    <View key={rowIndex} style={{ width: isTopCoupleRow ? couplePairWidth : '100%', flexShrink: 0, alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', backgroundColor: isTopCoupleRow ? 'transparent' : youtubeScreenVisible ? '#360D14' : 'transparent', borderWidth: isTopCoupleRow ? 0 : youtubeScreenVisible ? 1.5 : 0, borderColor: '#B88743', borderRadius: youtubeScreenVisible ? 10 : 0, paddingHorizontal: youtubeScreenVisible && !isTopCoupleRow ? 2 : 0, paddingTop: youtubeScreenVisible && !isTopCoupleRow ? 2 : 0, paddingBottom: youtubeScreenVisible && !isTopCoupleRow ? 2 : 0, marginBottom: micSeatRowGap, shadowColor: youtubeScreenVisible && !isTopCoupleRow ? '#D5A64E' : 'transparent', shadowOpacity: youtubeScreenVisible && !isTopCoupleRow ? 0.22 : 0, shadowRadius: youtubeScreenVisible && !isTopCoupleRow ? 7 : 0, elevation: youtubeScreenVisible && !isTopCoupleRow ? 4 : 0 }}>
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
          const actionVersion = ++micSeatActionVersionRef.current;
          const isCurrentRoomAction = () =>
            actionVersion === micSeatActionVersionRef.current &&
            activeAuthUserIdRef.current === userId &&
            roomChatActiveRoomIdRef.current === roomId;

          // Invalidate any in-flight seat fetch before applying this tap.
          ++micSeatLoadVersionRef.current;
          if (roomChatActiveRoomIdRef.current !== roomId) return;
          beginMicSeatAction();

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

            const preservedMute = isMicMuted;
            const optimisticSeat = {
              room_id: roomId,
              seat_number: seat,
              user_id: userId,
              display_name: profile?.display_name || displayName || 'You',
              avatar_url: profile?.avatar_url || avatarUri || null,
              is_muted: preservedMute
            };

            setMicSeats(current => [
              ...current.filter(item => item.user_id !== userId),
              optimisticSeat
            ]);
            setIsOnMic(true);
            setMyMicSeat(seat);
            setIsMicMuted(preservedMute);

            await api(
              `/api/rooms/${roomId}/mic-seats/${seat}`,
              { method: 'POST' }
            );
            // Realtime sync updates other participants. Avoid an extra GET here.
          } catch (error) {
            if (!isCurrentRoomAction()) return;
            // Restore authoritative server state if the action fails.
            setMicSeats(previousSeats);
            await loadRoomMicSeats(roomId);
            if (isCurrentRoomAction()) Alert.alert(
              'Microphone error',
              error.message || 'Could not change microphone seat.'
            );
          } finally {
            endMicSeatAction();
          }
        }}
        style={{
          opacity: (isRoomTourist && !touristsOnMic) || (seatIsClosed && !canControlMics) ? 0.4 : 1,
          width: isTopCoupleRow ? '50%' : `${100 / Math.max(...(MIC_LAYOUTS[micLayout] || MIC_LAYOUTS.eight).rows.map(row => row.length))}%`,
          height: micSeatRowHeight,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: 0,
          paddingHorizontal: 1,
          paddingTop: youtubeScreenVisible ? 0 : 2,
          backgroundColor: youtubeScreenVisible ? '#581822' : 'transparent',
          borderLeftWidth: youtubeScreenVisible ? 1 : 0,
          borderRightWidth: youtubeScreenVisible ? 1 : 0,
          borderColor: '#7E3B32',
          borderTopLeftRadius: youtubeScreenVisible ? 15 : 0,
          borderTopRightRadius: youtubeScreenVisible ? 15 : 0,
          overflow: youtubeScreenVisible ? 'hidden' : 'visible'
        }}
      >
        <View
          style={{
            width: youtubeScreenVisible ? 22 : (micCount >= 17 ? 52 : micCount >= 14 ? 56 : 60),
            height: youtubeScreenVisible ? 22 : (micCount >= 17 ? 52 : micCount >= 14 ? 56 : 60),
            borderRadius: youtubeScreenVisible ? 11 : (micCount >= 17 ? 26 : micCount >= 14 ? 28 : 30),
            borderWidth: 2,
            borderColor: isMySeat ? '#F4D99A' : isOccupied ? '#D8B66D' : '#80643A',
            backgroundColor: '#17120B',
            shadowColor: '#D8B66D',
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
                  width: youtubeScreenVisible ? 20 : (micCount >= 17 ? 49 : micCount >= 14 ? 53 : 57),
                  height: youtubeScreenVisible ? 20 : (micCount >= 17 ? 49 : micCount >= 14 ? 53 : 57),
                  borderRadius: youtubeScreenVisible ? 10 : (micCount >= 17 ? 24.5 : micCount >= 14 ? 26.5 : 28.5),
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
              <View style={{ width: 26, height: 20, borderWidth: 2, borderColor: '#D8B66D', borderRadius: 4, transform: [{ rotate: '-8deg' }] }}>
                <View style={{ position: 'absolute', width: 33, height: 3, backgroundColor: '#FF6685', top: 8, left: -4, transform: [{ rotate: '42deg' }] }} />
              </View>
            </View>
          )}
          {seatMicIsClosed && !seatIsClosed && (
            <View style={{ position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#D8B66D', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#E8C982', fontSize: 11, fontWeight: '900' }}>×</Text>
            </View>
          )}
        </View>

          {isOccupied && roomReactions.filter(item => item.userId === occupiedSeat.user_id).slice(-1).map(item => (
            <Animated.View key={item.id} pointerEvents="none" style={{
              position: 'absolute', top: youtubeScreenVisible ? -18 : 2, alignSelf: 'center', zIndex: 30, elevation: 12,
              backgroundColor: 'transparent', borderWidth: 0,
              borderRadius: 0, paddingHorizontal: 0, paddingVertical: 0,
              opacity: item.progress.interpolate({ inputRange: [0, 0.12, 0.82, 1], outputRange: [0, 1, 1, 0] }),
              transform: [{ translateX: item.direction === 'left'
                ? item.progress.interpolate({ inputRange: [0, 1], outputRange: [24, -24] })
                : item.direction === 'right'
                  ? item.progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 24] })
                  : item.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) }]
            }}>
              <MicReactionSticker emoji={item.emoji} size={58} direction={item.direction} />
            </Animated.View>
          ))}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={{
            color: isOccupied ? (isMySeat ? C.accent : C.text) : C.text,
            fontSize: youtubeScreenVisible ? 7 : 11,
            marginTop: youtubeScreenVisible ? 0 : 5,
            fontWeight: 'bold',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {isOccupied
            ? seatDisplayName(isMySeat ? (displayName || profile?.display_name || 'You') : (occupiedSeat.display_name || 'User'), true)
            : seat}
        </Text>
        )}
      </TouchableOpacity>
    );
      })}
    </View>
    );
  })}
  {musicMinimized && screen === 'roomInterior' && selectedRoom && !showRoomTools && !showRoomGiftPanel && !showRoomThemeMenu && !showYoutubePanel && (
    <View style={{ width: '100%', alignItems: 'flex-end', paddingRight: 2, paddingTop: 2, paddingBottom: 4 }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Restore minimized music"
        onPress={() => { setMusicMinimized(false); setShowMusicPanel(true); }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 17,
          backgroundColor: C.accent,
          borderWidth: 2,
          borderColor: '#B9A5FF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 3 },
          elevation: 8
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', lineHeight: 24 }}>♫</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 }}>MUSIC</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

{/* CHAT AREA — anchored immediately below the final microphone row. */}
{(() => {
  // More microphone rows consume more vertical space, so the chat feed
  // progressively gives up height. Flex fills every remaining pixel.
  const boundedMicCount = Math.max(7, Math.min(17, Number(micCount) || 8));
  const chatMinHeight = Math.max(38, Math.round(170 - ((boundedMicCount - 7) * 13.2)));
  return (
  <View style={{ flex: 1, minHeight: chatMinHeight, minWidth: 0, paddingHorizontal: 12, paddingTop: 7, paddingBottom: 4 }}>
    <ScrollView ref={roomChatScrollRef} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onContentSizeChange={() => roomChatScrollRef.current?.scrollToEnd({ animated: true })}>
      {roomChatMessages.slice(-30).map(message => {
        const isPlainEntryNotice = message.system && (message.entryType === 'guidelines' || message.entryType === 'welcome');
        const hasSenderHeading = Boolean(message.sender?.display_name || message.sender) && !message.entryType;
        return (
          <View key={message.id} style={{ alignSelf: message.system ? 'center' : 'flex-start', maxWidth: '94%', backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', borderRadius: 0, paddingHorizontal: 0, paddingVertical: 1, marginBottom: 6 }}>
            {hasSenderHeading ? <Text style={{ color: message.system ? '#9CEBFF' : '#79D7EF', fontSize: 11, fontWeight: '900', marginBottom: 3 }}>{message.sender?.display_name || message.sender || 'TALKZY User'}</Text> : null}
            {message.image_url ? <Image source={{ uri: message.image_url }} style={{ width: 150, height: 90, borderRadius: 8 }} resizeMode="cover" /> : <Text style={{ color: C.text, fontSize: 11, lineHeight: 15, fontWeight: message.entryType === 'guidelines' ? '900' : '400' }}>{message.text || message.message_text}</Text>}
          </View>
        );
      })}
    </ScrollView>
  </View>
  );
})()}

<Modal visible={showMicControlPopup} transparent animationType="fade" onRequestClose={() => setShowMicControlPopup(false)}>
  <View style={{ flex: 1, backgroundColor: 'rgba(3,5,14,0.78)', justifyContent: 'center', padding: 22 }}>
    <View style={{ backgroundColor: '#14110D', borderRadius: 24, borderWidth: 1, borderColor: '#A9874A', padding: 18, shadowColor: '#D8B66D', shadowOpacity: 0.4, shadowRadius: 18, elevation: 14 }}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ color: '#F5F6FF', fontSize: 18, fontWeight: '900' }}>MIC CONTROL · {micControlSeat}</Text>
        <Text style={{ color: '#9CA9C9', fontSize: 11, marginTop: 4 }}>Room owner / admin controls</Text>
      </View>
      <TouchableOpacity onPress={() => {
        setShowMicControlPopup(false);
        const actionRoomId = selectedRoom?.id;
        const actionUserId = session?.user?.id;
        if (!actionRoomId || !actionUserId) return;
        const actionVersion = ++micSeatActionVersionRef.current;
        const isCurrentAction = () =>
          actionVersion === micSeatActionVersionRef.current &&
          activeAuthUserIdRef.current === actionUserId &&
          roomChatActiveRoomIdRef.current === actionRoomId;
        const occupied = micSeats.find(item => item.seat_number === micControlSeat);
        if (micControls.find(x => x.seat_number === micControlSeat)?.seat_closed) { Alert.alert('Seat closed', 'Open the seat first before taking it.'); return; }
        if (occupied && occupied.user_id !== actionUserId) { Alert.alert('Seat occupied', 'This mic is already occupied. Takeover is not enabled.'); return; }
        (async () => { try {
          if (!isCurrentAction()) return;
          if (occupied?.user_id === actionUserId) await api(`/api/rooms/${actionRoomId}/mic-seats`, { method: 'DELETE' });
          else await api(`/api/rooms/${actionRoomId}/mic-seats/${micControlSeat}`, { method: 'POST' });
          if (isCurrentAction()) await loadRoomMicSeats(actionRoomId);
        } catch (e) { if (isCurrentAction()) Alert.alert('Mic error', e.message); } })();
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#B99755', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#342818', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 23, color: '#E8C982' }}>♬</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>Take the mic</Text><Text style={{ color: '#D9C18F', fontSize: 11, marginTop: 2 }}>Join this seat or leave it if it's yours</Text></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const actionRoomId = selectedRoom?.id;
        const actionUserId = session?.user?.id;
        if (!actionRoomId || !actionUserId) return;
        const actionVersion = ++micSeatActionVersionRef.current;
        const isCurrentAction = () =>
          actionVersion === micSeatActionVersionRef.current &&
          activeAuthUserIdRef.current === actionUserId &&
          roomChatActiveRoomIdRef.current === actionRoomId;
        const closed = !!micControls.find(x => x.seat_number === micControlSeat)?.seat_closed; const action = closed ? 'open_seat' : 'close_seat';
        try {
          await api(`/api/rooms/${actionRoomId}/mic-seats/${micControlSeat}/control`, { method: 'PATCH', body: JSON.stringify({ action }) });
          if (!isCurrentAction()) return;
          await loadRoomMicSeats(actionRoomId);
          if (isCurrentAction()) setShowMicControlPopup(false);
        } catch (e) { if (isCurrentAction()) Alert.alert('Control failed', e.message); }
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#211A10', borderWidth: 1, borderColor: '#A9874A', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#342818', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <View style={{ width: 24, height: 18, borderWidth: 2, borderColor: '#E8C982', borderRadius: 4 }}><View style={{ position: 'absolute', width: 30, height: 3, backgroundColor: '#B85B52', top: 7, left: -4, transform: [{ rotate: '42deg' }] }} /></View>
        </View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? 'Open seat' : 'Close seat'}</Text><Text style={{ color: '#D3A5FF', fontSize: 11, marginTop: 2 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? 'Allow anyone to sit again' : 'Block everyone, including owner/admin'}</Text></View>
        <Text style={{ color: '#E8C982', fontSize: 18 }}>{micControls.find(x => x.seat_number === micControlSeat)?.seat_closed ? '↗' : '⛔'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const actionRoomId = selectedRoom?.id;
        const actionUserId = session?.user?.id;
        if (!actionRoomId || !actionUserId) return;
        const actionVersion = ++micSeatActionVersionRef.current;
        const isCurrentAction = () =>
          actionVersion === micSeatActionVersionRef.current &&
          activeAuthUserIdRef.current === actionUserId &&
          roomChatActiveRoomIdRef.current === actionRoomId;
        const closed = !!micControls.find(x => x.seat_number === micControlSeat)?.mic_closed; const action = closed ? 'open_mic' : 'close_mic';
        try {
          await api(`/api/rooms/${actionRoomId}/mic-seats/${micControlSeat}/control`, { method: 'PATCH', body: JSON.stringify({ action }) });
          if (!isCurrentAction()) return;
          await loadRoomMicSeats(actionRoomId);
          if (isCurrentAction()) setShowMicControlPopup(false);
        } catch (e) { if (isCurrentAction()) Alert.alert('Control failed', e.message); }
      }} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 15, backgroundColor: '#142B3B', borderWidth: 1, borderColor: '#43DCC5', marginBottom: 9 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#1A4051', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ color: '#43DCC5', fontSize: 24, fontWeight: '900' }}>♩</Text><View style={{ position: 'absolute', width: 28, height: 2, backgroundColor: '#FF6685', transform: [{ rotate: '45deg' }] }} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: '#F5F6FF', fontWeight: '900', fontSize: 14 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? 'Open mic' : 'Close mic'}</Text><Text style={{ color: '#A6E8F1', fontSize: 11, marginTop: 2 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? 'Allow the seated user to unmute' : 'Force mute this seat, even for owner'}</Text></View>
        <Text style={{ color: '#43DCC5', fontSize: 18 }}>{micControls.find(x => x.seat_number === micControlSeat)?.mic_closed ? '↗' : '🔇'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowMicControlPopup(false)} style={{ alignItems: 'center', paddingVertical: 11 }}><Text style={{ color: '#9CA9C9', fontWeight: '800' }}>Cancel</Text></TouchableOpacity>
    </View>
  </View>
</Modal>

                    
            {/* The chat feed below the microphone seats owns the flexible remaining room height. */}

      {/* ROOM POPUPS: overlay the room without resizing or scrolling the full screen */}
      {(showRoomGiftPanel || showRoomTools) && (
        <View
          style={{
            position: 'absolute',
            left: showRoomGiftPanel ? 10 : 12,
            right: showRoomGiftPanel ? 10 : 12,
            bottom: 86,
            maxHeight: showRoomTools ? '48%' : '58%',
            backgroundColor: showRoomGiftPanel ? '#101114' : C.card,
            borderRadius: showRoomGiftPanel ? 22 : 14,
            padding: showRoomGiftPanel ? 16 : 14,
            borderWidth: 1,
            borderColor: showRoomGiftPanel ? '#34343B' : C.line,
            zIndex: 30,
            elevation: 18
          }}
        >
          {showRoomGiftPanel ? (
            <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
              <TouchableOpacity onPress={() => { setShowRoomGiftPanel(false); setShowRoomTools(false); }} accessibilityRole="button" accessibilityLabel="Close gift popup" style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: '#25242B', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#C6C5D5', fontSize: 17 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Room Tools</Text>
              <TouchableOpacity onPress={() => { setShowRoomGiftPanel(false); setShowRoomTools(false); }} accessibilityRole="button" accessibilityLabel="Close popup" style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.muted, fontSize: 19 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {showRoomGiftPanel ? (
              <>
              <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  {['Popular', 'Luxury', 'Love', 'Special', 'Bag'].map(category => (
                    <TouchableOpacity key={category} onPress={() => setRoomGiftCategory(category)} activeOpacity={0.75} style={{ paddingBottom: 7, borderBottomWidth: roomGiftCategory === category ? 2 : 0, borderBottomColor: '#258BFF' }}>
                      <Text style={{ color: roomGiftCategory === category ? '#FFFFFF' : '#92929C', fontSize: 11, fontWeight: roomGiftCategory === category ? '800' : '600' }}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {roomGiftCategory === 'Bag' ? (
                  // Bag is reserved exclusively for gifts earned from verified events and milestones.
                  // Gifts sent by other users must never be added to this inventory.
                  <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 34, marginBottom: 7 }}>🎒</Text>
                    <Text style={{ color: '#A7A7B0', fontSize: 11 }}>Event and milestone rewards will appear here</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {[
                      { icon: '🌹', name: 'Rose', glow: '#492B45' },
                      { icon: '❤️', name: 'Heart', glow: '#482A3A' },
                      { icon: '💎', name: 'Diamond', glow: '#253D55' },
                      { icon: '🎂', name: 'Cake', glow: '#49364A' },
                      { icon: '🎸', name: 'Guitar', glow: '#493A2A' },
                      { icon: '👑', name: 'Crown', glow: '#4A3D25' },
                      { icon: '🚗', name: 'Car', glow: '#293B4E' },
                      { icon: '🎁', name: 'Gift Box', glow: '#3F2D50' }
                    ].map(gift => (
                      <TouchableOpacity
                        key={gift.name}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${gift.name} gift`}
                        onPress={() => setSelectedRoomGift(gift.name)}
                        activeOpacity={0.78}
                        style={{ width: '23.5%', minHeight: 82, marginBottom: 9, borderRadius: 12, backgroundColor: '#1B1B1F', borderWidth: selectedRoomGift === gift.name ? 2 : 1, borderColor: selectedRoomGift === gift.name ? '#258BFF' : '#34343B', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
                      >
                        <View style={{ width: 43, height: 43, borderRadius: 12, backgroundColor: gift.glow, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
                          <Text style={{ fontSize: 25 }}>{gift.icon}</Text>
                        </View>
                        <Text numberOfLines={1} style={{ color: '#E9E8F2', fontSize: 10, fontWeight: '700' }}>{gift.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#303039' }}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open wallet" onPress={() => Alert.alert('Wallet', 'Your wallet balance is shown here.')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#25242B', borderRadius: 18, paddingHorizontal: 9, paddingVertical: 7 }}>
                  <Text style={{ fontSize: 13, marginRight: 5 }}>🪙</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{Number(walletBalance || 0).toLocaleString()}</Text>
                  <Text style={{ color: '#A7A7B0', fontSize: 11, marginLeft: 5 }}>↗</Text>
                </TouchableOpacity>
                <View style={{ position: 'relative', zIndex: 5 }}>
                  {showRoomGiftQuantityOptions ? (
                    <View style={{ position: 'absolute', bottom: 38, right: 0, width: 72, backgroundColor: '#25242B', borderRadius: 9, borderWidth: 1, borderColor: '#45454F', padding: 4, elevation: 8 }}>
                      {['1', '7', '77', '777', '1777', '7777'].map(value => (
                        <TouchableOpacity key={value} onPress={() => { setRoomGiftQuantity(value); setShowRoomGiftQuantityOptions(false); }} style={{ paddingVertical: 5, alignItems: 'center', borderRadius: 5, backgroundColor: roomGiftQuantity === value ? '#343B49' : 'transparent' }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{value}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                  <TouchableOpacity onPress={() => setShowRoomGiftQuantityOptions(value => !value)} accessibilityRole="button" accessibilityLabel="Select gift quantity" style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#25242B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#41414B' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginRight: 7 }}>{roomGiftQuantity}</Text>
                    <Text style={{ color: '#A7A7B0', fontSize: 12 }}>⌃</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Gifting', 'Gift sending will be enabled when the gifting transaction system is implemented.')} accessibilityRole="button" accessibilityLabel="Send selected gift" style={{ backgroundColor: '#D9A83C', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 9 }}>
                  <Text style={{ color: '#171717', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>SEND</Text>
                </TouchableOpacity>
              </View>
              </>
            ) : (
              (() => {
                const isCurrentRoomOwner = selectedRoom?.owner_id === session?.user?.id;
                const myPresence = roomPresence.find(person => person.user_id === session?.user?.id);
                const isCurrentRoomAdmin = myPresence?.presence_role === 'admin';
                // Keep the four-square menu in sync with the Room Shortcuts > Quick Access collection.
                // Visibility follows the same role rules used by the room's owner-only/admin shortcuts.
                const roomToolItems = [
                  { shortcutKey: 'music', title: 'Music' },
                  ...((isCurrentRoomAdmin || isCurrentRoomOwner) ? [{ shortcutKey: 'youtube', title: 'YouTube' }] : []),
                  { shortcutKey: 'effects', title: 'Effect' },
                  { shortcutKey: 'propStore', title: 'My Props' },
                  { shortcutKey: 'luckyNo', title: 'Lucky Number' },
                  { shortcutKey: 'dice', title: 'Dice' },
                  { shortcutKey: 'luckyBag', title: 'Lucky Bag' },
                  ...((isCurrentRoomAdmin || isCurrentRoomOwner) ? [{ shortcutKey: 'clearChat', title: 'Clear Chat' }] : []),
                  ...(isCurrentRoomOwner ? [{ shortcutKey: 'activity', title: 'Activity' }, { shortcutKey: 'theme', title: 'Theme' }] : [])
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
                        const clearRoomId = selectedRoom?.id;
                        if (!clearRoomId) return;
                        Alert.alert('Clear Room Chat', 'Are you sure you want to clear all chat messages?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Clear', style: 'destructive', onPress: async () => {
                            try {
                              await api(`/api/rooms/${clearRoomId}/messages`, { method: 'DELETE' });
                              if (roomChatActiveRoomIdRef.current === clearRoomId) {
                                setRoomChatMessages([]);
                                await loadRoomMessages(clearRoomId);
                              }
                            } catch (error) {
                              if (roomChatActiveRoomIdRef.current === clearRoomId) {
                                Alert.alert('Clear Chat', error.message || 'Could not clear room chat.');
                              }
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
                        const canBrowseYoutube = selectedRoom?.owner_id === session?.user?.id || roomPresence.some(person => person.user_id === session?.user?.id && person.presence_role === 'admin');
                        youtubePanelDismissedRef.current = false;
                        setShowYoutubePanel(canBrowseYoutube || Boolean(youtubeState.video_id));
                        if (canBrowseYoutube) {
                          setYoutubeBrowseTab('Music');
                          setYoutubeBrowseUrl('https://www.youtube.com/results?search_query=music');
                          setYoutubePickedItem(null);
                          setShowYoutubePicker(true);
                        }
                        loadYoutubeState(true);
                      } else if (tool.title === 'Music') {
                        setShowMusicPanel(true);
                      } else if (tool.title === 'Theme') {
                        setRoomThemePage('catalog');
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
                      } else if (tool.title === 'Effect') {
                        setShowSpecialEffectSettings(true);
                      } else {
                        Alert.alert(tool.title, `${tool.title} will be available here soon.`);
                      }
                    }}
                    style={{ width: '33.333%', paddingVertical: 12, alignItems: 'center' }}
                  >
                    <RoomShortcutIcon type={tool.shortcutKey} size={48} />
                    <Text style={{ color: C.text, fontSize: 12, marginTop: 5 }}>{tool.title}</Text>
                  </TouchableOpacity>
                ));
              })()
            )}
          </ScrollView>
        </View>
      )}


      <Modal
        visible={showSpecialEffectSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpecialEffectSettings(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#11172B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#394568', elevation: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>Special effect setting</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close special effect settings"
                onPress={() => setShowSpecialEffectSettings(false)}
                style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#252D45', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: C.text, fontSize: 17 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: '#293453', marginBottom: 4 }} />
            {[
              { label: 'Enter room effect', value: enterRoomEffectEnabled, setter: setEnterRoomEffectEnabled },
              { label: 'Gift effect', value: giftEffectEnabled, setter: setGiftEffectEnabled },
              { label: 'Gift banner', value: giftBannerEnabled, setter: setGiftBannerEnabled }
            ].map((item, index) => (
              <View key={item.label}>
                <View style={{ minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: '700', flex: 1 }}>{item.label}</Text>
                  <TouchableOpacity
                    accessibilityRole="switch"
                    accessibilityState={{ checked: item.value }}
                    accessibilityLabel={item.label}
                    activeOpacity={0.85}
                    onPress={() => item.setter(value => !value)}
                    style={{
                      width: 52, height: 30, borderRadius: 16, padding: 3,
                      backgroundColor: item.value ? '#20B765' : '#777D89',
                      justifyContent: 'center', alignItems: item.value ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' }} />
                  </TouchableOpacity>
                </View>
                {index < 2 && <View style={{ height: 1, backgroundColor: '#293453' }} />}
              </View>
            ))}
          </View>
        </View>
      </Modal>


      {showRocketPanel && screen === 'roomInterior' && selectedRoom && (
        <View style={{ position:'absolute', left:8, right:8, top:44, bottom:70, backgroundColor:'#0D0918', borderRadius:28, padding:16, borderWidth:2, borderColor:'#D8B66D', zIndex:46, elevation:34 }}>
          <View pointerEvents="none" style={{ position:'absolute',top:6,left:6,right:6,bottom:6,borderRadius:23,borderWidth:1,borderColor:'rgba(239,207,137,0.28)' }} />
          <View style={{ position:'absolute',top:0,left:28,right:28,height:3,backgroundColor:'#F2D99B',borderRadius:3 }} />
          <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:8,marginBottom:12 }}>
            <TouchableOpacity onPress={()=>setShowTreasureRules(true)} accessibilityRole="button" accessibilityLabel="Treasure rules" style={{ width:24,height:24,borderRadius:12,backgroundColor:'#241630',borderWidth:1,borderColor:'#A9864D',alignItems:'center',justifyContent:'center' }}>
              <Text style={{ color:'#E7C16C',fontSize:13,fontWeight:'900',lineHeight:16 }}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setShowRocketPanel(false)} accessibilityRole="button" accessibilityLabel="Close Treasure" style={{ width:38,height:38,borderRadius:13,backgroundColor:'#241630',borderWidth:1.3,borderColor:'#C7A15F',alignItems:'center',justifyContent:'center' }}>
              <Text style={{ color:'#F4E8D2',fontSize:23,fontWeight:'700' }}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:16 }}>
            <View style={{ borderRadius:23,backgroundColor:'#171025',borderWidth:1.5,borderColor:'#A9864D',alignItems:'center',padding:15,paddingTop:19,overflow:'hidden' }}>
              <View style={{ position:'absolute',top:-55,width:250,height:250,borderRadius:125,borderWidth:1,borderColor:'rgba(211,177,112,0.20)' }} />
              <View style={{ position:'absolute',top:-28,width:195,height:195,borderRadius:98,borderWidth:1,borderColor:'rgba(211,177,112,0.12)' }} />
              <View style={{ position:'absolute',width:220,height:220,borderRadius:110,borderWidth:1,borderColor:'rgba(232,197,126,0.18)',backgroundColor:'rgba(169,126,64,0.035)' }} />
              <Text style={{ color:'#D8BD83',fontSize:9,fontWeight:'900',letterSpacing:2.4 }}>THE ROCKET COLLECTION</Text>
              <Text style={{ color:'#F6EBD7',fontSize:16,fontWeight:'900',letterSpacing:1,marginTop:4 }}>LEVEL {treasureLevel}</Text>
              <View style={{ width:'100%',height:190,alignItems:'center',justifyContent:'center',flexDirection:'row' }}>
                {(treasureLevel===1
                  ? [{w:48,h:126,accent:'#65D58A',main:true}]
                  : treasureLevel===2
                    ? [{w:34,h:112,accent:'#9B70E8'},{w:47,h:145,accent:'#C4A0FF',main:true},{w:34,h:112,accent:'#9B70E8'}]
                    : treasureLevel===3
                      ? [{w:36,h:116,accent:'#D95763'},{w:48,h:146,accent:'#F27B83',main:true},{w:36,h:116,accent:'#D95763'}]
                      : treasureLevel===4
                        ? [{w:60,h:166,accent:'#69B9F0',main:true,shuttle:true}]
                        : [{w:35,h:112,accent:'#C49B4F'},{w:56,h:142,accent:'#E7C16C',main:true,shuttle:true},{w:35,h:112,accent:'#C49B4F'}]
                ).map((item,i)=>(
                  <View key={i} style={{ width:item.w+8,height:item.h+18,marginHorizontal:1,alignItems:'center',justifyContent:'flex-end' }}>
                    {item.shuttle && <View style={{ position:'absolute',bottom:20,width:item.w+30,height:24,backgroundColor:'#B9C7D9',borderWidth:1,borderColor:'#F3DDA9',borderRadius:8,transform:[{skewX:'-10deg'}] }} />}
                    <View style={{ position:'absolute',top:0,width:0,height:0,borderLeftWidth:item.w*0.48,borderRightWidth:item.w*0.48,borderBottomWidth:30,borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:item.main?'#F0E9DF':'#D5D5DF' }} />
                    <View style={{ width:item.w,height:item.h-16,backgroundColor:item.main?'#E7E7EC':'#C9CED8',borderRadius:item.w/2,borderWidth:1.5,borderColor:'#FFF4D9',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
                      <View style={{ position:'absolute',top:17,width:'100%',height:8,backgroundColor:item.accent }} />
                      <View style={{ width:item.w*0.42,height:item.w*0.42,borderRadius:item.w,backgroundColor:'#17243A',borderWidth:3,borderColor:item.accent,marginTop:5 }} />
                      <View style={{ position:'absolute',bottom:22,width:'72%',height:7,borderRadius:3,backgroundColor:item.accent }} />
                      <View style={{ position:'absolute',left:4,top:42,width:3,height:item.h*0.35,backgroundColor:'rgba(255,255,255,0.52)',borderRadius:2 }} />
                    </View>
                    <View style={{ position:'absolute',bottom:8,left:0,width:13,height:28,backgroundColor:item.accent,borderBottomLeftRadius:5,transform:[{skewY:'-25deg'}] }} />
                    <View style={{ position:'absolute',bottom:8,right:0,width:13,height:28,backgroundColor:item.accent,borderBottomRightRadius:5,transform:[{skewY:'25deg'}] }} />
                    <View style={{ position:'absolute',bottom:-2,width:item.main?18:12,height:20,backgroundColor:item.accent,borderRadius:12,opacity:0.65 }} />
                  </View>
                ))}
              </View>
              <Text style={{ color:'#F3E5C9',fontSize:15,fontWeight:'900',letterSpacing:1.15,marginTop:1 }}>
                {['','EMERALD IGNITION','PURPLE BOOSTER','CRIMSON CLUSTER','SAPPHIRE SHUTTLE','ROYAL ORBITER'][treasureLevel]}
              </Text>
              <Text style={{ color:'#B9AFC8',fontSize:10,marginTop:5,textAlign:'center' }}>
                {treasureLevel===1?'A sleek emerald-powered launch vehicle':treasureLevel===2?'A three-core booster with royal violet trim':treasureLevel===3?'A powerful triple-engine crimson rocket':treasureLevel===4?'A sapphire space shuttle with gold detailing':'The royal orbiter with twin support boosters'}
              </Text>
              <View style={{ width:'100%',marginTop:14,paddingHorizontal:4 }}>
                <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:7 }}>
                  <Text style={{ color:'#E7C16C',fontSize:15,fontWeight:'900' }}>0%</Text>
                  <Text style={{ color:'#D6A94F',fontSize:10,fontWeight:'800' }}>DAILY PROGRESS</Text>
                </View>
                <View style={{ height:13,width:'100%',borderRadius:10,backgroundColor:'#30243E',borderWidth:1,borderColor:'#80643C',overflow:'hidden' }}>
                  <View style={{ height:'100%',width:'0%',borderRadius:10,backgroundColor:'#D6A94F' }} />
                </View>
              </View>
            </View>
            <View style={{ flexDirection:'row',justifyContent:'space-between',marginTop:13,marginBottom:7 }}>
              {[
                {level:1,color:'#65D58A',name:'EMERALD'},
                {level:2,color:'#B78BFF',name:'PURPLE'},
                {level:3,color:'#F06B70',name:'CRIMSON'},
                {level:4,color:'#69B9F0',name:'SAPPHIRE'},
                {level:5,color:'#E7C16C',name:'ROYAL'}
              ].map(item=>(
                <TouchableOpacity key={item.level} onPress={()=>{setTreasureLevel(item.level);setTreasureRewardTab('TOP 1');}} style={{ flex:1,alignItems:'center',paddingVertical:11,marginHorizontal:2,borderRadius:14,backgroundColor:treasureLevel===item.level?'#39254F':'#191225',borderWidth:treasureLevel===item.level?2:1.2,borderColor:treasureLevel===item.level?'#E5C47C':'#574267' }}>
                  <Text style={{ color:item.color,fontSize:12,fontWeight:'900' }}>LV {item.level}</Text>
                  <Text style={{ color:treasureLevel===item.level?'#F3E8D5':'#9D91A9',fontSize:7,marginTop:4,fontWeight:'800',letterSpacing:0.25 }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop:8,marginBottom:5 }}>
              <Text style={{ color:'#F3E5C9',fontSize:16,fontWeight:'900',letterSpacing:0.8,marginBottom:13 }}>RANKING</Text>
              <View style={{ flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between' }}>
                <View style={{ flex:1,alignItems:'center',paddingTop:27 }}>
                  <View style={{ width:58,height:58,borderRadius:29,backgroundColor:'#30243E',borderWidth:2,borderColor:'#C5CBD8',alignItems:'center',justifyContent:'center' }}>
                    <View style={{ width:15,height:15,borderRadius:8,backgroundColor:'#C5CBD8',marginBottom:3 }} />
                    <View style={{ width:29,height:14,borderTopLeftRadius:16,borderTopRightRadius:16,backgroundColor:'#C5CBD8' }} />
                  </View>
                  <Text style={{ color:'#C5CBD8',fontSize:15,fontWeight:'900',marginTop:5 }}>2</Text>
                  <Text numberOfLines={1} style={{ color:'#F5EBDD',fontSize:11,fontWeight:'800',marginTop:5,maxWidth:'100%' }}>—</Text>
                  <Text style={{ color:'#E7C16C',fontSize:11,fontWeight:'900',marginTop:3 }}>0</Text>
                </View>
                <View style={{ flex:1,alignItems:'center' }}>
                  <Text style={{ color:'#E7C16C',fontSize:22,marginBottom:2 }}>♛</Text>
                  <View style={{ width:78,height:78,borderRadius:39,backgroundColor:'#30243E',borderWidth:3,borderColor:'#E7C16C',alignItems:'center',justifyContent:'center' }}>
                    <View style={{ width:19,height:19,borderRadius:10,backgroundColor:'#E7C16C',marginBottom:4 }} />
                    <View style={{ width:39,height:19,borderTopLeftRadius:22,borderTopRightRadius:22,backgroundColor:'#E7C16C' }} />
                  </View>
                  <Text style={{ color:'#E7C16C',fontSize:19,fontWeight:'900',marginTop:4 }}>1</Text>
                  <Text numberOfLines={1} style={{ color:'#F5EBDD',fontSize:12,fontWeight:'900',marginTop:4,maxWidth:'100%' }}>—</Text>
                  <Text style={{ color:'#E7C16C',fontSize:13,fontWeight:'900',marginTop:3 }}>0</Text>
                </View>
                <View style={{ flex:1,alignItems:'center',paddingTop:27 }}>
                  <View style={{ width:58,height:58,borderRadius:29,backgroundColor:'#30243E',borderWidth:2,borderColor:'#C58B61',alignItems:'center',justifyContent:'center' }}>
                    <View style={{ width:15,height:15,borderRadius:8,backgroundColor:'#C58B61',marginBottom:3 }} />
                    <View style={{ width:29,height:14,borderTopLeftRadius:16,borderTopRightRadius:16,backgroundColor:'#C58B61' }} />
                  </View>
                  <Text style={{ color:'#C58B61',fontSize:15,fontWeight:'900',marginTop:5 }}>3</Text>
                  <Text numberOfLines={1} style={{ color:'#F5EBDD',fontSize:11,fontWeight:'800',marginTop:5,maxWidth:'100%' }}>—</Text>
                  <Text style={{ color:'#E7C16C',fontSize:11,fontWeight:'900',marginTop:3 }}>0</Text>
                </View>
              </View>
            </View>
            <View style={{ height:1,backgroundColor:'#80643C',marginVertical:13 }} />
            <Text style={{ color:'#F3E5C9',fontSize:16,fontWeight:'900',letterSpacing:0.8,marginBottom:11 }}>REWARDS</Text>
            <View style={{ flexDirection:'row',gap:8,marginBottom:12 }}>
              {['TOP 1','TOP 2','TOP 3'].map(tab=>(
                <TouchableOpacity key={tab} onPress={()=>setTreasureRewardTab(tab)} style={{ flex:1,alignItems:'center',paddingVertical:12,borderRadius:12,backgroundColor:treasureRewardTab===tab?'#49331B':'#191225',borderWidth:treasureRewardTab===tab?2:1,borderColor:treasureRewardTab===tab?'#E7C16C':'#574267' }}>
                  <Text style={{ color:treasureRewardTab===tab?'#F4D48A':'#C9BBD8',fontSize:12,fontWeight:'900' }}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:'#191225',borderRadius:17,borderWidth:1,borderColor:'#80643C',paddingVertical:13,paddingHorizontal:8 }}>
              {[
                {symbol:'♜',color:treasureRewardTab==='TOP 1'?'#E7C16C':'#9A8B75'},
                {symbol:'♛',color:treasureRewardTab==='TOP 2'?'#C5CBD8':'#9A8B75'},
                {symbol:'🏆',color:treasureRewardTab==='TOP 3'?'#C58B61':'#9A8B75'}
              ].map((reward,index)=>(
                <View key={index} style={{ width:72,height:72,borderRadius:15,backgroundColor:'#241A30',borderWidth:1,borderColor:reward.color,alignItems:'center',justifyContent:'center' }}>
                  <Text style={{ color:reward.color,fontSize:35 }}>{reward.symbol}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        {showTreasureRules && (
            <View style={{ position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:80,elevation:80,backgroundColor:'rgba(5,4,12,0.96)',borderRadius:25,padding:18,borderWidth:1.5,borderColor:'#D8B66D' }}>
              <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
                <Text style={{ color:'#F3E5C9',fontSize:17,fontWeight:'900',letterSpacing:1 }}>RULES</Text>
                <TouchableOpacity onPress={()=>setShowTreasureRules(false)} accessibilityRole="button" accessibilityLabel="Close rules" style={{ width:32,height:32,borderRadius:11,backgroundColor:'#241630',borderWidth:1,borderColor:'#C7A15F',alignItems:'center',justifyContent:'center' }}>
                  <Text style={{ color:'#F4E8D2',fontSize:21,fontWeight:'700' }}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:12 }}>
                {[
                  'You can increase the energy bar of the rocket by sending gifts in the room.',
                  'When the energy bar of the rocket is full, the rocket will automatically launch and brust various rewards.',
                  'The top 3 contributors will receive verious rewards and rest of the users in the room will have the opportunity to receive lucky rewards.',
                  'The higher the level of rocket, the more valuable the reward.',
                  'The reward will be automatically distributed to the backpack.',
                  'The energy bar of the rocket will be cleared and reset everyday at 00:00 Indian time (GTM + 5:30)'
                ].map((rule,index)=>(
                  <View key={index} style={{ flexDirection:'row',alignItems:'flex-start',marginBottom:16 }}>
                    <View style={{ width:25,height:25,borderRadius:13,backgroundColor:'#39254F',borderWidth:1,borderColor:'#C7A15F',alignItems:'center',justifyContent:'center',marginRight:10,marginTop:1 }}>
                      <Text style={{ color:'#E7C16C',fontSize:12,fontWeight:'900' }}>{index+1}</Text>
                    </View>
                    <Text style={{ flex:1,color:'#F3EBDD',fontSize:13,lineHeight:20,fontWeight:'500' }}>{rule}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
      <RoomGames visible={showRoomGamePanel && screen === 'roomInterior' && !!selectedRoom} onClose={() => setShowRoomGamePanel(false)} onGameAvailable={() => setShowRoomGamePanel(true)} roomId={selectedRoom?.id} creatorName={profile?.display_name || displayName || session?.user?.user_metadata?.full_name || 'Player'} userId={session?.user?.id} supabase={supabase} isAuthorisedStarter={selectedRoom?.owner_id===session?.user?.id || roomPresence.some(person=>person.user_id===session?.user?.id && person.presence_role==='admin')} hasRoomSeat={micSeats.some(seat=>seat.user_id===session?.user?.id)} roomMembers={roomPresence} selfProfile={profile} />

      {showGreedyPanel && screen === 'roomInterior' && selectedRoom && (
        <View style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 86,
          backgroundColor: 'rgba(18, 13, 37, 0.98)',
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: '#7044B8',
          zIndex: 44,
          elevation: 26
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 21, marginRight: 8 }}>🎲</Text>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '900' }}>Greedy</Text>
            </View>
            <TouchableOpacity onPress={() => setShowGreedyPanel(false)} style={{ paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{
            minHeight: 126,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#49316E',
            backgroundColor: 'rgba(112, 68, 184, 0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18
          }}>
            <Text style={{ fontSize: 34, marginBottom: 9 }}>🪙</Text>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Greedy games are coming</Text>
            <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 7, lineHeight: 17 }}>
              This section is ready. The game list and coin entry details will be added after the games are decided.
            </Text>
          </View>
          <Text style={{ color: '#B99AE8', fontSize: 10, textAlign: 'center', marginTop: 10 }}>
            Private panel · Only visible to you
          </Text>
        </View>
      )}

      <Modal
        visible={showRoomThemeMenu && selectedRoom?.owner_id === session?.user?.id}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          if (roomThemePage === 'review') setRoomThemePage('custom');
          else if (roomThemePage === 'custom') setRoomThemePage('catalog');
          else setShowRoomThemeMenu(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#080D19' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#27334A' }}>
            <TouchableOpacity onPress={() => {
              if (roomThemePage === 'review') setRoomThemePage('custom');
              else if (roomThemePage === 'custom') setRoomThemePage('catalog');
              else setShowRoomThemeMenu(false);
            }} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#172238', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#F7F4EA', fontSize: 24 }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ color: '#F7F4EA', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 }}>
              {roomThemePage === 'catalog' ? 'Room Themes' : roomThemePage === 'custom' ? 'Custom Room Theme' : 'Review Image'}
            </Text>
            {roomThemePage === 'catalog' ? (
              <TouchableOpacity onPress={() => { setRoomThemeDraftUri(null); setRoomThemeDuration(7); setRoomThemePage('custom'); }} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#6A50B8', borderWidth: 1, borderColor: '#BDA8FF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '500', lineHeight: 29 }}>＋</Text>
              </TouchableOpacity>
            ) : <View style={{ width: 40 }} />}
          </View>

          {roomThemePage === 'catalog' && (
            <>
              <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingTop: 14, gap: 8 }}>
                {['Theme', 'Premium', 'Own'].map(tab => (
                  <TouchableOpacity key={tab} onPress={() => setRoomThemeTab(tab)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: roomThemeTab === tab ? '#6249B4' : '#141F33', borderWidth: 1, borderColor: roomThemeTab === tab ? '#B7A2FF' : '#2A3850', alignItems: 'center' }}>
                    <Text style={{ color: roomThemeTab === tab ? '#FFFFFF' : '#AEBBD2', fontWeight: '900', fontSize: 12 }}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                {roomThemeTab === 'Theme' && (
                  <View>
                    <Text style={{ color: '#EDEAFF', fontSize: 15, fontWeight: '900', marginBottom: 5 }}>Free Company Themes</Text>
                    <Text style={{ color: '#9EABC3', fontSize: 11, lineHeight: 17, marginBottom: 15 }}>Room themes provided by TALKZY. Select a theme to use it for free.</Text>
                    <View style={{ minHeight: 210, borderRadius: 19, borderWidth: 1, borderColor: '#2C3B56', backgroundColor: '#111B2D', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
                      <Text style={{ fontSize: 38 }}>✦</Text>
                      <Text style={{ color: '#F4F1FF', fontWeight: '900', marginTop: 12 }}>Company themes will appear here</Text>
                      <Text style={{ color: '#9EABC3', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 }}>Free backgrounds curated and provided by TALKZY.</Text>
                    </View>
                  </View>
                )}
                {roomThemeTab === 'Premium' && (
                  <View>
                    <Text style={{ color: '#F4E9FF', fontSize: 15, fontWeight: '900', marginBottom: 5 }}>Premium Themes</Text>
                    <Text style={{ color: '#C1B1D9', fontSize: 11, lineHeight: 17, marginBottom: 15 }}>Exclusive company themes available to purchase with coins.</Text>
                    <View style={{ minHeight: 210, borderRadius: 19, borderWidth: 1, borderColor: '#70569D', backgroundColor: '#211832', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
                      <Text style={{ fontSize: 38 }}>♛</Text>
                      <Text style={{ color: '#FFF0D1', fontWeight: '900', marginTop: 12 }}>Premium collection</Text>
                      <Text style={{ color: '#C1B1D9', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 }}>Paid themes provided by TALKZY will appear here with their coin prices.</Text>
                    </View>
                  </View>
                )}
                {roomThemeTab === 'Own' && (
                  <View>
                    {roomThemeOwnItems.length === 0 ? (
                      <View style={{ alignItems: 'center', paddingVertical: 46, paddingHorizontal: 22, borderRadius: 19, backgroundColor: '#111B2D', borderWidth: 1, borderColor: '#2A3850' }}>
                        <Text style={{ fontSize: 38 }}>▧</Text>
                        <Text style={{ color: '#F4F1FF', fontWeight: '900', marginTop: 12 }}>Your themes will appear here</Text>
                        <Text style={{ color: '#9EABC3', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 }}>Only themes you have purchased or custom themes approved by TALKZY administration will be shown here.</Text>
                      </View>
                    ) : roomThemeOwnItems.map((item, index) => (
                      <View key={item.id || index} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, backgroundColor: '#111B2D', marginBottom: 9 }}>
                        <Image source={{ uri: item.uri }} style={{ width: 58, height: 82, borderRadius: 9 }} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{item.name || 'Owned Theme'}</Text>
                          <Text style={{ color: '#AAB7D0', fontSize: 11, marginTop: 4 }}>Owned theme</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </>
          )}

          {roomThemePage === 'custom' && (
            <ScrollView contentContainerStyle={{ padding: 17, paddingBottom: 34 }}>
              <Text style={{ color: '#F4F1FF', fontSize: 15, fontWeight: '900' }}>Create your room background</Text>
              <Text style={{ color: '#9EABC3', fontSize: 11, lineHeight: 17, marginTop: 5, marginBottom: 17 }}>Choose a vertical image, review it, then confirm to continue.</Text>
              <TouchableOpacity onPress={async () => {
                try {
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permission.granted) { Alert.alert('Photo permission required', 'Allow gallery access to choose your room theme.'); return; }
                  const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [9, 16], quality: 0.9 });
                  if (!picked.canceled && picked.assets?.[0]?.uri) {
                    setRoomThemeDraftUri(picked.assets[0].uri);
                    setRoomThemePage('review');
                  }
                } catch (error) { Alert.alert('Theme image error', error?.message || 'Could not open your gallery.'); }
              }} style={{ minHeight: 245, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#8E78D3', backgroundColor: '#131D32', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {roomThemeDraftUri ? (
                  <Image source={{ uri: roomThemeDraftUri }} style={{ width: '100%', height: 245 }} resizeMode="cover" />
                ) : (
                  <>
                    <View style={{ width: 66, height: 66, borderRadius: 22, backgroundColor: '#282047', borderWidth: 1, borderColor: '#9276D8', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#E7DFFF', fontSize: 31 }}>＋</Text>
                    </View>
                    <Text style={{ color: '#F4F1FF', fontWeight: '900', marginTop: 15 }}>Select Part</Text>
                    <Text style={{ color: '#9EABC3', fontSize: 11, marginTop: 5 }}>Tap here to open your phone gallery</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={{ color: '#DCE4F5', fontSize: 12, fontWeight: '900', marginTop: 22, marginBottom: 10 }}>Select Duration</Text>
              <View style={{ flexDirection: 'row', gap: 9 }}>
                {[7, 15, 30].map(days => (
                  <TouchableOpacity key={days} onPress={() => setRoomThemeDuration(days)} style={{ flex: 1, paddingVertical: 14, borderRadius: 13, alignItems: 'center', backgroundColor: roomThemeDuration === days ? '#6249B4' : '#152137', borderWidth: 1, borderColor: roomThemeDuration === days ? '#BDA8FF' : '#2B3A54' }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15 }}>{days}</Text>
                    <Text style={{ color: '#D2C8F4', fontSize: 10, fontWeight: '800', marginTop: 2 }}>DAYS</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: '#DCE4F5', fontSize: 12, fontWeight: '900', marginTop: 21, marginBottom: 9 }}>Coins</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#6E5A32', backgroundColor: '#211D18' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 23, marginRight: 10 }}>🪙</Text>
                  <View>
                    <Text style={{ color: '#FFE4A6', fontWeight: '900', fontSize: 13 }}>Custom theme price</Text>
                    <Text style={{ color: '#B9A98B', fontSize: 10, marginTop: 3 }}>Price configured by TALKZY</Text>
                  </View>
                </View>
                <Text style={{ color: '#FFE4A6', fontWeight: '900', fontSize: 15 }}>—</Text>
              </View>
              <TouchableOpacity disabled={!roomThemeDraftUri} onPress={() => Alert.alert('Purchase not connected yet', 'This is the layout preview. Coin pricing, payment and administration approval will be connected in the next implementation stage.')} style={{ marginTop: 20, paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: roomThemeDraftUri ? '#6A50B8' : '#30394A', borderWidth: 1, borderColor: roomThemeDraftUri ? '#BDA8FF' : '#46516A', opacity: roomThemeDraftUri ? 1 : 0.55 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>BUY WITH COINS</Text>
              </TouchableOpacity>
              <Text style={{ color: '#8492AB', fontSize: 10, textAlign: 'center', marginTop: 10, lineHeight: 15 }}>Your custom theme will be added to Own only after administration approval.</Text>
            </ScrollView>
          )}

          {roomThemePage === 'review' && (
            <View style={{ flex: 1, padding: 17, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#F4F1FF', fontSize: 15, fontWeight: '900' }}>Review your selected image</Text>
                <Text style={{ color: '#9EABC3', fontSize: 11, lineHeight: 17, marginTop: 5, marginBottom: 17 }}>Check the crop before confirming your custom room theme.</Text>
                {roomThemeDraftUri ? <Image source={{ uri: roomThemeDraftUri }} style={{ width: '100%', height: undefined, aspectRatio: 9 / 13, borderRadius: 19, backgroundColor: '#141F33' }} resizeMode="cover" /> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 12 }}>
                <TouchableOpacity onPress={async () => {
                  try {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) { Alert.alert('Photo permission required', 'Allow gallery access to choose another image.'); return; }
                    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [9, 16], quality: 0.9 });
                    if (!picked.canceled && picked.assets?.[0]?.uri) setRoomThemeDraftUri(picked.assets[0].uri);
                  } catch (error) { Alert.alert('Theme image error', error?.message || 'Could not reopen your gallery.'); }
                }} style={{ flex: 1, paddingVertical: 15, borderRadius: 13, alignItems: 'center', backgroundColor: '#172238', borderWidth: 1, borderColor: '#566581' }}>
                  <Text style={{ color: '#E7EAF4', fontWeight: '900' }}>RESELECT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRoomThemePage('custom')} style={{ flex: 1, paddingVertical: 15, borderRadius: 13, alignItems: 'center', backgroundColor: '#6A50B8', borderWidth: 1, borderColor: '#BDA8FF' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      <RoomMusicPanel visible={showMusicPanel} roomId={selectedRoom?.id} userId={session?.user?.id} api={api} supabase={supabase} colors={C} onClose={() => { setShowMusicPanel(false); setMusicMinimized(false); }} onMinimize={() => { setShowMusicPanel(false); setMusicMinimized(true); }} />
      {showLuckyBagPopup && (
        <Modal
          visible={showLuckyBagPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLuckyBagPopup(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.10)', justifyContent: 'flex-end', paddingHorizontal: 0 }}>
            <View style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', borderWidth: 2, borderBottomWidth: 0, borderColor: '#FFE2A0', backgroundColor: '#F58C67', height: '59%', maxHeight: '66%' }}>
              <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, backgroundColor: '#F6A16F' }}>
                <TouchableOpacity onPress={() => Alert.alert('Lucky Bag', 'Choose Room or World, select the gold coins and quantity, then send. The selected amount is deducted from your wallet. Each user, including the creator, can open the shared bag once. Unclaimed coins are refunded when the 3-minute bag expires.')} style={{ position: 'absolute', right: 52, top: 14, zIndex: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFE7B5', borderWidth: 1, borderColor: '#9A421D', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#8A3517', fontSize: 14, fontWeight: '900' }}>?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLuckyBagPopup(false)} style={{ position: 'absolute', right: 15, top: 14, zIndex: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: '#44266B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#E9D8FF', fontSize: 17, fontWeight: '800' }}>×</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Animated.View style={{ width: 88, height: 88, borderRadius: 27, backgroundColor: '#4B267B', borderWidth: 1.5, borderColor: '#E5C16B', alignItems: 'center', justifyContent: 'center', shadowColor: '#A9874A', shadowOpacity: 0.55, shadowRadius: 18, elevation: 9, transform: [{ scale: luckyBagPulse }] }}>
                    <View style={{ position: 'absolute', width: 70, height: 70, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(226,190,255,0.35)' }} />
                    <Text style={{ fontSize: 50 }}>🧧</Text>
                    <Text style={{ position: 'absolute', bottom: -7, right: -7, fontSize: 24 }}>✨</Text>
                  </Animated.View>
                  <Text style={{ color: '#FFE7A8', fontSize: 22, fontWeight: '900', marginTop: 11, letterSpacing: 0.4 }}>LUCKY BAG</Text>
                  <Text style={{ color: '#CBB6F4', fontSize: 12, marginTop: 4 }}>Spread luck. Share the sparkle.</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: '#E87548', borderRadius: 28, padding: 4, marginTop: 12, borderWidth: 2, borderColor: '#FFE5B2' }}>
                  {['Room', 'World'].map(tab => (
                    <TouchableOpacity key={tab} onPress={() => { setLuckyBagTab(tab); setLuckyBagCoins(tab === 'Room' ? 20000 : 1000000); setLuckyBagQuantity(tab === 'Room' ? 3 : 30); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: luckyBagTab === tab ? '#F04445' : '#F58A35', borderWidth: luckyBagTab === tab ? 2 : 0, borderColor: '#FFE3A6' }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>{tab === 'World' ? '🌍  WORLD' : '🏠  ROOM'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#F58C67' }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18 }}>
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
                    <Text style={{ color: '#8A3D13', fontWeight: '900', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Coins</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: '#F58A35', borderRadius: 28, borderWidth: 3, borderColor: '#FFE3A6', padding: 5, marginBottom: 18 }}>
                      {(luckyBagTab === 'Room' ? [20000,200000,400000,600000] : [1000000,2000000,4000000,6000000]).map(amount => <TouchableOpacity key={amount} onPress={() => setLuckyBagCoins(amount)} style={{ flex: 1, paddingVertical: 13, marginHorizontal: 2, borderRadius: 24, alignItems: 'center', backgroundColor: luckyBagCoins === amount ? '#FFE8B5' : 'transparent', borderWidth: luckyBagCoins === amount ? 2 : 0, borderColor: '#FFF4D8' }}><Text style={{ color: luckyBagCoins === amount ? '#E74662' : '#FFFFFF', fontSize: 12, fontWeight: '900' }}>{amount.toLocaleString('en-IN')}</Text></TouchableOpacity>)}
                    </View>
                    <Text style={{ color: '#8A3D13', fontWeight: '900', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Quantity</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: '#F15A3B', borderRadius: 28, borderWidth: 3, borderColor: '#FFE3A6', padding: 5, marginBottom: 18 }}>
                      {(luckyBagTab === 'Room' ? [3,9,12,15] : [30,50,70,100]).map(quantity => <TouchableOpacity key={quantity} onPress={() => setLuckyBagQuantity(quantity)} style={{ flex: 1, paddingVertical: 13, marginHorizontal: 2, borderRadius: 24, alignItems: 'center', backgroundColor: luckyBagQuantity === quantity ? '#FFE8B5' : 'transparent', borderWidth: luckyBagQuantity === quantity ? 2 : 0, borderColor: '#FFF4D8' }}><Text style={{ color: luckyBagQuantity === quantity ? '#E74662' : '#FFFFFF', fontSize: 14, fontWeight: '900' }}>{quantity}</Text></TouchableOpacity>)}
                    </View>
                    <View style={{ backgroundColor: '#FFE3B0', borderRadius: 24, padding: 10, marginBottom: 12, borderWidth: 2, borderColor: '#FFF2D1' }}><Text style={{ color: '#A53D1A', fontWeight: '900', textAlign: 'center', fontSize: 13 }}>TOTAL: {(luckyBagCoins * luckyBagQuantity).toLocaleString('en-IN')} GOLD COINS</Text></View>
                    <TouchableOpacity disabled={luckyBagSending} onPress={sendLuckyBag} style={{ marginTop: 2, paddingVertical: 15, borderRadius: 32, backgroundColor: '#FFD58A', borderWidth: 3, borderColor: '#FFF0C7', alignItems: 'center' }}><Text style={{ color: '#A52D19', fontSize: 16, fontWeight: '900' }}>{luckyBagSending ? 'SENDING…' : 'Send Lucky Bag'}</Text></TouchableOpacity>
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

      {showLuckyBagOpenPopup && selectedLuckyBag && (
        <Modal visible={showLuckyBagOpenPopup} transparent animationType="fade" onRequestClose={() => setShowLuckyBagOpenPopup(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(10,3,18,0.78)', justifyContent: 'center', paddingHorizontal: 22 }}>
            <View style={{ backgroundColor: '#241044', borderRadius: 26, borderWidth: 2, borderColor: '#E7B84F', padding: 20, alignItems: 'center', overflow: 'hidden' }}>
              <TouchableOpacity onPress={() => setShowLuckyBagOpenPopup(false)} style={{ position: 'absolute', top: 10, right: 12, zIndex: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: '#4B286D', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 21, fontWeight: '900' }}>×</Text></TouchableOpacity>
              <Animated.View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center', transform: [{ scale: luckyBagPulse }] }}><Text style={{ fontSize: 132 }}>🧧</Text><Text style={{ position: 'absolute', top: 16, right: 12, fontSize: 34 }}>✨</Text></Animated.View>
              <Text style={{ color: '#FFE6A0', fontSize: 25, fontWeight: '900' }}>LUCKY BAG</Text>
              <Text style={{ color: '#F6D68A', fontSize: 13, fontWeight: '800', marginTop: 8 }}>{selectedLuckyBag.senderName || 'TALKZY User'}</Text>
              <Text style={{ color: '#EBDCF8', fontSize: 12, marginTop: 5 }}>{Number(selectedLuckyBag.remaining_coins || 0).toLocaleString('en-IN')} GOLD COINS LEFT</Text>
              <Text style={{ color: '#F9D879', fontSize: 13, fontWeight: '900', marginTop: 9 }}>{selectedLuckyBag.remaining_bags} BAGS LEFT</Text>
              <Text style={{ color: '#D9C4EF', fontSize: 12, marginTop: 6 }}>Time left: {Math.max(0,Math.ceil((new Date(selectedLuckyBag.expires_at).getTime()-Date.now())/1000))}s</Text>
              <TouchableOpacity disabled={selectedLuckyBag.alreadyClaimed || claimingLuckyBagId===selectedLuckyBag.id} onPress={async () => { await claimLuckyBag(selectedLuckyBag); setShowLuckyBagOpenPopup(false); }} style={{ marginTop: 20, width: '100%', paddingVertical: 16, borderRadius: 30, backgroundColor: '#F6C85F', borderWidth: 2, borderColor: '#FFF0B8', alignItems: 'center' }}><Text style={{ color: '#54220D', fontSize: 19, fontWeight: '900' }}>{claimingLuckyBagId===selectedLuckyBag.id ? 'OPENING…' : 'OPEN 🎁'}</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Minimized music is rendered in the mic section, directly below its final right-side seat. */}

{/* RIGHT-SIDE ROOM NAVIGATION: stays behind all room popups */}
<View style={{ position: 'absolute', right: 9, bottom: Platform.OS === 'android' ? 92 : 70, zIndex: 20, elevation: 8, alignItems: 'center', gap: 8, flexDirection: 'column' }}>
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Open Hot Events"
    onPress={() => {
      setShowRoomGiftPanel(false); setShowRoomTools(false); setShowGreedyPanel(false);
      setShowRoomGamePanel(false); setShowRocketPanel(false);
      setShowHotEventsPopup(true);
      if (!loadingOfficialEvents) loadOfficialEvents();
    }}
    style={{ width: 48, height: 48, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#83E9FF', backgroundColor: '#0D3550', alignItems: 'center', justifyContent: 'center', shadowColor: '#35C9EF', shadowOpacity: 0.52, shadowRadius: 9, elevation: 9 }}
  >
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#155C7D', opacity: 0.72 }} />
    <Text style={{ fontSize: 22 }}>🔥</Text>
    <Text style={{ color: '#B9F4FF', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 }}>HOT</Text>
  </TouchableOpacity>

  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Open Greedy"
    onPress={() => {
      setShowRoomGiftPanel(false); setShowRoomTools(false); setShowRoomGamePanel(false);
      setShowRocketPanel(false); setShowHotEventsPopup(false); setShowGreedyPanel(true);
    }}
    style={{ width: 48, height: 48, borderRadius: 16, borderWidth: 1.5, borderColor: '#72DDF5', backgroundColor: '#0C2B43', alignItems: 'center', justifyContent: 'center', shadowColor: '#31BCE3', shadowOpacity: 0.48, shadowRadius: 9, elevation: 9 }}
  >
    <Text style={{ fontSize: 24 }}>💰</Text>
  </TouchableOpacity>

  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Open room games"
    onPress={() => {
      setShowRoomGiftPanel(false); setShowRoomTools(false); setShowGreedyPanel(false);
      setShowRocketPanel(false); setShowHotEventsPopup(false); setShowRoomGamePanel(true);
    }}
    style={{ width: 48, height: 48, borderRadius: 16, borderWidth: 1.5, borderColor: '#72DDF5', backgroundColor: '#0C3048', alignItems: 'center', justifyContent: 'center', shadowColor: '#4AC4D6', shadowOpacity: 0.48, shadowRadius: 9, elevation: 9 }}
  >
    <Text style={{ fontSize: 23 }}>🎮</Text>
  </TouchableOpacity>

  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Open Treasure"
    onPress={() => {
      setShowRoomGiftPanel(false); setShowRoomTools(false); setShowGreedyPanel(false);
      setShowRoomGamePanel(false); setShowRocketPanel(false); setShowHotEventsPopup(false);
      setShowRocketPanel(true);
    }}
    style={{ width:50,height:50,borderRadius:17,borderWidth:1.7,borderColor:'#D5B36E',backgroundColor:'#241638',alignItems:'center',justifyContent:'center',shadowColor:'#C7A15D',shadowOpacity:0.5,shadowRadius:10,elevation:10 }}
  >
    <View pointerEvents="none" style={{ position:'absolute',top:5,left:5,right:5,bottom:5,borderRadius:12,borderWidth:1,borderColor:'#8B6A3C' }} />
    <View style={{ width:30,height:36,alignItems:'center',justifyContent:'flex-end' }}>
      <View style={{ position:'absolute',top:0,width:0,height:0,borderLeftWidth:10,borderRightWidth:10,borderBottomWidth:13,borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:'#E9F0E9' }} />
      <View style={{ position:'absolute',top:11,width:15,height:21,borderRadius:8,backgroundColor:'#DDE5DF',borderWidth:1,borderColor:'#FFFFFF',alignItems:'center',justifyContent:'center' }}>
        <View style={{ width:7,height:7,borderRadius:4,backgroundColor:'#173A2A',borderWidth:1,borderColor:'#65D58A' }} />
      </View>
      <View style={{ position:'absolute',bottom:0,left:0,width:8,height:12,backgroundColor:'#65D58A',transform:[{skewY:'-25deg'}],borderBottomLeftRadius:5 }} />
      <View style={{ position:'absolute',bottom:0,right:0,width:8,height:12,backgroundColor:'#65D58A',transform:[{skewY:'25deg'}],borderBottomRightRadius:5 }} />
      <View style={{ position:'absolute',bottom:-3,width:6,height:8,backgroundColor:'#E7C16C',borderRadius:4 }} />
    </View>
  </TouchableOpacity>

</View>

<Modal visible={showRoomShortcutsPage && screen === 'roomInterior' && Boolean(selectedRoom)} animationType="slide" transparent onRequestClose={() => setShowRoomShortcutsPage(false)}>
  <View style={{ flex: 1, backgroundColor: 'rgba(1,10,20,0.70)', justifyContent: 'center', paddingHorizontal: 18 }}>
    <View style={{ maxHeight: '78%', borderRadius: 24, padding: 18, backgroundColor: '#090711', borderWidth: 1.3, borderColor: '#A77A39' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#3A2A50', marginBottom: 16 }}>
        <View>
          <Text style={{ color: '#F6EEDB', fontSize: 20, fontWeight: '900', letterSpacing: 0.7 }}>TREASURY</Text>
          <Text style={{ color: '#A99BB9', fontSize: 10, marginTop: 3, letterSpacing: 1 }}>YOUR TALKZY COINS & REWARDS</Text>
        </View>
        <TouchableOpacity onPress={() => setShowRoomShortcutsPage(false)} accessibilityRole="button" accessibilityLabel="Close Treasury" style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#21182D', borderWidth: 1, borderColor: '#59456D', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#F4E8D2', fontSize: 23, fontWeight: '700' }}>×</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
        <View style={{ borderRadius: 22, padding: 18, backgroundColor: '#211331', borderWidth: 1, borderColor: '#A77A39', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: '#382052', borderWidth: 2, borderColor: '#E0BD70', alignItems: 'center', justifyContent: 'center', marginRight: 15, shadowColor: '#C49A45', shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 }}>
              <View style={{ position: 'absolute', top: 7, left: 7, right: 7, bottom: 7, borderRadius: 15, borderWidth: 1, borderColor: '#8D68B2' }} />
              <Text style={{ fontSize: 39 }}>💎</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#E9CC83', fontSize: 17, fontWeight: '900' }}>ENCHANTED TREASURY</Text>
              <Text style={{ color: '#C4B5D5', fontSize: 11, marginTop: 4 }}>Your TALKZY coins and rewards</Text>
              <Text style={{ color: '#FFF0C3', fontSize: 18, fontWeight: '900', marginTop: 8 }}>🪙 {Number(walletBalance || 0).toLocaleString()} coins</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <TouchableOpacity onPress={() => { setShowRoomShortcutsPage(false); setLuckyBagHistoryView(false); setShowLuckyBagPopup(true); }} style={{ width: '48%', minHeight: 126, flexGrow: 1, borderRadius: 18, padding: 14, backgroundColor: '#21172D', borderWidth: 1, borderColor: '#8D6A43', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 31 }}>🎁</Text><Text style={{ color: '#F0D28B', fontSize: 12, fontWeight: '900', marginTop: 8 }}>LUCKY BAGS</Text><Text style={{ color: '#AFA0BE', fontSize: 9, marginTop: 4 }}>Open room rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowRoomShortcutsPage(false); setLuckyBagHistoryView(true); loadLuckyBagHistory(); setShowLuckyBagPopup(true); }} style={{ width: '48%', minHeight: 126, flexGrow: 1, borderRadius: 18, padding: 14, backgroundColor: '#21172D', borderWidth: 1, borderColor: '#8D6A43', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 31 }}>📜</Text><Text style={{ color: '#F0D28B', fontSize: 12, fontWeight: '900', marginTop: 8 }}>TREASURY HISTORY</Text><Text style={{ color: '#AFA0BE', fontSize: 9, marginTop: 4 }}>View reward records</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>

      <Modal
        visible={showHotEventsPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHotEventsPopup(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(4,8,20,0.78)', justifyContent: 'center', paddingHorizontal: 14 }}>
          <View style={{ backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: '#D6A84F', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '900' }}>🔥 HOT EVENTS</Text>
              <TouchableOpacity onPress={() => setShowHotEventsPopup(false)} style={{ paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: C.text, fontSize: 23, fontWeight: '800' }}>×</Text>
              </TouchableOpacity>
            </View>
            {loadingOfficialEvents ? (
              <View style={{ paddingVertical: 25, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={C.accent} />
                <Text style={{ color: C.muted, marginTop: 8, fontSize: 11 }}>Loading events...</Text>
              </View>
            ) : officialEvents.length === 0 ? (
              <Text style={{ color: C.muted, textAlign: 'center', paddingVertical: 22, fontSize: 12 }}>No live events available right now.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'stretch' }}>
                {officialEvents.map((event, index) => (
                  <Pressable
                    key={event.id || event.event_name || index}
                    onPress={() => openHotEventFront(event)}
                    style={{ width: 225, marginRight: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line }}
                  >
                    {event.poster_url ? (
                      <Image source={{ uri: event.poster_url }} style={{ width: '100%', height: 112 }} resizeMode="cover" />
                    ) : (
                      <View style={{ width: '100%', height: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: '#21183D' }}>
                        <Text style={{ color: '#D6A84F', fontSize: 26 }}>🏆</Text>
                        <Text style={{ color: C.muted, fontSize: 10 }}>EVENT POSTER</Text>
                      </View>
                    )}
                    <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: '900', padding: 9 }}>
                      {event.event_name || event.name || 'TALKZY EVENT'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 10, textAlign: 'center' }}>Select an event to view its front page</Text>
          </View>
        </View>
      </Modal>

     {/* MIC EMOJI PICKER */}
<Modal visible={showMicEmojiPicker && isOnMic} transparent animationType="fade" onRequestClose={() => setShowMicEmojiPicker(false)}>
  <Pressable onPress={() => setShowMicEmojiPicker(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', padding: 14 }}>
    <Pressable onPress={() => {}} style={{ backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 20, padding: 14, marginBottom: Platform.OS === 'android' ? 24 : 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Mic Reactions</Text>
        <TouchableOpacity onPress={() => setShowMicEmojiPicker(false)}><Text style={{ color: C.muted, fontSize: 20 }}>×</Text></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {[["Welcome","👋"],["Happy","😊"],["Thanks","🙏"],["Gosh","😲"],["Wronged","😞"],["Nausea","🤢"],["Left kiss","😘","left"],["Right kiss","😘","right"],["Money face","🤑"],["Party","🥳"],["Fear","😨"],["Silence","🤫"],["Like","👍"],["Cry","😭"],["Naughty","😜"],["Sweat","😓"],["LOL","😂"],["Cool","😎"],["Angry","😡"]].map(([label, emoji, direction]) => (
          <TouchableOpacity key={label} onPress={() => sendRoomReaction({ label, emoji, direction })} style={{ width: '19%', minHeight: 62, alignItems: 'center', justifyContent: 'center', marginBottom: 7, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.line }}>
            <MicReactionSticker emoji={emoji} size={42} direction={direction} />
            <Text numberOfLines={1} style={{ color: C.muted, fontSize: 8, marginTop: 3 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Pressable>
  </Pressable>
</Modal>

{/* ROOM CHAT COMPOSER — native modal layer stays above the room and follows the keyboard. */}
<Modal
  visible={showRoomChatComposer}
  transparent
  statusBarTranslucent
  animationType="none"
  onShow={() => {
    // The native Modal is now visible and focusable. Request keyboard focus
    // immediately instead of adding an artificial delay on Android.
    roomChatInputRef.current?.focus();
  }}
  onRequestClose={() => {
    Keyboard.dismiss();
    setShowRoomChatComposer(false);
    setShowRoomChatActionMenu(false);
  }}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.16)' }}
  >
    <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: Platform.OS === 'android' ? 8 : 12, maxHeight: '58%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 26, paddingLeft: 17, paddingRight: 7, minHeight: 50, borderWidth: 1, borderColor: '#E5E7EB' }}>
        <TextInput
          ref={roomChatInputRef}
          autoFocus={false}
          showSoftInputOnFocus
          value={roomChatText}
          onChangeText={setRoomChatText}
          placeholder={isRoomTourist && !touristsSendText ? 'Tourist chat disabled' : 'Write a message...'}
          placeholderTextColor="#8A929B"
          onSubmitEditing={sendRoomChatMessage}
          editable={!(isRoomTourist && !touristsSendText)}
          returnKeyType="send"
          blurOnSubmit={false}
          style={{ color: '#17212B', fontSize: 14, padding: 0, flex: 1, height: 48 }}
        />
        {roomChatText.trim().length > 0 ? (
          <TouchableOpacity onPress={sendRoomChatMessage} disabled={isRoomTourist && !touristsSendText} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', opacity: isRoomTourist && !touristsSendText ? 0.4 : 1 }} accessibilityRole="button" accessibilityLabel="Send message">
            <Text style={{ fontSize: 22, color: '#168DB5', fontWeight: '900' }}>➤</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={sendRoomImage} disabled={isRoomTourist && !touristsSendPic} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', opacity: isRoomTourist && !touristsSendPic ? 0.35 : 1 }} accessibilityRole="button" accessibilityLabel="Attach image">
            <Text style={{ fontSize: 21, color: '#53616D' }}>▧</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </KeyboardAvoidingView>
</Modal>

{/* ROOM BOTTOM CONTROLS — horizontally scrollable so every feature stays reachable on narrow phones */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
  style={{ flexGrow: 0, backgroundColor: 'rgba(4,19,32,0.96)' }}
  contentContainerStyle={{
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '100%',
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'android' ? 40 : 12,
    columnGap: 9
  }}
>
  {/* CHAT ENTRY — one slot: message bar off-mic, compact chat icon on-mic. Both open the same focused composer. */}
  {!isOnMic ? (
    <TouchableOpacity
      onPress={() => { roomChatKeyboardShownRef.current = false; setIsRoomChatMinimized(false); setShowRoomChatActionMenu(false); setShowRoomChatComposer(true); }}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Open room chat composer"
      style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 90, maxWidth: 150, height: 40, marginRight: 2, backgroundColor: '#0B2B43', borderRadius: 20, paddingHorizontal: 13, borderWidth: 1.2, borderColor: '#3D9BB8' }}
    >
      <Text style={{ color: '#B9C8D5', fontSize: 12, flex: 1 }}>Message...</Text>
      <Text style={{ color: '#AFA0D8', fontSize: 17 }}>✎</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={() => { roomChatKeyboardShownRef.current = false; setIsRoomChatMinimized(false); setShowRoomChatActionMenu(false); setShowRoomChatComposer(true); }}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Open room chat composer"
      style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: '#0B2B43', borderWidth: 1.2, borderColor: '#3D9BB8', alignItems: 'center', justifyContent: 'center', marginRight: 2, shadowColor: '#2CB8DF', shadowOpacity: 0.24, shadowRadius: 5, elevation: 4 }}
    >
      <Text style={{ fontSize: 21 }}>💬</Text>
    </TouchableOpacity>
  )}

  {/* MIC - MUTE / UNMUTE WHILE REMAINING ON SEAT */}
{isOnMic && (
  <TouchableOpacity
    onPress={async () => {
      const nextMuted = !isMicMuted;
      const previousMuted = isMicMuted;
      const roomId = selectedRoom.id;
      const userId = session?.user?.id;
      const actionVersion = ++micSeatActionVersionRef.current;
      const isCurrentRoomAction = () =>
        actionVersion === micSeatActionVersionRef.current &&
        activeAuthUserIdRef.current === userId &&
        roomChatActiveRoomIdRef.current === roomId;

      // Immediate visual response while the server saves the mute state.
      if (roomChatActiveRoomIdRef.current !== roomId) return;
      beginMicSeatAction();
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

        if (!isCurrentRoomAction()) return;
        if (result?.seat) {
          setMicSeats(current => current.map(item =>
            item.user_id === userId
              ? { ...item, is_muted: !!result.seat.is_muted }
              : item
          ));
          setIsMicMuted(!!result.seat.is_muted);
        }
      } catch (error) {
        if (!isCurrentRoomAction()) return;
        setIsMicMuted(previousMuted);
        setMicSeats(current => current.map(item =>
          item.user_id === userId
            ? { ...item, is_muted: previousMuted }
            : item
        ));
        await loadRoomMicSeats(roomId);
        if (isCurrentRoomAction()) Alert.alert(
          'Microphone',
          error.message || 'Could not change mute status.'
        );
      } finally {
        endMicSeatAction();
      }
    }}
    style={{
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: isMicMuted ? '#24465A' : '#8A3048',
      borderWidth: 1.2,
      borderColor: isMicMuted ? '#69CBE6' : '#F18AA2',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2CB8DF',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4
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

  {/* MIC EMOJI REACTIONS — visible only while seated on mic */}
{isOnMic && (
  <TouchableOpacity onPress={() => setShowMicEmojiPicker(true)} style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: showMicEmojiPicker ? '#145C79' : '#0B2B43', borderWidth: 1.2, borderColor: '#3D9BB8', alignItems: 'center', justifyContent: 'center', marginRight: 2, shadowColor: '#2CB8DF', shadowOpacity: 0.24, shadowRadius: 5, elevation: 4 }}>
    <Text style={{ fontSize: 21 }}>😊</Text>
  </TouchableOpacity>
)}

  {/* SPEAKER */}
  <TouchableOpacity
    onPress={() => setIsRoomSpeakerOn(!isRoomSpeakerOn)}
    style={{
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: '#0B2B43',
      borderWidth: 1.2,
      borderColor: '#3D9BB8',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2CB8DF',
      shadowOpacity: 0.24,
      shadowRadius: 5,
      elevation: 4
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
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: '#0B2B43',
      borderWidth: 1.2,
      borderColor: '#3D9BB8',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2CB8DF',
      shadowOpacity: 0.24,
      shadowRadius: 5,
      elevation: 4
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
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: '#0B2B43',
      borderWidth: 1.2,
      borderColor: '#3D9BB8',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2CB8DF',
      shadowOpacity: 0.24,
      shadowRadius: 5,
      elevation: 4
    }}
  >
    <Text style={{ fontSize: 19 }}>⊞</Text>
  </TouchableOpacity>

  {/* GIFT — horizontal chat bar shortcut */}
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Open gifts"
    onPress={() => {
      setShowRoomTools(false);
      setShowGreedyPanel(false);
      setShowRoomGamePanel(false);
      setShowRocketPanel(false);
      setShowHotEventsPopup(false);
      setShowRoomGiftPanel(value => !value);
    }}
    style={{
      width: 44,
      height: 44,
      borderRadius: 15,
      marginLeft: 2,
      backgroundColor: '#0B2B43',
      borderWidth: 1.2,
      borderColor: '#75DDF2',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2CB8DF',
      shadowOpacity: 0.28,
      shadowRadius: 5,
      elevation: 4
    }}
  >
    <Text style={{ fontSize: 20 }}>🎁</Text>
  </TouchableOpacity>

</ScrollView>
        
            
  

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

          {/* EXIT */}
          <TouchableOpacity
            activeOpacity={0.65}
            accessibilityRole="button"
            onPress={exitCurrentRoom}
            style={{
              padding: 16,
              minHeight: 50,
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Text style={{ color: '#FF5B5B', fontSize: 15, fontWeight: '700' }}>
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
                    {layout.rows.map((previewRow,rowIndex) => {
                      const previewCoupleRow = rowIndex === 0 && previewRow.length === 2;
                      return <View key={rowIndex} style={{ flexDirection:'row', justifyContent:'center', alignSelf:'center', width:previewCoupleRow ? 44 : '100%', marginBottom:4 }}>
                        {previewRow.map(seat => <View key={seat} style={{ width:19, height:19, borderRadius:10, borderWidth:1, borderColor:selected ? C.accent : C.muted, backgroundColor:selected ? C.accent : C.panel2, alignItems:'center', justifyContent:'center', marginHorizontal:previewCoupleRow ? 1 : 3 }}><Text style={{ color:'#FFFFFF', fontSize:8 }}>{seat}</Text></View>)}
                      </View>;
                    })}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:8 }}>Seats above the selected limit are removed automatically. Only the room owner can change this setting.</Text>
            <TouchableOpacity onPress={() => setShowMicCountPicker(false)} style={{ marginTop:12, padding:12, borderRadius:10, backgroundColor:C.panel2, alignItems:'center' }}><Text style={{ color:C.text, fontWeight:'bold' }}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BELL: ROOM MESSAGES AND FRIENDS */}
      <Modal visible={showRoomMessageMenu} transparent animationType="slide" onRequestClose={() => setShowRoomMessageMenu(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.58)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => setShowRoomMessageMenu(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ height: '84%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' }}>
            <View style={{ height: 5, width: 42, borderRadius: 4, backgroundColor: '#D7DCE3', alignSelf: 'center', marginTop: 9, marginBottom: 8 }} />
            <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEF0F3' }}>
              <Text style={{ color: '#202633', fontSize: 20, fontWeight: '900' }}>Messages</Text>
              <TouchableOpacity onPress={() => setShowRoomMessageMenu(false)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#596273', fontSize: 21, fontWeight: '700' }}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#E9ECF1' }}>
              {['Message', 'Friends'].map(tab => {
                const active = messageTab === tab;
                return (
                  <TouchableOpacity key={tab} onPress={() => setMessageTab(tab)} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: active ? 3 : 0, borderBottomColor: '#F05A9D' }}>
                    <Text style={{ color: active ? '#E84991' : '#737D8D', fontSize: 15, fontWeight: active ? '900' : '700' }}>{tab === 'Friends' ? 'Friend' : tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }}>
              {messageTab === 'Message' ? (
                <>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => Alert.alert('Official Notification', 'Official TALKZY notifications will appear here.')} style={{ flex: 1, minHeight: 76, borderRadius: 13, backgroundColor: '#FFF2F7', padding: 12, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 22 }}>📢</Text>
                      <Text style={{ color: '#303746', fontSize: 12, fontWeight: '800', marginTop: 5 }}>Official Notification</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Help and Support', 'Help and Support will be available here.')} style={{ flex: 1, minHeight: 76, borderRadius: 13, backgroundColor: '#F1F5FF', padding: 12, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 22 }}>🎧</Text>
                      <Text style={{ color: '#303746', fontSize: 12, fontWeight: '800', marginTop: 5 }}>Help and Support</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: '#303746', fontSize: 15, fontWeight: '900', marginBottom: 9 }}>System Notification</Text>
                  <TouchableOpacity onPress={() => Alert.alert('System Notification', 'Your TALKZY event and reward notifications will appear here.')} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 13, backgroundColor: '#F7F8FA', marginBottom: 18 }}>
                    <View style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: '#FFF0D8', alignItems: 'center', justifyContent: 'center', marginRight: 11 }}>
                      <Text style={{ fontSize: 22 }}>🔔</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#252C39', fontWeight: '900', fontSize: 13 }}>TALKZY System</Text>
                      <Text style={{ color: '#7B8492', fontSize: 12, marginTop: 3 }}>Event updates, rewards and important notifications</Text>
                    </View>
                    <Text style={{ color: '#A0A7B2', fontSize: 11 }}>›</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#303746', fontSize: 15, fontWeight: '900', marginBottom: 9 }}>Messages</Text>
                  <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                    <Text style={{ fontSize: 34 }}>💬</Text>
                    <Text style={{ color: '#555F70', fontWeight: '800', marginTop: 9 }}>No messages yet</Text>
                    <Text style={{ color: '#929AA6', fontSize: 12, marginTop: 4, textAlign: 'center' }}>Your conversations will appear here.</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ color: '#303746', fontSize: 15, fontWeight: '900', marginBottom: 10 }}>New Friend</Text>
                  <View style={{ backgroundColor: '#FFF3F8', borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                    <Text style={{ fontSize: 24, marginRight: 11 }}>👋</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#303746', fontWeight: '800', fontSize: 13 }}>Friend requests</Text>
                      <Text style={{ color: '#8A929F', fontSize: 11, marginTop: 3 }}>New friend requests will appear here.</Text>
                    </View>
                  </View>
                  <Text style={{ color: '#303746', fontSize: 15, fontWeight: '900', marginBottom: 10 }}>My Friends</Text>
                  <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                    <Text style={{ fontSize: 34 }}>👥</Text>
                    <Text style={{ color: '#555F70', fontWeight: '800', marginTop: 9 }}>No friends to show</Text>
                    <Text style={{ color: '#929AA6', fontSize: 12, marginTop: 4, textAlign: 'center' }}>Your friend list will appear here.</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
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
            <TouchableOpacity onPress={() => { setRoomSettingsPassword(''); setShowRoomSettingsPasswordPopup(true); }} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#26334A' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>Password</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{roomSettingsType === 'locked' ? '🔒 Room is locked' : '🔓 Room is public'}</Text>
              </View>
              <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
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
        <Modal visible={showRoomSettingsPasswordPopup} transparent animationType="fade" onRequestClose={() => { setShowRoomSettingsPasswordPopup(false); setRoomSettingsPassword(''); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 22 }}>
            <View style={{ backgroundColor: C.panel, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: C.gold }}>
              <Text style={{ color: C.text, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>Set Password</Text>
              <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>Set a password to make this room private.</Text>
              <TextInput value={roomSettingsPassword} onChangeText={setRoomSettingsPassword} placeholder="Enter room password" placeholderTextColor={C.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} style={{ color: C.text, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginBottom: 18 }} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity activeOpacity={0.85} disabled={roomSettingSaving} onPress={() => updateRoomPasswordSetting('public')} style={{ flex: 1, minHeight: 46, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line, opacity: roomSettingSaving ? 0.5 : 1 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>Unlock</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.85} disabled={roomSettingSaving} onPress={() => updateRoomPasswordSetting('locked')} style={{ flex: 1, minHeight: 46, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, borderWidth: 1, borderColor: C.gold, opacity: roomSettingSaving ? 0.5 : 1 }}>
                  <Text style={{ color: '#17120A', fontSize: 13, fontWeight: '900' }}>{roomSettingSaving ? 'Saving...' : 'Lock'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => { setShowRoomSettingsPasswordPopup(false); setRoomSettingsPassword(''); }} disabled={roomSettingSaving} style={{ padding: 12, alignItems: 'center', marginTop: 4 }}>
                <Text style={{ color: C.muted, fontWeight: '800' }}>Cancel</Text>
              </TouchableOpacity>
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

      
      {loadingOfficialEvents ? (
        <View style={{ paddingVertical: 22, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={C.accent} />
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>Loading live events...</Text>
        </View>
      ) : officialEvents.length === 0 ? (
        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 18 }}>No live events right now.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {officialEvents.map((event, index) => (
            <Pressable
              key={event.id || event.event_name || index}
              onPress={() => openOfficialEvent(event)}
              style={{
                width: 260,
                minHeight: 125,
                backgroundColor: C.panel,
                borderRadius: 15,
                overflow: 'hidden',
                marginRight: 10,
                borderWidth: 1,
                borderColor: '#D6A84F'
              }}
            >
              {event.poster_url ? (
                <Image source={{ uri: event.poster_url }} style={{ width: '100%', height: 92 }} resizeMode="cover" />
              ) : (
                <View style={{ height: 92, backgroundColor: '#21183D', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#D6A84F', fontSize: 22 }}>🏆</Text>
                </View>
              )}
              <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 8 }}>
                {event.event_name || event.name || 'TALKZY EVENT'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

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
                    if (item === 'Popular') loadOfficialEvents();
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
    
  // Enter the creator's own room for a game and automatically take the first available mic.
  async function enterOwnRoomForGame(room, gameName) {
    if (!room?.id || !session?.user?.id) return;
    const requestUserId = session.user.id;
    const isCurrentUserRequest = () => activeAuthUserIdRef.current === requestUserId;
    try {
      const pendingLeave = roomLeaveCleanupRef.current[room.id];
      if (pendingLeave) await pendingLeave;
      if (!isCurrentUserRequest()) return;
      try { await api(`/api/rooms/${room.id}/mic-seats`, { method: 'DELETE' }); } catch (e) {
        console.log('Previous mic seat cleanup:', e.message);
      }
      if (!isCurrentUserRequest()) return;
      await api(`/api/rooms/${room.id}/presence/ping`, { method: 'POST' });
      if (!isCurrentUserRequest()) return;

      roomChatActiveRoomIdRef.current = room.id;
      ++roomChatLoadVersionRef.current;
      ++micSeatActionVersionRef.current;
      setShowRoomChatComposer(false);
      setRoomChatText('');
      setSelectedRoom(room);
      setIsRoomTourist(false);
      setIsRoomMinimized(false);
      setMicSeats([]);
      setIsOnMic(false);
      setMyMicSeat(null);
      setIsMicMuted(false);
      setRoomChatMessages(createRoomEntryNotices(room));
      setScreen('roomInterior');

      const seatState = await api(`/api/rooms/${room.id}/mic-seats`);
      if (!isCurrentUserRequest() || roomChatActiveRoomIdRef.current !== room.id) return;
      const seats = Array.isArray(seatState.seats) ? seatState.seats : [];
      const controls = Array.isArray(seatState.micControls) ? seatState.micControls : [];
      const micCountValue = Number(seatState.micCount || 8);
      const occupied = new Set(seats.map(item => Number(item.seat_number)));
      const closed = new Set(controls.filter(item => item.seat_closed).map(item => Number(item.seat_number)));
      const nextSeat = Array.from({ length: micCountValue }, (_, index) => index + 1)
        .find(number => !occupied.has(number) && !closed.has(number));
      setMicCount(micCountValue);
      setMicLayout(seatState.micLayout || 'eight');
      setMicSeats(seats);
      setMicControls(controls);
      if (nextSeat) {
        await api(`/api/rooms/${room.id}/mic-seats/${nextSeat}`, { method: 'POST' });
        if (!isCurrentUserRequest() || roomChatActiveRoomIdRef.current !== room.id) return;
        setMicSeats(current => [...current.filter(item => item.user_id !== requestUserId), {
          room_id: room.id,
          seat_number: nextSeat,
          user_id: requestUserId,
          display_name: profile?.display_name || displayName || 'You',
          avatar_url: profile?.avatar_url || avatarUri || null,
          is_muted: false
        }]);
        setIsOnMic(true);
        setMyMicSeat(nextSeat);
        setIsMicMuted(false);
      } else {
        Alert.alert('No microphone available', 'You have entered your room, but all microphones are occupied or closed.');
      }
      loadRoomMicSeats(room.id);
      loadRoomMessages(room.id);
      loadRoomPresence(room.id);
    } catch (error) {
      if (isCurrentUserRequest()) Alert.alert('Unable to enter your room', error.message || 'Please try again.');
    }
  }

  function handleMainGamePress(gameName) {
    if (!roomCreationEligibilityLoaded) {
      return Alert.alert('Please wait', 'Your room information is still loading. Try again in a moment.');
    }
    const ownRoom = myRooms.find(room => room?.owner_id === session?.user?.id) || myRooms[0];
    if (!ownRoom) {
      Alert.alert(
        'Create a room first',
        'You need to create your own room before starting a game.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create room', onPress: () => { setPendingGameEntryName(gameName); setScreen('createRoom'); } }
        ]
      );
      return;
    }
    enterOwnRoomForGame(ownRoom, gameName);
  }

  // =========================================
  // GAMES SECTION
  // =========================================

  function renderGames() {
    const games = [
      { name: 'Ludo', emoji: '🎯' },
      { name: 'Carrom', emoji: '🔴' },
      { name: 'Playcards – Breez', emoji: '🃏' },
      { name: 'UNO', emoji: '🎴' },
      { name: 'Monster Crush', emoji: '👾' },
      { name: 'Truth and Dare', emoji: '🎭' },
      { name: 'Snakes and Ladders', emoji: '🐍' },
      { name: 'Jackaroo', emoji: '♟️' },
      { name: 'Brainstorm', emoji: '🧠' },
      { name: '29', emoji: '🂡' }
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

        {/* HOT SPECIAL GAMES */}
        <Heading>Hot Special Games</Heading>
        <Text style={{ color: C.muted, marginBottom: 10 }}>
          Slide to explore and choose a game.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          {games.map(game => (
            <TouchableOpacity
              key={game.name}
              onPress={() => handleMainGamePress(game.name)}
              style={{
                width: 126,
                marginRight: 10,
                backgroundColor: C.panel,
                borderColor: C.line,
                borderWidth: 1,
                borderRadius: 15,
                paddingVertical: 18,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 32 }}>{game.emoji}</Text>
              <Text style={{ color: C.text, fontWeight: '900', marginTop: 8, textAlign: 'center' }} numberOfLines={2}>
                {game.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
          justifyContent: 'flex-end',
          paddingVertical: 10,
          marginBottom: 12
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('Me')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#151D35',
            padding: 7,
            borderRadius: 25,
            borderWidth: 1,
            borderColor: '#303D60'
          }}
        >
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 30, height: 30, borderRadius: 15 }}
            />
          ) : (
            <Text style={{ fontSize: 23 }}>👤</Text>
          )}
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
// EVENTS: HOT EVENT FRONT PAGE
// =========================================

function renderEventFront() {
  const eventName = selectedOfficialEvent?.event_name || selectedOfficialEvent?.name || 'TALKZY Event';
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setScreen(eventFrontReturnScreen)} style={{ paddingRight: 14, paddingVertical: 5 }}>
          <Text style={{ color: C.text, fontSize: 28 }}>‹</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ color: C.text, fontSize: 18, fontWeight: '900', flex: 1 }}>Event Preview</Text>
      </View>
      <Pressable onPress={() => openOfficialEvent(selectedOfficialEvent)} style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: C.panel, borderWidth: 1, borderColor: '#D6A84F' }}>
        {selectedOfficialEvent?.poster_url ? (
          <Image source={{ uri: selectedOfficialEvent.poster_url }} style={{ width: '100%', aspectRatio: 1.65 }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', aspectRatio: 1.65, alignItems: 'center', justifyContent: 'center', backgroundColor: '#21183D' }}>
            <Text style={{ color: '#D6A84F', fontSize: 34 }}>🏆</Text>
            <Text style={{ color: C.muted, marginTop: 6 }}>EVENT POSTER</Text>
          </View>
        )}
        <View style={{ padding: 16 }}>
          <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>{eventName}</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 7 }}>Tap this event again to open its full event page.</Text>
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: '900', marginTop: 15 }}>OPEN FULL EVENT PAGE  ›</Text>
        </View>
      </Pressable>
    </View>
  );
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
   if (screen === 'eventFront') {
    return renderEventFront();
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
  // DEDICATED ROOM SETTINGS SCREEN
  // =========================================

  // Render settings outside the main page ScrollView/header so the settings
  // screen is not nested in the room list and taps/navigation work reliably.
  if (screen === 'roomSettings') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0 }}>
        <StatusBar barStyle="light-content" />
        {renderRoomSettings()}
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
                {/* ROOM IDENTITY HEADER: DP left, aligned details right */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 13,
                    marginBottom: 14,
                    borderRadius: 16,
                    backgroundColor: '#101A31',
                    borderWidth: 1,
                    borderColor: '#354466'
                  }}
                >
                  {roomDetails.room_dp_url ? (
                    <Image
                      source={{ uri: roomDetails.room_dp_url }}
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 18,
                        marginRight: 13,
                        backgroundColor: C.panel2
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 18,
                        marginRight: 13,
                        backgroundColor: '#252044',
                        borderWidth: 1,
                        borderColor: C.accent,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text style={{ fontSize: 30 }}>🏠</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        color: C.text,
                        fontSize: 18,
                        fontWeight: '900',
                        lineHeight: 22
                      }}
                    >
                      {roomDetails.room_name || 'Room'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: C.muted,
                        fontSize: 12,
                        marginTop: 6
                      }}
                    >
                      🌍 {roomDetails.country_name || 'Country not set'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: C.teal,
                        fontSize: 11,
                        fontWeight: '800',
                        marginTop: 5
                      }}
                    >
                      Room ID: {roomDetails.room_talkzy_id || '—'}
                    </Text>
                  </View>
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
                    onPress={(event) => {
                      event.stopPropagation?.();
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
                      {member.avatar_url ? <Image source={{ uri: member.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.panel2, marginRight: 8, alignItems: 'center', justifyContent: 'center' }}><Text>👤</Text></View>}
                      <View style={{ minWidth: 58, marginRight: 9, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, backgroundColor: (member.user_id === roomDetails?.owner_id) ? 'rgba(255,210,122,0.16)' : member.is_admin ? 'rgba(147,102,255,0.18)' : 'rgba(156,169,201,0.12)', borderWidth: 1, borderColor: (member.user_id === roomDetails?.owner_id) ? C.gold : member.is_admin ? C.accent : C.line, alignItems: 'center' }}>
                        <Text style={{ color: (member.user_id === roomDetails?.owner_id) ? C.gold : member.is_admin ? '#C7B5FF' : C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.35 }}>{member.user_id === roomDetails?.owner_id ? 'OWNER' : member.is_admin ? 'ADMIN' : 'MEMBER'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{member.display_name || 'TALKZY User'}</Text>
                        <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>TALKZY ID: {member.talkzy_id || '—'}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* ACTIVITY TAB */}
            {roomDetailsTab === 'Activity' && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>Room Activities</Text>

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
  visible={showCreateRoomPasswordPopup}
  transparent
  animationType="fade"
  onRequestClose={() => setShowCreateRoomPasswordPopup(false)}
>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 22 }}>
    <View style={{ backgroundColor: C.panel, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: C.gold }}>
      <Text style={{ color: C.text, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 18 }}>
        Room password
      </Text>
      <TextInput
        value={roomPassword}
        onChangeText={setRoomPassword}
        placeholder="Enter room password"
        placeholderTextColor={C.muted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={{ color: C.text, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginBottom: 18 }}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setRoomType('public');
            setRoomPassword('');
            setShowCreateRoomPasswordPopup(false);
          }}
          style={{ flex: 1, minHeight: 46, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line }}
        >
          <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>Unlock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            const trimmedPassword = roomPassword.trim();
            if (!trimmedPassword) {
              Alert.alert('Password required', 'Enter a password before locking the room.');
              return;
            }
            if (trimmedPassword.length < 4 || trimmedPassword.length > 64) {
              Alert.alert('Invalid password', 'Room password must be between 4 and 64 characters.');
              return;
            }
            setRoomPassword(trimmedPassword);
            setRoomType('locked');
            setShowCreateRoomPasswordPopup(false);
          }}
          style={{ flex: 1, minHeight: 46, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, borderWidth: 1, borderColor: C.gold }}
        >
          <Text style={{ color: '#17120A', fontSize: 13, fontWeight: '900' }}>Lock</Text>
        </TouchableOpacity>
      </View>
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

  function exitCurrentRoom() {
    const roomId = selectedRoom?.id || null;
    const userId = session?.user?.id || 'unknown';

    // Ignore rapid duplicate taps for the same room.
    if (roomId && roomExitInProgressRef.current[roomId]) return;
    if (roomId) roomExitInProgressRef.current[roomId] = true;

    // Immediately and synchronously leave the room UI. No network/storage wait
    // is allowed to block navigation.
    setShowRoomMenu(false);
    setShowRoomTools(false);
    setShowRoomGiftPanel(false);
    setShowRoomThemeMenu(false);
    setShowRoomUsers(false);
    setShowRoomMessageMenu(false);
    setShowRoomInfo(false);
    setRoomDetailsVisible(false);
    setRoomDetails(null);
    setShowMicControlPopup(false);
    setMicControlSeat(null);
    setShowLuckyBagPopup(false);
    setLuckyBagHistoryView(false);
    setShowYoutubePanel(false);
    setShowYoutubePicker(false);
    setYoutubePickedItem(null);
    setYoutubeSelectedVideo(null);
    setYoutubePreviewVideoId(null);
    setYoutubeUrlInput('');
    setYoutubeSearchQuery('');
    setShowMusicPanel(false);
    setMusicMinimized(false);
    setShowRoomActivityComposer(false);
    setShowCreateRoomActivity(false);
    setActivitySelectedRoom(null);
    setShowPosterOptions(false);
    setShowPosterTemplates(false);
    setShowPosterEditor(false);
    setShowMicCountPicker(false);
    setShowJoinPassword(false);
    setRoomChatText('');
    setMicGame(null);
    setRoomSettingsSubpage(null);
    setIsOnMic(false);
    setMyMicSeat(null);
    setIsMicMuted(false);
    setIsRoomMinimized(false);
    setIsRoomTourist(false);
    setMicSeats([]);
    setRoomPresence([]);
    setRoomChatMessages([]);
    roomChatActiveRoomIdRef.current = null;
    ++roomChatLoadVersionRef.current;
    ++micSeatActionVersionRef.current;
    setShowRoomChatComposer(false);
    setSelectedRoom(null);
    ++micSeatLoadVersionRef.current;
    setActiveTab('Room');
    setScreen('main');

    // Durable chat cutoff + server leave are best-effort background cleanup.
    if (roomId) {
      const cutoff = Date.now();
      roomChatLocalCutoffRef.current[roomId] = cutoff;
      const cutoffKey = `talkzy-room-chat-cutoff:${userId}:${roomId}`;

      const cleanup = (async () => {
        try {
          await AsyncStorage.setItem(cutoffKey, String(cutoff));
        } catch (error) {
          console.log('Room exit cutoff save error:', error?.message || error);
        }

        try {
          await waitForMicSeatActions();
          const response = await api(`/api/rooms/${roomId}/presence/leave`, { method: 'POST' });
          const serverCutoff = response?.clearedAt ? new Date(response.clearedAt).getTime() : 0;
          const finalCutoff = Math.max(cutoff, serverCutoff || 0);
          roomChatLocalCutoffRef.current[roomId] = finalCutoff;
          try {
            await AsyncStorage.setItem(cutoffKey, String(finalCutoff));
          } catch (error) {
            console.log('Room exit cutoff update error:', error?.message || error);
          }
        } catch (error) {
          console.log('Room exit server cleanup error:', error?.message || error);
        }
      })();

      roomLeaveCleanupRef.current[roomId] = cleanup;
      cleanup.finally(() => {
        if (roomLeaveCleanupRef.current[roomId] === cleanup) {
          delete roomLeaveCleanupRef.current[roomId];
        }
        // Release the duplicate-tap guard even if the server is unavailable.
        delete roomExitInProgressRef.current[roomId];
      });
    }
  }

  async function openRoomSettings(room) {
    if (!room?.id || room.owner_id !== session?.user?.id) {
      return Alert.alert('Room Settings', 'Only the original creator of this room can open these settings.');
    }
    const requestVersion = ++roomSettingsLoadVersionRef.current;
    const requestUserId = session.user.id;
    const isCurrentRequest = () =>
      roomSettingsLoadVersionRef.current === requestVersion &&
      activeUserIdRef.current === requestUserId &&
      selectedRoomIdRef.current === room.id;

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
      if (!isCurrentRequest()) return;
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
      if (isCurrentRequest()) Alert.alert('Room Settings', e.message || 'Could not load room settings. You can still view the room details already loaded.');
    }
  }

  async function updateRoomPasswordSetting(nextType) {
    if (!selectedRoom?.id || selectedRoom.owner_id !== session?.user?.id) return;
    const password = roomSettingsPassword.trim();
    if (nextType === 'locked' && (password.length < 4 || password.length > 64)) {
      return Alert.alert('Password required', 'Enter a password between 4 and 64 characters to lock this room.');
    }
    try {
      setRoomSettingSaving(true);
      const payload = nextType === 'locked'
        ? { roomType: 'locked', password }
        : { roomType: 'public' };
      const result = await api(`/api/rooms/${selectedRoom.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      setRoomSettingsType(result.room?.room_type || nextType);
      setSelectedRoom(old => ({ ...old, ...result.room }));
      setRoomDetails(old => old?.id === selectedRoom.id ? { ...old, ...result.room, announcement: result.room.description } : old);
      setRoomSettingsPassword('');
      setShowRoomSettingsPasswordPopup(false);
      await Promise.all([loadMyRooms(), loadPublicRooms()]);
      Alert.alert(nextType === 'locked' ? 'Room locked' : 'Room unlocked', nextType === 'locked' ? 'A password is now required to enter this room.' : 'This room is now public and no password is required.');
    } catch (e) {
      Alert.alert('Password update failed', e.message || 'Could not update room password.');
    } finally {
      setRoomSettingSaving(false);
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
    const requestVersion = ++roomActivityLoadVersionRef.current;
    const isCurrentRequest = () =>
      roomActivityLoadVersionRef.current === requestVersion &&
      (roomDetailsIdRef.current === roomId || selectedRoomIdRef.current === roomId);
    setLoadingRoomActivities(true);
    try {
      const result = await api(`/api/rooms/${roomId}/activities`);
      if (isCurrentRequest()) setRoomActivities(result.activities || []);
    } catch (e) {
      if (isCurrentRequest()) { setRoomActivities([]); console.log('Room activities:', e.message); }
    } finally {
      if (roomActivityLoadVersionRef.current === requestVersion) setLoadingRoomActivities(false);
    }
  }
}
