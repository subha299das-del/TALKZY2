import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from 'react-native';

const GOLD = '#F6D36F';
const RED = '#D71936';
const PURPLE = '#310B42';
const BETS = [500, 1000, 2500, 5000, 10000];
const REELS = ['7️⃣', '🍒', '🟥', '🟩', '🟦', 'BAR'];
const PAYTABLE = [
  ['Triple red 7', '3 × 50'],
  ['Double red 7 + 7', '3 × 25'],
  ['Single red 7', '3 × 15'],
  ['Triple red BAR', '3 × 8'],
  ['Double green BAR', '3 × 6'],
  ['Single blue BAR', '3 × 4'],
  ['Cherries', '3 × 2'],
  ['Any 7 combination', '3 × 5'],
  ['Any BAR combination', '3 × 1']
];

function JackpotMark({ size = 54 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: '#3A0718', borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF263E', shadowOpacity: 0.8, shadowRadius: 10, elevation: 8 }}>
      <Text style={{ position: 'absolute', top: -size * 0.22, color: GOLD, fontSize: size * 0.38 }}>♛</Text>
      <Text style={{ color: '#FF334B', fontSize: size * 0.48, fontWeight: '900', textShadowColor: '#FFD56B', textShadowRadius: 5 }}>777</Text>
      <Text style={{ position: 'absolute', bottom: -size * 0.17, fontSize: size * 0.24 }}>💰</Text>
    </View>
  );
}

