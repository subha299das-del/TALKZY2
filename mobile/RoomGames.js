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
 {name:'Ludo',art:'ludo',min:2,max:4,bet:true,timed:true,rules:'Ludo King official rules: 2–4 players, six to enter, extra turns for six/capture/home, third consecutive six forfeited, rank by finish order.'},
 {name:'Carrom',art:'carrom',min:2,max:4,bet:true,timed:true,rules:'International Carrom Federation laws: singles/doubles, due pieces, queen cover, each game to 25 or eight boards; match best of three games.'},
 {name:'Playcards – Breez',art:'breez',min:4,max:4,bet:true,timed:true,rules:'World Bridge Federation duplicate Contract Bridge: auction, declarer/dummy, 13 tricks, follow suit and duplicate scoring.'},
 {name:'UNO',art:'uno',min:2,max:10,bet:true,timed:true,rules:'Classic Mattel UNO: 108-card deck, 7 cards each, match colour/number/symbol, action cards, Wild Draw Four challenge, UNO call and 500-point match.'},
 {name:'Monster Crush',art:'monster',min:2,max:4,bet:true,timed:true,rules:'No universal published ruleset identified; postponed under official-rules-only development.'},
 {name:'Truth and Dare',art:'truth',min:2,max:Infinity,bet:false,timed:false,rules:'Unavailable: no single official ruleset; no custom prompts or penalties will be invented.'},
 {name:'Snakes and Ladders',art:'snake',min:2,max:3,bet:true,timed:true,rules:'Hasbro A4756 Chutes and Ladders: 2–3 players, highest opening spin, published board layout, exact 100.'},
 {name:'Jackaroo',art:'jackaroo',min:4,max:4,bet:true,timed:true,rules:'Published Jackaroo World rules: four players in opposite partnerships, clockwise card play, legal marble movement and safety lanes.'},
 {name:'Brainstorm',art:'brain',min:2,max:Infinity,bet:false,timed:false,rules:'Unavailable: no single official Brainstorm ruleset was identified.'},
 {name:'29',art:'twentynine',min:4,max:4,bet:true,timed:true,rules:'Unavailable until a named 29 scoring variant is selected: the supplied rules leave failed-bid penalties and match target region-dependent.'}
];
const suits=['♠','♥','♦','♣'], bridgeStrains=['♣','♦','♥','♠','NT'], colors=['red','blue','green','yellow'];
const LUDO_COLORS=['#D94B58','#55B879','#E6B94F','#4E91D6'];
const LUDO_PATH=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const LUDO_HOME_LANES=[[[7,1],[7,2],[7,3],[7,4],[7,5]],[[1,7],[2,7],[3,7],[4,7],[5,7]],[[7,13],[7,12],[7,11],[7,10],[7,9]],[[13,7],[12,7],[11,7],[10,7],[9,7]]];
const LUDO_BASES=[[[1,1],[1,4],[4,1],[4,4]],[[1,10],[1,13],[4,10],[4,13]],[[10,10],[10,13],[13,10],[13,13]],[[10,1],[10,4],[13,1],[13,4]]];
const JACKAROO_COLORS=['#D94B58','#55B879','#E6B94F','#4E91D6'];
const JACKAROO_PATH=[...Array.from({length:14},(_,i)=>[0,i]),...Array.from({length:13},(_,i)=>[i+1,13]),...Array.from({length:13},(_,i)=>[13,12-i]),...Array.from({length:12},(_,i)=>[12-i,0])];
const JACKAROO_SAFETY=[[[1,1],[2,2],[3,3],[4,4]],[[1,12],[2,11],[3,10],[4,9]],[[12,12],[11,11],[10,10],[9,9]],[[12,1],[11,2],[10,3],[9,4]]];
const JACKAROO_BASES=[[[1,3],[1,5],[3,1],[5,1]],[[1,8],[1,10],[3,12],[5,12]],[[8,12],[10,12],[12,10],[12,8]],[[12,5],[12,3],[10,1],[8,1]]];
const rand=n=>Math.floor(Math.random()*n);
const makeDeck=(ranks)=>suits.flatMap((s,si)=>ranks.map((r,ri)=>({id:s+String(r)+ri,rank:r,suit:s,color:colors[si]})));
const cardLabel=c=>String(c.rank)+c.suit;
const isRed=s=>s==='♥'||s==='♦';
const Btn=({title,onPress,disabled=false,small=false})=><TouchableOpacity disabled={disabled} onPress={onPress} style={{backgroundColor:'#30213B',borderColor:'#A77D45',borderWidth:1,padding:small?7:10,borderRadius:10,margin:3,alignItems:'center',opacity:disabled?.4:1}}><Text style={{color:ink,fontWeight:'900',fontSize:small?11:13}}>{title}</Text></TouchableOpacity>;
const Tile=({children,onPress,active=false,disabled=false})=><TouchableOpacity disabled={disabled} onPress={onPress} style={{minWidth:40,minHeight:38,padding:8,margin:3,borderRadius:8,borderWidth:1,borderColor:active?GOLD:'#5A4964',backgroundColor:active?'#634B2B':'#251B31',alignItems:'center',justifyContent:'center',opacity:disabled?.4:1}}><Text style={{color:ink,fontWeight:'900',textAlign:'center'}}>{children}</Text></TouchableOpacity>;

function initialGame(name,players,mode=2){
 const ids=players.map(p=>p.id), s={name,players,turn:0,round:1,score:{},status:'Game started.',winner:null};
 ids.forEach(id=>s.score[id]=0);
 if(name==='Ludo') {s.tokens={};players.forEach(p=>s.tokens[p.id]=[-1,-1,-1,-1]);s.consecutiveSix=0;s.finishOrder=[];s.safe=[0,8,13,21,26,34,39,47];}
 if(name==='Snakes and Ladders'){s.positions={};ids.forEach(id=>s.positions[id]=0);s.ladders={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};s.snakes={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};s.phase='start_roll';s.startingRolls={};s.tiedStartPlayers=[...ids];}
 if(name==='Carrom'){s.mode=mode;s.carromBoard=createCarromBoard();s.turn=rand(players.length);s.boardBreaker=s.turn;s.firstBreaker=s.turn;s.gameNumber=1;s.gamesWon=[0,0];s.seatRotation=0;s.gameComplete=false;s.colours={};s.teamColours=[];s.teamColours[s.turn%2]='white';s.teamColours[1-s.turn%2]='black';s.players.forEach((pl,i)=>{s.colours[pl.id]=s.teamColours[i%2];});s.queenPending=null;s.queenCoveredBy=null;s.due=[0,0];s.breakAttempts=0;s.breakDone=false;s.shot=0;s.boardShots=0;s.fouls={};s.boardNumber=1;s.boardComplete=false;s.matchPoints=[0,0];s.score={};ids.forEach(id=>s.score[id]=0);s.boardsPlayed=0;}
 if(name==='UNO'){s.deck=[];let cardNo=0;colors.forEach(color=>{s.deck.push({id:'UNO-'+(cardNo++),rank:0,color,suit:'*'});for(let n=1;n<=9;n++)for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank:n,color,suit:'*'});for(const rank of ['Skip','Reverse','+2'])for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank,color,suit:'*'});});for(let copy=0;copy<4;copy++){s.deck.push({id:'UNO-'+(cardNo++),rank:'Wild',color:'wild',suit:'*'});s.deck.push({id:'UNO-'+(cardNo++),rank:'+4',color:'wild',suit:'*'});}for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}const dealerDraws=players.map(p=>s.deck.pop()),dealerScores=dealerDraws.map(card=>typeof card.rank==='number'?card.rank:0);s.dealer=dealerScores.indexOf(Math.max(...dealerScores));s.deck.push(...dealerDraws);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.turn=(s.dealer+1)%players.length;s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,7));let first=s.deck.shift();while(first?.rank==='+4'){s.deck.push(first);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}first=s.deck.shift();}s.discard=[first];if(first?.rank==='Reverse')s.turn=s.dealer;s.direction=first?.rank==='Reverse'?-1:1;s.activeColor=first?.color||'red';s.pendingOpeningWild=first?.rank==='Wild';s.drawnCard=null;s.pendingUno=null;s.pendingChallenge=null;s.unoCalled={};s.matchPoints={};s.roundPoints=0;ids.forEach(id=>s.matchPoints[id]=0);if(first?.rank==='+2'){unoDraw(s,players[s.turn].id,2);advance(s);}else if(first?.rank==='Skip')advance(s);}
 if(name==='Playcards – Breez'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,13));s.dealer=rand(4);s.turn=s.dealer;s.boardNumber=1;s.phase='auction';s.bids=[];s.lastBid=null;s.lastBidder=null;s.passCount=0;s.multiplier=1;s.contract=null;s.trump=null;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.declarer=null;s.dummy=null;s.dummyRevealed=false;s.contractTricks=0;s.vulnerable=false;s.teamScore=[0,0];s.vulnerableTeams=[false,false];}
 if(name==='29'){s.deck=makeDeck(['J','9','A','10','K','Q','8','7']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,4));s.dealer=rand(4);s.firstTurn=(s.dealer+3)%4;s.turn=s.firstTurn;s.bids=[];s.bidCount=0;s.highBid=0;s.contract=null;s.trump=null;s.trumpHidden=true;s.trumpRevealed=false;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.teamPoints=[0,0];s.matchScore=[0,0];s.phase='bidding';s.lastTrickTeam=null;}
 if(name==='Jackaroo'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};s.marbles={};players.forEach(p=>{s.hands[p.id]=[];s.marbles[p.id]=[-1,-1,-1,-1];});s.deckDiscard=[];s.dealer=rand(4);s.handRound=0;s.teamSafe=[0,0];jackarooDeal(s);}
 if(name==='Monster Crush'){s.ammo=8;s.board=Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>({id:r*5+c,type:Math.random()<.68?'monster':(Math.random()<.5?'barrel':'saw'),alive:true})));s.shots=0;}
 return s;
}

