import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, useWindowDimensions
} from 'react-native';

// Fresh Royal Fruit Crown screen. This file does not import or reuse the retired panel.
const FRUITS = [
  { id: 'cherry', name: 'Cherry', symbol: '🍒', multiplier: 5 },
  { id: 'lemon', name: 'Lemon', symbol: '🍋', multiplier: 5 },
  { id: 'orange', name: 'Orange', symbol: '🍊', multiplier: 5 },
  { id: 'peach', name: 'Peach', symbol: '🍑', multiplier: 40 },
  { id: 'watermelon', name: 'Watermelon', symbol: '🍉', multiplier: 5 },
  { id: 'plum', name: 'Plum', symbol: '🟣', multiplier: 25 },
  { id: 'grapes', name: 'Grapes', symbol: '🍇', multiplier: 15 },
  { id: 'apple', name: 'Apple', symbol: '🍎', multiplier: 10 }
];
const BET_AMOUNTS = [10, 100, 1000, 10000, 100000];
const BOARD = ['cherry', 'lemon', 'orange', 'peach', null, 'watermelon', 'plum', 'grapes', 'apple'];
// Clockwise path around the 3×3 board, starting at the top-left tile.
const CLOCKWISE_FRUITS = ['cherry', 'lemon', 'orange', 'watermelon', 'apple', 'grapes', 'plum', 'peach'];
const DESIGN_REFERENCES = {
  mainPanel: 'https://i.ibb.co/bg6sD1gN/1-20261126-203806-0000.png',
  fruits: 'https://i.ibb.co/wNbR7hQk/3-20261126-203806-0002.png',
  winningPopup: 'https://i.ibb.co/KzhWt54v/2-20261126-203806-0001.png'
};
const GOLD = '#F6D987';
const money = value => Number(value || 0).toLocaleString('en-IN');
const fruitFor = id => FRUITS.find(item => item.id === id);

