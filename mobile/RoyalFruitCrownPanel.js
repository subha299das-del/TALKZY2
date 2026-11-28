import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StatusBar, Dimensions, Alert
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


function FruitTile({ fruit, selected, active, highlighted, betAmount, onPress }) {
  return (
    <TouchableOpacity key={fruit.name} activeOpacity={0.86} onPress={onPress}
      style={{
        width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17,
        borderWidth: highlighted || selected ? 2.5 : 1.3,
        borderColor: highlighted ? '#FFF5C2' : selected ? '#FFF0B4' : '#DDAA57',
        backgroundColor: highlighted ? '#9A6426' : selected ? '#87501F' : '#512719',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        opacity: active ? 1 : 0.66,
        shadowColor: '#FFD45E', shadowOpacity: highlighted ? 1 : selected ? 0.72 : 0.38,
        shadowRadius: highlighted ? 20 : selected ? 12 : 7, shadowOffset: { width: 0, height: 4 }, elevation: highlighted ? 18 : selected ? 10 : 6
      }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 3, right: 3, height: 34, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: 'rgba(255,238,190,0.13)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 7, left: 10, width: 25, height: 9, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ rotate: '-24deg' }] }} />
      <Text style={{ fontSize: 43, lineHeight: 49, textShadowColor: '#120805', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 5, includeFontPadding: false }}>{fruit.emoji}</Text>
      <Text style={{ color: '#FFF0B5', fontSize: 15, fontWeight: '900', marginTop: 0, textShadowColor: '#8B4A1C', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 3 }}>{fruit.multiplier}×</Text>
      {Number(betAmount) > 0 && (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 4, alignSelf: 'center', minWidth: 48, maxWidth: '94%', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: '#F5D27D', borderWidth: 1, borderColor: '#FFF0B4', zIndex: 5, elevation: 8 }}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#32170B', fontSize: 12, lineHeight: 15, fontWeight: '900', textAlign: 'center' }}>🪙 {Number(betAmount).toLocaleString('en-IN')}</Text>
        </View>
      )}
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 9, right: 9, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,222,145,0.45)' }} />
    </TouchableOpacity>
  );
}

