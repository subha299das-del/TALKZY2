import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert,
  Dimensions, StyleSheet
} from 'react-native';

const GOLD = '#F7D77B';
const DARK = '#160D2D';
const PANEL = '#24143F';
const SYMBOLS = ['💎', '🔱', '⚡', '👑', '🟣', '🔷', '🔺', '🪙', '🟡', '🟢'];

function ThunderKingMark({ size = 34 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2B1747', borderWidth: 1.5, borderColor: '#F8D66D', shadowColor: '#65BFFF', shadowOpacity: 0.8, shadowRadius: 8, elevation: 7 }}>
      <Text style={{ position: 'absolute', top: -size * 0.12, right: -size * 0.08, color: '#8FE7FF', fontSize: size * 0.48 }}>⚡</Text>
      <Text style={{ fontSize: size * 0.62 }}>👑</Text>
    </View>
  );
}

export default function ThunderKingPanel({ visible, onClose }) {
  const [bet, setBet] = useState(100);
  const [view, setView] = useState('game');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [freeSpins, setFreeSpins] = useState(0);
  const board = useMemo(() => [
    '💎','🔱','⚡','👑','🟣','🔷',
    '🔺','🪙','💎','🟢','⚡','👑',
    '🟣','🔷','🔺','💎','🪙','🔱',
    '👑','⚡','🟢','🔺','💎','🟣',
    '🪙','🔱','🔷','👑','⚡','🟢'
  ], []);
  const { width } = Dimensions.get('window');
  const cell = Math.max(34, Math.min(52, (width - 64) / 6));

  const showNotConnected = () => Alert.alert(
    'Thunder King',
    'The game display is installed. The secure spin engine, gold-balance settlement and Founder-controlled outcome service are not connected yet.'
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <ThunderKingMark size={40} />
              <View style={{ marginLeft: 9, flex: 1 }}>
                <Text style={styles.title}>THUNDER KING</Text>
                <Text style={styles.subtitle}>THE STORM OF FORTUNE</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setView('records')}><Text style={styles.headerIcon}>▤</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setView('ranking')}><Text style={styles.headerIcon}>♛</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setView('rules')}><Text style={styles.headerIcon}>?</Text></TouchableOpacity>
              <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
            </View>
          </View>

          {view !== 'game' ? (
            <View style={styles.infoPanel}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>{view === 'rules' ? 'GAME RULES' : view === 'ranking' ? 'RANKING' : 'RECORDS'}</Text>
                <TouchableOpacity onPress={() => setView('game')}><Text style={styles.back}>BACK</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {view === 'rules' ? (
                  <View>
                    <Text style={styles.rule}>• 6 columns × 5 rows. Matching symbols can pay anywhere on the screen.</Text>
                    <Text style={styles.rule}>• Winning symbols are removed. Remaining symbols tumble down and new symbols enter from above.</Text>
                    <Text style={styles.rule}>• Tumbles continue until no new winning combination appears. Wins are added after the full tumble sequence ends.</Text>
                    <Text style={styles.rule}>• 4 or more Scatter symbols trigger 15 Free Spins.</Text>
                    <Text style={styles.rule}>• Multiplier symbols can increase the total multiplier during Free Spins.</Text>
                    <Text style={styles.rule}>• The paytable shows symbol-count payouts. Exact payout values and probability settings will be controlled by the Founder.</Text>
                    <Text style={styles.rule}>• Autoplay can be started from the game screen.</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholder}>{view === 'ranking' ? 'Ranking data will appear when the game service is connected.' : 'Completed round records will appear when the game service is connected.'}</Text>
                )}
              </ScrollView>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              <View style={styles.hero}>
                <View style={styles.templeGlow} />
                <Text style={styles.heroLightning}>⚡</Text>
                <View style={styles.heroCenter}>
                  <ThunderKingMark size={66} />
                  <Text style={styles.heroName}>THUNDER KING</Text>
                  <Text style={styles.heroTag}>RULE THE STORM • CLAIM THE TREASURE</Text>
                </View>
                <View style={styles.heroRight}><Text style={{ fontSize: 27 }}>🔱</Text></View>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusPill}><Text style={styles.statusLabel}>TOTAL WIN</Text><Text style={styles.statusValue}>0</Text></View>
                <View style={styles.statusPill}><Text style={styles.statusLabel}>TOTAL MULTIPLIER</Text><Text style={styles.statusValue}>1×</Text></View>
                <View style={styles.statusPill}><Text style={styles.statusLabel}>FREE SPINS LEFT</Text><Text style={styles.statusValue}>{freeSpins}</Text></View>
              </View>

              <View style={styles.boardFrame}>
                <View style={styles.boardTop}><Text style={styles.boardCaption}>SYMBOLS PAY ANYWHERE ON THE SCREEN</Text><Text style={styles.boardCaption}>6 × 5</Text></View>
                <View style={styles.board}>
                  {board.map((symbol, index) => (
                    <View key={index} style={[styles.cell, { width: cell, height: cell }]}>
                      <Text style={{ fontSize: Math.max(19, cell * 0.52) }}>{symbol}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.scatterHint}><Text style={styles.scatterText}>⚡ 4+ SCATTERS TRIGGER 15 FREE SPINS</Text></View>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity style={styles.gear} onPress={() => setSettingsOpen(true)}><Text style={{ color: GOLD, fontSize: 20 }}>⚙</Text></TouchableOpacity>
                <View style={styles.betBlock}>
                  <Text style={styles.controlLabel}>TOTAL BET</Text>
                  <View style={styles.betRow}>
                    <TouchableOpacity style={styles.adjust} onPress={() => setBet(v => Math.max(1, Math.floor(v / 2)))}><Text style={styles.adjustText}>−</Text></TouchableOpacity>
                    <Text style={styles.betValue}>{bet.toLocaleString('en-IN')}</Text>
                    <TouchableOpacity style={styles.adjust} onPress={() => setBet(v => v * 2)}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.spin} onPress={showNotConnected}><Text style={styles.spinText}>⟳</Text><Text style={styles.spinLabel}>SPIN</Text></TouchableOpacity>
                <View style={styles.balanceBlock}><Text style={styles.controlLabel}>BALANCE</Text><Text style={styles.balanceValue}>—</Text></View>
              </View>
              <View style={styles.bottomActions}>
                <TouchableOpacity style={[styles.autoButton, autoPlay && styles.autoActive]} onPress={() => setAutoPlay(v => !v)}><Text style={styles.autoText}>{autoPlay ? 'STOP AUTOPLAY' : 'AUTOPLAY'}</Text></TouchableOpacity>
                <Text style={styles.engineNote}>Display preview • Secure game service pending</Text>
              </View>
            </ScrollView>
          )}

          <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
            <View style={styles.settingsBackdrop}>
              <View style={styles.settingsBox}>
                <Text style={styles.infoTitle}>SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow} onPress={() => setSoundOn(v => !v)}><Text style={styles.rule}>Sound</Text><Text style={styles.settingValue}>{soundOn ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.settingRow} onPress={() => { setSettingsOpen(false); setView('rules'); }}><Text style={styles.rule}>Rules</Text><Text style={styles.settingValue}>OPEN ›</Text></TouchableOpacity>
                <TouchableOpacity style={styles.settingExit} onPress={() => { setSettingsOpen(false); onClose(); }}><Text style={styles.settingValue}>EXIT GAME</Text></TouchableOpacity>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(5,3,14,0.82)', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 22 },
  shell: { maxHeight: '96%', borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E7B94F', backgroundColor: DARK, elevation: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#21143A', borderBottomWidth: 1, borderBottomColor: '#8D642D' },
  brandRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  title: { color: '#FFE49A', fontSize: 14, fontWeight: '900', letterSpacing: 1.1 },
  subtitle: { color: '#9DDCFF', fontSize: 8, fontWeight: '800', letterSpacing: 1.2, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headerIcon: { color: GOLD, fontSize: 20, fontWeight: '900' },
  close: { color: GOLD, fontSize: 27, lineHeight: 28 },
  infoPanel: { backgroundColor: '#1D1232', margin: 10, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#8E6634', minHeight: 240, maxHeight: 470 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  infoTitle: { color: '#FFE39A', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  back: { color: '#A9DFFF', fontSize: 11, fontWeight: '900', padding: 6 },
  rule: { color: '#F4EEDC', fontSize: 11, lineHeight: 18, marginBottom: 9 },
  placeholder: { color: '#C7BBD8', fontSize: 12, textAlign: 'center', marginTop: 55 },
  hero: { height: 146, marginHorizontal: 8, marginTop: 8, borderRadius: 11, overflow: 'hidden', backgroundColor: '#4B225B', borderWidth: 1, borderColor: '#E8B64B', justifyContent: 'center', alignItems: 'center' },
  templeGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#9A4C77', opacity: 0.5 },
  heroLightning: { position: 'absolute', left: 12, top: 6, fontSize: 58, color: '#FFF2A2' },
  heroCenter: { alignItems: 'center', justifyContent: 'center' },
  heroName: { color: '#FFE8A5', fontSize: 17, fontWeight: '900', letterSpacing: 2, textShadowColor: '#5D2B0B', textShadowRadius: 5 },
  heroTag: { color: '#C8EFFF', fontSize: 7, fontWeight: '900', letterSpacing: 1.2, marginTop: 3 },
  heroRight: { position: 'absolute', right: 13, top: 10 },
  statusRow: { flexDirection: 'row', gap: 5, marginHorizontal: 8, marginTop: 7 },
  statusPill: { flex: 1, backgroundColor: '#29183F', borderRadius: 7, borderWidth: 1, borderColor: '#8E6938', alignItems: 'center', paddingVertical: 6 },
  statusLabel: { color: '#B9A7C7', fontSize: 7, fontWeight: '800' },
  statusValue: { color: GOLD, fontSize: 13, fontWeight: '900', marginTop: 2 },
  boardFrame: { marginHorizontal: 8, marginTop: 7, padding: 6, backgroundColor: '#2B1745', borderRadius: 10, borderWidth: 1.5, borderColor: '#E4B34D' },
  boardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  boardCaption: { color: '#FFE49B', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3 },
  cell: { backgroundColor: '#3B2459', borderRadius: 5, borderWidth: 1, borderColor: '#9B7846', alignItems: 'center', justifyContent: 'center' },
  scatterHint: { alignItems: 'center', paddingTop: 5 },
  scatterText: { color: '#9DEBFF', fontSize: 8, fontWeight: '900' },
  controls: { marginHorizontal: 8, marginTop: 8, padding: 7, borderRadius: 10, backgroundColor: '#29183F', borderWidth: 1, borderColor: '#9C773E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gear: { width: 28, height: 35, alignItems: 'center', justifyContent: 'center' },
  betBlock: { flex: 1, alignItems: 'center' },
  controlLabel: { color: '#B9A7C7', fontSize: 7, fontWeight: '900' },
  betRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  adjust: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#D9AD52', alignItems: 'center', justifyContent: 'center' },
  adjustText: { color: '#24162E', fontSize: 17, fontWeight: '900', lineHeight: 20 },
  betValue: { color: '#FFE39A', fontSize: 11, fontWeight: '900', minWidth: 38, textAlign: 'center' },
  spin: { width: 54, height: 54, borderRadius: 28, backgroundColor: '#D8AC50', borderWidth: 3, borderColor: '#FFF0B5', alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  spinText: { color: '#382344', fontSize: 26, lineHeight: 28, fontWeight: '900' },
  spinLabel: { color: '#382344', fontSize: 7, fontWeight: '900' },
  balanceBlock: { flex: 0.75, alignItems: 'center' },
  balanceValue: { color: '#FFE39A', fontSize: 12, fontWeight: '900', marginTop: 4 },
  bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10, marginTop: 7 },
  autoButton: { backgroundColor: '#3A2456', borderWidth: 1, borderColor: '#B58A48', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 7 },
  autoActive: { backgroundColor: '#7A2635', borderColor: '#FFB0A7' },
  autoText: { color: '#FFE49B', fontSize: 8, fontWeight: '900' },
  engineNote: { color: '#A99BB8', fontSize: 7, flex: 1, textAlign: 'right', marginLeft: 8 },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  settingsBox: { width: '100%', backgroundColor: '#24143F', borderRadius: 13, borderWidth: 1.5, borderColor: '#E7B94F', padding: 17, gap: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#57406F', paddingBottom: 9 },
  settingValue: { color: GOLD, fontSize: 11, fontWeight: '900' },
  settingExit: { backgroundColor: '#4A243A', borderRadius: 8, alignItems: 'center', padding: 10 }
});
