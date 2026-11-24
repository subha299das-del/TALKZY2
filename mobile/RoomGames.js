import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
function RoyalGameArtwork({ art }) {
  const gold = '#E8C477';
  const pale = '#F6E7C4';
  const gem = (color, size = 12) => (
    <View style={{ width: size, height: size, backgroundColor: color, borderWidth: 1, borderColor: '#F7DFA5', borderRadius: 3, transform: [{ rotate: '45deg' }], margin: 3 }} />
  );
  if (art === 'ludo') return (
    <View style={{ width: 48, height: 48, borderWidth: 2, borderColor: gold, borderRadius: 10, backgroundColor: '#21182B', padding: 6, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>
      {['#D94B58', '#4E91D6', '#55B879', '#E6B94F'].map((color, i) => <View key={i} style={{ width: 12, height: 12, borderRadius: 7, backgroundColor: color, borderWidth: 1.5, borderColor: '#F8E4B2' }} />)}
      <View style={{ position: 'absolute', width: 15, height: 15, backgroundColor: '#F1E2C1', borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: gold }}><Text style={{ color: '#261B2D', fontSize: 10, fontWeight: '900' }}>✦</Text></View>
    </View>
  );
  if (art === 'carrom') return (
    <View style={{ width: 50, height: 50, borderRadius: 9, borderWidth: 2, borderColor: gold, backgroundColor: '#3A2419', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: '#D6A85B', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 14, height: 14, borderRadius: 8, backgroundColor: '#E8C477', borderWidth: 2, borderColor: '#FFF0C7' }} />
        <View style={{ position: 'absolute', top: 3, left: 5, width: 7, height: 7, borderRadius: 5, backgroundColor: '#171018', borderWidth: 1, borderColor: gold }} />
        <View style={{ position: 'absolute', bottom: 3, right: 5, width: 7, height: 7, borderRadius: 5, backgroundColor: '#171018', borderWidth: 1, borderColor: gold }} />
      </View>
    </View>
  );
  if (art === 'breez') return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 27, height: 39, borderRadius: 5, backgroundColor: '#D9C39A', borderWidth: 1.5, borderColor: gold, transform: [{ rotate: '-17deg' }], left: 4, top: 6 }} />
      <View style={{ position: 'absolute', width: 27, height: 39, borderRadius: 5, backgroundColor: '#F4E9D2', borderWidth: 1.5, borderColor: gold, transform: [{ rotate: '15deg' }], right: 4, top: 6 }} />
      <View style={{ width: 27, height: 39, borderRadius: 5, backgroundColor: '#21172C', borderWidth: 1.5, borderColor: '#F1D38C', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: gold, fontSize: 17, fontWeight: '900' }}>A</Text><Text style={{ color: '#D9B76D', fontSize: 13 }}>♠</Text>
      </View>
    </View>
  );
  if (art === 'uno') return (
    <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: gold, backgroundColor: '#21172C', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 6, left: 17 }}>{gem('#D94B58', 10)}</View>
      <View style={{ position: 'absolute', top: 17, right: 5 }}>{gem('#4E91D6', 10)}</View>
      <View style={{ position: 'absolute', bottom: 6, left: 17 }}>{gem('#55B879', 10)}</View>
      <View style={{ position: 'absolute', top: 17, left: 5 }}>{gem('#E6B94F', 10)}</View>
      <Text style={{ color: gold, fontSize: 13, fontWeight: '900' }}>✦</Text>
    </View>
  );
  if (art === 'monster') return (
    <View style={{ width: 49, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 1, left: 7, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 3, borderBottomWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: gold, transform: [{ rotate: '-22deg' }] }} />
      <View style={{ position: 'absolute', top: 1, right: 7, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 8, borderBottomWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: gold, transform: [{ rotate: '22deg' }] }} />
      <View style={{ width: 40, height: 38, borderRadius: 15, backgroundColor: '#4B2A62', borderWidth: 2, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ width: 7, height: 9, borderRadius: 5, backgroundColor: '#F4E8C9' }} /><View style={{ width: 7, height: 9, borderRadius: 5, backgroundColor: '#F4E8C9' }} /></View>
        <View style={{ width: 15, height: 4, borderBottomWidth: 2, borderColor: '#F4E8C9', borderRadius: 8, marginTop: 5 }} />
      </View>
    </View>
  );
  if (art === 'truth') return (
    <View style={{ width: 49, height: 49, borderRadius: 25, borderWidth: 3, borderColor: gold, backgroundColor: '#302044', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 37, height: 37, borderRadius: 20, borderWidth: 1, borderColor: '#A9844D' }} />
      <Text style={{ color: pale, fontSize: 24, fontWeight: '900' }}>?</Text><Text style={{ position: 'absolute', bottom: 1, right: 5, color: gold, fontSize: 12 }}>✦</Text>
    </View>
  );
  if (art === 'snake') return (
    <View style={{ width: 52, height: 50, borderRadius: 9, borderWidth: 2, borderColor: gold, backgroundColor: '#21172C', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 12, top: 8, width: 22, height: 33, borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#D9B66D', justifyContent: 'space-evenly' }}>
        {[0,1,2,3].map(i => <View key={i} style={{ height: 2, backgroundColor: '#D9B66D' }} />)}
      </View>
      <Text style={{ color: '#6FC18B', fontSize: 27, fontWeight: '900', textShadowColor: '#D9B66D', textShadowRadius: 5 }}>S</Text>
    </View>
  );
  if (art === 'jackaroo') return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 40, height: 40, borderRadius: 9, backgroundColor: '#1E1828', borderWidth: 2, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: pale, fontSize: 18, fontWeight: '900' }}>♠</Text>
        <View style={{ position: 'absolute', top: 4, left: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#D94B58' }} />
        <View style={{ position: 'absolute', top: 4, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#4E91D6' }} />
        <View style={{ position: 'absolute', bottom: 4, left: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#55B879' }} />
        <View style={{ position: 'absolute', bottom: 4, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E6B94F' }} />
      </View>
    </View>
  );
  if (art === 'brain') return (
    <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: gold, backgroundColor: '#302044', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#E7C477', fontSize: 28, fontWeight: '900' }}>Ψ</Text>
      <Text style={{ position: 'absolute', top: 1, right: 5, color: pale, fontSize: 12 }}>✦</Text>
    </View>
  );
  return (
    <View style={{ width: 52, height: 50, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 30, height: 41, borderRadius: 5, backgroundColor: '#E8D8B8', borderWidth: 1.5, borderColor: gold, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#25182E', fontSize: 10, fontWeight: '900' }}>29</Text><Text style={{ color: '#9B3443', fontSize: 17 }}>♥</Text>
      </View>
      <Text style={{ position: 'absolute', right: 1, bottom: 1, color: gold, fontSize: 16 }}>♠</Text>
    </View>
  );
}

const GOLD='#E8C477', panel='#171222', ink='#F5E9CF', muted='#B6A68A';
const GAMES=[
 {name:'Ludo',art:'ludo',min:2,max:4,bet:true,timed:true,rules:'Roll 6 to enter. Race four tokens home; captures and safe squares apply.'},
 {name:'Carrom',art:'carrom',min:2,max:4,bet:true,timed:true,rules:'Singles or doubles. Pocket your colour and legally cover the Queen.'},
 {name:'Playcards – Breez',art:'breez',min:4,max:4,bet:true,timed:true,rules:'Contract Bridge: bid, play 13 tricks, follow suit and fulfil the contract.'},
 {name:'UNO',art:'uno',min:4,max:4,bet:true,timed:true,rules:'Match colour, number or symbol. Call UNO at one card; first out wins.'},
 {name:'Monster Crush',art:'monster',min:2,max:4,bet:true,timed:true,rules:'Take cannon shots to eliminate monsters and trigger hazards. Limited ammunition.'},
 {name:'Truth and Dare',art:'truth',min:2,max:Infinity,bet:false,timed:false,rules:'Rules to be finalised later.'},
 {name:'Snakes and Ladders',art:'snake',min:2,max:4,bet:true,timed:true,rules:'Roll, climb ladders, slide down snakes. Exact roll to reach 100.'},
 {name:'Jackaroo',art:'jackaroo',min:4,max:4,bet:true,timed:true,rules:'Two partnerships. Use cards to move marbles around the board and into safety.'},
 {name:'Brainstorm',art:'brain',min:2,max:Infinity,bet:false,timed:false,rules:'Rules to be finalised later.'},
 {name:'29',art:'twentynine',min:4,max:4,bet:true,timed:true,rules:'Four players, two partnerships, 32 cards, bidding and hidden trump.'}
];
const suits=['♠','♥','♦','♣'], colors=['red','blue','green','yellow'];
const rand=n=>Math.floor(Math.random()*n);
const makeDeck=(ranks)=>suits.flatMap((s,si)=>ranks.map((r,ri)=>({id:s+String(r)+ri,rank:r,suit:s,color:colors[si]})));
const cardLabel=c=>String(c.rank)+c.suit;
const isRed=s=>s==='♥'||s==='♦';
const Btn=({title,onPress,disabled=false,small=false})=><TouchableOpacity disabled={disabled} onPress={onPress} style={{backgroundColor:'#30213B',borderColor:'#A77D45',borderWidth:1,padding:small?7:10,borderRadius:10,margin:3,alignItems:'center',opacity:disabled?.4:1}}><Text style={{color:ink,fontWeight:'900',fontSize:small?11:13}}>{title}</Text></TouchableOpacity>;
const Tile=({children,onPress,active=false,disabled=false})=><TouchableOpacity disabled={disabled} onPress={onPress} style={{minWidth:40,minHeight:38,padding:8,margin:3,borderRadius:8,borderWidth:1,borderColor:active?GOLD:'#5A4964',backgroundColor:active?'#634B2B':'#251B31',alignItems:'center',justifyContent:'center',opacity:disabled?.4:1}}><Text style={{color:ink,fontWeight:'900',textAlign:'center'}}>{children}</Text></TouchableOpacity>;

function initialGame(name,players,mode=2){
 const ids=players.map(p=>p.id), s={name,players,turn:0,round:1,score:{},status:'Game started.',winner:null};
 ids.forEach(id=>s.score[id]=0);
 if(name==='Ludo') {s.tokens={};players.forEach(p=>s.tokens[p.id]=[-1,-1,-1,-1]);s.consecutiveSix=0;s.safe=[0,8,13,21,26,34,39,47];}
 if(name==='Snakes and Ladders'){s.positions={};ids.forEach(id=>s.positions[id]=0);s.ladders={3:22,8:30,20:41,28:55,50:67,71:91,80:100};s.snakes={17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};}
 if(name==='Carrom'){s.mode=mode;s.coins={white:9,black:9,queen:true};s.colours={};s.queenCovered=false;s.breakAttempts=0;s.shot=0;s.fouls={};}
 if(name==='UNO'){const d=makeDeck(Array.from({length:10},(_,i)=>i).concat(['Skip','Reverse','+2']));const wild=[0,1,2,3].flatMap(i=>[{id:'W'+i,rank:'Wild',color:'wild',suit:'*'},{id:'D'+i,rank:'+4',color:'wild',suit:'*'}]);s.deck=d.concat(wild);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,7));s.discard=[s.deck.shift()];s.direction=1;s.activeColor=s.discard[0].color;s.drawn=null;s.unoCalled={};s.challenge=null;}
 if(name==='Playcards – Breez'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,13));s.bids=[];s.contract=null;s.trump=null;s.trumpChoice=null;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.declarer=null;s.dummy=null;s.dummyRevealed=false;s.contractTricks=0;}
 if(name==='29'){s.deck=makeDeck(['J','9','A','10','K','Q','8','7']);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,8));s.bids=[];s.contract=null;s.trump=null;s.trumpHidden=true;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.teamPoints=[0,0];}
 if(name==='Jackaroo'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,4));s.marbles={};players.forEach(p=>s.marbles[p.id]=[-1,-1,-1,-1]);s.teamSafe=[0,0];s.deckDiscard=[];}
 if(name==='Monster Crush'){s.ammo=8;s.board=Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>({id:r*5+c,type:Math.random()<.68?'monster':(Math.random()<.5?'barrel':'saw'),alive:true})));s.shots=0;}
 return s;
}

