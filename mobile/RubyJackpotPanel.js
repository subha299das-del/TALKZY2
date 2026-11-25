import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Animated, StyleSheet } from 'react-native';

const GOLD = '#F8D66F';
const COLS = 6;
const ROWS = 5;
const SYMBOLS = ['👑', '💎', '🔺', '🟢', '🟣', '🟡', '🍀', '7️⃣', '⚡'];
const PAY = { '👑': 12, '💎': 10, '🔺': 8, '🟢': 7, '🟣': 6, '🟡': 5, '🍀': 4, '7️⃣': 3, '⚡': 2 };
const BETS = [100, 250, 500, 1000, 2500, 5000, 10000];
const makeGrid = () => Array.from({ length: COLS * ROWS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

// Preview-only cluster evaluation. Server-authoritative game rules and coin settlement are not connected.
function winningClusters(grid) {
  const visited = new Set();
  const wins = [];
  for (let start = 0; start < grid.length; start += 1) {
    const symbol = grid[start];
    if (symbol === '⚡' || visited.has(start)) continue;
    const stack = [start];
    const group = [];
    visited.add(start);
    while (stack.length) {
      const at = stack.pop();
      group.push(at);
      const row = Math.floor(at / COLS);
      const col = at % COLS;
      const neighbors = [];
      if (row > 0) neighbors.push(at - COLS);
      if (row < ROWS - 1) neighbors.push(at + COLS);
      if (col > 0) neighbors.push(at - 1);
      if (col < COLS - 1) neighbors.push(at + 1);
      neighbors.forEach(next => {
        if (!visited.has(next) && grid[next] === symbol) {
          visited.add(next);
          stack.push(next);
        }
      });
    }
    if (group.length >= 5) wins.push({ symbol, cells: group, amount: group.length * PAY[symbol] });
  }
  return wins;
}

export default function RubyJackpotPanel({ visible, onClose }) {
  const [bet, setBet] = useState(1000);
  const [grid, setGrid] = useState(makeGrid);
  const [page, setPage] = useState('game');
  const [spinning, setSpinning] = useState(false);
  const [auto, setAuto] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [totalPreview, setTotalPreview] = useState(0);
  const [cascade, setCascade] = useState(0);
  const [winCells, setWinCells] = useState([]);
  const [status, setStatus] = useState('READY TO SPIN');
  const spinRef = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const runRef = useRef(false);

  useEffect(() => {
    if (!visible) return undefined;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [visible, glow]);

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const startSpin = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setSpinning(true);
    setLastWin(0);
    setCascade(0);
    setWinCells([]);
    setStatus('REELS SPINNING');
    const spinDuration = turbo ? 500 : 1150;
    const ticker = setInterval(() => setGrid(makeGrid()), turbo ? 65 : 95);
    await delay(spinDuration);
    clearInterval(ticker);
    let current = makeGrid();
    let roundWin = 0;
    setGrid(current);
    setStatus('CHECKING MATCHES');
    for (let step = 0; step < 4; step += 1) {
      const matches = winningClusters(current);
      if (!matches.length) break;
      const cells = matches.flatMap(match => match.cells);
      const payout = matches.reduce((sum, match) => sum + match.amount, 0) * bet;
      roundWin += payout;
      setWinCells(cells);
      setCascade(step + 1);
      setStatus(step === 0 ? 'MATCH WIN!' : 'TUMBLE WIN!');
      await delay(turbo ? 220 : 520);
      const removed = new Set(cells);
      current = current.map((symbol, index) => removed.has(index)
        ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : symbol);
      setGrid(current);
      setWinCells([]);
      await delay(turbo ? 100 : 220);
    }
    setLastWin(roundWin);
    setTotalPreview(value => value + roundWin);
    setStatus(roundWin > 0 ? 'ROUND COMPLETE • PREVIEW WIN' : 'NO MATCH • TRY AGAIN');
    setSpinning(false);
    runRef.current = false;
  };

  useEffect(() => {
    if (!visible || !auto || spinning || page !== 'game') return undefined;
    const timer = setTimeout(() => { startSpin(); }, 900);
    return () => clearTimeout(timer);
  }, [visible, auto, spinning, page, bet, turbo]);

  const changeBet = direction => {
    if (spinning) return;
    const index = BETS.indexOf(bet);
    setBet(BETS[Math.max(0, Math.min(BETS.length - 1, index + direction))]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.back}>
        <View style={s.shell}>
          <View style={s.top}>
            <Text style={s.balance}>🪙 GOLD BALANCE • PREVIEW</Text>
            <View style={s.icons}>
              {[[ '▤', 'records' ], [ '♛', 'ranking' ], [ '?', 'rules' ]].map(([label, target]) => (
                <TouchableOpacity key={target} onPress={() => { setAuto(false); setPage(target); }}>
                  <Text style={s.icon}>{label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={onClose}><Text style={s.close}>×</Text></TouchableOpacity>
            </View>
          </View>

          {page !== 'game' ? (
            <ScrollView style={s.info}>
              <View style={s.row}>
                <Text style={s.title}>{page === 'rules' ? 'GAME RULES' : page === 'ranking' ? 'RANKING' : 'RECORDS'}</Text>
                <TouchableOpacity onPress={() => setPage('game')}><Text style={s.icon}>BACK</Text></TouchableOpacity>
              </View>
              {page === 'rules' ? (
                <Text style={s.copy}>This interactive preview uses a 6-column × 5-row reel board. Matching adjacent groups of five or more symbols are highlighted, cleared and refilled to demonstrate a tumble sequence. ⚡ is a non-paying decorative symbol in this preview. Bet values and preview wins are demonstrations only; the official paytable, scatter features, free spins and multipliers must be configured and validated by the TALKZY Founder on the secure game server.</Text>
              ) : page === 'ranking' ? (
                <Text style={s.copy}>Player rankings will appear here when the server-side round and leaderboard service is connected. No preview result is submitted to a leaderboard.</Text>
              ) : (
                <Text style={s.copy}>Completed server-verified rounds will appear here. This device preview does not create official game records.</Text>
              )}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={s.content}>
              <View style={s.hero}>
                <Text style={{ fontSize: 34 }}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.heroTitle}>RUBY JACKPOT</Text>
                  <Text style={s.heroSub}>TUMBLE • MULTIPLY • WIN</Text>
                </View>
                <Text style={{ fontSize: 28 }}>💎</Text>
              </View>
              <View style={s.art}>
                <Text style={s.artTitle}>ROYAL JACKPOT • MEGA WIN</Text>
                <Text style={{ fontSize: 39 }}>🦁 ⚡ 👑 ⚡</Text>
                <Text style={s.artSub}>SIX REELS • CASCADING MATCHES</Text>
              </View>
              <View style={s.pay}>
                <Text style={s.label}>SYMBOL VALUE • PREVIEW MULTIPLIER</Text>
                <View style={s.payrow}>
                  {['👑', '💎', '🔺', '🟢', '🟣', '🟡'].map(symbol => (
                    <View key={symbol} style={s.payitem}>
                      <Text style={{ fontSize: 19 }}>{symbol}</Text>
                      <Text style={s.paytext}>{PAY[symbol]}×</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={s.machine}>
                <View style={s.machineHead}>
                  <Text style={s.label}>30 SYMBOLS • 6 × 5 REELS</Text>
                  <Text style={s.label}>TUMBLE {cascade}/4</Text>
                </View>
                <View style={s.grid}>
                  {grid.map((symbol, index) => (
                    <View key={index} style={[s.cell, (index % COLS === 0 || index % COLS === COLS - 1) && s.sideCell, winCells.includes(index) && s.winningCell]}>
                      <Text style={s.symbol}>{symbol}</Text>
                    </View>
                  ))}
                </View>
                <Animated.View style={[s.win, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [.82, 1] }) }]}>
                  <Text style={s.winText}>ROUND WIN • {lastWin.toLocaleString('en-IN')}</Text>
                </Animated.View>
                <Text style={s.status}>{status}</Text>
              </View>
              <View style={s.betPanel}>
                <Text style={s.label}>BET AMOUNT</Text>
                <View style={s.betControl}>
                  <TouchableOpacity disabled={spinning} onPress={() => changeBet(-1)} style={s.stepper}><Text style={s.stepText}>−</Text></TouchableOpacity>
                  <Text style={s.betValue}>🪙 {bet.toLocaleString('en-IN')}</Text>
                  <TouchableOpacity disabled={spinning} onPress={() => changeBet(1)} style={s.stepper}><Text style={s.stepText}>＋</Text></TouchableOpacity>
                </View>
                <View style={s.betrow}>
                  {BETS.map(value => (
                    <TouchableOpacity key={value} disabled={spinning} onPress={() => setBet(value)} style={[s.bet, { backgroundColor: bet === value ? '#D8AD49' : '#4B2B13' }]}>
                      <Text style={s.betText}>{value >= 1000 ? value / 1000 + 'K' : value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.options}>
                  <TouchableOpacity onPress={() => setTurbo(value => !value)} style={[s.option, turbo && s.optionActive]}><Text style={s.optionText}>⚡ TURBO {turbo ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setAuto(value => !value)} style={[s.option, auto && s.optionActive]}><Text style={s.optionText}>⟳ AUTO {auto ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={startSpin} disabled={spinning} style={[s.spin, spinning && s.spinDisabled]}>
                  <Text style={s.spinText}>{spinning ? 'SPINNING…' : 'SPIN'}</Text>
                </TouchableOpacity>
                <View style={s.totalRow}>
                  <Text style={s.note}>PREVIEW TOTAL</Text>
                  <Text style={s.total}>{totalPreview.toLocaleString('en-IN')}</Text>
                </View>
                <Text style={s.note}>DEMO ONLY • NO COINS DEDUCTED OR PAID OUT</Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(5,0,12,.92)', justifyContent: 'center', padding: 4 },
  shell: { maxHeight: '98%', backgroundColor: '#250B12', borderWidth: 2, borderColor: '#E9BC4D', borderRadius: 12, overflow: 'hidden' },
  top: { minHeight: 39, backgroundColor: '#19080D', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 9 },
  balance: { color: GOLD, fontSize: 9, fontWeight: '900' },
  icons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { color: GOLD, fontSize: 18, fontWeight: '900' },
  close: { color: GOLD, fontSize: 27 },
  content: { padding: 7, paddingBottom: 16 },
  hero: { minHeight: 55, backgroundColor: '#5B111A', borderWidth: 1, borderColor: GOLD, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 9 },
  heroTitle: { color: '#FFE6A0', fontSize: 19, fontWeight: '900', fontStyle: 'italic' },
  heroSub: { color: '#FFB8A4', fontSize: 8, fontWeight: '900' },
  art: { height: 105, marginTop: 5, backgroundColor: '#57120E', borderWidth: 2, borderColor: '#F6C85D', alignItems: 'center', justifyContent: 'center' },
  artTitle: { color: GOLD, fontSize: 12, fontWeight: '900' },
  artSub: { color: '#F6DCA0', fontSize: 8, fontWeight: '900' },
  pay: { marginTop: 5, padding: 6, backgroundColor: '#391018', borderWidth: 1, borderColor: '#A66D2E' },
  label: { color: GOLD, fontSize: 9, fontWeight: '900' },
  payrow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  payitem: { alignItems: 'center', backgroundColor: '#4B1820', padding: 5, borderRadius: 5 },
  paytext: { color: '#FFE7A0', fontSize: 9, fontWeight: '900' },
  machine: { marginTop: 6, padding: 6, backgroundColor: '#5A1B14', borderWidth: 2, borderColor: '#E7BD52' },
  machineHead: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#230D22', padding: 3 },
  cell: { width: '16.1%', height: 43, margin: '0.28%', backgroundColor: '#35163A', borderWidth: 1, borderColor: '#D9A94C', alignItems: 'center', justifyContent: 'center' },
  sideCell: { backgroundColor: '#481C27' },
  winningCell: { backgroundColor: '#B77B20', borderColor: '#FFF4B0', borderWidth: 2 },
  symbol: { fontSize: 22 },
  win: { marginTop: 5, backgroundColor: '#25080C', padding: 6, alignItems: 'center', borderWidth: 1, borderColor: GOLD },
  winText: { color: GOLD, fontSize: 14, fontWeight: '900' },
  status: { color: '#FFE6A0', textAlign: 'center', fontSize: 8, fontWeight: '900', marginTop: 5 },
  betPanel: { marginTop: 6, padding: 7, backgroundColor: '#351018', borderWidth: 1, borderColor: '#93602B' },
  betControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 6 },
  stepper: { width: 33, height: 30, borderRadius: 7, backgroundColor: '#4B1A24', borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: GOLD, fontSize: 20, fontWeight: '900' },
  betValue: { color: '#FFF0BB', fontSize: 15, fontWeight: '900', minWidth: 110, textAlign: 'center' },
  betrow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 7 },
  bet: { paddingHorizontal: 7, paddingVertical: 7, borderRadius: 5, borderWidth: 1, borderColor: GOLD },
  betText: { color: '#FFF1C0', fontSize: 9, fontWeight: '900' },
  options: { flexDirection: 'row', gap: 7, marginTop: 7 },
  option: { flex: 1, backgroundColor: '#4B1A24', padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#70402C' },
  optionActive: { backgroundColor: '#80551B', borderColor: '#FFE39A' },
  optionText: { color: '#FFE4A0', fontSize: 10, fontWeight: '900' },
  spin: { alignSelf: 'center', marginTop: 8, width: 88, height: 48, borderRadius: 24, backgroundColor: '#D4A83D', borderWidth: 3, borderColor: '#FFF0A1', alignItems: 'center', justifyContent: 'center' },
  spinDisabled: { opacity: .7 },
  spinText: { color: '#36140C', fontSize: 14, fontWeight: '900' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { color: GOLD, fontSize: 13, fontWeight: '900' },
  note: { color: '#D4A9A1', fontSize: 7, textAlign: 'center', marginTop: 6 },
  info: { margin: 12, padding: 13, backgroundColor: '#43141D', minHeight: 250 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: GOLD, fontWeight: '900', fontSize: 16 },
  copy: { color: '#FFF0D6', fontSize: 12, lineHeight: 20, marginTop: 20 }
});
