import React, { useEffect, useState } from 'react';
import {
  Modal, SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StatusBar, Dimensions
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


function CrownMark({ size = 72 }) {
  const scale = size / 72;
  return (
    <View style={{ width: size, height: size * 0.72, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', bottom: 10 * scale, left: 5 * scale, right: 5 * scale, height: 29 * scale, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {[0, 1, 2, 3, 4].map((point, i) => (
          <View key={point} style={{
            width: 0, height: 0,
            borderLeftWidth: (i === 2 ? 10 : 8) * scale,
            borderRightWidth: (i === 2 ? 10 : 8) * scale,
            borderBottomWidth: (i === 2 ? 31 : 23) * scale,
            borderLeftColor: 'transparent', borderRightColor: 'transparent',
            borderBottomColor: i % 2 ? '#D58A20' : '#FFD96B',
            marginBottom: 0,
            transform: [{ rotate: i % 2 ? '8deg' : '-8deg' }],
            shadowColor: '#FFDF7A', shadowOpacity: 0.9, shadowRadius: 5 * scale, elevation: 7
          }} />
        ))}
      </View>
      <View style={{ width: size * 0.88, height: 15 * scale, borderRadius: 5 * scale, backgroundColor: '#E6A52E', borderWidth: 1.5 * scale, borderColor: '#FFF0A7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', shadowColor: '#FFB52E', shadowOpacity: 0.95, shadowRadius: 8 * scale, shadowOffset: { width: 0, height: 3 * scale }, elevation: 9 }}>
        {[0, 1, 2].map(n => <View key={n} style={{ width: 6 * scale, height: 6 * scale, borderRadius: 3 * scale, backgroundColor: n === 1 ? '#E83C65' : '#42D9E8', borderWidth: 1, borderColor: '#FFF4C4' }} />)}
      </View>
      <View style={{ position: 'absolute', bottom: 0, width: size * 0.98, height: 5 * scale, borderRadius: 4 * scale, backgroundColor: '#9B5415', borderWidth: 1, borderColor: '#F9D77C' }} />
    </View>
  );
}

function FruitTile({ fruit, selected, active, onPress }) {
  return (
    <TouchableOpacity key={fruit.name} activeOpacity={0.86} onPress={onPress}
      style={{
        width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17,
        borderWidth: selected ? 2 : 1.3,
        borderColor: selected ? '#FFF0B4' : '#DDAA57',
        backgroundColor: selected ? '#87501F' : '#512719',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        opacity: active ? 1 : 0.66,
        shadowColor: '#FFB84D', shadowOpacity: selected ? 0.72 : 0.38,
        shadowRadius: selected ? 12 : 7, shadowOffset: { width: 0, height: 4 }, elevation: selected ? 10 : 6
      }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 1, left: 3, right: 3, height: 34, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: 'rgba(255,238,190,0.13)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 7, left: 10, width: 25, height: 9, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ rotate: '-24deg' }] }} />
      <Text style={{ fontSize: 47, lineHeight: 55, textShadowColor: '#120805', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 5, includeFontPadding: false }}>{fruit.emoji}</Text>
      <Text style={{ color: '#FFF0B5', fontSize: 17, fontWeight: '900', marginTop: 0, textShadowColor: '#8B4A1C', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 3 }}>{fruit.multiplier}×</Text>
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 9, right: 9, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,222,145,0.45)' }} />
    </TouchableOpacity>
  );
}