function advance(s,n=1){s.turn=(s.turn+n+s.players.length)%s.players.length;return s;}
function clone(s){return JSON.parse(JSON.stringify(s));}
function cardPoints(c){return c.rank==='J'?3:c.rank==='9'?2:(c.rank==='A'||c.rank==='10')?1:0;}
function rank29(r){return ['J','9','A','10','K','Q','8','7'].indexOf(r);}
function applyMove(src,actor,action){
 const s=clone(src), p=s.players[s.turn], id=p?.id;
 if(!p||p.id!==actor||s.winner)return s;
 const finish=()=>{advance(s);return s;};
 if(s.name==='Snakes and Ladders'&&action.type==='roll'){
  const d=action.die,pos=s.positions[id]||0,next=pos+d;
  if(next<=100){s.positions[id]=s.ladders[next]||s.snakes[next]||next;if(s.positions[id]===100)s.winner=id;}
  s.status=next>100?'Need exact roll to reach 100.':s.ladders[next]?'Climbed a ladder!':s.snakes[next]?'Slid down a snake.':'Moved '+d+' spaces.';
  return finish();
 }
 if(s.name==='Ludo'&&action.type==='ludo_roll'){s.pendingDie=action.die;const anyOut=(s.tokens[id]||[]).some(v=>v>=0);if(action.die!==6&&!anyOut){s.status='No 6 — turn passes.';delete s.pendingDie;return finish();}s.status='Rolled '+action.die+'. Choose a token.';return s;}
 if(s.name==='Ludo'&&action.type==='ludo_move'){
  const d=s.pendingDie||action.die,tokens=s.tokens[id].slice(),i=action.token,old=tokens[i];if(!d)return s;
  if(old===-1&&d!==6){s.status='A 6 is required to leave base.';return finish();}
  const next=old===-1?0:old+d;if(next>57){s.status='Exact count needed to enter home.';return finish();}
  tokens[i]=next;s.tokens[id]=tokens;
  if(next<52&&!s.safe.includes(next)){s.players.forEach(op=>{if(op.id!==id)s.tokens[op.id]=s.tokens[op.id].map(v=>{if(v===next){s.status='Captured an opponent token!';return -1;}return v;});});}
  if(tokens.every(v=>v===57))s.winner=id;
  s.consecutiveSix=d===6?(s.consecutiveSix||0)+1:0;
  if(s.consecutiveSix>=3){s.consecutiveSix=0;s.status='Three consecutive sixes: turn forfeited.';return finish();}
  delete s.pendingDie;if(d!==6)advance(s);else s.status='Rolled a 6 — roll again.';
  return s;
 }
 if(s.name==='Carrom'&&action.type==='carrom_shot'){
  const {pocket,own,queen}=action;
  s.shot++;
  if(action.foul){s.fouls[id]=(s.fouls[id]||0)+1;s.status='Foul: turn ends and one of your pocketed coins is returned.';return finish();}
  if(queen&&s.coins.queen){s.coins.queen=false;s.queenPending=true;s.status='Queen pocketed — cover it with your colour on this or next shot.';}
  if(own&&pocket){const colour=s.colours[id]||action.colour;if(!s.colours[id])s.colours[id]=colour;s.coins[colour]=Math.max(0,s.coins[colour]-1);if(s.queenPending){s.queenPending=false;s.queenCovered=true;s.score[id]=(s.score[id]||0)+3;}s.status='Own coin pocketed; shoot again.';return s;}
  if(s.queenPending&&action.missedCover){s.coins.queen=true;s.queenPending=false;s.status='Queen returned to centre.';}
  s.status='No own coin pocketed. Turn passes.';return finish();
 }
 if(s.name==='Monster Crush'&&action.type==='monster_shot'){
  const cell=s.board.flat().find(x=>x.id===action.cell&&x.alive);if(!cell||s.ammo<=0)return s;
  s.ammo--;s.shots++;cell.alive=false;
  const neighbours=s.board.flat().filter(x=>x.alive&&Math.abs(x.id%5-cell.id%5)+Math.abs(Math.floor(x.id/5)-Math.floor(cell.id/5))===1);
  if(cell.type==='barrel')neighbours.forEach(x=>x.alive=false);
  if(cell.type==='saw')s.board.flat().filter(x=>x.alive&&x.type==='monster').slice(0,2).forEach(x=>x.alive=false);
  const remaining=s.board.flat().filter(x=>x.alive&&x.type==='monster').length;
  s.score[id]=(s.score[id]||0)+(cell.type==='monster'?10:5);
  s.status=remaining===0?'All monsters eliminated!':s.ammo===0?'Out of ammunition. Level over.':remaining+' monsters remain.';
  if(remaining===0||s.ammo===0){const winner=s.players.slice().sort((a,b)=>(s.score[b.id]||0)-(s.score[a.id]||0))[0];s.winner=winner?.id;}
  else advance(s);
  return s;
 }
 if(s.name==='UNO'&&action.type==='uno_play'){
  const hand=s.hands[id]||[],c=hand.find(x=>x.id===action.cardId),top=s.discard[s.discard.length-1];if(!c)return s;
  const valid=c.rank==='Wild'||c.rank==='+4'||c.color===s.activeColor||c.rank===top.rank;
  if(!valid)return s;
  if(c.rank==='+4'&&!action.wildColor)return s;
  s.hands[id]=hand.filter(x=>x.id!==c.id);s.discard.push(c);s.activeColor=c.color==='wild'?action.wildColor:c.color;
  if(s.hands[id].length===1&&!action.uno){s.status='UNO! Call UNO before next player acts.';s.unoCalled[id]=false;}
  else if(s.hands[id].length===1)s.unoCalled[id]=true;
  if(!s.hands[id].length){s.winner=id;s.status=p.name+' emptied their hand.';return s;}
  let skip=1;
  if(c.rank==='Skip')skip=2;
  if(c.rank==='Reverse'){s.direction*=-1;if(s.players.length===2)skip=2;}
  if(c.rank==='+2'||c.rank==='+4'){const target=s.players[(s.turn+s.direction+s.players.length)%s.players.length].id;const amount=c.rank==='+2'?2:4;s.hands[target]=s.hands[target].concat(Array.from({length:amount},(_,i)=>s.deck.pop()||{id:'extra'+Date.now()+i,rank:rand(10),color:colors[rand(4)],suit:'*'}));skip=2;}
  if(action.uno)s.unoCalled[id]=true;
  s.turn=(s.turn+s.direction*skip+s.players.length*2)%s.players.length;s.status='Played '+c.rank+'.';return s;
 }
 if(s.name==='UNO'&&action.type==='uno_draw'){const c=s.deck.pop();if(c)s.hands[id].push(c);s.status='Drew one card.';return s;}
 if(s.name==='UNO'&&action.type==='uno_call'){s.unoCalled[id]=true;s.status='UNO called.';return s;}
 if(s.name==='29'&&action.type==='29_bid'){s.bids.push({player:id,bid:action.bid||0,pass:!!action.pass});if(!action.pass&&action.bid>=16){s.contract={player:id,bid:action.bid};s.trump=action.suit||'♠';s.trumpHidden=true;s.status=p.name+' bid '+action.bid+'. Trump is hidden.';}if(s.bids.slice(-3).every(x=>x.pass)&&s.contract){s.status='Bidding complete. Trump will be revealed when a player cannot follow suit.';}return finish();}
 if(s.name==='Playcards – Breez'&&action.type==='bridge_bid'){
  s.bids.push({player:id,bid:action.bid,level:action.level,suit:action.suit});
  if(action.pass){if(s.bids.filter(x=>x.pass).length>=3){s.contract=s.bids.filter(x=>!x.pass).slice(-1)[0]||null;s.status='Bidding complete. Contract set.';}else advance(s);}
  else {s.status='Bid '+action.level+' '+action.suit+'.';advance(s);}
  return s;
 }
 if(s.name==='Playcards – Breez'&&action.type==='bridge_trump'){s.trump=action.suit;s.declarer=id;s.dummy=s.players[(s.turn+2)%4].id;s.dummyRevealed=true;s.status='Trump selected. Play the opening lead.';return s;}
 if((s.name==='Playcards – Breez'||s.name==='29')&&action.type==='trick_card'){
  const hand=s.hands[id]||[],c=hand.find(x=>x.id===action.cardId);if(!c)return s;
  if(s.currentTrick.length&&hand.some(x=>x.suit===s.currentTrick[0].card.suit)&&c.suit!==s.currentTrick[0].card.suit)return s;
  s.hands[id]=hand.filter(x=>x.id!==c.id);s.currentTrick.push({player:id,card:c});
  if(s.currentTrick.length===4){
   const lead=s.currentTrick[0].card.suit,trump=s.trump;
   const eligible=s.currentTrick.filter(x=>trump&&x.card.suit===trump);
   const pool=eligible.length?eligible:s.currentTrick.filter(x=>x.card.suit===lead);
   const rank=s.name==='29'?rank29: (r=>['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(String(r)));
   pool.sort((a,b)=>rank(a.card.rank)-rank(b.card.rank));
   const win=pool[0],wi=s.players.findIndex(x=>x.id===win.player);
   if(s.name==='29'){const team=wi%2;s.teamPoints[team]+=s.currentTrick.reduce((v,x)=>v+cardPoints(x.card),0);if(s.tricks.length===7)s.teamPoints[team]+=1;}
   else if(win.player===s.declarer||s.players[(wi+2)%4]?.id===s.declarer)s.contractTricks++;
   s.tricks.push({winner:win.player,cards:s.currentTrick});s.currentTrick=[];s.turn=wi;s.status='Trick won by '+(s.players[wi]?.name||'player')+'.';
   if(s.tricks.length===13|| (s.name==='29'&&s.tricks.length===8)){s.winner=win.player;s.status=s.name==='29'?'29 complete. Team points: '+s.teamPoints.join(' – '):'Bridge hand complete.';}
  } else advance(s);
  return s;
 }
 if(s.name==='Jackaroo'&&action.type==='jackaroo_play'){
  const c=(s.hands[id]||[]).find(x=>x.id===action.cardId);if(!c)return s;
  const m=s.marbles[id].slice(),i=action.marble,old=m[i],step=({A:1,K:0,Q:12,J:0,'7':7,'4':-4})[c.rank]??Number(c.rank);
  if((c.rank==='A'||c.rank==='K')&&old===-1)m[i]=0;else if(c.rank==='J'&&action.swap){const op=s.players.find(x=>x.id===action.swap.player);if(op){const oi=action.swap.marble;s.marbles[op.id][oi]=old;s.marbles[id][i]=s.marbles[op.id][oi];}}
  else if(old>=0)m[i]=Math.max(0,Math.min(56,old+step));
  else return s;
  s.hands[id]=s.hands[id].filter(x=>x.id!==c.id);s.marbles[id]=m;
  if(m.every(x=>x===56))s.winner=id;
  return finish();
 }
 return s;
}

export default function RoomGames({visible,onClose,onGameAvailable,roomId,creatorName='Player',userId,supabase,isAuthorisedStarter=false,hasRoomSeat=false}){
 const [stage,setStage]=useState('select'),[selected,setSelected]=useState(null),[mode,setMode]=useState(2),[players,setPlayers]=useState([]),[seconds,setSeconds]=useState(60),[state,setState]=useState(null),[bet,setBet]=useState(0),[status,setStatus]=useState('');
 const channelRef=useRef(null),hostRef=useRef(false),lobbyRef=useRef(null),stateRef=useRef(null),stageRef=useRef(stage),timerRef=useRef(null),selectedRef=useRef(selected),playersRef=useRef(players),secondsRef=useRef(seconds),modeRef=useRef(mode);
 const onGameAvailableRef=useRef(onGameAvailable);onGameAvailableRef.current=onGameAvailable;
 stateRef.current=state;stageRef.current=stage;selectedRef.current=selected;playersRef.current=players;secondsRef.current=seconds;modeRef.current=mode;
 const max=selected?.name==='Carrom'?mode:selected?.max;
 const min=selected?.name==='Carrom'?mode:selected?.min;
 const seated=hasRoomSeat;
 const seatExempt=['Truth and Dare','Brainstorm'].includes(selected?.name);
 const canJoin=seatExempt||seated;
 const inLobby=players.some(p=>p.id===userId);
 const current=state?.players?.[state?.turn];
 const isMyTurn=stage==='play'&&current?.id===userId;
 const publish=(type,extra={})=>channelRef.current?.send({type:'broadcast',event:'game_event',payload:{type,roomId,userId,...extra}});
 const sync=next=>{stateRef.current=next;setState(next);publish('game_state',{lobbyId:lobbyRef.current,snapshot:next});};
 const doAction=action=>{if(!isMyTurn||!state)return;if(hostRef.current)sync(applyMove(state,userId,action));else publish('game_action',{lobbyId:lobbyRef.current,action});};
 const reset=()=>{clearInterval(timerRef.current);setStage('select');setSelected(null);setPlayers([]);setState(null);setStatus('');setBet(0);hostRef.current=false;lobbyRef.current=null;};
 const close=()=>{onClose?.();};
 useEffect(()=>{
  if(!roomId||!userId||!supabase)return;
  const ch=supabase.channel('room-games-'+roomId,{config:{private:true}});channelRef.current=ch;
  ch.on('broadcast',{event:'game_event'},({payload:p})=>{
   if(!p||p.roomId!==roomId||p.userId===userId)return;
   if(p.type==='request_state'&&hostRef.current){publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,state:stateRef.current,stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});}
   if(p.type==='create_lobby'&&!lobbyRef.current){lobbyRef.current=p.lobbyId;hostRef.current=false;setSelected(GAMES.find(g=>g.name===p.gameName));setPlayers(p.players);setSeconds(60);setStage('lobby');setStatus('Join this game from the room.');onGameAvailableRef.current?.();}
   if(p.type==='join_game'&&hostRef.current&&p.lobbyId===lobbyRef.current){setPlayers(old=>{const cap=selectedRef.current?.name==='Carrom'?modeRef.current:selectedRef.current?.max;if(old.some(x=>x.id===p.player.id)||old.length>=cap)return old;const next=[...old,p.player];playersRef.current=next;publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:'lobby',selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});return next;});}
   if(p.type==='lobby_state'&&p.lobbyId===lobbyRef.current){setPlayers(p.players||[]);playersRef.current=p.players||[];if(p.mode)setMode(p.mode);if(p.selected){const game=GAMES.find(g=>g.name===p.selected)||null;setSelected(game);if(game&&!['Truth and Dare','Brainstorm'].includes(game.name))onGameAvailableRef.current?.();}if(p.stage==='play'&&p.state){setState(p.state);setStage('play');}else setStage('lobby');}
   if(p.type==='start_game'&&p.lobbyId===lobbyRef.current){setState(p.snapshot);setStage('play');if(!['Truth and Dare','Brainstorm'].includes(p.snapshot?.name))onGameAvailableRef.current?.();}
   if(p.type==='game_action'&&hostRef.current&&p.lobbyId===lobbyRef.current){const next=applyMove(stateRef.current,p.userId,p.action);sync(next);}
   if(p.type==='game_state'&&p.lobbyId===lobbyRef.current&&!hostRef.current){setState(p.snapshot);if(p.snapshot?.winner)setStage('result');}
   if(p.type==='leave_game'&&hostRef.current&&p.lobbyId===lobbyRef.current){setPlayers(old=>old.filter(x=>x.id!==p.playerId));}
   if(p.type==='lobby_closed'&&p.lobbyId===lobbyRef.current){reset();}
  });
  ch.subscribe(st=>{if(st==='SUBSCRIBED')publish('request_state');});
  return()=>{channelRef.current=null;supabase.removeChannel(ch);};
 },[roomId,userId,supabase]);
 useEffect(()=>{if(stage!=='lobby'||!selected?.timed||bet!==0||players.length<2||!hostRef.current)return;timerRef.current=setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);return()=>clearInterval(timerRef.current);},[stage,selected,bet,players.length]);
 useEffect(()=>{if(stage==='lobby'&&seconds===0&&players.length<min)setStatus('Not enough players joined.');},[seconds,stage,players.length,min]);
 const choose=g=>{if(['Truth and Dare','Brainstorm'].includes(g.name)){setStatus(g.name+' is postponed until its rules are finalised.');return;}setSelected(g);setBet(0);setStage('setup');};
 const create=()=>{if(!selected||!userId){setStatus('Choose a game first.');return;}if(['Truth and Dare','Brainstorm'].includes(selected.name)){setStatus('Rules for this game are still being finalised.');return;}const lid=String(Date.now())+'-'+userId,host={id:userId,name:creatorName};hostRef.current=true;lobbyRef.current=lid;setPlayers([host]);setStage('lobby');setStatus('Free play — no Good Coins are deducted or awarded.');publish('create_lobby',{lobbyId:lid,gameName:selected.name,players:[host],bet:0,mode});};
 const join=()=>{if(!canJoin){setStatus('Take a room mic seat before joining this game.');return;}if(inLobby||players.length>=max)return;publish('join_game',{lobbyId:lobbyRef.current,player:{id:userId,name:creatorName}});setStatus('Join request sent.');};
 const start=()=>{if(!isAuthorisedStarter||players.length<min)return;const s=initialGame(selected.name,players,mode);stateRef.current=s;setState(s);setStage('play');publish('start_game',{lobbyId:lobbyRef.current,snapshot:s});};
 const act=action=>doAction(action);
 const roll=()=>act({type:'roll',die:rand(6)+1});
 const currentHand=state?.hands?.[userId]||[];
 const renderControls=()=>{
  if(!state)return null;
  if(state.name==='Snakes and Ladders')return <><Text style={{color:ink}}>Position: {state.positions[userId]} / 100</Text><Btn title="ROLL DICE" onPress={roll}/></>;
  if(state.name==='Ludo')return <><Text style={{color:ink}}>Roll a die, then choose one of your four tokens.</Text><Btn title="ROLL DICE" onPress={()=>act({type:'ludo_roll',die:rand(6)+1})}/>{state.tokens[userId]?.map((v,i)=><Tile key={i} onPress={()=>act({type:'ludo_move',token:i})} disabled={!state.pendingDie|| (v===-1&&state.pendingDie!==6)} active>{'Token '+(i+1)+' · '+(v<0?'Base':v===57?'Home':v)}</Tile>)}</>;
  if(state.name==='UNO')return <><Text style={{color:ink}}>Top: {String(state.discard.at(-1)?.rank)} · Colour: {state.activeColor}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'uno_play',cardId:c.id,wildColor:'red',uno:currentHand.length===2})}>{String(c.rank)} {c.color==='wild'?'★':c.color}</Tile>)}</View><Btn title="DRAW ONE" onPress={()=>act({type:'uno_draw'})}/><Btn title="CALL UNO" onPress={()=>act({type:'uno_call'})}/></>;
  if(state.name==='Playcards – Breez'||state.name==='29')return <><Text style={{color:ink}}>Trump: {state.trump||'Not selected'} · Tricks: {state.tricks.length}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'trick_card',cardId:c.id})}>{cardLabel(c)}</Tile>)}</View><Btn title="PASS / BID" onPress={()=>act(state.name==='29'?{type:'29_bid',bid:16,suit:'♠'}:{type:'bridge_bid',pass:true})}/></>;
  if(state.name==='Jackaroo')return <><Text style={{color:ink}}>Select a card, then a marble. A/K bring a marble out; 7 splits; J swaps.</Text>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'jackaroo_play',cardId:c.id,marble:0})}>{c.rank}</Tile>)}</>;
  if(state.name==='Carrom')return <><Text style={{color:ink}}>Coins left — White {state.coins.white}, Black {state.coins.black}, Queen {state.coins.queen?'on board':'pocketed'}</Text><Btn title="POCKET OWN COIN" onPress={()=>act({type:'carrom_shot',pocket:true,own:true,colour:state.colours[userId]||'white'})}/><Btn title="MISS SHOT" onPress={()=>act({type:'carrom_shot'})}/><Btn title="FOUL" onPress={()=>act({type:'carrom_shot',foul:true})}/></>;
  if(state.name==='Monster Crush')return <><Text style={{color:ink}}>Ammo: {state.ammo} · Shots: {state.shots} · Monsters left: {state.board.flat().filter(x=>x.alive&&x.type==='monster').length}</Text><View style={{alignSelf:'center'}}>{state.board.map((row,ri)=><View key={ri} style={{flexDirection:'row'}}>{row.map(cell=><Tile key={cell.id} disabled={!cell.alive||state.ammo===0} onPress={()=>act({type:'monster_shot',cell:cell.id})}>{cell.alive?(cell.type==='monster'?'👾':cell.type==='barrel'?'💣':'⚙️'):'·'}</Tile>)}</View>)}</View></>;
  return null;
 };
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.82)',justifyContent:'center',padding:12}}><View style={{maxHeight:'94%',backgroundColor:panel,borderColor:GOLD,borderWidth:1.5,borderRadius:20,padding:14}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><View><Text style={{color:GOLD,fontWeight:'900',fontSize:17}}>♛ TALKZY ROYAL GAMES</Text><Text style={{color:muted,fontSize:10}}>ROOM GAME ARENA</Text></View><TouchableOpacity onPress={close}><Text style={{color:GOLD,fontSize:22}}>✕</Text></TouchableOpacity></View>
  {stage==='select'&&<ScrollView><View style={{flexDirection:'row',flexWrap:'wrap'}}>{GAMES.map(g=><TouchableOpacity key={g.name} onPress={()=>choose(g)} style={{width:'25%',padding:4,alignItems:'center'}}><View style={{width:62,height:62,borderRadius:14,backgroundColor:'#2A1D32',borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center'}}><RoyalGameArtwork art={g.art}/></View><Text style={{color:ink,fontSize:10,textAlign:'center'}}>{g.name}</Text></TouchableOpacity>)}</View></ScrollView>}
  {stage==='setup'&&<View><Text style={{color:GOLD,fontSize:18,textAlign:'center',fontWeight:'900'}}>{selected.name}</Text><Text style={{color:muted,textAlign:'center',margin:8}}>{selected.rules}</Text><Text style={{color:ink}}>Players: {min} required · {max===Infinity?'Unlimited':max+' maximum'}</Text>{selected.name==='Carrom'&&<View style={{flexDirection:'row'}}><Btn title="2 PLAYERS" onPress={()=>setMode(2)}/><Btn title="4 PLAYERS" onPress={()=>setMode(4)}/></View>}{!canJoin&&<Text style={{color:GOLD}}>You can create the lobby without a mic seat. Other players need a mic seat to join this game.</Text>}<Btn title="CREATE GAME" onPress={create}/><Btn title="BACK" onPress={()=>setStage('select')}/></View>}
  {stage==='lobby'&&<View><Text style={{color:GOLD,fontSize:18,textAlign:'center'}}>{selected?.name} Lobby</Text><Text style={{color:ink,textAlign:'center'}}>{players.length}/{max===Infinity?'∞':max} players · Free play (0 Good Coins)</Text>{selected?.timed&&<Text style={{color:GOLD,textAlign:'center'}}>{seconds}s</Text>}{players.map(p=><Text key={p.id} style={{color:ink,padding:7}}>{p.name}</Text>)}<Text style={{color:muted}}>{status}</Text>{!inLobby&&<Btn title="JOIN GAME" onPress={join} disabled={!canJoin||players.length>=max}/>}<Btn title="START GAME" onPress={start} disabled={!isAuthorisedStarter||players.length<min}/><Text style={{color:muted,textAlign:'center'}}>Only room owner or authorised admin can start.</Text></View>}
  {stage==='play'&&<ScrollView><Text style={{color:GOLD,fontSize:18,textAlign:'center'}}>{selected?.name}</Text><Text style={{color:ink,textAlign:'center'}}>Turn: {current?.name||'—'}</Text><Text style={{color:muted,textAlign:'center'}}>{state.status}</Text><View style={{backgroundColor:'#21182B',padding:10,borderRadius:12}}>{isMyTurn?renderControls():<Text style={{color:ink}}>Waiting for {current?.name||'player'}.</Text>}</View>{state.winner&&<Btn title="VIEW RESULT" onPress={()=>setStage('result')}/>}</ScrollView>}
  {stage==='result'&&<View><Text style={{color:GOLD,fontSize:20,textAlign:'center'}}>GAME RESULT</Text><Text style={{color:ink,textAlign:'center'}}>Winner: {state?.players?.find(p=>p.id===state.winner)?.name||'—'}</Text><Btn title="BACK TO GAMES" onPress={reset}/></View>}
 </View></View></Modal>;
}
