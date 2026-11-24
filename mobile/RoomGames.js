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
 {name:'UNO',art:'uno',min:2,max:10,bet:true,timed:true,rules:'Classic Mattel UNO: 108-card deck, 7 cards each, match colour/number/symbol, action cards, Wild Draw Four challenge, UNO call and 500-point match.'},
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
 if(name==='Carrom'){s.mode=mode;s.carromBoard=createCarromBoard();s.colours={};s.teamColours=[null,null];s.queenPending=null;s.queenCoveredBy=null;s.breakAttempts=0;s.shot=0;s.fouls={};s.boardNumber=1;s.boardComplete=false;s.matchPoints=[0,0];s.score={};ids.forEach(id=>s.score[id]=0);s.boardsPlayed=0;}
 if(name==='UNO'){s.deck=[];let cardNo=0;colors.forEach(color=>{s.deck.push({id:'UNO-'+(cardNo++),rank:0,color,suit:'*'});for(let n=1;n<=9;n++)for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank:n,color,suit:'*'});for(const rank of ['Skip','Reverse','+2'])for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank,color,suit:'*'});});for(let copy=0;copy<4;copy++){s.deck.push({id:'UNO-'+(cardNo++),rank:'Wild',color:'wild',suit:'*'});s.deck.push({id:'UNO-'+(cardNo++),rank:'+4',color:'wild',suit:'*'});}for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,7));let first=s.deck.shift();while(first?.rank==='+4'){s.deck.push(first);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}first=s.deck.shift();}s.discard=[first];s.direction=first?.rank==='Reverse'?-1:1;s.activeColor=first?.color||'red';s.drawnCard=null;s.pendingUno=null;s.pendingChallenge=null;s.unoCalled={};s.matchPoints={};s.roundPoints=0;ids.forEach(id=>s.matchPoints[id]=0);if(first?.rank==='+2'){unoDraw(s,players[s.turn].id,2);advance(s);}else if(first?.rank==='Skip')advance(s);}
 if(name==='Playcards – Breez'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,13));s.bids=[];s.contract=null;s.trump=null;s.trumpChoice=null;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.declarer=null;s.dummy=null;s.dummyRevealed=false;s.contractTricks=0;}
 if(name==='29'){s.deck=makeDeck(['J','9','A','10','K','Q','8','7']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,4));s.bids=[];s.bidCount=0;s.highBid=0;s.contract=null;s.trump=null;s.trumpHidden=true;s.trumpRevealed=false;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.teamPoints=[0,0];s.matchScore=[0,0];s.phase='bidding';s.lastTrickTeam=null;}
 if(name==='Jackaroo'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);s.deck.sort(()=>Math.random()-.5);s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,4));s.marbles={};players.forEach(p=>s.marbles[p.id]=[-1,-1,-1,-1]);s.teamSafe=[0,0];s.deckDiscard=[];}
 if(name==='Monster Crush'){s.ammo=8;s.board=Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>({id:r*5+c,type:Math.random()<.68?'monster':(Math.random()<.5?'barrel':'saw'),alive:true})));s.shots=0;}
 return s;
}

