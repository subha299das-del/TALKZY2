import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert,
  Dimensions, StyleSheet
} from 'react-native';

const GOLD = '#FFD66E';
const FOODS = [
  { id: 'fish', emoji: '🐟', multiplier: '×45', group: 'pizza' },
  { id: 'apple', emoji: '🍎', multiplier: '×5', group: 'fruit' },
  { id: 'lemon', emoji: '🍋', multiplier: '×5', group: 'fruit' },
  { id: 'pizza', emoji: '🍕', multiplier: '×25', group: 'pizza' },
  { id: 'strawberry', emoji: '🍓', multiplier: '×5', group: 'fruit' },
  { id: 'chicken', emoji: '🍗', multiplier: '×15', group: 'pizza' },
  { id: 'burger', emoji: '🍔', multiplier: '×10', group: 'pizza' },
  { id: 'mango', emoji: '🥭', multiplier: '×5', group: 'fruit' }
];
const BETS = [1000, 5000, 10000, 50000, 100000, 500000];
const CHESTS = [
  { emoji: '📦', value: '5M' },
  { emoji: '🧰', value: '50M' },
  { emoji: '🎁', value: '250M' },
  { emoji: '🧰', value: '500M' },
  { emoji: '👑', value: '2.5B' }
];

function ElephantMark({ size = 52 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ position: 'absolute', top: -size * 0.13, zIndex: 2, fontSize: size * 0.32 }}>👑</Text>
      <Text style={{ fontSize: size * 0.78, marginTop: size * 0.1 }}>🐘</Text>
    </View>
  );
}

function FoodOrb({ food, selected, betAmount, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[styles.foodOrb, selected && styles.foodOrbSelected]}>
      <Text style={styles.foodEmoji}>{food.emoji}</Text>
      <Text style={styles.multiplier}>{food.multiplier}</Text>
      {selected && <View style={styles.selectedDot}><Text style={styles.selectedTick}>✓</Text></View>}
      {betAmount > 0 && <View style={styles.betTag}><Text style={styles.betTagText}>Bet {betAmount.toLocaleString('en-IN')}</Text></View>}
    </TouchableOpacity>
  );
}