export default function RoyalFruitCrownPanel({ visible, onClose, api }) {
  const { width } = useWindowDimensions();
  const [game, setGame] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState('cherry');
  const [betAmount, setBetAmount] = useState(100);
  const [seconds, setSeconds] = useState(37);
  const [lightIndex, setLightIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const betRequestCounter = useRef(0);
  const [error, setError] = useState('');
  const [founderOpen, setFounderOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerToken, setOwnerToken] = useState('');
  const refreshLock = useRef(false);
  const phase = game?.round?.phase || 'betting';
  const round = game?.round;
  const winner = fruitFor(round?.winning_fruit);
  const history = Array.isArray(game?.history) ? game.history : [];
  const bets = Array.isArray(game?.my_bets) ? game.my_bets : [];
  const totalsByFruit = useMemo(() => bets.reduce((all, bet) => {
    all[bet.fruit] = (all[bet.fruit] || 0) + Number(bet.amount || 0);
    return all;
  }, {}), [bets]);
  const totalBet = bets.reduce((sum, bet) => sum + Number(bet.amount || 0), 0);
  const winningTotal = winner ? bets.filter(bet => bet.fruit === winner.id)
    .reduce((sum, bet) => sum + Number(bet.amount || 0) * winner.multiplier, 0) : 0;
  const selected = fruitFor(selectedFruit) || FRUITS[0];

  const refresh = useCallback(async () => {
    if (!api || refreshLock.current) return;
    refreshLock.current = true;
    try {
      const state = await api('/api/greedy/royal-fruit-crown');
      setGame(state || {});
      setError('');
    } catch (err) {
      setError(err?.message || 'Could not connect to Royal Fruit Crown.');
    } finally {
      refreshLock.current = false;
    }
  }, [api]);

  useEffect(() => {
    if (!visible) return undefined;
    setLoading(true);
    refresh().finally(() => setLoading(false));
    const poll = setInterval(refresh, 1000);
    return () => clearInterval(poll);
  }, [visible, refresh]);

  useEffect(() => {
    if (!round) return undefined;
    const endAt = phase === 'betting' ? round.bet_closes_at
      : phase === 'drawing' ? round.animation_ends_at : round.result_ends_at;
    if (!endAt) return undefined;
    const update = () => setSeconds(Math.max(0, Math.ceil((new Date(endAt).getTime() - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 200);
    return () => clearInterval(timer);
  }, [round?.id, round?.phase, round?.bet_closes_at, round?.animation_ends_at, round?.result_ends_at]);

  // A continuous golden light travels clockwise across every fruit tile.
  // It speeds up during the 10-second draw, but never determines the result.
  useEffect(() => {
    if (!visible) return undefined;
    setLightIndex(0);
    const speed = phase === 'drawing' ? 220 : 420;
    const spin = setInterval(() => setLightIndex(index => (index + 1) % CLOCKWISE_FRUITS.length), speed);
    return () => clearInterval(spin);
  }, [visible, phase, round?.id]);

  const placeBet = async (fruitId, amount) => {
    if (phase !== 'betting') return;
    const requestKey = `${Date.now().toString(36)}-${(++betRequestCounter.current).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    setSelectedFruit(fruitId);
    setError('');
    try {
      await api('/api/greedy/royal-fruit-crown/bets', {
        method: 'POST',
        body: JSON.stringify({ fruit: fruitId, amount, request_key: requestKey })
      });
      await refresh();
    } catch (err) {
      setError(err?.message || 'Your bet could not be placed.');
    }
  };

  const founderLogin = async () => {
    setPending(true);
    setError('');
    try {
      const response = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: ownerEmail, password: ownerPassword })
      });
      setOwnerToken(response.token);
      setOwnerPassword('');
    } catch (err) {
      setError(err?.message || 'Founder sign-in failed.');
    } finally {
      setPending(false);
    }
  };

  const chooseFounderWinner = async fruitId => {
    setPending(true);
    setError('');
    try {
      await api('/api/greedy/royal-fruit-crown/founder-result', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + ownerToken },
        body: JSON.stringify({ fruit: fruitId })
      });
      setFounderOpen(false);
      await refresh();
    } catch (err) {
      setError(err?.message || 'Could not set the Founder result.');
    } finally {
      setPending(false);
    }
  };

  const close = () => {
    setFounderOpen(false);
    setHelpOpen(false);
    onClose?.();
  };

  const renderHistory = () => (
    <View style={styles.historyBox}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>RECENT WINNING FRUITS</Text>
        <Text style={styles.miniLabel}>LATEST FIRST</Text>
      </View>
      <View style={styles.historyRow}>
        {history.slice(0, 8).map((item, index) => {
          const fruit = fruitFor(item.fruit);
          return (
            <View key={String(index) + String(item.fruit)} style={styles.historyFruit}>
              <Text style={styles.historyEmoji}>{fruit?.symbol || '•'}</Text>
            </View>
          );
        })}
        {!history.length && <Text style={styles.emptyHistory}>Results will appear here after the first round.</Text>}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Text style={styles.crown}>♛</Text>
        <View>
          <Text style={styles.brandName}>TALKZY</Text>
          <Text style={styles.brandTag}>TALK · CONNECT · BELONG</Text>
        </View>
      </View>
      <View style={styles.balance}>
        <Text style={styles.miniLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceValue}>{money(game?.balance)} <Text style={styles.coin}>◉</Text></Text>
      </View>
      <View style={styles.roundBox}>
        <Text style={styles.miniLabel}>ROUND</Text>
        <Text style={styles.roundValue}>#{String(round?.number || '—').padStart(3, '0')}</Text>
      </View>
      <TouchableOpacity onPress={() => setHelpOpen(true)} style={styles.headerAction}>
        <Text style={styles.headerActionText}>?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={close} style={styles.headerAction}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBoard = () => (
    <View style={styles.boardFrame}>
      <View style={styles.board}>
        {BOARD.map((id, index) => {
          if (!id) {
            return (
              <View key="timer" style={styles.timerCell}>
                <Text style={styles.timerCrown}>♛</Text>
                <Text style={styles.timerNumber}>{phase === 'drawing' ? '✦' : phase === 'result' ? '✓' : seconds}</Text>
                <Text style={styles.timerCaption}>{phase === 'betting' ? 'SECONDS LEFT' : phase === 'drawing' ? 'DRAWING' : 'RESULT'}</Text>
              </View>
            );
          }
          const fruit = fruitFor(id);
          const lit = CLOCKWISE_FRUITS[lightIndex] === id;
          return (
            <TouchableOpacity
              key={id}
              disabled={phase !== 'betting'}
              onPress={() => placeBet(id, betAmount)}
              style={[
                styles.fruitTile,
                selectedFruit === id && phase === 'betting' && styles.selectedTile,
                lit && styles.litTile
              ]}
            >
              <Text style={styles.fruitEmoji}>{fruit.symbol}</Text>
              <Text style={styles.fruitName}>{fruit.name.toUpperCase()}</Text>
              <Text style={styles.multiplier}>{fruit.multiplier}×</Text>
              <Text style={styles.betOnFruit}>{money(totalsByFruit[id] || 0)} BET</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderFounderPanel = () => !founderOpen ? (
    <TouchableOpacity onPress={() => setFounderOpen(true)} style={styles.founderToggle}>
      <Text style={styles.founderToggleText}>FOUNDER RESULT CONTROL</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.founderPanel}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>FOUNDER RESULT CONTROL</Text>
        <TouchableOpacity onPress={() => setFounderOpen(false)}><Text style={styles.closeText}>×</Text></TouchableOpacity>
      </View>
      {ownerToken ? (
        <>
          <Text style={styles.helperText}>Choose the winning fruit before betting closes.</Text>
          <View style={styles.founderChoices}>
            {FRUITS.map(fruit => (
              <TouchableOpacity key={fruit.id} disabled={pending || phase !== 'betting'} onPress={() => chooseFounderWinner(fruit.id)} style={styles.founderChoice}>
                <Text style={styles.founderEmoji}>{fruit.symbol}</Text>
                <Text style={styles.founderChoiceText}>{fruit.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setOwnerToken('')}><Text style={styles.signOut}>SIGN OUT</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput value={ownerEmail} onChangeText={setOwnerEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Founder email" placeholderTextColor="#9D8B66" style={styles.founderInput}/>
          <TextInput value={ownerPassword} onChangeText={setOwnerPassword} secureTextEntry placeholder="Founder password" placeholderTextColor="#9D8B66" style={styles.founderInput}/>
          <TouchableOpacity disabled={pending} onPress={founderLogin} style={styles.loginButton}><Text style={styles.loginText}>{pending ? 'PLEASE WAIT' : 'FOUNDER SIGN IN'}</Text></TouchableOpacity>
        </>
      )}
    </View>
  );

  const resultVisible = phase === 'result' && !!winner;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.frame, { width: Math.min(width, 560) }]}>
          {renderHeader()}
          {loading && !game ? (
            <View style={styles.loading}><ActivityIndicator color={GOLD} size="large"/><Text style={styles.helperText}>Loading Royal Fruit Crown…</Text></View>
          ) : resultVisible ? (
            <ImageBackground source={{ uri: DESIGN_REFERENCES.winningPopup }} resizeMode="stretch" style={styles.referenceBackground} imageStyle={styles.referenceImage}>
            <ScrollView contentContainerStyle={styles.resultContent}>
              <Text style={styles.resultEyebrow}>THE CROWN HAS CHOSEN</Text>
              <Text style={styles.title}>ROYAL FRUIT CROWN</Text>
              <Text style={styles.resultRound}>ROUND #{String(round?.number || '—').padStart(3, '0')} · OFFICIAL RESULT</Text>
              <View style={styles.winnerOrb}><Text style={styles.winnerEmoji}>{winner.symbol}</Text></View>
              <Text style={styles.winnerLabel}>WINNING FRUIT</Text>
              <Text style={styles.winnerName}>{winner.name.toUpperCase()}</Text>
              <Text style={styles.winnerMultiplier}>{winner.multiplier}× PAYOUT</Text>
              <View style={styles.personalWin}>
                <Text style={styles.miniLabel}>YOUR WINNINGS THIS ROUND</Text>
                <Text style={styles.personalAmount}>+{money(winningTotal)} <Text style={styles.coin}>◉</Text></Text>
                <Text style={styles.helperText}>{winningTotal ? 'Winning payout has been credited to your main balance.' : 'No winning bets in this round.'}</Text>
              </View>
              <Text style={styles.sectionTitle}>TOP 3 WINNERS</Text>
              <View style={styles.leaderRow}>
                {[1, 0, 2].map((rank, position) => {
                  const leader = (game?.leaders || [])[rank];
                  return (
                    <View key={rank} style={[styles.leaderCard, position === 1 && styles.firstLeader]}>
                      <Text style={styles.rank}>#{rank + 1}</Text>
                      {leader?.avatar_url ? <Image source={{ uri: leader.avatar_url }} style={styles.avatar}/> : <View style={styles.avatar}><Text style={styles.avatarFallback}>♙</Text></View>}
                      <Text numberOfLines={1} style={styles.leaderName}>{leader?.display_name || '—'}</Text>
                      <Text style={styles.leaderCoins}>{leader ? '+' + money(leader.coins) : '—'} ◉</Text>
                    </View>
                  );
                })}
              </View>
              {!game?.leaders?.length && <Text style={styles.helperText}>No winning bets this round.</Text>}
              <Text style={styles.nextRound}>NEXT ROUND STARTS IN {seconds}s</Text>
              {renderHistory()}
            </ScrollView>
            </ImageBackground>
          ) : (
            <ImageBackground source={{ uri: DESIGN_REFERENCES.mainPanel }} resizeMode="stretch" style={styles.referenceBackground} imageStyle={styles.referenceImage}>
            <ScrollView contentContainerStyle={styles.mainContent}>
              <Text style={styles.title}>ROYAL FRUIT CROWN</Text>
              <Text style={styles.subtitle}>CHOOSE YOUR FRUIT · CLAIM THE CROWN</Text>
              <View style={styles.phaseBar}>
                <View style={[styles.phaseDot, phase !== 'betting' && styles.phaseDotMuted]}/>
                <Text style={styles.phaseText}>{phase === 'betting' ? 'BETTING IS OPEN' : phase === 'drawing' ? 'THE ROYAL DRAW' : 'ROUND COMPLETE'}</Text>
                <Text style={styles.phaseTimer}>{phase === 'betting' ? seconds + 's' : phase === 'drawing' ? '✦ DRAWING' : seconds + 's'}</Text>
              </View>
              {renderBoard()}
              <View style={styles.betPanel}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>SELECT YOUR BET</Text>
                  <Text style={styles.selectedFruit}>SELECTED: {selected.name.toUpperCase()}</Text>
                </View>
                <View style={styles.betAmounts}>
                  {BET_AMOUNTS.map(amount => (
                    <TouchableOpacity key={amount} disabled={phase !== 'betting'} onPress={() => setBetAmount(amount)} style={[styles.betButton, betAmount === amount && styles.activeBetButton, phase !== 'betting' && styles.disabled]}>
                      <Text style={[styles.betButtonText, betAmount === amount && styles.activeBetText]}>{money(amount)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.betSummary}>
                  <View>
                    <Text style={styles.miniLabel}>TOTAL BET THIS ROUND</Text>
                    <Text style={styles.totalBet}>{money(totalBet)} <Text style={styles.coin}>◉</Text></Text>
                    <Text style={styles.miniLabel}>ON {selected.name.toUpperCase()}: {money(totalsByFruit[selectedFruit] || 0)} COINS</Text>
                  </View>
                  <Text style={styles.betHint}>{phase === 'betting' ? 'TAP A FRUIT TO PLACE BET' : 'BETTING CLOSED'}</Text>
                </View>
              </View>
              {!!error && <Text style={styles.error}>{error}</Text>}
              {renderHistory()}
              {renderFounderPanel()}
              <Text style={styles.footerNote}>Every accepted bet is deducted immediately. Payouts are calculated by the game server.</Text>
            </ScrollView>
            </ImageBackground>
          )}
          {!!error && resultVisible && <Text style={styles.error}>{error}</Text>}
        </View>
        <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={() => setHelpOpen(false)}>
          <View style={styles.helpBackdrop}>
            <View style={styles.helpCard}>
              <Text style={styles.title}>HOW TO PLAY</Text>
              <Text style={styles.helperText}>Choose a coin amount first, then tap any fruit tile to place that amount. Every fruit tap creates a separate bet. You may change the amount at any time, repeat taps on the same fruit, and bet on all eight fruits during the 37-second betting window. Each fruit tile shows your running total for this round; those totals clear when the round ends.</Text>
              <Text style={styles.helperText}>The draw animation lasts 10 seconds. The result and top winners appear for 5 seconds. Winning payouts are credited to your main balance.</Text>
              <TouchableOpacity onPress={() => setHelpOpen(false)} style={styles.loginButton}><Text style={styles.loginText}>GOT IT</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', alignItems: 'center', justifyContent: 'center', padding: 5 },
  frame: { flex: 1, maxHeight: '100%', backgroundColor: '#080B0B', borderWidth: 2, borderColor: '#D2AD60', borderRadius: 18, overflow: 'hidden', shadowColor: '#E7BD68', shadowOpacity: 0.28, shadowRadius: 22, elevation: 18 },
  header: { minHeight: 68, paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#101612', borderBottomWidth: 1.5, borderBottomColor: '#A98545', gap: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 }, crown: { fontSize: 31, color: GOLD, textShadowColor: '#B77D26', textShadowRadius: 9 }, brandName: { color: '#FFE9A9', fontWeight: '900', fontSize: 16, letterSpacing: 1.8 }, brandTag: { color: '#BDA875', fontSize: 7, letterSpacing: 0.7, marginTop: 2 },
  balance: { paddingHorizontal: 9, paddingVertical: 7, backgroundColor: '#211D12', borderWidth: 1, borderColor: '#A98545', borderRadius: 8 }, miniLabel: { color: '#C7AE79', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 }, balanceValue: { color: '#FFE9A9', fontWeight: '900', fontSize: 13 }, coin: { color: GOLD },
  roundBox: { alignItems: 'center', paddingHorizontal: 3 }, roundValue: { color: GOLD, fontSize: 15, fontWeight: '900' }, headerAction: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A98545', borderRadius: 17, backgroundColor: '#211D12' }, headerActionText: { color: GOLD, fontWeight: '900', fontSize: 18 }, closeText: { color: GOLD, fontSize: 25, lineHeight: 27 },
  referenceBackground: { flex: 1, width: '100%' }, referenceImage: { opacity: 0.10 },
  mainContent: { paddingHorizontal: 12, paddingBottom: 20 }, resultContent: { paddingHorizontal: 14, paddingBottom: 20, alignItems: 'center' },
  title: { color: '#F9E1A0', fontSize: 25, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.2, textAlign: 'center', marginTop: 13, textShadowColor: '#946A2A', textShadowRadius: 10 },
  subtitle: { color: '#D7C18D', fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 1.1, marginTop: 4, marginBottom: 12 },
  phaseBar: { minHeight: 46, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#171D16', borderWidth: 1.2, borderColor: '#A9894B', borderRadius: 10, marginBottom: 10 },
  phaseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#A5D56F', marginRight: 9 }, phaseDotMuted: { backgroundColor: '#D0A44D' }, phaseText: { color: '#F1E4C2', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, flex: 1 }, phaseTimer: { color: '#FFE69C', fontSize: 17, fontWeight: '900' },
  boardFrame: { padding: 7, backgroundColor: '#171610', borderWidth: 1.8, borderColor: '#C5A15B', borderRadius: 13, shadowColor: '#C49B4E', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }, board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  fruitTile: { width: '31.8%', height: 116, alignItems: 'center', justifyContent: 'center', backgroundColor: '#20251D', borderWidth: 1.2, borderColor: '#927746', borderRadius: 11, paddingVertical: 5, shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  selectedTile: { backgroundColor: '#49351A', borderWidth: 2, borderColor: '#FFE7A2', shadowColor: GOLD, shadowOpacity: 0.75, shadowRadius: 10, elevation: 8 },
  litTile: { backgroundColor: '#66501F', borderColor: '#FFF1B9', borderWidth: 2.5, shadowColor: '#FFE69A', shadowOpacity: 1, shadowRadius: 18, elevation: 13, transform: [{ scale: 1.025 }] },
  fruitEmoji: { fontSize: 45, marginBottom: 2 }, fruitName: { color: '#F3E6C7', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }, multiplier: { marginTop: 4, color: '#FFE49A', backgroundColor: '#59421D', borderWidth: 1, borderColor: '#D5B36B', borderRadius: 12, overflow: 'hidden', paddingHorizontal: 11, paddingVertical: 3, fontSize: 12, fontWeight: '900' }, betOnFruit: { color: '#FFE7A2', fontSize: 8, fontWeight: '900', marginTop: 3 },
  timerCell: { width: '31.8%', height: 116, alignItems: 'center', justifyContent: 'center', backgroundColor: '#292014', borderWidth: 1.8, borderColor: '#E1BD70', borderRadius: 11, shadowColor: '#E1BD70', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }, timerCrown: { color: GOLD, fontSize: 27 }, timerNumber: { color: '#FFF0B0', fontSize: 31, lineHeight: 35, fontWeight: '900' }, timerCaption: { color: '#E2CF9E', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  betPanel: { marginTop: 11, padding: 11, backgroundColor: '#121A16', borderWidth: 1.2, borderColor: '#A9894B', borderRadius: 11 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }, sectionTitle: { color: '#F0D99B', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, selectedFruit: { color: '#D5B878', fontSize: 9, fontWeight: '900' },
  betAmounts: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, marginTop: 10, marginBottom: 10 }, betButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17252A', borderWidth: 1, borderColor: '#9B8A61', borderRadius: 8, paddingHorizontal: 2 }, activeBetButton: { backgroundColor: '#D4A94E', borderColor: '#FFF0B0', borderWidth: 2, shadowColor: GOLD, shadowOpacity: 0.35, shadowRadius: 7, elevation: 4 }, disabled: { opacity: 0.45 }, betButtonText: { color: '#E9DFC5', fontSize: 10, fontWeight: '900' }, activeBetText: { color: '#211707' },
  betSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, totalBet: { color: '#FBE3A0', fontSize: 18, fontWeight: '900', marginVertical: 3 }, betHint: { flex: 1, minHeight: 44, paddingHorizontal: 8, backgroundColor: '#493719', borderWidth: 1, borderColor: '#D7B45D', borderRadius: 8, color: '#FFE49A', textAlign: 'center', textAlignVertical: 'center', fontSize: 9, fontWeight: '900' },
  historyBox: { marginTop: 10, padding: 10, backgroundColor: '#111716', borderWidth: 1, borderColor: '#80683E', borderRadius: 10, width: '100%' }, historyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 8, minHeight: 38 }, historyFruit: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1D19', borderRadius: 19, borderWidth: 1, borderColor: '#80683E' }, historyEmoji: { fontSize: 21 }, emptyHistory: { color: '#B9A77B', fontSize: 10 },
  founderToggle: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 14 }, founderToggleText: { color: '#A58A55', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, founderPanel: { marginTop: 10, padding: 11, backgroundColor: '#17150F', borderWidth: 1, borderColor: '#C19A4E', borderRadius: 9 }, helperText: { color: '#D0C09B', fontSize: 10, textAlign: 'center', marginTop: 6, lineHeight: 16 }, founderInput: { height: 42, backgroundColor: '#0B1010', borderWidth: 1, borderColor: '#76623C', borderRadius: 7, color: '#FFF0C5', paddingHorizontal: 10, marginTop: 8, fontSize: 12 }, loginButton: { alignSelf: 'center', backgroundColor: '#D9B35D', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 7, marginTop: 9 }, loginText: { color: '#251908', fontSize: 10, fontWeight: '900' }, founderChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }, founderChoice: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#262116', padding: 8, borderRadius: 7, borderWidth: 1, borderColor: '#9B7A3D' }, founderEmoji: { fontSize: 20 }, founderChoiceText: { color: '#F7E6B2', fontSize: 10, fontWeight: '900' }, signOut: { color: '#D9C28B', fontSize: 10, textAlign: 'center', marginTop: 9 },
  error: { color: '#FF9C9C', fontSize: 11, padding: 8, textAlign: 'center' }, footerNote: { color: '#A69A7D', fontSize: 9, textAlign: 'center', marginTop: 10, lineHeight: 14 },
  resultEyebrow: { color: '#D4B76D', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 16 }, resultRound: { color: '#BBA77A', fontSize: 10, letterSpacing: 1, fontWeight: '800', marginTop: 6 }, winnerOrb: { width: 152, height: 152, borderRadius: 77, borderWidth: 2.5, borderColor: '#CBA65A', backgroundColor: '#1A1A13', alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowColor: GOLD, shadowOpacity: 0.55, shadowRadius: 22, elevation: 11 }, winnerEmoji: { fontSize: 84 }, winnerLabel: { color: '#BDA66E', fontSize: 10, letterSpacing: 2, fontWeight: '900', marginTop: 10 }, winnerName: { color: '#FFE5A0', fontSize: 27, fontWeight: '900', letterSpacing: 1.5, marginTop: 4 }, winnerMultiplier: { color: '#FFE5A0', fontSize: 12, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, backgroundColor: '#493719', borderWidth: 1, borderColor: '#D7B45D', marginTop: 8 },
  personalWin: { width: '100%', alignItems: 'center', backgroundColor: '#151913', borderWidth: 1, borderColor: '#B28B47', borderRadius: 9, paddingVertical: 11, paddingHorizontal: 9, marginTop: 14 }, personalAmount: { color: '#FFE078', fontSize: 26, fontWeight: '900', marginTop: 5 }, leaderRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, marginTop: 14 }, leaderCard: { flex: 1, minHeight: 124, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171A17', borderWidth: 1, borderColor: '#78633C', borderRadius: 9, paddingHorizontal: 4, paddingTop: 14, paddingBottom: 8 }, firstLeader: { minHeight: 140, borderColor: '#D9B75F', backgroundColor: '#292116' }, rank: { color: GOLD, fontSize: 12, fontWeight: '900', marginBottom: 5 }, avatar: { width: 43, height: 43, borderRadius: 23, backgroundColor: '#2B2C25', borderWidth: 1.5, borderColor: '#B89A5C', alignItems: 'center', justifyContent: 'center' }, avatarFallback: { color: '#D6BD7B', fontSize: 25 }, leaderName: { color: '#E9DDBD', fontSize: 9, fontWeight: '900', marginTop: 7, maxWidth: '100%' }, leaderCoins: { color: '#F5D77C', fontSize: 9, fontWeight: '900', marginTop: 5 }, nextRound: { color: '#F4D47E', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 14, marginBottom: 4 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, helpBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.84)', padding: 20 }, helpCard: { width: '100%', maxWidth: 390, padding: 20, backgroundColor: '#151913', borderWidth: 1, borderColor: '#B28B47', borderRadius: 12 }
});