import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

const GAMES = [
  { name:'Ludo', art:'ludo', min:2, max:4, bet:true, timed:true, rules:'Roll a six to enter a token, then race all four tokens home.' },
  { name:'Carrom', art:'carrom', min:2, max:4, bet:true, timed:true, rules:'Choose singles or doubles, then take alternating striker shots.' },
  { name:'Playcards – Breez', art:'breez', min:2, max:4, bet:true, timed:true, rules:'Play a card matching the lead suit; highest card in that suit wins the trick.' },
  { name:'UNO', art:'uno', min:4, max:4, bet:true, timed:true, rules:'Match colour or number, draw when you cannot play, and empty your hand to win.' },
  { name:'Monster Crush', art:'monster', min:2, max:4, bet:true, timed:true, rules:'Take turns clearing matching gem groups; the largest group scores more points.' },
  { name:'Truth and Dare', art:'truth', min:2, max:Infinity, bet:false, timed:false, rules:'Players take turns choosing Truth or Dare and completing the prompt.' },
  { name:'Snakes and Ladders', art:'snake', min:2, max:4, bet:true, timed:true, rules:'Roll and climb ladders; snakes send you back. First to square 100 wins.' },
  { name:'Jackaroo', art:'jackaroo', min:2, max:4, bet:true, timed:true, rules:'Use cards to bring marbles out and move them around the track to home.' },
  { name:'Brainstorm', art:'brain', min:2, max:Infinity, bet:false, timed:false, rules:'Take turns answering the round category without repeating an answer.' },
  { name:'29', art:'twentynine', min:4, max:4, bet:true, timed:true, rules:'Four-player partnership trick-taking; bid, choose trump and win card points.' }
];
const BETS = [0,10000,50000,100000,1000000];
const GOLD = '#E8C477';
const panel = '#171222';
const text = '#F5E9CF';
const muted = '#B6A68A';
const btn = { backgroundColor:'#30213B', borderColor:'#A77D45', borderWidth:1, padding:11, borderRadius:12, alignItems:'center', justifyContent:'center' };
const label = { color:text, fontWeight:'900' };
const rand = n => Math.floor(Math.random()*n);

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

function Action({title,onPress,disabled=false}) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={[btn,{opacity:disabled?.4:1,flex:1,margin:3}]}><Text style={label}>{title}</Text></TouchableOpacity>;
}
function CardTile({children,onPress,active=false}) {
  return <TouchableOpacity onPress={onPress} style={{minWidth:42,padding:10,margin:3,borderRadius:9,borderWidth:1,borderColor:active?GOLD:'#5A4964',backgroundColor:active?'#634B2B':'#251B31',alignItems:'center'}}><Text style={{color:text,fontWeight:'900'}}>{children}</Text></TouchableOpacity>;
}