export default function RoyalFruitCrownPanel({ visible, onClose, api }) {
  const [stake, setStake] = useState(100);
  const [roundBet, setRoundBet] = useState(0);
  const [balance, setBalance] = useState(0);
  const [betBusy, setBetBusy] = useState(false);
  const lastRoundIdRef = useRef(null);
  const [myRoundBets, setMyRoundBets] = useState([]);
  const [winningAmount, setWinningAmount] = useState(0);
  const [timer, setTimer] = useState(37);
  const [phase, setPhase] = useState('betting');
  const [roundNumber, setRoundNumber] = useState(1);
  const [recent, setRecent] = useState([]);
  const [winningFruit, setWinningFruit] = useState(null);
  const [roundWinners, setRoundWinners] = useState([]);
  const [todayWins] = useState(0);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [highlightedFruitIndex, setHighlightedFruitIndex] = useState(-1);
  const [animationStep, setAnimationStep] = useState(0);

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
        const bets = Array.isArray(state?.my_bets) ? state.my_bets.map(bet => ({
          fruitName: FRUITS.find(item => item.name.toLowerCase() === String(bet.fruit || '').toLowerCase())?.name || String(bet.fruit || ''),
          amount: Number(bet.amount || 0)
        })) : [];
        setMyRoundBets(bets);
        setRoundBet(bets.reduce((sum, bet) => sum + bet.amount, 0));
        setRecent((Array.isArray(state?.history) ? state.history : [])
          .map(item => FRUITS.find(fruit => fruit.name.toLowerCase() === String(item.fruit || '').toLowerCase())?.emoji)
          .filter(Boolean).slice(0, 6));
        if (round) {
          if (lastRoundIdRef.current !== round.id) {
            lastRoundIdRef.current = round.id;
            setSelectedFruit(null);
            setWinningAmount(0);
          }
          setRoundNumber(Number(round.number || 1));
          const serverPhase = round.phase;
          setPhase(serverPhase === 'betting' ? 'betting' : serverPhase === 'drawing' ? 'result' : 'winner');
          const fruit = FRUITS.find(item => item.name.toLowerCase() === String(round.winning_fruit || '').toLowerCase()) || null;
          setWinningFruit(fruit);
          const deadline = serverPhase === 'betting' ? round.bet_closes_at
            : serverPhase === 'drawing' ? round.animation_ends_at : round.result_ends_at;
          setTimer(deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000)) : 0);
          if (serverPhase === 'result' && fruit) {
            setHighlightedFruitIndex(FRUITS.findIndex(item => item.name === fruit.name));
            setWinningAmount(bets.reduce((sum, bet) => sum + (bet.fruitName === fruit.name ? bet.amount * fruit.multiplier : 0), 0));
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
    if (!visible || phase !== 'result') return;
    const timeout = setTimeout(() => {
      setHighlightedFruitIndex(index => (index + 1) % FRUITS.length);
    }, 180);
    return () => clearTimeout(timeout);
  }, [visible, phase, highlightedFruitIndex]);

  const placeBet = async (fruit) => {
    if (phase !== 'betting' || betBusy) return;
    setBetBusy(true);
    try {
      const result = await api('/api/games/royal-fruit/bet', {
        method: 'POST',
        body: JSON.stringify({
          fruit: fruit.name.toLowerCase(),
          amount: stake,
          requestKey: `royal-fruit-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
        })
      });
      setBalance(Number(result?.balance || 0));
      setSelectedFruit(fruit.name);
      setRoundBet(value => value + stake);
      setMyRoundBets(items => [...items, { fruitName: fruit.name, amount: stake }]);
    } catch (error) {
      Alert.alert('Bet not accepted', error?.message || 'Please try again.');
    } finally {
      setBetBusy(false);
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
        <ScrollView style={{ backgroundColor: 'transparent' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 22, backgroundColor: 'transparent' }}>
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 18, paddingTop: 5, paddingBottom: 12, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(226,177,91,0.42)', backgroundColor: '#26140F', shadowColor: '#D99636', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 10 }}>
            <Text style={{ color: '#FFF0B5', fontSize: 32, lineHeight: 38, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.7, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>ROYAL FRUIT</Text>
            <Text style={{ color: '#FFE1A0', fontSize: 35, lineHeight: 40, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.5, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>CROWN</Text>
            <Text style={{ color: '#D8B77C', fontSize: 13, fontWeight: '900', letterSpacing: 1.4, marginTop: 13 }}>ROUND {roundNumber}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 9, marginBottom: 18 }}>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.4, borderColor: '#E0B45E', borderRadius: 17, backgroundColor: '#56301D', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, shadowColor: '#F6C66D', shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}>
              <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 5, right: 5, height: 24, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(255,238,190,0.12)' }} />
              <Text style={{ color: '#DDBB80', fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>TODAY WINS</Text>
              <Text style={{ color: '#FFE8A4', fontSize: 20, fontWeight: '900', marginTop: 4 }}>{money(todayWins)} coins</Text>
            </View>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.3, borderColor: GOLD_LINE, borderRadius: 17, backgroundColor: '#351B13', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, shadowColor: '#D99636', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 }}>
              <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 5, right: 5, height: 24, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(255,238,190,0.10)' }} />
              <Text style={{ color: '#DDBB80', fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>MY COINS</Text>
              <Text style={{ color: '#FFE8A4', fontSize: 24, fontWeight: '900', marginTop: 6 }}>{money(balance)}</Text>
            </View>
          </View>

          <View style={{ borderWidth: 2, borderColor: '#F0C66F', borderRadius: 24, padding: 10, backgroundColor: '#3B2014', shadowColor: '#F4B84F', shadowOpacity: 0.62, shadowRadius: 20, shadowOffset: { width: 0, height: 7 }, elevation: 14 }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 12, right: 12, height: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(255,236,183,0.10)' }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {FRUITS.slice(0,4).map((fruit, index) => (
                <FruitTile key={fruit.name} fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} highlighted={phase === 'result' && highlightedFruitIndex === FRUITS.findIndex(item => item.name === fruit.name)} betAmount={fruitBetTotals[fruit.name.toLowerCase()] || 0} onPress={() => placeBet(fruit)} />
              ))}
              <View style={{ width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17, borderWidth: 1.5, borderColor: '#F0C875', backgroundColor: '#512B19', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFD66E', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 9, overflow: 'hidden' }}>
                <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 4, right: 4, height: 30, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: 'rgba(255,241,201,0.14)' }} />
                <Text style={{ color: '#FFE39B', fontSize: 32, fontWeight: '900', lineHeight: 36 }}>{timer}s</Text>
              </View>
              {FRUITS.slice(4).map(fruit => (
                <FruitTile key={fruit.name} fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} highlighted={phase === 'result' && highlightedFruitIndex === FRUITS.findIndex(item => item.name === fruit.name)} betAmount={fruitBetTotals[fruit.name] || 0} onPress={() => placeBet(fruit)} />
              ))}
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.5, borderColor: '#E5B963', borderRadius: 20, backgroundColor: '#4A2819', padding: 11, shadowColor: '#D9973A', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 9, overflow: 'hidden' }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 6, right: 6, height: 22, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'rgba(255,238,190,0.11)' }} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STAKES.map(amount => (
                <TouchableOpacity key={amount} onPress={() => setStake(amount)} style={{ flex: 1, height: 42, borderRadius: 11, borderWidth: 1.1, borderColor: GOLD_LINE, backgroundColor: stake === amount ? '#FFE29A' : '#60331E', alignItems: 'center', justifyContent: 'center', shadowColor: stake === amount ? '#FFE08A' : '#1B0904', shadowOpacity: stake === amount ? 0.8 : 0.45, shadowRadius: stake === amount ? 10 : 5, shadowOffset: { width: 0, height: 3 }, elevation: stake === amount ? 8 : 4 }}>
                <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 3, right: 3, height: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' }} />
                  <Text style={{ color: stake === amount ? '#35190D' : '#FFE3A3', fontSize: 16, fontWeight: '900' }}>{money(amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.5, borderColor: '#DDB05F', borderRadius: 20, backgroundColor: '#321B13', padding: 11, minHeight: 76, shadowColor: '#D99636', shadowOpacity: 0.38, shadowRadius: 13, shadowOffset: { width: 0, height: 5 }, elevation: 8, overflow: 'hidden' }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 6, right: 6, height: 21, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'rgba(255,238,190,0.10)' }} />
            <Text style={{ color: '#DDBB80', fontSize: 13, fontWeight: '900', letterSpacing: 0.7 }}>RECENT WINNING FRUITS</Text>
            <Text style={{ color: '#A88A68', fontSize: 14, marginTop: 12 }}>{recent.length ? recent.map((fruit, index) => (
              <Text key={`${fruit}-${index}`} style={{ fontSize: 27, marginRight: 9 }}>{fruit}</Text>
            )) : null}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'center', marginTop: 14, paddingHorizontal: 24, paddingVertical: 8 }}>
            <Text style={{ color: '#C9A36C', fontSize: 13, fontWeight: '800' }}>CLOSE GAME</Text>
          </TouchableOpacity>
        </ScrollView>
        {phase === 'winner' && winningFruit && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.84)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18 }}>
            <View style={{ width: '100%', maxWidth: 560, borderRadius: 27, borderWidth: 3, borderColor: '#FFE09A', backgroundColor: '#35190F', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 22, shadowColor: '#F8C95E', shadowOpacity: 1, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 26, overflow: 'hidden' }}>
              <View pointerEvents="none" style={{ position: 'absolute', top: 2, left: 8, right: 8, height: 42, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: 'rgba(255,236,183,0.10)' }} />
              <Text style={{ color: '#D9B777', fontSize: 14, letterSpacing: 3, textAlign: 'center', marginBottom: 22 }}>ROUND RESULT</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#FFE8A6', fontFamily: 'serif', fontWeight: '900', fontSize: 29, textAlign: 'center', marginBottom: 18 }}>👑 WINNING FRUIT</Text>
              <Text style={{ fontSize: 76, textAlign: 'center', marginBottom: 8 }}>{winningFruit.emoji}</Text>
              <Text style={{ color: '#FFE4A6', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{winningFruit.name} wins at {winningFruit.multiplier}×</Text>
              <Text style={{ color: '#F1D5A4', fontSize: 17, textAlign: 'center', marginBottom: 20 }}>Winning amount: {money(winningAmount)} coins</Text>
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
