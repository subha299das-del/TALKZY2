import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator, StyleSheet, TextInput } from 'react-native';

const GOLD = '#FFE078';
const FRUITS = [
  {id:'cherry',emoji:'🍒',name:'Cherry',mult:5},
  {id:'plum',emoji:'🍑',name:'Plum',mult:5},
  {id:'orange',emoji:'🍊',name:'Orange',mult:5},
  {id:'watermelon',emoji:'🍉',name:'Watermelon',mult:40},
  {id:'pear',emoji:'🍐',name:'Pear',mult:5},
  {id:'strawberry',emoji:'🍓',name:'Strawberry',mult:25},
  {id:'lemon',emoji:'🍋',name:'Lemon',mult:15},
  {id:'grapes',emoji:'🍇',name:'Grapes',mult:10}
];
const BETS = [10,100,1000,10000,100000];
const money = n => Number(n || 0).toLocaleString('en-IN');

export default function RoyalFruitCrownPanel({visible,onClose,api}) {
  const [game,setGame] = useState(null);
  const [fruit,setFruit] = useState('cherry');
  const [amount,setAmount] = useState(100);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [seconds,setSeconds] = useState(37);
  const [spot,setSpot] = useState(0);
  const [spotOn,setSpotOn] = useState(false);
  const [founderOpen,setFounderOpen] = useState(false);
  const [ownerEmail,setOwnerEmail] = useState('');
  const [ownerPassword,setOwnerPassword] = useState('');
  const [ownerToken,setOwnerToken] = useState('');
  const spotTimer = useRef(null);
  const round = game?.round;
  const phase = round?.phase || 'betting';
  const winner = FRUITS.find(f => f.id === round?.winning_fruit);
  const chosen = FRUITS.find(f => f.id === fruit) || FRUITS[0];
  const myBets = game?.my_bets || [];
  const totalBet = myBets.reduce((n,b) => n + Number(b.amount || 0), 0);

  const refresh = async () => {
    if (!api) return;
    try { const data = await api('/api/greedy/fruit-crown'); setGame(data); setError(''); }
    catch (e) { setError(e.message || 'Could not connect to the game server.'); }
  };
  useEffect(() => {
    if (!visible) return;
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (!round) return;
    const end = phase === 'betting' ? round.bet_closes_at : phase === 'drawing' ? round.animation_ends_at : round.result_ends_at;
    if (!end) return;
    const tick = () => setSeconds(Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [round?.id,round?.phase,round?.bet_closes_at,round?.animation_ends_at,round?.result_ends_at]);

  useEffect(() => {
    if (phase !== 'drawing') {
      setSpotOn(false);
      setSpot(0);
      if (spotTimer.current) clearTimeout(spotTimer.current);
      return;
    }
    setSpotOn(true);
    let active = true;
    let index = 0;
    const start = Date.now();
    const spin = () => {
      if (!active) return;
      const elapsed = Date.now() - start;
      const delay = elapsed < 4000 ? 520 - elapsed * 0.105 : elapsed < 7000 ? 100 + (elapsed - 4000) * 0.07 : Math.min(950, 310 + (elapsed - 7000) * 0.21);
      index = (index + 1) % 8;
      setSpot(index);
      spotTimer.current = setTimeout(spin, delay);
    };
    spotTimer.current = setTimeout(spin, 110);
    return () => { active = false; if (spotTimer.current) clearTimeout(spotTimer.current); };
  }, [phase,round?.id]);

  const founderLogin = async () => {
    setBusy(true); setError('');
    try { const response = await api('/api/admin/login',{method:'POST',body:JSON.stringify({email:ownerEmail,password:ownerPassword})}); setOwnerToken(response.token); setOwnerPassword(''); }
    catch(e) { setError(e.message || 'Founder sign-in failed.'); }
    finally { setBusy(false); }
  };
  const setFounderWinner = async (id) => {
    setBusy(true); setError('');
    try { await api('/api/greedy/fruit-crown/founder-result',{method:'POST',headers:{Authorization:'Bearer '+ownerToken},body:JSON.stringify({fruit:id})}); setFounderOpen(false); await refresh(); }
    catch(e) { setError(e.message || 'Could not set the Founder result.'); }
    finally { setBusy(false); }
  };
  const placeBet = async () => {
    if (busy || phase !== 'betting') return;
    setBusy(true); setError('');
    try {
      await api('/api/greedy/fruit-crown/bets',{method:'POST',body:JSON.stringify({fruit,amount})});
      await refresh();
    } catch (e) { setError(e.message || 'Bet could not be placed.'); }
    finally { setBusy(false); }
  };
  const close = () => { if (spotTimer.current) clearTimeout(spotTimer.current); onClose?.(); };
  const history = game?.history || [];

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
    <View style={s.back}><View style={s.shell}>
      <View style={s.top}>
        <Text style={s.balance}>🪙 GOLD {money(game?.balance)}</Text>
        <TouchableOpacity onPress={()=>setFounderOpen(v=>!v)}><Text style={s.founderButton}>FOUNDER</Text></TouchableOpacity>
        <Text style={s.round}>ROUND {round?.number || '—'}</Text>
        <TouchableOpacity onPress={close}><Text style={s.close}>×</Text></TouchableOpacity>
      </View>
      {phase === 'result' && winner ? <View style={s.resultPanel}>
        <Text style={s.crown}>👑</Text>
        <Text style={s.heading}>ROYAL FRUIT CROWN</Text>
        <Text style={s.subheading}>ROUND WINNER</Text>
        <Text style={s.winnerEmoji}>{winner.emoji}</Text>
        <Text style={s.winnerName}>{winner.name.toUpperCase()} · {winner.mult}×</Text>
        <View style={s.leaders}>
          <Text style={s.leaderTitle}>TOP 3 WINNERS</Text>
          {(game?.leaders || []).length ? game.leaders.map((u,i) => <View key={u.user_id} style={s.leaderRow}>
            {u.avatar_url ? <Image source={{uri:u.avatar_url}} style={s.avatar}/> : <View style={s.avatar}><Text>👤</Text></View>}
            <Text style={s.leaderName}>{i+1}. {u.display_name || 'TALKZY User'}</Text>
            <Text style={s.payout}>+{money(u.coins)} 🪙</Text>
          </View>) : <Text style={s.noWinner}>No winning bets this round.</Text>}
        </View>
        <Text style={s.next}>NEXT ROUND IN {seconds}s</Text>
      </View> : <ScrollView contentContainerStyle={s.content}>
        <View style={s.banner}><Text style={{fontSize:26}}>👑</Text><View style={{flex:1}}>
          <Text style={s.heading}>ROYAL FRUIT CROWN</Text><Text style={s.subtitle}>CHOOSE YOUR FRUIT · WIN GOLD COINS</Text>
        </View><Text style={{fontSize:24}}>🏆</Text></View>
        {founderOpen && <View style={s.founderBox}>
          {ownerToken ? <><Text style={s.founderTitle}>FOUNDER WINNER CONTROL</Text><Text style={s.founderHint}>Choose the winning fruit before betting closes.</Text><View style={s.founderChoices}>{FRUITS.map(f=><TouchableOpacity key={f.id} disabled={busy} onPress={()=>setFounderWinner(f.id)} style={s.founderChoice}><Text style={{fontSize:17}}>{f.emoji}</Text><Text style={s.founderChoiceText}>{f.name}</Text></TouchableOpacity>)}</View><TouchableOpacity onPress={()=>setOwnerToken('')}><Text style={s.founderLogout}>SIGN OUT FOUNDER</Text></TouchableOpacity></> : <><Text style={s.founderTitle}>FOUNDER SIGN IN</Text><TextInput value={ownerEmail} onChangeText={setOwnerEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Owner email" placeholderTextColor="#A6B39D" style={s.founderInput}/><TextInput value={ownerPassword} onChangeText={setOwnerPassword} secureTextEntry placeholder="Owner password" placeholderTextColor="#A6B39D" style={s.founderInput}/><TouchableOpacity disabled={busy} onPress={founderLogin} style={s.founderLogin}><Text style={s.founderChoiceText}>{busy?'PLEASE WAIT':'OWNER SIGN IN'}</Text></TouchableOpacity></>}
        </View>}
        <View style={s.phaseRow}>
          <Text style={s.phase}>{phase === 'betting' ? 'BETTING OPEN' : phase === 'drawing' ? 'CROWN DRAW' : 'ROUND RESULT'}</Text>
          <Text style={s.timer}>{phase === 'betting' ? seconds + 's' : phase === 'drawing' ? 'DRAWING' : seconds + 's'}</Text>
        </View>
        <View style={s.board}>
          {FRUITS.slice(0,3).map((f,i)=><FruitTile key={f.id} f={f} active={fruit===f.id} lit={phase==='drawing'&&spot===i} dim={phase==='drawing'&&spot!==i} disabled={phase!=='betting'} onPress={()=>setFruit(f.id)}/>)}
          <FruitTile f={FRUITS[3]} active={fruit===FRUITS[3].id} lit={phase==='drawing'&&spot===3} dim={phase==='drawing'&&spot!==3} disabled={phase!=='betting'} onPress={()=>setFruit(FRUITS[3].id)}/>
          <View style={s.center}><Text style={s.centerCrown}>👑</Text><Text style={s.centerTime}>{phase==='betting'?seconds:phase==='drawing'?'✦':'✓'}</Text><Text style={s.centerLabel}>{phase==='betting'?'BET TIME':'CROWN'}</Text></View>
          <FruitTile f={FRUITS[4]} active={fruit===FRUITS[4].id} lit={phase==='drawing'&&spot===4} dim={phase==='drawing'&&spot!==4} disabled={phase!=='betting'} onPress={()=>setFruit(FRUITS[4].id)}/>
          {FRUITS.slice(5).map((f,i)=><FruitTile key={f.id} f={f} active={fruit===f.id} lit={phase==='drawing'&&spot===i+5} dim={phase==='drawing'&&spot!==i+5} disabled={phase!=='betting'} onPress={()=>setFruit(f.id)}/>)}
        </View>
        <View style={s.selectRow}><Text style={s.mini}>SELECT BET AMOUNT</Text><Text style={s.balanceSmall}>BALANCE {money(game?.balance)}</Text></View>
        <View style={s.chips}>{BETS.map(v=><TouchableOpacity key={v} disabled={phase!=='betting'} onPress={()=>setAmount(v)} style={[s.chip,amount===v&&s.chipOn]}><Text style={[s.chipText,amount===v&&s.chipTextOn]}>{money(v)}</Text></TouchableOpacity>)}</View>
        <View style={s.footer}>
          <View style={{flex:1}}><Text style={s.total}>Selected: {chosen.name}</Text><Text style={s.total}>Your bets: {money(totalBet)} 🪙</Text></View>
          <TouchableOpacity disabled={busy||phase!=='betting'} onPress={placeBet} style={[s.betButton,(busy||phase!=='betting')&&{opacity:.45}]}>
            {busy?<ActivityIndicator color="#382208"/>:<Text style={s.betText}>BET {money(amount)}</Text>}
          </TouchableOpacity>
        </View>
        {!!error&&<Text style={s.error}>{error}</Text>}
        <View style={s.history}><Text style={s.mini}>RECENT RESULTS</Text>{history.map((h,i)=><Text key={i} style={s.historyFruit}>{FRUITS.find(f=>f.id===h.fruit)?.emoji||'•'}</Text>)}</View>
        {phase==='drawing'&&<Text style={s.drawHint}>THE GOLDEN LIGHT IS CHOOSING THE CROWN…</Text>}
      </ScrollView>}
      {!!error&&phase==='result'&&<Text style={s.error}>{error}</Text>}
    </View></View>
  </Modal>;
}
function FruitTile({f,active,lit,dim,disabled,onPress}) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={[s.fruit,active&&!disabled&&s.fruitActive,dim&&{opacity:0.42},lit&&s.fruitLit]}>
    <Text style={s.fruitEmoji}>{f.emoji}</Text><Text style={s.fruitName}>{f.name}</Text><Text style={s.mult}>{f.mult}×</Text>{lit&&<Text style={s.sparkle}>✦ ✧</Text>}
  </TouchableOpacity>;
}
const s=StyleSheet.create({
  back:{flex:1,backgroundColor:'rgba(0,0,0,.9)',justifyContent:'center',padding:5},shell:{maxHeight:'98%',backgroundColor:'#061D17',borderColor:'#D6AC45',borderWidth:2,borderRadius:13,overflow:'hidden'},
  top:{height:40,backgroundColor:'#07130F',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:10},founderButton:{color:'#F4D58A',fontSize:8,fontWeight:'900',borderWidth:1,borderColor:'#96763D',paddingHorizontal:6,paddingVertical:4},balance:{color:GOLD,fontSize:11,fontWeight:'900'},round:{color:'#D7C28B',fontSize:9,fontWeight:'900'},close:{color:GOLD,fontSize:28},
  content:{padding:7,paddingBottom:12},banner:{height:48,flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#07532E',borderWidth:1,borderColor:'#C69B37',paddingHorizontal:8},heading:{color:'#FFF0A4',fontSize:17,fontWeight:'900',fontStyle:'italic'},subtitle:{color:'#C6E7B7',fontSize:7,fontWeight:'900'},
  founderBox:{marginTop:6,padding:9,backgroundColor:'#102D1E',borderWidth:1,borderColor:'#D6B65C',borderRadius:7},founderTitle:{color:GOLD,fontSize:11,fontWeight:'900'},founderHint:{color:'#D8C99F',fontSize:8,marginVertical:5},founderInput:{height:36,backgroundColor:'#06170F',borderWidth:1,borderColor:'#6E633B',borderRadius:5,color:'#FFF3C8',paddingHorizontal:9,marginTop:6,fontSize:11},founderLogin:{alignSelf:'flex-start',backgroundColor:'#D9AB3D',paddingHorizontal:12,paddingVertical:8,borderRadius:5,marginTop:7},founderChoices:{flexDirection:'row',flexWrap:'wrap',gap:5,marginTop:7},founderChoice:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#214A2D',paddingHorizontal:7,paddingVertical:6,borderRadius:5,borderWidth:1,borderColor:'#B99B51'},founderChoiceText:{color:'#FFF0B0',fontSize:8,fontWeight:'900'},founderLogout:{color:'#F1D18B',fontSize:8,fontWeight:'900',marginTop:8},
  phaseRow:{height:31,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:10,backgroundColor:'#0B241A'},phase:{color:'#F8E9B8',fontSize:10,fontWeight:'900'},timer:{color:'#FFF2A5',fontSize:16,fontWeight:'900'},
  board:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',backgroundColor:'#07482A',padding:5,gap:4},fruit:{width:'32%',height:81,backgroundColor:'#0B6B3B',borderColor:'#D7C36A',borderWidth:1,borderRadius:7,alignItems:'center',justifyContent:'center'},fruitActive:{backgroundColor:'#A66D19',borderWidth:2,borderColor:'#FFF3A1'},fruitLit:{backgroundColor:'#FFF2A5',borderColor:'#FFFFFF',borderWidth:3,shadowColor:'#FFF0A0',shadowOpacity:1,shadowRadius:22,elevation:18},fruitEmoji:{fontSize:25},sparkle:{position:'absolute',top:2,right:5,color:'#FFF8C8',fontSize:14,fontWeight:'900'},fruitName:{color:'#FFF2C5',fontSize:9,fontWeight:'900'},mult:{color:'#FFE27C',fontSize:11,fontWeight:'900'},
  center:{width:'32%',height:81,alignItems:'center',justifyContent:'center',backgroundColor:'#102C20',borderColor:'#E6BE54',borderWidth:1.5,borderRadius:8},centerCrown:{fontSize:19},centerTime:{color:'#FFF1A2',fontSize:17,fontWeight:'900'},centerLabel:{color:'#E8D9A2',fontSize:7,fontWeight:'900'},
  selectRow:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:5,paddingTop:9},mini:{color:'#B4D6AE',fontSize:8,fontWeight:'900'},balanceSmall:{color:'#FFE078',fontSize:8,fontWeight:'900'},chips:{flexDirection:'row',justifyContent:'space-around',paddingVertical:8,backgroundColor:'#07341F'},chip:{minWidth:48,height:33,paddingHorizontal:5,borderRadius:17,backgroundColor:'#1771A9',borderColor:'#D8E8C5',borderWidth:1,alignItems:'center',justifyContent:'center'},chipOn:{backgroundColor:'#F3C64E',borderWidth:2,borderColor:'#FFF3A1'},chipText:{color:'#FFF',fontSize:8,fontWeight:'900'},chipTextOn:{color:'#311500'},
  footer:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:8,paddingVertical:7,backgroundColor:'#092419'},total:{color:'#E7D8A4',fontSize:9,fontWeight:'900'},betButton:{backgroundColor:'#D9AB3D',paddingHorizontal:16,paddingVertical:9,borderRadius:6,borderWidth:1,borderColor:'#FFF0A0'},betText:{color:'#382208',fontSize:10,fontWeight:'900'},
  history:{flexDirection:'row',alignItems:'center',justifyContent:'space-around',padding:7,backgroundColor:'#06331F'},historyFruit:{fontSize:19},drawHint:{color:GOLD,fontSize:9,fontWeight:'900',textAlign:'center',paddingVertical:8},
  resultPanel:{alignItems:'center',padding:12,backgroundColor:'#063D25',minHeight:500},crown:{fontSize:38},subheading:{color:'#E5D4A1',fontSize:10,fontWeight:'900',marginTop:8},winnerEmoji:{fontSize:70,marginTop:10},winnerName:{color:'#FFF0A4',fontSize:17,fontWeight:'900'},leaders:{width:'100%',backgroundColor:'#082D1C',borderColor:'#D4B451',borderWidth:1,borderRadius:8,padding:10,marginTop:18},leaderTitle:{color:GOLD,fontSize:12,fontWeight:'900',marginBottom:7},leaderRow:{flexDirection:'row',alignItems:'center',paddingVertical:6,borderBottomWidth:1,borderColor:'#31553B'},avatar:{width:29,height:29,borderRadius:15,backgroundColor:'#21452D',alignItems:'center',justifyContent:'center',marginRight:8},leaderName:{color:'#F6E9C4',fontSize:10,fontWeight:'800',flex:1},payout:{color:GOLD,fontSize:10,fontWeight:'900'},noWinner:{color:'#D6CBA9',fontSize:10},next:{color:GOLD,fontSize:11,fontWeight:'900',marginTop:18},error:{color:'#FF9C9C',fontSize:10,padding:8,textAlign:'center'}
});
