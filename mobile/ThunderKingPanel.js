import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert,
  Dimensions, StyleSheet,
} from 'react-native';

const C = {
  bg: '#170D20',
  deep: '#24102A',
  plum: '#351437',
  panel: '#3A1B36',
  gold: '#F8D66D',
  gold2: '#C58A27',
  cream: '#FFF0B7',
  red: '#A83228',
  orange: '#F58B35',
  white: '#FFF9EA',
  muted: '#D4BFA1',
  line: '#8E5A2C',
};

const SYMBOLS = ['💠', '🔱', '⏳', '🔺', '👑', '💎', '🔱', '💍', '⏳', '🔺', '💠', '👑', '💍', '🔱', '💎', '⏳', '🔺', '💠', '👑', '💍', '🔱', '⏳', '💎', '🔺', '💍', '👑', '💠', '🔱', '⏳', '💎'];

function GoldButton({ children, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={[styles.goldButton, style]}>
      {children}
    </TouchableOpacity>
  );
}

function Stat({ label, value, wide }) {
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function ThunderKingPanel({ visible, onClose }) {
  const [bet, setBet] = useState(100);
  const [freeSpins] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState('game');
  const board = useMemo(() => SYMBOLS, []);
  const width = Dimensions.get('window').width;
  const cell = Math.max(37, Math.min(54, (width - 48) / 6.25));

  const previewOnly = () => Alert.alert(
    'Thunder King preview',
    'This panel is a visual preview. The secure spin engine, live gold balance settlement, cascades and Founder outcome service are not connected yet.'
  );

  const title = view === 'rules' ? 'HOW TO PLAY' : view === 'ranking' ? 'STORM RANKING' : 'ROUND RECORDS';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.roomHeader}>
              <View style={styles.homeMark}><Text style={styles.homeGlyph}>♛</Text></View>
              <View style={styles.roomIdentity}>
                <Text style={styles.roomName}>THUNDER KING <Text style={styles.roomTag}>✦ GREEDY 02</Text></Text>
                <Text style={styles.roomId}>TALKZY ROYAL STORM ARENA</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.headerIcon}><Text style={styles.headerIconText}>×</Text></TouchableOpacity>
            </View>

            <View style={styles.micStrip}>
              {[0, 1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.micSlot}>
                  <Text style={styles.micGlyph}>{item === 1 || item === 2 ? '♩' : '♙'}</Text>
                </View>
              ))}
            </View>

            {view === 'game' ? (
              <>
                <View style={styles.hero}>
                  <View style={styles.templeGlow} />
                  <Text style={styles.templeRoof}>⌁  ♜  ⌁  ♜  ⌁</Text>
                  <Text style={styles.heroLightningLeft}>ϟ</Text>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroKicker}>THE GOD OF THUNDER</Text>
                    <Text style={styles.heroName}>THUNDER{ '\n' }KING</Text>
                    <Text style={styles.heroSub}>AWAKEN THE DIVINE POWER</Text>
                  </View>
                  <View style={styles.deity}>
                    <Text style={styles.deityHalo}>✦</Text>
                    <Text style={styles.deityEmoji}>🧙🏻‍♂️</Text>
                    <Text style={styles.deityBolt}>ϟ</Text>
                  </View>
                  <View style={styles.heroPillarLeft}><Text style={styles.pillarGlyph}>♜</Text></View>
                  <View style={styles.heroPillarRight}><Text style={styles.pillarGlyph}>♜</Text></View>
                  <View style={styles.totalWin}>
                    <Text style={styles.totalWinLabel}>TOTAL WIN</Text>
                    <Text style={styles.totalWinValue}>0</Text>
                  </View>
                  <View style={styles.freeSpinRibbon}><Text style={styles.freeSpinText}>{freeSpins} FREE SPINS</Text></View>
                </View>

                <View style={styles.boardFrame}>
                  <View style={styles.boardTopTrim}><Text style={styles.boardTitle}>✦  THUNDER REELS  ✦</Text><Text style={styles.boardCount}>6 × 5</Text></View>
                  <View style={styles.board}>
                    {board.map((symbol, index) => (
                      <View key={index} style={[styles.cell, { width: cell, height: cell }]}>
                        <View style={styles.cellTop} />
                        <Text style={[styles.symbol, { fontSize: Math.max(23, cell * 0.59) }]}>{symbol}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.boardBottomTrim}><Text style={styles.scatterText}>4+ SCATTERS  •  15 FREE SPINS</Text></View>
                </View>

                <View style={styles.controls}>
                  <View style={styles.controlTop}>
                    <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.roundUtility}><Text style={styles.utilityGlyph}>⚙</Text></TouchableOpacity>
                    <View style={styles.betPanel}>
                      <Text style={styles.controlLabel}>TOTAL BET</Text>
                      <View style={styles.betRow}>
                        <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => Math.max(1, Math.floor(v / 2)))}><Text style={styles.adjustText}>−</Text></TouchableOpacity>
                        <Text style={styles.betValue}>{bet.toLocaleString('en-IN')}</Text>
                        <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => v * 2)}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                    <GoldButton onPress={previewOnly} style={styles.spinButton}>
                      <Text style={styles.spinArrow}>⟳</Text><Text style={styles.spinText}>SPIN</Text>
                    </GoldButton>
                    <TouchableOpacity onPress={previewOnly} style={styles.autoButton}><Text style={styles.autoGlyph}>▶</Text><Text style={styles.autoText}>AUTO</Text></TouchableOpacity>
                  </View>
                  <View style={styles.balanceRow}>
                    <Stat label="TOTAL BET" value={bet.toLocaleString('en-IN')} />
                    <Text style={styles.previewLabel}>PREVIEW ONLY</Text>
                    <Stat label="BALANCE" value="—" />
                  </View>
                  <View style={styles.links}>
                    <TouchableOpacity onPress={() => setView('rules')}><Text style={styles.linkText}>RULES</Text></TouchableOpacity>
                    <Text style={styles.linkDot}>•</Text>
                    <TouchableOpacity onPress={() => setView('records')}><Text style={styles.linkText}>RECORDS</Text></TouchableOpacity>
                    <Text style={styles.linkDot}>•</Text>
                    <TouchableOpacity onPress={() => setView('ranking')}><Text style={styles.linkText}>RANKING</Text></TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.infoPanel}>
                <Text style={styles.infoEyebrow}>TALKZY • THUNDER KING</Text>
                <Text style={styles.infoTitle}>{title}</Text>
                {view === 'rules' ? (
                  <>
                    <Text style={styles.rule}>01  The reels use a 6-column × 5-row grid. Matching symbols can pay anywhere.</Text>
                    <Text style={styles.rule}>02  Winning symbols disappear; remaining symbols tumble and new symbols enter from above.</Text>
                    <Text style={styles.rule}>03  Cascades continue until no new winning combination appears.</Text>
                    <Text style={styles.rule}>04  Four or more Scatter symbols trigger 15 Free Spins.</Text>
                    <Text style={styles.rule}>05  Multipliers can accumulate during Free Spins.</Text>
                    <Text style={styles.rule}>06  The Founder controls the official paytable, probabilities, fees, settings and winning outcomes.</Text>
                  </>
                ) : <Text style={styles.emptyCopy}>Verified {view === 'ranking' ? 'player rankings' : 'round history'} will appear here after the secure game service is connected.</Text>}
                <GoldButton onPress={() => setView('game')} style={styles.backToGame}><Text style={styles.backToGameText}>‹  BACK TO GAME</Text></GoldButton>
              </View>
            )}
          </ScrollView>

          <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
            <View style={styles.settingsBackdrop}>
              <View style={styles.settingsBox}>
                <Text style={styles.settingsEyebrow}>THUNDER KING</Text>
                <Text style={styles.settingsTitle}>GAME SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow} onPress={() => setSoundOn(v => !v)}>
                  <Text style={styles.settingName}>Sound effects</Text><Text style={styles.settingValue}>{soundOn ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingRow} onPress={() => { setSettingsOpen(false); setView('rules'); }}>
                  <Text style={styles.settingName}>Game rules</Text><Text style={styles.settingValue}>OPEN  ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeSettings} onPress={() => setSettingsOpen(false)}><Text style={styles.closeSettingsText}>CLOSE</Text></TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,2,9,0.96)', justifyContent: 'center', paddingHorizontal: 3, paddingVertical: 8 },
  shell: { maxHeight: '99%', overflow: 'hidden', backgroundColor: C.bg, borderWidth: 1, borderColor: C.gold2, elevation: 30 },
  scroll: { paddingBottom: 7 },
  roomHeader: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#21152B', borderBottomWidth: 1, borderBottomColor: '#60402C' },
  homeMark: { width: 37, height: 37, borderRadius: 9, backgroundColor: '#D8B64C', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF0A8' },
  homeGlyph: { color: '#4B251C', fontSize: 23, fontWeight: '900' },
  roomIdentity: { flex: 1, marginLeft: 10 },
  roomName: { color: C.white, fontSize: 13, fontWeight: '900', letterSpacing: 0.7 },
  roomTag: { color: C.gold, fontSize: 8 },
  roomId: { color: '#C9A77E', fontSize: 8, marginTop: 3, letterSpacing: 1.1 },
  headerIcon: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: '#8B643B', alignItems: 'center', justifyContent: 'center', backgroundColor: '#392338' },
  headerIconText: { color: C.white, fontSize: 24, lineHeight: 26 },
  micStrip: { height: 65, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#30203A', borderBottomWidth: 2, borderBottomColor: '#9C6A3A' },
  micSlot: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#57415A', borderWidth: 1, borderColor: '#9E8666', alignItems: 'center', justifyContent: 'center' },
  micGlyph: { color: '#F6E5BE', fontSize: 22 },
  hero: { height: 204, marginTop: 0, overflow: 'hidden', backgroundColor: '#A74734', borderBottomWidth: 3, borderBottomColor: '#E9B84C' },
  templeGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: '#D87949', opacity: 0.55 },
  templeRoof: { color: '#FFE0A0', fontSize: 28, textAlign: 'center', marginTop: 1, opacity: 0.9, letterSpacing: 4 },
  heroCopy: { position: 'absolute', left: 13, top: 50, zIndex: 3 },
  heroKicker: { color: '#FFE7A6', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  heroName: { color: '#FFF2C5', fontSize: 25, lineHeight: 26, fontWeight: '900', textShadowColor: '#77261F', textShadowRadius: 8 },
  heroSub: { color: '#FFE3B0', fontSize: 6, fontWeight: '900', letterSpacing: 0.7, marginTop: 5 },
  deity: { position: 'absolute', right: '27%', top: 17, width: 130, height: 135, alignItems: 'center', justifyContent: 'center' },
  deityHalo: { position: 'absolute', color: '#FFF1B0', fontSize: 112, opacity: 0.35 },
  deityEmoji: { fontSize: 91, textShadowColor: '#6B261E', textShadowRadius: 12 },
  deityBolt: { position: 'absolute', right: 1, top: 13, color: '#FFF27D', fontSize: 56, fontWeight: '900', textShadowColor: '#FF9D20', textShadowRadius: 12 },
  heroLightningLeft: { position: 'absolute', left: '31%', top: 22, color: '#FFF16E', fontSize: 70, textShadowColor: '#FFB21E', textShadowRadius: 15 },
  heroPillarLeft: { position: 'absolute', left: 3, bottom: 19, width: 25, height: 88, backgroundColor: '#E6B65D', borderWidth: 2, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center' },
  heroPillarRight: { position: 'absolute', right: 4, bottom: 19, width: 25, height: 88, backgroundColor: '#E6B65D', borderWidth: 2, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center' },
  pillarGlyph: { color: '#87502C', fontSize: 23 },
  totalWin: { position: 'absolute', bottom: 27, left: '25%', right: '25%', height: 39, backgroundColor: '#381024', borderWidth: 2, borderColor: '#F4CB52', borderRadius: 8, alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 6 },
  totalWinLabel: { color: '#FFE7A2', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  totalWinValue: { color: '#FFF5C9', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  freeSpinRibbon: { position: 'absolute', bottom: 4, left: '25%', right: '25%', height: 20, borderRadius: 10, backgroundColor: '#2D1029', borderWidth: 1, borderColor: '#D8A83F', alignItems: 'center', justifyContent: 'center' },
  freeSpinText: { color: C.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  boardFrame: { marginHorizontal: 7, marginTop: 0, paddingHorizontal: 5, paddingBottom: 5, backgroundColor: '#4A241F', borderWidth: 4, borderColor: '#E5B63F', borderRadius: 12, shadowColor: '#FFCB4C', shadowOpacity: 0.5, shadowRadius: 8, elevation: 9 },
  boardTopTrim: { height: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#A9772F' },
  boardTitle: { color: '#FFE9A5', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  boardCount: { position: 'absolute', right: 4, color: '#E9C66C', fontSize: 7, fontWeight: '900' },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#2B1230', paddingVertical: 3 },
  cell: { margin: 1, borderRadius: 7, backgroundColor: '#421C3C', borderWidth: 1, borderColor: '#A96A43', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cellTop: { position: 'absolute', top: 0, left: 2, right: 2, height: 2, backgroundColor: '#F8D98B', opacity: 0.65 },
  symbol: { textShadowColor: '#FFCF63', textShadowRadius: 5 },
  boardBottomTrim: { height: 21, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#A9772F' },
  scatterText: { color: '#FFE5A0', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  controls: { marginHorizontal: 7, marginTop: 5, paddingHorizontal: 7, paddingTop: 6, paddingBottom: 5, backgroundColor: '#39202F', borderTopWidth: 2, borderColor: '#C18B37' },
  controlTop: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundUtility: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#5B3D2A', borderWidth: 1.5, borderColor: '#EAC25E', alignItems: 'center', justifyContent: 'center' },
  utilityGlyph: { color: '#FFE7A4', fontSize: 19 },
  betPanel: { flex: 1, alignItems: 'center' },
  controlLabel: { color: '#E8C77F', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  betRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  betAdjust: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#6A492E', borderWidth: 1.5, borderColor: '#F4D26D', alignItems: 'center', justifyContent: 'center' },
  adjustText: { color: '#FFF1C4', fontSize: 20, lineHeight: 23, fontWeight: '900' },
  betValue: { minWidth: 48, textAlign: 'center', color: '#FFF0B3', fontSize: 12, fontWeight: '900' },
  goldButton: { backgroundColor: '#F0C34D', borderWidth: 2, borderColor: '#FFF0A5', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC844', shadowOpacity: 0.6, shadowRadius: 7, elevation: 7 },
  spinButton: { width: 67, height: 67, borderRadius: 34, marginHorizontal: 3, borderWidth: 3, borderColor: '#FFF0A5' },
  spinArrow: { color: '#4B241E', fontSize: 33, lineHeight: 35, fontWeight: '900' },
  spinText: { color: '#4B241E', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  autoButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#62432C', borderWidth: 1.5, borderColor: '#EAC25E', alignItems: 'center', justifyContent: 'center' },
  autoGlyph: { color: '#FFE6A1', fontSize: 16 },
  autoText: { color: '#FCE6AD', fontSize: 6, fontWeight: '900' },
  balanceRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  stat: { minWidth: 91, backgroundColor: '#2A1426', borderWidth: 1.5, borderColor: '#C58D39', borderRadius: 7, paddingVertical: 3, paddingHorizontal: 8, alignItems: 'center' },
  statWide: { flex: 1 },
  statLabel: { color: '#E9C77B', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  statValue: { color: '#FFF4D0', fontSize: 11, fontWeight: '900', marginTop: 1 },
  previewLabel: { color: '#C7A879', fontSize: 6, fontWeight: '900', letterSpacing: 0.6 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 5, borderTopWidth: 1, borderTopColor: '#76502F', marginTop: 4 },
  linkText: { color: '#EED18A', fontSize: 8, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 2 },
  linkDot: { color: '#A97A3E', fontSize: 9 },
  infoPanel: { margin: 10, padding: 16, minHeight: 320, backgroundColor: '#3A1B36', borderWidth: 2, borderColor: '#C58D39', borderRadius: 12 },
  infoEyebrow: { color: C.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  infoTitle: { color: C.white, fontSize: 20, fontWeight: '900', marginTop: 4, marginBottom: 14 },
  rule: { color: '#F6E8D0', fontSize: 11, lineHeight: 18, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#68405A' },
  emptyCopy: { color: '#E1CBAE', fontSize: 11, lineHeight: 18, marginTop: 15 },
  backToGame: { alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  backToGameText: { color: '#4B241E', fontSize: 10, fontWeight: '900' },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  settingsBox: { width: '100%', backgroundColor: '#32182F', borderWidth: 2, borderColor: '#D4A64A', borderRadius: 14, padding: 17 },
  settingsEyebrow: { color: C.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  settingsTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 4, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#68405A' },
  settingName: { color: C.white, fontSize: 12, fontWeight: '700' },
  settingValue: { color: C.gold, fontSize: 10, fontWeight: '900' },
  closeSettings: { alignItems: 'center', marginTop: 15, padding: 11, backgroundColor: '#F0C34D', borderRadius: 8 },
  closeSettingsText: { color: '#4B241E', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
