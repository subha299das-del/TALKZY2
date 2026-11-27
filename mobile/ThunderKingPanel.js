import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert, ImageBackground,
  useWindowDimensions, StyleSheet, Animated, Easing,
} from 'react-native';

const PALETTE = {
  night: '#10091F', deep: '#1B1033', purple: '#32164F',
  violet: '#6D35A0', gold: '#F5D477', goldDeep: '#A96D22',
  cream: '#FFF2C8', white: '#FFF9E9', muted: '#B9A9C9',
  blue: '#62C8FF', red: '#B92745',
};

const DIVINE_SYMBOLS = [
  { mark: '♛', name: 'IMPERIAL CROWN', tint: '#F5D477' },
  { mark: '⚡', name: 'STORM TRIDENT', tint: '#9BE7FF' },
  { mark: 'ϟ', name: 'THUNDER SIGIL', tint: '#FFE17A' },
  { mark: '♜', name: 'CELESTIAL EAGLE', tint: '#F8D88A' },
  { mark: '⬡', name: 'GUARDIAN SHIELD', tint: '#9DDCFF' },
  { mark: '⚒', name: 'ZEUS HAMMER', tint: '#F7D17A' },
  { mark: '♥', name: 'DIVINE HEARTSTONE', tint: '#FF809B' },
  { mark: '◉', name: 'IMMORTAL MEDALLION', tint: '#A9DFFF' },
];

function GoldButton({ children, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} style={[styles.goldButton, style]}>
      {children}
    </TouchableOpacity>
  );
}

