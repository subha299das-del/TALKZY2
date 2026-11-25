import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, StyleSheet } from 'react-native';

const GOLD = '#F5D27A';
const ANIMALS = [
  { id: 'lion', name: 'Lion', emoji: '🦁', multiplier: '×45', group: 'Meat' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', multiplier: '×5', group: 'Salad' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', multiplier: '×5', group: 'Salad' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', multiplier: '×25', group: 'Meat' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', multiplier: '×5', group: 'Salad' },
  { id: 'bear', name: 'Bear', emoji: '🐻', multiplier: '×15', group: 'Meat' },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', multiplier: '×10', group: 'Meat' },
  { id: 'horse', name: 'Horse', emoji: '🐴', multiplier: '×5', group: 'Salad' }
];
const BETS = [1000, 5000, 10000, 50000, 100000];
const POOLS = [{ value: '5M', icon: '🧰' }, { value: '25M', icon: '🎁' }, { value: '50M', icon: '💎' }, { value: '250M', icon: '👑' }, { value: '500M', icon: '🏆' }];

function WildKingdomMark({ size = 48 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ position: 'absolute', top: -size * 0.04, color: GOLD, fontSize: size * 0.34 }}>♛</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: size * 0.2 }}>
        <Text style={{ fontSize: size * 0.49, marginRight: -size * 0.08 }}>🦁</Text>
        <Text style={{ fontSize: size * 0.49 }}>🐯</Text>
      </View>
    </View>
  );
}

function AnimalOption({ animal, selected, bet, onPress, size }) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[styles.animal, { width: size, height: size }, selected && styles.animalSelected]}>
      <Text style={styles.animalEmoji}>{animal.emoji}</Text>
      <Text style={styles.multiplier}>{animal.multiplier}</Text>
      {selected && <View style={styles.selected}><Text style={styles.selectedText}>✓</Text></View>}
      {selected && <View style={styles.betTag}><Text style={styles.betTagText}>Bet {bet.toLocaleString('en-IN')}</Text></View>}
    </TouchableOpacity>
  );
}

