import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image,
  StatusBar, useWindowDimensions, Alert, Animated, Easing
} from 'react-native';

const GOLD = '#F6D987';
const GOLD_LINE = '#B98743';
const FRUITS = [
  { name: 'Apple', emoji: '🍎', multiplier: 5 },
  { name: 'Mango', emoji: '🥭', multiplier: 5 },
  { name: 'Orange', emoji: '🍊', multiplier: 5 },
  { name: 'Grapes', emoji: '🍇', multiplier: 40 },
  { name: 'Watermelon', emoji: '🍉', multiplier: 5 },
  { name: 'Cherries', emoji: '🍒', multiplier: 25 },
  { name: 'Pineapple', emoji: '🍍', multiplier: 15 },
  { name: 'Strawberry', emoji: '🍓', multiplier: 10 }
];
const STAKES = [100, 500, 1000, 5000];

// Keep historical results readable when rounds were recorded with legacy fruit names.
const LEGACY_FRUITS = {
  lemon: { name: 'Lemon', emoji: '🍋', multiplier: null },
  cherry: { name: 'Cherry', emoji: '🍒', multiplier: null }
};
const getFruitByName = value => {
  const key = String(value || '').trim().toLowerCase();
  return FRUITS.find(fruit => fruit.name.toLowerCase() === key)
    || LEGACY_FRUITS[key]
    || null;
};


function FruitTile({ fruit, selected, active, highlighted, betAmount, onPress, tileHeight, emojiSize }) {
  const shine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(shine, { toValue: 1, duration: 1050, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(shine, { toValue: 0, duration: 1050, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    ]));
    animation.start();
    return () => animation.stop();
  }, [shine]);
  const glowOpacity = shine.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.95] });
  const glintOpacity = shine.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const glowScale = shine.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.18] });
  return (
    <TouchableOpacity key={fruit.name} activeOpacity={0.86} onPress={onPress}
      style={{
        width: '31.8%', height: tileHeight, marginBottom: 4, borderRadius: 16,
        borderWidth: highlighted || selected ? 2.7 : 1.5,
        borderColor: highlighted ? '#FFF9D9' : selected ? '#FFF0B4' : '#E7B969',
        backgroundColor: highlighted ? '#A96B28' : selected ? '#925321' : '#63301A',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        opacity: active ? 1 : 0.82,
        shadowColor: '#FFD45E', shadowOpacity: highlighted ? 1 : selected ? 0.9 : 0.62,
        shadowRadius: highlighted ? 24 : selected ? 17 : 12, shadowOffset: { width: 0, height: 5 }, elevation: highlighted ? 22 : selected ? 14 : 9
      }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 2, left: 3, right: 3, bottom: 2, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,239,190,0.24)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 3, right: 3, height: 48, borderTopLeftRadius: 17, borderTopRightRadius: 17, backgroundColor: 'rgba(255,245,214,0.19)' }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 12, alignSelf: 'center', width: tileHeight * 0.78, height: tileHeight * 0.72, borderRadius: tileHeight, backgroundColor: 'rgba(255,196,65,0.32)', opacity: glowOpacity, transform: [{ scale: glowScale }], shadowColor: '#FFF0A6', shadowOpacity: 1, shadowRadius: 30, elevation: 16 }} />
      <Text style={{ fontSize: emojiSize, lineHeight: emojiSize + 6, textShadowColor: '#1A0803', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 8, includeFontPadding: false }}>{fruit.emoji}</Text>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: Math.max(12, tileHeight * 0.20), left: '33%', width: 11, height: 27, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.98)', opacity: glintOpacity, transform: [{ rotate: '27deg' }, { scale: glowScale }], shadowColor: '#FFFFFF', shadowOpacity: 1, shadowRadius: 11, elevation: 9 }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: Math.max(29, tileHeight * 0.42), left: '30%', width: 7, height: 11, borderRadius: 8, backgroundColor: '#FFFFFF', opacity: glintOpacity, transform: [{ rotate: '20deg' }] }} />
      <Text style={{ color: '#FFF0B5', fontSize: 15, fontWeight: '900', marginTop: 0, textShadowColor: '#8B4A1C', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 3 }}>{fruit.multiplier}×</Text>
      {Number(betAmount) > 0 && (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 4, alignSelf: 'center', minWidth: 48, maxWidth: '94%', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: '#F5D27D', borderWidth: 1, borderColor: '#FFF0B4', zIndex: 5, elevation: 8 }}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#32170B', fontSize: 12, lineHeight: 15, fontWeight: '900', textAlign: 'center' }}>🪙 {Number(betAmount).toLocaleString('en-IN')}</Text>
        </View>
      )}
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 9, right: 9, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,232,170,0.72)' }} />
    </TouchableOpacity>
  );
}

