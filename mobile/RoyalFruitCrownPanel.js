import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text,
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
  const [spotIndex, setSpotIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
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

  useEffect(() => {
    if (phase !== 'drawing') {
      setSpotIndex(0);
      return undefined;
    }
    const spin = setInterval(() => setSpotIndex(index => (index + 1) % 8), 145);
    return () => clearInterval(spin);
  }, [phase, round?.id]);

  const placeBet = async amount => {
    if (phase !== 'betting' || pending) return;
    setPending(true);
    setBetAmount(amount);
    setError('');
    try {
      await api('/api/greedy/royal-fruit-crown/bets', {
        method: 'POST',
        body: JSON.stringify({ fruit: selectedFruit, amount })
      });
      await refresh();
    } catch (err) {
      setError(err?.message || 'Your bet could not be placed.');
    } finally {
      setPending(false);
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
          const fruitIndex = FRUITS.findIndex(item => item.id === id);
          const lit = phase === 'drawing' && spotIndex === fruitIndex;
          const dim = phase === 'drawing' && !lit;
          return (
            <TouchableOpacity
              key={id}
              disabled={phase !== 'betting'}
              onPress={() => setSelectedFruit(id)}
              style={[
                styles.fruitTile,
                selectedFruit === id && phase === 'betting' && styles.selectedTile,
                lit && styles.litTile,
                dim && styles.dimTile
              ]}
            >
              <Text style={styles.fruitEmoji}>{fruit.symbol}</Text>
              <Text style={styles.fruitName}>{fruit.name.toUpperCase()}</Text>
              <Text style={styles.multiplier}>{fruit.multiplier}×</Text>
              {!!totalsByFruit[id] && <Text style={styles.betOnFruit}>{money(totalsByFruit[id])} BET</Text>}
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
          ) : (
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
                    <TouchableOpacity key={amount} disabled={phase !== 'betting' || pending} onPress={() => placeBet(amount)} style={[styles.betButton, betAmount === amount && styles.activeBetButton, (phase !== 'betting' || pending) && styles.disabled]}>
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
                  <Text style={styles.betHint}>{pending ? 'PROCESSING BET…' : phase === 'betting' ? 'TAP AN AMOUNT TO BET' : 'BETTING CLOSED'}</Text>
                </View>
              </View>
              {!!error && <Text style={styles.error}>{error}</Text>}
              {renderHistory()}
              {renderFounderPanel()}
              <Text style={styles.footerNote}>Every accepted bet is deducted immediately. Payouts are calculated by the game server.</Text>
            </ScrollView>
          )}
          {!!error && resultVisible && <Text style={styles.error}>{error}</Text>}
        </View>
        <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={() => setHelpOpen(false)}>
          <View style={styles.helpBackdrop}>
            <View style={styles.helpCard}>
              <Text style={styles.title}>HOW TO PLAY</Text>
              <Text style={styles.helperText}>Choose a fruit, then tap a coin amount to place a bet. You may bet on any or all eight fruits and place repeated bets during the 37-second betting window.</Text>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center', padding: 3 },
  frame: { flex: 1, maxHeight: '99%', backgroundColor: '#080C0D', borderWidth: 2, borderColor: '#A88442', overflow: 'hidden' },
  header: { minHeight: 58, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0D1211', borderBottomWidth: 1, borderBottomColor: '#8E713B', gap: 5 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 4 }, crown: { fontSize: 25, color: GOLD }, brandName: { color: '#FFE9A9', fontWeight: '900', fontSize: 13, letterSpacing: 1.5 }, brandTag: { color: '#BDA875', fontSize: 5, letterSpacing: 0.5 },
  balance: { paddingHorizontal: 6, paddingVertical: 5, backgroundColor: '#1B1A13', borderWidth: 1, borderColor: '#80663B', borderRadius: 4 }, miniLabel: { color: '#BDA875', fontSize: 6, fontWeight: '900', letterSpacing: 0.6 }, balanceValue: { color: '#FFE9A9', fontWeight: '900', fontSize: 11 }, coin: { color: GOLD },
  roundBox: { alignItems: 'center' }, roundValue: { color: GOLD, fontSize: 12, fontWeight: '900' }, headerAction: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#80663B', borderRadius: 14 }, headerActionText: { color: GOLD, fontWeight: '900', fontSize: 15 }, closeText: { color: GOLD, fontSize: 22, lineHeight: 24 },
  mainContent: { paddingHorizontal: 9, paddingBottom: 14 }, resultContent: { paddingHorizontal: 12, paddingBottom: 14, alignItems: 'center' },
  title: { color: '#F9E1A0', fontSize: 23, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.1, textAlign: 'center', marginTop: 10, textShadowColor: '#946A2A', textShadowRadius: 8 },
  subtitle: { color: '#C9B27C', fontSize: 8, fontWeight: '800', textAlign: 'center', letterSpacing: 1, marginTop: 3, marginBottom: 10 },
  phaseBar: { minHeight: 40, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#171A14', borderWidth: 1, borderColor: '#94743C', borderRadius: 5, marginBottom: 8 },
  phaseDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#A5D56F', marginRight: 7 }, phaseDotMuted: { backgroundColor: '#D0A44D' }, phaseText: { color: '#E8D9B1', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, flex: 1 }, phaseTimer: { color: '#FFE69C', fontSize: 13, fontWeight: '900' },
  boardFrame: { padding: 5, backgroundColor: '#171610', borderWidth: 1.5, borderColor: '#A9894B', borderRadius: 8 }, board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  fruitTile: { width: '31.9%', height: 103, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1D1A', borderWidth: 1, borderColor: '#887247', borderRadius: 7, paddingVertical: 3 },
  selectedTile: { backgroundColor: '#3C2C15', borderWidth: 2, borderColor: '#FFE7A2', shadowColor: GOLD, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
  litTile: { backgroundColor: '#5C461E', borderColor: '#FFF1B9', borderWidth: 2, shadowColor: '#FFE69A', shadowOpacity: 1, shadowRadius: 15, elevation: 12 }, dimTile: { opacity: 0.36 },
  fruitEmoji: { fontSize: 35, marginBottom: 1 }, fruitName: { color: '#EADDBD', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 }, multiplier: { marginTop: 3, color: '#FFE49A', backgroundColor: '#59421D', borderWidth: 1, borderColor: '#C9A65E', borderRadius: 10, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 2, fontSize: 10, fontWeight: '900' }, betOnFruit: { color: '#FFE7A2', fontSize: 7, fontWeight: '900', marginTop: 2 },
  timerCell: { width: '31.9%', height: 103, alignItems: 'center', justifyContent: 'center', backgroundColor: '#211B11', borderWidth: 1.5, borderColor: '#D1AC5D', borderRadius: 7 }, timerCrown: { color: GOLD, fontSize: 22 }, timerNumber: { color: '#FFF0B0', fontSize: 25, lineHeight: 28, fontWeight: '900' }, timerCaption: { color: '#D6C18D', fontSize: 6, fontWeight: '900', letterSpacing: 0.7 },
  betPanel: { marginTop: 9, padding: 8, backgroundColor: '#111716', borderWidth: 1, borderColor: '#8E7545', borderRadius: 6 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: '#F0D99B', fontSize: 9, fontWeight: '900', letterSpacing: 1 }, miniLabel: { color: '#BBAA7D', fontSize: 7, fontWeight: '900' }, selectedFruit: { color: '#C5A96A', fontSize: 7, fontWeight: '900' },
  betAmounts: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginTop: 8, marginBottom: 8 }, betButton: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17252A', borderWidth: 1, borderColor: '#9B8A61', borderRadius: 5, paddingHorizontal: 1 }, activeBetButton: { backgroundColor: '#C69A3C', borderColor: '#FFF0B0', borderWidth: 2 }, disabled: { opacity: 0.45 }, betButtonText: { color: '#E9DFC5', fontSize: 8, fontWeight: '900' }, activeBetText: { color: '#211707' },
  betSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, totalBet: { color: '#FBE3A0', fontSize: 15, fontWeight: '900', marginVertical: 2 }, betHint: { flex: 1, minHeight: 38, paddingHorizontal: 6, backgroundColor: '#493719', borderWidth: 1, borderColor: '#D7B45D', borderRadius: 5, color: '#FFE49A', textAlign: 'center', textAlignVertical: 'center', fontSize: 8, fontWeight: '900' },
  historyBox: { marginTop: 8, padding: 8, backgroundColor: '#111716', borderWidth: 1, borderColor: '#80683E', borderRadius: 5, width: '100%' }, historyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 7, minHeight: 34 }, historyFruit: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1D19', borderRadius: 18, borderWidth: 1, borderColor: '#655433' }, historyEmoji: { fontSize: 19 }, emptyHistory: { color: '#B9A77B', fontSize: 8 },
  miniLabel: { color: '#BBAA7D', fontSize: 7, fontWeight: '900' }, founderToggle: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 }, founderToggleText: { color: '#806F4B', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, founderPanel: { marginTop: 8, padding: 9, backgroundColor: '#17150F', borderWidth: 1, borderColor: '#C19A4E', borderRadius: 5 }, helperText: { color: '#C5B58E', fontSize: 8, textAlign: 'center', marginTop: 5 }, founderInput: { height: 36, backgroundColor: '#0B1010', borderWidth: 1, borderColor: '#76623C', borderRadius: 4, color: '#FFF0C5', paddingHorizontal: 8, marginTop: 7, fontSize: 10 }, loginButton: { alignSelf: 'center', backgroundColor: '#D9B35D', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 4, marginTop: 8 }, loginText: { color: '#251908', fontSize: 9, fontWeight: '900' }, founderChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }, founderChoice: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#262116', padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#9B7A3D' }, founderEmoji: { fontSize: 17 }, founderChoiceText: { color: '#F7E6B2', fontSize: 8, fontWeight: '900' }, signOut: { color: '#D9C28B', fontSize: 8, textAlign: 'center', marginTop: 8 },
  error: { color: '#FF9C9C', fontSize: 10, padding: 7, textAlign: 'center' }, footerNote: { color: '#82785F', fontSize: 7, textAlign: 'center', marginTop: 8 },
  resultEyebrow: { color: '#D4B76D', fontSize: 8, fontWeight: '900', letterSpacing: 2, marginTop: 12 }, resultRound: { color: '#BBA77A', fontSize: 8, letterSpacing: 1, fontWeight: '800', marginTop: 5 }, winnerOrb: { width: 138, height: 138, borderRadius: 70, borderWidth: 2, borderColor: '#CBA65A', backgroundColor: '#1A1A13', alignItems: 'center', justifyContent: 'center', marginTop: 14, shadowColor: GOLD, shadowOpacity: 0.45, shadowRadius: 18, elevation: 9 }, winnerEmoji: { fontSize: 76 }, winnerLabel: { color: '#BDA66E', fontSize: 8, letterSpacing: 2, fontWeight: '900', marginTop: 8 }, winnerName: { color: '#FFE5A0', fontSize: 23, fontWeight: '900', letterSpacing: 1.5, marginTop: 3 }, winnerMultiplier: { color: '#FFE5A0', fontSize: 10, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 15, backgroundColor: '#493719', borderWidth: 1, borderColor: '#D7B45D', marginTop: 6 },
  personalWin: { width: '100%', alignItems: 'center', backgroundColor: '#151913', borderWidth: 1, borderColor: '#B28B47', borderRadius: 6, paddingVertical: 9, paddingHorizontal: 8, marginTop: 12 }, personalAmount: { color: '#FFE078', fontSize: 22, fontWeight: '900', marginTop: 4 }, leaderRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5, marginTop: 12 }, leaderCard: { flex: 1, minHeight: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171A17', borderWidth: 1, borderColor: '#78633C', borderRadius: 6, paddingHorizontal: 3, paddingTop: 14, paddingBottom: 7 }, firstLeader: { minHeight: 127, borderColor: '#D9B75F', backgroundColor: '#292116' }, rank: { color: GOLD, fontSize: 10, fontWeight: '900', marginBottom: 4 }, avatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#2B2C25', borderWidth: 1.5, borderColor: '#B89A5C', alignItems: 'center', justifyContent: 'center' }, avatarFallback: { color: '#D6BD7B', fontSize: 23 }, leaderName: { color: '#E9DDBD', fontSize: 8, fontWeight: '900', marginTop: 6, maxWidth: '100%' }, leaderCoins: { color: '#F5D77C', fontSize: 8, fontWeight: '900', marginTop: 4 }, nextRound: { color: '#F4D47E', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 12, marginBottom: 3 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }, helpBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 }, helpCard: { width: '100%', maxWidth: 380, padding: 18, backgroundColor: '#151913', borderWidth: 1, borderColor: '#B28B47', borderRadius: 10 }
});
