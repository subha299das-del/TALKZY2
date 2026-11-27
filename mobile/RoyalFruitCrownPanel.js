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

export default function RoyalFruitCrownPanel({ visible, onClose }) {
  const [stake, setStake] = useState(100);
  const [roundBet, setRoundBet] = useState(0);
  const [timer, setTimer] = useState(37);
  const [phase, setPhase] = useState('betting');
  const [paused, setPaused] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [recent, setRecent] = useState([]);
  const [todayWins] = useState(0);
  const [totalCoins] = useState(10000);
  const [selectedFruit, setSelectedFruit] = useState(null);

  useEffect(() => {
    if (!visible || paused) return;
    const tick = setInterval(() => {
      setTimer(current => {
        if (current > 1) return current - 1;
        if (phase === 'betting') { setPhase('result'); return 10; }
        if (phase === 'result') { setPhase('winner'); return 5; }
        setPhase('betting');
        setRoundBet(0);
        setSelectedFruit(null);
        return 37;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [visible, paused, phase]);

  const placeBet = (fruit) => {
    if (phase !== 'betting') return;
    setSelectedFruit(fruit.name);
    setRoundBet(value => value + stake);
  };

  const money = value => Number(value).toLocaleString('en-IN');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#160B08" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#160B08' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 22 }}>
          <View style={{ flexDirection: 'row', gap: 9, marginBottom: 18 }}>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.3, borderColor: GOLD_LINE, borderRadius: 17, backgroundColor: '#2A1713', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text style={{ color: GOLD, fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.4 }}>TODAY'S TOTAL</Text>
              <Text style={{ color: GOLD, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>WINNINGS</Text>
              <Text style={{ color: '#FFE8A4', fontSize: 20, fontWeight: '900', marginTop: 4 }}>{money(todayWins)} coins</Text>
            </View>
            <View style={{ flex: 1, minHeight: 82, borderWidth: 1.3, borderColor: GOLD_LINE, borderRadius: 17, backgroundColor: '#2A1713', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text style={{ color: GOLD, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>YOUR TOTAL COINS</Text>
              <Text style={{ color: '#FFE8A4', fontSize: 24, fontWeight: '900', marginTop: 6 }}>{money(totalCoins)}</Text>
            </View>
          </View>

          <View style={{ position: 'absolute', zIndex: 3, top: 2, left: 22, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => setPaused(value => !value)} style={{ backgroundColor: '#383333', borderRadius: 22, paddingHorizontal: 13, paddingVertical: 7, borderWidth: 1, borderColor: '#75675D' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{paused ? '▶ Resume' : 'Ⅱ Pause'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', zIndex: 3, top: 2, right: 22 }}>
            <TouchableOpacity onPress={() => setAudioOn(value => !value)} style={{ backgroundColor: '#383333', borderRadius: 22, paddingHorizontal: 13, paddingVertical: 7, borderWidth: 1, borderColor: '#75675D' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{audioOn ? '♫ Audio' : '🔇 Audio'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 18 }}>
            <Text style={{ fontSize: 55, lineHeight: 67 }}>👑</Text>
            <Text style={{ color: '#FFE1A0', fontSize: 35, lineHeight: 39, fontWeight: '900', textAlign: 'center', letterSpacing: 1.1, textShadowColor: '#8E4B20', textShadowRadius: 5, textShadowOffset: { width: 0, height: 3 } }}>ROYAL FRUIT</Text>
            <Text style={{ color: '#FFE1A0', fontSize: 35, lineHeight: 39, fontWeight: '900', textAlign: 'center', letterSpacing: 1.1, textShadowColor: '#8E4B20', textShadowRadius: 5, textShadowOffset: { width: 0, height: 3 } }}>CROWN</Text>
            <Text style={{ color: '#DDBB80', fontSize: 13, letterSpacing: 2.2, marginTop: 10, textAlign: 'center' }}>CHOOSE YOUR FRUIT · CLAIM THE CROWN</Text>
            <Text style={{ color: '#D8B77C', fontSize: 13, fontWeight: '900', letterSpacing: 1.4, marginTop: 13 }}>DAILY ROUND · 0</Text>
          </View>

          <View style={{ borderWidth: 2, borderColor: GOLD_LINE, borderRadius: 22, padding: 9, backgroundColor: '#28150F' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {FRUITS.slice(0,4).map((fruit, index) => (
                <TouchableOpacity key={fruit.name} activeOpacity={0.82} onPress={() => placeBet(fruit)} style={{ width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17, borderWidth: selectedFruit === fruit.name ? 2 : 1.2, borderColor: selectedFruit === fruit.name ? '#FFE7A1' : GOLD_LINE, backgroundColor: selectedFruit === fruit.name ? '#68401F' : '#48251B', alignItems: 'center', justifyContent: 'center', opacity: phase === 'betting' ? 1 : 0.65 }}>
                  <Text style={{ fontSize: 45 }}>{fruit.emoji}</Text>
                  <Text style={{ color: '#FFE19A', fontSize: 17, fontWeight: '900', marginTop: 1 }}>{fruit.multiplier}×</Text>
                </TouchableOpacity>
              ))}
              <View style={{ width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17, borderWidth: 1.2, borderColor: GOLD_LINE, backgroundColor: '#321B14', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36 }}>👑</Text>
                <Text style={{ color: '#FFE39B', fontSize: 32, fontWeight: '900', lineHeight: 36 }}>{timer}s</Text>
                <Text style={{ color: '#EACB87', fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 0.6 }}>{phase === 'betting' ? 'BETTING CLOSES IN' : phase === 'result' ? 'REVEALING RESULT' : 'WINNERS'}</Text>
              </View>
              {FRUITS.slice(4).map(fruit => (
                <TouchableOpacity key={fruit.name} activeOpacity={0.82} onPress={() => placeBet(fruit)} style={{ width: '31.8%', height: 101, marginBottom: 8, borderRadius: 17, borderWidth: selectedFruit === fruit.name ? 2 : 1.2, borderColor: selectedFruit === fruit.name ? '#FFE7A1' : GOLD_LINE, backgroundColor: selectedFruit === fruit.name ? '#68401F' : '#48251B', alignItems: 'center', justifyContent: 'center', opacity: phase === 'betting' ? 1 : 0.65 }}>
                  <Text style={{ fontSize: 45 }}>{fruit.emoji}</Text>
                  <Text style={{ color: '#FFE19A', fontSize: 17, fontWeight: '900', marginTop: 1 }}>{fruit.multiplier}×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.2, borderColor: GOLD_LINE, borderRadius: 18, backgroundColor: '#28150F', padding: 10 }}>
            <Text style={{ color: '#DDBB80', fontSize: 13, letterSpacing: 1.6, textAlign: 'center', marginBottom: 9 }}>SELECT COIN AMOUNT · TAP FRUIT TO BET</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STAKES.map(amount => (
                <TouchableOpacity key={amount} onPress={() => setStake(amount)} style={{ flex: 1, height: 42, borderRadius: 11, borderWidth: 1.1, borderColor: GOLD_LINE, backgroundColor: stake === amount ? '#EAC77D' : '#48251B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: stake === amount ? '#35190D' : '#FFE3A3', fontSize: 16, fontWeight: '900' }}>{money(amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: '#FFE3A3', fontSize: 14 }}>ROUND BET: {money(roundBet)}</Text>
              <Text style={{ color: '#FFE3A3', fontSize: 14 }}>PER TAP: {money(stake)}</Text>
            </View>
          </View>

          <View style={{ marginTop: 11, borderWidth: 1.2, borderColor: GOLD_LINE, borderRadius: 18, backgroundColor: '#28150F', padding: 10, minHeight: 72 }}>
            <Text style={{ color: '#DDBB80', fontSize: 13, fontWeight: '900', letterSpacing: 0.7 }}>RECENT WINNING FRUITS</Text>
            <Text style={{ color: '#A88A68', fontSize: 14, marginTop: 12 }}>{recent.length ? recent.join('   ·   ') : 'Results will appear here'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'center', marginTop: 14, paddingHorizontal: 24, paddingVertical: 8 }}>
            <Text style={{ color: '#C9A36C', fontSize: 13, fontWeight: '800' }}>CLOSE GAME</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