function advance(s,n=1){s.turn=(s.turn+n+s.players.length)%s.players.length;return s;}
function advanceLudo(s){const finished=new Set(s.finishOrder||[]);for(let i=0;i<s.players.length;i++){advance(s);if(!finished.has(s.players[s.turn].id))return s;}return s;}
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
 for(let i=0;i<6;i++){const a=(Math.PI*2*i)/6;coins.push({id:'C'+(n++),color:i%2?'black':'white',x:500+Math.cos(a)*36,y:500+Math.sin(a)*36,vx:0,vy:0,pocketed:false});}
 for(let i=0;i<12;i++){const a=(Math.PI*2*i)/12+Math.PI/12;coins.push({id:'C'+(n++),color:i%2?'white':'black',x:500+Math.cos(a)*72,y:500+Math.sin(a)*72,vx:0,vy:0,pocketed:false});}
 return {coins,striker:{x:500,y:900,vx:0,vy:0,pocketed:false},pocketed:{white:0,black:0},queenCoveredBy:null,offBoard:false};
}
function carromShoot(board,playerIndex,angle,power,mode=4){
 const b=clone(board),starts=mode===2?[{x:500,y:900},{x:500,y:100}]:[{x:500,y:900},{x:100,y:500},{x:500,y:100},{x:900,y:500}],start=starts[playerIndex%mode],baseAngle=mode===2?(playerIndex%2===0?270:90):[270,0,90,180][playerIndex%4],shotAngle=baseAngle+angle;
 b.striker={...start,vx:Math.cos(shotAngle*Math.PI/180)*power,vy:Math.sin(shotAngle*Math.PI/180)*power,pocketed:false};
 const pieces=[...b.coins.filter(x=>!x.pocketed),b.striker],r=20,sr=22,friction=.986;
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
   if(dist>0&&dist<min){if((a===b.striker&&d!==b.striker)||(d===b.striker&&a!==b.striker))b.touchedCoin=true;const nx=dx/dist,ny=dy/dist,overlap=min-dist;a.x-=nx*overlap/2;a.y-=ny*overlap/2;d.x+=nx*overlap/2;d.y+=ny*overlap/2;const rel=(d.vx-a.vx)*nx+(d.vy-a.vy)*ny;if(rel<0){const impulse=-(1+.9)*rel/2;a.vx-=impulse*nx;a.vy-=impulse*ny;d.vx+=impulse*nx;d.vy+=impulse*ny;}}
  }
 }
 b.strikerPocketed=b.striker.pocketed;b.pocketed={white:0,black:0};
 b.coins.forEach(x=>{if(x.pocketed&&(x.color==='white'||x.color==='black'))b.pocketed[x.color]++;});
 return b;
}
function jackarooGlobal(ownerIndex,progress){return (ownerIndex*13+progress)%52;}
function jackarooMove(s,ownerId,marble,steps,king=false){
 const ownerIndex=s.players.findIndex(p=>p.id===ownerId),arr=s.marbles?.[ownerId],old=arr?.[marble];
 if(ownerIndex<0||!Number.isInteger(marble)||marble<0||marble>3||old===undefined||old<0||!Number.isInteger(steps)||steps===0)return false;
 if(old>=52){
  if(steps<1)return false;
  const safeNext=old+steps;if(safeNext>55)return false;
  for(let mi=0;mi<4;mi++){if(mi===marble)continue;const other=arr[mi];if(other>=52&&other>old&&other<=safeNext)return false;}
  arr[marble]=safeNext;return true;
 }
 let raw=old+steps,next=raw;
 if(steps<0)next=(raw+52)%52;
 if(steps>0&&next>55)return false;
 const path=[],count=Math.abs(steps);
 for(let k=1;k<=count;k++){
  const progress=steps>0?old+k:old-k;
  if(steps>0&&progress>55)return false;
  if(progress>=52&&progress<=55)path.push({safeOwner:ownerId,progress});
  else path.push({global:jackarooGlobal(ownerIndex,(progress+52)%52)});
 }
 for(const pl of s.players)for(let mi=0;mi<4;mi++){
  if(pl.id===ownerId&&mi===marble)continue;
  const op=s.marbles[pl.id][mi];if(op<0)continue;
  if(op>=52){
   if(pl.id===ownerId&&path.some(q=>q.safeOwner===ownerId&&q.progress===op))return false;
   continue;
  }
  const gp=jackarooGlobal(s.players.findIndex(p=>p.id===pl.id),op),onPath=path.some(q=>q.global===gp);
  if(!onPath)continue;
  if(op===0)return false;
  if(king)s.marbles[pl.id][mi]=-1;
  else if(pl.id===ownerId)return false;
 }
 if(next>=52){
  for(let mi=0;mi<4;mi++){if(mi!==marble){const op=s.marbles[ownerId][mi];if(op>=52&&op<=next)return false;}}
 }else{
  const dest=jackarooGlobal(ownerIndex,next);
  for(const pl of s.players)for(let mi=0;mi<4;mi++){
   if(pl.id===ownerId&&mi===marble)continue;
   const op=s.marbles[pl.id][mi];if(op<0||op>=52)continue;
   if(jackarooGlobal(s.players.findIndex(p=>p.id===pl.id),op)===dest){
    if(op===0)return false;
    s.marbles[pl.id][mi]=-1;
   }
  }
 }
 s.marbles[ownerId][marble]=next;return true;
}
function jackarooDeal(s){
 if(s.handRound>=3||s.deck.length<s.players.length*(s.handRound===2?5:4)){
  s.deck=[...(s.deck||[]),...(s.deckDiscard||[])];s.deckDiscard=[];
  for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}
  s.dealer=(s.dealer+1)%s.players.length;s.handRound=0;
 }
 const count=s.handRound===2?5:4;
 s.players.forEach(p=>{s.hands[p.id]=s.deck.splice(0,count);});
 s.handRound++;s.turn=(s.dealer+1)%s.players.length;s.status='New '+count+'-card deal. Play begins clockwise.';return s;
}
function jackarooAdvance(s){if(s.players.every(p=>(s.hands[p.id]||[]).length===0))return jackarooDeal(s);for(let i=0;i<s.players.length;i++){advance(s);if((s.hands[s.players[s.turn].id]||[]).length)return s;}return jackarooDeal(s);}
function jackarooHasLegalMove(s,playerId){
 const team=s.players.findIndex(p=>p.id===playerId)%2,own=s.players.findIndex(p=>p.id===playerId),partner=s.players[(own+2)%4].id;
 const owners=[playerId,...(s.marbles[playerId].every(v=>v>=52)?[partner]:[])];
 const hand=s.hands[playerId]||[];
 for(const card of hand){
  const rank=card.rank;
  if((rank==='Q'&&isRed(card.suit))||rank==='10')return true;
  if(rank==='J'){
   for(const owner of owners)for(let i=0;i<4;i++)if(s.marbles[owner][i]>=0&&s.marbles[owner][i]<52&&s.marbles[owner][i]!==0)
    for(const op of s.players)if(op.id!==owner)for(let j=0;j<4;j++)if(s.marbles[op.id][j]>0&&s.marbles[op.id][j]<52)return true;
  }
  if(rank==='A'||rank==='K'){if(owners.some(owner=>s.marbles[owner].some(v=>v===-1)))return true;if(rank==='A')for(const owner of owners)for(let i=0;i<4;i++)if(jackarooMove(clone(s),owner,i,11))return true;}
  const steps=rank==='A'?1:rank==='K'?13:rank==='Q'?12:rank==='4'?-4:rank==='7'?7:Number(rank);
  if(rank==='7'){
   for(const owner of owners)for(let i=0;i<4;i++)if(jackarooMove(clone(s),owner,i,7))return true;
   for(const owner of owners)for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(i!==j)for(let split=1;split<7;split++){const test=clone(s);if(jackarooMove(test,owner,i,split)&&jackarooMove(test,owner,j,7-split))return true;}
  }else if(rank!=='J'&&!(rank==='Q'&&isRed(card.suit))&&rank!=='10'){
   const targetOwners=rank==='5'?s.players.map(p=>p.id):owners;
   for(const owner of targetOwners)for(let i=0;i<4;i++){const progress=s.marbles[owner][i];if(rank==='5'&&(progress<=0||(progress>=52&&owner!==playerId&&owner!==partner)||(owner===partner&&!s.marbles[playerId].every(v=>v>=52))))continue;if(jackarooMove(clone(s),owner,i,steps,rank==='K'))return true;}
  }
 }
 return false;
}
function unoRoundEnd(s,winnerId){
 s.winner=winnerId;s.roundWinner=winnerId;
 const points=s.players.reduce((n,p)=>n+(s.hands[p.id]||[]).reduce((a,c)=>a+unoCardPoints(c),0),0);
 s.matchPoints[winnerId]=(s.matchPoints[winnerId]||0)+points;
 s.roundPoints=points;
 const matchWinner=s.players.find(p=>(s.matchPoints[p.id]||0)>=500);
 if(matchWinner){s.matchWinner=matchWinner.id;s.winner=matchWinner.id;}
 s.status=(s.players.find(p=>p.id===winnerId)?.name||'Player')+' wins the round and scores '+points+' points.';
}
function publicGameSnapshot(source,viewerId=null){
 if(!source)return source;
 const s=clone(source);
 if(['UNO','Playcards – Breez','29','Jackaroo'].includes(s.name)){
  const hands=s.hands||{},counts={};Object.keys(hands).forEach(id=>counts[id]=hands[id]?.length||0);
  s.handCounts=counts;s.hands={};if(viewerId&&hands[viewerId])s.hands[viewerId]=hands[viewerId];if(s.name==='Playcards – Breez'&&s.dummyRevealed&&hands[s.dummy])s.hands[s.dummy]=hands[s.dummy];
  s.deck=[];
  if(s.pendingChallenge){if(viewerId!==s.pendingChallenge.target)delete s.pendingChallenge.challengeHand;if(s.pendingChallenge.hadMatchingColor!==undefined)delete s.pendingChallenge.hadMatchingColor;}
 }
 if(s.name==='29'&&s.trumpHidden&&s.contract?.player!==viewerId)s.trump=null;
 return s;
}
function gameResults(s){
 if(!s?.players?.length)return [];
 const ids=s.players.map(p=>p.id), scoreById={};
 ids.forEach(id=>{scoreById[id]=Number(s.score?.[id]||0);});
 let higherIsBetter=true, detail='Points';
 if(s.name==='Ludo'){
  ids.forEach(id=>{const order=s.finishOrder||[];scoreById[id]=order.includes(id)?s.players.length-order.indexOf(id):(s.tokens?.[id]||[]).filter(v=>v===57).length;});
  detail='Finish points';
 }else if(s.name==='Snakes and Ladders'){
  ids.forEach(id=>{scoreById[id]=Number(s.positions?.[id]||0);});detail='Board position';
 }else if(s.name==='Carrom'){
  ids.forEach((id,i)=>{scoreById[id]=Number(s.gamesWon?.[i%2]||0);});detail='Games won';
 }else if(s.name==='Jackaroo'){
  ids.forEach((id,i)=>{const partner=s.players[(i+2)%4]?.id;scoreById[id]=((s.marbles?.[id]||[]).filter(v=>v>=52).length)+((s.marbles?.[partner]||[]).filter(v=>v>=52).length);});detail='Team marbles in safety';
 }else if(s.name==='UNO'){
  ids.forEach(id=>{scoreById[id]=Number(s.matchPoints?.[id]||0);});
  detail='Match points (first to 500 wins)';
 }else if(s.name==='Playcards – Breez'){
  ids.forEach((id,i)=>{scoreById[id]=Number(s.teamScore?.[i%2]||0);});
  detail='Duplicate score';
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
function bridgeDuplicateScore(contract,tricks,vulnerable=false){
 const target=contract.level+6,under=target-tricks,m=contract.multiplier||1,suit=contract.suit;
 if(under<=0){
  const base=suit==='NT'?40+30*(contract.level-1):(['♣','♦'].includes(suit)?20:30)*contract.level;
  const contractPoints=base*m;
  let score=contractPoints+(contractPoints>=100?(vulnerable?500:300):50);
  if(m===2)score+=50;if(m===4)score+=100;
  if(contract.level===6)score+=vulnerable?750:500;
  if(contract.level===7)score+=vulnerable?1500:1000;
  const over=tricks-target;
  if(m===1)score+=over*(suit==='NT'||['♥','♠'].includes(suit)?30:20);
  else score+=over*(vulnerable?200:100)*(m===4?2:1);
  return score;
 }
 let penalty=0;
 if(m===1)penalty=under*(vulnerable?100:50);
 else if(vulnerable)penalty=200+(under-1)*300;
 else penalty=under===1?100:under===2?300:under===3?500:500+(under-3)*300;
 return -penalty*(m===4?2:1);
}
function applyMove(src,actor,action){
 const s=clone(src), p=s.players[s.turn], id=p?.id;
 const dummyControl=s.name==='Playcards – Breez'&&s.phase==='play'&&p?.id===s.dummy&&s.declarer===actor;
 if(!p||(p.id!==actor&&!dummyControl)||(s.winner&&!((s.name==='UNO'&&action.type==='uno_next_round')||(s.name==='29'&&action.type==='29_next_hand')||(s.name==='Playcards – Breez'&&action.type==='bridge_next_deal'))))return s;
 const finish=()=>{advance(s);return s;};
 if(s.name==='Snakes and Ladders'&&action.type==='start_roll'){
  if(s.phase!=='start_roll'||!s.tiedStartPlayers?.includes(id)||!Number.isInteger(action.die)||action.die<1||action.die>6)return s;
  s.startingRolls[id]=action.die;
  if(s.tiedStartPlayers.every(pid=>Number.isInteger(s.startingRolls[pid]))){
   const high=Math.max(...s.tiedStartPlayers.map(pid=>s.startingRolls[pid])),leaders=s.tiedStartPlayers.filter(pid=>s.startingRolls[pid]===high);
   if(leaders.length===1){const winnerIndex=s.players.findIndex(pl=>pl.id===leaders[0]);s.turn=winnerIndex;s.phase='play';s.status=(s.players[winnerIndex]?.name||'Player')+' rolled highest and starts.';return s;}
   s.tiedStartPlayers=leaders;s.startingRolls={};s.turn=s.players.findIndex(pl=>pl.id===leaders[0]);s.status='Tie for highest spin. Tied players spin again.';return s;
  }
  const next=s.tiedStartPlayers[(s.tiedStartPlayers.indexOf(id)+1)%s.tiedStartPlayers.length];s.turn=s.players.findIndex(pl=>pl.id===next);s.status=(p.name||'Player')+' spun '+action.die+'.';return s;
 }
 if(s.name==='Snakes and Ladders'&&action.type==='roll'){
  if(s.phase!=='play'||!Number.isInteger(action.die)||action.die<1||action.die>6)return s;
  const pos=s.positions[id]||0,next=pos+action.die;
  if(next<=100){s.positions[id]=s.ladders[next]||s.snakes[next]||next;if(s.positions[id]===100)s.winner=id;}
  s.status=next>100?'Need exact count to reach 100.':s.ladders[next]?'Climbed a ladder!':s.snakes[next]?'Slid down a chute.':'Moved '+action.die+' spaces.';
  return finish();
 }
 if(s.name==='Ludo'&&action.type==='ludo_roll'){
  if(!Number.isInteger(action.die)||action.die<1||action.die>6||s.pendingDie)return s;
  const d=action.die;
  s.consecutiveSix=d===6?(s.consecutiveSix||0)+1:0;
  if(s.consecutiveSix>=3){s.consecutiveSix=0;s.status='Three consecutive sixes: the third roll is forfeited.';advanceLudo(s);return s;}
  const tokens=s.tokens[id]||[],legal=tokens.some(v=>v!==57&&(v===-1?d===6:v+d<=57));
  if(!legal){s.status=d===6?'No legal move. Six grants another roll.':'No legal move. Turn passes.';if(d!==6)advanceLudo(s);return s;}
  s.pendingDie=d;s.status='Rolled '+d+'. Choose a token.';return s;
 }
 if(s.name==='Ludo'&&action.type==='ludo_move'){
  const d=s.pendingDie,tokens=(s.tokens[id]||[]).slice(),i=action.token;
  if(!Number.isInteger(i)||i<0||i>=4||!d)return s;
  const old=tokens[i];if(old===57)return s;
  if(old===-1&&d!==6)return s;
  const next=old===-1?0:old+d;if(next>57)return s;
  tokens[i]=next;s.tokens[id]=tokens;
  let captured=false,home=next===57;
  if(next<52){
   const seat=s.players.findIndex(p=>p.id===id),global=(seat*13+next)%52,safe=s.safe.includes(global);
   if(!safe)s.players.forEach((op,oi)=>{if(op.id!==id)s.tokens[op.id]=s.tokens[op.id].map(v=>{if(v>=0&&v<52&&(oi*13+v)%52===global){captured=true;return -1;}return v;});});
  }
  delete s.pendingDie;
  if(tokens.every(v=>v===57)){if(!s.finishOrder.includes(id))s.finishOrder.push(id);const remaining=s.players.filter(pl=>!s.finishOrder.includes(pl.id));if(remaining.length===1){s.finishOrder.push(remaining[0].id);s.winner=s.finishOrder[0];s.status='All Ludo players ranked. '+(s.players.find(pl=>pl.id===s.winner)?.name||'Player')+' wins.';}else{s.status=(p.name||'Player')+' finished in position '+s.finishOrder.length+'.';advanceLudo(s);}return s;}
  if(d===6||captured||home){s.status=captured?'Captured an opponent token — roll again.':home?'Token reached home — roll again.':'Rolled a 6 — roll again.';return s;}
  s.status='Token moved '+d+' spaces.';advanceLudo(s);return s;
 }
 if(s.name==='Carrom'&&action.type==='carrom_shot'){
  if(s.boardComplete)return s;
  const team=s.turn%2,ownColor=s.teamColours[team],oppColor=s.teamColours[1-team],oldBoard=s.carromBoard;
  const board=carromShoot(oldBoard,(s.turn+(s.seatRotation||0))%s.mode,Number(action.angle)||0,Math.max(4,Math.min(28,Number(action.power)||14)),s.mode);
  const newly=board.coins.filter(x=>x.pocketed&&!oldBoard.coins.find(o=>o.id===x.id)?.pocketed);
  const rawOwnCount=board.coins.filter(x=>x.color===ownColor&&x.pocketed).length,rawOppCount=board.coins.filter(x=>x.color===oppColor&&x.pocketed).length,queenCoveredBefore=s.queenCoveredBy;
  const ownNew=newly.filter(x=>x.color===ownColor),oppNew=newly.filter(x=>x.color===oppColor),queenShot=newly.some(x=>x.color==='queen');
  const beforeOwn=Number(oldBoard.pocketed?.[ownColor]||0),hadDueAtStart=Number(s.due?.[team]||0)>0,hadPendingQueen=!!s.queenPending;
  const strikerFoul=!!board.strikerPocketed||!!board.offBoard;
  s.shot++;s.boardShots++;
  const dueSpots=Array.from({length:16},(_,i)=>{const radius=i<8?98:72,angle=(Math.PI*2*(i%8))/8;return [500+Math.cos(angle)*radius,500+Math.sin(angle)*radius];});
  const putQueenBack=()=>{const q=board.coins.find(x=>x.color==='queen');if(q){q.pocketed=false;q.x=500;q.y=500;q.vx=0;q.vy=0;}board.queenCoveredBy=null;s.queenCoveredBy=null;};
  const putCoinBack=coin=>{
   if(!coin)return false;const target=board.coins.find(x=>x.id===coin.id);if(!target)return false;
   const spot=dueSpots.find(([x,y])=>Math.hypot(x-500,y-500)>35&&board.coins.every(other=>other.id===target.id||other.pocketed||Math.hypot(other.x-x,other.y-y)>40));
   if(!spot)return false;
   target.pocketed=false;target.x=spot[0];target.y=spot[1];target.vx=0;target.vy=0;return true;
  };
  const returnNewOwnCoins=()=>{let count=0;for(const coin of ownNew){const current=board.coins.find(x=>x.id===coin.id);if(current?.pocketed&&putCoinBack(coin))count++;}return count;};
  const returnPriorOwnCoins=count=>{let returned=0;while(returned<count){const prior=board.coins.find(x=>x.color===ownColor&&x.pocketed&&!ownNew.some(n=>n.id===x.id));if(!prior||!putCoinBack(prior))break;returned++;}return returned;};
  if(!s.breakDone&&!board.touchedCoin){
   s.carromBoard=board;
   if(board.strikerPocketed){s.breakDone=true;s.boardBreaker=(s.turn+1)%s.players.length;s.status='Unmade break with striker pocketed: turn passes without a due.';advance(s);return s;}
   if(s.breakAttempts<2){s.breakAttempts++;s.status='Break not made. Retry '+(s.breakAttempts+1)+' of 3.';return s;}
   s.breakDone=true;s.boardBreaker=(s.turn+1)%s.players.length;s.status='Break not made after three attempts. Break passes to the opponent.';advance(s);return s;
  }
  s.breakDone=true;s.breakAttempts=0;
  let dueCount=Number(s.due?.[team]||0);
  if(strikerFoul){
   const returnedNew=returnNewOwnCoins();dueCount+=1;dueCount-=returnPriorOwnCoins(dueCount);s.due[team]=Math.max(0,dueCount);
  }else{
   for(const coin of ownNew){if(dueCount<=0)break;if(putCoinBack(coin))dueCount--;}
   s.due[team]=Math.max(0,dueCount);
  }
  board.pocketed={white:0,black:0};board.coins.forEach(x=>{if(x.pocketed&&(x.color==='white'||x.color==='black'))board.pocketed[x.color]++;});
  const ownNewStill=ownNew.filter(x=>board.coins.find(q=>q.id===x.id)?.pocketed).length;
  let invalidQueen=false,missedCover=false,coverThisShot=false,queenReturnedByStriker=false;
  if(strikerFoul){
   if(queenShot){putQueenBack();s.queenPending=null;queenReturnedByStriker=true;if(hadDueAtStart||(beforeOwn===0&&ownNew.length===0))invalidQueen=true;}
   else if(hadPendingQueen){
    if(ownNew.length>0){s.queenPending={team,playerId:id};}
    else{putQueenBack();s.queenPending=null;missedCover=true;}
   }
  }else if(queenShot){
   if(hadDueAtStart||(beforeOwn===0&&ownNewStill===0)){putQueenBack();s.queenPending=null;invalidQueen=true;}
   else if((beforeOwn>0&&ownNewStill>0)||(beforeOwn===0&&ownNewStill>=2)){s.queenCoveredBy=team;s.queenPending=null;board.queenCoveredBy=team;coverThisShot=true;}
   else{s.queenPending={team,playerId:id};}
  }else if(hadPendingQueen){
   if(!hadDueAtStart&&ownNewStill>0){s.queenCoveredBy=team;s.queenPending=null;board.queenCoveredBy=team;coverThisShot=true;}
   else{putQueenBack();s.queenPending=null;missedCover=true;}
  }
  s.carromBoard=board;
  const ownCount=board.pocketed[ownColor]||0,oppCount=board.pocketed[oppColor]||0;
  let boardWinner=null,boardPoints=0;
  if(strikerFoul&&rawOwnCount>=9&&rawOppCount>=9){
   boardWinner=1-team;
   boardPoints=queenShot||queenCoveredBefore===1-team||!queenCoveredBefore?(s.matchPoints[1-team]<22?3:1):1;
  }else if(strikerFoul&&rawOwnCount>=9&&!queenShot&&queenCoveredBefore!==team){
   boardWinner=1-team;boardPoints=s.matchPoints[1-team]<22?3:1;
  }else if(strikerFoul&&rawOppCount>=9&&!queenShot&&!queenCoveredBefore){
   boardWinner=1-team;boardPoints=Math.max(0,9-rawOwnCount)+(s.matchPoints[1-team]<22?3:0);
  }else if(coverThisShot&&oppCount>=9){
   if(ownCount>=9){boardWinner=team;boardPoints=s.matchPoints[team]>=22?1:3;}
   else{boardWinner=1-team;boardPoints=Math.max(0,9-ownCount)+(s.matchPoints[1-team]<22?3:0);}
  }else if(ownCount>=9){
   if(s.queenCoveredBy===team){boardWinner=team;boardPoints=Math.max(0,9-oppCount)+(s.matchPoints[team]<22?3:0);}
   else{boardWinner=1-team;boardPoints=s.matchPoints[1-team]<22?3:1;}
  }else if(!strikerFoul&&oppCount>=9&&!s.queenCoveredBy){
   boardWinner=1-team;boardPoints=Math.max(0,9-ownCount)+(s.matchPoints[1-team]<22?3:0);
  }
  if(boardWinner!==null){
   s.matchPoints[boardWinner]+=boardPoints;s.boardsPlayed++;s.boardComplete=true;s.boardWinnerTeam=boardWinner;s.boardPoints=boardPoints;s.due=[0,0];
   s.players.forEach((pl,i)=>{s.score[pl.id]=s.matchPoints[i%2];});
   s.status='Board complete. Team '+(boardWinner+1)+' scores '+boardPoints+' points.';
   if(s.matchPoints[boardWinner]>=25||(s.boardsPlayed>=8&&s.matchPoints[0]!==s.matchPoints[1])){
    s.gameWinnerTeam=boardWinner;s.gamesWon[boardWinner]++;s.gameComplete=true;
    if(s.gamesWon[boardWinner]>=2){s.winner=s.players.find((pl,i)=>i%2===boardWinner)?.id;s.matchWinner=boardWinner;s.status='Carrom match complete. Games won '+s.gamesWon.join(' – ')+'.';}
    else s.status='Game '+s.gameNumber+' complete. Games won '+s.gamesWon.join(' – ')+'.';
   }else if(s.boardsPlayed>=8)s.status='Scores tied after eight boards. An extra board is required.';
   return s;
  }
  if(invalidQueen||missedCover){advance(s);return s;}
  if(strikerFoul){
   if(queenReturnedByStriker&&!hadDueAtStart){s.status='Queen and striker returned; due applied. Turn continues.';return s;}
   if(ownNew.length>0){s.status='Striker pocketed with own coin(s): due applied; turn continues.';return s;}
   s.status='Striker pocketed. Due applied; turn passes.';advance(s);return s;
  }
  if(queenShot&&s.queenPending){s.status='Queen pocketed. Cover it on the immediate next stroke.';return s;}
  if(ownNew.length>0){s.status='Own coin pocketed. Shoot again.';return s;}
  s.status=oppNew.length>0?'Opponent coin pocketed; turn passes.':'No own coin pocketed. Turn passes.';advance(s);return s;
 }
 if(s.name==='Carrom'&&action.type==='carrom_next_board'){
  if(!s.boardComplete||s.gameComplete||s.winner)return s;
  const next=initialGame('Carrom',s.players,s.mode);next.boardNumber=s.boardNumber+1;next.boardsPlayed=s.boardsPlayed;next.matchPoints=[...s.matchPoints];next.gamesWon=[...s.gamesWon];next.gameNumber=s.gameNumber;next.firstBreaker=s.firstBreaker;next.seatRotation=s.seatRotation;next.score={};next.players.forEach((pl,i)=>next.score[pl.id]=next.matchPoints[i%2]);const extraBoardToss=s.boardsPlayed>=8&&s.matchPoints[0]===s.matchPoints[1];next.turn=extraBoardToss?rand(s.players.length):(s.boardBreaker+1)%s.players.length;next.boardBreaker=next.turn;next.extraBoardToss=extraBoardToss;next.teamColours=[];next.teamColours[next.turn%2]='white';next.teamColours[1-next.turn%2]='black';next.players.forEach((pl,i)=>{next.colours[pl.id]=next.teamColours[i%2];});next.status='Board '+next.boardNumber+' started.';return next;
 }
 if(s.name==='Carrom'&&action.type==='carrom_next_game'){
  if(!s.gameComplete||s.matchWinner!==null&&s.matchWinner!==undefined||s.winner)return s;
  const next=initialGame('Carrom',s.players,s.mode);next.gameNumber=s.gameNumber+1;next.gamesWon=[...s.gamesWon];next.firstBreaker=s.firstBreaker;next.turn=next.gameNumber===2?(s.firstBreaker+1)%s.players.length:s.firstBreaker;next.boardBreaker=next.turn;next.seatRotation=(s.seatRotation+1)%s.players.length;next.teamColours=[];next.teamColours[next.turn%2]='white';next.teamColours[1-next.turn%2]='black';next.players.forEach((pl,i)=>{next.colours[pl.id]=next.teamColours[i%2];});next.status='Game '+next.gameNumber+' of 3. Breaker has white.';return next;
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
 if(s.name==='UNO'&&action.type==='uno_opening_color'){if(!s.pendingOpeningWild||!colors.includes(action.color))return s;s.activeColor=action.color;s.pendingOpeningWild=false;s.status='Opening Wild colour chosen.';return s;}
 if(s.name==='UNO'&&action.type==='uno_play'){
  if(s.pendingChallenge||s.pendingOpeningWild)return s;
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
 if(s.name==='UNO'&&action.type==='uno_draw'){if(s.pendingChallenge||s.pendingOpeningWild)return s;
  if(s.drawnCard)return s;
  s.pendingUno=null;
  const before=(s.hands[id]||[]).length;unoDraw(s,id,1);const hand=s.hands[id]||[];
  if(hand.length===before){s.status='No cards remain in the draw pile.';advance(s);return s;}
  const drawn=hand[hand.length-1],top=s.discard[s.discard.length-1];
  const playable=drawn.rank==='Wild'||drawn.rank==='+4'||drawn.color===s.activeColor||drawn.rank===top.rank;
  if(playable){s.drawnCard=drawn.id;s.status='Drawn card may be played, or pass.';return s;}
  s.status='Drew one card; turn passes.';advance(s);return s;
 }
 if(s.name==='UNO'&&action.type==='uno_pass_drawn'){if(s.pendingChallenge||s.pendingOpeningWild)return s;if(!s.drawnCard)return s;s.drawnCard=null;s.pendingUno=null;s.status='Turn passed.';advance(s);return s;}
 if(s.name==='UNO'&&action.type==='uno_call'){if(s.pendingUno!==id)return s;s.pendingUno=null;s.status='UNO called.';return s;}
 if(s.name==='UNO'&&action.type==='uno_catch'){if(s.pendingChallenge||s.pendingOpeningWild)return s;
  if(!s.pendingUno||s.pendingUno===id)return s;unoDraw(s,s.pendingUno,2);s.status='UNO not called in time: two-card penalty.';s.pendingUno=null;return s;
 }
 if(s.name==='UNO'&&action.type==='uno_challenge'){
  const challenge=s.pendingChallenge;if(!challenge||challenge.target!==id)return s;
  s.pendingUno=null;
  if(challenge.hadMatchingColor){unoDraw(s,challenge.offender,4);if(!(s.hands[challenge.offender]||[]).length)unoRoundEnd(s,challenge.offender);else{s.status='Challenge successful. The Wild Draw Four player draws four; challenger plays.';}}
  else{unoDraw(s,id,6);s.status='Challenge unsuccessful. Draw six cards.';if(!(s.hands[challenge.offender]||[]).length)unoRoundEnd(s,challenge.offender);else advance(s);}
  s.pendingChallenge=null;return s;
 }
 if(s.name==='UNO'&&action.type==='uno_accept'){
  const challenge=s.pendingChallenge;if(!challenge||challenge.target!==id)return s;
  s.pendingUno=null;unoDraw(s,id,4);s.pendingChallenge=null;if(!(s.hands[challenge.offender]||[]).length){unoRoundEnd(s,challenge.offender);return s;}s.status='Drew four cards; turn skipped.';advance(s);return s;
 }
 if(s.name==='29'&&action.type==='29_next_hand'){if(!s.winner||s.matchWinner!==null)return s;const next=initialGame('29',s.players);next.round=s.round+1;next.dealer=(s.dealer+3)%4;next.firstTurn=(next.dealer+3)%4;next.turn=next.firstTurn;next.matchScore=[...s.matchScore];next.status='Next hand started.';return next;}
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
   if(!winning){const next=initialGame('29',s.players);next.round=s.round+1;next.dealer=(s.dealer+3)%4;next.firstTurn=(next.dealer+3)%4;next.turn=next.firstTurn;next.matchScore=[...s.matchScore];next.status='All players passed. New deal.';return next;}
   s.contract=winning;s.phase='deal2';
   s.players.forEach(p=>{s.hands[p.id]=s.hands[p.id].concat(s.deck.splice(0,4));});
   s.turn=s.players.findIndex(p=>p.id===s.contract.player);s.status='Second four cards dealt. Bid winner must select hidden trump.';return s;
  }
  advance(s,-1);s.status=action.pass?'Passed.':'Bid '+bid+'.';return s;
 }
 if(s.name==='29'&&action.type==='29_trump'){
  if(s.phase!=='deal2'||s.contract?.player!==id||!suits.includes(action.suit))return s;
  s.trump=action.suit;s.trumpHidden=true;s.phase='play';s.turn=s.firstTurn;s.trickLeader=s.firstTurn;s.status='Trump selected and hidden. Play begins.';return s;
 }
 if(s.name==='29'&&action.type==='29_reveal_trump'){
  if(s.phase!=='play'||!s.trumpHidden||!s.currentTrick.length)return s;
  const lead=s.currentTrick[0].card.suit,hand=s.hands[id]||[];
  if(hand.some(card=>card.suit===lead))return s;
  s.trumpHidden=false;s.trumpRevealed=true;s.status='Trump revealed: '+s.trump+'.';return s;
 }
 if(s.name==='Playcards – Breez'&&action.type==='bridge_bid'){
  if(s.phase!=='auction')return s;
  if(action.pass){
   s.bids.push({player:id,kind:'pass'});s.passCount++;
   if(!s.lastBid&&s.passCount>=4){const next=initialGame('Playcards – Breez',s.players);next.boardNumber=s.boardNumber+1;next.dealer=(s.dealer+1)%4;next.turn=next.dealer;next.status='Passed out. New deal.';return next;}
   if(s.lastBid&&s.passCount>=3){
    const side=s.players.findIndex(p=>p.id===s.lastBidder)%2;
    const declarerBid=s.bids.find(x=>x.kind==='bid'&&x.suit===s.lastBid.suit&&s.players.findIndex(p=>p.id===x.player)%2===side);
    s.declarer=declarerBid?.player||s.lastBidder;s.dummy=s.players[(s.players.findIndex(p=>p.id===s.declarer)+2)%4].id;
    s.contract={...s.lastBid,player:s.declarer,bidder:s.lastBidder,multiplier:s.multiplier};s.trump=s.contract.suit==='NT'?null:s.contract.suit;s.phase='play';s.dummyRevealed=false;s.contractTricks=0;s.currentTrick=[];s.tricks=[];s.turn=(s.players.findIndex(p=>p.id===s.declarer)+1)%4;s.trickLeader=s.turn;s.status='Contract set: '+s.contract.level+s.contract.suit+'. Opening lead.';return s;
   }
   advance(s);s.status='Pass.';return s;
  }
  if(action.double||action.redouble){
   if(!s.lastBid)return s;
   const bidderSide=s.players.findIndex(p=>p.id===s.lastBidder)%2,actorSide=s.turn%2;
   if(action.double&&s.multiplier===1&&actorSide!==bidderSide)s.multiplier=2;
   else if(action.redouble&&s.multiplier===2&&actorSide===bidderSide)s.multiplier=4;
   else return s;
   s.passCount=0;s.bids.push({player:id,kind:action.double?'double':'redouble'});advance(s);s.status=action.double?'Doubled.':'Redoubled.';return s;
  }
  const level=Number(action.level),strain=bridgeStrains.indexOf(action.suit);
  if(!Number.isInteger(level)||level<1||level>7||strain<0)return s;
  const value=(level-1)*5+strain,last=s.lastBid?(s.lastBid.level-1)*5+bridgeStrains.indexOf(s.lastBid.suit):-1;
  if(value<=last)return s;
  s.lastBid={level,suit:action.suit};s.lastBidder=id;s.multiplier=1;s.passCount=0;s.bids.push({player:id,kind:'bid',level,suit:action.suit});advance(s);s.status='Bid '+level+action.suit+'.';return s;
 }
 if(s.name==='Playcards – Breez'&&action.type==='bridge_next_deal'){
  if(!s.winner)return s;
  const next=initialGame('Playcards – Breez',s.players);next.boardNumber=s.boardNumber+1;next.dealer=(s.dealer+1)%4;next.turn=next.dealer;next.vulnerableTeams=[[false,false],[true,false],[false,true],[true,true]][(next.boardNumber-1)%4];next.status='Board '+next.boardNumber+' auction begins.';return next;
 }
if((s.name==='Playcards – Breez'||s.name==='29')&&action.type==='trick_card'){
  if(s.name==='29'&&s.phase!=='play')return s;
  if(s.name==='Playcards – Breez'&&s.phase!=='play')return s;
  const handId=s.name==='Playcards – Breez'&&s.players[s.turn]?.id===s.dummy?s.dummy:id;
  const hand=s.hands[handId]||[],card=hand.find(x=>x.id===action.cardId);if(!card)return s;
  if(s.currentTrick.length&&hand.some(x=>x.suit===s.currentTrick[0].card.suit)&&card.suit!==s.currentTrick[0].card.suit)return s;
  if(s.name==='29'&&s.currentTrick.length&&s.trumpHidden&&!hand.some(x=>x.suit===s.currentTrick[0].card.suit))return s;
  s.hands[handId]=hand.filter(x=>x.id!==card.id);s.currentTrick.push({player:handId,card});
  if(s.name==='Playcards – Breez'&&!s.dummyRevealed)s.dummyRevealed=true;
  if(s.currentTrick.length===4){
   const lead=s.currentTrick[0].card.suit,trump=s.name==='29'&&!s.trumpRevealed?null:s.name==='Playcards – Breez'?s.trump:s.trump;
   const eligible=s.currentTrick.filter(x=>trump&&x.card.suit===trump);
   const pool=eligible.length?eligible:s.currentTrick.filter(x=>x.card.suit===lead);
   const winRank=s.name==='29'?rank29:(r=>['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(String(r)));
   pool.sort((a,b)=>s.name==='29'?winRank(a.card.rank)-winRank(b.card.rank):winRank(b.card.rank)-winRank(a.card.rank));
   const win=pool[0],wi=s.players.findIndex(x=>x.id===win.player);
   if(s.name==='29'){
    const team=wi%2;s.teamPoints[team]+=s.currentTrick.reduce((v,x)=>v+cardPoints(x.card),0);
    if(s.tricks.length===7){s.teamPoints[team]+=1;s.lastTrickTeam=team;}
   }else{
    const declarerTeam=s.players.findIndex(p=>p.id===s.declarer)%2;
    if(wi%2===declarerTeam)s.contractTricks++;
   }
   s.tricks.push({winner:win.player,cards:s.currentTrick});s.currentTrick=[];s.turn=wi;s.status='Trick won by '+(s.players[wi]?.name||'player')+'.';
   if(s.name==='Playcards – Breez'&&s.tricks.length===13){
    const declarerTeam=s.players.findIndex(p=>p.id===s.declarer)%2,score=bridgeDuplicateScore(s.contract,s.contractTricks,!!s.vulnerableTeams?.[declarerTeam]);
    s.bridgeScore=score;s.teamScore=[0,0];s.teamScore[declarerTeam]=score;s.teamScore[1-declarerTeam]=-score;
    const winningTeam=score>=0?declarerTeam:1-declarerTeam;s.winner=s.players.find((p,i)=>i%2===winningTeam)?.id;s.phase='complete';
    s.status='Bridge complete: '+s.contract.level+s.contract.suit+(s.contract.multiplier===2?' doubled':s.contract.multiplier===4?' redoubled':'')+'. '+s.contractTricks+' tricks by declarer side. Score '+score+'.';
   }
   if(s.name==='29'&&s.tricks.length===8){
    const contractTeam=s.players.findIndex(p=>p.id===s.contract.player)%2,made=s.teamPoints[contractTeam]>=s.contract.bid;
    s.matchScore[contractTeam]+=made?1:-1;s.phase='complete';const handWinnerTeam=made?contractTeam:1-contractTeam;s.winner=s.players.find((p,i)=>i%2===handWinnerTeam)?.id;
    s.matchWinner=s.matchScore[contractTeam]>=6?contractTeam:s.matchScore[contractTeam]<=-6?1-contractTeam:null;
    s.status='29 complete. Team points: '+s.teamPoints.join(' – ')+'. Bid '+(made?'made':'failed')+'. Match score: '+s.matchScore.join(' – ');
   }
  }else advance(s,s.name==='29'?-1:1);
  return s;
 }
 if(s.name==='Jackaroo'&&action.type==='jackaroo_discard'){
  const pending=s.pendingDiscard;if(!pending)return s;
  if(pending.chooser==='attacker'){
   if(id!==pending.by||s.players[s.turn]?.id!==pending.by)return s;
   const targetHand=s.hands[pending.target]||[],index=Number(action.index);
   if(!targetHand.length){s.pendingDiscard=null;s.status='The next player has no card to discard.';return jackarooAdvance(s);}
   if(!Number.isInteger(index)||index<0||index>=targetHand.length)return s;
   s.deckDiscard.push(targetHand.splice(index,1)[0]);s.pendingDiscard=null;s.status='One hidden card was discarded.';return jackarooAdvance(s);
  }
  if(pending.chooser==='target'){
   if(id!==pending.target||s.players[s.turn]?.id!==pending.target)return s;
   const targetHand=s.hands[id]||[],index=targetHand.findIndex(x=>x.id===action.cardId);if(index<0)return s;
   s.deckDiscard.push(targetHand.splice(index,1)[0]);s.pendingDiscard=null;s.status='Card discarded. Your turn continues.';return targetHand.length?s:jackarooAdvance(s);
  }
  return s;
 }
 if(s.name==='Jackaroo'&&action.type==='jackaroo_burn'){
  if(s.pendingDiscard)return s;
  const hand=s.hands[id]||[];if(!hand.length||jackarooHasLegalMove(s,id))return s;
  const burned=hand.find(x=>x.id===action.cardId)||hand[0];s.deckDiscard.push(burned);s.hands[id]=hand.filter(x=>x.id!==burned.id);s.status='No legal move: one card burned.';
  return jackarooAdvance(s);
 }
 if(s.name==='Jackaroo'&&action.type==='jackaroo_play'){
  if(s.pendingDiscard)return s;
  const hand=s.hands[id]||[],card=hand.find(x=>x.id===action.cardId);if(!card)return s;
  const ownerId=action.ownerId||id,ownerIndex=s.players.findIndex(p=>p.id===ownerId),myIndex=s.players.findIndex(p=>p.id===id);
  const partner=s.players[(myIndex+2)%4].id,allowedOwners=[id,...(s.marbles[id].every(v=>v>=52)?[partner]:[])];
  let played=false,keepTurn=false;
  if(card.rank==='J'){
   const source=action.source||{ownerId,marble:action.marble},target=action.target;
   if(!source||!target||!allowedOwners.includes(source.ownerId)||target.ownerId===source.ownerId)return s;
   const srcIdx=s.players.findIndex(p=>p.id===source.ownerId),dstIdx=s.players.findIndex(p=>p.id===target.ownerId);
   const a=s.marbles[source.ownerId]?.[source.marble],b=s.marbles[target.ownerId]?.[target.marble];
   if(srcIdx<0||dstIdx<0||a<=0||a>=52||b<=0||b>=52)return s;
   const ga=jackarooGlobal(srcIdx,a),gb=jackarooGlobal(dstIdx,b);
   s.marbles[source.ownerId][source.marble]=(gb-srcIdx*13+52)%52;
   s.marbles[target.ownerId][target.marble]=(ga-dstIdx*13+52)%52;played=true;
  }else if(card.rank==='Q'&&isRed(card.suit)){
   const next=s.players[(s.turn+1)%4].id;if((s.hands[next]||[]).length){s.pendingDiscard={by:id,target:next,chooser:'attacker'};keepTurn=true;}else s.status='Next player has no card to discard.';played=true;
  }else if(card.rank==='10'&&action.effect==='burn'){
   const next=s.players[(s.turn+1)%4].id;if((s.hands[next]||[]).length){s.pendingDiscard={by:id,target:next,chooser:'target'};s.turn=(s.turn+1)%4;keepTurn=true;}else s.status='Next player has no card to discard.';played=true;
  }else if(card.rank==='7'){
   const moves=Array.isArray(action.moves)?action.moves:[{ownerId,marble:action.marble,steps:7}];
   if(moves.length<1||moves.length>2||moves.reduce((n,m)=>n+Number(m.steps||0),0)!==7||(moves.length===2&&moves[0].ownerId===moves[1].ownerId&&moves[0].marble===moves[1].marble))return s;
   const test=clone(s);for(const m of moves){if(!allowedOwners.includes(m.ownerId||id)||!jackarooMove(test,m.ownerId||id,m.marble,m.steps))return s;}
   s.marbles=test.marbles;played=true;
  }else{
   let steps=card.rank==='A'?Number(action.steps||1):card.rank==='K'?13:card.rank==='Q'?12:card.rank==='4'?-4:card.rank==='5'?5:card.rank==='10'?10:Number(card.rank);
   const targetOwner=card.rank==='5'?(action.targetOwnerId||ownerId):ownerId;
   if(card.rank==='A'||card.rank==='K'){
    if(action.enter){const m=Number(action.marble),arr=s.marbles[ownerId],seat=s.players.findIndex(p=>p.id===ownerId),baseGlobal=seat*13,occupied=s.players.some((pl,pi)=>s.marbles[pl.id].some(v=>v>=0&&v<52&&jackarooGlobal(pi,v)===baseGlobal));if(!allowedOwners.includes(ownerId)||seat<0||arr?.[m]!==-1||occupied)return s;arr[m]=0;played=true;}
    else if(card.rank==='A'&&![1,11].includes(steps))return s;
    else if(allowedOwners.includes(ownerId))played=jackarooMove(s,ownerId,Number(action.marble),steps,card.rank==='K');
   }else if(card.rank==='5'){
    if(!s.players.some(p=>p.id===targetOwner))return s;
    const targetProgress=s.marbles[targetOwner]?.[Number(action.marble)];if(targetProgress===0||targetProgress===undefined)return s;if(targetProgress>=52&&targetOwner!==id&&targetOwner!==partner)return s;if(targetOwner===partner&&!s.marbles[id].every(v=>v>=52))return s;played=jackarooMove(s,targetOwner,Number(action.marble),5,false);
   }else if(card.rank==='10'&&action.effect==='move'||card.rank==='Q'&&!isRed(card.suit)||!['J','7'].includes(card.rank)&&card.rank!=='A'&&card.rank!=='K'&&!(card.rank==='Q'&&isRed(card.suit))&&card.rank!=='10'){
    if(!allowedOwners.includes(ownerId))return s;
    played=jackarooMove(s,ownerId,Number(action.marble),steps,false);
   }
  }
  if(!played)return s;
  s.hands[id]=hand.filter(x=>x.id!==card.id);s.deckDiscard.push(card);
  const team=myIndex%2,teamPlayers=[s.players[team].id,s.players[(team+2)%4].id];
  if(teamPlayers.every(pid=>s.marbles[pid].every(v=>v>=52))){s.winner=id;s.status='All eight team marbles reached safety.';return s;}
  if(s.pendingDiscard){s.status=card.rank==='Q'?'Choose one hidden card from the next player.':'Discard one card before taking your turn.';return s;}s.status='Played '+card.rank+'.';return jackarooAdvance(s);
 }
 return s;
}

export default function RoomGames({visible,onClose,onGameAvailable,roomId,creatorName='Player',userId,supabase,isAuthorisedStarter=false,hasRoomSeat=false}){
 const [stage,setStage]=useState('select'),[selected,setSelected]=useState(null),[mode,setMode]=useState(2),[players,setPlayers]=useState([]),[seconds,setSeconds]=useState(60),[state,setState]=useState(null),[bet,setBet]=useState(0),[status,setStatus]=useState(''),[minimized,setMinimized]=useState(false);
 const [unoColor,setUnoColor]=useState('red'),[unoCallSelected,setUnoCallSelected]=useState(false),[carromAngle,setCarromAngle]=useState(0),[carromPower,setCarromPower]=useState(16),[jackarooCardId,setJackarooCardId]=useState(null),[jackarooSource,setJackarooSource]=useState(null),[jackarooFirst,setJackarooFirst]=useState(null),[jackarooSecond,setJackarooSecond]=useState(null),[jackarooSplit,setJackarooSplit]=useState(3);
 const channelRef=useRef(null),hostRef=useRef(false),hostIdRef=useRef(null),lobbyRef=useRef(null),privateReceiverRef=useRef(null),privateReceiverTopicRef=useRef(null),privateSenderChannelsRef=useRef({}),stateRef=useRef(null),stageRef=useRef(stage),timerRef=useRef(null),selectedRef=useRef(selected),playersRef=useRef(players),secondsRef=useRef(seconds),modeRef=useRef(mode);
 const onGameAvailableRef=useRef(onGameAvailable),minimizedRef=useRef(minimized);onGameAvailableRef.current=onGameAvailable;minimizedRef.current=minimized;
 const hideableGame=selected&&!['Brainstorm','Truth and Dare'].includes(selected.name);
 const canMinimize=stage==='play'&&hideableGame;
 const reopenGame=()=>{setMinimized(false);minimizedRef.current=false;onGameAvailableRef.current?.();};
 stateRef.current=state;stageRef.current=stage;selectedRef.current=selected;playersRef.current=players;secondsRef.current=seconds;modeRef.current=mode;
 const max=selected?.name==='Carrom'?mode:selected?.max;
 const min=selected?.name==='Carrom'?mode:selected?.min;
 const seated=hasRoomSeat;
 const seatExempt=['Truth and Dare','Brainstorm','Monster Crush','29'].includes(selected?.name);
 const canJoin=seatExempt||seated;
 const inLobby=players.some(p=>p.id===userId);
 const current=state?.players?.[state?.turn];
 const bridgeDummyTurn=stage==='play'&&selected?.name==='Playcards – Breez'&&current?.id===state?.dummy&&state?.declarer===userId;
 const isMyTurn=stage==='play'&&(current?.id===userId||bridgeDummyTurn);
 const publish=(type,extra={})=>channelRef.current?.send({type:'broadcast',event:'game_event',payload:{type,roomId,userId,...extra}});
 const clearPrivateChannels=()=>{if(privateReceiverRef.current)supabase?.removeChannel(privateReceiverRef.current);privateReceiverRef.current=null;privateReceiverTopicRef.current=null;Object.values(privateSenderChannelsRef.current).forEach(entry=>{if(entry?.channel)supabase?.removeChannel(entry.channel);});privateSenderChannelsRef.current={};};
 const subscribePrivateReceiver=lid=>{if(!supabase||!roomId||!userId||!lid)return;const topic='room-games-private-'+roomId+'-'+lid+'-'+userId;if(privateReceiverTopicRef.current===topic)return;if(privateReceiverRef.current)supabase.removeChannel(privateReceiverRef.current);const ch=supabase.channel(topic,{config:{private:true}});ch.on('broadcast',{event:'private_game_state'},({payload:p})=>{if(!p||p.roomId!==roomId||p.lobbyId!==lid||p.recipientId!==userId||p.userId!==hostIdRef.current||hostRef.current)return;stateRef.current=p.snapshot;setState(p.snapshot);if(p.snapshot?.winner)setStage('result');});privateReceiverRef.current=ch;privateReceiverTopicRef.current=topic;ch.subscribe();};
 const sendPrivateSnapshot=(player,snapshot)=>{if(!supabase||!roomId||!lobbyRef.current||player.id===userId)return;const lid=lobbyRef.current,topic='room-games-private-'+roomId+'-'+lid+'-'+player.id,payload={roomId,lobbyId:lid,userId,recipientId:player.id,snapshot};let entry=privateSenderChannelsRef.current[player.id];if(!entry){const ch=supabase.channel(topic,{config:{private:true}});entry={channel:ch,subscribed:false,pending:payload};privateSenderChannelsRef.current[player.id]=entry;ch.subscribe(status=>{if(status==='SUBSCRIBED'){entry.subscribed=true;const latest=entry.pending;entry.pending=null;if(latest)ch.send({type:'broadcast',event:'private_game_state',payload:latest});}});}else{entry.pending=payload;if(entry.subscribed){entry.pending=null;entry.channel.send({type:'broadcast',event:'private_game_state',payload});}}};
 const sendGameSnapshots=next=>{publish('game_state',{lobbyId:lobbyRef.current,snapshot:publicGameSnapshot(next)});next?.players?.forEach(pl=>sendPrivateSnapshot(pl,publicGameSnapshot(next,pl.id)));};
 const sync=next=>{stateRef.current=next;setState(next);if(next?.winner)setStage('result');sendGameSnapshots(next);};
 const doAction=action=>{if(!isMyTurn||!state)return;if(hostRef.current)sync(applyMove(state,userId,action));else publish('game_action',{lobbyId:lobbyRef.current,action});};
 const reset=(notify=true)=>{if(notify&&lobbyRef.current){if(hostRef.current)publish('lobby_closed',{lobbyId:lobbyRef.current});else publish('leave_game',{lobbyId:lobbyRef.current,playerId:userId});}clearPrivateChannels();clearInterval(timerRef.current);setStage('select');setSelected(null);setPlayers([]);setState(null);setStatus('');setBet(0);setMinimized(false);minimizedRef.current=false;hostRef.current=false;hostIdRef.current=null;lobbyRef.current=null;};
 const close=()=>{if(canMinimize){setMinimized(true);minimizedRef.current=true;}onClose?.();};
 useEffect(()=>{
  if(!roomId||!userId||!supabase)return;
  const ch=supabase.channel('room-games-'+roomId,{config:{private:true}});channelRef.current=ch;
  ch.on('broadcast',{event:'game_event'},({payload:p})=>{
   if(!p||p.roomId!==roomId||p.userId===userId)return;
   if(p.type==='request_state'&&hostRef.current){publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,state:publicGameSnapshot(stateRef.current),stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});if(stateRef.current)sendGameSnapshots(stateRef.current);}
   if(p.type==='create_lobby'&&!lobbyRef.current){const game=GAMES.find(g=>g.name===p.gameName);const hostPlayer=Array.isArray(p.players)?p.players.find(x=>x?.id===p.userId):null;if(typeof p.lobbyId!=='string'||!p.lobbyId.endsWith('-'+p.userId)||!hostPlayer||!game||['Truth and Dare','Brainstorm','Monster Crush','29'].includes(game.name))return;setMinimized(false);minimizedRef.current=false;lobbyRef.current=p.lobbyId;hostRef.current=false;hostIdRef.current=p.userId;setSelected(game);setPlayers([{id:p.userId,name:String(hostPlayer.name||'Player').slice(0,32)}]);setSeconds(60);setStage('lobby');subscribePrivateReceiver(p.lobbyId);setStatus('Join this game from the room.');if(!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='join_game'&&hostRef.current&&p.lobbyId===lobbyRef.current&&p.player?.id===p.userId&&(!selectedRef.current?.timed||secondsRef.current>0)){setPlayers(old=>{const cap=selectedRef.current?.name==='Carrom'?modeRef.current:selectedRef.current?.max;if(old.some(x=>x.id===p.player.id)||old.length>=cap)return old;const next=[...old,p.player];playersRef.current=next;publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:'lobby',selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});return next;});}
   if(p.type==='lobby_state'&&p.userId===hostIdRef.current&&p.lobbyId&&(!lobbyRef.current||p.lobbyId===lobbyRef.current)){if(!lobbyRef.current)lobbyRef.current=p.lobbyId;subscribePrivateReceiver(p.lobbyId);setPlayers(p.players||[]);playersRef.current=p.players||[];if(Number.isFinite(Number(p.seconds)))setSeconds(Math.max(0,Math.min(60,Number(p.seconds))));if(p.mode)setMode(p.mode);if(p.selected){const game=GAMES.find(g=>g.name===p.selected)||null;setSelected(game);if(game&&!['Truth and Dare','Brainstorm','Monster Crush','29'].includes(game.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}if(p.stage==='play'&&p.state){stateRef.current=p.state;setState(p.state);setStage('play');}else setStage('lobby');}
   if(p.type==='start_game'&&p.lobbyId===lobbyRef.current&&(p.userId===hostIdRef.current||(p.authorizedStarter===true&&playersRef.current.some(pl=>pl.id===p.userId)))){hostIdRef.current=p.userId;hostRef.current=false;stateRef.current=p.snapshot;setState(p.snapshot);setStage('play');if(!['Truth and Dare','Brainstorm','Monster Crush','29'].includes(p.snapshot?.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='game_action'&&hostRef.current&&p.lobbyId===lobbyRef.current){const next=applyMove(stateRef.current,p.userId,p.action);sync(next);}
   if(p.type==='game_state'&&p.userId===hostIdRef.current&&p.lobbyId===lobbyRef.current&&!hostRef.current){stateRef.current=p.snapshot;setState(p.snapshot);if(p.snapshot?.winner)setStage('result');}
   
   if(p.type==='leave_game'&&hostRef.current&&p.lobbyId===lobbyRef.current&&p.playerId===p.userId){setPlayers(old=>{const next=old.filter(x=>x.id!==p.playerId);playersRef.current=next;publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current});return next;});}
   if(p.type==='lobby_closed'&&p.userId===hostIdRef.current&&p.lobbyId===lobbyRef.current){reset(false);}
  });
  ch.subscribe(st=>{if(st==='SUBSCRIBED')publish('request_state');});
  return()=>{channelRef.current=null;supabase.removeChannel(ch);clearPrivateChannels();};
 },[roomId,userId,supabase]);
 useEffect(()=>{if(stage!=='lobby'||!selected?.timed||bet!==0||players.length<1||!hostRef.current||secondsRef.current<=0)return;timerRef.current=setInterval(()=>{const next=Math.max(0,secondsRef.current-1);secondsRef.current=next;setSeconds(next);publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,stage:'lobby',selected:selectedRef.current?.name,seconds:next,mode:modeRef.current});if(next===0)clearInterval(timerRef.current);},1000);return()=>clearInterval(timerRef.current);},[stage,selected,bet,players.length]);
 useEffect(()=>{if(stage==='lobby'&&seconds===0)setStatus(players.length<min?'Time expired — not enough players joined.':'Time expired — the game is ready to start.');},[seconds,stage,players.length,min]);
 const choose=g=>{if(['Truth and Dare','Brainstorm','Monster Crush','29'].includes(g.name)){setStatus(g.name+' is postponed until its rules are finalised.');return;}setSelected(g);setBet(0);setStage('setup');};
 const create=()=>{if(!selected||!userId){setStatus('Choose a game first.');return;}if(['Truth and Dare','Brainstorm','Monster Crush','29'].includes(selected.name)){setStatus('Rules for this game are still being finalised.');return;}const lid=String(Date.now())+'-'+userId,host={id:userId,name:creatorName};hostRef.current=true;hostIdRef.current=userId;lobbyRef.current=lid;setPlayers([host]);setStage('lobby');setStatus('Free play — no Good Coins are deducted or awarded.');publish('create_lobby',{lobbyId:lid,gameName:selected.name,players:[host],bet:0,mode});};
 const join=()=>{if(selected?.timed&&seconds<=0){setStatus('The one-minute joining time has ended.');return;}if(!canJoin){setStatus('Take a room mic seat before joining this game.');return;}if(inLobby||players.length>=max)return;publish('join_game',{lobbyId:lobbyRef.current,player:{id:userId,name:creatorName}});setStatus('Join request sent.');};
 const start=()=>{if(!(isAuthorisedStarter||hostRef.current)||players.length<min||['Truth and Dare','Brainstorm','Monster Crush','29'].includes(selected?.name))return;hostRef.current=true;hostIdRef.current=userId;const s=initialGame(selected.name,players,mode);stateRef.current=s;setState(s);setMinimized(false);minimizedRef.current=false;setStage('play');publish('start_game',{lobbyId:lobbyRef.current,authorizedStarter:!!isAuthorisedStarter,snapshot:publicGameSnapshot(s)});sendGameSnapshots(s);};
 const act=action=>doAction(action);
 const roll=()=>act({type:'roll',die:rand(6)+1});
 const currentHand=state?.hands?.[bridgeDummyTurn?state.dummy:userId]||[];
 const renderControls=()=>{
  if(!state)return null;
  if(state.name==='Snakes and Ladders'){
  const boardRows=Array.from({length:10},(_,row)=>{const level=9-row,base=level*10,nums=Array.from({length:10},(_,i)=>level%2===0?base+i+1:base+10-i);return <View key={'snakerow'+row} style={{flexDirection:'row'}}>{nums.map(n=>{const occupants=state.players.map((pl,i)=>({pl,i})).filter(x=>state.positions[x.pl.id]===n);const ladder=state.ladders[n],snake=state.snakes[n];return <View key={n} style={{flex:1,aspectRatio:1,borderWidth:0.5,borderColor:'#78634C',backgroundColor:ladder?'#244A37':snake?'#4A2630':'#2A2134',alignItems:'center',justifyContent:'center',padding:1}}><Text style={{color:ink,fontSize:8,fontWeight:'800'}}>{n}</Text>{ladder&&<Text style={{color:'#8FE0A8',fontSize:7}}>↑{ladder}</Text>}{snake&&<Text style={{color:'#FF9A9A',fontSize:7}}>↓{snake}</Text>}{occupants.length>0&&<Text style={{color:ink,fontSize:8}}>{occupants.map(x=>['🔴','🔵','🟢','🟡'][x.i]).join('')}</Text>}</View>;})}</View>;});
  return <><View style={{width:'100%',maxWidth:320,alignSelf:'center',borderWidth:1,borderColor:GOLD,padding:2,borderRadius:8}}>{boardRows}</View>{state.phase==='start_roll'?<><Text style={{color:ink}}>Everyone spins once. Highest number starts.</Text><Text style={{color:muted}}>{state.tiedStartPlayers.map(pid=>(state.players.find(p=>p.id===pid)?.name||'Player')+': '+(state.startingRolls[pid]??'—')).join(' · ')}</Text><Btn title="SPIN TO CHOOSE START PLAYER" onPress={()=>act({type:'start_roll',die:rand(6)+1})}/></>:<><Text style={{color:ink}}>Position: {state.positions[userId]} / 100</Text><Btn title="SPIN 1–6" onPress={roll}/></>}</>;
 }
  if(state.name==='Ludo'){
  const markers={};
  state.players.forEach((pl,seat)=>state.tokens[pl.id].forEach((progress,i)=>{let coord=null;if(progress===-1)coord=LUDO_BASES[seat][i];else if(progress===57)coord=[7,7];else if(progress>=52)coord=LUDO_HOME_LANES[seat][progress-52];else if(progress>=0)coord=LUDO_PATH[(seat*13+progress)%52];if(coord){const key=coord.join(',');if(!markers[key])markers[key]=[];markers[key].push({seat,i});}}));
  const startCells=[0,13,26,39],homeCellMap={};LUDO_HOME_LANES.forEach((lane,seat)=>lane.forEach(([r,col])=>homeCellMap[r+','+col]=seat));
  const board=Array.from({length:15},(_,r)=><View key={'lrow'+r} style={{flexDirection:'row'}}>{Array.from({length:15},(_,col)=>{const key=r+','+col,pathIndex=LUDO_PATH.findIndex(([rr,cc])=>rr===r&&cc===col),homeSeat=homeCellMap[key],baseSeat=r<6&&col<6?0:r<6&&col>8?1:r>8&&col>8?2:r>8&&col<6?3:-1,baseToken=markers[key]||[],safe=state.safe.includes(pathIndex),startSeat=startCells.indexOf(pathIndex),bg=pathIndex>=0?(startSeat>=0?LUDO_COLORS[startSeat]:safe?'#55452D':'#2A2134'):homeSeat!==undefined?LUDO_COLORS[homeSeat]:baseSeat>=0?LUDO_COLORS[baseSeat]+'33':r===7&&col===7?'#7A5A2C':'#1B1524';return <View key={key} style={{flex:1,aspectRatio:1,borderWidth:0.35,borderColor:'#76647E',backgroundColor:bg,alignItems:'center',justifyContent:'center'}}>{baseToken.length>0?<Text style={{fontSize:8,color:baseToken.length?LUDO_COLORS[baseToken[0].seat]:ink}}>{baseToken.length>1?'●'+baseToken.length:'●'}</Text>:pathIndex>=0&&safe?<Text style={{fontSize:7,color:GOLD}}>✦</Text>:r===7&&col===7?<Text style={{fontSize:8,color:GOLD}}>★</Text>:null}</View>;})}</View>);
  return <><Text style={{color:ink}}>Roll a die, then choose one legal token. Safe squares are marked ✦.</Text><View style={{width:'100%',maxWidth:320,alignSelf:'center',borderWidth:1,borderColor:GOLD,borderRadius:8,padding:2}}>{board}</View><Text style={{color:muted}}>Your tokens: {(state.tokens[userId]||[]).map((v,i)=>'T'+(i+1)+': '+(v<0?'Base':v===57?'Home':v)).join(' · ')}</Text><Btn title={state.pendingDie?'DIE '+state.pendingDie+' · CHOOSE TOKEN':'ROLL DICE'} onPress={()=>act({type:'ludo_roll',die:rand(6)+1})} disabled={!!state.pendingDie}/>{state.tokens[userId]?.map((v,i)=><Tile key={i} onPress={()=>act({type:'ludo_move',token:i})} disabled={!state.pendingDie||v===57||(v===-1&&state.pendingDie!==6)||(v>=0&&v+state.pendingDie>57)} active>{'TOKEN '+(i+1)+' · '+(v<0?'BASE':v===57?'HOME':v)}</Tile>)}</>;
 }
  if(state.name==='Carrom'){
  const board=state.carromBoard,scale=0.29,starts=state.mode===2?[{x:500,y:900},{x:500,y:100}]:[{x:500,y:900},{x:100,y:500},{x:500,y:100},{x:900,y:500}],striker=starts[(state.turn+(state.seatRotation||0))%state.mode],piecesLeft={white:9-(board.pocketed?.white||0),black:9-(board.pocketed?.black||0)};
  return <><Text style={{color:ink}}>Team colour: {state.teamColours[state.turn%2]} · Score {state.matchPoints.join(' – ')} · Game {state.gameNumber}/3 · Board {state.boardNumber}/8 · Games won {state.gamesWon.join(' – ')}</Text><Text style={{color:muted}}>White {piecesLeft.white} · Black {piecesLeft.black} · Queen {board.coins.find(x=>x.color==='queen')?.pocketed?'pocketed':'on board'}{state.queenPending?' · Cover pending':''}</Text><View style={{width:290,height:290,alignSelf:'center',backgroundColor:'#D7B77F',borderWidth:7,borderColor:'#79502B',borderRadius:12,overflow:'hidden'}}><View style={{position:'absolute',left:105,top:105,width:66,height:66,borderRadius:40,borderWidth:1,borderColor:'#8C5C34'}}/><View style={{position:'absolute',left:138.5,top:138.5,width:13,height:13,borderRadius:8,borderWidth:1,backgroundColor:'#B33B45',borderColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:250,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:263,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:27,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:40,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:27,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:40,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:250,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:263,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/>{[[0,0],[272,0],[0,272],[272,272]].map((pos,i)=><View key={'p'+i} style={{position:'absolute',left:pos[0],top:pos[1],width:18,height:18,borderRadius:10,backgroundColor:'#241A17',borderWidth:1,borderColor:'#F2D6A3'}}/>)}{board.coins.filter(x=>!x.pocketed).map(piece=><View key={piece.id} style={{position:'absolute',left:piece.x*scale-5.5,top:piece.y*scale-5.5,width:11,height:11,borderRadius:7,backgroundColor:piece.color==='queen'?'#C93E4B':piece.color==='white'?'#F4E9D2':'#241C24',borderWidth:1,borderColor:piece.color==='white'?'#8C6B43':'#E6C477'}}/>)}{striker&&!striker.pocketed&&<View style={{position:'absolute',left:striker.x*scale-7,top:striker.y*scale-7,width:14,height:14,borderRadius:8,backgroundColor:'#E7D4B2',borderWidth:2,borderColor:'#7A4E2D'}}/>}</View>{state.gameComplete?<><Text style={{color:GOLD}}>Game {state.gameNumber} complete · Games won {state.gamesWon.join(' – ')}</Text><Btn title="NEXT GAME" onPress={()=>act({type:'carrom_next_game'})}/></>:state.boardComplete?<><Text style={{color:GOLD}}>Board {state.boardNumber} complete · Team {state.boardWinnerTeam+1} scored {state.boardPoints}</Text><Btn title="NEXT BOARD" onPress={()=>act({type:'carrom_next_board'})}/></>:<><Text style={{color:ink}}>Aim angle: {carromAngle}° · Power: {carromPower}</Text><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}><Btn small title="ANGLE −10°" onPress={()=>setCarromAngle(v=>Math.max(-90,v-10))}/><Btn small title="ANGLE +10°" onPress={()=>setCarromAngle(v=>Math.min(90,v+10))}/><Btn small title="POWER −2" onPress={()=>setCarromPower(v=>Math.max(4,v-2))}/><Btn small title="POWER +2" onPress={()=>setCarromPower(v=>Math.min(28,v+2))}/></View><Btn title="SHOOT" onPress={()=>act({type:'carrom_shot',angle:carromAngle,power:carromPower})}/></>}</>;
 }
 if(state.name==='UNO'){
  if(state.pendingOpeningWild)return <><Text style={{color:ink}}>Opening Wild: choose the starting colour.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{colors.map(color=><Btn key={'open'+color} title={color.toUpperCase()} onPress={()=>act({type:'uno_opening_color',color})}/>)}</View></>;
  if(state.pendingChallenge)return <><Text style={{color:GOLD}}>Wild Draw Four challenge</Text><Text style={{color:ink}}>The previous player played a Wild Draw Four. Their remaining hand is shown for your challenge decision.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{(state.pendingChallenge.challengeHand||[]).map(card=><Tile key={card.id}>{String(card.rank)} {card.color}</Tile>)}</View><Btn title="ACCEPT +4" onPress={()=>act({type:'uno_accept'})}/><Btn title="CHALLENGE +4" onPress={()=>act({type:'uno_challenge'})}/></>;
  return <><Text style={{color:ink}}>Top: {String(state.discard.at(-1)?.rank)} · Colour: {state.activeColor}</Text><Text style={{color:GOLD}}>Match points: {state.matchPoints?.[userId]||0}/500</Text>{state.pendingUno&&state.turn===state.players.findIndex(p=>p.id===userId)&&<Btn title="CATCH MISSED UNO (+2)" onPress={()=>act({type:'uno_catch'})}/>}<Text style={{color:ink}}>Choose wild colour before playing:</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{colors.map(color=><Btn key={color} small title={color.toUpperCase()} onPress={()=>setUnoColor(color)}/>)}</View><Text style={{color:muted}}>Selected: {unoColor}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>{act({type:'uno_play',cardId:card.id,wildColor:unoColor,uno:currentHand.length===2&&unoCallSelected});setUnoCallSelected(false);}} disabled={state.drawnCard&&state.drawnCard!==card.id}>{String(card.rank)} {card.color==='wild'?'★':card.color}</Tile>)}</View>{state.drawnCard&&<Btn title="PASS AFTER DRAW" onPress={()=>act({type:'uno_pass_drawn'})}/>}<Btn title="DRAW ONE" onPress={()=>act({type:'uno_draw'})} disabled={!!state.drawnCard}/>{currentHand.length===2&&<Btn title={unoCallSelected?'UNO CALL: ON':'UNO CALL: OFF'} onPress={()=>setUnoCallSelected(v=>!v)}/>}</>;
 }

  if(state.name==='29')return <><Text style={{color:ink}}>Phase: {state.phase} · Trump: {state.trumpHidden?'Hidden':state.trump||'—'} · Tricks: {state.tricks.length}/8</Text><Text style={{color:ink}}>Team points: {state.teamPoints.join(' – ')} · Match: {state.matchScore.join(' – ')}</Text>{state.phase==='bidding'&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{[16,17,18,19,20,21,22,23,24,25,26,27,28].filter(v=>v>state.highBid).map(v=><Btn key={v} title={'BID '+v} small onPress={()=>act({type:'29_bid',bid:v})}/>)}<Btn title="PASS" onPress={()=>act({type:'29_bid',pass:true})}/></View>}{state.phase==='deal2'&&state.contract?.player===userId&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{suits.map(s=><Btn key={s} title={'SELECT '+s} onPress={()=>act({type:'29_trump',suit:s})}/>)}</View>}{state.phase==='play'&&<><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'trick_card',cardId:c.id})}>{cardLabel(c)}</Tile>)}</View>{state.trumpHidden&&state.currentTrick.length>0&&!currentHand.some(x=>x.suit===state.currentTrick[0].card.suit)&&<Btn title="REVEAL TRUMP" onPress={()=>act({type:'29_reveal_trump'})}/>}</>}</>;if(state.name==='Playcards – Breez')return <><Text style={{color:ink}}>Board {state.boardNumber} · {state.phase==='auction'?'Auction':state.contract?.level+state.contract?.suit+' · '+state.contract?.multiplier+'×'} · Tricks {state.tricks.length}/13</Text>{state.phase==='auction'&&<><Text style={{color:muted}}>Highest bid: {state.lastBid?state.lastBid.level+state.lastBid.suit:'None'} · Passes: {state.passCount}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{Array.from({length:7},(_,i)=>i+1).flatMap(level=>bridgeStrains.map(strain=><Btn key={level+strain} small title={level+strain} onPress={()=>act({type:'bridge_bid',level,suit:strain})}/>))}</View><View style={{flexDirection:'row'}}><Btn title="PASS" onPress={()=>act({type:'bridge_bid',pass:true})}/>{state.lastBid&&<Btn title="DOUBLE" onPress={()=>act({type:'bridge_bid',double:true})}/>}{state.multiplier===2&&<Btn title="REDOUBLE" onPress={()=>act({type:'bridge_bid',redouble:true})}/>}</View></>}{state.phase==='play'&&<><Text style={{color:ink}}>Contract: {state.contract.level}{state.contract.suit} · Declarer: {state.players.find(p=>p.id===state.declarer)?.name} · Dummy: {state.dummyRevealed?state.players.find(p=>p.id===state.dummy)?.name:'Hidden'}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>act({type:'trick_card',cardId:card.id})}>{cardLabel(card)}</Tile>)}</View>{state.dummyRevealed&&<Text style={{color:muted}}>Dummy's hand is exposed.</Text>}</>}</>;
  if(state.name==='Jackaroo'){
  const chosen=currentHand.find(x=>x.id===jackarooCardId),seat=state.players.findIndex(p=>p.id===userId),partner=state.players[(seat+2)%4],owners=[userId,...(state.marbles[userId]?.every(v=>v>=52)?[partner?.id].filter(Boolean):[])],rows=owners.flatMap(owner=>state.marbles[owner].map((v,i)=>({owner,marble:i,progress:v}))),track=rows.filter(m=>m.progress>=0&&m.progress<52),movable=rows.filter(m=>m.progress>=0&&m.progress<=55),markers={};if(state.pendingDiscard){const pd=state.pendingDiscard;if(pd.chooser==='attacker'&&pd.by===userId){const count=Math.max(0,Number(state.handCounts?.[pd.target]||0));return <><Text style={{color:GOLD}}>Choose one hidden card from the next player to discard.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{Array.from({length:count},(_,i)=><Btn key={'hidden'+i} title={'CARD BACK '+(i+1)} onPress={()=>act({type:'jackaroo_discard',index:i})}/>)}</View></>;}if(pd.chooser==='target'&&pd.target===userId){return <><Text style={{color:GOLD}}>Discard one card before taking your turn.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>act({type:'jackaroo_discard',cardId:card.id})}>{card.rank}{card.suit}</Tile>)}</View></>;}return <Text style={{color:ink}}>Waiting for the required discard.</Text>;}state.players.forEach((pl,pi)=>state.marbles[pl.id].forEach((progress,i)=>{const coord=progress<0?JACKAROO_BASES[pi][i]:progress>=52?JACKAROO_SAFETY[pi][progress-52]:JACKAROO_PATH[(pi*13+progress)%52],key=coord.join(',');if(!markers[key])markers[key]=[];markers[key].push(pi);}));const boardRows=Array.from({length:14},(_,r)=><View key={'jrow'+r} style={{flexDirection:'row'}}>{Array.from({length:14},(_,col)=>{const key=r+','+col,pathIndex=JACKAROO_PATH.findIndex(([rr,cc])=>rr===r&&cc===col),startSeat=[0,13,26,39].indexOf(pathIndex),safeSeat=JACKAROO_SAFETY.findIndex(lane=>lane.some(([rr,cc])=>rr===r&&cc===col)),baseSeat=r<6&&col<6?0:r<6&&col>7?1:r>7&&col>7?2:r>7&&col<6?3:-1,bg=pathIndex>=0?(startSeat>=0?JACKAROO_COLORS[startSeat]:'#30283A'):safeSeat>=0?JACKAROO_COLORS[safeSeat]:baseSeat>=0?JACKAROO_COLORS[baseSeat]+'33':r>=5&&r<=8&&col>=5&&col<=8?'#21172C':'#181321';return <View key={key} style={{flex:1,aspectRatio:1,borderWidth:0.35,borderColor:'#75617C',backgroundColor:bg,alignItems:'center',justifyContent:'center'}}>{markers[key]?.length?<Text style={{fontSize:8,color:JACKAROO_COLORS[markers[key][0]]}}>●{markers[key].length>1?markers[key].length:''}</Text>:startSeat>=0?<Text style={{fontSize:7,color:'#FFF0CC'}}>◆</Text>:safeSeat>=0?<Text style={{fontSize:7,color:'#FFF0CC'}}>◇</Text>:r===6&&col===6?<Text style={{fontSize:7,color:'#E8C477'}}>FIRE</Text>:null}</View>;})}</View>);
  const play=(owner,marble,steps,extra={})=>act({type:'jackaroo_play',cardId:chosen.id,ownerId:owner,marble,steps,...extra});
  return <><Text style={{color:ink}}>Clockwise · Partners sit opposite · Deal {state.handRound}/3</Text><View style={{width:'100%',maxWidth:280,alignSelf:'center',borderWidth:1,borderColor:GOLD,borderRadius:8,padding:2}}>{boardRows}</View><Text style={{color:muted}}>{state.players.map(p=>p.name+': '+state.marbles[p.id].map(v=>v<0?'H':v>=52?'S'+(v-51):String(v)).join(',')).join('  |  ')}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} active={jackarooCardId===card.id} onPress={()=>{setJackarooCardId(card.id);setJackarooSource(null);setJackarooFirst(null);setJackarooSecond(null);setJackarooSplit(3);}}>{card.rank}{card.suit}</Tile>)}</View>{chosen&&<><Text style={{color:GOLD}}>Selected {chosen.rank}{chosen.suit}</Text>{(chosen.rank==='A'||chosen.rank==='K')&&rows.filter(m=>m.progress===-1).map(m=><Btn key={'e'+m.owner+m.marble} small title={'ENTER '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,0,{enter:true})}/>)}{chosen.rank==='J'&&<><Text style={{color:ink}}>Choose source marble, then target marble:</Text>{track.filter(m=>m.progress>0).map(m=><Btn key={'s'+m.owner+m.marble} small title={'SOURCE '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooSource({ownerId:m.owner,marble:m.marble})}/>)}{jackarooSource&&state.players.filter(p=>p.id!==jackarooSource.ownerId).flatMap(p=>state.marbles[p.id].map((v,i)=>({owner:p.id,marble:i,progress:v}))).filter(m=>m.progress>0&&m.progress<52).map(m=><Btn key={'t'+m.owner+m.marble} small title={'SWAP '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,source:jackarooSource,target:{ownerId:m.owner,marble:m.marble}})}/>)}</>}{chosen.rank==='7'&&<><Text style={{color:ink}}>Move 7 on one marble:</Text>{movable.map(m=><Btn key={'7'+m.owner+m.marble} small title={m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,7)}/>)}<Text style={{color:ink}}>Split 7 across two marbles:</Text>{movable.map(m=><Btn key={'a'+m.owner+m.marble} small title={'FIRST '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooFirst({ownerId:m.owner,marble:m.marble})}/>)}{jackarooFirst&&track.filter(m=>m.owner!==jackarooFirst.ownerId||m.marble!==jackarooFirst.marble).map(m=><Btn key={'b'+m.owner+m.marble} small title={'SECOND '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooSecond({ownerId:m.owner,marble:m.marble})}/>)}{jackarooFirst&&jackarooSecond&&<><View style={{flexDirection:'row',flexWrap:'wrap'}}>{[1,2,3,4,5,6].map(n=><Btn key={'split'+n} small title={n+' + '+(7-n)} onPress={()=>setJackarooSplit(n)}/>)}</View><Btn title={'PLAY SPLIT '+jackarooSplit+' + '+(7-jackarooSplit)} onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,moves:[{...jackarooFirst,steps:jackarooSplit},{...jackarooSecond,steps:7-jackarooSplit}]})}/></>}}</>}{chosen.rank==='Q'&&isRed(chosen.suit)&&<Btn title="DISCARD NEXT PLAYER'S CARD" onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,effect:'burn'})}/>}{chosen.rank==='10'&&<Btn title="FORCE NEXT PLAYER TO DISCARD" onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,effect:'burn'})}/>}{chosen.rank==='5'&&state.players.flatMap(p=>state.marbles[p.id].map((v,i)=>({owner:p.id,marble:i,progress:v}))).filter(m=>m.progress>0&&m.progress<52).map(m=><Btn key={'5'+m.owner+m.marble} small title={'MOVE 5 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,5,{targetOwnerId:m.owner})}/>)}{chosen.rank!=='J'&&chosen.rank!=='7'&&chosen.rank!=='5'&&!(chosen.rank==='Q'&&isRed(chosen.suit))&&!(chosen.rank==='10'&&true)&&movable.map(m=>{const steps=chosen.rank==='A'?1:chosen.rank==='K'?13:chosen.rank==='Q'?12:chosen.rank==='4'?-4:Number(chosen.rank);return <Btn key={'m'+m.owner+m.marble} small title={'MOVE '+steps+' '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,steps)}/>;})}{chosen.rank==='A'&&movable.map(m=><Btn key={'11'+m.owner+m.marble} small title={'MOVE 11 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,11)}/>)}{chosen.rank==='K'&&movable.map(m=><Btn key={'13'+m.owner+m.marble} small title={'MOVE 13 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,13)}/>)}{chosen.rank==='10'&&track.map(m=><Btn key={'10'+m.owner+m.marble} small title={'MOVE 10 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,10,{effect:'move'})}/> )}</>}{!jackarooHasLegalMove(state,userId)&&currentHand.length>0&&<Btn title="BURN ONE CARD (NO LEGAL MOVE)" onPress={()=>act({type:'jackaroo_burn',cardId:currentHand[0].id})}/>}</>};
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
   {state?.name==='UNO'&&state?.winner&&!state?.matchWinner&&hostRef.current&&<Btn title="NEXT ROUND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'uno_next_round'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}{state?.name==='29'&&state?.winner&&state?.matchWinner===null&&hostRef.current&&<Btn title="NEXT HAND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'29_next_hand'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}<>{state?.name==='Playcards – Breez'&&state?.winner&&hostRef.current&&<Btn title="NEXT DEAL" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'bridge_next_deal'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}<Btn title="BACK TO GAMES" onPress={reset}/></>
  </View>}
 </View></View></Modal>{minimized&&canMinimize&&<TouchableOpacity onPress={reopenGame} style={{position:'absolute',right:16,bottom:112,zIndex:999,elevation:20,backgroundColor:'#24152F',borderColor:GOLD,borderWidth:1.5,borderRadius:24,paddingHorizontal:16,paddingVertical:11}}><Text style={{color:GOLD,fontWeight:'900'}}>🎮 OPEN GAME</Text></TouchableOpacity>}</>;
}