export default function RubyJackpotPanel({ visible, onClose }) {
  const [bet, setBet] = useState(2500);
  const [reels, setReels] = useState(['🍒', '7️⃣', 'BAR']);
  const [bonus, setBonus] = useState('RESPIN');
  const [multiplier, setMultiplier] = useState(null);
  const [win, setWin] = useState(0);
  const [page, setPage] = useState('game');
  const [rulesPage, setRulesPage] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [auto, setAuto] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const { width } = Dimensions.get('window');
  const reelWidth = Math.max(66, Math.min(92, (width - 94) / 4));
  const sample = useMemo(() => ['🍒', 'BAR', '7️⃣', '🍒', 'BAR', '7️⃣'], []);

  const spinPreview = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(0);
    const next = [sample[Math.floor(Math.random() * sample.length)], sample[Math.floor(Math.random() * sample.length)], sample[Math.floor(Math.random() * sample.length)]];
    const nextBonus = ['RESPIN', '2×', '3×', '5×', '10×'][Math.floor(Math.random() * 5)];
    setTimeout(() => {
      setReels(next);
      setBonus(nextBonus);
      setMultiplier(nextBonus.endsWith('×') ? nextBonus : null);
      setSpinning(false);
    }, turbo ? 350 : 950);
  };

  const openRules = () => { setPage('rules'); setRulesPage(0); };
  const payoutFor = (symbol) => PAYTABLE.find(row => row[0] === symbol)?.[1] || '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.topBar}>
            <View style={styles.wallet}><Text style={styles.coin}>🪙</Text><Text style={styles.walletValue}>Player balance —</Text></View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setPage('records')}><Text style={styles.topIcon}>▤</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPage('ranking')}><Text style={styles.topIcon}>♛</Text></TouchableOpacity>
              <TouchableOpacity onPress={openRules}><Text style={styles.topIcon}>?</Text></TouchableOpacity>
              <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
            </View>
          </View>
          {page === 'game' ? (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.banner}>
                <JackpotMark size={58}/>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.title}>RUBY JACKPOT</Text>
                  <Text style={styles.tag}>SPIN • MATCH • WIN</Text>
                </View>
                <Text style={{ fontSize: 30 }}>💎</Text>
              </View>
              <View style={styles.paytable}>
                <Text style={styles.sectionTitle}>WINNING COMBINATIONS</Text>
                <View style={styles.payGrid}>
                  {PAYTABLE.slice(0, 6).map((item, i) => (
                    <View key={item[0]} style={styles.payItem}>
                      <Text style={styles.paySymbol}>{['🔥7️⃣','🔥7️⃣7️⃣','7️⃣','🟥BAR','🟩BAR','🟦BAR'][i]}</Text>
                      <Text style={styles.payValue}>{item[1]}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.machine}>
                <View style={styles.machineHead}><Text style={styles.machineCaption}>MAIN REELS</Text><Text style={styles.machineCaption}>BONUS REEL</Text></View>
                <View style={styles.reelRow}>
                  {reels.map((symbol, i) => (
                    <View key={i} style={[styles.reel, { width: reelWidth, height: 90 }]}>
                      <Text style={[styles.reelSymbol, symbol === 'BAR' && { fontSize: 21 }]}>{spinning ? '✨' : symbol}</Text>
                    </View>
                  ))}
                  <View style={[styles.bonusReel, { width: reelWidth * 0.82, height: 90 }]}>
                    <Text style={styles.bonusText}>{spinning ? '…' : bonus}</Text>
                  </View>
                </View>
                <View style={styles.winBar}><Text style={styles.winText}>WIN {win.toLocaleString('en-IN')}</Text></View>
              </View>
              <View style={styles.multiplierRow}>
                {['2×','3×','5×','10×'].map(x => <View key={x} style={[styles.multiplierChip, multiplier === x && styles.multiplierActive]}><Text style={styles.multiplierText}>{x}</Text></View>)}
              </View>
              <View style={styles.betControls}>
                <Text style={styles.sectionTitle}>BET AMOUNT</Text>
                <View style={styles.betRow}>
                  <TouchableOpacity onPress={() => setBet(v => BETS[Math.max(0, BETS.indexOf(v)-1)])} style={styles.adjust}><Text style={styles.adjustText}>−</Text></TouchableOpacity>
                  <Text style={styles.betValue}>{bet.toLocaleString('en-IN')}</Text>
                  <TouchableOpacity onPress={() => setBet(v => BETS[Math.min(BETS.length-1, BETS.indexOf(v)+1)])} style={styles.adjust}><Text style={styles.adjustText}>＋</Text></TouchableOpacity>
                </View>
                <View style={styles.betPresets}>{BETS.map(v => <TouchableOpacity key={v} onPress={() => setBet(v)} style={[styles.preset, bet === v && styles.presetActive]}><Text style={styles.presetText}>{v >= 1000 ? (v/1000)+'K' : v}</Text></TouchableOpacity>)}</View>
                <View style={styles.utilityRow}>
                  <TouchableOpacity onPress={() => setTurbo(v => !v)} style={[styles.utility, turbo && styles.utilityActive]}><Text style={styles.utilityText}>⚡ TURBO {turbo ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setAuto(v => !v)} style={[styles.utility, auto && styles.utilityActive]}><Text style={styles.utilityText}>⟳ AUTO {auto ? 'ON' : 'OFF'}</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={spinPreview} disabled={spinning} style={[styles.spinButton, spinning && { opacity: 0.55 }]}><Text style={styles.spinText}>{spinning ? 'SPINNING…' : 'SPIN'}</Text></TouchableOpacity>
                <Text style={styles.previewNote}>VISUAL PREVIEW ONLY • SECURE BETTING AND PAYOUT SERVICE NOT CONNECTED</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.info}>
              <View style={styles.infoHeader}><Text style={styles.sectionTitle}>{page === 'rules' ? 'GAME RULES & PAYTABLE' : page === 'ranking' ? 'RANKING' : 'RECORDS'}</Text><TouchableOpacity onPress={() => setPage('game')}><Text style={styles.back}>BACK</Text></TouchableOpacity></View>
              <ScrollView>
                {page === 'rules' ? (
                  <View>
                    {rulesPage === 0 ? (
                      <>
                        {PAYTABLE.map((item, i) => <View key={item[0]} style={styles.ruleRow}><Text style={styles.ruleText}>{item[0]}</Text><Text style={styles.ruleValue}>{item[1]}</Text></View>)}
                        <Text style={styles.ruleText}>The game uses 3 main reels and one separate special reel. One fixed payline is shown in the source game.</Text>
                        <TouchableOpacity onPress={() => setRulesPage(1)} style={styles.next}><Text style={styles.nextText}>NEXT: SPECIAL REEL ›</Text></TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.ruleText}>The rightmost reel is the special reel. If there is a winning combination on the main reels, the special reel may award additional bonuses.</Text>
                        <Text style={styles.ruleText}>The source demonstrates RESPIN and 2×, 3×, 5× and 10× special-reel outcomes. The exact trigger and bonus calculation are not fully specified in the reference.</Text>
                        <TouchableOpacity onPress={() => setRulesPage(0)} style={styles.next}><Text style={styles.nextText}>‹ BACK TO PAYTABLE</Text></TouchableOpacity>
                      </>
                    )}
                  </View>
                ) : <Text style={styles.ruleText}>{page === 'ranking' ? 'Ranking data will appear after the secure game service is connected.' : 'Completed rounds will appear after the secure game service is connected.'}</Text>}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{flex:1,backgroundColor:'rgba(12,2,16,0.88)',justifyContent:'center',paddingHorizontal:5,paddingVertical:12},
  shell:{maxHeight:'98%',borderRadius:16,overflow:'hidden',borderWidth:1.5,borderColor:'#E9B94D',backgroundColor:PURPLE,elevation:32},
  topBar:{minHeight:42,paddingHorizontal:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#260A32',borderBottomWidth:1,borderBottomColor:'#8B5A35'},
  wallet:{flexDirection:'row',alignItems:'center',gap:6},coin:{fontSize:17},walletValue:{color:'#FFE7A0',fontSize:11,fontWeight:'900'},
  actions:{flexDirection:'row',alignItems:'center',gap:13},topIcon:{color:GOLD,fontSize:19,fontWeight:'900'},close:{color:'#FFE8AA',fontSize:28,lineHeight:30},
  content:{padding:8,paddingBottom:16},banner:{minHeight:76,padding:10,flexDirection:'row',alignItems:'center',borderRadius:12,borderWidth:1.5,borderColor:GOLD,backgroundColor:'#4A0C24'},
  title:{color:'#FFE29A',fontSize:19,fontWeight:'900',letterSpacing:1.2},tag:{color:'#FF9DAE',fontSize:9,fontWeight:'900',letterSpacing:1.5,marginTop:4},
  paytable:{marginTop:9,padding:9,borderRadius:11,backgroundColor:'#4A0B3D',borderWidth:1,borderColor:'#B45B9B'},
  sectionTitle:{color:GOLD,fontSize:11,fontWeight:'900',letterSpacing:1},payGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:6},
  payItem:{width:'32%',minHeight:52,marginBottom:5,alignItems:'center',justifyContent:'center',backgroundColor:'#310A32',borderRadius:7,borderWidth:1,borderColor:'#7E3D72'},
  paySymbol:{fontSize:18,color:'#FFF1C7',fontWeight:'900'},payValue:{color:'#FFE5A0',fontSize:13,fontWeight:'900',marginTop:2},
  machine:{marginTop:9,padding:9,borderRadius:13,backgroundColor:'#7A152A',borderWidth:2,borderColor:'#F7D56C'},
  machineHead:{flexDirection:'row',justifyContent:'space-between',marginBottom:6},machineCaption:{color:'#FFE8A0',fontSize:9,fontWeight:'900'},
  reelRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:4},reel:{backgroundColor:'#FFF3D4',borderRadius:8,borderWidth:2,borderColor:'#D8A84B',alignItems:'center',justifyContent:'center'},reelSymbol:{fontSize:35,color:'#B40E25',fontWeight:'900'},
  bonusReel:{backgroundColor:'#390B54',borderRadius:8,borderWidth:2,borderColor:'#D7B35E',alignItems:'center',justifyContent:'center'},bonusText:{color:'#FFE178',fontSize:16,fontWeight:'900',textAlign:'center'},
  winBar:{marginTop:7,backgroundColor:'#25051D',borderRadius:6,borderWidth:1,borderColor:GOLD,paddingVertical:5,alignItems:'center'},winText:{color:'#FFE9A2',fontSize:16,fontWeight:'900'},
  multiplierRow:{flexDirection:'row',justifyContent:'space-around',marginTop:8},multiplierChip:{paddingHorizontal:12,paddingVertical:6,borderRadius:18,backgroundColor:'#35134C',borderWidth:1,borderColor:'#A77AC4'},multiplierActive:{backgroundColor:'#8B1E42',borderColor:GOLD},multiplierText:{color:'#FFE6A0',fontWeight:'900'},
  betControls:{marginTop:9,padding:10,borderRadius:11,backgroundColor:'#2B0A36',borderWidth:1,borderColor:'#81516E'},betRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:22,marginTop:7},adjust:{width:34,height:32,borderRadius:7,backgroundColor:'#681B3A',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:GOLD},adjustText:{color:GOLD,fontSize:22,fontWeight:'900'},betValue:{minWidth:110,textAlign:'center',color:'#FFF0B5',fontSize:20,fontWeight:'900'},
  betPresets:{flexDirection:'row',justifyContent:'space-between',marginTop:9},preset:{paddingHorizontal:8,paddingVertical:6,borderRadius:7,backgroundColor:'#42134A',borderWidth:1,borderColor:'#8E5D8C'},presetActive:{backgroundColor:'#6E183A',borderColor:GOLD},presetText:{color:'#FFE6A0',fontSize:11,fontWeight:'900'},
  utilityRow:{flexDirection:'row',gap:8,marginTop:10},utility:{flex:1,padding:9,alignItems:'center',borderRadius:8,backgroundColor:'#34103D',borderWidth:1,borderColor:'#875B8B'},utilityActive:{borderColor:GOLD,backgroundColor:'#5B1642'},utilityText:{color:'#FFE6A0',fontSize:11,fontWeight:'900'},
  spinButton:{marginTop:10,alignSelf:'center',width:106,height:106,borderRadius:53,backgroundColor:'#159B45',borderWidth:5,borderColor:'#F9D56B',alignItems:'center',justifyContent:'center',elevation:10},spinText:{color:'#FFF8D6',fontSize:18,fontWeight:'900'},
  previewNote:{color:'#E3A7C4',fontSize:9,textAlign:'center',fontWeight:'900',marginTop:9},
  info:{padding:13,minHeight:330,maxHeight:600},infoHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},back:{color:GOLD,fontWeight:'900'},ruleRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#69365E'},ruleText:{color:'#FFE8C1',fontSize:13,lineHeight:20,flex:1,marginVertical:7},ruleValue:{color:GOLD,fontWeight:'900',fontSize:14},next:{marginTop:14,alignSelf:'flex-end',padding:10,backgroundColor:'#6D1944',borderRadius:8,borderWidth:1,borderColor:GOLD},nextText:{color:'#FFE8A0',fontWeight:'900'}
});