export default function RoyalFruitCrownPanel({ visible, onClose, api }) {
  const { height: screenHeight } = useWindowDimensions();
  const compactScreen = screenHeight < 780;
  const tileHeight = Math.max(68, Math.min(compactScreen ? 82 : 94, Math.floor((screenHeight - 470) / 3)));
  const emojiSize = Math.round(tileHeight * 0.47);
  const [stake, setStake] = useState(100);
  const [roundBet, setRoundBet] = useState(0);
  const [balance, setBalance] = useState(0);
  const lastRoundIdRef = useRef(null);
  const [myRoundBets, setMyRoundBets] = useState([]);
  const [winningAmount, setWinningAmount] = useState(null);
  const [timer, setTimer] = useState(37);
  const [timerDeadline, setTimerDeadline] = useState(null);
  const [phase, setPhase] = useState('betting');
  const [roundNumber, setRoundNumber] = useState(0);
  const [recent, setRecent] = useState([]);
  const [winningFruit, setWinningFruit] = useState(null);
  const [roundWinners, setRoundWinners] = useState([]);
  const [todayWins, setTodayWins] = useState(0);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [highlightedFruitIndex, setHighlightedFruitIndex] = useState(-1);
  const [animationStep, setAnimationStep] = useState(0);
  const [activeSection, setActiveSection] = useState('game');
  const countdownPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible || activeSection !== 'game' || (phase !== 'betting' && phase !== 'drawing')) {
      countdownPulse.stopAnimation();
      countdownPulse.setValue(0);
      return;
    }
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(countdownPulse, { toValue: 1, duration: 230, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(countdownPulse, { toValue: 0, duration: 230, easing: Easing.linear, useNativeDriver: true })
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [visible, activeSection, phase, countdownPulse]);
  const countdownGlowOpacity = countdownPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.92] });
  const countdownTextOpacity = countdownPulse.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] });
  const countdownScale = countdownPulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] });
  const [myHistory, setMyHistory] = useState([]);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [topWinners, setTopWinners] = useState([]);
  const [topWinnersLoading, setTopWinnersLoading] = useState(false);

  useEffect(() => {
    if (!visible || typeof api !== 'function') return;
    let cancelled = false;
    let inFlight = false;
    const syncState = async () => {
      if (inFlight || cancelled) return;
      inFlight = true;
      try {
        const state = await api('/api/games/royal-fruit/state');
        if (cancelled) return;
        const round = state?.round;
        setBalance(Number(state?.balance || 0));
        setTodayWins(Number(state?.today_wins || 0));
        setRoundNumber(Number(state?.daily_round_number || 0));
        const bets = Array.isArray(state?.my_bets) ? state.my_bets.map(bet => ({
          fruitName: FRUITS.find(item => item.name.toLowerCase() === String(bet.fruit || '').toLowerCase())?.name || String(bet.fruit || ''),
          amount: Number(bet.amount || 0)
        })) : [];
        setMyRoundBets(bets);
        setRoundBet(bets.reduce((sum, bet) => sum + bet.amount, 0));
        setRecent((Array.isArray(state?.history) ? state.history : [])
          .map(item => getFruitByName(item.fruit)?.emoji)
          .filter(Boolean).slice(0, 8));
        if (round) {
          if (lastRoundIdRef.current !== round.id) {
            lastRoundIdRef.current = round.id;
            setSelectedFruit(null);
            setWinningAmount(null);
          }
          setRoundNumber(Number(state?.daily_round_number ?? round.number ?? 0));
          const serverPhase = round.phase;
          setPhase(serverPhase === 'betting' ? 'betting' : serverPhase === 'drawing' ? 'result' : 'winner');
          const fruit = getFruitByName(round.winning_fruit);
          setWinningFruit(fruit);
          const deadline = serverPhase === 'betting' ? round.bet_closes_at
            : serverPhase === 'drawing' ? round.animation_ends_at : round.result_ends_at;
          setTimerDeadline(deadline ? new Date(deadline).getTime() : null);
          if (serverPhase === 'result' && fruit) {
            setHighlightedFruitIndex(FRUITS.findIndex(item => item.name === fruit.name));
            setWinningAmount(Number.isFinite(Number(state?.my_winning_amount)) ? Number(state.my_winning_amount) : null);
          } else if (serverPhase === 'betting') {
            setWinningAmount(0);
            setHighlightedFruitIndex(-1);
          }
          setRoundWinners(Array.isArray(state?.leaders) ? state.leaders.map(winner => ({
            userId: winner.user_id,
            name: winner.display_name || 'Player',
            initials: String(winner.display_name || 'P').slice(0, 2).toUpperCase(),
            payout: Number(winner.coins || 0)
          })) : []);
        }
      } catch (error) {
        if (!cancelled) console.log('Royal Fruit Crown sync:', error?.message || error);
      } finally {
        inFlight = false;
      }
    };
    syncState();
    const interval = setInterval(syncState, 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [visible, api]);

  useEffect(() => {
    if (!visible || !timerDeadline) return;
    const updateCountdown = () => {
      const next = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
      setTimer(previous => previous === next ? previous : next);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [visible, timerDeadline]);

  useEffect(() => {
    if (!visible || phase !== 'result') return;
    const timeout = setTimeout(() => {
      setHighlightedFruitIndex(index => (index + 1) % FRUITS.length);
    }, 180);
    return () => clearTimeout(timeout);
  }, [visible, phase, highlightedFruitIndex]);

  const loadHistory = async (reset = false) => {
    if (historyLoading || typeof api !== 'function') return;
    setHistoryLoading(true);
    const offset = reset ? 0 : historyOffset;
    try {
      const result = await api(`/api/games/royal-fruit/history?limit=20&offset=${offset}`);
      const rows = Array.isArray(result?.history) ? result.history : [];
      setMyHistory(previous => reset ? rows : [...previous, ...rows]);
      setHistoryOffset(offset + rows.length);
      setHistoryHasMore(rows.length === 20);
    } catch (error) {
      Alert.alert('History unavailable', error?.message || 'Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadTopWinners = async () => {
    if (topWinnersLoading || typeof api !== 'function') return;
    setTopWinnersLoading(true);
    try {
      const result = await api('/api/games/royal-fruit/top-winners');
      setTopWinners(Array.isArray(result?.winners) ? result.winners : []);
    } catch (error) {
      Alert.alert('Top winners unavailable', error?.message || 'Please try again.');
    } finally {
      setTopWinnersLoading(false);
    }
  };

  const formatHistoryDate = value => {
    if (!value) return '';
    const date = new Date(value);
    return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })} · ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`;
  };

  useEffect(() => {
    if (!visible) return;
    if (activeSection === 'history') {
      setMyHistory([]);
      setHistoryOffset(0);
      setHistoryHasMore(false);
      loadHistory(true);
    } else if (activeSection === 'top') {
      loadTopWinners();
    }
  }, [visible, activeSection, api]);

  const placeBet = async (fruit) => {
    if (phase !== 'betting') return;
    const betAmount = stake;
    try {
      const result = await api('/api/games/royal-fruit/bet', {
        method: 'POST',
        body: JSON.stringify({
          fruit: fruit.name.toLowerCase(),
          amount: betAmount,
          requestKey: `royal-fruit-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
        })
      });
      if (!result?.accepted) throw new Error('The server did not confirm this bet.');
      setBalance(value => Math.max(0, Number(value || 0) - betAmount));
      setSelectedFruit(fruit.name);
      setRoundBet(value => value + betAmount);
      setMyRoundBets(items => [...items, { fruitName: fruit.name, amount: betAmount }]);
    } catch (error) {
      Alert.alert('Bet not accepted', error?.message || 'Please try again.');
    }
  };

  const money = value => Number(value).toLocaleString('en-IN');
  const fruitBetTotals = myRoundBets.reduce((totals, bet) => {
    const fruitKey = String(bet.fruitName || '').trim().toLowerCase();
    if (fruitKey) totals[fruitKey] = (totals[fruitKey] || 0) + Number(bet.amount || 0);
    return totals;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#160B08" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#080503', overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#080503' }}>
          <View style={{ position: 'absolute', top: -135, left: -115, width: 330, height: 330, borderRadius: 165, backgroundColor: '#32170D', opacity: 0.72, shadowColor: '#C77A2C', shadowOpacity: 0.9, shadowRadius: 85, shadowOffset: { width: 0, height: 0 }, elevation: 20 }} />
          <View style={{ position: 'absolute', top: 210, right: -165, width: 360, height: 430, borderRadius: 210, backgroundColor: '#241008', opacity: 0.86, shadowColor: '#B66A24', shadowOpacity: 0.75, shadowRadius: 90, shadowOffset: { width: 0, height: 0 }, elevation: 18 }} />
          <View style={{ position: 'absolute', bottom: -170, left: -100, width: 360, height: 360, borderRadius: 180, backgroundColor: '#32180D', opacity: 0.56, shadowColor: '#D69A43', shadowOpacity: 0.7, shadowRadius: 90, shadowOffset: { width: 0, height: 0 }, elevation: 16 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,218,145,0.18)' }} />
          <View style={{ position: 'absolute', top: '37%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(225,163,81,0.07)' }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,218,145,0.10)' }} />
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }} scrollEnabled={true} showsVerticalScrollIndicator={activeSection !== 'game'} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 14, paddingTop: compactScreen ? 2 : 8, paddingBottom: compactScreen ? 4 : 22, backgroundColor: 'transparent' }}>
          <View style={{ alignItems: 'center', marginTop: compactScreen ? 1 : 8, marginBottom: compactScreen ? 6 : 18, paddingTop: compactScreen ? 2 : 5, paddingBottom: compactScreen ? 5 : 12, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(226,177,91,0.42)', backgroundColor: '#26140F', shadowColor: '#D99636', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 10 }}>
            <Text style={{ color: '#FFF0B5', fontSize: compactScreen ? 25 : 32, lineHeight: compactScreen ? 29 : 38, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.7, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>ROYAL FRUIT</Text>
            <Text style={{ color: '#FFE1A0', fontSize: compactScreen ? 27 : 35, lineHeight: compactScreen ? 31 : 40, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.5, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>CROWN</Text>
            <Text style={{ color: '#D8B77C', fontSize: compactScreen ? 10 : 13, fontWeight: '900', letterSpacing: 1.4, marginTop: compactScreen ? 5 : 13 }}>ROUND {roundNumber}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: compactScreen ? 7 : 15 }}>
            {[
              { key: 'game', label: 'GAME' },
              { key: 'rules', label: 'RULES' },
              { key: 'history', label: 'HISTORY' },
              { key: 'top', label: 'TOP WINNER' }
            ].map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveSection(tab.key)}
                style={{ flex: 1, minHeight: compactScreen ? 33 : 39, paddingHorizontal: 3, borderRadius: 11, borderWidth: 1.2, borderColor: activeSection === tab.key ? '#FFE29A' : '#956A3B', backgroundColor: activeSection === tab.key ? '#EAC477' : '#321B13', alignItems: 'center', justifyContent: 'center' }}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: activeSection === tab.key ? '#35190D' : '#E8C78D', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeSection === 'game' && (
          <>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: compactScreen ? 7 : 12 }}>
            <View style={{ flex: 1, minWidth: 0, borderWidth: 1.4, borderColor: '#DDB05F', borderRadius: 14, backgroundColor: '#321B13', paddingVertical: compactScreen ? 7 : 10, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', shadowColor: '#D99636', shadowOpacity: 0.28, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 5 }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#FFE3A3', fontSize: compactScreen ? 15 : 19, fontWeight: '900', marginTop: 3 }}>🪙 {money(balance)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0, borderWidth: 1.4, borderColor: '#DDB05F', borderRadius: 14, backgroundColor: '#321B13', paddingVertical: compactScreen ? 7 : 10, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', shadowColor: '#D99636', shadowOpacity: 0.28, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 5 }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#62D89A', fontSize: compactScreen ? 15 : 19, fontWeight: '900', marginTop: 3 }}>🪙 {money(todayWins)}</Text>
            </View>
          </View>
          <View style={{ borderWidth: 2, borderColor: '#F0C66F', borderRadius: 24, padding: 10, backgroundColor: '#3B2014', shadowColor: '#F4B84F', shadowOpacity: 0.62, shadowRadius: 20, shadowOffset: { width: 0, height: 7 }, elevation: 14 }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 12, right: 12, height: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(255,236,183,0.10)' }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {FRUITS.slice(0,4).map((fruit, index) => (
                <FruitTile key={fruit.name} fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} highlighted={phase === 'result' && highlightedFruitIndex === FRUITS.findIndex(item => item.name === fruit.name)} betAmount={fruitBetTotals[fruit.name.toLowerCase()] || 0} tileHeight={tileHeight} emojiSize={emojiSize} onPress={() => placeBet(fruit)} />
              ))}
              <View style={{ width: '31.8%', height: tileHeight, marginBottom: 4, borderRadius: 17, borderWidth: 1.8, borderColor: '#FFE08A', backgroundColor: '#512B19', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFF0A6', shadowOpacity: 0.95, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 14, overflow: 'hidden' }}>
                <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: 22, backgroundColor: '#FFD45E', opacity: countdownGlowOpacity, transform: [{ scale: countdownScale }] }} />
                <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 4, right: 4, height: 30, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: 'rgba(255,248,218,0.25)' }} />
                <Animated.Text style={{ color: '#FFF2B8', fontSize: compactScreen ? 25 : 32, fontWeight: '900', lineHeight: compactScreen ? 29 : 36, opacity: countdownTextOpacity, textShadowColor: '#FFFFFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 13, transform: [{ scale: countdownScale }] }}>{timer}s</Animated.Text>
              </View>
              {FRUITS.slice(4).map(fruit => (
                <FruitTile key={fruit.name} fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} highlighted={phase === 'result' && highlightedFruitIndex === FRUITS.findIndex(item => item.name === fruit.name)} betAmount={fruitBetTotals[fruit.name.toLowerCase()] || 0} tileHeight={tileHeight} emojiSize={emojiSize} onPress={() => placeBet(fruit)} />
              ))}
            </View>
          </View>

          <View style={{ marginTop: compactScreen ? 5 : 11, borderWidth: 1.5, borderColor: '#E5B963', borderRadius: 20, backgroundColor: '#4A2819', padding: compactScreen ? 7 : 11, shadowColor: '#D9973A', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 9, overflow: 'hidden' }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 6, right: 6, height: 22, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'rgba(255,238,190,0.11)' }} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STAKES.map(amount => (
                <TouchableOpacity key={amount} onPress={() => setStake(amount)} style={{ flex: 1, height: compactScreen ? 34 : 42, borderRadius: 11, borderWidth: 1.1, borderColor: GOLD_LINE, backgroundColor: stake === amount ? '#FFE29A' : '#60331E', alignItems: 'center', justifyContent: 'center', shadowColor: stake === amount ? '#FFE08A' : '#1B0904', shadowOpacity: stake === amount ? 0.8 : 0.45, shadowRadius: stake === amount ? 10 : 5, shadowOffset: { width: 0, height: 3 }, elevation: stake === amount ? 8 : 4 }}>
                <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 3, right: 3, height: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' }} />
                  <Text style={{ color: stake === amount ? '#35190D' : '#FFE3A3', fontSize: compactScreen ? 13 : 16, fontWeight: '900' }}>{money(amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: compactScreen ? 5 : 11, borderWidth: 1.5, borderColor: '#DDB05F', borderRadius: 20, backgroundColor: '#321B13', paddingHorizontal: compactScreen ? 9 : 13, paddingTop: compactScreen ? 7 : 10, paddingBottom: compactScreen ? 9 : 12, minHeight: compactScreen ? 82 : 112, shadowColor: '#D99636', shadowOpacity: 0.38, shadowRadius: 13, shadowOffset: { width: 0, height: 5 }, elevation: 8, overflow: 'hidden' }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 6, right: 6, height: 21, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'rgba(255,238,190,0.10)' }} />
            <Text style={{ color: '#DDBB80', fontSize: compactScreen ? 10 : 13, fontWeight: '900', letterSpacing: 0.7 }}>RECENT WINNING FRUITS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: compactScreen ? 5 : 8, rowGap: compactScreen ? 3 : 5 }}>
              {Array.from({ length: 8 }, (_, index) => (
                <View key={index} style={{ width: '11.11%', minHeight: compactScreen ? 27 : 34, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: compactScreen ? 21 : 27, textAlign: 'center' }}>{recent[index] || '·'}</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'center', marginTop: compactScreen ? 3 : 14, paddingHorizontal: 24, paddingVertical: compactScreen ? 3 : 8 }}>
            <Text style={{ color: '#C9A36C', fontSize: compactScreen ? 10 : 13, fontWeight: '800' }}>CLOSE GAME</Text>
          </TouchableOpacity>
          </>
          )}

          {activeSection === 'rules' && (
            <View style={{ borderWidth: 1.5, borderColor: '#DDB05F', borderRadius: 19, backgroundColor: '#321B13', padding: 14, marginBottom: 18 }}>
              <Text style={{ color: '#FFE3A3', fontSize: 17, fontWeight: '900', marginBottom: 12 }}>ROYAL FRUIT CROWN RULES</Text>
              {[
                'Each round has 37 seconds for betting.',
                'You can bet on any or all eight fruits.',
                'You can place multiple bets, including repeated bets on the same fruit.',
                'Each accepted bet is deducted immediately from your main TALKZY wallet.',
                'After betting closes, a 10-second result animation runs.',
                'The winning fruit and round winners are shown for 5 seconds.',
                'The next round starts automatically.',
                'Winning payout includes the original stake.'
              ].map((rule, index) => (
                <View key={index} style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: '#E8C47D', width: 20, fontWeight: '900' }}>{index + 1}.</Text>
                  <Text style={{ color: '#F3EBDD', flex: 1, fontSize: 13, lineHeight: 19 }}>{rule}</Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: '#75502F', marginVertical: 8 }} />
              <Text style={{ color: '#E8C47D', fontSize: 14, fontWeight: '900', marginBottom: 10 }}>FRUIT PAYOUTS</Text>
              {FRUITS.map(fruit => (
                <View key={fruit.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <Text style={{ fontSize: 23 }}>{fruit.emoji}</Text>
                    <Text style={{ color: '#F3EBDD', fontSize: 13, fontWeight: '700' }}>{fruit.name}</Text>
                  </View>
                  <Text style={{ color: '#FFE3A3', fontSize: 14, fontWeight: '900' }}>{fruit.multiplier}×</Text>
                </View>
              ))}
            </View>
          )}

          {activeSection === 'history' && (
            <View style={{ gap: 11, marginBottom: 18 }}>
              {myHistory.map((item, index) => (
                <View key={`${item.round_number}-${index}`} style={{ borderWidth: 1.4, borderColor: '#B98743', borderRadius: 17, backgroundColor: '#321B13', padding: 13 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ color: '#FFE3A3', fontSize: 14, fontWeight: '900' }}>ROUND NO. {item.round_number}</Text>
                    <Text style={{ color: '#C9A982', fontSize: 10 }}>{formatHistoryDate(item.played_at)}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: '#75502F', marginBottom: 10 }} />
                  <Text style={{ color: '#DDBB80', fontSize: 11, fontWeight: '900', marginBottom: 8 }}>YOUR BETS</Text>
                  {(Array.isArray(item.bets) ? item.bets : []).map(bet => {
                    const fruit = getFruitByName(bet.fruit);
                    return (
                      <View key={bet.fruit} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 24 }}>{fruit?.emoji || '🍀'}</Text>
                          <Text style={{ color: '#F3EBDD', fontSize: 13, fontWeight: '700' }}>{fruit?.name || bet.fruit}</Text>
                        </View>
                        <Text style={{ color: '#FFE3A3', fontSize: 13, fontWeight: '900' }}>{money(bet.amount)} coins</Text>
                      </View>
                    );
                  })}
                  <View style={{ height: 1, backgroundColor: '#75502F', marginVertical: 9 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#DDBB80', fontSize: 11, fontWeight: '900' }}>WINNING FRUIT</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <Text style={{ fontSize: 23 }}>{getFruitByName(item.winning_fruit)?.emoji || '—'}</Text>
                      <Text style={{ color: '#F3EBDD', fontSize: 13, fontWeight: '800' }}>{getFruitByName(item.winning_fruit)?.name || item.winning_fruit || '—'}</Text>
                    </View>
                  </View>
                  {Number(item.winning_amount) > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <Text style={{ color: '#DDBB80', fontSize: 11, fontWeight: '900' }}>WINNING AMOUNT</Text>
                      <Text style={{ color: '#62D89A', fontSize: 15, fontWeight: '900' }}>{money(item.winning_amount)} coins</Text>
                    </View>
                  )}
                </View>
              ))}
              {myHistory.length === 0 && !historyLoading && (
                <Text style={{ color: '#C9A982', textAlign: 'center', paddingVertical: 28 }}>No history yet</Text>
              )}
              {historyLoading && <Text style={{ color: '#DDBB80', textAlign: 'center', padding: 12 }}>Loading...</Text>}
              {historyHasMore && !historyLoading && (
                <TouchableOpacity onPress={() => loadHistory(false)} style={{ alignSelf: 'center', borderWidth: 1, borderColor: '#B98743', borderRadius: 12, paddingHorizontal: 22, paddingVertical: 10 }}>
                  <Text style={{ color: '#FFE3A3', fontWeight: '900', fontSize: 12 }}>LOAD MORE</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeSection === 'top' && (
            <View style={{ gap: 10, marginBottom: 18 }}>
              <Text style={{ color: '#FFE3A3', fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 5 }}>TODAY'S TOP WINNERS</Text>
              <Text style={{ color: '#C9A982', fontSize: 10, textAlign: 'center', marginBottom: 5 }}>DAILY RANKING · RESETS AT 00:00 IST</Text>
              {topWinners.map((winner, index) => (
                <View key={winner.user_id || index} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.2, borderColor: index === 0 ? '#E9C36D' : '#75502F', borderRadius: 15, backgroundColor: '#321B13', padding: 10 }}>
                  <Text style={{ color: '#E9C36D', width: 27, fontSize: 16, fontWeight: '900' }}>{winner.rank || index + 1}</Text>
                  {winner.avatar_url ? (
                    <Image source={{ uri: winner.avatar_url }} style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: '#65452D' }} />
                  ) : (
                    <View style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: '#DDBB80', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#321B13', fontWeight: '900' }}>{String(winner.display_name || 'P').slice(0, 2).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text numberOfLines={1} style={{ color: '#F3EBDD', fontSize: 13, fontWeight: '900' }}>{winner.display_name || 'Player'}</Text>
                    <Text style={{ color: '#C9A982', fontSize: 10 }}>ID: {winner.talkzy_id || '—'}</Text>
                  </View>
                  <Text style={{ color: '#FFE3A3', fontSize: 12, fontWeight: '900' }}>{money(winner.coins)} coins</Text>
                </View>
              ))}
              {topWinners.length === 0 && !topWinnersLoading && (
                <Text style={{ color: '#C9A982', textAlign: 'center', paddingVertical: 28 }}>No winners yet today</Text>
              )}
              {topWinnersLoading && <Text style={{ color: '#DDBB80', textAlign: 'center', padding: 12 }}>Loading...</Text>}
              <TouchableOpacity onPress={loadTopWinners} style={{ alignSelf: 'center', borderWidth: 1, borderColor: '#B98743', borderRadius: 12, paddingHorizontal: 22, paddingVertical: 10, marginTop: 4 }}>
                <Text style={{ color: '#FFE3A3', fontWeight: '900', fontSize: 12 }}>REFRESH</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        {activeSection === 'game' && phase === 'winner' && winningFruit && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.84)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18 }}>
            <View style={{ width: '100%', maxWidth: 560, borderRadius: 27, borderWidth: 3, borderColor: '#FFE09A', backgroundColor: '#35190F', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 22, shadowColor: '#F8C95E', shadowOpacity: 1, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 26, overflow: 'hidden' }}>
              <View pointerEvents="none" style={{ position: 'absolute', top: 2, left: 8, right: 8, height: 42, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: 'rgba(255,236,183,0.10)' }} />
              <Text style={{ color: '#D9B777', fontSize: 14, letterSpacing: 3, textAlign: 'center', marginBottom: 22 }}>ROUND RESULT</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#FFE8A6', fontFamily: 'serif', fontWeight: '900', fontSize: 29, textAlign: 'center', marginBottom: 18 }}>👑 WINNING FRUIT</Text>
              <Text style={{ fontSize: 76, textAlign: 'center', marginBottom: 8 }}>{winningFruit.emoji}</Text>
              <Text style={{ color: '#FFE4A6', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{winningFruit.name} wins at {winningFruit.multiplier}×</Text>
              {winningAmount !== null && (
                <Text style={{ color: '#F1D5A4', fontSize: 17, textAlign: 'center', marginBottom: 20 }}>Winning amount: {money(winningAmount)} coins</Text>
              )}
              {roundWinners.length > 0 ? (
                <>
                  <Text style={{ color: '#D9B777', fontSize: 14, letterSpacing: 2.2, textAlign: 'center', marginBottom: 14 }}>TOP 3 WINNERS THIS ROUND</Text>
                  <View style={{ flexDirection: 'row', gap: 7, marginBottom: 20 }}>
                    {roundWinners.slice(0, 3).map((winner, index) => (
                      <View key={winner.userId || index} style={{ flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#8E6339', borderRadius: 13, backgroundColor: '#1D0D09', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 3 }}>
                        <View style={{ width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderColor: '#F3D17D', backgroundColor: '#E8C77D', alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>
                          <Text style={{ color: '#3C210F', fontSize: 16, fontWeight: '900' }}>{winner.initials || '—'}</Text>
                        </View>
                        <Text numberOfLines={1} style={{ color: '#F6DDB0', fontSize: 12, marginBottom: 5 }}>{winner.name}</Text>
                        <Text style={{ color: '#EFD18C', fontSize: 12, fontWeight: '900' }}>🪙 {money(winner.payout)}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={{ color: '#F1D5A4', fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 10, marginBottom: 20 }}>NO ONE WINS IN THIS ROUND</Text>
              )}
              <Text style={{ color: '#D9B777', fontSize: 14, textAlign: 'center' }}>Next round starts automatically in {timer} seconds</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
