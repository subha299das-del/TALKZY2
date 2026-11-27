import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert,
  Dimensions, StyleSheet,
} from 'react-native';

const C = {
  bg: '#071323', deep: '#0B1E35', plum: '#102B49', panel: '#102642',
  gold: '#F8D66D', gold2: '#C58A27', cream: '#FFF0B7', red: '#9E2536',
  orange: '#F5A33B', white: '#FFF9EA', muted: '#AFC4D8', line: '#3476A7',
};

const SYMBOL_SET = ['♛', '🔱', 'ϟ', '🦅', '🛡', '⚒', '❤️', '◉'];
const SYMBOLS = Array.from({ length: 30 }, (_, i) => SYMBOL_SET[(i * 5 + Math.floor(i / 6)) % SYMBOL_SET.length]);

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
  const cell = Math.max(34, Math.min(58, (width * 0.54 - 34) / 6.25));

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
                <View style={styles.gameStage}><View style={styles.hero}>
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
                </View></View>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(2,8,18,0.98)', justifyContent: 'center', padding: 0 },
  shell: { flex: 1, width: '100%', maxHeight: '100%', overflow: 'hidden', backgroundColor: C.bg, borderWidth: 2, borderColor: C.gold2 },
  scroll: { flexGrow: 1, paddingBottom: 2 },
  roomHeader: { minHeight: 43, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: '#091A2E', borderBottomWidth: 1, borderBottomColor: '#A77A32' },
  homeMark: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#D8B64C', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF0A8' },
  homeGlyph: { color: '#17283A', fontSize: 20, fontWeight: '900' },
  roomIdentity: { flex: 1, marginLeft: 9 },
  roomName: { color: C.white, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  roomTag: { color: C.gold, fontSize: 8 },
  roomId: { color: '#8FB4D2', fontSize: 7, marginTop: 2, letterSpacing: 1.2 },
  headerIcon: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#A77A32', alignItems: 'center', justifyContent: 'center', backgroundColor: '#102B49' },
  headerIconText: { color: C.white, fontSize: 22, lineHeight: 24 },
  micStrip: { height: 34, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0B2038', borderBottomWidth: 1, borderBottomColor: '#3976A3' },
  micSlot: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#163B60', borderWidth: 1, borderColor: '#B28A43', alignItems: 'center', justifyContent: 'center' },
  micGlyph: { color: '#F6E5BE', fontSize: 14 },
  gameStage: { flex: 1, minHeight: 310, flexDirection: 'row', alignItems: 'stretch', padding: 5, gap: 5, backgroundColor: '#061426' },
  hero: { width: '20%', minWidth: 105, overflow: 'hidden', backgroundColor: '#0B3157', borderWidth: 2, borderColor: '#C99B42', borderRadius: 9, justifyContent: 'center' },
  templeGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: '#17629A', opacity: 0.42 },
  templeRoof: { color: '#F9D778', fontSize: 18, textAlign: 'center', marginTop: 3, opacity: 0.95 },
  heroCopy: { position: 'absolute', left: 7, top: 8, zIndex: 3 },
  heroKicker: { color: '#FFE7A6', fontSize: 6, fontWeight: '900', letterSpacing: 0.8 },
  heroName: { color: '#FFF2C5', fontSize: 17, lineHeight: 18, fontWeight: '900', textShadowColor: '#06345C', textShadowRadius: 8 },
  heroSub: { color: '#B9E5FF', fontSize: 5, fontWeight: '900', letterSpacing: 0.5, marginTop: 3 },
  deity: { position: 'absolute', right: 0, top: '22%', width: '100%', height: '55%', alignItems: 'center', justifyContent: 'center' },
  deityHalo: { position: 'absolute', color: '#E5F6FF', fontSize: 95, opacity: 0.3 },
  deityEmoji: { fontSize: 68, textShadowColor: '#061B35', textShadowRadius: 12 },
  deityBolt: { position: 'absolute', right: 3, top: 8, color: '#FFF27D', fontSize: 42, fontWeight: '900', textShadowColor: '#2BAAFF', textShadowRadius: 12 },
  heroLightningLeft: { position: 'absolute', left: 5, top: '36%', color: '#FFF16E', fontSize: 48, textShadowColor: '#238DFF', textShadowRadius: 15 },
  heroPillarLeft: { position: 'absolute', left: 2, bottom: 7, width: 13, height: 55, backgroundColor: '#B68A43', borderWidth: 1, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center' },
  heroPillarRight: { position: 'absolute', right: 2, bottom: 7, width: 13, height: 55, backgroundColor: '#B68A43', borderWidth: 1, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center' },
  pillarGlyph: { color: '#173451', fontSize: 13 },
  totalWin: { position: 'absolute', bottom: 23, left: 5, right: 5, height: 30, backgroundColor: '#07182A', borderWidth: 1.5, borderColor: '#F4CB52', borderRadius: 6, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  totalWinLabel: { color: '#FFE7A2', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  totalWinValue: { color: '#FFF5C9', fontSize: 14, fontWeight: '900', lineHeight: 15 },
  freeSpinRibbon: { position: 'absolute', bottom: 3, left: 5, right: 5, height: 16, borderRadius: 8, backgroundColor: '#102B49', borderWidth: 1, borderColor: '#D8A83F', alignItems: 'center', justifyContent: 'center' },
  freeSpinText: { color: C.gold, fontSize: 6, fontWeight: '900', letterSpacing: 0.6 },
  boardFrame: { flex: 1, marginHorizontal: 0, marginTop: 0, paddingHorizontal: 3, paddingBottom: 3, backgroundColor: '#0B2541', borderWidth: 3, borderColor: '#E5B63F', borderRadius: 10, shadowColor: '#42B7FF', shadowOpacity: 0.35, shadowRadius: 8, elevation: 9 },
  boardTopTrim: { height: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#A9772F' },
  boardTitle: { color: '#FFE9A5', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  boardCount: { position: 'absolute', right: 4, color: '#E9C66C', fontSize: 7, fontWeight: '900' },
  board: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', backgroundColor: '#07182D', paddingVertical: 2 },
  cell: { margin: 1, borderRadius: 6, backgroundColor: '#12365A', borderWidth: 1, borderColor: '#B8893C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cellTop: { position: 'absolute', top: 0, left: 2, right: 2, height: 2, backgroundColor: '#F8D98B', opacity: 0.8 },
  symbol: { color: '#FFE39A', fontWeight: '900', textShadowColor: '#3CAEFF', textShadowRadius: 6 },
  boardBottomTrim: { height: 18, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#A9772F' },
  scatterText: { color: '#FFE5A0', fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  controls: { width: '21%', minWidth: 102, marginHorizontal: 0, marginTop: 0, paddingHorizontal: 5, paddingTop: 7, paddingBottom: 5, backgroundColor: '#0B2038', borderWidth: 1.5, borderColor: '#C18B37', borderRadius: 9, justifyContent: 'space-between' },
  controlTop: { flex: 1, flexDirection: 'column', minHeight: 0, alignItems: 'center', justifyContent: 'space-evenly' },
  roundUtility: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#173B5C', borderWidth: 1.5, borderColor: '#EAC25E', alignItems: 'center', justifyContent: 'center' },
  utilityGlyph: { color: '#FFE7A4', fontSize: 17 },
  betPanel: { width: '100%', alignItems: 'center' },
  controlLabel: { color: '#E8C77F', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  betRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  betAdjust: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#20486A', borderWidth: 1, borderColor: '#F4D26D', alignItems: 'center', justifyContent: 'center' },
  adjustText: { color: '#FFF1C4', fontSize: 18, lineHeight: 20, fontWeight: '900' },
  betValue: { minWidth: 38, textAlign: 'center', color: '#FFF0B3', fontSize: 10, fontWeight: '900' },
  goldButton: { backgroundColor: '#F0C34D', borderWidth: 2, borderColor: '#FFF0A5', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC844', shadowOpacity: 0.6, shadowRadius: 7, elevation: 7 },
  spinButton: { width: 66, height: 66, borderRadius: 33, marginHorizontal: 0, borderWidth: 3, borderColor: '#FFF0A5' },
  spinArrow: { color: '#173451', fontSize: 31, lineHeight: 33, fontWeight: '900' },
  spinText: { color: '#173451', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  autoButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#20486A', borderWidth: 1.5, borderColor: '#EAC25E', alignItems: 'center', justifyContent: 'center' },
  autoGlyph: { color: '#FFE6A1', fontSize: 14 },
  autoText: { color: '#FCE6AD', fontSize: 6, fontWeight: '900' },
  balanceRow: { minHeight: 34, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', marginTop: 3, gap: 3 },
  stat: { minWidth: 0, backgroundColor: '#07182A', borderWidth: 1, borderColor: '#C58D39', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 5, alignItems: 'center' },
  statWide: { flex: 1 },
  statLabel: { color: '#E9C77B', fontSize: 6, fontWeight: '900', letterSpacing: 0.8 },
  statValue: { color: '#FFF4D0', fontSize: 10, fontWeight: '900', marginTop: 1 },
  previewLabel: { color: '#C7A879', fontSize: 6, fontWeight: '900', letterSpacing: 0.6, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 4, borderTopWidth: 1, borderTopColor: '#76502F', marginTop: 3 },
  linkText: { color: '#EED18A', fontSize: 7, fontWeight: '900', letterSpacing: 0.5, paddingHorizontal: 3, paddingVertical: 2 },
  linkDot: { color: '#A97A3E', fontSize: 8 },
  infoPanel: { margin: 10, padding: 16, minHeight: 250, backgroundColor: '#0B2541', borderWidth: 2, borderColor: '#C58D39', borderRadius: 12 },
  infoEyebrow: { color: C.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  infoTitle: { color: C.white, fontSize: 20, fontWeight: '900', marginTop: 4, marginBottom: 14 },
  rule: { color: '#F6E8D0', fontSize: 11, lineHeight: 18, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#284D70' },
  emptyCopy: { color: '#C3D7E9', fontSize: 11, lineHeight: 18, marginTop: 15 },
  backToGame: { alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  backToGameText: { color: '#173451', fontSize: 10, fontWeight: '900' },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  settingsBox: { width: '100%', backgroundColor: '#0B2541', borderWidth: 2, borderColor: '#D4A64A', borderRadius: 14, padding: 17 },
  settingsEyebrow: { color: C.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  settingsTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 4, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#284D70' },
  settingName: { color: C.white, fontSize: 12, fontWeight: '700' },
  settingValue: { color: C.gold, fontSize: 10, fontWeight: '900' },
  closeSettings: { alignItems: 'center', marginTop: 15, padding: 11, backgroundColor: '#F0C34D', borderRadius: 8 },
  closeSettingsText: { color: '#173451', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