export default function RoomGames({visible,onClose,roomId,creatorName='Host',userId,supabase,isAuthorisedStarter=false,hasRoomSeat=false}) {
  const [selected,setSelected]=useState(null);
  const [bet,setBet]=useState(0);
  const [carromMode,setCarromMode]=useState(2);
  const [stage,setStage]=useState('select');
  const [players,setPlayers]=useState([]);
  const [seconds,setSeconds]=useState(60);
  const [game,setGame]=useState(null);
  const [turn,setTurn]=useState(0);
  const [score,setScore]=useState({});
  const [status,setStatus]=useState('');
  const [roll,setRoll]=useState(null);
  const [positions,setPositions]=useState({});
  const [hands,setHands]=useState({});
  const [activeCard,setActiveCard]=useState(null);
  const [category,setCategory]=useState('Things found in a royal palace');
  const [answer,setAnswer]=useState('');
  const [answers,setAnswers]=useState([]);
  const [truthType,setTruthType]=useState('Truth');
  const [prompt,setPrompt]=useState('');
  const [gems,setGems]=useState(Array.from({length:16},()=>rand(4)));
  const [shot,setShot]=useState(0);
  const maxPlayers = selected?.name==='Carrom' ? carromMode : selected?.max;
  const requiredPlayers = selected?.name==='Carrom' ? carromMode : selected?.min || 2;
  const currentName = players[turn % Math.max(players.length,1)]?.name || 'Player';
  const channelRef=useRef(null);
  const lobbyIdRef=useRef(null);
  const isHostRef=useRef(false);
  const applyingRemoteRef=useRef(false);
  const pendingLocalActionRef=useRef(false);
  const canJoinWithoutSeat=selected?.name==='Brainstorm'||selected?.name==='Truth and Dare';
  const canJoinThisGame=canJoinWithoutSeat||hasRoomSeat;
  const isInLobby=players.some(p=>p.id===userId);
  const canAct=stage==='play'&&players[turn]?.id===userId;
  const markLocalAction=()=>{pendingLocalActionRef.current=true;};
  const sendGameEvent=(type,extra={})=>{
    if(!channelRef.current||!roomId||!userId)return;
    channelRef.current.send({type:'broadcast',event:'game_event',payload:{type,roomId,userId,...extra}});
  };
  const applyGameSnapshot=(snapshot)=>{
    if(!snapshot)return;
    applyingRemoteRef.current=true;
    if(snapshot.gameName){const found=GAMES.find(g=>g.name===snapshot.gameName);if(found)setSelected(found);}
    if(snapshot.bet!==undefined)setBet(snapshot.bet);
    if(snapshot.carromMode!==undefined)setCarromMode(snapshot.carromMode);
    if(snapshot.players)setPlayers(snapshot.players);
    if(snapshot.stage)setStage(snapshot.stage);
    if(snapshot.game!==undefined)setGame(snapshot.game);
    if(snapshot.turn!==undefined)setTurn(snapshot.turn);
    if(snapshot.score)setScore(snapshot.score);
    if(snapshot.status!==undefined)setStatus(snapshot.status);
    if(snapshot.roll!==undefined)setRoll(snapshot.roll);
    if(snapshot.positions)setPositions(snapshot.positions);
    if(snapshot.hands)setHands(snapshot.hands);
    if(snapshot.activeCard!==undefined)setActiveCard(snapshot.activeCard);
    if(snapshot.category!==undefined)setCategory(snapshot.category);
    if(snapshot.answers)setAnswers(snapshot.answers);
    if(snapshot.truthType)setTruthType(snapshot.truthType);
    if(snapshot.prompt!==undefined)setPrompt(snapshot.prompt);
    if(snapshot.gems)setGems(snapshot.gems);
    if(snapshot.shot!==undefined)setShot(snapshot.shot);
  };
  const currentSnapshot=()=>({gameName:selected?.name,bet,carromMode,players,stage,game,turn,score,status,roll,positions,hands,activeCard,category,answers,truthType,prompt,gems,shot});

  useEffect(()=>{
    if(!visible||!roomId||!userId||!supabase)return;
    const channel=supabase.channel('room-games-'+roomId,{config:{private:true,presence:{key:userId}}});
    channelRef.current=channel;
    channel.on('broadcast',{event:'game_event'},({payload})=>{
      if(!payload||payload.roomId!==roomId||payload.userId===userId)return;
      if(payload.type==='request_state'&&isHostRef.current&&lobbyIdRef.current){
        sendGameEvent('lobby_state',{lobbyId:lobbyIdRef.current,...currentSnapshot(),hostId:userId});
      } else if(payload.type==='create_lobby'){
        const found=GAMES.find(g=>g.name===payload.gameName);
        if(!found||stage!=='select')return;
        lobbyIdRef.current=payload.lobbyId;isHostRef.current=false;
        setSelected(found);setBet(payload.bet||0);setCarromMode(payload.carromMode||2);
        setPlayers(payload.players||[]);setSeconds(60);setStatus('Open game lobby. Join to play.');
        setStage('lobby');
      } else if(payload.type==='join_game'&&isHostRef.current&&payload.lobbyId===lobbyIdRef.current){
        setPlayers(current=>{
          if(current.some(p=>p.id===payload.player?.id)||current.length>=maxPlayers)return current;
          const next=[...current,payload.player];
          setTimeout(()=>sendGameEvent('lobby_state',{lobbyId:lobbyIdRef.current,...currentSnapshot(),players:next,hostId:userId}),0);
          return next;
        });
      } else if(payload.type==='lobby_state'&&(!lobbyIdRef.current||payload.lobbyId===lobbyIdRef.current)){
        lobbyIdRef.current=payload.lobbyId;setSelected(GAMES.find(g=>g.name===payload.gameName)||null);
        setBet(payload.bet||0);setCarromMode(payload.carromMode||2);setPlayers(payload.players||[]);
        setSeconds(payload.seconds??60);setStatus(payload.status||'Waiting for players.');
        if(payload.stage==='play')applyGameSnapshot(payload);
        else setStage('lobby');
      } else if(payload.type==='start_game'&&payload.lobbyId===lobbyIdRef.current){
        applyGameSnapshot(payload.snapshot);setStage('play');
      } else if(payload.type==='game_state'&&payload.lobbyId===lobbyIdRef.current){
        applyGameSnapshot(payload.snapshot);
      } else if(payload.type==='lobby_closed'&&payload.lobbyId===lobbyIdRef.current){
        lobbyIdRef.current=null;isHostRef.current=false;reset();
      }
    });
    channel.subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        await channel.track({userId,roomId});
        channel.send({type:'broadcast',event:'game_event',payload:{type:'request_state',roomId,userId}});
      }
    });
    return ()=>{channelRef.current=null;supabase.removeChannel(channel);};
  },[visible,roomId,userId,supabase]);

  useEffect(()=>{
    if(!['play','result'].includes(stage)||!channelRef.current||!lobbyIdRef.current)return;
    if(applyingRemoteRef.current){applyingRemoteRef.current=false;return;}
    if(!pendingLocalActionRef.current)return;
    pendingLocalActionRef.current=false;
    sendGameEvent('game_state',{lobbyId:lobbyIdRef.current,gameName:selected?.name,snapshot:currentSnapshot()});
  },[stage,selected,bet,carromMode,players,game,turn,score,status,roll,positions,hands,activeCard,category,answers,truthType,prompt,gems,shot]);

  useEffect(()=>{
    if(stage!=='lobby'||!selected?.timed||bet===0||players.length<2||seconds<=0)return;
    const timer=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);
    return ()=>clearInterval(timer);
  },[stage,selected,seconds,players.length,bet]);
  useEffect(()=>{
    if(stage==='lobby'&&isHostRef.current&&selected?.timed&&bet>0&&players.length>=2&&channelRef.current){
      sendGameEvent('lobby_state',{lobbyId:lobbyIdRef.current,...currentSnapshot(),seconds,status});
    }
  },[seconds,stage,players.length]);

  useEffect(()=>{
    if(stage==='lobby'&&selected?.timed&&bet>0&&seconds===0){
      if(players.length>=requiredPlayers)setStatus('Joining time ended. An authorised room owner or admin can start the game.');
      else setStatus('Not enough players joined. Required: '+requiredPlayers+'. The game was not started.');
    }
  },[seconds,stage,selected,players.length,requiredPlayers,bet]);

  function reset(){
    lobbyIdRef.current=null;isHostRef.current=false;pendingLocalActionRef.current=false;
    setSelected(null);setBet(0);setCarromMode(2);setStage('select');setPlayers([]);setSeconds(60);
    setGame(null);setTurn(0);setScore({});setStatus('');setRoll(null);setPositions({});setHands({});
    setActiveCard(null);setAnswers([]);setPrompt('');setShot(0);
  }
  function close(){reset();onClose?.();}
  function choose(g){setSelected(g);setBet(0);setStage('setup');}
  function createLobby(){
    if(!selected||!userId||!canJoinThisGame){setStatus('Sit in a room seat before creating or joining this game.');return;}
    const lobbyId=String(Date.now())+'-'+userId;
    const host={id:userId,name:creatorName||'Player'};
    lobbyIdRef.current=lobbyId;isHostRef.current=true;
    setPlayers([host]);setSeconds(60);
    setStatus(bet===0?'Free game lobby opened. No Good Coins will be collected or awarded.':selected.timed?'Waiting for players. The one-minute joining timer starts when the first other player joins.':'Waiting for players.');
    setStage('lobby');
    sendGameEvent('create_lobby',{lobbyId,gameName:selected.name,bet,carromMode,players:[host],seconds:60,status:'Waiting for players.'});
  }
  function joinLobby(){
    if(!selected||!userId||!canJoinThisGame){setStatus('Sit in a room seat before joining this game.');return;}
    if(players.length>=maxPlayers){setStatus('This game lobby is full.');return;}
    if(isInLobby){setStatus('You have already joined this game.');return;}
    sendGameEvent('join_game',{lobbyId:lobbyIdRef.current,gameName:selected.name,player:{id:userId,name:creatorName||'Player'}});
    setStatus('Joining game…');
  }
  function startGame(roster=players){
    if(!isAuthorisedStarter){setStatus('Only the room owner or an authorised room admin can start a game.');return;}
    if(!selected||roster.length<requiredPlayers){setStatus('At least '+requiredPlayers+' players must join before the game can start.');return;}
    const init={};roster.forEach(p=>{init[p.id]=0;});
    const sc={};roster.forEach(p=>{sc[p.id]=0;});
    const dealt={};
    if(['UNO','Playcards – Breez','29'].includes(selected.name)){
      const deck=Array.from({length:52},(_,i)=>({id:i,rank:(i%13)+1,suit:['♠','♥','♦','♣'][Math.floor(i/13)],color:['red','blue','green','yellow'][i%4]}));
      roster.forEach(p=>{dealt[p.id]=deck.splice(0,selected.name==='UNO'?7:5);});
    }
    const initial={gameName:selected.name,bet,carromMode,players:roster,stage:'play',game:selected.name,turn:0,score:sc,status:bet===0?'Free game started. No Good Coins will be collected or awarded.':'Game started.',roll:null,positions:init,hands:dealt,activeCard:null,category:selected.name==='Brainstorm'?['Things found in a royal palace','Foods beginning with S','Cities in India','Things that shine'][rand(4)]:category,answers:[],truthType:'Truth',prompt:selected.name==='Truth and Dare'?'Choose Truth or Dare to reveal a prompt.':'',gems:Array.from({length:16},()=>rand(4)),shot:0};
    applyGameSnapshot(initial);
    sendGameEvent('start_game',{lobbyId:lobbyIdRef.current,gameName:selected.name,snapshot:initial});
  }
  function nextTurn(){markLocalAction();setTurn(t=>(t+1)%Math.max(players.length,1));setRoll(null);setActiveCard(null);setStatus('Next turn: '+players[(turn+1)%Math.max(players.length,1)]?.name);}
  function updateScore(points){markLocalAction();const id=players[turn%players.length]?.id;setScore(s=>({...s,[id]:(s[id]||0)+points}));}
  function rollDice(){
    const d=rand(6)+1;setRoll(d);
    if(['Ludo','Snakes and Ladders','Jackaroo'].includes(game)){
      const id=players[turn%players.length].id;
      setPositions(p=>({...p,[id]:Math.min(game==='Snakes and Ladders'?100:56,(p[id]||0)+d)}));
      if(game==='Snakes and Ladders'){
        const pos=(positions[id]||0)+d;
        const ladders={3:22,8:30,20:41,28:55,50:67,71:91,80:100};
        const snakes={17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};
        if(ladders[pos])setPositions(p=>({...p,[id]:ladders[pos]}));
        if(snakes[pos])setPositions(p=>({...p,[id]:snakes[pos]}));
      }
      updateScore(d);
      if(game==='Snakes and Ladders'&&((positions[id]||0)+d)>=100){setStatus(players[turn%players.length].name+' wins!');return;}
      if(game==='Ludo'&&((positions[id]||0)+d)>=56){setStatus(players[turn%players.length].name+' wins!');return;}
    }
    if(game==='Carrom'){const pts=d>=4?2:1;updateScore(pts);setShot(s=>s+1);setStatus('Striker shot scored '+pts+' point(s).');}
    if(game==='Monster Crush'){const pts=d*2;updateScore(pts);setGems(Array.from({length:16},()=>rand(4)));setStatus('Gem chain cleared: '+pts+' points.');}
    nextTurn();
  }
  function playCard(card){
    if(!card)return;
    setHands(h=>({...h,[players[turn].id]:(h[players[turn].id]||[]).filter(c=>c.id!==card.id)}));
    updateScore(card.rank||1);
    if((hands[players[turn].id]||[]).length===1){setStatus(players[turn].name+' wins!');return;}
    nextTurn();
  }
  function submitAnswer(){
    const v=answer.trim();if(!v)return;
    if(answers.some(x=>x.toLowerCase()===v.toLowerCase())){setStatus('That answer was already used. Try another.');return;}
    setAnswers(a=>[...a,v]);setAnswer('');updateScore(1);nextTurn();
  }
  function revealPrompt(type){
    markLocalAction();
    const truths=['What is one thing you have never told this group?','What is your funniest childhood memory?','Who was your first crush?'];
    const dares=['Sing the chorus of your favourite song.','Speak in a royal accent for one round.','Do your best celebrity impression.'];
    setTruthType(type);setPrompt((type==='Truth'?truths:dares)[rand(3)]);
  }
  function gameControls(){
    if(game==='Ludo'||game==='Snakes and Ladders'||game==='Jackaroo')return <><Text style={label}>Dice: {roll??'—'} • Position: {positions[players[turn]?.id]||0}</Text><Action title="ROLL DICE" onPress={rollDice}/></>;
    if(game==='Carrom')return <><Text style={label}>Shot #{shot+1} • Aim and power</Text><View style={{flexDirection:'row'}}>{[1,2,3,4,5].map(n=><CardTile key={n} active={shot%5===n-1} onPress={()=>setShot(n-1)}>{n}</CardTile>)}</View><Action title="STRIKE" onPress={rollDice}/></>;
    if(game==='Monster Crush')return <><Text style={label}>Tap a gem to clear a matching group</Text><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{gems.map((g,i)=><CardTile key={i} onPress={()=>{const copy=[...gems];copy[i]=rand(4);setGems(copy);updateScore(3);setStatus('Gem matched. +3 points.');}}>{['🔴','🔵','🟢','🟡'][g]}</CardTile>)}</View><Action title="PASS TURN" onPress={nextTurn}/></>;
    if(game==='UNO'||game==='Playcards – Breez'||game==='29')return <><Text style={label}>Your hand</Text><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{(hands[players[turn]?.id]||[]).map(c=><CardTile key={c.id} onPress={()=>playCard(c)}>{game==='UNO'?c.color[0].toUpperCase()+c.rank:c.rank+c.suit}</CardTile>)}</View><Action title="DRAW / PASS" onPress={()=>{setHands(h=>({...h,[players[turn].id]:[...(h[players[turn].id]||[]),{id:Date.now(),rank:rand(13)+1,suit:'♣',color:'blue'}]}));nextTurn();}}/></>;
    if(game==='Truth and Dare')return <><Text style={label}>{prompt}</Text><View style={{flexDirection:'row'}}><Action title="TRUTH" onPress={()=>revealPrompt('Truth')}/><Action title="DARE" onPress={()=>revealPrompt('Dare')}/><Action title="DONE" onPress={nextTurn}/></View></>;
    if(game==='Brainstorm')return <><Text style={label}>Category: {category}</Text><TextInput value={answer} onChangeText={setAnswer} placeholder="Type a unique answer" placeholderTextColor={muted} style={{color:text,borderWidth:1,borderColor:GOLD,borderRadius:10,padding:10,marginVertical:8}}/><Action title="SUBMIT ANSWER" onPress={submitAnswer}/><Text style={{color:muted}}>Used: {answers.join(' • ')||'None yet'}</Text></>;
    return null;
  }
  const winner=useMemo(()=>players.slice().sort((a,b)=>(score[b.id]||0)-(score[a.id]||0))[0],[players,score]);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
    <View style={{flex:1,backgroundColor:'rgba(0,0,0,.82)',justifyContent:'center',padding:12}}>
      <View style={{maxHeight:'92%',backgroundColor:panel,borderColor:GOLD,borderWidth:1.5,borderRadius:20,padding:14}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <View><Text style={{color:GOLD,fontWeight:'900',fontSize:17}}>♛ TALKZY ROYAL GAMES</Text><Text style={{color:muted,fontSize:10}}>ROOM GAME ARENA</Text></View>
          <TouchableOpacity onPress={close}><Text style={{color:GOLD,fontSize:22}}>✕</Text></TouchableOpacity>
        </View>
        {stage==='select'&&<ScrollView style={{marginTop:12}}><View style={{flexDirection:'row',flexWrap:'wrap'}}>{GAMES.map(g=><TouchableOpacity key={g.name} onPress={()=>choose(g)} style={{width:'25%',padding:4,alignItems:'center'}}><View style={{width:62,height:62,borderRadius:14,backgroundColor:'#2A1D32',borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center'}}><RoyalGameArtwork art={g.art} /></View><Text style={{color:text,fontSize:10,textAlign:'center',marginTop:5}}>{g.name}</Text></TouchableOpacity>)}</View></ScrollView>}
        {stage==='setup'&&<View style={{marginTop:16}}><Text style={[label,{fontSize:19,textAlign:'center'}]}>{selected?.name}</Text><Text style={{color:muted,textAlign:'center',marginVertical:9}}>{selected?.rules}</Text><Text style={label}>Players: {requiredPlayers} required • {selected?.max===Infinity?'Unlimited':selected?.max+' maximum'}</Text>{selected?.name==='Carrom'&&<View style={{flexDirection:'row',marginTop:8}}><Action title="2 PLAYERS" onPress={()=>setCarromMode(2)} disabled={carromMode===2}/><Action title="4 PLAYERS" onPress={()=>setCarromMode(4)} disabled={carromMode===4}/></View>}{selected?.bet&&<><Text style={[label,{marginTop:12}]}>Bet amount (Good Coins)</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{BETS.map(v=><CardTile key={v} active={bet===v} onPress={()=>setBet(v)}>{v.toLocaleString()}</CardTile>)}</View></>}<Action title="CREATE GAME" onPress={createLobby}/><Action title="BACK" onPress={()=>setStage('select')}/></View>}
        {stage==='lobby'&&<View style={{marginTop:14}}><Text style={[label,{fontSize:18,textAlign:'center'}]}>{selected?.name} Lobby</Text><Text style={{color:muted,textAlign:'center',margin:8}}>Bet: {selected?.bet?bet.toLocaleString()+' Good Coins':'No bet'} • {players.length}/{maxPlayers===Infinity?'∞':maxPlayers} players</Text>{selected?.timed&&bet>0&&<Text style={{color:GOLD,textAlign:'center',fontSize:22,fontWeight:'900'}}>{seconds}s</Text>}<View style={{flexDirection:'row',flexWrap:'wrap'}}>{players.map(p=><View key={p.id} style={{width:'50%',padding:6}}><Text style={{color:text,backgroundColor:'#2A2033',padding:12,borderRadius:10}}>{p.name}{p.id==='host'?' (Creator)':''}</Text></View>)}</View><Text style={{color:muted,textAlign:'center',marginVertical:8}}>{status}</Text>{!isInLobby&&<Action title="JOIN GAME" onPress={joinLobby} disabled={players.length>=maxPlayers||!canJoinThisGame}/>}{isAuthorisedStarter&&<Action title="START GAME" onPress={()=>startGame()} disabled={players.length<requiredPlayers}/>}<Text style={{color:muted,textAlign:'center',fontSize:10,marginVertical:5}}>{isAuthorisedStarter?'You are authorised to start this game.':'Only the room owner or an authorised admin can start this game.'}</Text><Action title="CLOSE" onPress={()=>{if(isHostRef.current)sendGameEvent('lobby_closed',{lobbyId:lobbyIdRef.current});close();}}/></View>}
        {stage==='play'&&<ScrollView style={{marginTop:12}}><Text style={[label,{textAlign:'center',fontSize:18}]}>{game}</Text><Text style={{color:GOLD,textAlign:'center',margin:8}}>Turn: {currentName}</Text><Text style={{color:muted,textAlign:'center'}}>Players: {players.map(p=>p.name+' '+(score[p.id]||0)).join('  •  ')}</Text><View style={{backgroundColor:'#21182B',padding:14,borderRadius:14,marginTop:12}}><View pointerEvents={canAct?'auto':'none'} style={{opacity:canAct?1:0.48}}>{gameControls()}</View>{!canAct&&<Text style={{color:muted,textAlign:'center',marginTop:8}}>Waiting for {currentName} to play.</Text>}</View><Text style={{color:muted,textAlign:'center',margin:10}}>{status}</Text><Action title="END GAME" onPress={()=>{if(isAuthorisedStarter){markLocalAction();setStage('result');}}} disabled={!isAuthorisedStarter}/></ScrollView>}
        {stage==='result'&&<View style={{marginTop:18}}><Text style={[label,{fontSize:21,textAlign:'center'}]}>GAME RESULT</Text><Text style={{color:GOLD,textAlign:'center',fontSize:18,margin:12}}>{winner?.name||'No winner'} • {score[winner?.id]||0} points</Text>{players.map(p=><Text key={p.id} style={{color:text,padding:7}}>{p.name}: {score[p.id]||0}</Text>)}<Action title="BACK TO GAMES" onPress={reset}/></View>}
      </View>
    </View>
  </Modal>;
}