export default function RoyalFruitCrownPanel({ visible, onClose }) {
  const [stake, setStake] = useState(100);
  const [roundBet, setRoundBet] = useState(0);
  const [timer, setTimer] = useState(37);
  const [phase, setPhase] = useState('betting');
  const [roundNumber, setRoundNumber] = useState(1);
  const [recent, setRecent] = useState([]);
  const [winningFruit, setWinningFruit] = useState(null);
  const [roundWinners] = useState([]);
  const [todayWins] = useState(0);
  const [totalCoins] = useState(10000);
  const [selectedFruit, setSelectedFruit] = useState(null);

  useEffect(() => {
    if (!visible) return;
    const tick = setInterval(() => {
      setTimer(current => {
        if (current > 1) return current - 1;
        if (phase === 'betting') { setPhase('result'); return 10; }
        if (phase === 'result') {
          const resultFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
          setWinningFruit(resultFruit);
          setRecent(items => [resultFruit.emoji, ...items].slice(0, 6));
          setPhase('winner');
          return 5;
        }
        setRoundNumber(value => value + 1);
        setPhase('betting');
        setRoundBet(0);
        setSelectedFruit(null);
        return 37;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [visible, phase]);

  const placeBet = (fruit) => {
    if (phase !== 'betting') return;
    setSelectedFruit(fruit.name);
    setRoundBet(value => value + stake);
  };

  const money = value => Number(value).toLocaleString('en-IN');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#160B08" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#100704' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 22, backgroundColor: '#100704' }}>
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 18, paddingTop: 5, paddingBottom: 12, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(226,177,91,0.42)', backgroundColor: '#26140F', shadowColor: '#D99636', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 10 }}>
            <CrownMark size={78} />
            <Text style={{ color: '#FFF0B5', fontSize: 32, lineHeight: 38, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.7, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>ROYAL FRUIT</Text>
            <Text style={{ color: '#FFE1A0', fontSize: 35, lineHeight: 40, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', letterSpacing: 1.5, textShadowColor: '#8C4D16', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 }, includeFontPadding: false }}>CROWN</Text>
            <Text style={{ color: '#D8B77C', fontSize: 13, fontWeight: '900', letterSpacing: 1.4, marginTop: 13 }}>ROUND {roundNumber}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 9, marginBottom: 18 }}>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.4, borderColor: '#E0B45E', borderRadius: 17, backgroundColor: '#48271B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, shadowColor: '#F6C66D', shadowOpacity: 0.34, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 }}>
              <Text style={{ color: '#FFE8A4', fontSize: 20, fontWeight: '900', marginTop: 4 }}>{money(todayWins)} coins</Text>
            </View>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.3, borderColor: GOLD_LINE, borderRadius: 17, backgroundColor: '#2A1713', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text style={{ color: '#FFE8A4', fontSize: 24, fontWeight: '900', marginTop: 6 }}>{money(totalCoins)}</Text>
            </View>
          </View>

          <View style={{ borderWidth: 2, borderColor: '#E0B45E', borderRadius: 22, padding: 9, backgroundColor: '#32190F', shadowColor: '#F4B84F', shadowOpacity: 0.48, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 11 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {FRUITS.slice(0,4).map((fruit, index) => (
                <FruitTile fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} onPress={() => placeBet(fruit)} />
              ))}
              <View style={{ width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17, borderWidth: 1.2, borderColor: GOLD_LINE, backgroundColor: '#321B14', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFE39B', fontSize: 32, fontWeight: '900', lineHeight: 36 }}>{timer}s</Text>
              </View>
              {FRUITS.slice(4).map(fruit => (
                <FruitTile fruit={fruit} selected={selectedFruit === fruit.name} active={phase === 'betting'} onPress={() => placeBet(fruit)} />
              ))}
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.3, borderColor: '#D6A552', borderRadius: 18, backgroundColor: '#3A2016', padding: 10, shadowColor: '#D9973A', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STAKES.map(amount => (
                <TouchableOpacity key={amount} onPress={() => setStake(amount)} style={{ flex: 1, height: 42, borderRadius: 11, borderWidth: 1.1, borderColor: GOLD_LINE, backgroundColor: stake === amount ? '#EAC77D' : '#48251B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: stake === amount ? '#35190D' : '#FFE3A3', fontSize: 16, fontWeight: '900' }}>{money(amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.2, borderColor: GOLD_LINE, borderRadius: 18, backgroundColor: '#28150F', padding: 10, minHeight: 72 }}>
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
            <View style={{ width: '100%', maxWidth: 560, borderRadius: 25, borderWidth: 2.5, borderColor: '#F2CF75', backgroundColor: '#2B130D', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 22, shadowColor: '#F8C95E', shadowOpacity: 0.8, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, elevation: 22 }}>
              <Text style={{ color: '#D9B777', fontSize: 14, letterSpacing: 3, textAlign: 'center', marginBottom: 22 }}>ROUND RESULT</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#FFE8A6', fontFamily: 'serif', fontWeight: '900', fontSize: 29, textAlign: 'center', marginBottom: 18 }}>👑 WINNING FRUIT</Text>
              <Text style={{ fontSize: 76, textAlign: 'center', marginBottom: 8 }}>{winningFruit.emoji}</Text>
              <Text style={{ color: '#FFE4A6', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{winningFruit.name} wins at {winningFruit.multiplier}×</Text>
              <Text style={{ color: '#F1D5A4', fontSize: 17, textAlign: 'center', marginBottom: 20 }}>Total bets: {money(roundBet)} coins</Text>
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
