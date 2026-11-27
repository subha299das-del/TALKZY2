import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert,
  Dimensions, StyleSheet
} from 'react-native';

const C = {
  bg: '#070B16',
  surface: '#10182A',
  surface2: '#151F36',
  tile: '#111D32',
  cyan: '#56DFFF',
  blue: '#278BFF',
  violet: '#9A72FF',
  gold: '#F6D47B',
  white: '#F4F7FF',
  muted: '#8D9CB8',
  line: '#263B5C',
};

const SYMBOLS = ['💎', '🔱', '⚡', '👑', '🟣', '🔷', '🔺', '🪙', '🟡', '🟢'];

function ThunderCrest({ size = 42 }) {
  return (
    <View style={[styles.crest, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Text style={{ fontSize: size * 0.56 }}>👑</Text>
      <Text style={[styles.crestBolt, { fontSize: size * 0.38 }]}>ϟ</Text>
    </View>
  );
}

function HudCard({ label, value, accent = C.white }) {
  return (
    <View style={styles.hudCard}>
      <Text style={styles.hudLabel}>{label}</Text>
      <Text style={[styles.hudValue, { color: accent }]} numberOfLines={1}>{value}</Text>
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
  const cell = Math.max(34, Math.min(49, (width - 72) / 6));

  const showNotConnected = () => Alert.alert(
    'Thunder King',
    'This is the redesigned game display. The secure spin engine, gold-balance settlement and Founder-controlled outcome service are not connected yet.'
  );

  const infoTitle = view === 'rules' ? 'HOW TO PLAY' : view === 'ranking' ? 'STORM RANKING' : 'ROUND RECORDS';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <ThunderCrest size={43} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.brandEyebrow}>TALKZY GREEDY  /  GAME 02</Text>
                <Text style={styles.brandTitle}>THUNDER KING</Text>
                <Text style={styles.brandSub}>AWAKEN THE STORM</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          {view !== 'game' ? (
            <View style={styles.infoPanel}>
              <View style={styles.infoHeader}>
                <View>
                  <Text style={styles.infoEyebrow}>THUNDER KING</Text>
                  <Text style={styles.infoTitle}>{infoTitle}</Text>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => setView('game')}>
                  <Text style={styles.backText}>‹  GAME</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {view === 'rules' ? (
                  <View>
                    <Text style={styles.rule}>01  The reels use a 6-column × 5-row grid. Matching symbols can pay anywhere on the screen.</Text>
                    <Text style={styles.rule}>02  Winning symbols disappear. Remaining symbols tumble down and new symbols enter from above.</Text>
                    <Text style={styles.rule}>03  Cascades continue until no new winning combination appears. The round win is totalled after the tumble sequence.</Text>
                    <Text style={styles.rule}>04  4 or more Scatter symbols trigger 15 Free Spins.</Text>
                    <Text style={styles.rule}>05  Multipliers can accumulate during Free Spins and increase the total win.</Text>
                    <Text style={styles.rule}>06  The Founder controls the official paytable, probabilities, fees, game settings and winning outcomes.</Text>
                    <Text style={styles.rule}>07  Autoplay can be started from the game screen.</Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <ThunderCrest size={58} />
                    <Text style={styles.emptyTitle}>{view === 'ranking' ? 'RANKINGS NOT AVAILABLE' : 'NO COMPLETED ROUNDS YET'}</Text>
                    <Text style={styles.emptyCopy}>{view === 'ranking' ? 'Player rankings will appear when the secure game service is connected.' : 'Your verified round history will appear here after the game service is connected.'}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.stormBanner}>
                <View style={styles.bannerOrb} />
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerKicker}>THE ROYAL STORM</Text>
                  <Text style={styles.bannerHeadline}>RULE THE{ '\n' }THUNDER.</Text>
                  <Text style={styles.bannerCaption}>MATCH • TUMBLE • MULTIPLY</Text>
                </View>
                <View style={styles.bannerEmblem}>
                  <Text style={styles.bannerBolt}>ϟ</Text>
                  <ThunderCrest size={65} />
                  <Text style={styles.bannerCrownLine}>♛  THUNDER KING  ♛</Text>
                </View>
                <Text style={styles.bannerLightning}>ϟ</Text>
              </View>

              <View style={styles.utilityRow}>
                <View style={styles.liveTag}><View style={styles.liveDot} /><Text style={styles.liveText}>STORM ARENA</Text></View>
                <View style={styles.payTag}><Text style={styles.payTagText}>PAY ANYWHERE</Text></View>
                <Text style={styles.gridTag}>6 × 5</Text>
              </View>

              <View style={styles.hudRow}>
                <HudCard label="TOTAL WIN" value="0" accent={C.gold} />
                <HudCard label="MULTIPLIER" value="1×" accent={C.cyan} />
                <HudCard label="FREE SPINS" value={String(freeSpins)} accent={C.violet} />
                <HudCard label="BALANCE" value="—" accent={C.white} />
              </View>

              <View style={styles.boardOuter}>
                <View style={styles.boardHeader}>
                  <View style={styles.boardHeaderLeft}>
                    <View style={styles.miniBolt}><Text style={styles.miniBoltText}>ϟ</Text></View>
                    <Text style={styles.boardTitle}>THUNDER REELS</Text>
                  </View>
                  <Text style={styles.boardHint}>30 SYMBOLS</Text>
                </View>
                <View style={styles.board}>
                  {board.map((symbol, index) => (
                    <View key={index} style={[styles.cell, { width: cell, height: cell }]}>
                      <View style={styles.cellShine} />
                      <Text style={{ fontSize: Math.max(19, cell * 0.53) }}>{symbol}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.scatterBar}>
                  <Text style={styles.scatterIcon}>✦</Text>
                  <Text style={styles.scatterCopy}>4+ SCATTERS  <Text style={styles.scatterGold}>→  15 FREE SPINS</Text></Text>
                  <Text style={styles.scatterIcon}>✦</Text>
                </View>
              </View>

              <View style={styles.console}>
                <View style={styles.consoleTop}>
                  <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsOpen(true)}>
                    <Text style={styles.settingsGlyph}>⚙</Text>
                  </TouchableOpacity>
                  <View style={styles.betControl}>
                    <Text style={styles.consoleLabel}>TOTAL BET</Text>
                    <View style={styles.betLine}>
                      <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => Math.max(1, Math.floor(v / 2)))}>
                        <Text style={styles.adjustGlyph}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.betAmount}>{bet.toLocaleString('en-IN')}</Text>
                      <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => v * 2)}>
                        <Text style={styles.adjustGlyph}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.spinButton} onPress={showNotConnected}>
                    <View style={styles.spinInner}>
                      <Text style={styles.spinGlyph}>ϟ</Text>
                      <Text style={styles.spinLabel}>SPIN</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.autoButton} onPress={() => setAutoPlay(v => !v)}>
                    <Text style={[styles.autoGlyph, autoPlay && { color: '#FF8E9B' }]}>{autoPlay ? '■' : '↻'}</Text>
                    <Text style={styles.autoLabel}>{autoPlay ? 'STOP' : 'AUTO'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.consoleDivider} />
                <View style={styles.quickLinks}>
                  <TouchableOpacity onPress={() => setView('rules')}><Text style={styles.quickLink}>RULES</Text></TouchableOpacity>
                  <View style={styles.quickDot} />
                  <TouchableOpacity onPress={() => setView('records')}><Text style={styles.quickLink}>RECORDS</Text></TouchableOpacity>
                  <View style={styles.quickDot} />
                  <TouchableOpacity onPress={() => setView('ranking')}><Text style={styles.quickLink}>RANKING</Text></TouchableOpacity>
                  <Text style={styles.previewNote}>PREVIEW BUILD</Text>
                </View>
              </View>
            </ScrollView>
          )}

          <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
            <View style={styles.settingsBackdrop}>
              <View style={styles.settingsBox}>
                <Text style={styles.settingsEyebrow}>THUNDER KING</Text>
                <Text style={styles.infoTitle}>GAME SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow} onPress={() => setSoundOn(v => !v)}>
                  <Text style={styles.settingName}>Sound effects</Text>
                  <Text style={styles.settingValue}>{soundOn ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingRow} onPress={() => { setSettingsOpen(false); setView('rules'); }}>
                  <Text style={styles.settingName}>Game rules</Text>
                  <Text style={styles.settingValue}>OPEN  ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitButton} onPress={() => { setSettingsOpen(false); onClose(); }}>
                  <Text style={styles.exitText}>EXIT GAME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dismissButton} onPress={() => setSettingsOpen(false)}>
                  <Text style={styles.backText}>CLOSE SETTINGS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(1,4,12,0.94)', justifyContent: 'center', paddingHorizontal: 7, paddingVertical: 16 },
  shell: { maxHeight: '97%', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#315D8C', backgroundColor: C.bg, elevation: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, paddingVertical: 11, backgroundColor: '#0B1426', borderBottomWidth: 1, borderBottomColor: '#203A5B' },
  brand: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  crest: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#172D4C', borderWidth: 1.5, borderColor: C.gold, shadowColor: C.cyan, shadowOpacity: 0.8, shadowRadius: 10, elevation: 9 },
  crestBolt: { position: 'absolute', right: -5, top: -7, color: C.cyan, fontWeight: '900', textShadowColor: C.blue, textShadowRadius: 8 },
  brandEyebrow: { color: C.cyan, fontSize: 7, fontWeight: '900', letterSpacing: 1.4 },
  brandTitle: { color: C.white, fontSize: 16, fontWeight: '900', letterSpacing: 1.8, marginTop: 1 },
  brandSub: { color: C.muted, fontSize: 7, fontWeight: '800', letterSpacing: 1.8, marginTop: 2 },
  closeButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#17243A', borderWidth: 1, borderColor: '#355477', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: C.white, fontSize: 25, lineHeight: 27 },
  scrollContent: { paddingBottom: 10 },
  stormBanner: { minHeight: 137, marginHorizontal: 9, marginTop: 10, borderRadius: 17, overflow: 'hidden', backgroundColor: '#111E39', borderWidth: 1, borderColor: '#426D9C', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  bannerOrb: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: 10, top: -25, backgroundColor: '#293F7C', opacity: 0.5 },
  bannerLeft: { flex: 1, zIndex: 1 },
  bannerKicker: { color: C.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  bannerHeadline: { color: C.white, fontSize: 25, lineHeight: 25, fontWeight: '900', letterSpacing: 1, marginTop: 5, textShadowColor: '#236BC0', textShadowRadius: 10 },
  bannerCaption: { color: '#A8B9D5', fontSize: 7, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  bannerEmblem: { width: 122, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  bannerBolt: { position: 'absolute', color: '#5DDFFF', fontSize: 105, fontWeight: '900', opacity: 0.18 },
  bannerCrownLine: { color: C.gold, fontSize: 6, fontWeight: '900', letterSpacing: 1, marginTop: 5 },
  bannerLightning: { position: 'absolute', left: '48%', top: 4, color: C.cyan, fontSize: 35, opacity: 0.25 },
  utilityRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginTop: 9 },
  liveTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#102C38', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4BE5C2', marginRight: 5 },
  liveText: { color: '#8DF4E2', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  payTag: { marginLeft: 6, backgroundColor: '#17233A', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5 },
  payTagText: { color: '#A7C7F7', fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  gridTag: { marginLeft: 'auto', color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  hudRow: { flexDirection: 'row', marginHorizontal: 9, marginTop: 8 },
  hudCard: { flex: 1, minWidth: 0, backgroundColor: C.surface, borderRadius: 9, borderWidth: 1, borderColor: C.line, paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center', marginHorizontal: 2 },
  hudLabel: { color: C.muted, fontSize: 6, fontWeight: '900', letterSpacing: 0.4 },
  hudValue: { fontSize: 13, fontWeight: '900', marginTop: 3 },
  boardOuter: { marginHorizontal: 9, marginTop: 9, padding: 8, borderRadius: 15, backgroundColor: '#0D1729', borderWidth: 1.5, borderColor: '#2E6694', shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: 9, elevation: 8 },
  boardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  boardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  miniBolt: { width: 17, height: 17, borderRadius: 5, backgroundColor: '#143C5A', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  miniBoltText: { color: C.cyan, fontSize: 14, fontWeight: '900' },
  boardTitle: { color: C.white, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  boardHint: { color: '#7793B8', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cell: { backgroundColor: '#14223A', borderRadius: 8, borderWidth: 1, borderColor: '#29486B', alignItems: 'center', justifyContent: 'center', margin: 1.5, overflow: 'hidden', shadowColor: C.cyan, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  cellShine: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: '#4A9FC4', opacity: 0.35 },
  scatterBar: { marginTop: 7, borderRadius: 7, backgroundColor: '#172A3E', borderWidth: 1, borderColor: '#31546C', paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scatterIcon: { color: C.cyan, fontSize: 10, marginHorizontal: 8 },
  scatterCopy: { color: '#C9D9EC', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  scatterGold: { color: C.gold },
  console: { marginHorizontal: 9, marginTop: 9, paddingHorizontal: 9, paddingTop: 9, paddingBottom: 7, borderRadius: 14, backgroundColor: '#101A2C', borderWidth: 1, borderColor: '#2B486B' },
  consoleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsButton: { width: 33, height: 38, borderRadius: 9, backgroundColor: '#1A2A42', borderWidth: 1, borderColor: '#385879', alignItems: 'center', justifyContent: 'center' },
  settingsGlyph: { color: C.cyan, fontSize: 19 },
  betControl: { flex: 1, alignItems: 'center', marginHorizontal: 5 },
  consoleLabel: { color: C.muted, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  betLine: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  betAdjust: { width: 22, height: 22, borderRadius: 7, backgroundColor: '#203B5B', borderWidth: 1, borderColor: '#4D8AB8', alignItems: 'center', justifyContent: 'center' },
  adjustGlyph: { color: C.white, fontSize: 17, lineHeight: 20, fontWeight: '900' },
  betAmount: { color: C.gold, fontSize: 12, fontWeight: '900', minWidth: 48, textAlign: 'center', marginHorizontal: 4 },
  spinButton: { width: 66, height: 66, borderRadius: 33, padding: 4, backgroundColor: '#287FC0', borderWidth: 1.5, borderColor: '#7DEAFF', alignItems: 'center', justifyContent: 'center', shadowColor: C.cyan, shadowOpacity: 0.85, shadowRadius: 12, elevation: 12 },
  spinInner: { flex: 1, width: '100%', borderRadius: 28, backgroundColor: '#153C62', alignItems: 'center', justifyContent: 'center' },
  spinGlyph: { color: C.cyan, fontSize: 24, lineHeight: 25, fontWeight: '900' },
  spinLabel: { color: C.white, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  autoButton: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#1B2940', borderWidth: 1, borderColor: '#385675', alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  autoGlyph: { color: C.cyan, fontSize: 19, fontWeight: '900' },
  autoLabel: { color: '#B6C7DC', fontSize: 6, fontWeight: '900', marginTop: 1 },
  consoleDivider: { height: 1, backgroundColor: '#263A55', marginTop: 8, marginBottom: 7 },
  quickLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  quickLink: { color: '#8FAFD2', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, paddingHorizontal: 5, paddingVertical: 3 },
  quickDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#4D7197' },
  previewNote: { marginLeft: 'auto', color: '#667B99', fontSize: 6, fontWeight: '900' },
  infoPanel: { backgroundColor: C.surface, margin: 10, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: '#315D8C', minHeight: 250, maxHeight: 480 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  infoEyebrow: { color: C.cyan, fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  infoTitle: { color: C.white, fontSize: 17, fontWeight: '900', letterSpacing: 1, marginTop: 3 },
  backButton: { borderWidth: 1, borderColor: '#3A638B', backgroundColor: '#172A42', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  backText: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  rule: { color: '#D6E0EF', fontSize: 11, lineHeight: 19, marginBottom: 12, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: '#233A56' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 35, paddingHorizontal: 12 },
  emptyTitle: { color: C.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 14, textAlign: 'center' },
  emptyCopy: { color: C.muted, fontSize: 10, lineHeight: 17, textAlign: 'center', marginTop: 8 },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  settingsBox: { width: '100%', backgroundColor: '#101A2C', borderRadius: 16, borderWidth: 1.5, borderColor: '#3C719C', padding: 17 },
  settingsEyebrow: { color: C.cyan, fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#293D58', paddingVertical: 13 },
  settingName: { color: C.white, fontSize: 11, fontWeight: '700' },
  settingValue: { color: C.gold, fontSize: 10, fontWeight: '900' },
  exitButton: { backgroundColor: '#402738', borderRadius: 9, alignItems: 'center', padding: 11, marginTop: 16 },
  exitText: { color: '#FFB7C2', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  dismissButton: { alignItems: 'center', paddingTop: 13 },
});
