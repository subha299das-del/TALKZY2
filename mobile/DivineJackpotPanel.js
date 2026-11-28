import React, { useRef } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Divine Jackpot sends spin requests through the authenticated TALKZY API bridge.
// The server owns reel results, wallet debits, payouts, and persistent history.
const GAME_HTML = String.raw`<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<style>
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top,#68438b,#24113c 48%,#090611);color:#fff;font-family:Georgia,serif}
main{max-width:520px;margin:auto;padding:10px}.head{display:flex;justify-content:space-between;align-items:center}.logo{font-size:clamp(22px,6vw,32px);font-weight:bold;letter-spacing:1.5px;color:#ffe8a3;text-shadow:0 2px #713b12,0 0 15px #f6c65b}.sub{font:9px Arial;letter-spacing:2px;color:#d6b9ff}.wallet{border:1px solid #d8ad54;border-radius:22px;padding:8px 10px;background:#241333;color:#ffe39b;font:bold 12px Arial}
.hero{text-align:center;margin:13px 0 9px;color:#ffe7a4}.hero h2{font-size:18px;margin:0}.hero p{font:9px Arial;letter-spacing:1.5px;color:#c7a9ed}
.frame{padding:7px;border-radius:15px;background:linear-gradient(145deg,#ffe7a1,#9e641b 20%,#f4ce70 45%,#75420e 75%,#fbe4a4);box-shadow:0 8px 22px #000b}.board{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:6px;border-radius:10px;background:#10091e}.cell{aspect-ratio:1;display:grid;place-items:center;border-radius:7px;background:radial-gradient(circle at 40% 22%,#594078,#1b102b 70%);border:1px solid #c99c4b88;box-shadow:inset 0 2px 5px #fff2,inset 0 -4px 8px #0008}.relic-image{display:block;width:100%;height:100%;mix-blend-mode:multiply;background-image:url('https://i.postimg.cc/3J2z8Nj7/file-00000000119082108a99a4d18cf201a3.png');background-repeat:no-repeat;background-size:400% 200%;filter:drop-shadow(0 3px 2px #000b)}.cell .relic-0{background-position:0 0}.cell .relic-1{background-position:33.333% 0}.cell .relic-2{background-position:66.666% 0}.cell .relic-3{background-position:100% 0}.cell .relic-4{background-position:0 100%}.cell .relic-5{background-position:33.333% 100%}.cell .relic-6{background-position:66.666% 100%}.cell .relic-7{background-position:100% 100%}.pay .relic-0{background-position:0 0}.pay .relic-1{background-position:33.333% 0}.pay .relic-2{background-position:66.666% 0}.pay .relic-3{background-position:100% 0}.pay .relic-4{background-position:0 100%}.pay .relic-5{background-position:33.333% 100%}.pay .relic-6{background-position:66.666% 100%}.pay .relic-7{background-position:100% 100%}.win{background:radial-gradient(circle,#fff0a8,#a96d21 45%,#44205b)!important;box-shadow:0 0 14px #ffe17b!important;outline:2px solid #fff0a8}
/* Winning relics light up together as a clear horizontal line after the reels stop. */
@keyframes divineLineWin{
  0%,100%{transform:scale(1);filter:brightness(1);box-shadow:0 0 8px #ffe17b, inset 0 0 8px #fff7}
  45%{transform:scale(1.045);filter:brightness(1.35);box-shadow:0 0 24px 7px #ffd75c, inset 0 0 14px #fff}
}
@keyframes divineLineSweep{
  0%{opacity:0;transform:translateX(-120%)}
  25%{opacity:.9}
  75%{opacity:.9}
  100%{opacity:0;transform:translateX(120%)}
}
.cell.win{
  position:relative;
  z-index:2;
  outline:2px solid #fff1a8!important;
  border:2px solid #ffe27b!important;
  background:linear-gradient(145deg,#fff4bd,#f4c75d 48%,#9d5c18)!important;
  animation:divineLineWin .85s ease-in-out 3;
}
.cell.win::after{
  content:"";
  position:absolute;
  inset:3px;
  border-radius:6px;
  pointer-events:none;
  background:linear-gradient(100deg,transparent 25%,#fffde8dd 50%,transparent 75%);
  animation:divineLineSweep 1.1s ease-in-out 2;
}
.cell.win .relic-image{
  filter:brightness(1.28) contrast(1.16) saturate(1.2) drop-shadow(0 0 5px #fff1a8)!important;
}
@media(prefers-reduced-motion:reduce){.cell.win,.cell.win::after{animation:none}}
.panel{margin-top:10px;padding:11px;border-radius:14px;border:1px solid #d5aa5a;background:linear-gradient(145deg,#301747,#100a1b)}.row{display:flex;justify-content:space-between;align-items:center}.label{font:10px Arial;letter-spacing:1.4px;color:#cdb5e7}.amount{font:bold 20px Arial;color:#ffe6a1}.bets{display:flex;gap:5px;margin-top:8px}.bets button{flex:1;padding:8px 1px;border:1px solid #c49343;border-radius:7px;background:linear-gradient(#55326f,#21112f);color:#ffe5a1;font-weight:bold}.bets .active{background:linear-gradient(#f9d77c,#a66b1d);color:#281437}.actions{display:flex;gap:8px;margin-top:10px}.spin{flex:1;border:0;border-radius:11px;padding:13px;background:linear-gradient(#fff0a9,#e1a63e 45%,#9d5514);color:#32183a;font:bold 18px Georgia;letter-spacing:2px}.auto{width:95px;border:1px solid #d4a34d;border-radius:11px;background:#321c48;color:#ffe5a1;font-weight:bold}.auto.on{background:linear-gradient(#f4d77f,#b77a25);color:#271336}.status{text-align:center;min-height:17px;margin-top:10px;color:#ffe7a4;font:11px Arial}.paytitle{text-align:center;color:#e9c779;font:bold 10px Arial;letter-spacing:1.5px;margin-bottom:7px}.pays{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.pay{font:8px Arial;color:#dfd0f1;text-align:center;background:#ffffff0b;border-radius:7px;padding:4px 1px}.pay .cell .relic-image{width:94%;height:94%;margin:auto;background-size:400% 200%;background-repeat:no-repeat;filter:drop-shadow(0 2px 2px #000d)}.pay .relic-image{width:42px;height:42px;flex:0 0 42px;margin:auto 7px auto 0;background-size:400% 200%;background-repeat:no-repeat}.pay b{display:block;color:#ffe5a1;margin-top:2px}.options-btn{border:1px solid #d8ad54;border-radius:18px;padding:7px 11px;background:#241333;color:#ffe39b;font:bold 11px Arial}.shortcut-menu,.info-popup{position:fixed;inset:0;background:#08040ddd;display:none;align-items:center;justify-content:center;padding:16px;z-index:20}.shortcut-menu.open,.info-popup.open{display:flex}.shortcut-card,.info-card{width:100%;max-width:440px;max-height:82vh;overflow:auto;padding:15px;border:1px solid #d8ad54;border-radius:16px;background:linear-gradient(145deg,#42245d,#130b20);box-shadow:0 12px 40px #000d}.shortcut-title{font:bold 15px Georgia;color:#ffe7a4;text-align:center;letter-spacing:1px;margin-bottom:13px}.shortcut-actions{display:flex;gap:9px}.shortcut-actions button,.popup-close{flex:1;padding:11px;border:1px solid #c49343;border-radius:9px;background:linear-gradient(#55326f,#21112f);color:#ffe5a1;font:bold 12px Arial}.popup-close{margin-top:10px;width:100%;background:#21112f}.info-card{background:linear-gradient(145deg,#301747,#100a1b);color:#eadcf8;font:12px/1.5 Arial}.info-card .pays{grid-template-columns:repeat(4,1fr)}.tab{flex:1;padding:9px;border:1px solid #c49343;border-radius:8px;background:#21112f;color:#e9d5ff;font:bold 11px Arial;letter-spacing:1px}.tab.active{background:linear-gradient(#f9d77c,#a66b1d);color:#281437}.rulecopy{font:11px/1.5 Arial;color:#eadcf8;margin-bottom:12px}.rulecopy p{margin:5px 0}.rulecopy b{color:#ffe5a1}.rule-note{color:#c5a8df;font-size:9px}.history-list{display:flex;flex-direction:column;gap:7px}.history-item{padding:9px;border:1px solid #ffffff22;border-radius:8px;background:#ffffff0b;font:10px Arial;color:#eadcf8}.history-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px}.history-round{color:#ffe5a1;font-weight:bold}.history-win{color:#8ff0b2;font-weight:bold}.history-loss{color:#d9c5e9}.history-detail{color:#cdb5e7;line-height:1.4}.empty{text-align:center;padding:16px 5px;color:#bca8d2;font:11px Arial}
.win-popup{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:22px;background:#080411c9;backdrop-filter:blur(5px)}
.win-popup.show{display:flex}
.win-card{width:min(100%,360px);padding:25px 18px 22px;text-align:center;border:2px solid #ffe29a;border-radius:20px;background:radial-gradient(ellipse at top,#79529a 0%,#3a2056 48%,#180d27 100%);box-shadow:0 0 0 5px #e9b94a33,0 0 35px #ffd76c99,0 18px 45px #000d;animation:winPopupIn .35s cubic-bezier(.2,.8,.2,1)}
@keyframes winPopupIn{from{opacity:0;transform:scale(.78) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
.win-crown{font-size:34px;color:#ffe7a1;text-shadow:0 0 18px #ffcf54;margin-bottom:5px}
.win-heading{font:bold 23px Georgia,serif;letter-spacing:1.5px;color:#ffe7a1;text-shadow:0 2px #8a4b12,0 0 16px #ffd35b}
.win-caption{font:11px Arial;letter-spacing:2px;color:#e3c8ff;margin:8px 0 15px}
.win-amount{font:bold clamp(30px,9vw,42px) Arial,sans-serif;color:#fff4c7;text-shadow:0 2px #a86616,0 0 20px #ffdc70;overflow-wrap:anywhere}
.win-coins{font:bold 11px Arial;letter-spacing:2px;color:#e9cb83;margin-top:5px}
.win-countdown{font:10px Arial;color:#cdb5e7;margin-top:17px}

/* Larger, clearer relic tiles: preserve the sprite's 3:4 artwork proportions. */
.board{gap:5px;padding:7px}
.cell{height:clamp(58px,17vw,82px);aspect-ratio:auto;overflow:hidden;padding:2px;border-radius:9px;background:radial-gradient(circle at 50% 20%,#67488a 0%,#29163f 72%);border:1px solid #e2bd68;box-shadow:inset 0 2px 7px #fff3,inset 0 -4px 8px #0009,0 2px 5px #0007}
.cell .relic-image{width:100%;height:100%;background-size:400% 200%;background-repeat:no-repeat;filter:drop-shadow(0 2px 2px #000d)}
.pay .relic-image{width:54px;height:68px;flex:0 0 54px;margin:0 auto 3px;background-size:400% 200%;background-repeat:no-repeat;filter:drop-shadow(0 2px 3px #000d)}
.pay{min-height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px;padding:5px 2px}
.pay b{line-height:1.25}
@media(max-width:360px){.board{gap:3px;padding:5px}.cell{height:58px}.pay .relic-image{width:46px;height:60px;flex-basis:46px}}

/* Premium relic tile palette: soft champagne-lilac to complement the purple/gold temple. */
.cell{
  background:linear-gradient(145deg,#fff0d0 0%,#eadcf0 48%,#d8c4e6 100%)!important;
  border:1px solid #f3d58b!important;
  box-shadow:inset 0 1px 5px #ffffffcc,inset 0 -3px 7px #75518a33,0 2px 5px #0006!important;
}
.cell .relic-image{
  background-color:transparent!important;
  mix-blend-mode:normal!important;
  filter:brightness(1.08) contrast(1.13) saturate(1.16) drop-shadow(0 2px 2px #49304b66)!important;
}
.pay .relic-image{
  background-color:#eadcf0!important;
  border:1px solid #e7c979;
  border-radius:9px;
  padding:2px;
  mix-blend-mode:normal!important;
  filter:brightness(1.08) contrast(1.13) saturate(1.16) drop-shadow(0 2px 2px #49304b66)!important;
}
/* Android phone layout: keep the full game usable on short and narrow screens. */
html{min-height:100%;background:#090611}
body{min-height:100%;height:auto;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
main{width:100%;max-width:520px;min-height:100vh;margin:0 auto;padding:7px 8px calc(18px + env(safe-area-inset-bottom))}
.head{gap:6px}
.logo{font-size:clamp(19px,5.8vw,29px);letter-spacing:1px}
.wallet{white-space:nowrap;padding:7px 8px;font-size:11px}
.options-btn{white-space:nowrap;padding:6px 9px;font-size:10px}
.hero{margin:8px 0 7px}
.hero h2{font-size:clamp(15px,4.4vw,18px)}
.frame{padding:5px;border-radius:12px}
.board{gap:3px;padding:5px}
.cell{height:clamp(42px,14.5vw,66px);min-width:0;padding:1px;border-radius:7px}
.panel{margin-top:7px;padding:9px}
.bets{gap:4px;margin-top:7px}
.bets button{min-width:0;padding:8px 0;font-size:12px}
.actions{gap:7px;margin-top:8px}
.spin{padding:11px 6px;font-size:17px}
.auto{width:84px}
.status{margin-top:7px}
.foot{padding:8px 0;text-align:center;font:8px Arial;color:#a98fc1}
@media(max-height:760px){
  main{padding-top:5px}
  .hero{margin:5px 0}
  .cell{height:clamp(38px,12.5vw,52px)}
  .panel{margin-top:6px;padding:8px}
  .bets button{padding:7px 0}
  .actions{margin-top:7px}
}
@media(max-height:650px){
  .cell{height:clamp(34px,10.5vw,44px)}
  .logo{font-size:19px}
  .hero p{margin:3px 0}
}
@media(max-width:350px){
  main{padding-left:5px;padding-right:5px}
  .head{gap:4px}
  .logo{font-size:18px}
  .wallet{padding:6px;font-size:10px}
  .options-btn{padding:6px;font-size:9px}
  .bets button{font-size:10px}
}
</style></head><body><main><div class="head"><div><div class="logo">DIVINE JACKPOT</div><div class="sub">THE TEMPLE OF IMMORTALS</div></div><div style="display:flex;align-items:center;gap:7px"><button class="options-btn" id="optionsBtn">OPTIONS ☰</button><div class="wallet">◈ <span id="balance">—</span></div></div></div>
<section class="hero"><h2>✦ TEMPLE OF THE GODS ✦</h2><p>SPIN THE RELICS • CLAIM THE DIVINE TREASURE</p></section><div class="frame"><div class="board" id="board"><div class="cell"><span class="relic-image relic-0" role="img" aria-label="Emperor Crown"></span></div><div class="cell"><span class="relic-image relic-1" role="img" aria-label="Eternal Phoenix"></span></div><div class="cell"><span class="relic-image relic-2" role="img" aria-label="Dragon Emperor"></span></div><div class="cell"><span class="relic-image relic-3" role="img" aria-label="Time Relic"></span></div><div class="cell"><span class="relic-image relic-4" role="img" aria-label="Divine Treasure"></span></div><div class="cell"><span class="relic-image relic-5" role="img" aria-label="God’s Eye"></span></div><div class="cell"><span class="relic-image relic-6" role="img" aria-label="Celestial Lion"></span></div><div class="cell"><span class="relic-image relic-7" role="img" aria-label="Infinity Portal"></span></div><div class="cell"><span class="relic-image relic-0" role="img" aria-label="Emperor Crown"></span></div><div class="cell"><span class="relic-image relic-1" role="img" aria-label="Eternal Phoenix"></span></div><div class="cell"><span class="relic-image relic-2" role="img" aria-label="Dragon Emperor"></span></div><div class="cell"><span class="relic-image relic-3" role="img" aria-label="Time Relic"></span></div><div class="cell"><span class="relic-image relic-4" role="img" aria-label="Divine Treasure"></span></div><div class="cell"><span class="relic-image relic-5" role="img" aria-label="God’s Eye"></span></div><div class="cell"><span class="relic-image relic-6" role="img" aria-label="Celestial Lion"></span></div><div class="cell"><span class="relic-image relic-7" role="img" aria-label="Infinity Portal"></span></div><div class="cell"><span class="relic-image relic-0" role="img" aria-label="Emperor Crown"></span></div><div class="cell"><span class="relic-image relic-1" role="img" aria-label="Eternal Phoenix"></span></div><div class="cell"><span class="relic-image relic-2" role="img" aria-label="Dragon Emperor"></span></div><div class="cell"><span class="relic-image relic-3" role="img" aria-label="Time Relic"></span></div><div class="cell"><span class="relic-image relic-4" role="img" aria-label="Divine Treasure"></span></div><div class="cell"><span class="relic-image relic-5" role="img" aria-label="God’s Eye"></span></div><div class="cell"><span class="relic-image relic-6" role="img" aria-label="Celestial Lion"></span></div><div class="cell"><span class="relic-image relic-7" role="img" aria-label="Infinity Portal"></span></div><div class="cell"><span class="relic-image relic-0" role="img" aria-label="Emperor Crown"></span></div><div class="cell"><span class="relic-image relic-1" role="img" aria-label="Eternal Phoenix"></span></div><div class="cell"><span class="relic-image relic-2" role="img" aria-label="Dragon Emperor"></span></div><div class="cell"><span class="relic-image relic-3" role="img" aria-label="Time Relic"></span></div><div class="cell"><span class="relic-image relic-4" role="img" aria-label="Divine Treasure"></span></div><div class="cell"><span class="relic-image relic-5" role="img" aria-label="God’s Eye"></span></div></div></div>
<section class="panel"><div class="row"><span class="label">TOTAL WINNING COINS</span><span class="amount">◈ <span id="totalWinning">0</span></span></div><div class="bets"><button data-bet="50">50</button><button data-bet="100" class="active">100</button><button data-bet="250">250</button><button data-bet="500">500</button><button data-bet="1000">1K</button></div><div class="actions"><button class="spin" id="spin">✦ SPIN ✦</button><button class="auto" id="auto">AUTO: OFF</button></div><div class="status" id="status">Connecting to your TALKZY wallet…</div></section>
<div hidden id="infoTemplates"><div id="rulesView"><div class="rulecopy"><b>HOW TO PLAY</b><p>Choose a bet and tap SPIN. The server generates and records each 6 × 5 result.</p><p><b>Winning rule:</b> Three or more matching relics side by side in a horizontal row create a win. Longer matches increase the payout.</p><p><b>Payout:</b> Bet × the relic multiplier × (number of matching relics − 2). Separate winning rows are added together.</p><p><b>Bet options:</b> 50, 100, 250, 500 and 1,000 TALKZY coins. AUTO repeats while your main wallet can cover the bet.</p><p class="rule-note">Every accepted spin is charged to your main TALKZY wallet. Winning payouts are credited to the same wallet and saved in your coin ledger.</p></div><div class="paytitle">THE EIGHT DIVINE RELICS & PAYOUTS</div><div class="pays" id="pays"></div></div><div id="historyView" hidden><div class="paytitle">RECENT SPIN HISTORY</div><div class="history-list" id="historyList"><div class="empty">No spins yet.</div></div></div><div id="topWinnersView" hidden><div class="paytitle">TODAY’S TOP WINNERS · IST</div><div class="history-list" id="topWinnersList"><div class="empty">Loading winners…</div></div></div></div><div class="shortcut-menu" id="shortcutMenu"><div class="shortcut-card"><div class="shortcut-title">DIVINE JACKPOT OPTIONS</div><div class="shortcut-actions"><button id="openRules">RULES</button><button id="openHistory">HISTORY</button><button id="openTopWinners">TOP WINNERS</button></div><button class="popup-close" id="closeMenu">CLOSE</button></div></div><div class="win-popup" id="winPopup" role="dialog" aria-modal="true" aria-label="Winning amount"><div class="win-card"><div class="win-crown">♛</div><div class="win-heading">DIVINE WIN!</div><div class="win-caption">THE GODS HAVE REWARDED YOU</div><div class="win-amount" id="winAmount">+0</div><div class="win-coins">COINS WON</div><div class="win-countdown">This message closes automatically in 5 seconds</div></div></div><div class="info-popup" id="infoPopup"><div class="info-card"><div class="shortcut-title" id="popupTitle">RULES</div><div id="popupContent"></div><button class="popup-close" id="closeInfo">CLOSE</button></div></div><div class="foot">TALKZY GREEDY • SHARED MAIN WALLET</div></main>
<script>
const names=['Emperor Crown','Eternal Phoenix','Dragon Emperor','Time Relic','Divine Treasure',"God’s Eye",'Celestial Lion','Infinity Portal'];
const mult=[12,10,9,8,7,6,5,4],board=document.getElementById('board'),paybox=document.getElementById('pays'),historyList=document.getElementById('historyList'),topWinnersList=document.getElementById('topWinnersList');
let balance=0,bet=100,totalWinning=0,busy=false,auto=false,timer,spinNumber=0,winPopupTimer=null;
const $=id=>document.getElementById(id),pending=new Map();let requestSequence=0;
function talkzyApi(path,method='GET',body){return new Promise((resolve,reject)=>{
 if(!window.ReactNativeWebView||!window.ReactNativeWebView.postMessage){reject(new Error('TALKZY connection is unavailable.'));return}
 const requestId='dj-'+Date.now()+'-'+(++requestSequence);
 const timeout=setTimeout(()=>{pending.delete(requestId);reject(new Error('The request timed out. Check your wallet before trying again.'))},25000);
 pending.set(requestId,{resolve,reject,timeout});
 window.ReactNativeWebView.postMessage(JSON.stringify({type:'TALKZY_API',requestId,path,method,body}));
});}
window.__talkzyReceive=function(message){const item=pending.get(message&&message.requestId);if(!item)return;clearTimeout(item.timeout);pending.delete(message.requestId);if(message.ok)item.resolve(message.data||{});else item.reject(new Error(message.error||'TALKZY request failed.'));};
function svg(i){return '<span class="relic-image relic-'+i+'" role="img" aria-label="'+names[i]+'"></span>';}
function draw(){[...board.children].forEach(e=>{e.innerHTML=svg(Math.floor(Math.random()*8))});}
names.forEach((n,i)=>{let e=document.createElement('div');e.className='pay';e.innerHTML=svg(i)+'<b>'+n+' ×'+mult[i]+'</b>';paybox.append(e)});
function bal(){$('balance').textContent=Number(balance).toLocaleString('en-IN');}
function showWinPopup(amount){clearTimeout(winPopupTimer);$('winAmount').textContent='+'+Number(amount).toLocaleString('en-IN');$('winPopup').classList.add('show');winPopupTimer=setTimeout(()=>{$('winPopup').classList.remove('show');winPopupTimer=null},5000);}
function stop(){auto=false;clearTimeout(timer);$('auto').textContent='AUTO: OFF';$('auto').classList.remove('on');}
function showStatus(message){$('status').textContent=message;}
async function syncState(){const state=await talkzyApi('/api/games/divine-jackpot/state');balance=Number(state.balance||0);totalWinning=Number(state.today_wins||0);$('totalWinning').textContent=totalWinning.toLocaleString('en-IN');bal();showStatus('Connected to your TALKZY main wallet.');}
function makeHistoryItem(item){
 const el=document.createElement('div');el.className='history-item';const top=document.createElement('div');top.className='history-top';
 const round=document.createElement('span');round.className='history-round';round.textContent='SPIN #'+item.spin_number;
 const result=document.createElement('span');result.className=Number(item.payout)>0?'history-win':'history-loss';result.textContent=Number(item.payout)>0?'WIN +'+Number(item.payout).toLocaleString('en-IN'):'NO WIN';top.append(round,result);
 const detail=document.createElement('div');detail.className='history-detail';const lines=Array.isArray(item.winning_lines)?item.winning_lines:[];
 detail.textContent='Bet: '+Number(item.bet_amount).toLocaleString('en-IN')+' coins'+(lines.length?' · Winning relics: '+lines.map(x=>names[Number(x.symbol)]+' ×'+x.count).join(', '):'');
 const stamp=document.createElement('div');stamp.className='history-detail';stamp.textContent=item.created_at?new Date(item.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):'';el.append(top,detail,stamp);return el;
}
async function loadHistory(){const data=await talkzyApi('/api/games/divine-jackpot/history?limit=30&offset=0');historyList.innerHTML='';const rows=Array.isArray(data.history)?data.history:[];if(!rows.length){historyList.innerHTML='<div class="empty">No spins yet.</div>';return}rows.forEach(item=>historyList.append(makeHistoryItem(item)));}
async function loadTopWinners(){const data=await talkzyApi('/api/games/divine-jackpot/top-winners');topWinnersList.innerHTML='';const rows=Array.isArray(data.winners)?data.winners:[];if(!rows.length){topWinnersList.innerHTML='<div class="empty">No winners yet today.</div>';return}
 rows.forEach(w=>{const el=document.createElement('div');el.className='history-item';const top=document.createElement('div');top.className='history-top';const name=document.createElement('span');name.className='history-round';name.textContent='#'+w.rank+' '+(w.display_name||'Player');const coins=document.createElement('span');coins.className='history-win';coins.textContent=Number(w.coins||0).toLocaleString('en-IN')+' coins';top.append(name,coins);const id=document.createElement('div');id.className='history-detail';id.textContent='TALKZY ID: '+(w.talkzy_id||'—');el.append(top,id);topWinnersList.append(el);});
}
const menu=$('shortcutMenu'),popup=$('infoPopup'),popupContent=$('popupContent');$('optionsBtn').onclick=()=>menu.classList.add('open');$('closeMenu').onclick=()=>menu.classList.remove('open');
async function showInfo(which){menu.classList.remove('open');$('popupTitle').textContent=which==='rules'?'GAME RULES':which==='history'?'SPIN HISTORY':'TODAY’S TOP WINNERS';popupContent.innerHTML='';try{if(which==='history')await loadHistory();if(which==='top')await loadTopWinners();const source=$(which==='rules'?'rulesView':which==='history'?'historyView':'topWinnersView');const copy=source.cloneNode(true);copy.hidden=false;popupContent.append(copy);popup.classList.add('open');}catch(error){showStatus(error.message);popupContent.textContent=error.message;popup.classList.add('open');}}
$('openRules').onclick=()=>showInfo('rules');$('openHistory').onclick=()=>showInfo('history');$('openTopWinners').onclick=()=>showInfo('top');$('closeInfo').onclick=()=>popup.classList.remove('open');
menu.addEventListener('click',e=>{if(e.target===menu)menu.classList.remove('open')});popup.addEventListener('click',e=>{if(e.target===popup)popup.classList.remove('open')});
function revealOutcome(result,cells){if(!Array.isArray(result.reels)||result.reels.length!==30)throw new Error('The server returned an invalid spin result.');cells.forEach((cell,index)=>{cell.innerHTML=svg(Number(result.reels[index]));cell.classList.remove('win')});
 (Array.isArray(result.winning_lines)?result.winning_lines:[]).forEach(line=>{for(let col=Number(line.start_col);col<=Number(line.end_col);col++){const index=Number(line.row)*6+col;if(cells[index])cells[index].classList.add('win');}});
 balance=Number(result.balance||0);totalWinning=Number(result.today_wins||0);spinNumber=Number(result.spin_number||spinNumber);$('totalWinning').textContent=totalWinning.toLocaleString('en-IN');bal();
 const payout=Number(result.payout||0);if(payout>0){showStatus('DIVINE WIN! +'+payout.toLocaleString('en-IN')+' coins');showWinPopup(payout);}else showStatus('No winning line this spin. Your wallet is updated.');
}
function spin(){if(busy)return;busy=true;$('spin').disabled=true;showStatus('Submitting your spin to TALKZY…');
 const requestKey='divine-jackpot-'+Date.now()+'-'+Math.random().toString(36).slice(2,12);const request=talkzyApi('/api/games/divine-jackpot/spin','POST',{amount:bet,requestKey});
 const cells=[...board.children];cells.forEach(e=>e.classList.remove('win'));let ticks=0;
 const animation=setInterval(async()=>{cells.forEach(e=>e.innerHTML=svg(Math.floor(Math.random()*8)));if(++ticks<12)return;clearInterval(animation);
  try{const result=await request;if(!result.accepted)throw new Error('The server did not accept this spin.');revealOutcome(result,cells);busy=false;$('spin').disabled=false;if(auto&&balance>=bet)timer=setTimeout(spin,Number(result.payout)>0?5900:900);else if(auto)stop();}
  catch(error){busy=false;$('spin').disabled=false;showStatus(error.message);stop();try{await syncState()}catch{}}
 },90);
}
$('spin').onclick=spin;
document.querySelectorAll('[data-bet]').forEach(button=>button.onclick=()=>{if(busy)return;bet=Number(button.dataset.bet);document.querySelectorAll('[data-bet]').forEach(item=>item.classList.toggle('active',item===button));});
$('auto').onclick=()=>{auto=!auto;$('auto').textContent=auto?'AUTO: ON':'AUTO: OFF';$('auto').classList.toggle('on',auto);if(auto&&!busy){if(balance>=bet)spin();else{showStatus('Not enough coins for this bet.');stop();}}else if(!auto)clearTimeout(timer);};
draw();bal();syncState().catch(error=>showStatus(error.message));
</script></body></html>`;