export default function WildKingdomPanel({ visible, onClose }) {
  const [selected, setSelected] = useState([]);
  const [bet, setBet] = useState(1000);
  const [mode, setMode] = useState('Basic');
  const [page, setPage] = useState('game');
  const [soundOn, setSoundOn] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [group, setGroup] = useState('all');
  const { width } = Dimensions.get('window');
  const orb = Math.max(67, Math.min(82, (width - 54) / 3));
  const total = selected.length * bet;
  const animals = useMemo(() => ANIMALS, []);

  const toggle = (id) => setSelected(current => {
    if (current.includes(id)) return current.filter(x => x !== id);
    if (current.length >= 6) return current;
    return [...current, id];
  });

  const visibleAnimals = group === 'all' ? animals : animals.filter(a => a.group.toLowerCase() === group);
  const renderAnimal = (animal) => (
    <AnimalOption key={animal.id} animal={animal} selected={selected.includes(animal.id)} bet={bet}
      onPress={() => toggle(animal.id)} size={orb} />
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.topBar}>
            <View style={styles.wallet}><Text style={styles.coin}>🪙</Text><Text style={styles.walletValue}>—</Text><Text style={styles.plus}>＋</Text></View>
            <View style={styles.topActions}>
              <TouchableOpacity onPress={() => setPage('records')}><Text style={styles.topIcon}>◷</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSoundOn(v => !v)}><Text style={styles.topIcon}>{soundOn ? '◖))' : '◖×'}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPage('rules')}><Text style={styles.topIcon}>?</Text></TouchableOpacity>
              <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
            </View>
          </View>

          {page !== 'game' ? (
            <View style={styles.infoPanel}>
              <View style={styles.infoHeader}><Text style={styles.infoTitle}>{page === 'rules' ? 'RULE' : 'RECORDS'}</Text><TouchableOpacity onPress={() => setPage('game')}><Text style={styles.back}>BACK</Text></TouchableOpacity></View>
              <ScrollView>
                {page === 'rules' ? (
                  <View>
                    <Text style={styles.rule}>1. Choose a coin amount and select up to 6 animal options in each round.</Text>
                    <Text style={styles.rule}>2. Each round has a 30-second Bet Time, followed by the draw/show phase.</Text>
                    <Text style={styles.rule}>3. If you bet on the winning option, you receive the corresponding coins. The exact prize calculation is not fully shown in the source display.</Text>
                    <Text style={styles.rule}>4. If Salad wins, Rabbit, Monkey, Sheep and Horse are the winning animals. If Meat wins, Wolf, Bear, Tiger and Lion are the winning animals.</Text>
                    <Text style={styles.rule}>5. The Prize Pool grows as more players join. The source rules say the chances of Salad or Meat increase when the pool reaches certain scales; exact thresholds are not shown.</Text>
                    <Text style={styles.rule}>6. Advanced Mode is shown as available to VIP3+ users who have bet more than 25M coins in the past 7 days.</Text>
                    <Text style={styles.rule}>7. The source says the Treasure Chest offers a higher probability of winning more coins in Advanced Mode.</Text>
                  </View>
                ) : <Text style={styles.placeholder}>Round records will appear here when the game service is connected.</Text>}
              </ScrollView>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.gameBanner}>
                <View style={styles.bannerGlow} />
                <WildKingdomMark size={55} />
                <View style={styles.bannerText}><Text style={styles.gameName}>WILD KINGDOM</Text><Text style={styles.gameTag}>CHOOSE YOUR ANIMAL • WIN THE JACKPOT</Text></View>
                <Text style={styles.luckyBadge}>99+</Text>
              </View>

              <View style={styles.modeRow}>
                <TouchableOpacity style={[styles.modeButton, mode === 'Basic' && styles.modeActive]} onPress={() => setMode('Basic')}><Text style={[styles.modeText, mode === 'Basic' && styles.modeTextActive]}>Basic</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modeButton, mode === 'Advanced' && styles.modeActive]} onPress={() => { setMode('Advanced'); setAdvancedOpen(true); }}><Text style={[styles.modeText, mode === 'Advanced' && styles.modeTextActive]}>Advanced</Text></TouchableOpacity>
                <View style={styles.jackpot}><Text style={styles.jackpotTop}>JACKPOT</Text><Text style={styles.jackpotValue}>PRIZE POOL</Text></View>
              </View>

              <View style={styles.board}>
                {animals.slice(0, 3).map(renderAnimal)}
                {renderAnimal(animals[3])}
                <View style={[styles.centerOrb, { width: orb, height: orb }]}>
                  <WildKingdomMark size={Math.round(orb * 0.55)} />
                  <Text style={styles.timerLabel}>Bet Time</Text>
                  <Text style={styles.timerValue}>30s</Text>
                </View>
                {renderAnimal(animals[4])}
                {animals.slice(5, 8).map(renderAnimal)}
              </View>

              <View style={styles.groupRow}>
                <TouchableOpacity onPress={() => setGroup(group === 'salad' ? 'all' : 'salad')} style={[styles.groupPill, group === 'salad' && styles.groupActive]}><Text style={styles.groupText}>🥗 Salad</Text></TouchableOpacity>
                <Text style={styles.todayWin}>TODAY'S WIN  <Text style={styles.todayValue}>—</Text></Text>
                <TouchableOpacity onPress={() => setGroup(group === 'meat' ? 'all' : 'meat')} style={[styles.groupPill, group === 'meat' && styles.groupActive]}><Text style={styles.groupText}>🍖 Meat</Text></TouchableOpacity>
              </View>

              <View style={styles.betPanel}>
                <Text style={styles.betHint}>CHOOSE BET AMOUNT • SELECT UP TO 6 ANIMALS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.betOptions}>
                  {BETS.map(amount => <TouchableOpacity key={amount} onPress={() => setBet(amount)} style={[styles.betChip, bet === amount && styles.betChipActive]}><Text style={[styles.betChipText, bet === amount && styles.betChipTextActive]}>{amount >= 1000 ? (amount / 1000) + 'K' : amount}</Text></TouchableOpacity>)}
                </ScrollView>
                <View style={styles.betSummary}><Text style={styles.summaryText}>Selected: {selected.length}/6</Text><Text style={styles.summaryText}>Draft total: {total.toLocaleString('en-IN')} 🪙</Text></View>
                <View style={styles.placeBet}><Text style={styles.placeBetText}>BETTING PREVIEW</Text></View>
              </View>

              <View style={styles.poolPanel}>
                {POOLS.map((item, index) => <View key={index} style={styles.poolItem}><Text style={styles.poolEmoji}>{item.icon}</Text><Text style={styles.poolValue}>{item.value}</Text></View>)}
              </View>
              <View style={styles.historyPanel}><Text style={styles.historyLabel}>RESULT</Text><View style={styles.historyItems}>{['🦁','🐰','🐵','🐯','🐑','🐻','🐺','🐴'].map((emoji, i) => <View key={i} style={styles.historyAnimal}><Text style={styles.historyEmoji}>{emoji}</Text></View>)}</View></View>
              <Text style={styles.previewNote}>DISPLAY PREVIEW • ROUND, WALLET & PRIZE SERVICE NOT CONNECTED</Text>
            </ScrollView>
          )}

          <Modal visible={advancedOpen} transparent animationType="fade" onRequestClose={() => { setAdvancedOpen(false); setMode('Basic'); }}>
            <View style={styles.advancedBackdrop}>
              <View style={styles.advancedBox}>
                <Text style={styles.advancedTitle}>ADVANCED MODE</Text>
                <Text style={styles.advancedCopy}>VIP3+ users who have bet more than 25M coins in the past 7 days can unlock Advanced Mode.</Text>
                <Text style={styles.advancedCopy}>Higher probability of winning more coins when opening the Treasure Chest.</Text>
                <Text style={styles.advancedRemaining}>Unlock requirement shown in the source example: 149,994,000 coins remaining.</Text>
                <TouchableOpacity style={styles.okButton} onPress={() => { setAdvancedOpen(false); setMode('Basic'); }}><Text style={styles.okText}>OK</Text></TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,3,20,0.86)', justifyContent: 'center', paddingHorizontal: 5, paddingVertical: 14 },
  shell: { maxHeight: '98%', borderRadius: 15, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E7BF62', backgroundColor: '#111A39', elevation: 30 },
  topBar: { minHeight: 38, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#101A39', borderBottomWidth: 1, borderBottomColor: '#80613D' },
  wallet: { flexDirection: 'row', alignItems: 'center', gap: 5 }, coin: { fontSize: 16 }, walletValue: { color: '#FFF0B0', fontSize: 12, fontWeight: '900' }, plus: { color: GOLD, fontSize: 17, fontWeight: '900' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 13 }, topIcon: { color: '#FCE4A0', fontSize: 18, fontWeight: '900' }, close: { color: '#FFE6A1', fontSize: 27, lineHeight: 29 },
  content: { paddingBottom: 8 },
  gameBanner: { minHeight: 65, marginHorizontal: 7, marginTop: 7, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', borderRadius: 11, overflow: 'hidden', backgroundColor: '#142B57', borderWidth: 1, borderColor: '#B99050' },
  bannerGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#244C83', opacity: 0.62 },
  bannerText: { flex: 1, marginLeft: 7 }, gameName: { color: '#FFE9A8', fontSize: 14, fontWeight: '900', letterSpacing: 1 }, gameTag: { color: '#C9E1FF', fontSize: 7, fontWeight: '800', marginTop: 3, letterSpacing: 0.5 }, luckyBadge: { color: '#FFE5A1', fontSize: 12, fontWeight: '900' },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 9, marginTop: 7, gap: 4 }, modeButton: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 13, backgroundColor: '#19264C', borderWidth: 1, borderColor: '#62739B' }, modeActive: { backgroundColor: '#E5B94F', borderColor: '#FFF0B0' }, modeText: { color: '#D4DDF2', fontSize: 10, fontWeight: '900' }, modeTextActive: { color: '#32254A' }, jackpot: { marginLeft: 'auto', alignItems: 'center', backgroundColor: '#38264B', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, borderWidth: 1, borderColor: '#D9A74D' }, jackpotTop: { color: '#FFE7A0', fontSize: 9, fontWeight: '900' }, jackpotValue: { color: '#E5D6B4', fontSize: 6, fontWeight: '800' },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginTop: 5, gap: 3 },
  animal: { borderRadius: 18, backgroundColor: '#183B70', borderWidth: 1.5, borderColor: '#D9B75F', alignItems: 'center', justifyContent: 'center', marginBottom: 1, shadowColor: '#62B8FF', shadowOpacity: 0.28, shadowRadius: 5, elevation: 4 },
  animalSelected: { borderWidth: 3, borderColor: '#FFF28A', backgroundColor: '#315C91', shadowOpacity: 0.8, shadowRadius: 8 },
  animalEmoji: { fontSize: 29 }, multiplier: { color: '#FFF2BD', fontSize: 11, fontWeight: '900', marginTop: -1 },
  selected: { position: 'absolute', top: 2, right: 3, width: 16, height: 16, borderRadius: 9, backgroundColor: '#42D99A', alignItems: 'center', justifyContent: 'center' }, selectedText: { color: '#092A24', fontSize: 10, fontWeight: '900' },
  betTag: { position: 'absolute', top: -5, alignSelf: 'center', backgroundColor: '#F8D85E', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 7 }, betTagText: { color: '#34244C', fontSize: 6, fontWeight: '900' },
  centerOrb: { borderRadius: 44, backgroundColor: '#7442B0', borderWidth: 2, borderColor: '#FFE2A2', alignItems: 'center', justifyContent: 'center', marginBottom: 1 }, timerLabel: { color: '#FFF4D5', fontSize: 8, fontWeight: '900', marginTop: -3 }, timerValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 9, marginTop: 3, marginBottom: 5 }, groupPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#192A4D', borderWidth: 1, borderColor: '#806342' }, groupActive: { backgroundColor: '#405B88', borderColor: '#FBE18C' }, groupText: { color: '#FFF0B8', fontSize: 9, fontWeight: '900' }, todayWin: { color: '#D9C9F4', fontSize: 9, fontWeight: '800' }, todayValue: { color: '#FFE68E', fontWeight: '900' },
  betPanel: { marginHorizontal: 7, borderRadius: 10, backgroundColor: '#1C315E', borderWidth: 1, borderColor: '#947044', paddingBottom: 6, overflow: 'hidden' }, betHint: { textAlign: 'center', color: '#FFF0B0', fontSize: 8, fontWeight: '900', paddingTop: 5, paddingBottom: 4 }, betOptions: { alignItems: 'center', paddingHorizontal: 5, gap: 5 }, betChip: { width: 48, height: 38, borderRadius: 20, backgroundColor: '#126B9D', borderWidth: 1.5, borderColor: '#B8E9F6', alignItems: 'center', justifyContent: 'center' }, betChipActive: { backgroundColor: '#D9A83E', borderColor: '#FFF1B6' }, betChipText: { color: '#E9F8FF', fontSize: 9, fontWeight: '900' }, betChipTextActive: { color: '#3A2450' },
  betSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 5 }, summaryText: { color: '#D8C9EF', fontSize: 8, fontWeight: '800' }, placeBet: { alignSelf: 'center', backgroundColor: '#D6A94D', borderRadius: 7, paddingHorizontal: 22, paddingVertical: 6, marginTop: 5 }, placeBetText: { color: '#34204D', fontSize: 9, fontWeight: '900' },
  poolPanel: { marginHorizontal: 7, marginTop: 5, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#182C56', borderWidth: 1, borderColor: '#9D7746', borderRadius: 8, paddingVertical: 4 }, poolItem: { alignItems: 'center', minWidth: 42 }, poolEmoji: { fontSize: 17 }, poolValue: { color: '#FBE4A0', fontSize: 8, fontWeight: '900' },
  historyPanel: { marginHorizontal: 7, marginTop: 5, backgroundColor: '#17294F', borderWidth: 1, borderColor: '#8E6D48', borderRadius: 8, padding: 5 }, historyLabel: { color: '#D8C7F2', fontSize: 7, fontWeight: '900', marginBottom: 3 }, historyItems: { flexDirection: 'row', justifyContent: 'space-around' }, historyAnimal: { width: 27, height: 24, borderRadius: 5, backgroundColor: '#263D67', alignItems: 'center', justifyContent: 'center' }, historyEmoji: { fontSize: 15 }, previewNote: { color: '#BCAFD0', textAlign: 'center', fontSize: 7, marginTop: 5 },
  infoPanel: { margin: 10, padding: 12, backgroundColor: '#17294F', borderRadius: 11, borderWidth: 1, borderColor: '#9E784B', minHeight: 250, maxHeight: 480 }, infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, infoTitle: { color: '#FFE7A4', fontSize: 16, fontWeight: '900' }, back: { color: '#D7C9F5', fontSize: 11, fontWeight: '900', padding: 5 }, rule: { color: '#FFF0D4', fontSize: 11, lineHeight: 19, marginBottom: 11 }, placeholder: { color: '#D7C9F5', fontSize: 12, textAlign: 'center', marginTop: 55 },
  advancedBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }, advancedBox: { width: '100%', backgroundColor: '#17294F', borderRadius: 13, borderWidth: 1.5, borderColor: '#E7B94F', padding: 17, gap: 12 }, advancedTitle: { color: '#FFE7A4', fontSize: 16, fontWeight: '900', textAlign: 'center' }, advancedCopy: { color: '#FFF0D4', fontSize: 11, lineHeight: 18, textAlign: 'center' }, advancedRemaining: { color: '#FFE18C', fontSize: 10, lineHeight: 16, textAlign: 'center', fontWeight: '900' }, okButton: { alignSelf: 'center', backgroundColor: '#37B94B', borderRadius: 18, paddingHorizontal: 38, paddingVertical: 8 }, okText: { color: '#102A1A', fontSize: 11, fontWeight: '900' }
});