function advance(s,n=1){s.turn=(s.turn+n+s.players.length)%s.players.length;return s;}
function clone(s){return JSON.parse(JSON.stringify(s));}
function unoDraw(s,playerId,count=1){
 const hand=s.hands[playerId]||[];
 for(let i=0;i<count;i++){
  if(!s.deck.length&&s.discard.length>1){
   const top=s.discard.pop();s.deck=s.discard.splice(0);s.discard=[top];
   for(let j=s.deck.length-1;j>0;j--){const k=rand(j+1);[s.deck[j],s.deck[k]]=[s.deck[k],s.deck[j]];}
  }
  if(s.deck.length)hand.push(s.deck.pop());
 }
 s.hands[playerId]=hand;
}
function unoCardPoints(c){return typeof c.rank==='number'?c.rank:['Skip','Reverse','+2'].includes(c.rank)?20:50;}
function createCarromBoard(){
 const coins=[{id:'Q',color:'queen',x:500,y:500,vx:0,vy:0,pocketed:false}];
 let n=0;
 for(let i=0;i<6;i++){const a=(Math.PI*2*i)/6;coins.push({id:'C'+(n++),color:i%2?'black':'white',x:500+Math.cos(a)*43,y:500+Math.sin(a)*43,vx:0,vy:0,pocketed:false});}
 for(let i=0;i<12;i++){const a=(Math.PI*2*i)/12;coins.push({id:'C'+(n++),color:i%2?'white':'black',x:500+Math.cos(a)*91,y:500+Math.sin(a)*91,vx:0,vy:0,pocketed:false});}
 return {coins,striker:{x:500,y:900,vx:0,vy:0,pocketed:false},pocketed:{white:0,black:0},queenCoveredBy:null,offBoard:false};
}
function carromShoot(board,playerIndex,angle,power){
 const b=clone(board),starts=[{x:500,y:900},{x:100,y:500},{x:500,y:100},{x:900,y:500}],start=starts[playerIndex%4];
 b.striker={...start,vx:Math.cos(angle*Math.PI/180)*power,vy:Math.sin(angle*Math.PI/180)*power,pocketed:false};
 const pieces=[...b.coins.filter(x=>!x.pocketed),b.striker],r=18,sr=21,friction=.986;
 let moving=true,steps=0;
 while(moving&&steps++<260){
  moving=false;
  pieces.forEach(p=>{if(p.pocketed)return;p.x+=p.vx;p.y+=p.vy;p.vx*=friction;p.vy*=friction;if(Math.abs(p.vx)+Math.abs(p.vy)>.16)moving=true;else{p.vx=0;p.vy=0;}
   const pockets=[[0,0],[1000,0],[0,1000],[1000,1000]];
   const pocket=pockets.some(q=>Math.hypot(p.x-q[0],p.y-q[1])<58);
   if(pocket){p.pocketed=true;p.vx=0;p.vy=0;return;}
   const radius=p===b.striker?sr:r;
   if(p.x<radius){p.x=radius;p.vx=Math.abs(p.vx)*.82;}if(p.x>1000-radius){p.x=1000-radius;p.vx=-Math.abs(p.vx)*.82;}
   if(p.y<radius){p.y=radius;p.vy=Math.abs(p.vy)*.82;}if(p.y>1000-radius){p.y=1000-radius;p.vy=-Math.abs(p.vy)*.82;}
   if(p.x<-30||p.x>1030||p.y<-30||p.y>1030)b.offBoard=true;
  });
  for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++){
   const a=pieces[i],d=pieces[j];if(a.pocketed||d.pocketed)continue;
   let dx=d.x-a.x,dy=d.y-a.y,dist=Math.hypot(dx,dy),min=(a===b.striker?sr:r)+(d===b.striker?sr:r);
   if(dist>0&&dist<min){const nx=dx/dist,ny=dy/dist,overlap=min-dist;a.x-=nx*overlap/2;a.y-=ny*overlap/2;d.x+=nx*overlap/2;d.y+=ny*overlap/2;const rel=(d.vx-a.vx)*nx+(d.vy-a.vy)*ny;if(rel<0){const impulse=-(1+.9)*rel/2;a.vx-=impulse*nx;a.vy-=impulse*ny;d.vx+=impulse*nx;d.vy+=impulse*ny;}}
  }
 }
 b.strikerPocketed=b.striker.pocketed;b.pocketed={white:0,black:0};
 b.coins.forEach(x=>{if(x.pocketed&&(x.color==='white'||x.color==='black'))b.pocketed[x.color]++;});
 return b;
}
function unoRoundEnd(s,winnerId){
 s.winner=winnerId;s.roundWinner=winnerId;
 const points=s.players.reduce((n,p)=>n+(s.hands[p.id]||[]).reduce((a,c)=>a+unoCardPoints(c),0),0);
 s.matchPoints[winnerId]=(s.matchPoints[winnerId]||0)+points;
 s.roundPoints=points;
 const matchWinner=s.players.find(p=>(s.matchPoints[p.id]||0)>=500);
 if(matchWinner)s.matchWinner=matchWinner.id;
 s.status=(s.players.find(p=>p.id===winnerId)?.name||'Player')+' wins the round and scores '+points+' points.';
}
function gameResults(s){
 if(!s?.players?.length)return [];
 const ids=s.players.map(p=>p.id), scoreById={};
 ids.forEach(id=>{scoreById[id]=Number(s.score?.[id]||0);});
 let higherIsBetter=true, detail='Points';
 if(s.name==='Ludo'){
  ids.forEach(id=>{const tokens=s.tokens?.[id]||[];scoreById[id]=tokens.reduce((n,v)=>n+(v===57?100:v>=0?v:0),0);});
  detail='Progress points';
 }else if(s.name==='Snakes and Ladders'){
  ids.forEach(id=>{scoreById[id]=Number(s.positions?.[id]||0);});detail='Board position';
 }else if(s.name==='Carrom'){
  ids.forEach(id=>{const color=s.colours?.[id];scoreById[id]=color?9-Number(s.coins?.[color]??9):0;if(s.queenCovered&&color)scoreById[id]+=3;});detail='Coins pocketed';
 }else if(s.name==='Jackaroo'){
  ids.forEach(id=>{scoreById[id]=(s.marbles?.[id]||[]).reduce((n,v)=>n+(v===56?100:v>=0?v:0),0);});detail='Marble progress';
 }else if(s.name==='UNO'){
  ids.forEach(id=>{scoreById[id]=Number(s.matchPoints?.[id]||0);});
  detail='Match points (first to 500 wins)';
 }else if(s.name==='Playcards – Breez'){
  const declarer=s.declarer||s.contract?.player;
  const declarerSide=declarer?s.players.findIndex(p=>p.id===declarer)%2:null;
  const won=Number(s.contractTricks||0);
  ids.forEach((id,i)=>{scoreById[id]=declarerSide===null?0:(i%2===declarerSide?won:13-won);});
  detail='Team tricks';
 }else if(s.name==='29'){
  ids.forEach((id,i)=>{scoreById[id]=Number(s.matchScore?.[i%2]||0);});detail='Team match score';
 }else if(s.name==='Monster Crush'){
  ids.forEach(id=>{scoreById[id]=Number(s.score?.[id]||0);});detail='Points';
 }
 const winner=s.winner;
 const rows=s.players.map((p,i)=>({id:p.id,name:p.name||'Player',score:scoreById[p.id]||0,seat:i}));
 rows.sort((a,b)=>{
  if(a.id===winner&&b.id!==winner)return -1;
  if(b.id===winner&&a.id!==winner)return 1;
  const diff=higherIsBetter?b.score-a.score:a.score-b.score;
  return diff||a.seat-b.seat;
 });
 let rank=0,lastScore=null;
 return rows.map((p,i)=>{if(i===0||p.score!==lastScore)rank=i+1;lastScore=p.score;return {...p,rank,detail};});
}
function cardPoints(c){return c.rank==='J'?3:c.rank==='9'?2:(c.rank==='A'||c.rank==='10')?1:0;}
function rank29(r){return ['J','9','A','10','K','Q','8','7'].indexOf(r);}
function applyMove(src,actor,action){
 const s=clone(src), p=s.players[s.turn], id=p?.id;
 if(!p||p.id!==actor||(s.winner&&!((s.name==='UNO'&&action.type==='uno_next_round')||(s.name==='29'&&action.type==='29_next_hand'))))return s;
 const finish=()=>{advance(s);return s;};
 if(s.name==='Snakes and Ladders'&&action.type==='roll'){
  if(!Number.isInteger(action.die)||action.die<1||action.die>6)return s;
  const d=action.die,pos=s.positions[id]||0,next=pos+d;
  if(next<=100){s.positions[id]=s.ladders[next]||s.snakes[next]||next;if(s.positions[id]===100)s.winner=id;}
  s.status=next>100?'Need exact roll to reach 100.':s.ladders[next]?'Climbed a ladder!':s.snakes[next]?'Slid down a snake.':'Moved '+d+' spaces.';
  return finish();
 }
 if(s.name==='Ludo'&&action.type==='ludo_roll'){if(!Number.isInteger(action.die)||action.die<1||action.die>6)return s;s.pendingDie=action.die;const anyOut=(s.tokens[id]||[]).some(v=>v>=0);if(action.die!==6&&!anyOut){s.status='No 6 — turn passes.';delete s.pendingDie;return finish();}s.status='Rolled '+action.die+'. Choose a token.';return s;}
 if(s.name==='Ludo'&&action.type==='ludo_move'){
  const d=s.pendingDie||action.die,tokens=s.tokens[id].slice(),i=action.token;if(!Number.isInteger(i)||i<0||i>=4)return s;const old=tokens[i];if(!d||old===57)return s;
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
  if(s.boardComplete)return s;
  const team=s.turn%2,oldBoard=s.carromBoard,board=carromShoot(oldBoard,s.turn,Number(action.angle)||0,Math.max(4,Math.min(28,Number(action.power)||14)));
  const newly=board.coins.filter(x=>x.pocketed&&!oldBoard.coins.find(o=>o.id===x.id)?.pocketed);
  const firstCoin=newly.find(x=>x.color==='white'||x.color==='black');
  if(!s.teamColours[team]&&firstCoin){s.teamColours[team]=firstCoin.color;s.teamColours[1-team]=firstCoin.color==='white'?'black':'white';s.players.forEach((pl,i)=>{s.colours[pl.id]=s.teamColours[i%2];});}
  const ownColor=s.teamColours[team],ownPocketed=newly.some(x=>x.color===ownColor),opponentPocketed=!!ownColor&&newly.some(x=>(x.color==='white'||x.color==='black')&&x.color!==ownColor);
  const foul=board.strikerPocketed||board.offBoard||opponentPocketed;
  s.shot++;
  if(foul){
   s.fouls[id]=(s.fouls[id]||0)+1;
   const returned=newly.find(x=>x.color!=='queen')||newly[0];
   if(returned){const coin=board.coins.find(x=>x.id===returned.id);coin.pocketed=false;coin.x=500;coin.y=500;coin.vx=0;coin.vy=0;}
   if(newly.some(x=>x.color==='queen')){const q=board.coins.find(x=>x.color==='queen');q.pocketed=false;q.x=500;q.y=500;}
   board.pocketed={white:0,black:0};board.coins.forEach(x=>{if(x.pocketed&&(x.color==='white'||x.color==='black'))board.pocketed[x.color]++;});
   s.carromBoard=board;s.queenPending=null;s.status='Foul: striker, opponent coin or off-board. One pocketed coin returned to centre.';advance(s);return s;
  }
  const queenShot=newly.some(x=>x.color==='queen');
  if(queenShot)s.queenPending={team,playerId:id};
  if(s.queenPending&&ownPocketed){s.queenPending=null;s.queenCoveredBy=team;board.queenCoveredBy=team;}
  else if(s.queenPending&&!ownPocketed&&!queenShot){
   const q=board.coins.find(x=>x.color==='queen');if(q){q.pocketed=false;q.x=500;q.y=500;q.vx=0;q.vy=0;}
   s.queenPending=null;s.queenCoveredBy=null;board.queenCoveredBy=null;
  }
  s.carromBoard=board;
  if(ownColor&&board.pocketed[ownColor]>=9){
   const last=newly.filter(x=>x.color===ownColor).slice(-1)[0];
   if(!s.queenCoveredBy||s.queenCoveredBy!==team){
    if(last){const coin=board.coins.find(x=>x.id===last.id);coin.pocketed=false;coin.x=500;coin.y=500;}
    const q=board.coins.find(x=>x.color==='queen');if(q){q.pocketed=false;q.x=500;q.y=500;}
    board.pocketed[ownColor]=Math.max(0,board.pocketed[ownColor]-1);s.queenPending=null;s.status='Final coin before a covered Queen: Queen and final coin return to centre.';advance(s);return s;
   }
   const opponentColor=s.teamColours[1-team],points=Math.max(0,9-board.pocketed[opponentColor])+(s.queenCoveredBy===team?3:0);
   s.matchPoints[team]+=points;s.boardsPlayed++;s.boardComplete=true;s.status='Board won. Team earns '+points+' points.';
   s.players.forEach((pl,i)=>{s.score[pl.id]=s.matchPoints[i%2];});
   if(s.matchPoints[team]>=25||s.boardsPlayed>=8){
    const winningTeam=s.matchPoints[0]===s.matchPoints[1]?team:s.matchPoints[0]>s.matchPoints[1]?0:1;
    s.winner=s.players.find((pl,i)=>i%2===winningTeam)?.id;s.matchWinner=winningTeam;s.status='Carrom match complete. Final score '+s.matchPoints.join(' – ')+'.';
   }
   return s;
  }
  if(ownPocketed||queenShot){s.status=queenShot&&!ownPocketed?'Queen pocketed. Cover it with your own coin on the next shot.':'Own coin pocketed. Shoot again.';return s;}
  if(s.shot<=1&&s.boardsPlayed===0&&s.breakAttempts<2){s.breakAttempts++;s.status='Break attempt '+(s.breakAttempts+1)+' of 3.';return s;}
  s.breakAttempts=0;s.status='No own coin pocketed. Turn passes.';advance(s);return s;
 }
 if(s.name==='Carrom'&&action.type==='carrom_next_board'){
  if(!s.boardComplete||s.winner)return s;
  const next=initialGame('Carrom',s.players,s.mode);next.boardNumber=s.boardNumber+1;next.boardsPlayed=s.boardsPlayed;next.matchPoints=[...s.matchPoints];next.score={};next.players.forEach((pl,i)=>next.score[pl.id]=next.matchPoints[i%2]);next.turn=(s.turn+1)%s.players.length;next.status='Board '+next.boardNumber+' started.';return next;
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
  const hand=s.hands[id]||[],c=hand.find(x=>x.id===action.cardId),top=s.discard[s.discard.length-1];
  if(!c|| (s.drawnCard&&s.drawnCard!==c.id))return s;
  const valid=c.rank==='Wild'||c.rank==='+4'||c.color===s.activeColor||c.rank===top.rank;
  if(!valid)return s;
  if((c.rank==='Wild'||c.rank==='+4')&&!colors.includes(action.wildColor))return s;
  const previousColor=s.activeColor,hadMatchingColor=hand.some(x=>x.id!==c.id&&x.color===previousColor);
  s.hands[id]=hand.filter(x=>x.id!==c.id);s.discard.push(c);s.activeColor=c.color==='wild'?action.wildColor:c.color;s.drawnCard=null;
  if(s.hands[id].length===1){s.pendingUno=action.uno?null:id;}
  else s.pendingUno=null;
  if(!s.hands[id].length&&c.rank!=='+4'){
   if(c.rank==='+2'){const target=s.players[(s.turn+s.direction+s.players.length)%s.players.length].id;unoDraw(s,target,2);}
   unoRoundEnd(s,id);return s;
  }
  if(c.rank==='+4'){
   s.pendingChallenge={offender:id,target:s.players[(s.turn+s.direction+s.players.length)%s.players.length].id,hadMatchingColor,chosenColor:action.wildColor};
   s.turn=(s.turn+s.direction+s.players.length)%s.players.length;s.status='Wild Draw Four played. The next player may challenge or accept the draw.';return s;
  }
  let skip=1;
  if(c.rank==='Skip')skip=2;
  if(c.rank==='Reverse'){s.direction*=-1;if(s.players.length===2)skip=2;}
  if(c.rank==='+2'){const target=s.players[(s.turn+s.direction+s.players.length)%s.players.length].id;unoDraw(s,target,2);skip=2;}
  s.turn=(s.turn+s.direction*skip+s.players.length*2)%s.players.length;s.status='Played '+c.rank+'.';
  return s;
 }
 if(s.name==='UNO'&&action.type==='uno_draw'){
  if(s.drawnCard)return s;
  s.pendingUno=null;
  const before=(s.hands[id]||[]).length;unoDraw(s,id,1);const hand=s.hands[id]||[];
  if(hand.length===before){s.status='No cards remain in the draw pile.';advance(s);return s;}
  const drawn=hand[hand.length-1],top=s.discard[s.discard.length-1];
  const playable=drawn.rank==='Wild'||drawn.rank==='+4'||drawn.color===s.activeColor||drawn.rank===top.rank;
  if(playable){s.drawnCard=drawn.id;s.status='Drawn card may be played, or pass.';return s;}
  s.status='Drew one card; turn passes.';advance(s);return s;
 }
 if(s.name==='UNO'&&action.type==='uno_pass_drawn'){if(!s.drawnCard)return s;s.drawnCard=null;s.pendingUno=null;s.status='Turn passed.';advance(s);return s;}
 if(s.name==='UNO'&&action.type==='uno_call'){if(s.pendingUno!==id)return s;s.pendingUno=null;s.status='UNO called.';return s;}
 if(s.name==='UNO'&&action.type==='uno_catch'){
  if(!s.pendingUno||s.pendingUno===id)return s;unoDraw(s,s.pendingUno,2);s.status='UNO not called in time: two-card penalty.';s.pendingUno=null;return s;
 }
 if(s.name==='UNO'&&action.type==='uno_challenge'){
  const challenge=s.pendingChallenge;if(!challenge||challenge.target!==id)return s;
  if(challenge.hadMatchingColor){unoDraw(s,challenge.offender,4);s.pendingUno=null;if(!(s.hands[challenge.offender]||[]).length)unoRoundEnd(s,challenge.offender);else{s.turn=s.players.findIndex(p=>p.id===challenge.offender);s.status='Challenge successful. The Wild Draw Four player draws four.';}}
  else{unoDraw(s,id,6);s.status='Challenge unsuccessful. Draw six cards.';if(!(s.hands[challenge.offender]||[]).length)unoRoundEnd(s,challenge.offender);else advance(s);}
  s.pendingChallenge=null;return s;
 }
 if(s.name==='UNO'&&action.type==='uno_accept'){
  const challenge=s.pendingChallenge;if(!challenge||challenge.target!==id)return s;
  unoDraw(s,id,4);s.pendingChallenge=null;if(!(s.hands[challenge.offender]||[]).length){unoRoundEnd(s,challenge.offender);return s;}s.status='Drew four cards; turn skipped.';advance(s);return s;
 }
 if(s.name==='29'&&action.type==='29_next_hand'){if(!s.winner||s.matchWinner!==null)return s;const next=initialGame('29',s.players);next.round=s.round+1;next.matchScore=[...s.matchScore];next.status='Next hand started.';return next;}
 if(s.name==='UNO'&&action.type==='uno_next_round'){
  if(!s.winner||s.matchWinner)return s;
  const next=initialGame('UNO',s.players);next.round=s.round+1;next.matchPoints={...s.matchPoints};next.status='Round '+next.round+' started.';return next;
 }
 if(s.name==='29'&&action.type==='29_bid'){
  if(s.phase!=='bidding'||s.bidCount>=4)return s;
  const bid=action.pass?0:Number(action.bid);
  if(!action.pass&&(!Number.isInteger(bid)||bid<16||bid>28||bid<=s.highBid))return s;
  s.bids.push({player:id,bid,pass:!!action.pass});s.bidCount++;
  if(!action.pass){s.highBid=bid;s.contract={player:id,bid};}
  if(s.bidCount===4){
   const winning=s.bids.filter(x=>!x.pass).slice(-1)[0];
   if(!winning){const next=initialGame('29',s.players);next.round=s.round+1;next.matchScore=[...s.matchScore];next.status='All players passed. New deal.';return next;}
   s.contract=winning;s.phase='deal2';
   s.players.forEach(p=>{s.hands[p.id]=s.hands[p.id].concat(s.deck.splice(0,4));});
   s.turn=s.players.findIndex(p=>p.id===s.contract.player);s.status='Second four cards dealt. Bid winner must select hidden trump.';return s;
  }
  advance(s,-1);s.status=action.pass?'Passed.':'Bid '+bid+'.';return s;
 }
 if(s.name==='29'&&action.type==='29_trump'){
  if(s.phase!=='deal2'||s.contract?.player!==id||!suits.includes(action.suit))return s;
  s.trump=action.suit;s.trumpHidden=true;s.phase='play';s.turn=0;s.trickLeader=0;s.status='Trump selected and hidden. Play begins.';return s;
 }
 if(s.name==='29'&&action.type==='29_reveal_trump'){
  if(s.phase!=='play'||!s.trumpHidden||!s.currentTrick.length)return s;
  const lead=s.currentTrick[0].card.suit,hand=s.hands[id]||[];
  if(hand.some(card=>card.suit===lead))return s;
  s.trumpHidden=false;s.trumpRevealed=true;s.status='Trump revealed: '+s.trump+'.';return s;
 }
 if(s.name==='Playcards – Breez'&&action.type==='bridge_bid'){
  s.bids.push({player:id,bid:action.bid,level:action.level,suit:action.suit});
  if(action.pass){if(s.bids.filter(x=>x.pass).length>=3){s.contract=s.bids.filter(x=>!x.pass).slice(-1)[0]||null;s.status='Bidding complete. Contract set.';}else advance(s);}
  else {s.status='Bid '+action.level+' '+action.suit+'.';advance(s);}
  return s;
 }
 if(s.name==='Playcards – Breez'&&action.type==='bridge_trump'){s.trump=action.suit;s.declarer=id;s.dummy=s.players[(s.turn+2)%4].id;s.dummyRevealed=true;s.status='Trump selected. Play the opening lead.';return s;}
 if((s.name==='Playcards – Breez'||s.name==='29')&&action.type==='trick_card'){
  if(s.name==='29'&&s.phase!=='play')return s;
  const hand=s.hands[id]||[],c=hand.find(x=>x.id===action.cardId);if(!c)return s;
  if(s.currentTrick.length&&hand.some(x=>x.suit===s.currentTrick[0].card.suit)&&c.suit!==s.currentTrick[0].card.suit)return s;
  if(s.name==='29'&&s.currentTrick.length&&s.trumpHidden&&!hand.some(x=>x.suit===s.currentTrick[0].card.suit))return s;
  s.hands[id]=hand.filter(x=>x.id!==c.id);s.currentTrick.push({player:id,card:c});
  if(s.currentTrick.length===4){
   const lead=s.currentTrick[0].card.suit,trump=s.name==='29'&&!s.trumpRevealed?null:s.trump;
   const eligible=s.currentTrick.filter(x=>trump&&x.card.suit===trump);
   const pool=eligible.length?eligible:s.currentTrick.filter(x=>x.card.suit===lead);
   const rank=s.name==='29'?rank29:(r=>['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(String(r)));
   pool.sort((a,b)=>rank(a.card.rank)-rank(b.card.rank));
   const win=pool[0],wi=s.players.findIndex(x=>x.id===win.player);
   if(s.name==='29'){
    const team=wi%2;s.teamPoints[team]+=s.currentTrick.reduce((v,x)=>v+cardPoints(x.card),0);
    if(s.tricks.length===7){s.teamPoints[team]+=1;s.lastTrickTeam=team;}
   }else if(win.player===s.declarer||s.players[(wi+2)%4]?.id===s.declarer)s.contractTricks++;
   s.tricks.push({winner:win.player,cards:s.currentTrick});s.currentTrick=[];s.turn=wi;s.status='Trick won by '+(s.players[wi]?.name||'player')+'.';
   if(s.tricks.length===13){s.winner=win.player;s.status='Bridge hand complete.';}
   if(s.name==='29'&&s.tricks.length===8){
    const contractTeam=s.players.findIndex(p=>p.id===s.contract.player)%2;
    const made=s.teamPoints[contractTeam]>=s.contract.bid;
    s.matchScore[contractTeam]+=made?1:-1;
    s.phase='complete';s.winner=win.player;s.matchWinner=s.matchScore[contractTeam]>=6?contractTeam:s.matchScore[contractTeam]<=-6?1-contractTeam:null;
    s.status='29 complete. Team points: '+s.teamPoints.join(' – ')+'. Bid '+(made?'made':'failed')+'. Match score: '+s.matchScore.join(' – ');
   }
  } else advance(s,s.name==='29'?-1:1);
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
 const [stage,setStage]=useState('select'),[selected,setSelected]=useState(null),[mode,setMode]=useState(2),[players,setPlayers]=useState([]),[seconds,setSeconds]=useState(60),[state,setState]=useState(null),[bet,setBet]=useState(0),[status,setStatus]=useState(''),[minimized,setMinimized]=useState(false);\n const [unoColor,setUnoColor]=useState('red'),[unoCallSelected,setUnoCallSelected]=useState(false);
 const channelRef=useRef(null),hostRef=useRef(false),lobbyRef=useRef(null),stateRef=useRef(null),stageRef=useRef(stage),timerRef=useRef(null),selectedRef=useRef(selected),playersRef=useRef(players),secondsRef=useRef(seconds),modeRef=useRef(mode);
 const onGameAvailableRef=useRef(onGameAvailable),minimizedRef=useRef(minimized);onGameAvailableRef.current=onGameAvailable;minimizedRef.current=minimized;
 const hideableGame=selected&&!['Brainstorm','Truth and Dare'].includes(selected.name);
 const canMinimize=stage==='play'&&hideableGame;
 const reopenGame=()=>{setMinimized(false);minimizedRef.current=false;onGameAvailableRef.current?.();};
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
 const sync=next=>{stateRef.current=next;setState(next);if(next?.winner)setStage('result');publish('game_state',{lobbyId:lobbyRef.current,snapshot:next});};
 const doAction=action=>{if(!isMyTurn||!state)return;if(hostRef.current)sync(applyMove(state,userId,action));else publish('game_action',{lobbyId:lobbyRef.current,action});};
 const reset=()=>{clearInterval(timerRef.current);setStage('select');setSelected(null);setPlayers([]);setState(null);setStatus('');setBet(0);setMinimized(false);minimizedRef.current=false;hostRef.current=false;lobbyRef.current=null;};
 const close=()=>{if(canMinimize){setMinimized(true);minimizedRef.current=true;}onClose?.();};
 useEffect(()=>{
  if(!roomId||!userId||!supabase)return;
  const ch=supabase.channel('room-games-'+roomId,{config:{private:true}});channelRef.current=ch;
  ch.on('broadcast',{event:'game_event'},({payload:p})=>{
   if(!p||p.roomId!==roomId||p.userId===userId)return;
   if(p.type==='request_state'&&hostRef.current){publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,state:stateRef.current,stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});}
   if(p.type==='create_lobby'&&!lobbyRef.current){const game=GAMES.find(g=>g.name===p.gameName);const hostPlayer=Array.isArray(p.players)?p.players.find(x=>x?.id===p.userId):null;if(typeof p.lobbyId!=='string'||!p.lobbyId.endsWith('-'+p.userId)||!hostPlayer||!game||['Truth and Dare','Brainstorm'].includes(game.name))return;setMinimized(false);minimizedRef.current=false;lobbyRef.current=p.lobbyId;hostRef.current=false;setSelected(game);setPlayers([{id:p.userId,name:String(hostPlayer.name||'Player').slice(0,32)}]);setSeconds(60);setStage('lobby');setStatus('Join this game from the room.');if(!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='join_game'&&hostRef.current&&p.lobbyId===lobbyRef.current&&p.player?.id===p.userId&&(!selectedRef.current?.timed||secondsRef.current>0)){setPlayers(old=>{const cap=selectedRef.current?.name==='Carrom'?modeRef.current:selectedRef.current?.max;if(old.some(x=>x.id===p.player.id)||old.length>=cap)return old;const next=[...old,p.player];playersRef.current=next;publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:'lobby',selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});return next;});}
   if(p.type==='lobby_state'&&p.lobbyId&&(!lobbyRef.current||p.lobbyId===lobbyRef.current)){if(!lobbyRef.current)lobbyRef.current=p.lobbyId;setPlayers(p.players||[]);playersRef.current=p.players||[];if(Number.isFinite(Number(p.seconds)))setSeconds(Math.max(0,Math.min(60,Number(p.seconds))));if(p.mode)setMode(p.mode);if(p.selected){const game=GAMES.find(g=>g.name===p.selected)||null;setSelected(game);if(game&&!['Truth and Dare','Brainstorm'].includes(game.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}if(p.stage==='play'&&p.state){setState(p.state);setStage('play');}else setStage('lobby');}
   if(p.type==='start_game'&&p.lobbyId===lobbyRef.current){hostRef.current=false;setState(p.snapshot);setStage('play');if(!['Truth and Dare','Brainstorm'].includes(p.snapshot?.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='game_action'&&hostRef.current&&p.lobbyId===lobbyRef.current){const next=applyMove(stateRef.current,p.userId,p.action);sync(next);}
   if(p.type==='game_state'&&p.lobbyId===lobbyRef.current&&!hostRef.current){setState(p.snapshot);if(p.snapshot?.winner)setStage('result');}
   if(p.type==='leave_game'&&hostRef.current&&p.lobbyId===lobbyRef.current){setPlayers(old=>old.filter(x=>x.id!==p.playerId));}
   if(p.type==='lobby_closed'&&p.lobbyId===lobbyRef.current){reset();}
  });
  ch.subscribe(st=>{if(st==='SUBSCRIBED')publish('request_state');});
  return()=>{channelRef.current=null;supabase.removeChannel(ch);};
 },[roomId,userId,supabase]);
 useEffect(()=>{if(stage!=='lobby'||!selected?.timed||bet!==0||players.length<1||!hostRef.current||secondsRef.current<=0)return;timerRef.current=setInterval(()=>{const next=Math.max(0,secondsRef.current-1);secondsRef.current=next;setSeconds(next);publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,stage:'lobby',selected:selectedRef.current?.name,seconds:next,mode:modeRef.current});if(next===0)clearInterval(timerRef.current);},1000);return()=>clearInterval(timerRef.current);},[stage,selected,bet,players.length]);
 useEffect(()=>{if(stage==='lobby'&&seconds===0)setStatus(players.length<min?'Time expired — not enough players joined.':'Time expired — the game is ready to start.');},[seconds,stage,players.length,min]);
 const choose=g=>{if(['Truth and Dare','Brainstorm'].includes(g.name)){setStatus(g.name+' is postponed until its rules are finalised.');return;}setSelected(g);setBet(0);setStage('setup');};
 const create=()=>{if(!selected||!userId){setStatus('Choose a game first.');return;}if(['Truth and Dare','Brainstorm'].includes(selected.name)){setStatus('Rules for this game are still being finalised.');return;}const lid=String(Date.now())+'-'+userId,host={id:userId,name:creatorName};hostRef.current=true;lobbyRef.current=lid;setPlayers([host]);setStage('lobby');setStatus('Free play — no Good Coins are deducted or awarded.');publish('create_lobby',{lobbyId:lid,gameName:selected.name,players:[host],bet:0,mode});};
 const join=()=>{if(selected?.timed&&seconds<=0){setStatus('The one-minute joining time has ended.');return;}if(!canJoin){setStatus('Take a room mic seat before joining this game.');return;}if(inLobby||players.length>=max)return;publish('join_game',{lobbyId:lobbyRef.current,player:{id:userId,name:creatorName}});setStatus('Join request sent.');};
 const start=()=>{if(!(isAuthorisedStarter||hostRef.current)||players.length<min)return;hostRef.current=true;const s=initialGame(selected.name,players,mode);stateRef.current=s;setState(s);setMinimized(false);minimizedRef.current=false;setStage('play');publish('start_game',{lobbyId:lobbyRef.current,snapshot:s});};
 const act=action=>doAction(action);
 const roll=()=>act({type:'roll',die:rand(6)+1});
 const currentHand=state?.hands?.[userId]||[];
 const renderControls=()=>{
  if(!state)return null;
  if(state.name==='Snakes and Ladders')return <><Text style={{color:ink}}>Position: {state.positions[userId]} / 100</Text><Btn title="ROLL DICE" onPress={roll}/></>;
  if(state.name==='Ludo')return <><Text style={{color:ink}}>Roll a die, then choose one of your four tokens.</Text><Btn title="ROLL DICE" onPress={()=>act({type:'ludo_roll',die:rand(6)+1})}/>{state.tokens[userId]?.map((v,i)=><Tile key={i} onPress={()=>act({type:'ludo_move',token:i})} disabled={!state.pendingDie|| (v===-1&&state.pendingDie!==6)} active>{'Token '+(i+1)+' · '+(v<0?'Base':v===57?'Home':v)}</Tile>)}</>;
  if(state.name==='UNO')return <><Text style={{color:ink}}>Top: {String(state.discard.at(-1)?.rank)} · Colour: {state.activeColor}</Text><Text style={{color:GOLD}}>Match points: {state.matchPoints?.[userId]||0}/500</Text>{state.pendingChallenge?.target===userId&&<><Btn title="ACCEPT +4" onPress={()=>act({type:'uno_accept'})}/><Btn title="CHALLENGE +4" onPress={()=>act({type:'uno_challenge'})}/></>}{state.pendingUno&&state.turn===state.players.findIndex(p=>p.id===userId)&&<Btn title="CATCH MISSED UNO (+2)" onPress={()=>act({type:'uno_catch'})}/>}<Text style={{color:ink}}>Choose wild colour before playing:</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{colors.map(color=><Btn key={color} small title={color.toUpperCase()} onPress={()=>setUnoColor(color)}/>)}</View><Text style={{color:muted}}>Selected: {unoColor}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'uno_play',cardId:c.id,wildColor:unoColor,uno:currentHand.length===2&&unoCallSelected})} disabled={state.drawnCard&&state.drawnCard!==c.id}>{String(c.rank)} {c.color==='wild'?'★':c.color}</Tile>)}</View>{state.drawnCard&&<Btn title="PASS AFTER DRAW" onPress={()=>act({type:'uno_pass_drawn'})}/>}<Btn title="DRAW ONE" onPress={()=>act({type:'uno_draw'})} disabled={!!state.drawnCard}/>{currentHand.length===2&&<Btn title={unoCallSelected?'UNO CALL: ON':'UNO CALL: OFF'} onPress={()=>setUnoCallSelected(v=>!v)}/>}</>;
  if(state.name==='29')return <><Text style={{color:ink}}>Phase: {state.phase} · Trump: {state.trumpHidden?'Hidden':state.trump||'—'} · Tricks: {state.tricks.length}/8</Text><Text style={{color:ink}}>Team points: {state.teamPoints.join(' – ')} · Match: {state.matchScore.join(' – ')}</Text>{state.phase==='bidding'&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{[16,17,18,19,20,21,22,23,24,25,26,27,28].filter(v=>v>state.highBid).map(v=><Btn key={v} title={'BID '+v} small onPress={()=>act({type:'29_bid',bid:v})}/>)}<Btn title="PASS" onPress={()=>act({type:'29_bid',pass:true})}/></View>}{state.phase==='deal2'&&state.contract?.player===userId&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{suits.map(s=><Btn key={s} title={'SELECT '+s} onPress={()=>act({type:'29_trump',suit:s})}/>)}</View>}{state.phase==='play'&&<><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'trick_card',cardId:c.id})}>{cardLabel(c)}</Tile>)}</View>{state.trumpHidden&&state.currentTrick.length>0&&!currentHand.some(x=>x.suit===state.currentTrick[0].card.suit)&&<Btn title="REVEAL TRUMP" onPress={()=>act({type:'29_reveal_trump'})}/>}</>}</>;if(state.name==='Playcards – Breez')return <><Text style={{color:ink}}>Trump: {state.trump||'Not selected'} · Tricks: {state.tricks.length}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'trick_card',cardId:c.id})}>{cardLabel(c)}</Tile>)}</View><Btn title="PASS / BID" onPress={()=>act({type:'bridge_bid',pass:true})}/></>;
  if(state.name==='Jackaroo')return <><Text style={{color:ink}}>Select a card, then a marble. A/K bring a marble out; 7 splits; J swaps.</Text>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'jackaroo_play',cardId:c.id,marble:0})}>{c.rank}</Tile>)}</>;
  if(state.name==='Carrom')return <><Text style={{color:ink}}>Coins left — White {state.coins.white}, Black {state.coins.black}, Queen {state.coins.queen?'on board':'pocketed'}</Text><Btn title="POCKET OWN COIN" onPress={()=>act({type:'carrom_shot',pocket:true,own:true,colour:state.colours[userId]||'white'})}/><Btn title="MISS SHOT" onPress={()=>act({type:'carrom_shot'})}/><Btn title="FOUL" onPress={()=>act({type:'carrom_shot',foul:true})}/></>;
  if(state.name==='Monster Crush')return <><Text style={{color:ink}}>Ammo: {state.ammo} · Shots: {state.shots} · Monsters left: {state.board.flat().filter(x=>x.alive&&x.type==='monster').length}</Text><View style={{alignSelf:'center'}}>{state.board.map((row,ri)=><View key={ri} style={{flexDirection:'row'}}>{row.map(cell=><Tile key={cell.id} disabled={!cell.alive||state.ammo===0} onPress={()=>act({type:'monster_shot',cell:cell.id})}>{cell.alive?(cell.type==='monster'?'👾':cell.type==='barrel'?'💣':'⚙️'):'·'}</Tile>)}</View>)}</View></>;
  return null;
 };
 return <><Modal visible={visible&&!minimized} transparent animationType="fade" onRequestClose={close}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.82)',justifyContent:'center',padding:12}}><View style={{maxHeight:'94%',backgroundColor:panel,borderColor:GOLD,borderWidth:1.5,borderRadius:20,padding:14}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><View><Text style={{color:GOLD,fontWeight:'900',fontSize:17}}>♛ TALKZY ROYAL GAMES</Text><Text style={{color:muted,fontSize:10}}>ROOM GAME ARENA</Text></View><TouchableOpacity onPress={close}><Text style={{color:GOLD,fontSize:22}}>✕</Text></TouchableOpacity></View>
  {stage==='select'&&<ScrollView><View style={{flexDirection:'row',flexWrap:'wrap'}}>{GAMES.map(g=><TouchableOpacity key={g.name} onPress={()=>choose(g)} style={{width:'25%',padding:4,alignItems:'center'}}><View style={{width:62,height:62,borderRadius:14,backgroundColor:'#2A1D32',borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center'}}><RoyalGameArtwork art={g.art}/></View><Text style={{color:ink,fontSize:10,textAlign:'center'}}>{g.name}</Text></TouchableOpacity>)}</View></ScrollView>}
  {stage==='setup'&&<View><Text style={{color:GOLD,fontSize:18,textAlign:'center',fontWeight:'900'}}>{selected.name}</Text><Text style={{color:muted,textAlign:'center',margin:8}}>{selected.rules}</Text><Text style={{color:ink}}>Players: {min} required · {max===Infinity?'Unlimited':max+' maximum'}</Text>{selected.name==='Carrom'&&<View style={{flexDirection:'row'}}><Btn title="2 PLAYERS" onPress={()=>setMode(2)}/><Btn title="4 PLAYERS" onPress={()=>setMode(4)}/></View>}{!canJoin&&<Text style={{color:GOLD}}>You can create the lobby without a mic seat. Other players need a mic seat to join this game.</Text>}<Btn title="CREATE GAME" onPress={create}/><Btn title="BACK" onPress={()=>setStage('select')}/></View>}
  {stage==='lobby'&&<View><Text style={{color:GOLD,fontSize:18,textAlign:'center'}}>{selected?.name} Lobby</Text><Text style={{color:ink,textAlign:'center'}}>{players.length}/{max===Infinity?'∞':max} players · Free play (0 Good Coins)</Text>{selected?.timed&&<Text style={{color:GOLD,textAlign:'center'}}>{seconds}s</Text>}{players.map(p=><Text key={p.id} style={{color:ink,padding:7}}>{p.name}</Text>)}<Text style={{color:muted}}>{status}</Text>{!inLobby&&<Btn title="JOIN GAME" onPress={join} disabled={!canJoin||players.length>=max||(selected?.timed&&seconds<=0)}/>}<Btn title="START GAME" onPress={start} disabled={(!isAuthorisedStarter&&!hostRef.current)||players.length<min}/><Text style={{color:muted,textAlign:'center'}}>The game creator, room owner or authorised admin can start.</Text></View>}
  {stage==='play'&&<ScrollView><Text style={{color:GOLD,fontSize:18,textAlign:'center'}}>{selected?.name}</Text><Text style={{color:ink,textAlign:'center'}}>Turn: {current?.name||'—'}</Text><Text style={{color:muted,textAlign:'center'}}>{state.status}</Text><View style={{backgroundColor:'#21182B',padding:10,borderRadius:12}}>{isMyTurn?renderControls():<Text style={{color:ink}}>Waiting for {current?.name||'player'}.</Text>}</View>{state.winner&&<Btn title="VIEW RESULT" onPress={()=>setStage('result')}/>}</ScrollView>}
  {stage==='result'&&<View style={{maxHeight:520}}>
   <Text style={{color:GOLD,fontSize:20,textAlign:'center',fontWeight:'900'}}>♛ GAME RESULTS</Text>
   <Text style={{color:muted,textAlign:'center',fontSize:11,marginTop:4,marginBottom:12}}>{state?.name||selected?.name} · Final rankings</Text>
   <ScrollView style={{maxHeight:390}} showsVerticalScrollIndicator>
    {gameResults(state).map(row=><View key={row.id} style={{flexDirection:'row',alignItems:'center',backgroundColor:row.id===state?.winner?'#3B2C22':'#251B31',borderColor:row.id===state?.winner?GOLD:'#51415B',borderWidth:1,borderRadius:12,paddingVertical:11,paddingHorizontal:12,marginBottom:8}}>
     <View style={{width:38,height:38,borderRadius:19,backgroundColor:row.rank===1?'#76572B':'#382B43',borderWidth:1,borderColor:row.rank===1?GOLD:'#66536F',alignItems:'center',justifyContent:'center',marginRight:11}}>
      <Text style={{color:row.rank===1?GOLD:ink,fontWeight:'900',fontSize:15}}>#{row.rank}</Text>
     </View>
     <View style={{flex:1}}>
      <Text numberOfLines={1} style={{color:ink,fontWeight:'900',fontSize:13}}>{row.name}{row.id===userId?' (You)':''}</Text>
      {row.id===state?.winner&&<Text style={{color:GOLD,fontSize:10,fontWeight:'900',marginTop:2}}>WINNER</Text>}
     </View>
     <View style={{alignItems:'flex-end',marginLeft:8}}>
      <Text style={{color:GOLD,fontWeight:'900',fontSize:17}}>{row.score}</Text>
      <Text style={{color:muted,fontSize:9}}>{row.detail}</Text>
     </View>
    </View>)}
   </ScrollView>
   {state?.name==='UNO'&&state?.winner&&!state?.matchWinner&&hostRef.current&&<Btn title="NEXT ROUND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'uno_next_round'});stateRef.current=next;setState(next);setStage('play');publish('game_state',{lobbyId:lobbyRef.current,snapshot:next});}}/>}{state?.name==='29'&&state?.winner&&state?.matchWinner===null&&hostRef.current&&<Btn title="NEXT HAND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'29_next_hand'});stateRef.current=next;setState(next);setStage('play');publish('game_state',{lobbyId:lobbyRef.current,snapshot:next});}}/>}<Btn title="BACK TO GAMES" onPress={reset}/>
  </View>}
 </View></View></Modal>{minimized&&canMinimize&&<TouchableOpacity onPress={reopenGame} style={{position:'absolute',right:16,bottom:112,zIndex:999,elevation:20,backgroundColor:'#24152F',borderColor:GOLD,borderWidth:1.5,borderRadius:24,paddingHorizontal:16,paddingVertical:11}}><Text style={{color:GOLD,fontWeight:'900'}}>🎮 OPEN GAME</Text></TouchableOpacity>}</>;
}
