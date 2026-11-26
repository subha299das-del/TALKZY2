import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator, StyleSheet, TextInput, useWindowDimensions } from 'react-native';

const GOLD = '#F5D77C';
const FRUITS = [
  {id:'cherry',name:'Cherry',mult:5,color:'#C91E42'},
  {id:'plum',name:'Plum',mult:5,color:'#7B3B91'},
  {id:'orange',name:'Orange',mult:5,color:'#F58A24'},
  {id:'watermelon',name:'Watermelon',mult:40,color:'#E94B58'},
  {id:'pear',name:'Pear',mult:5,color:'#B8C94A'},
  {id:'strawberry',name:'Strawberry',mult:25,color:'#E94359'},
  {id:'lemon',name:'Lemon',mult:15,color:'#E8D34D'},
  {id:'grapes',name:'Grapes',mult:10,color:'#7543A5'}
];
const BETS = [10,100,1000,10000,100000];
const money = n => Number(n || 0).toLocaleString('en-IN');

export default function RoyalFruitCrownPanel({visible,onClose,api}) {
  const {width:screenWidth} = useWindowDimensions();
  const [game,setGame] = useState(null);
  const [fruit,setFruit] = useState('cherry');
  const [amount,setAmount] = useState(100);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [seconds,setSeconds] = useState(37);
  const [spot,setSpot] = useState(0);
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
  const myWinnings = winner ? myBets.filter(b => b.fruit === winner.id).reduce((n,b) => n + Number(b.amount || 0) * winner.mult, 0) : 0;

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
    if (phase !== 'drawing') { if (spotTimer.current) clearTimeout(spotTimer.current); setSpot(0); return; }
    let active = true, index = 0;
    const start = Date.now();
    const spin = () => {
      if (!active) return;
      const elapsed = Date.now() - start;
      const delay = elapsed < 4000 ? 520 - elapsed * 0.105 : elapsed < 7000 ? 100 + (elapsed - 4000) * 0.07 : Math.min(950,310 + (elapsed - 7000) * 0.21);
      index = (index + 1) % 8; setSpot(index); spotTimer.current = setTimeout(spin,delay);
    };
    spotTimer.current = setTimeout(spin,110);
    return () => { active = false; if (spotTimer.current) clearTimeout(spotTimer.current); };
  }, [phase,round?.id]);

  const founderLogin = async () => {
    setBusy(true); setError('');
    try { const response = await api('/api/admin/login',{method:'POST',body:JSON.stringify({email:ownerEmail,password:ownerPassword})}); setOwnerToken(response.token); setOwnerPassword(''); }
    catch(e) { setError(e.message || 'Founder sign-in failed.'); }
    finally { setBusy(false); }
  };
  const setFounderWinner = async id => {
    setBusy(true); setError('');
    try { await api('/api/greedy/fruit-crown/founder-result',{method:'POST',headers:{Authorization:'Bearer '+ownerToken},body:JSON.stringify({fruit:id})}); setFounderOpen(false); await refresh(); }
    catch(e) { setError(e.message || 'Could not set the Founder result.'); }
    finally { setBusy(false); }
  };
  const placeBet = async () => {
    if (busy || phase !== 'betting') return;
    setBusy(true); setError('');
    try { await api('/api/greedy/fruit-crown/bets',{method:'POST',body:JSON.stringify({fruit,amount})}); await refresh(); }
    catch(e) { setError(e.message || 'Bet could not be placed.'); }
    finally { setBusy(false); }
  };
  const close = () => { if (spotTimer.current) clearTimeout(spotTimer.current); onClose?.(); };
  const history = game?.history || [];
  const isResult = phase === 'result' && !!winner;

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
    <View style={s.backdrop}>
      <View style={[s.outerFrame,{maxWidth:screenWidth, maxHeight:'99%'}]}>
        <View style={s.innerFrame}>
          <View style={s.topBar}>
            <View style={s.brandMark}><Text style={s.brandCrown}>♛</Text><View><Text style={s.brand}>TALKZY</Text><Text style={s.brandTag}>TALK · CONNECT · BELONG</Text></View></View>
            <View style={s.balanceBox}><Text style={s.smallGold}>TOTAL BALANCE</Text><Text style={s.balanceValue}>{money(game?.balance)} <Text style={s.coin}>◉</Text></Text></View>
            <View style={s.roundBox}><Text style={s.smallGold}>ROUND</Text><Text style={s.roundValue}>#{String(round?.number || '—').padStart(3,'0')}</Text></View>
            <TouchableOpacity onPress={close} style={s.closeButton}><Text style={s.closeText}>×</Text></TouchableOpacity>
          </View>
          {isResult ? <ScrollView contentContainerStyle={s.resultContent}>
            <Ornament/>
            <Text style={s.resultEyebrow}>THE CROWN HAS CHOSEN</Text>
            <Text style={s.mainTitle}>ROYAL FRUIT CROWN</Text>
            <Text style={s.resultRound}>ROUND #{String(round?.number || '—').padStart(3,'0')}  ·  OFFICIAL RESULT</Text>
            <View style={s.winnerHalo}><View style={s.haloRing}><FruitIcon fruit={winner} size={86}/></View></View>
            <Text style={s.winnerCaption}>WINNING FRUIT</Text>
            <Text style={s.winnerName}>{winner.name.toUpperCase()}</Text>
            <View style={s.multPill}><Text style={s.multPillText}>{winner.mult}× PAYOUT</Text></View>
            <View style={s.personalWin}>
              <Text style={s.personalLabel}>YOUR WINNINGS THIS ROUND</Text>
              {myBets.length === 0 ? <Text style={s.personalEmpty}>You did not choose any fruit.</Text> : <Text style={s.personalAmount}>+{money(myWinnings)} <Text style={s.coin}>◉</Text></Text>}
              {myBets.length > 0 && <Text style={s.personalNote}>{myWinnings > 0 ? 'Winning bets credited to your main balance' : 'No winning bets in this round'}</Text>}
            </View>
            <Text style={s.podiumHeading}>TOP 3 WINNERS</Text>
            <View style={s.podiumRow}>
              {[1,0,2].map((rank,slot) => {
                const u=(game?.leaders||[])[rank];
                return <View key={rank} style={[s.podiumCard,slot===1&&s.podiumFirst]}>
                  <View style={[s.rankBadge,slot===1&&s.rankFirst]}><Text style={s.rankText}>{rank+1}</Text></View>
                  {u?.avatar_url ? <Image source={{uri:u.avatar_url}} style={s.podiumAvatar}/> : <View style={s.podiumAvatar}><Text style={s.avatarFallback}>♙</Text></View>}
                  <Text numberOfLines={1} style={s.podiumName}>{u?.display_name || '—'}</Text>
                  <Text style={s.podiumCoins}>{u ? '+'+money(u.coins) : '—'} <Text style={s.coin}>◉</Text></Text>
                </View>;
              })}
            </View>
            {!(game?.leaders||[]).length && <Text style={s.noWinners}>No winning bets this round.</Text>}
            <Text style={s.nextRound}>NEXT ROUND BEGINS IN  {seconds}s</Text>
            <Ornament/>
          </ScrollView> : <ScrollView contentContainerStyle={s.mainContent}>
            <Ornament/>
            <Text style={s.mainTitle}>ROYAL FRUIT CROWN</Text>
            <Text style={s.mainSubtitle}>CHOOSE YOUR FRUIT  ·  CLAIM THE CROWN</Text>
            {founderOpen && <View style={s.founderPanel}>
              {ownerToken ? <><Text style={s.founderTitle}>FOUNDER RESULT CONTROL</Text><Text style={s.founderHint}>Select a result using Founder authority.</Text><View style={s.founderChoices}>{FRUITS.map(f=><TouchableOpacity key={f.id} disabled={busy} onPress={()=>setFounderWinner(f.id)} style={s.founderChoice}><FruitIcon fruit={f} size={24}/><Text style={s.founderChoiceText}>{f.name}</Text></TouchableOpacity>)}</View><TouchableOpacity onPress={()=>setOwnerToken('')}><Text style={s.founderLogout}>SIGN OUT</Text></TouchableOpacity></> : <><Text style={s.founderTitle}>FOUNDER SIGN IN</Text><TextInput value={ownerEmail} onChangeText={setOwnerEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Owner email" placeholderTextColor="#A99870" style={s.founderInput}/><TextInput value={ownerPassword} onChangeText={setOwnerPassword} secureTextEntry placeholder="Owner password" placeholderTextColor="#A99870" style={s.founderInput}/><TouchableOpacity disabled={busy} onPress={founderLogin} style={s.founderLogin}><Text style={s.founderChoiceText}>{busy?'PLEASE WAIT':'OWNER SIGN IN'}</Text></TouchableOpacity></>}
            </View>}
            <View style={s.statusBar}><View style={s.statusDot}/><Text style={s.statusText}>{phase==='betting'?'BETTING IS OPEN':phase==='drawing'?'THE ROYAL DRAW':'ROUND COMPLETE'}</Text><View style={s.timerBox}><Text style={s.timerValue}>{phase==='drawing'?'✦':seconds}</Text><Text style={s.timerUnit}>{phase==='betting'?'SECONDS':phase==='drawing'?'DRAWING':'SECONDS'}</Text></View></View>
            <View style={s.boardFrame}>
              <View style={s.board}>
                {FRUITS.map((f,i)=><FruitTile key={f.id} f={f} active={fruit===f.id} lit={phase==='drawing'&&spot===i} dim={phase==='drawing'&&spot!==i} disabled={phase!=='betting'} onPress={()=>setFruit(f.id)}/>)}
                <View style={s.centerCell}><Text style={s.centerCrown}>♛</Text><Text style={s.centerTimer}>{phase==='betting'?seconds:phase==='drawing'?'✦':'✓'}</Text><Text style={s.centerSeconds}>{phase==='betting'?'SECONDS':'ROYAL DRAW'}</Text></View>
              </View>
            </View>
            <View style={s.betSection}>
              <View style={s.betHeader}><Text style={s.sectionTitle}>SELECT YOUR BET</Text><Text style={s.selectedFruit}>SELECTED: {chosen.name.toUpperCase()}</Text></View>
              <View style={s.chips}>{BETS.map(v=><TouchableOpacity key={v} disabled={phase!=='betting'} onPress={()=>setAmount(v)} style={[s.chip,amount===v&&s.chipActive]}><Text style={[s.chipText,amount===v&&s.chipTextActive]}>{money(v)}</Text></TouchableOpacity>)}</View>
              <View style={s.betFooter}>
                <View style={s.betTotals}><Text style={s.totalLabel}>TOTAL BET THIS ROUND</Text><Text style={s.totalValue}>{money(totalBet)} <Text style={s.coin}>◉</Text></Text></View>
                <TouchableOpacity disabled={busy||phase!=='betting'} onPress={placeBet} style={[s.betButton,(busy||phase!=='betting')&&s.disabledButton]}>
                  {busy?<ActivityIndicator color="#211504"/>:<Text style={s.betButtonText}>PLACE BET  ·  {money(amount)}</Text>}
                </TouchableOpacity>
              </View>
            </View>
            {!!error&&<Text style={s.error}>{error}</Text>}
            <View style={s.historyPanel}><View style={s.historyHeading}><Text style={s.sectionTitle}>RECENT RESULTS</Text><Text style={s.historyCaption}>LATEST FIRST</Text></View><View style={s.historyItems}>{history.slice(0,8).map((h,i)=>{const f=FRUITS.find(x=>x.id===h.fruit);return <View key={i} style={s.historyItem}>{f?<FruitIcon fruit={f} size={27}/>:null}</View>;})}</View></View>
            <TouchableOpacity onPress={()=>setFounderOpen(v=>!v)} style={s.founderAccess}><Text style={s.founderAccessText}>FOUNDER ACCESS</Text></TouchableOpacity>
            <Ornament/>
          </ScrollView>}
          {!!error&&isResult&&<Text style={s.error}>{error}</Text>}
        </View>
      </View>
    </View>
  </Modal>;
}

function Ornament(){return <View style={s.ornament}><View style={s.ornamentLine}/><Text style={s.ornamentGlyph}>◆  ✦  ◆</Text><View style={s.ornamentLine}/></View>;}

function FruitIcon({fruit,size=54}) {
  const common={width:size,height:size,alignItems:'center',justifyContent:'center'};
  const body={backgroundColor:fruit.color,borderColor:'#F7D987',borderWidth:1.5,shadowColor:'#000',shadowOpacity:.4,shadowRadius:4,elevation:4};
  if(fruit.id==='cherry') return <View style={common}><View style={{position:'absolute',top:size*.12,left:size*.25,width:size*.28,height:size*.42,borderTopWidth:2,borderRightWidth:2,borderColor:'#8DAD55',borderTopRightRadius:20,transform:[{rotate:'-20deg'}]}}/><View style={{position:'absolute',top:size*.3,left:size*.12,width:size*.38,height:size*.48,borderRadius:size,borderWidth:1.5,borderColor:'#F5B5B5',backgroundColor:'#C91E42'}}/><View style={{position:'absolute',top:size*.32,right:size*.12,width:size*.38,height:size*.48,borderRadius:size,borderWidth:1.5,borderColor:'#F5B5B5',backgroundColor:'#E83D58'}}/></View>;
  if(fruit.id==='watermelon') return <View style={common}><View style={[body,{width:size*.88,height:size*.58,borderRadius:size*.12,transform:[{rotate:'-12deg'}]}]}><View style={{position:'absolute',left:size*.18,top:0,bottom:0,width:2,backgroundColor:'#85C66A'}}/><View style={{position:'absolute',left:size*.42,top:0,bottom:0,width:2,backgroundColor:'#85C66A'}}/><View style={{position:'absolute',left:size*.66,top:0,bottom:0,width:2,backgroundColor:'#85C66A'}}/></View></View>;
  if(fruit.id==='grapes') return <View style={common}><View style={{position:'absolute',top:size*.12,width:size*.25,height:size*.2,backgroundColor:'#8DAD55',borderRadius:size}}/>{Array.from({length:7},(_,i)=><View key={i} style={{position:'absolute',left:size*(.18+(i%3)*.22),top:size*(.28+Math.floor(i/3)*.2),width:size*.25,height:size*.25,borderRadius:size,backgroundColor:i%2?'#8B54B6':'#65358D',borderWidth:1,borderColor:'#D8B2E8'}}/>)}</View>;
  const shape=fruit.id==='pear'?{width:size*.56,height:size*.75,borderRadius:size*.4,borderTopLeftRadius:size*.22,borderTopRightRadius:size*.22}:{width:size*.68,height:size*.68,borderRadius:size*.45};
  return <View style={common}><View style={{position:'absolute',top:size*.12,left:size*.48,width:size*.22,height:size*.14,backgroundColor:'#80A64B',borderTopLeftRadius:size,borderBottomRightRadius:size,transform:[{rotate:'-28deg'}]}}/><View style={{position:'absolute',top:size*.12,width:2,height:size*.18,backgroundColor:'#91613A'}}/><View style={[body,shape]}/>{fruit.id==='strawberry'&&<View style={{position:'absolute',top:size*.35,width:3,height:3,borderRadius:4,backgroundColor:'#FFE8A3'}}/>}</View>;
}

function FruitTile({f,active,lit,dim,disabled,onPress}) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={[s.fruitTile,active&&!disabled&&s.fruitSelected,dim&&s.fruitDim,lit&&s.fruitLit]}>
    <View style={s.fruitArt}><FruitIcon fruit={f} size={51}/></View>
    <Text style={s.fruitName}>{f.name.toUpperCase()}</Text>
    <View style={s.multBadge}><Text style={s.multText}>{f.mult}×</Text></View>
    {lit&&<Text style={s.sparkle}>✦</Text>}
  </TouchableOpacity>;
}