export default function LuckyElephantPanel({ visible, onClose }) {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [betAmount, setBetAmount] = useState(1000);
  const [view, setView] = useState('game');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [groupFilter, setGroupFilter] = useState('all');
  const [todayWin] = useState(0);
  const { width } = Dimensions.get('window');
  const orbSize = Math.max(68, Math.min(88, (width - 74) / 3));

  const toggleFood = (id) => setSelectedFoods(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  );
  const selectedTotal = selectedFoods.length * betAmount;
  const displayedFoods = useMemo(() => FOODS, []);

  const showNotConnected = () => Alert.alert(
    'Lucky Elephant',
    'The panel preview is ready. Live round timing, bet placement, wallet deductions, winning-food draw and prize settlement are not connected yet.'
  );

  const renderFood = (food) => (
    <FoodOrb
      key={food.id}
      food={food}
      selected={selectedFoods.includes(food.id)}
      betAmount={selectedFoods.includes(food.id) ? betAmount : 0}
      onPress={() => toggleFood(food.id)}
    />
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.topBar}>
            <View style={styles.wallet}><Text style={styles.coin}>🪙</Text><Text style={styles.walletValue}>428,961</Text><Text style={styles.plus}>＋</Text></View>
            <View style={styles.topActions}>
              <TouchableOpacity onPress={() => setView('records')}><Text style={styles.topIcon}>◷</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSettingsOpen(true)}><Text style={styles.topIcon}>◖))</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setView('rules')}><Text style={styles.topIcon}>?</Text></TouchableOpacity>
              <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
            </View>
          </View>

          {view !== 'game' ? (
            <View style={styles.infoPanel}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>{view === 'rules' ? 'RULE' : 'RECORDS'}</Text>
                <TouchableOpacity onPress={() => setView('game')}><Text style={styles.back}>BACK</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {view === 'rules' ? (
                  <View>
                    <Text style={styles.rule}>1. Choose the quantity of coins and select a type of food to place a bet on.</Text>
                    <Text style={styles.rule}>2. Each round, you have 30 seconds to choose a food. Then the winning food will be drawn.</Text>
                    <Text style={styles.rule}>3. If you bet coins on the winning food, you will receive the corresponding prize money.</Text>
                    <Text style={styles.rule}>4. If the winning food is a fruit, apple, mango, strawberry and lemon are all winners. If the winning food is a fish, burger, pizza or chicken, those four foods are all winners.</Text>
                    <Text style={styles.ruleNote}>The source display does not specify the full prize calculation or settlement details.</Text>
                  </View>
                ) : <Text style={styles.placeholder}>Round records will appear here when the game service is connected.</Text>}
              </ScrollView>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.gameBanner}>
                <View style={styles.bannerGlow} />
                <ElephantMark size={52} />
                <View style={styles.bannerText}>
                  <Text style={styles.gameName}>LUCKY ELEPHANT</Text>
                  <Text style={styles.gameTag}>CHOOSE YOUR FOOD • TRY YOUR LUCK</Text>
                </View>
                <Text style={styles.luckyBadge}>99+</Text>
              </View>

              <View style={styles.board}>
                {displayedFoods.slice(0, 3).map(renderFood)}
                {renderFood(displayedFoods[3])}
                <View style={[styles.centerOrb, { width: orbSize, height: orbSize }]}>
                  <ElephantMark size={Math.round(orbSize * 0.66)} />
                  <Text style={styles.timerLabel}>Bet Time</Text>
                  <Text style={styles.timerValue}>30s</Text>
                </View>
                {renderFood(displayedFoods[4])}
                {displayedFoods.slice(5, 8).map(renderFood)}
              </View>

              <View style={styles.groupRow}>
                <TouchableOpacity onPress={() => setGroupFilter(groupFilter === 'fruit' ? 'all' : 'fruit')} style={[styles.groupPill, groupFilter === 'fruit' && styles.groupPillActive]}><Text style={styles.groupEmoji}>🍎</Text><Text style={styles.groupText}>Fruit</Text></TouchableOpacity>
                <Text style={styles.todayWin}>TODAY'S WIN  <Text style={styles.todayValue}>{todayWin.toLocaleString('en-IN')}</Text></Text>
                <TouchableOpacity onPress={() => setGroupFilter(groupFilter === 'pizza' ? 'all' : 'pizza')} style={[styles.groupPill, groupFilter === 'pizza' && styles.groupPillActive]}><Text style={styles.groupEmoji}>🍕</Text><Text style={styles.groupText}>Pizza</Text></TouchableOpacity>
              </View>

              <View style={styles.betPanel}>
                <Text style={styles.betHint}>Choose the amount wager • Choose food</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.betOptions}>
                  {BETS.map(amount => (
                    <TouchableOpacity key={amount} onPress={() => setBetAmount(amount)} style={[styles.betChip, betAmount === amount && styles.betChipActive]}>
                      <Text style={[styles.betChipText, betAmount === amount && styles.betChipTextActive]}>{amount >= 1000 ? (amount / 1000) + 'K' : amount}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.betSummary}>
                  <Text style={styles.summaryText}>Selected foods: {selectedFoods.length}</Text>
                  <Text style={styles.summaryText}>Draft total: {selectedTotal.toLocaleString('en-IN')} 🪙</Text>
                </View>
                <TouchableOpacity style={styles.placeBet} onPress={showNotConnected}>
                  <Text style={styles.placeBetText}>PLACE BET</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chestPanel}>
                {CHESTS.map((item, index) => (
                  <View key={index} style={styles.chestItem}>
                    <Text style={styles.chestEmoji}>{item.emoji}</Text>
                    <Text style={styles.chestValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.historyPanel}>
                <Text style={styles.historyLabel}>RECENT RESULTS</Text>
                <View style={styles.historyItems}>
                  {['🍋','🍓','🍎','🍗','🍕','🥭','🐟','🍔'].map((emoji, index) => <View key={index} style={styles.historyFood}><Text style={styles.historyEmoji}>{emoji}</Text></View>)}
                </View>
              </View>
              <Text style={styles.previewNote}>DISPLAY PREVIEW • GAME SERVICE NOT CONNECTED</Text>
            </ScrollView>
          )}

          <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
            <View style={styles.settingsBackdrop}>
              <View style={styles.settingsBox}>
                <Text style={styles.infoTitle}>SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow} onPress={() => setSoundOn(v => !v)}><Text style={styles.rule}>Sound</Text><Text style={styles.settingValue}>{soundOn ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.settingRow} onPress={() => { setSettingsOpen(false); setView('rules'); }}><Text style={styles.rule}>Rules</Text><Text style={styles.settingValue}>OPEN ›</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setSettingsOpen(false)}><Text style={styles.back}>CLOSE</Text></TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,3,20,0.84)', justifyContent: 'center', paddingHorizontal: 5, paddingVertical: 14 },
  shell: { maxHeight: '98%', borderRadius: 15, overflow: 'hidden', borderWidth: 1.4, borderColor: '#E6B84F', backgroundColor: '#21134A', elevation: 30 },
  topBar: { minHeight: 38, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#241451', borderBottomWidth: 1, borderBottomColor: '#80613D' },
  wallet: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  coin: { fontSize: 16 },
  walletValue: { color: '#FFF0B0', fontSize: 12, fontWeight: '900' },
  plus: { color: GOLD, fontSize: 17, fontWeight: '900' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  topIcon: { color: '#FCE4A0', fontSize: 18, fontWeight: '900' },
  close: { color: '#FFE6A1', fontSize: 27, lineHeight: 29 },
  content: { paddingBottom: 8 },
  gameBanner: { minHeight: 64, marginHorizontal: 7, marginTop: 7, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', borderRadius: 11, overflow: 'hidden', backgroundColor: '#39236C', borderWidth: 1, borderColor: '#B99050' },
  bannerGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#7446A4', opacity: 0.35 },
  bannerText: { flex: 1, marginLeft: 7 },
  gameName: { color: '#FFE9A8', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  gameTag: { color: '#D8C9FF', fontSize: 7, fontWeight: '800', marginTop: 3, letterSpacing: 0.5 },
  luckyBadge: { color: '#FFE5A1', fontSize: 12, fontWeight: '900' },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginTop: 7, gap: 3 },
  foodOrb: { width: '31.5%', height: 84, borderRadius: 42, backgroundColor: '#573A8C', borderWidth: 1.5, borderColor: '#E4B75C', alignItems: 'center', justifyContent: 'center', marginBottom: 1, shadowColor: '#F5C95F', shadowOpacity: 0.24, shadowRadius: 5, elevation: 4 },
  foodOrbSelected: { borderWidth: 3, borderColor: '#FFF28A', backgroundColor: '#7952A8', shadowOpacity: 0.8, shadowRadius: 8 },
  foodEmoji: { fontSize: 29 },
  multiplier: { color: '#FFF2BD', fontSize: 11, fontWeight: '900', marginTop: -1 },
  selectedDot: { position: 'absolute', top: 3, right: 7, width: 17, height: 17, borderRadius: 9, backgroundColor: '#4AE2A1', alignItems: 'center', justifyContent: 'center' },
  selectedTick: { color: '#092A24', fontSize: 11, fontWeight: '900' },
  betTag: { position: 'absolute', top: -5, alignSelf: 'center', backgroundColor: '#F8D85E', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 7 },
  betTagText: { color: '#3A2450', fontSize: 7, fontWeight: '900' },
  centerOrb: { width: 84, height: 84, borderRadius: 43, backgroundColor: '#E54F8E', borderWidth: 2, borderColor: '#FFE2A2', alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  timerLabel: { color: '#FFF4D5', fontSize: 8, fontWeight: '900', marginTop: -3 },
  timerValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 9, marginTop: 3, marginBottom: 5 },
  groupPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#38255F', borderWidth: 1, borderColor: '#806342' },
  groupPillActive: { backgroundColor: '#5C3C8D', borderColor: '#FBE18C' },
  groupEmoji: { fontSize: 12, marginRight: 4 },
  groupText: { color: '#FFF0B8', fontSize: 9, fontWeight: '900' },
  todayWin: { color: '#D9C9F4', fontSize: 9, fontWeight: '800' },
  todayValue: { color: '#FFE68E', fontWeight: '900' },
  betPanel: { marginHorizontal: 7, borderRadius: 10, backgroundColor: '#3A2761', borderWidth: 1, borderColor: '#947044', paddingBottom: 6, overflow: 'hidden' },
  betHint: { textAlign: 'center', color: '#FFF0B0', fontSize: 9, fontWeight: '900', paddingTop: 5, paddingBottom: 4 },
  betOptions: { alignItems: 'center', paddingHorizontal: 5, gap: 5 },
  betChip: { width: 46, height: 39, borderRadius: 20, backgroundColor: '#26A86D', borderWidth: 1.5, borderColor: '#B8E9A6', alignItems: 'center', justifyContent: 'center' },
  betChipActive: { backgroundColor: '#D9A83E', borderColor: '#FFF1B6' },
  betChipText: { color: '#E9FFE8', fontSize: 10, fontWeight: '900' },
  betChipTextActive: { color: '#3A2450' },
  betSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 5 },
  summaryText: { color: '#D8C9EF', fontSize: 8, fontWeight: '800' },
  placeBet: { alignSelf: 'center', backgroundColor: '#E4B649', borderRadius: 7, paddingHorizontal: 22, paddingVertical: 6, marginTop: 5 },
  placeBetText: { color: '#34204D', fontSize: 10, fontWeight: '900' },
  chestPanel: { marginHorizontal: 7, marginTop: 5, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#412A69', borderWidth: 1, borderColor: '#9D7746', borderRadius: 8, paddingVertical: 4 },
  chestItem: { alignItems: 'center', minWidth: 45 },
  chestEmoji: { fontSize: 18 },
  chestValue: { color: '#FBE4A0', fontSize: 8, fontWeight: '900' },
  historyPanel: { marginHorizontal: 7, marginTop: 5, backgroundColor: '#39265B', borderWidth: 1, borderColor: '#8E6D48', borderRadius: 8, padding: 5 },
  historyLabel: { color: '#D8C7F2', fontSize: 7, fontWeight: '900', marginBottom: 3 },
  historyItems: { flexDirection: 'row', justifyContent: 'space-around' },
  historyFood: { width: 27, height: 24, borderRadius: 5, backgroundColor: '#563D80', alignItems: 'center', justifyContent: 'center' },
  historyEmoji: { fontSize: 15 },
  previewNote: { color: '#BCAFD0', textAlign: 'center', fontSize: 7, marginTop: 5 },
  infoPanel: { margin: 10, padding: 12, backgroundColor: '#352257', borderRadius: 11, borderWidth: 1, borderColor: '#9E784B', minHeight: 250, maxHeight: 480 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  infoTitle: { color: '#FFE7A4', fontSize: 16, fontWeight: '900' },
  back: { color: '#D7C9F5', fontSize: 11, fontWeight: '900', padding: 5 },
  rule: { color: '#FFF0D4', fontSize: 11, lineHeight: 19, marginBottom: 11 },
  ruleNote: { color: '#D7C9F5', fontSize: 9, lineHeight: 15, marginTop: 4 },
  placeholder: { color: '#D7C9F5', fontSize: 12, textAlign: 'center', marginTop: 55 },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  settingsBox: { width: '100%', backgroundColor: '#352257', borderRadius: 13, borderWidth: 1.5, borderColor: '#E7B94F', padding: 17, gap: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#68518A', paddingBottom: 9 },
  settingValue: { color: GOLD, fontSize: 11, fontWeight: '900' }
});