export default function DivineJackpotPanel({ visible, onClose, api }) {
  const webRef = useRef(null);
  const handleWebMessage = async event => {
    let message;
    try { message = JSON.parse(event?.nativeEvent?.data || '{}'); } catch { return; }
    if (message?.type !== 'TALKZY_API' || typeof message.requestId !== 'string') return;
    const allowedPaths = new Set(['/api/games/divine-jackpot/state','/api/games/divine-jackpot/history?limit=30&offset=0','/api/games/divine-jackpot/top-winners','/api/games/divine-jackpot/spin']);
    const path = String(message.path || '');
    try {
      if (!allowedPaths.has(path)) throw new Error('This Divine Jackpot request is not allowed.');
      if (typeof api !== 'function') throw new Error('TALKZY wallet connection is unavailable.');
      const method = message.method === 'POST' ? 'POST' : 'GET';
      const result = await api(path, { method, ...(method === 'POST' ? { body: JSON.stringify(message.body || {}) } : {}) });
      webRef.current?.injectJavaScript('window.__talkzyReceive(' + JSON.stringify({ requestId: message.requestId, ok: true, data: result }) + ');true;');
    } catch (error) {
      webRef.current?.injectJavaScript('window.__talkzyReceive(' + JSON.stringify({ requestId: message.requestId, ok: false, error: error?.message || 'TALKZY request failed.' }) + ');true;');
    }
  };
  return (
    <Modal visible={!!visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>DIVINE JACKPOT</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close Divine Jackpot" style={styles.close}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <WebView
          ref={webRef}
          onMessage={handleWebMessage}
          originWhitelist={['*']}
          source={{ html: GAME_HTML, baseUrl: 'https://talkzy.local/' }}
          javaScriptEnabled
          domStorageEnabled={false}
          setSupportMultipleWindows={false}
          style={styles.web}
          androidLayerType="hardware"
        />
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#090611' },
  header: { height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#140c20', borderBottomWidth: 1, borderBottomColor: '#9e783f' },
  title: { color: '#ffe3a0', fontSize: 15, fontWeight: '900', letterSpacing: 1.2 },
  close: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#a78047', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#ffe3a0', fontSize: 24, lineHeight: 27 },
  web: { flex: 1, backgroundColor: '#090611' }
});