const s=StyleSheet.create({
  backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.94)',justifyContent:'center',alignItems:'center',padding:3},
  outerFrame:{width:'100%',flex:1,borderWidth:2,borderColor:'#9D7835',padding:3,backgroundColor:'#090A0B',shadowColor:'#F5D77C',shadowOpacity:.25,shadowRadius:14,elevation:12},
  innerFrame:{flex:1,borderWidth:1,borderColor:'#D5B76A',backgroundColor:'#090D0F',overflow:'hidden'},
  topBar:{minHeight:57,backgroundColor:'#0B1112',borderBottomWidth:1,borderColor:'#92733C',paddingHorizontal:9,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  brandMark:{flexDirection:'row',alignItems:'center',gap:5},brandCrown:{fontSize:25,color:'#F6D982'},brand:{fontSize:13,fontWeight:'900',letterSpacing:1.5,color:'#F9E4A6'},brandTag:{fontSize:5,color:'#BCA56C',letterSpacing:.7},
  balanceBox:{backgroundColor:'#171712',borderWidth:1,borderColor:'#806638',paddingHorizontal:7,paddingVertical:5,borderRadius:4},smallGold:{fontSize:6,color:'#BCA66E',fontWeight:'900',letterSpacing:.8},balanceValue:{fontSize:12,color:'#FFE69A',fontWeight:'900'},coin:{color:'#F5D77C'},
  roundBox:{alignItems:'center'},roundValue:{fontSize:13,color:'#F6D982',fontWeight:'900'},closeButton:{width:27,height:27,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#806638',borderRadius:14},closeText:{color:'#F6D982',fontSize:23,lineHeight:25},
  mainContent:{paddingHorizontal:9,paddingBottom:9},resultContent:{paddingHorizontal:10,paddingBottom:12,alignItems:'center'},
  ornament:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,marginVertical:8},ornamentLine:{height:1,backgroundColor:'#9B783A',flex:1},ornamentGlyph:{color:'#D8B96B',fontSize:9,letterSpacing:2},
  mainTitle:{textAlign:'center',fontSize:23,fontWeight:'900',fontStyle:'italic',letterSpacing:1.2,color:'#F7DF96',textShadowColor:'#A8782D',textShadowRadius:9,marginTop:1},
  mainSubtitle:{textAlign:'center',fontSize:8,color:'#C8B27C',letterSpacing:1.4,fontWeight:'800',marginTop:3,marginBottom:10},
  statusBar:{height:46,backgroundColor:'#171914',borderWidth:1,borderColor:'#9B793F',borderRadius:5,flexDirection:'row',alignItems:'center',paddingHorizontal:10,marginBottom:8},
  statusDot:{width:7,height:7,borderRadius:5,backgroundColor:'#9ED16D',marginRight:7},statusText:{flex:1,color:'#E6D6A9',fontSize:9,fontWeight:'900',letterSpacing:.8},
  timerBox:{minWidth:59,alignItems:'center',backgroundColor:'#2A2112',borderWidth:1,borderColor:'#C69C4E',borderRadius:4,paddingVertical:3},timerValue:{fontSize:19,color:'#FFE28A',fontWeight:'900',lineHeight:21},timerUnit:{fontSize:6,color:'#D7C18D',letterSpacing:1,fontWeight:'900'},
  boardFrame:{padding:5,backgroundColor:'#14130F',borderWidth:1.5,borderColor:'#A9894B',borderRadius:8,shadowColor:'#D5A84E',shadowOpacity:.2,shadowRadius:8,elevation:4},
  board:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:5},
  fruitTile:{width:'31.9%',height:105,alignItems:'center',justifyContent:'center',backgroundColor:'#171B1B',borderWidth:1,borderColor:'#8E7545',borderRadius:7,paddingVertical:3,overflow:'hidden'},
  fruitSelected:{borderColor:'#FFE49A',borderWidth:2,backgroundColor:'#382A16',shadowColor:'#F5D77C',shadowOpacity:.7,shadowRadius:9,elevation:7},
  fruitDim:{opacity:.38},fruitLit:{backgroundColor:'#5A461F',borderColor:'#FFF1B5',borderWidth:2,shadowColor:'#FFE69A',shadowOpacity:1,shadowRadius:17,elevation:15},
  fruitArt:{height:57,alignItems:'center',justifyContent:'center'},fruitName:{fontSize:8,color:'#E9DDBD',fontWeight:'900',letterSpacing:.8,marginTop:1},
  multBadge:{marginTop:3,minWidth:39,paddingHorizontal:8,paddingVertical:2,backgroundColor:'#5B431B',borderWidth:1,borderColor:'#D4B46A',borderRadius:10,alignItems:'center'},multText:{color:'#FFE49A',fontSize:10,fontWeight:'900'},sparkle:{position:'absolute',right:7,top:4,color:'#FFF6C9',fontSize:20},
  centerCell:{width:'31.9%',height:105,alignItems:'center',justifyContent:'center',backgroundColor:'#1D1911',borderWidth:1.5,borderColor:'#D1AC5D',borderRadius:7},
  centerCrown:{fontSize:24,color:'#F4D47E'},centerTimer:{fontSize:28,color:'#FFF0B0',fontWeight:'900',lineHeight:31,textShadowColor:'#C08B37',textShadowRadius:8},centerSeconds:{fontSize:7,color:'#D6C18D',fontWeight:'900',letterSpacing:1.1},
  betSection:{marginTop:9,padding:8,backgroundColor:'#111716',borderWidth:1,borderColor:'#8E7545',borderRadius:6},
  betHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{color:'#F0D99B',fontSize:9,fontWeight:'900',letterSpacing:1},selectedFruit:{fontSize:7,color:'#C5A96A',fontWeight:'900'},
  chips:{flexDirection:'row',justifyContent:'space-between',gap:4,marginTop:8,marginBottom:8},
  chip:{flex:1,minHeight:34,alignItems:'center',justifyContent:'center',backgroundColor:'#17252A',borderWidth:1,borderColor:'#9B8A61',borderRadius:5,paddingHorizontal:2},chipActive:{backgroundColor:'#C69A3C',borderColor:'#FFF0B0',borderWidth:2},chipText:{fontSize:8,color:'#E9DFC5',fontWeight:'900'},chipTextActive:{color:'#211707'},
  betFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},betTotals:{flex:1},totalLabel:{fontSize:7,color:'#BBAA7D',fontWeight:'900'},totalValue:{fontSize:15,color:'#FBE3A0',fontWeight:'900',marginTop:2},
  betButton:{minHeight:39,backgroundColor:'#D9B35D',borderWidth:1.5,borderColor:'#FFF0B4',borderRadius:5,paddingHorizontal:12,alignItems:'center',justifyContent:'center',shadowColor:'#E5BC61',shadowOpacity:.25,shadowRadius:5},disabledButton:{opacity:.4},betButtonText:{fontSize:9,color:'#251908',fontWeight:'900',letterSpacing:.4},
  historyPanel:{marginTop:8,padding:8,backgroundColor:'#111716',borderWidth:1,borderColor:'#80683E',borderRadius:5},historyHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},historyCaption:{fontSize:6,color:'#A99569',letterSpacing:1,fontWeight:'800'},historyItems:{flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginTop:7,minHeight:35},historyItem:{width:34,height:34,alignItems:'center',justifyContent:'center',backgroundColor:'#1A1D19',borderRadius:17,borderWidth:1,borderColor:'#655433'},
  founderAccess:{alignSelf:'center',paddingVertical:6,paddingHorizontal:12},founderAccessText:{fontSize:6,color:'#776743',letterSpacing:1,fontWeight:'900'},
  founderPanel:{marginBottom:8,padding:9,backgroundColor:'#17150F',borderWidth:1,borderColor:'#C19A4E',borderRadius:5},founderTitle:{color:GOLD,fontSize:10,fontWeight:'900'},founderHint:{color:'#C5B58E',fontSize:8,marginTop:4},founderInput:{height:34,backgroundColor:'#0B1010',borderWidth:1,borderColor:'#76623C',borderRadius:4,color:'#FFF0C5',paddingHorizontal:8,marginTop:6,fontSize:10},founderLogin:{alignSelf:'flex-start',backgroundColor:'#D9B35D',paddingHorizontal:12,paddingVertical:8,borderRadius:4,marginTop:7},founderChoices:{flexDirection:'row',flexWrap:'wrap',gap:5,marginTop:7},founderChoice:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#262116',padding:5,borderRadius:4,borderWidth:1,borderColor:'#9B7A3D'},founderChoiceText:{color:'#F7E6B2',fontSize:8,fontWeight:'900'},founderLogout:{color:'#D9C28B',fontSize:8,marginTop:7},
  error:{color:'#FF9C9C',fontSize:10,padding:7,textAlign:'center'},
  resultEyebrow:{fontSize:8,color:'#D4B76D',fontWeight:'900',letterSpacing:2,marginTop:2},resultRound:{fontSize:8,color:'#BBA77A',letterSpacing:1,fontWeight:'800',marginTop:5},
  winnerHalo:{width:137,height:137,borderRadius:70,borderWidth:2,borderColor:'#CBA65A',backgroundColor:'#1A1A13',alignItems:'center',justifyContent:'center',marginTop:12,shadowColor:'#F6D782',shadowOpacity:.45,shadowRadius:18,elevation:9},haloRing:{width:112,height:112,borderRadius:58,borderWidth:1,borderColor:'#806638',backgroundColor:'#242016',alignItems:'center',justifyContent:'center'},
  winnerCaption:{fontSize:8,color:'#BDA66E',letterSpacing:2,fontWeight:'900',marginTop:8},winnerName:{fontSize:23,color:'#FFE5A0',fontWeight:'900',letterSpacing:1.5,marginTop:3},multPill:{paddingHorizontal:16,paddingVertical:5,borderRadius:15,backgroundColor:'#493719',borderWidth:1,borderColor:'#D7B45D',marginTop:5},multPillText:{fontSize:10,color:'#FFE5A0',fontWeight:'900',letterSpacing:1},
  personalWin:{width:'100%',alignItems:'center',backgroundColor:'#151913',borderWidth:1,borderColor:'#B28B47',borderRadius:6,paddingVertical:9,paddingHorizontal:8,marginTop:12},personalLabel:{color:'#D9C18A',fontSize:8,fontWeight:'900',letterSpacing:1},personalAmount:{color:'#FFE078',fontSize:22,fontWeight:'900',marginTop:4},personalEmpty:{color:'#F2E5C1',fontSize:11,fontWeight:'800',marginTop:5,textAlign:'center'},personalNote:{color:'#B9A77B',fontSize:7,marginTop:3},
  podiumHeading:{alignSelf:'flex-start',fontSize:9,color:'#E9D39A',fontWeight:'900',letterSpacing:1.3,marginTop:13,marginBottom:7},podiumRow:{width:'100%',flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:5},
  podiumCard:{flex:1,minHeight:112,alignItems:'center',justifyContent:'center',backgroundColor:'#171A17',borderWidth:1,borderColor:'#78633C',borderRadius:6,paddingHorizontal:3,paddingTop:14,paddingBottom:7},podiumFirst:{minHeight:127,borderColor:'#D9B75F',backgroundColor:'#292116'},
  rankBadge:{position:'absolute',top:-9,width:21,height:21,borderRadius:11,backgroundColor:'#85613A',borderWidth:1,borderColor:'#D8BC76',alignItems:'center',justifyContent:'center'},rankFirst:{backgroundColor:'#C99B3F'},rankText:{fontSize:10,color:'#FFF1C7',fontWeight:'900'},
  podiumAvatar:{width:39,height:39,borderRadius:20,backgroundColor:'#2B2C25',borderWidth:1.5,borderColor:'#B89A5C',alignItems:'center',justifyContent:'center'},avatarFallback:{fontSize:23,color:'#D6BD7B'},podiumName:{fontSize:8,color:'#E9DDBD',fontWeight:'900',marginTop:6,maxWidth:'100%'},podiumCoins:{fontSize:8,color:'#F5D77C',fontWeight:'900',marginTop:4},noWinners:{color:'#C6B78F',fontSize:9,marginTop:8},
  nextRound:{fontSize:10,color:'#F4D47E',fontWeight:'900',letterSpacing:1,marginTop:12,marginBottom:3}
});