function SymbolTile({ symbol, size, index }) {
  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <View style={styles.tileTopLine} />
      <View style={styles.tileInner}>
        <Text style={[styles.tileMark, { color: symbol.tint, fontSize: size * 0.55 }]}>{symbol.mark}</Text>
        <View style={styles.tileGem} />
      </View>
      <View style={styles.tileCornerTL} />
      <View style={styles.tileCornerBR} />
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function ThunderKingPanel({ visible, onClose, api }) {
  const [bet, setBet] = useState(100);
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState('game');
  const [artwork, setArtwork] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const reelAnimations = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const { width, height } = useWindowDimensions();
  const landscape = width >= height;
  const tileSize = Math.max(30, Math.min(landscape ? 66 : 48, Math.min(width, height) * (landscape ? 0.12 : 0.105)));
  const board = useMemo(() => Array.from({ length: 30 }, (_, i) => DIVINE_SYMBOLS[(i * 5 + Math.floor(i / 6) * 3) % DIVINE_SYMBOLS.length]), []);

  React.useEffect(() => {
    if (!visible || !api) return undefined;
    let active = true;
    api('/api/config').then(config => {
      if (active) setArtwork(config?.gameArtwork?.['thunder-king'] || null);
    }).catch(() => {});
    return () => { active = false; };
  }, [visible, api]);

  const previewOnly = () => {
    if (spinning) return;
    setSpinning(true);
    reelAnimations.forEach(value => value.setValue(0));
    Animated.parallel(reelAnimations.map((value, index) => Animated.sequence([
      Animated.delay(index * 135),
      Animated.timing(value, {
        toValue: -tileSize * 0.72,
        duration: 360 + index * 35,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.spring(value, {
        toValue: 0,
        speed: 18,
        bounciness: 8,
        useNativeDriver: true
      })
    ]))).start(() => {
      setSpinning(false);
      Alert.alert(
        'Thunder King design preview',
        'The six-reel stop animation is a visual preview only. Real spins, cascade results, free-spin awards and gold settlement must come from the secure TALKZY game service.'
      );
    });
  };

  const title = view === 'rules' ? 'THE DIVINE RULES' : view === 'ranking' ? 'STORM LEGENDS' : 'ROUND CHRONICLES';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.shell, !landscape && styles.portraitShell]}>
          <View style={styles.topBar}>
            <View style={styles.brandCrest}><Text style={styles.brandCrestMark}>♛</Text></View>
            <View style={styles.brandCopy}>
              <Text style={styles.gameTitle}>THUNDER KING</Text>
              <Text style={styles.gameSubtitle}>THE TEMPLE OF IMMORTALS  •  TALKZY GREEDY</Text>
            </View>
            <View style={styles.jackpot}>
              <Text style={styles.jackpotLabel}>GRAND JACKPOT</Text>
              <Text style={styles.jackpotValue}>NOT CONNECTED</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></TouchableOpacity>
          </View>

          {view === 'game' ? (
            <ImageBackground source={artwork?.main?.url ? { uri: artwork.main.url } : undefined} resizeMode="cover" imageStyle={styles.stageArtwork} style={styles.stageScroll}>
            <ScrollView style={styles.stageScrollInner} contentContainerStyle={[styles.stage, !landscape && styles.portraitStage]} scrollEnabled={!landscape} showsVerticalScrollIndicator={false}>
              <View style={[styles.zeusPanel, !landscape && styles.portraitZeusPanel]}>
                <View style={styles.stormAura} />
                <Text style={styles.templeCaption}>THE GOD OF THUNDER</Text>
                <View style={styles.laurel}><Text style={styles.laurelText}>✦  ⚡  ✦</Text></View>
                <View style={styles.zeusHalo}><View style={styles.haloCore} /></View>
                <View style={styles.zeusFigure}>
                  <View style={styles.zeusCrown}><Text style={styles.zeusCrownText}>♛</Text></View>
                  <View style={styles.zeusHead}><View style={styles.zeusBrow} /><View style={styles.zeusBeard}><View style={styles.beardPoint} /></View></View>
                  <View style={styles.zeusShoulders}><View style={styles.zeusArmor}><Text style={styles.armorMark}>ϟ</Text></View></View>
                  <View style={styles.zeusCape} />
                </View>
                <Text style={styles.lightningLeft}>ϟ</Text>
                <Text style={styles.lightningRight}>ϟ</Text>
                <View style={styles.zeusTitlePlate}>
                  <Text style={styles.zeusName}>ZEUS</Text>
                  <Text style={styles.zeusTagline}>MASTER OF THE STORM</Text>
                </View>
                <View style={styles.totalWinPlate}>
                  <Text style={styles.totalWinLabel}>TOTAL WIN</Text>
                  <Text style={styles.totalWinValue}>—</Text>
                </View>
                <View style={styles.freeSpins}><Text style={styles.freeSpinsText}>0  FREE SPINS</Text></View>
              </View>

              <View style={[styles.reelColumn, !landscape && styles.portraitReelColumn]}>
                <View style={styles.reelHeading}>
                  <Text style={styles.reelHeadingText}>✦  DIVINE REELS  ✦</Text>
                  <Text style={styles.reelCount}>6 REELS  /  5 ROWS</Text>
                </View>
                <View style={styles.reelFrame}>
                  <View style={styles.reelBoard}>
                    {board.map((symbol, index) => (
                      <Animated.View key={index} style={{ transform: [{ translateY: reelAnimations[index % 6] }] }}>
                        <SymbolTile symbol={symbol} size={tileSize} index={index} />
                      </Animated.View>
                    ))}
                  </View>
                </View>
                <View style={styles.reelFooter}>
                  <Text style={styles.reelFooterText}>4+ SCATTERS  •  AWAKEN 15 FREE SPINS</Text>
                </View>
              </View>

              <View style={[styles.controlPanel, !landscape && styles.portraitControlPanel]}>
                <View style={styles.controlTopLine}>
                  <Text style={styles.controlPanelTitle}>DIVINE CONTROL</Text>
                  <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.settingsButton}><Text style={styles.settingsGlyph}>⚙</Text></TouchableOpacity>
                </View>
                <View style={styles.betCard}>
                  <Text style={styles.controlLabel}>TOTAL BET</Text>
                  <View style={styles.betAdjustRow}>
                    <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => Math.max(1, Math.floor(v / 2)))}><Text style={styles.adjustText}>−</Text></TouchableOpacity>
                    <Text style={styles.betValue}>{bet.toLocaleString('en-IN')}</Text>
                    <TouchableOpacity style={styles.betAdjust} onPress={() => setBet(v => v * 2)}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
                  </View>
                </View>
                <GoldButton onPress={previewOnly} style={[styles.spinButton, spinning && styles.spinButtonActive]}>
                  <Text style={styles.spinGlyph}>{spinning ? '⚡' : '⟳'}</Text><Text style={styles.spinText}>{spinning ? 'SPINNING' : 'SPIN'}</Text>
                </GoldButton>
                <TouchableOpacity onPress={previewOnly} disabled={spinning} style={[styles.autoButton, spinning && styles.autoButtonActive]}>
                  <Text style={styles.autoGlyph}>▶</Text><Text style={styles.autoText}>AUTO PREVIEW</Text>
                </TouchableOpacity>
                <View style={styles.balanceCard}>
                  <Stat label="TOTAL BET" value={bet.toLocaleString('en-IN')} />
                  <Stat label="GOLD BALANCE" value="—" />
                </View>
                <View style={styles.controlLinks}>
                  <TouchableOpacity onPress={() => setView('rules')}><Text style={styles.linkText}>RULES</Text></TouchableOpacity>
                  <Text style={styles.linkDot}>•</Text>
                  <TouchableOpacity onPress={() => setView('records')}><Text style={styles.linkText}>HISTORY</Text></TouchableOpacity>
                  <Text style={styles.linkDot}>•</Text>
                  <TouchableOpacity onPress={() => setView('ranking')}><Text style={styles.linkText}>RANK</Text></TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            </ImageBackground>
          ) : (
            <ScrollView style={styles.infoScroll} contentContainerStyle={styles.infoPanel}>
              <Text style={styles.infoEyebrow}>TALKZY  •  THUNDER KING</Text>
              <Text style={styles.infoTitle}>{title}</Text>
              {view === 'rules' ? (
                <>
                  <Text style={styles.rule}>01  Six reels and five rows form the divine 6 × 5 grid.</Text>
                  <Text style={styles.rule}>02  Winning combinations trigger cascading symbols.</Text>
                  <Text style={styles.rule}>03  Cascades continue until no further win is formed.</Text>
                  <Text style={styles.rule}>04  Four or more Scatter symbols awaken 15 Free Spins.</Text>
                  <Text style={styles.rule}>05  Free-spin multipliers can increase the final reward.</Text>
                  <Text style={styles.rule}>06  The Founder controls official fees, paytable, probabilities and outcomes.</Text>
                </>
              ) : view === 'ranking' ? (
                <>
                  <View style={styles.infoFeatureCard}>
                    <Text style={styles.infoFeatureGlyph}>♛</Text>
                    <Text style={styles.infoFeatureTitle}>STORM LEGENDS LEADERBOARD</Text>
                    <Text style={styles.infoFeatureCopy}>The champions of the Temple of Immortals</Text>
                  </View>
                  <View style={styles.infoMetricRow}>
                    <View style={styles.infoMetric}><Text style={styles.infoMetricLabel}>TOP PLAYER</Text><Text style={styles.infoMetricValue}>—</Text></View>
                    <View style={styles.infoMetric}><Text style={styles.infoMetricLabel}>TOP WIN</Text><Text style={styles.infoMetricValue}>—</Text></View>
                    <View style={styles.infoMetric}><Text style={styles.infoMetricLabel}>SEASON</Text><Text style={styles.infoMetricValue}>—</Text></View>
                  </View>
                  <Text style={styles.emptyCopy}>Verified rankings will appear here after the secure Thunder King game service is connected.</Text>
                </>
              ) : (
                <>
                  <View style={styles.infoFeatureCard}>
                    <Text style={styles.infoFeatureGlyph}>⚡</Text>
                    <Text style={styles.infoFeatureTitle}>ROUND CHRONICLES</Text>
                    <Text style={styles.infoFeatureCopy}>Your recent storms and divine rewards</Text>
                  </View>
                  <View style={styles.historyPlaceholder}>
                    <Text style={styles.historyPlaceholderGlyph}>◷</Text>
                    <Text style={styles.historyPlaceholderTitle}>NO VERIFIED ROUNDS YET</Text>
                    <Text style={styles.historyPlaceholderCopy}>Your completed rounds, cascades and payouts will be listed here.</Text>
                  </View>
                </>
              )}
              <GoldButton onPress={() => setView('game')} style={styles.backToGame}><Text style={styles.backToGameText}>‹  RETURN TO THE TEMPLE</Text></GoldButton>
            </ScrollView>
          )}

          <View style={styles.bottomBar}>
            <Text style={styles.bottomLeft}>TALKZY  •  PLAY WITH DIVINE POWER</Text>
            <Text style={styles.bottomRight}>THE TEMPLE OF IMMORTALS</Text>
          </View>

          <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
            <View style={styles.settingsBackdrop}>
              <View style={styles.settingsBox}>
                <Text style={styles.settingsEyebrow}>THUNDER KING</Text>
                <Text style={styles.settingsTitle}>DIVINE SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow} onPress={() => setSoundOn(v => !v)}>
                  <Text style={styles.settingName}>Sound effects</Text><Text style={styles.settingValue}>{soundOn ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingRow} onPress={() => { setSettingsOpen(false); setView('rules'); }}>
                  <Text style={styles.settingName}>Divine rules</Text><Text style={styles.settingValue}>OPEN  ›</Text>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(5,2,12,0.97)', justifyContent: 'center', alignItems: 'center' },
  shell: { flex: 1, width: '100%', backgroundColor: PALETTE.night, borderWidth: 2, borderColor: PALETTE.goldDeep, overflow: 'hidden' },
  portraitShell: { maxHeight: '100%' },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: '#160D27', borderBottomWidth: 1, borderBottomColor: PALETTE.goldDeep },
  brandCrest: { width: 34, height: 34, borderRadius: 9, borderWidth: 2, borderColor: PALETTE.cream, backgroundColor: '#9D6B25', alignItems: 'center', justifyContent: 'center' },
  brandCrestMark: { color: '#24142F', fontSize: 23, fontWeight: '900' },
  brandCopy: { flex: 1, marginLeft: 9 },
  gameTitle: { color: PALETTE.cream, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  gameSubtitle: { color: '#C7A7DB', fontSize: 7, fontWeight: '800', letterSpacing: 1.2, marginTop: 2 },
  jackpot: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#A77835', borderRadius: 7, backgroundColor: '#28143C', marginRight: 10 },
  jackpotLabel: { color: '#DDBB75', fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  jackpotValue: { color: PALETTE.gold, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  closeButton: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#A77835', alignItems: 'center', justifyContent: 'center', backgroundColor: '#29153D' },
  closeText: { color: PALETTE.cream, fontSize: 23, lineHeight: 25 },
  stageScroll: { flex: 1, backgroundColor: '#10091F' },
  stageScrollInner: { flex: 1, backgroundColor: 'rgba(16,9,31,0.28)' },
  stageArtwork: { opacity: 0.34 },
  stage: { flexGrow: 1, flexDirection: 'row', padding: 7, gap: 7, minHeight: 250, backgroundColor: 'transparent' },
  portraitStage: { flexDirection: 'column', alignItems: 'stretch', padding: 9, gap: 9 },
  portraitZeusPanel: { width: '100%', minWidth: 0, height: 255 },
  portraitReelColumn: { flex: 0, width: '100%', minWidth: 0, height: 390 },
  portraitControlPanel: { width: '100%', minWidth: 0, minHeight: 270, padding: 12 },
  zeusPanel: { width: '25%', minWidth: 125, borderWidth: 2, borderColor: '#D5A74B', borderRadius: 10, overflow: 'hidden', backgroundColor: '#26113D', alignItems: 'center', justifyContent: 'flex-start' },
  stormAura: { ...StyleSheet.absoluteFillObject, backgroundColor: '#45236B', opacity: 0.8 },
  templeCaption: { color: '#F9DFA0', fontSize: 7, fontWeight: '900', letterSpacing: 1.5, marginTop: 9, zIndex: 3 },
  laurel: { position: 'absolute', top: 28, left: 0, right: 0, alignItems: 'center' },
  laurelText: { color: '#D9B55E', fontSize: 20, letterSpacing: 8 },
  zeusHalo: { position: 'absolute', top: '16%', width: 130, height: 130, borderRadius: 65, borderWidth: 5, borderColor: '#F1D27C', backgroundColor: 'rgba(117,75,157,0.45)', alignItems: 'center', justifyContent: 'center', shadowColor: '#8BD8FF', shadowOpacity: 0.8, shadowRadius: 20, elevation: 12 },
  haloCore: { width: 95, height: 95, borderRadius: 48, borderWidth: 2, borderColor: '#FFF1B9', backgroundColor: 'rgba(97,60,133,0.5)' },
  zeusFigure: { position: 'absolute', top: '24%', width: '90%', height: '54%', alignItems: 'center', justifyContent: 'flex-start' },
  zeusCrown: { width: 72, height: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: '#E5B84D', borderWidth: 2, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center', zIndex: 4 },
  zeusCrownText: { color: '#482B4E', fontSize: 21, lineHeight: 22, fontWeight: '900' },
  zeusHead: { width: 65, height: 75, backgroundColor: '#D8A477', borderRadius: 30, borderWidth: 2, borderColor: '#F9D7A4', alignItems: 'center', marginTop: -2, zIndex: 3 },
  zeusBrow: { width: 48, height: 12, marginTop: 17, borderTopWidth: 5, borderColor: '#6A3D35', borderRadius: 8 },
  zeusBeard: { position: 'absolute', bottom: -17, width: 55, height: 45, backgroundColor: '#E5E1D6', borderBottomLeftRadius: 26, borderBottomRightRadius: 26, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 2, borderColor: '#B9B1A4', zIndex: 5 },
  beardPoint: { position: 'absolute', bottom: -13, left: 17, width: 18, height: 22, backgroundColor: '#E5E1D6', transform: [{ rotate: '45deg' }], borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#B9B1A4' },
  zeusShoulders: { width: 120, height: 82, marginTop: 3, backgroundColor: '#D8A84C', borderTopLeftRadius: 50, borderTopRightRadius: 50, borderWidth: 3, borderColor: '#FFF0B4', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  zeusArmor: { width: 68, height: 58, backgroundColor: '#684184', borderWidth: 2, borderColor: '#F4D47D', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  armorMark: { color: '#FFE58A', fontSize: 39, fontWeight: '900' },
  zeusCape: { position: 'absolute', bottom: 0, width: 142, height: 44, backgroundColor: '#54204B', borderTopLeftRadius: 50, borderTopRightRadius: 50, borderWidth: 2, borderColor: '#C58C49' },
  lightningLeft: { position: 'absolute', left: 4, top: '38%', color: '#A5E8FF', fontSize: 48, fontWeight: '900', textShadowColor: '#42BFFF', textShadowRadius: 15 },
  lightningRight: { position: 'absolute', right: 4, top: '43%', color: '#FFE27A', fontSize: 42, fontWeight: '900', textShadowColor: '#42BFFF', textShadowRadius: 15 },
  zeusTitlePlate: { position: 'absolute', left: 6, right: 6, bottom: 55, alignItems: 'center', paddingVertical: 5, backgroundColor: 'rgba(17,8,29,0.88)', borderWidth: 1, borderColor: '#D9B45B', borderRadius: 6 },
  zeusName: { color: '#FFE9A8', fontSize: 17, fontWeight: '900', letterSpacing: 4 },
  zeusTagline: { color: '#B8DFFF', fontSize: 6, fontWeight: '900', letterSpacing: 1.2 },
  totalWinPlate: { position: 'absolute', left: 7, right: 7, bottom: 22, height: 30, backgroundColor: '#160B25', borderWidth: 1.5, borderColor: '#F2D17A', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  totalWinLabel: { color: '#DDBE7A', fontSize: 6, fontWeight: '900', letterSpacing: 1.5 },
  totalWinValue: { color: '#FFF3C7', fontSize: 14, fontWeight: '900', lineHeight: 15 },
  freeSpins: { position: 'absolute', bottom: 3, left: 7, right: 7, height: 15, borderRadius: 8, backgroundColor: '#48235D', borderWidth: 1, borderColor: '#D7AC5A', alignItems: 'center', justifyContent: 'center' },
  freeSpinsText: { color: '#FFE8A3', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  reelColumn: { flex: 1, minWidth: 0, borderWidth: 2, borderColor: '#D7A94C', borderRadius: 10, padding: 4, backgroundColor: '#241239', justifyContent: 'space-between' },
  reelHeading: { height: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#9B713C' },
  reelHeadingText: { color: '#FFE9AC', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  reelCount: { position: 'absolute', right: 4, color: '#D8B978', fontSize: 6, fontWeight: '900' },
  reelFrame: { flex: 1, marginVertical: 3, borderWidth: 2, borderColor: '#A87935', borderRadius: 7, padding: 3, backgroundColor: '#10091E', justifyContent: 'center' },
  reelBoard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' },
  tile: { margin: 1, borderRadius: 5, borderWidth: 1.5, borderColor: '#D5AA5A', backgroundColor: '#392052', padding: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileTopLine: { position: 'absolute', top: 2, left: 4, right: 4, height: 2, backgroundColor: '#FFF0B4', opacity: 0.75 },
  tileInner: { flex: 1, width: '100%', borderWidth: 1, borderColor: 'rgba(255,226,155,0.28)', borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#241437' },
  tileMark: { fontWeight: '900', textShadowColor: '#F5C95E', textShadowRadius: 8, textAlign: 'center' },
  tileGem: { position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: '#8FE4FF', borderWidth: 1, borderColor: '#FFF5C8' },
  tileCornerTL: { position: 'absolute', top: 2, left: 2, width: 5, height: 5, borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#FFF1C0' },
  tileCornerBR: { position: 'absolute', bottom: 2, right: 2, width: 5, height: 5, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#FFF1C0' },
  reelFooter: { height: 17, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#9B713C' },
  reelFooterText: { color: '#EBD08C', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  controlPanel: { width: '20%', minWidth: 105, borderWidth: 1.5, borderColor: '#C99A49', borderRadius: 10, padding: 6, backgroundColor: '#1D1030', alignItems: 'center', justifyContent: 'space-between' },
  controlTopLine: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlPanelTitle: { color: '#EBD18E', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  settingsButton: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#D8B565', backgroundColor: '#39224E', alignItems: 'center', justifyContent: 'center' },
  settingsGlyph: { color: '#FFE6A2', fontSize: 15 },
  betCard: { width: '100%', alignItems: 'center', paddingVertical: 7, borderWidth: 1, borderColor: '#9D713C', borderRadius: 7, backgroundColor: '#11091E' },
  controlLabel: { color: '#D9B96F', fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  betAdjustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  betAdjust: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#E9CB7A', backgroundColor: '#4A2B60', alignItems: 'center', justifyContent: 'center' },
  adjustText: { color: '#FFF0BE', fontSize: 18, lineHeight: 20, fontWeight: '900' },
  betValue: { minWidth: 43, textAlign: 'center', color: '#FFF0BD', fontSize: 10, fontWeight: '900' },
  goldButton: { backgroundColor: '#E7B944', borderWidth: 2, borderColor: '#FFF0AD', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFD15A', shadowOpacity: 0.65, shadowRadius: 9, elevation: 9 },
  spinButton: { width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: '#FFF0AD' },
  spinButtonActive: { backgroundColor: '#A8E9FF', borderColor: '#FFFFFF' },
  spinGlyph: { color: '#351B48', fontSize: 32, lineHeight: 34, fontWeight: '900' },
  spinText: { color: '#351B48', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  autoButton: { width: '100%', minHeight: 33, borderRadius: 7, borderWidth: 1.5, borderColor: '#C49A54', backgroundColor: '#39234F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  autoButtonActive: { backgroundColor: '#614326', borderColor: '#FFE18B' },
  autoGlyph: { color: '#FFE5A1', fontSize: 12 },
  autoText: { color: '#FFE9B3', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  balanceCard: { width: '100%', gap: 4 },
  stat: { width: '100%', paddingVertical: 4, paddingHorizontal: 5, borderWidth: 1, borderColor: '#8E673B', borderRadius: 5, backgroundColor: '#11091E', alignItems: 'center' },
  statLabel: { color: '#CFAE6D', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  statValue: { color: '#FFF0C3', fontSize: 10, fontWeight: '900', marginTop: 1 },
  controlLinks: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#765536', paddingTop: 5 },
  linkText: { color: '#EAD18F', fontSize: 7, fontWeight: '900', paddingHorizontal: 3 },
  linkDot: { color: '#A67C46', fontSize: 7 },
  bottomBar: { height: 19, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#170D26', borderTopWidth: 1, borderTopColor: '#79572F' },
  bottomLeft: { color: '#BDA77C', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  bottomRight: { color: '#D9BB78', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  infoScroll: { flex: 1 },
  infoPanel: { padding: 20, minHeight: 260, backgroundColor: '#1D1030' },
  infoEyebrow: { color: PALETTE.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  infoTitle: { color: PALETTE.white, fontSize: 22, fontWeight: '900', marginTop: 4, marginBottom: 14 },
  rule: { color: '#F6E8D0', fontSize: 12, lineHeight: 19, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#49305B' },
  emptyCopy: { color: '#D1C3DC', fontSize: 12, lineHeight: 19, marginTop: 15 },
  infoFeatureCard: { marginTop: 12, padding: 18, borderRadius: 12, borderWidth: 1.5, borderColor: '#B98542', backgroundColor: '#28153B', alignItems: 'center' },
  infoFeatureGlyph: { color: '#FFE39A', fontSize: 42, textShadowColor: '#7CCFFF', textShadowRadius: 12 },
  infoFeatureTitle: { color: '#FFE9B3', fontSize: 13, fontWeight: '900', letterSpacing: 1.4, textAlign: 'center', marginTop: 8 },
  infoFeatureCopy: { color: '#C9B4D8', fontSize: 10, textAlign: 'center', marginTop: 5 },
  infoMetricRow: { flexDirection: 'row', gap: 7, marginTop: 12 },
  infoMetric: { flex: 1, paddingVertical: 12, paddingHorizontal: 5, borderWidth: 1, borderColor: '#765536', borderRadius: 8, backgroundColor: '#140B22', alignItems: 'center' },
  infoMetricLabel: { color: '#CFAE6D', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  infoMetricValue: { color: '#FFF0C3', fontSize: 16, fontWeight: '900', marginTop: 5 },
  historyPlaceholder: { marginTop: 12, minHeight: 150, padding: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#765536', borderRadius: 10, backgroundColor: '#140B22', alignItems: 'center', justifyContent: 'center' },
  historyPlaceholderGlyph: { color: '#E7C875', fontSize: 34 },
  historyPlaceholderTitle: { color: '#FFE9B3', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  historyPlaceholderCopy: { color: '#C9B4D8', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 6 },
  backToGame: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, marginTop: 20 },
  backToGameText: { color: '#351B48', fontSize: 10, fontWeight: '900' },
  settingsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.84)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  settingsBox: { width: '100%', maxWidth: 360, backgroundColor: '#211137', borderWidth: 2, borderColor: '#D4A64A', borderRadius: 14, padding: 17 },
  settingsEyebrow: { color: PALETTE.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  settingsTitle: { color: PALETTE.white, fontSize: 18, fontWeight: '900', marginTop: 4, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#49305B' },
  settingName: { color: PALETTE.white, fontSize: 12, fontWeight: '700' },
  settingValue: { color: PALETTE.gold, fontSize: 10, fontWeight: '900' },
  closeSettings: { alignItems: 'center', marginTop: 15, padding: 11, backgroundColor: '#E7B944', borderRadius: 8 },
  closeSettingsText: { color: '#351B48', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
