import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

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
const BET_OPTIONS=[0,10000,50000,100000,1000000];
const formatGoodCoins=value=>Number(value||0).toLocaleString('en-IN');
const GAMES=[
 {name:'Ludo',art:'ludo',min:2,max:4,bet:true,timed:true,rules:'Ludo King official rules: 2–4 players, six to enter, extra turns for six/capture/home, third consecutive six forfeited, rank by finish order.'},
 {name:'Carrom',art:'carrom',min:2,max:4,bet:true,timed:true,rules:'International Carrom Federation laws: singles/doubles, due pieces, queen cover, 15-second stroke limit; each game to 25 or eight boards; best-of-three match; third-game side change after four boards or 13 points.'},
 {name:'Playcards – Breez',art:'breez',min:4,max:4,bet:true,timed:true,rules:'World Bridge Federation duplicate Contract Bridge: auction, declarer/dummy, 13 tricks, follow suit and duplicate scoring.'},
 {name:'UNO',art:'uno',min:2,max:10,bet:true,timed:true,rules:'Classic Mattel UNO: 108-card deck, 7 cards each, match colour/number/symbol, action cards, Wild Draw Four challenge, UNO call and 500-point match.'},
 {name:'Monster Crush',art:'monster',min:2,max:4,bet:true,timed:true,rules:'Single fixed Monster Crush round: 45 covered tiles in a 9-column board, exactly 7 monsters, 60-second timer. Players take turns selecting one tile; each monster found scores 10 points. The round ends when all 7 monsters are found or time expires. Highest score wins. No levels.'},
 {name:'Truth and Dare',art:'truth',min:2,max:Infinity,bet:false,timed:false,rules:'Unavailable: no single official ruleset; no custom prompts or penalties will be invented.'},
 {name:'Snakes and Ladders',art:'snake',min:2,max:4,bet:true,timed:true,rules:'Hasbro Chutes and Ladders Sesame Street Edition 32930: 2–4 players, highest spinner starts, one spin per turn, ladders and chutes, exact 100.'},
 {name:'Jackaroo',art:'jackaroo',min:4,max:4,bet:true,timed:true,rules:'Published Jackaroo World rules: four players in opposite partnerships, clockwise card play, legal marble movement and safety lanes.'},
 {name:'Brainstorm',art:'brain',min:2,max:Infinity,bet:false,timed:false,rules:'Unavailable: no single official Brainstorm ruleset was identified.'},
 {name:'29',art:'twentynine',min:4,max:4,bet:true,timed:true,rules:'The previously supplied Twenty-Nine rules: four players in fixed opposite partnerships; 32 cards; counter-clockwise deal/play; two batches of four; bid 16–28; three consecutive passes close the auction; dealer makes 16 if first three pass; hidden trump; follow suit; reveal trump when void; 29 card points including the final-trick point; match to ±6.'}
];const GAME_RULE_SECTIONS={
'Monster Crush':[{title:'One fixed game',body:'Monster Crush is one single-round game every time. There are no levels or level progression.'},{title:'Board and target',body:'The board has 9 columns and 45 covered tiles containing exactly 7 monsters. Find and reveal the monsters.'},{title:'Turns and scoring',body:'Players take turns selecting one tile. Each monster found earns 10 points. A selected tile stays revealed, so it cannot be selected again.'},{title:'Timer and winner',body:'The round lasts 60 seconds. The game ends when all 7 monsters are found or the timer reaches zero. The player with the highest score wins.'}],
'Ludo':[{title:'Goal and setup',body:'Each player has four tokens. Move all four around the track and into the home column; the first to finish all four wins.'},{title:'Turns and movement',body:'Roll one die per turn. A token leaves its yard on a 6. Move clockwise by the number rolled. A 6 grants another roll. Use a legal token move.'},{title:'Captures and safe squares',body:'Landing on an opponent on a non-safe square sends that token to its yard and grants an extra roll. Safe squares protect tokens. Exact count is required to enter home.'},{title:'Winning',body:'The first player to bring all four tokens home wins; others may continue for finishing order.'}],
'Carrom':[{title:'Goal and setup',body:'Singles or doubles are played with nine white, nine black carrom men and one red queen. Pocket your assigned colour using the striker.'},{title:'Turns and fouls',body:'Strike from the permitted baseline. Striker pocketing, pieces leaving the board and other fouls are resolved under the applicable due-piece laws. Each stroke has a 15-second limit.'},{title:'Queen and cover',body:'Pocket the queen and cover it by legally pocketing one of your own carrom men in the required cover turn. If not covered, the queen is returned. ICF due-piece and queen rules apply.'},{title:'Scoring and match',body:'ICF scoring applies. The TALKZY match format uses games to 25 or eight boards, best of three games, with the prescribed third-game side change.'}],
'Playcards – Breez':[{title:'Players and deal',body:'Four players form two partnerships, partners sitting opposite. Each player receives 13 cards from a standard 52-card deck.'},{title:'Auction',body:'Players bid in turn with a level and denomination (clubs, diamonds, hearts, spades or no-trump). A bid must outrank the previous bid. The final contract sets declarer, trump and target tricks.'},{title:'Play of the hand',body:'The player left of declarer leads. Players must follow suit if able. The highest trump wins, or otherwise the highest card of the suit led. The trick winner leads next. Declarer’s partner is dummy and exposes their hand after the opening lead.'},{title:'Scoring',body:'The declaring side scores for making the contract; defenders score for defeating it. Duplicate bridge scoring rules apply.'}],
'UNO':[{title:'Goal and setup',body:'Classic UNO uses 108 cards. Deal seven cards to each player and turn over a card to begin the discard pile.'},{title:'Taking a turn',body:'Play one card matching the top discard by colour, number or symbol, or a permitted Wild. If unable to play, draw one card; play it immediately if playable, otherwise the turn passes.'},{title:'Action and Wild cards',body:'Skip makes the next player miss a turn; Reverse changes direction; Draw Two makes the next player draw two and miss a turn. Wild chooses the colour. Wild Draw Four chooses the colour and makes the next player draw four and miss a turn; it is only legal when the player has no card matching the current colour and may be challenged.'},{title:'UNO and winning',body:'Call UNO when playing down to one card. If caught before the next player begins their turn, draw two cards. The round ends when a player has no cards; official card-point scoring applies and the match target is 500 points.'}],
'Snakes and Ladders':[{title:'Goal and setup',body:'Two to four players use one counter each on a numbered board from 1 to 100. Highest initial spin starts.'},{title:'Movement',body:'Spin once per turn and move forward by that number. Landing at a ladder’s foot moves the counter to its top; landing on a snake or chute moves it down to its tail.'},{title:'Winning',body:'The first player to reach square 100 wins. An exact count is required; a move beyond 100 is not made.'}],
'Jackaroo':[{title:'Players and objective',body:'Four players form two partnerships with partners opposite. Each player controls four marbles; the partnership aims to move all eight partner marbles home.'},{title:'Cards and turns',body:'Use dealt cards to enter and move marbles around the shared track. Each card has its published movement or special action. Turns proceed clockwise; make a legal move when one is available.'},{title:'Track and safety',body:'Marbles leave base only with an eligible entry card. Captures, protected spaces, safety lanes and exact home entry follow the published rules.'},{title:'Special cards',body:'Swap, backward movement, split movement and discard effects are limited to the actions assigned to each card by the published rules.'}],
'29':[{title:'Players and cards',body:'Four players form two fixed partnerships, partners opposite. Use 32 cards: 7, 8, 9, 10, Jack, Queen, King and Ace in each suit.'},{title:'Ranking and points',body:'Rank high to low: Jack, 9, Ace, 10, King, Queen, 8, 7. Jack=3 points, 9=2, Ace=1, 10=1; the final trick adds one point, totalling 29.'},{title:'Deal and bidding',body:'Deal counter-clockwise in two batches of four. Players bid the minimum card points their partnership will take, from 16 to 28. Three consecutive passes close the auction; if the first three pass, dealer must bid 16.'},{title:'Trump and tricks',body:'The highest bidder chooses hidden trump after the second batch. Player next to dealer leads. Follow suit if able. If void, reveal trump; highest trump wins, otherwise highest card of led suit wins. Trick winner leads next.'},{title:'Scoring and match',body:'Count points in tricks won, including the final-trick point. The bidding partnership succeeds by reaching its bid; otherwise it loses the hand. The supplied match target is +6 or −6.'}]
};
const GAME_SOUND_BASE64_BY_GAME={"29":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAAB/rsW6lW1WV2l7g4B7gJCjqZdzTTxLdKO/u5x2W1dmeIKBfH6LnqebfFdBSWuYt7uifmFZY3WBgn18h5iknoRhSEhkja+5p4ZoW2Jyf4J+fIOToJ+Kak9JXoOntqqMbl5hb32Cf3yBjpyfj3JWS1l7nrGsknViYW17goB8f4qYnpN5XU9Xc5asrJd7ZmJreYGBfX2GlJyVgGVTVm2NpqubgWtjaneAgX59g5CZl4VsWFZohqCpnodwZWl0f4F/fYGMl5eJcl1XZH+apqCLdWhocn2Bf31/iZOXjXhjWWJ5k6OhkHpraXF7gYB9foaQlY99aVxgdI2foZN+bmlveoCBfn6DjZSQgm5gYHCHmqCVg3Jrb3h/gX59gYqSkYVzZGFsgpWel4d2bW52foF/fYCIj5GIeGhian2Qm5iKeW9udX2BgH1/hY2QinxsZGh4jJiYjX1xb3R8gIB+foOLj4x/cGZodYeVmI+AdG9zeoCAfn6CiY6MgnRpaHKDkpeRg3dwcnl/gH9+gIaMjYV4bGlwf46VkoZ5cnJ4foB/fn+FioyHe29qb3yKk5KIfHRyd32AgH5/g4mMiH5ya255h5GSin92c3Z8gIB+foGHi4mBdW1udoOOkYyBeHR2e3+Af36AhYqJg3hwbnSAjJCNg3p1dnp+gH9+gISIiYR7cm9zfomPjYV8dnV5foB/fn+Ch4mFfXRwcnuGjY2Hfnd2eX2AgH5/gYaIhn93cXJ5hIuNiIB5dnh8f4B/foCEh4eBeXNyeIGJjImBend4fH+Af36Ag4aHgnt0cnd/h4uJg3x4eHt+gH9+f4KFhoN9dnN2fYWKioR9eXh6foB/fn+BhIaEfnh0dXuDiYqFf3p4en1/f39/gIOGhYB6dXV6goiJhoB7eXp9f4B/foCDhYWBe3Z1eYCGiYeBfHl6fH+Af35/goSFgn14dnh+hYiHgn16enx+gH9+f4GDhIN+eXZ4fYOHh4N+e3p7fn9/f3+Ag4SDf3p3eHyChoeEf3t6e31/f39/gIKEg4B8eHh7gIWHhYB8ent9f39/f3+Bg4OBfXl4eg==","Ludo":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAAB/oLjDvquRd2NZWGBqdHp7fH2CjJikqqeZgmdPQEBNZ4aitbuzoYp1Z2FiaG90dnZ2eYGNm6erpZV9Y05DRlZviqKwsqmYhXVraGpvc3RzcXJ3gZCeqauikHhgT0hNXnaOoaqpoJGCd3BvcXR0cm9tb3aDk6GpqZ6LdF5QTVVme5CepKGYjIF5dnZ3dnRwbGpud4aVoqmmmYZwXlNTXG2AkJuempKIgHx7e3p4c21paW55iJijp6KUgW5eV1ljcoKPl5iTjYaBf39/fXhya2dob3yLmaOknY99bGBbX2l3hI6Sko6JhYODg4F+eHBpZmlxf42aoaGZinprYmBlb3qFi46NioeFhYaFg352bmhmanSBj5qfnZSGd2xlZWpzfISJiomHhYaHiIeEfXVtZ2dsd4SRmp2Zj4N2bWhpb3Z+g4aGhYWFh4mKiIR8c2tnaG96hpKZmpWLgHVubG5zeX6Cg4ODg4WIi4uJg3tya2hqcn2IkpeWkYh+dXBvcnZ7foCAgIGDhoqMjIiCeXFraW11f4mRlJONhX12c3N1eHt9fn5+gIOHi42Mh4B4cGtrb3eBipCSj4qDfHd1dnh6fHx8fH2AhIiMjYuGfnZwbG1yeoOKj4+Mh4F8eXh4ent7e3t7fICEiYyNioR9dXBtb3V8hIqNjImFgHx6ent7fHt6eXp8gIWKjIyJg3t1cG9yd36EiYuKh4OAfXx8fHx8enl4en2BhoqMi4eBenRxcXR5f4SIiYiFgn9+fn5+fXt5eHh6fYKHioyKhoB5dXJzdnuAhIeHhYOBgH9/f359e3l3eHp+g4eKi4mEfnl1dHV4fIGEhYWEgoGAgICAf316eHd4e3+EiIqKh4N9eXZ1d3p9gYOEg4KBgYGBgYB/fHp4d3h7gISIiYmGgX15d3d4e36BgoKCgYGBgoKCgX58eXd3eXyBhYiIh4SAfHl4eHp8f4CBgYGBgYGCgoKAfnt5d3h6fYGFh4eGg398enl6e31/gICAgICBgoODgoB+e3l4eHt+goWHhoWCf3x6ent8fn9/f3+AgIGCg4OCgH16eXh5fA==","Carrom":"UklGRjQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAEAAB5gniSnp/GqcHT1N7L19DV29nE173Er5qqnoiEcYVpak9ARUVBKTYvNykvKygzKjw6P1NLZl5weYZ/lZmUrbW3usnDw9HWzNLW0M3Lvr6wnq2nkZCFdm1mZV5US0VAPDEzMCsuLjQwOT1ESlJPXmNucHuDiY2Ul6istbu7wMrJw8nGysXDw8G7srCmoJqUiYJ6b2ZjXFhTS0hFPT07OzU7OThBQkZMTlZXYGRqdXx9i5CUn6SnsbO7vb/DxMPDwMC/u7m0sammoJiTjoZ/d3JsaGNZVFJLSURAQUE+P0FAQ0VITE9TWl5kanB3fYOJkJWan6WqrbG1uLm8vLu8u7q5tbKuqqainJiSjIWAenVwamVfWldTT0xLSEZGRUZGR0lMTlFVWV1iZ2pxdnyBhoyRlZqeoqerrq+ys7W2tba2tLKwrqunpJ6bl5KNiIN+enRwa2ZjXltXVFJQTkxLS0tMTE1PUlNXWl5iZmpuc3d8gIWKjpOXmp6hpKeqrK2vsLCwsK+urauopqOgnZmVkY2JhYB8eHRwbGhkYV5bWVdVU1JRUVFRUlJTVldaXF9iZWlscHR4fICEiIyPkpaZnJ+hpKanqaqqq6urqqmopqWjoJ6bmJWSjoqHg4B8eHVybmtoZWJgXlxaWVdXVlZWVldXWVpcXmBiZGdqbXBzd3p9gYSHio2Qk5aZm52foaKjpKWmpqampaSjoqCenJqYlpOQjouIhYJ/fHl2c3Bta2hmZGJgX15dXFtbW1tbW1xdXmBhY2VnaWtucHN2eHt+gYOGiYuOkJOVl5manJ2en6ChoaGhoaCgn56dm5qYlpSSkI6MiYeEgn99enh1c3FvbWtpZ2ZkY2JhYGBfX19fYGBhYmJkZWZoamttb3Fzdnh6fH6Bg4WHiYyNj5GTlJaXmJmam5ycnZ2dnZycm5uamZeWlZOSkI6Ni4mHhYOBf317eXd1c3Fwbm1ramlnZmZlZGRkY2NjZGRkZWZmZ2hqa2xub3FydHZ3eXt9f4CChIaIiYuMjo+RkpOUlZaXl5iYmJmZmZmYmJeXlpWUk5KRkI+NjIuJiIaEg4GAfnx7eXh2dXNycXBubWxra2ppaWhoaGdnZ2doaGhpaWpra2xtbm9xcnN0dnd4ent8fn+BgoOFhoeJiouMjY6PkJGSkpOTlJSVlZWVlZWVlJSTk5KSkZCPj46NjIuJiIeGhYSCgYB/fXx7enl3dnV0c3JxcXBvbm5tbWxsbGtra2tra2trbGxsbW1ub29wcXJyc3R1dnd4eXp7fH1/gIGCg4SFhoeIiYmKi4yMjY6Oj4+QkJCRkZGRkZGRkZGRkZCQj4+Pjo2NjIyLiomIiIeGhYSDgoGBgH9+fXx7enl5eHd2dnV0dHNycg==","Playcards – Breez":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACQe5tSgWN4jaVOQWl0qrt4h3WNqb94cmabgoZqY2qTnop+V4CJn6CATl6Oo4F4S12dkIt5Yn2enJR2bX6UmpqCXoKWnY6AaW6Bo49nb3SSmYJvc4uOioRwYX6UmX9ka4GikoBqZXuVjXlbcoaWhHxkeIugh3hrb5adiW9vepGYj3JsdomTiHBpdo2PhXNnfJKSfnFxfYuRhW9sfouXgGprgY6Sfm5wf5OQfG1ygJGLeG5xg5SHenN1hpOJeGxyhpKId251hpOJdmt2iY+Icmx3iY+FdHB5i5GGdm13jJCCdG58io+Ab25+jIx/c3CAi45/cXJ/jo6AcHSCjot9b3WCjYt8cHWCjop6cHaFjol6cXaGjoZ5cneGjoZ3cXmHjYZ3cXmHjIR2cnuIjIN1cn2JjIF1c32Ki4F0c36Jin91dH+KiX50dICKiX1zdYGLiX1zd4KLiHtzd4OKh3tzd4OLhnpzeYSKhXp0eoWKhHh0eoaKg3h0e4aKgnh0fIaJgXd1fYeJgXd1foeJgHd2f4iIf3Z2f4iHfnZ3gIiHfXZ4gYiGfXZ4goiFfHZ5g4iFfHZ6g4iEe3Z6g4iDenZ7hIiDenZ8hIiCeXd8hYeBeXd9hYeAeXd+hoeAeHd+hoZ/eHh/hoZ/eHiAhoV+eHmAhoV9eHmBhoR9eHqBhoR8eHqChoN8eHuChoN7eHuDhoJ7eHyDhoJ7eH2DhoF6eH2EhoF6eX6EhYB6eX6EhYB6eX+FhX95en+FhH95eoCFhH55eoCFg355e4GFg315e4GFg315fIGFgnx5fIKFgnx5fIKFgXx5fYKEgXt6fYOEgHt6foOEgHt6foOEgHt6f4OEf3t7f4ODf3p7f4SDfnp7gISDfnp7gISCfnp8gISCfXp8gYSCfXp8gYSBfXp9gYSBfXt9goOBfHt9goOAfHt+goOAfHt+goOAfHt/goN/fHt/goN/e3x/g4J/e3x/g4J+e3yAg4J+e3yAg4J+e32Ag4F+e32Bg4F9e32Bg4F9e32Bg4B9fH6BgoB9fH6BgoB9fH6BgoB8fH6Cgn98fH+Cgn98fA==","UNO":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAAB/lKWsqZyIcmBUU1xug5imq6WWgm1cVFdjd4yeqKiejHdkWFZeb4OXpKihkX1qXFdda3+Toaahk4BsXlhda36SoKWgkn9sXlpfboGUoKSdjnppXVtkdIeYoaGXhnNkXF9rfI+coZyPfGtgXmZ1iJegnpOCcGNeZHGDlJ6elYVzZV9jcIGSnJ6VhnRmYGRxgpKcnJSEc2ZhZnOEk5yakIBwZWJqeImWm5eLemxkZW9/jpmakoNzZ2Rqd4eUmpaKemxlZ3KBkJiXjn9wZ2ZvfYyWmJCCc2lmbXuKlZeRhHVqZ216iZSXkIN1amhue4qUlo+CdGppcH2LlJWMf3JqanOBjpWTiXtvaW14hZGUj4R2bGpxfouTk4p9cWttd4SPk46Ddm1sc3+LkpGIe3BscHuHkJKLfnNsb3iEjpKMgXVtbnaCjZGNg3ZubnWBjJGNg3dvbnWBjJCNg3dvb3aCjJCMgnZvcHiDjI+KgHVvcXqFjY6IfXNvc32Ijo2FenJwdoGKjoqBdnByeoWMjYd8c3B1f4mNioJ3cXJ6hIyMhnxzcXaAiY2JgHZydHyGjIuDeXNzeoOLjIZ8dHJ4gYmMh352cnZ/iIyIgHdzdX6Hi4mBeHN1fYaLiYF4c3V9hoqJgXl0dX2GioiBeHR2foaKiIB4dHd/h4qHf3d0eICHioV9dnV6goiJg3t1dnyEiYiBeXV3foaJhn53dXmBh4iDe3Z2fISIh4B5dnmAh4iEfHd2fIOIhoB5dnmAhoiDfHd3fYSIhn94dnqBh4eCe3d4f4WHhH14d3yDh4V/eXd7goaGgXp3eoCGh4J7d3l/hYeDfXh4foSHhH54eH2DhoR+eXh8g4aEf3l4fIKGhX95eHyChoR/enh8goaEf3p4fIKGhH55eX2DhoN+eXl+g4WDfXl6foSFgnx5eoCEhYF7eXuBhYR/enl9goWDfnp6foOFgn15e4CEhIB7eXyBhYN+enp+g4SBfHp7gISEf3t6fYKEgn16e3+EhIB7en2ChIJ9ent/g4SAe3p9goSCfXp7gIODf3t6foKEgX16fIGEgn57ew==","Monster Crush":"UklGRjQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAEAAB/jZqmsbvDyc3PzsrFvbSpnZCDdmleVExHQ0NESVBYY299ipiksLrCx8rKx8G4raCSg3RmWExDPDg3OT5HUV5reoiVoauyt7i1r6ebjoBxYlRIPzk2NztDTltqeoqZprG4vb25sqibjX1vYVVNR0ZJUFpndoeXprO9w8XDvbOml4Z2Z1tRTEtOVmFvf4+eq7W7vbqyp5iHdmZXTERCREtWZHSElKGrsLCropWFdGNUSEE/QUlVZXaHl6SssK6nnI19bF1RSUdLU2BxgpSjr7a3s6qci3pqXVVRVFxpeYucq7W6ubOnl4V0ZFlTU1pldIaXpbC0s6uejXtpW1FNT1hldoeXo6qrpZmJd2VWTEhLVGJ0hpWhp6aekYBuXlJLS1NgcYOUoqmqo5eHdWVZUlNbaXuNnqqwrqWXhXRlW1hdaXmLnKqxsambindoXVpeaXmLnKiurKOTgW9gV1ZdanuNnKWnoZSCcGBVUlZic4WVn6KdkYBtXVNQVmN0h5agoZqNe2pbVFVebYCRn6Sil4d1ZVtZYG6AkqCop52OfGthXmRxg5WjqqidjXtrYWBodoiZpamjloRyZF5hbHyOnKSimIh1ZVxbZHOFlZ6flod0ZFpYYG+BkZuck4RyYllZYnKEk5ybkYBvYFpdaXqMmZ+ajXxrYF5mdYiYoaCWhnRnYmZ0hZaho5uMemtkZ3OElaGjm4x6a2Rnc4SUn6CYiHZoYmZzhJSdnJGAb2JgZ3aHlZqViHZmXmBsfI2Xl419bGBeZnaHlJiRg3FkX2VzhJOZlYh2aGJmc4WUm5iLemtlaXaIlp2ZjHttZ2x6i5memYp5bGhvfo+bnZWFdGlpc4OTm5mNfG1maniIlZmRgnFmZW9/jpaTh3ZoY2l3iJOUinpqYmZzg5CUjH1tZGVxgZCVj4BwZmdygpCWkYJzaGl0hZOYkoN0amx4iJWZkYJza298jJeZj39xbHKAkJiWinltbHWFk5eRgnJqbXqKlJSJeGxpcYGOk41+b2dreIiRj4NzaGhygo6Qh3hrZ29+jJGLfG5obXuKko6BcmpteomSkIR1bG56ipOShndub3uLlJOHeG9xfYyVk4Z3b3J+jZWRhHZuc4COlI6Ac210go+SintvbXaFkI+EdmxueoiPi35wanF+i46Gd2xrdoSOi39xa3B9io6HeG1td4aPjIBybXOBjZCHeG9xfYuRjH5ycHmHkY+EdnB3hJCRh3pxdYGOkop8cnN+jJGLfnJyfImQjH9ycHmHj4t+cm94hY2KfnFud4SMiX1xbnaEjIh8cG53hYyHe3BveYaMhnlwcHyIjYV4cHN/i42Ed3B2g42MgXVyeoePi350dH+Lj4h7c3eDjo6Dd3N7iI+KfnR1gIuOhQ==","Snakes and Ladders":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAAB/kaGvn6GbmpSHaWlqYFtteHZ4dX57cHBveGqKjJCZoKWflpx+emJcWFpdYWdxjJWpl5OXkpSJgnt4en5reH95g3dxZmVlZ3WDhIqiqp6ZppWQfWhqW29dZGpxen2Ql4yDiIKBiISPjY+Ql4iEhXJuZlteZHBzdouUpaSlk5SDg3pxZVxbZWxzfYSCgn2AeHNzg3yLkZeRkpaHgXJvZGNZaGBufIKJkZubkoqNkYN9fn52dHp2e4VxcXVtcnNoeouMj56dnJiQkH52bWxgZ2h1dH18hYqTioyIg4GDfn+EioOGgXt7eHVmam90d32EkZqUmJ2ViIh8bXJsaW57c3p4goZ1fYR9eH2Gf46Ij5KQh4CDb3trZWpudniAiZSYjZWRloSDeHh4dnl/eH13dX12eH59fISEg46RlZGKjIOCgHVxb21tdHiAhoKOjoiFhIOCgn9+eol6f4R7enR5eW9udICAgoqLjZySjYuFenhwc3FvdHd5eHyDhYV+g399gIKFhYWGhoSDe3h7cnJscXl6goOLkImMjo6Hfn59eHd7eHd9fn18e399fHt/foOAhYqNjImEhX94eHRxcHJ0eYCEjYmNh4aEgX9+fX57fn19gnx9end4dnV4eoOFh4yPjYiIfnx8dnR2eHN1eXt9h4SEhYB+g3+EfoGDgoOIgnx7d3d6dnR4eX6Dg42OjIeEhH18eHp4dXl7gHx+gX9/fH18fYF+g4SFiIeEg35/fHZ1cnl5d32ChoaDhoiCg4OBfnyBf4B/foB9f3x8d3l6e3uBgoOFioeEhoJ8ent3dnp3en2BgYGCg4ODgICAhIB/gX6EgICAfHp5eHp7d31/goKHiIiFg4WDgHx5e3h6fHx9gIKBgX+Afn+CgoGAhYWDhYF/fnt7dnd4eX1/f4OEhoeGhYSAf31+gH59e39+fn1+fn9+e359gYGEgoaGhYSBfn59fHl6eHl9fYCAgIKEg4CAgX+Af3+AfYB/fn58fHp6fHt8fYGCg4SEh4WBf359fnt6e3t+fHx+gYGAgH+AfoCAgYGCgIKAgH5+ent6ent6fg==","Jackaroo":"UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAAB1h6urpo+WODZgfZqfimhLVXuUvMm4cl1CRmKLr6qfcn1qZmJkjJmeaXNXe3SOxLKDb1tHU26Jna2lk3Rub2WXiJFscl5rcoijqq6NblhTWnaPnpGVj3J3d4CJlpCFYFpecICdnZ2QdWdiWm+NlouCfGlneI6Zj4hxYFRicImeopuFb2dnbIKQkYZ6bW5shJOhlINqX1tjeJKfoJWBdG1peoaRj4BwbG1+j5qclYVqW2Bqf5CZloh7b2x4foqLh3pwanF+kJuek35sZGRxgY6UjoN7cnV/ho+MgXVpaHGBlJqZjX1sZ2l0g42PiIB0dHqFi5CJfG9mZ3KBk5mWi3pvaW97hYqJgXlzdX+JkpKJemtmaHaGkpiTh3pwb3WAh4mFe3Nyd4ONk5GHeGtnbHiGkJONg3hydXyEiIZ/dnByeoWQlZCFd2xqb3uHjo6If3d2eoGHiYR7c29ye4iRlI6Cdm1tc36HjImDe3d4foaKiYJ4cG5zfYmRkYuAdnBxd4CHiIR+eXd7g4qMiIB2b250f4mQj4h+dnN1fIOGhYB6d3h+hoyMh350b292gImOjIV9d3Z5f4SFgnx3dXmAiI2Mhnx0cHF5gomLiIJ7eHl9g4aEf3l1dXqCiY2LhXx0cXR7goeIhH96eXyBhYaDfXdzdXuDio2Kg3t1dHd9g4aFgXx6e3+Eh4eCe3VzdXyEiouIgXt2dnp/g4SCfnp5fIGGiIeBenVzd32EiYmGgHp4eX2Bg4N/e3l5fYOIiYaAeXV0eH6EiIeDfnt6fICDg4F9eXh6f4SIiYV/eXZ2en+EhoWBfXt8foKEg4B7eHd6gIWIiIR+eXd4fICEhIJ/fHt9gYSFg356d3d7gIWIh4N+enh6fYGDgoB9e3x/goWFgn15d3h8gYWHhYF9enp8f4KCgX57e32AhIaFgX15d3l9gYWFg4B9e3x+gYKBf3x6e32BhIaEgXx5eHp+goSEgn99fH2AgoKBfnt6e36ChYaEgHx5eXt/goOCgH58fX+Bg4KAfXp6e36ChYWDf3x6en1/gYKBf319foCCg4J/fHp6fA=="};

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

function deal29Batch(s,count){
 for(let round=0;round<count;round++)for(let offset=0;offset<4;offset++){
  const seat=(s.firstTurn-offset+4)%4,card=s.deck.pop();if(card)s.hands[s.players[seat].id].push(card);
 }
 return s;
}
function finish29Auction(s){if(!s.contract)return s;s.phase='deal2';deal29Batch(s,4);s.turn=s.players.findIndex(p=>p.id===s.contract.player);s.status='Second four cards dealt. Bid winner must select hidden trump.';return s;}
function initialGame(name,players,mode=2,options={}){
 const ids=players.map(p=>p.id), s={name,players,turn:0,round:1,score:{},status:'Game started.',winner:null};
 ids.forEach(id=>s.score[id]=0);
 if(name==='Ludo') {s.turn=rand(players.length);s.status=(players[s.turn]?.name||'Player')+' starts.';s.tokens={};players.forEach(p=>s.tokens[p.id]=[-1,-1,-1,-1]);s.consecutiveSix=0;s.finishOrder=[];s.safe=[0,8,13,21,26,34,39,47];}
 if(name==='Snakes and Ladders'){s.positions={};ids.forEach(id=>s.positions[id]=0);s.ladders={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};s.snakes={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};s.phase='start_roll';s.startingRolls={};s.tiedStartPlayers=[...ids];}
 if(name==='Carrom'){s.mode=mode;s.carromBoard=createCarromBoard();s.turn=rand(players.length);s.boardBreaker=s.turn;s.firstBreaker=s.turn;s.gameNumber=1;s.gamesWon=[0,0];s.seatRotation=0;s.thirdGameSideChanged=false;s.gameComplete=false;s.colours={};s.teamColours=[];s.teamColours[s.turn%2]='white';s.teamColours[1-s.turn%2]='black';s.players.forEach((pl,i)=>{s.colours[pl.id]=s.teamColours[i%2];});s.queenPending=null;s.queenCoveredBy=null;s.due=[0,0];s.breakAttempts=0;s.breakDone=false;s.shot=0;s.boardShots=0;s.fouls={};s.boardNumber=1;s.boardComplete=false;s.turnDeadline=Date.now()+15000;s.matchPoints=[0,0];s.score={};ids.forEach(id=>s.score[id]=0);s.boardsPlayed=0;}
 if(name==='UNO'){s.deck=[];let cardNo=0;colors.forEach(color=>{s.deck.push({id:'UNO-'+(cardNo++),rank:0,color,suit:'*'});for(let n=1;n<=9;n++)for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank:n,color,suit:'*'});for(const rank of ['Skip','Reverse','+2'])for(let copy=0;copy<2;copy++)s.deck.push({id:'UNO-'+(cardNo++),rank,color,suit:'*'});});for(let copy=0;copy<4;copy++){s.deck.push({id:'UNO-'+(cardNo++),rank:'Wild',color:'wild',suit:'*'});s.deck.push({id:'UNO-'+(cardNo++),rank:'+4',color:'wild',suit:'*'});}for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}const dealerDraws=players.map(p=>s.deck.pop()),dealerScores=dealerDraws.map(card=>typeof card.rank==='number'?card.rank:0);s.dealer=dealerScores.indexOf(Math.max(...dealerScores));s.deck.push(...dealerDraws);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.turn=(s.dealer+1)%players.length;s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,7));let first=s.deck.shift();while(first?.rank==='+4'){s.deck.push(first);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}first=s.deck.shift();}s.discard=[first];if(first?.rank==='Reverse')s.turn=s.dealer;s.direction=first?.rank==='Reverse'?-1:1;s.activeColor=first?.color||'red';s.pendingOpeningWild=first?.rank==='Wild';s.drawnCard=null;s.pendingUno=null;s.pendingChallenge=null;s.unoCalled={};s.matchPoints={};s.roundPoints=0;ids.forEach(id=>s.matchPoints[id]=0);if(first?.rank==='+2'){unoDraw(s,players[s.turn].id,2);advance(s);}else if(first?.rank==='Skip')advance(s);}
 if(name==='Playcards – Breez'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=s.deck.splice(0,13));s.boardNumber=1;s.dealer=(s.boardNumber-1)%4;s.turn=s.dealer;s.vulnerableTeams=bridgeVulnerability(s.boardNumber);s.phase='auction';s.bids=[];s.lastBid=null;s.lastBidder=null;s.passCount=0;s.multiplier=1;s.contract=null;s.trump=null;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.declarer=null;s.dummy=null;s.dummyRevealed=false;s.contractTricks=0;s.vulnerable=false;s.teamScore=[0,0];}
 if(name==='29'){s.deck=makeDeck(['J','9','A','10','K','Q','8','7']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};players.forEach(p=>s.hands[p.id]=[]);s.dealer=Number.isInteger(options.dealer)?((options.dealer%4)+4)%4:rand(4);s.firstTurn=(s.dealer+3)%4;s.turn=s.firstTurn;s.bids=[];s.bidCount=0;s.passCount=0;s.forcedDealerBid=false;s.highBid=0;s.contract=null;s.trump=null;s.trumpHidden=true;s.trumpRevealed=false;s.tricks=[];s.currentTrick=[];s.trickLeader=0;s.teamPoints=[0,0];s.matchScore=Array.isArray(options.matchScore)?[...options.matchScore]:[0,0];s.round=Number.isInteger(options.round)?options.round:1;s.phase='bidding';s.lastTrickTeam=null;deal29Batch(s,4);}
 if(name==='Jackaroo'){s.deck=makeDeck(['A','K','Q','J','10','9','8','7','6','5','4','3','2']);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}s.hands={};s.marbles={};players.forEach(p=>{s.hands[p.id]=[];s.marbles[p.id]=[-1,-1,-1,-1];});s.deckDiscard=[];s.dealer=rand(4);s.handRound=0;s.teamSafe=[0,0];jackarooDeal(s);}
 if(name==='Monster Crush'){const cells=Array.from({length:45},(_,i)=>({id:i,monster:false,revealed:false}));const positions=[];while(positions.length<7){const n=rand(45);if(!positions.includes(n))positions.push(n);}positions.forEach(i=>{cells[i].monster=true;});s.board=cells;s.target=7;s.monstersFound=0;s.shots=0;s.secondsLeft=60;s.deadline=Date.now()+60000;s.status='Find all 7 monsters before time runs out. No levels.';}
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
function carromReturnDue(board,color,count=1){
 const spots=Array.from({length:16},(_,i)=>{const radius=i<8?98:72,angle=(Math.PI*2*(i%8))/8;return [500+Math.cos(angle)*radius,500+Math.sin(angle)*radius];});
 let returned=0;
 while(returned<count){
  const coin=board.coins.find(x=>x.color===color&&x.pocketed);if(!coin)break;
  const spot=spots.find(([x,y])=>Math.hypot(x-500,y-500)>35&&board.coins.every(other=>other.id===coin.id||other.pocketed||Math.hypot(other.x-x,other.y-y)>40));
  if(!spot)break;coin.pocketed=false;coin.x=spot[0];coin.y=spot[1];coin.vx=0;coin.vy=0;returned++;
 }
 board.pocketed={white:0,black:0};board.coins.forEach(x=>{if(x.pocketed&&(x.color==='white'||x.color==='black'))board.pocketed[x.color]++;});
 return returned;
}
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
  const safeTokens=arr.filter((v,mi)=>mi!==marble&&v>=52&&v<=55);
  if(safeTokens.length){const required=Array.from({length:safeTokens.length},(_,i)=>55-i);if(!required.every(v=>safeTokens.includes(v))||next!==55-safeTokens.length)return false;}
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
  if(rank==='Q'&&isRed(card.suit)){const next=s.players[(s.turn+1)%4].id;if((s.hands[next]||[]).length)return true;continue;}
  if(rank==='10'){const next=s.players[(s.turn+1)%4].id;if((s.hands[next]||[]).length)return true;for(const owner of owners)for(let i=0;i<4;i++)if(jackarooMove(clone(s),owner,i,10))return true;continue;}
  if(rank==='J'){
   for(const owner of owners)for(let i=0;i<4;i++)if(s.marbles[owner][i]>=0&&s.marbles[owner][i]<52&&s.marbles[owner][i]!==0)
    for(const op of s.players)if(op.id!==owner)for(let j=0;j<4;j++)if(s.marbles[op.id][j]>0&&s.marbles[op.id][j]<52)return true;
  }
  if(rank==='A'||rank==='K'){if(owners.some(owner=>s.marbles[owner].some(v=>v===-1)))return true;if(rank==='A')for(const owner of owners)for(let i=0;i<4;i++)if(jackarooMove(clone(s),owner,i,11))return true;}
  const steps=rank==='A'?1:rank==='K'?13:rank==='Q'?12:rank==='4'?-4:rank==='7'?7:Number(rank);
  if(rank==='7'){
   for(const owner of owners)for(let i=0;i<4;i++)if(jackarooMove(clone(s),owner,i,7))return true;
   for(const owner of owners)for(const owner2 of owners)for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(owner!==owner2||i!==j)for(let split=1;split<7;split++){const test=clone(s);if(jackarooMove(test,owner,i,split)&&jackarooMove(test,owner2,j,7-split))return true;}
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
 const winningSeat=s.players.findIndex(p=>p.id===winner),winningTeam=['Carrom','Playcards – Breez','Jackaroo'].includes(s.name)&&winningSeat>=0?winningSeat%2:null;const rows=s.players.map((p,i)=>({id:p.id,name:p.name||'Player',score:scoreById[p.id]||0,seat:i,isWinner:winningSeat>=0&&(winningTeam!==null?i%2===winningTeam:p.id===winner)}));
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
function bridgeVulnerability(boardNumber){return [[false,false],[true,false],[false,true],[true,true],[true,false],[false,true],[true,true],[false,false],[false,true],[true,true],[false,false],[true,false],[true,true],[false,false],[true,false],[false,true]][(Math.max(1,Number(boardNumber)||1)-1)%16];}
function bridgeDuplicateScore(contract,tricks,vulnerable=false){
 const target=contract.level+6,under=target-tricks,m=contract.multiplier||1,suit=contract.suit;
 if(under<=0){
  const base=suit==='NT'?40+30*(contract.level-1):(['♣','♦'].includes(suit)?20:30)*contract.level;
  const contractPoints=base*m;
  let score=contractPoints+(base>=100?(vulnerable?500:300):50);
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
 const unoCatchAction=s.name==='UNO'&&action.type==='uno_catch'&&!!s.pendingUno&&s.pendingUno!==actor&&s.players.some(pl=>pl.id===actor);
 const unoCallAction=s.name==='UNO'&&action.type==='uno_call'&&s.pendingUno===actor&&s.players.some(pl=>pl.id===actor);
 if(!p||(p.id!==actor&&!dummyControl&&!unoCatchAction&&!unoCallAction)||(s.winner&&!((s.name==='UNO'&&action.type==='uno_next_round')||(s.name==='29'&&action.type==='29_next_hand')||(s.name==='Playcards – Breez'&&action.type==='bridge_next_deal'))))return s;
 const finish=()=>{advance(s);return s;};
 if(s.name==='Snakes and Ladders'&&action.type==='start_roll'){
  if(s.phase!=='start_roll'||!s.tiedStartPlayers?.includes(id))return s;
  const die=rand(6)+1;s.startingRolls[id]=die;
  if(s.tiedStartPlayers.every(pid=>Number.isInteger(s.startingRolls[pid]))){
   const high=Math.max(...s.tiedStartPlayers.map(pid=>s.startingRolls[pid])),leaders=s.tiedStartPlayers.filter(pid=>s.startingRolls[pid]===high);
   if(leaders.length===1){const winnerIndex=s.players.findIndex(pl=>pl.id===leaders[0]);s.turn=winnerIndex;s.phase='play';s.status=(s.players[winnerIndex]?.name||'Player')+' rolled highest and starts.';return s;}
   s.tiedStartPlayers=leaders;s.startingRolls={};s.turn=s.players.findIndex(pl=>pl.id===leaders[0]);s.status='Tie for highest spin. Tied players spin again.';return s;
  }
  const next=s.tiedStartPlayers[(s.tiedStartPlayers.indexOf(id)+1)%s.tiedStartPlayers.length];s.turn=s.players.findIndex(pl=>pl.id===next);s.status=(p.name||'Player')+' spun '+die+'.';return s;
 }
 if(s.name==='Snakes and Ladders'&&action.type==='roll'){
  if(s.phase!=='play')return s;
  const die=rand(6)+1,pos=s.positions[id]||0,next=pos+die;
  if(next<=100){s.positions[id]=s.ladders[next]||s.snakes[next]||next;if(s.positions[id]===100)s.winner=id;}
  s.status=next>100?'Need exact count to reach 100.':s.ladders[next]?'Climbed a ladder!':s.snakes[next]?'Slid down a chute.':'Moved '+die+' spaces.';
  return finish();
 }
 if(s.name==='Ludo'&&action.type==='ludo_roll'){
  if(s.pendingDie)return s;
  const d=rand(6)+1;
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
 if(s.name==='Carrom'&&action.type==='carrom_timeout'){
  if(s.boardComplete||s.gameComplete||!s.turnDeadline||Date.now()<s.turnDeadline)return s;
  const team=s.turn%2,color=s.teamColours[team];s.due[team]=(s.due[team]||0)+1;
  const placed=carromReturnDue(s.carromBoard,color,1);if(placed)s.due[team]=Math.max(0,s.due[team]-placed);
  s.fouls[id]=(s.fouls[id]||0)+1;s.turnDeadline=Date.now()+15000;s.status='15-second stroke limit exceeded: technical foul; one due. Your turn continues.';return s;
 }
 if(s.name==='Carrom'&&action.type==='carrom_shot'){
  if(s.boardComplete||s.turnDeadline&&Date.now()>s.turnDeadline)return s;
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
   if(board.strikerPocketed){s.breakDone=true;s.boardBreaker=(s.turn+1)%s.players.length;s.turnDeadline=Date.now()+15000;s.status='Unmade break with striker pocketed: turn passes without a due.';advance(s);return s;}
   if(s.breakAttempts<2){s.breakAttempts++;s.turnDeadline=Date.now()+15000;s.status='Break not made. Retry '+(s.breakAttempts+1)+' of 3.';return s;}
   s.breakDone=true;s.boardBreaker=(s.turn+1)%s.players.length;s.turnDeadline=Date.now()+15000;s.status='Break not made after three attempts. Break passes to the opponent.';advance(s);return s;
  }
  s.breakDone=true;s.breakAttempts=0;s.turnDeadline=Date.now()+15000;
  let dueCount=Number(s.due?.[team]||0);
  if(strikerFoul){
   const returnedNew=returnNewOwnCoins();dueCount+=1;dueCount-=returnPriorOwnCoins(dueCount);s.due[team]=Math.max(0,dueCount);
  }else{
   for(const coin of ownNew){if(dueCount<=0)break;if(putCoinBack(coin))dueCount--;}
   dueCount-=returnPriorOwnCoins(dueCount);s.due[team]=Math.max(0,dueCount);
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
   s.matchPoints[boardWinner]+=boardPoints;s.boardsPlayed++;if(s.gameNumber===3&&!s.thirdGameSideChanged&&(s.boardsPlayed>=4||s.matchPoints[0]>=13||s.matchPoints[1]>=13)){s.seatRotation=(s.seatRotation+1)%s.players.length;s.thirdGameSideChanged=true;}s.turnDeadline=null;s.boardComplete=true;s.boardWinnerTeam=boardWinner;s.boardPoints=boardPoints;s.due=[0,0];
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
  const next=initialGame('Carrom',s.players,s.mode);next.boardNumber=s.boardNumber+1;next.boardsPlayed=s.boardsPlayed;next.matchPoints=[...s.matchPoints];next.gamesWon=[...s.gamesWon];next.gameNumber=s.gameNumber;next.firstBreaker=s.firstBreaker;next.seatRotation=s.seatRotation;next.thirdGameSideChanged=s.thirdGameSideChanged;next.score={};next.players.forEach((pl,i)=>next.score[pl.id]=next.matchPoints[i%2]);const extraBoardToss=s.boardsPlayed>=8&&s.matchPoints[0]===s.matchPoints[1];next.turn=extraBoardToss?rand(s.players.length):(s.boardBreaker+1)%s.players.length;next.boardBreaker=next.turn;next.extraBoardToss=extraBoardToss;next.teamColours=[];next.teamColours[next.turn%2]='white';next.teamColours[1-next.turn%2]='black';next.players.forEach((pl,i)=>{next.colours[pl.id]=next.teamColours[i%2];});next.status='Board '+next.boardNumber+' started.';return next;
 }
 if(s.name==='Carrom'&&action.type==='carrom_next_game'){
  if(!s.gameComplete||s.matchWinner!==null&&s.matchWinner!==undefined||s.winner)return s;
  const next=initialGame('Carrom',s.players,s.mode);next.gameNumber=s.gameNumber+1;next.gamesWon=[...s.gamesWon];next.firstBreaker=s.firstBreaker;next.turn=next.gameNumber===2?(s.firstBreaker+1)%s.players.length:s.firstBreaker;next.boardBreaker=next.turn;next.seatRotation=(s.seatRotation+1)%s.players.length;next.teamColours=[];next.teamColours[next.turn%2]='white';next.teamColours[1-next.turn%2]='black';next.players.forEach((pl,i)=>{next.colours[pl.id]=next.teamColours[i%2];});next.status='Game '+next.gameNumber+' of 3. Breaker has white.';return next;
 }
 if(s.name==='Monster Crush'&&action.type==='monster_shot'){
  const cell=s.board.find(x=>x.id===action.cell&&!x.revealed);if(!cell||s.winner||s.secondsLeft<=0)return s;
  cell.revealed=true;s.shots++;
  if(cell.monster){s.monstersFound++;s.score[id]=(s.score[id]||0)+10;s.status=(s.players.find(x=>x.id===id)?.name||'Player')+' found a monster! +10 points.';}
  else s.status=(s.players.find(x=>x.id===id)?.name||'Player')+' found an empty tile.';
  if(s.monstersFound>=s.target||s.secondsLeft<=0){const winner=s.players.slice().sort((a,b)=>(s.score[b.id]||0)-(s.score[a.id]||0))[0];s.winner=winner?.id;s.status='Round complete. '+(winner?.name||'Player')+' wins with '+(s.score[winner?.id]||0)+' points.';}
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
  if(skip===2)s.pendingUno=null;
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
 if(s.name==='UNO'&&action.type==='uno_call'){if(s.pendingUno!==actor||!s.players.some(pl=>pl.id===actor))return s;s.pendingUno=null;s.status=(s.players.find(pl=>pl.id===actor)?.name||'Player')+' called UNO in time.';return s;}
 if(s.name==='UNO'&&action.type==='uno_catch'){if(s.pendingOpeningWild)return s;
  if(!s.pendingUno||s.pendingUno===actor||!s.players.some(pl=>pl.id===actor))return s;
  const offender=s.pendingUno;unoDraw(s,offender,2);s.status=(s.players.find(pl=>pl.id===offender)?.name||'Player')+' was caught without calling UNO and draws two cards.';s.pendingUno=null;return s;
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
 if(s.name==='29'&&action.type==='29_next_hand'){if(!s.winner||s.matchWinner!==null)return s;const next=initialGame('29',s.players,2,{dealer:(s.dealer+3)%4,matchScore:s.matchScore,round:s.round+1});next.status='Next hand started.';return next;}
 if(s.name==='UNO'&&action.type==='uno_next_round'){
  if(!s.winner||s.matchWinner)return s;
  const next=initialGame('UNO',s.players);next.round=s.round+1;next.matchPoints={...s.matchPoints};next.status='Round '+next.round+' started.';return next;
 }
 if(s.name==='29'&&action.type==='29_bid'){
  if(s.phase!=='bidding')return s;
  if(action.pass){
   if(s.forcedDealerBid)return s;
   s.bids.push({player:id,pass:true});s.passCount++;
   if(s.contract&&s.passCount>=3)return finish29Auction(s);
   if(!s.contract&&s.passCount>=3){s.forcedDealerBid=true;s.turn=s.dealer;s.status='First three players passed. Dealer must make the minimum bid.';return s;}
   advance(s,-1);s.status='Passed.';return s;
  }
  const bid=Number(action.bid);if(!Number.isInteger(bid)||bid<16||bid>28||bid<=s.highBid)return s;
  if(s.forcedDealerBid&&(id!==s.dealer||bid!==16))return s;
  const forced=s.forcedDealerBid;s.bids.push({player:id,bid,pass:false});s.highBid=bid;s.contract={player:id,bid};s.passCount=0;s.forcedDealerBid=false;
  if(forced)return finish29Auction(s);
  advance(s,-1);s.status='Bid '+bid+'.';return s;
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
   if(!s.lastBid&&s.passCount>=4){const next=initialGame('Playcards – Breez',s.players);next.boardNumber=s.boardNumber+1;next.dealer=(next.boardNumber-1)%4;next.turn=next.dealer;next.vulnerableTeams=bridgeVulnerability(next.boardNumber);next.status='Passed out. New deal.';return next;}
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
  const next=initialGame('Playcards – Breez',s.players);next.boardNumber=s.boardNumber+1;next.dealer=(next.boardNumber-1)%4;next.turn=next.dealer;next.vulnerableTeams=bridgeVulnerability(next.boardNumber);next.status='Board '+next.boardNumber+' auction begins.';return next;
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
   const next=s.players[(s.turn+1)%4].id;if(!(s.hands[next]||[]).length)return s;s.pendingDiscard={by:id,target:next,chooser:'attacker'};keepTurn=true;played=true;
  }else if(card.rank==='10'&&action.effect==='burn'){
   const next=s.players[(s.turn+1)%4].id;if(!(s.hands[next]||[]).length)return s;s.pendingDiscard={by:id,target:next,chooser:'target'};s.turn=(s.turn+1)%4;keepTurn=true;played=true;
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

export default function RoomGames({visible,initialGameName=null,onInitialGameOpened,onClose,onGameAvailable,roomId,creatorName='Player',userId,supabase,isAuthorisedStarter=false,hasRoomSeat=false,roomMembers=[],selfProfile=null}){
 const [stage,setStage]=useState('select'),[selected,setSelected]=useState(null),[mode,setMode]=useState(2),[players,setPlayers]=useState([]),[seconds,setSeconds]=useState(60),[state,setState]=useState(null),[bet,setBet]=useState(0),[status,setStatus]=useState(''),[minimized,setMinimized]=useState(false),[carromTurnSeconds,setCarromTurnSeconds]=useState(15);
 const [rulesVisible,setRulesVisible]=useState(false),[soundMuted,setSoundMuted]=useState(false);
 const gameAudio=useAudioPlayer(null),soundReadyRef=useRef(false),soundMutedRef=useRef(false);
 const [unoColor,setUnoColor]=useState('red'),[unoCallSelected,setUnoCallSelected]=useState(false),[carromAngle,setCarromAngle]=useState(0),[carromPower,setCarromPower]=useState(16),[jackarooCardId,setJackarooCardId]=useState(null),[jackarooSource,setJackarooSource]=useState(null),[jackarooFirst,setJackarooFirst]=useState(null),[jackarooSecond,setJackarooSecond]=useState(null),[jackarooSplit,setJackarooSplit]=useState(3);
 const channelRef=useRef(null),hostRef=useRef(false),hostIdRef=useRef(null),lobbyRef=useRef(null),privateReceiverRef=useRef(null),privateReceiverTopicRef=useRef(null),privateSenderChannelsRef=useRef({}),previousLobbyIdRef=useRef(null),stateRef=useRef(null),stageRef=useRef(stage),timerRef=useRef(null),selectedRef=useRef(selected),playersRef=useRef(players),secondsRef=useRef(seconds),modeRef=useRef(mode),betRef=useRef(bet);
 const onGameAvailableRef=useRef(onGameAvailable),minimizedRef=useRef(minimized);onGameAvailableRef.current=onGameAvailable;minimizedRef.current=minimized;
 const hideableGame=selected&&!['Brainstorm','Truth and Dare'].includes(selected.name);
 const canMinimize=stage==='play'&&hideableGame;
 const reopenGame=()=>{setMinimized(false);minimizedRef.current=false;onGameAvailableRef.current?.();};
 stateRef.current=state;stageRef.current=stage;selectedRef.current=selected;playersRef.current=players;secondsRef.current=seconds;modeRef.current=mode;betRef.current=bet;
 const max=selected?.name==='Carrom'?mode:selected?.max;
 const min=selected?.name==='Carrom'?mode:selected?.min;
 const timerMin=selected?.name==='29'||(selected?.name==='Carrom'&&mode===4)?4:2;
 const seated=hasRoomSeat;
 const seatExempt=['Truth and Dare','Brainstorm'].includes(selected?.name);
 const canJoin=seatExempt||seated;
 const inLobby=players.some(p=>p.id===userId);
 const playerCard=player=>{const member=(Array.isArray(roomMembers)?roomMembers:[]).find(person=>person?.user_id===player.id||person?.id===player.id);const own=player.id===userId?selfProfile:null;return {name:member?.display_name||own?.display_name||player.name||'Player',avatarUrl:member?.avatar_url||own?.avatar_url||player.avatarUrl||null,talkzyId:member?.talkzy_id||own?.talkzy_id||player.talkzyId||null};};
 const current=state?.players?.[state?.turn];
 const bridgeDummyTurn=stage==='play'&&selected?.name==='Playcards – Breez'&&current?.id===state?.dummy&&state?.declarer===userId;
 const isMyTurn=stage==='play'&&(current?.id===userId||bridgeDummyTurn);
 const publish=(type,extra={})=>channelRef.current?.send({type:'broadcast',event:'game_event',payload:{type,roomId,userId,...extra}});
 const gameSoundKey=()=>userId&&selectedRef.current?.name?'@talkzy/game-sound-muted:'+userId+':'+selectedRef.current.name:null;
 const playGameSound=()=>{if(soundMutedRef.current||!soundReadyRef.current)return;try{gameAudio.seekTo(0).then(()=>{if(!soundMutedRef.current)gameAudio.play();}).catch(()=>{});}catch{}};
 const toggleGameSound=async()=>{const next=!soundMutedRef.current;soundMutedRef.current=next;setSoundMuted(next);const key=gameSoundKey();if(key){try{await AsyncStorage.setItem(key,next?'1':'0');}catch{}}};
 useEffect(()=>{let active=true;soundReadyRef.current=false;const sound=GAME_SOUND_BASE64_BY_GAME[selected?.name]||GAME_SOUND_BASE64_BY_GAME.Ludo;const safeName=String(selected?.name||'default').toLowerCase().replace(/[^a-z0-9]+/g,'-');const uri=(FileSystem.cacheDirectory||FileSystem.documentDirectory)+'talkzy-game-effect-'+safeName+'.wav';FileSystem.writeAsStringAsync(uri,sound,{encoding:'base64'}).then(()=>{if(!active)return;gameAudio.replace({uri});soundReadyRef.current=true;}).catch(()=>{soundReadyRef.current=false;});return()=>{active=false;soundReadyRef.current=false;};},[gameAudio,selected?.name]);
 useEffect(()=>{let active=true;soundMutedRef.current=false;setSoundMuted(false);const key=gameSoundKey();if(key)AsyncStorage.getItem(key).then(value=>{if(!active)return;const muted=value==='1';soundMutedRef.current=muted;setSoundMuted(muted);}).catch(()=>{});return()=>{active=false;};},[userId,selected?.name]);

 const clearPrivateChannels=()=>{if(privateReceiverRef.current)supabase?.removeChannel(privateReceiverRef.current);privateReceiverRef.current=null;privateReceiverTopicRef.current=null;Object.values(privateSenderChannelsRef.current).forEach(entry=>{if(entry?.channel)supabase?.removeChannel(entry.channel);});privateSenderChannelsRef.current={};};
 const subscribePrivateReceiver=lid=>{if(!supabase||!roomId||!userId||!lid)return;const topic='room-games-private-'+roomId+'-'+lid+'-'+userId;if(privateReceiverTopicRef.current===topic)return;if(privateReceiverRef.current)supabase.removeChannel(privateReceiverRef.current);const ch=supabase.channel(topic,{config:{private:true}});ch.on('broadcast',{event:'private_game_state'},({payload:p})=>{if(!p||p.roomId!==roomId||p.lobbyId!==lid||p.recipientId!==userId||p.userId!==hostIdRef.current||hostRef.current)return;stateRef.current=p.snapshot;setState(p.snapshot);if(p.snapshot?.winner)setStage('result');});privateReceiverRef.current=ch;privateReceiverTopicRef.current=topic;ch.subscribe(status=>{if(status==='SUBSCRIBED')publish('request_private_state',{lobbyId:lid,recipientId:userId});});};
 const sendPrivateSnapshot=(player,snapshot)=>{if(!supabase||!roomId||!lobbyRef.current||player.id===userId)return;const lid=lobbyRef.current,topic='room-games-private-'+roomId+'-'+lid+'-'+player.id,payload={roomId,lobbyId:lid,userId,recipientId:player.id,snapshot};let entry=privateSenderChannelsRef.current[player.id];if(!entry){const ch=supabase.channel(topic,{config:{private:true}});entry={channel:ch,subscribed:false,pending:payload};privateSenderChannelsRef.current[player.id]=entry;ch.subscribe(status=>{if(status==='SUBSCRIBED'){entry.subscribed=true;const latest=entry.pending;entry.pending=null;if(latest)ch.send({type:'broadcast',event:'private_game_state',payload:latest});}});}else{entry.pending=payload;if(entry.subscribed){entry.pending=null;entry.channel.send({type:'broadcast',event:'private_game_state',payload});}}};
 const sendGameSnapshots=next=>{publish('game_state',{lobbyId:lobbyRef.current,snapshot:publicGameSnapshot(next)});next?.players?.forEach(pl=>sendPrivateSnapshot(pl,publicGameSnapshot(next,pl.id)));};
 const sync=next=>{stateRef.current=next;setState(next);if(next?.winner)setStage('result');playGameSound();publish('game_sound',{lobbyId:lobbyRef.current});sendGameSnapshots(next);};
 const doAction=action=>{const canCatchUno=state?.name==='UNO'&&action?.type==='uno_catch'&&!!state.pendingUno&&state.pendingUno!==userId;const canCallUno=state?.name==='UNO'&&action?.type==='uno_call'&&state.pendingUno===userId;if((!isMyTurn&&!canCatchUno&&!canCallUno)||!state)return;if(hostRef.current)sync(applyMove(state,userId,action));else publish('game_action',{lobbyId:lobbyRef.current,action});};
 const quitGame=()=>{if(!lobbyRef.current||!inLobby||hostRef.current)return;publish('leave_game',{lobbyId:lobbyRef.current,playerId:userId});setPlayers(old=>{const next=old.filter(player=>player.id!==userId);playersRef.current=next;return next;});setStatus('You left the lobby. You can join again before the game starts.');clearPrivateChannels();};
 const reset=(notify=true)=>{if(notify&&lobbyRef.current){if(hostRef.current)publish('lobby_closed',{lobbyId:lobbyRef.current});else publish('leave_game',{lobbyId:lobbyRef.current,playerId:userId});}clearPrivateChannels();clearInterval(timerRef.current);setStage('select');setSelected(null);setPlayers([]);setState(null);setStatus('');setBet(0);setMinimized(false);minimizedRef.current=false;hostRef.current=false;hostIdRef.current=null;lobbyRef.current=null;previousLobbyIdRef.current=null;};
 const close=()=>{if(canMinimize){setMinimized(true);minimizedRef.current=true;}onClose?.();};
 useEffect(()=>{
  if(!roomId||!userId||!supabase)return;
  const ch=supabase.channel('room-games-'+roomId,{config:{private:true}});channelRef.current=ch;
  ch.on('broadcast',{event:'game_event'},({payload:p})=>{
   if(!p||p.roomId!==roomId||p.userId===userId)return;
   if(p.type==='request_private_state'&&hostRef.current&&p.lobbyId===lobbyRef.current&&p.recipientId===p.userId&&stateRef.current){const recipient=playersRef.current.find(pl=>pl.id===p.recipientId);if(recipient)sendPrivateSnapshot(recipient,publicGameSnapshot(stateRef.current,recipient.id));}
   if(p.type==='request_state'&&hostRef.current){publish('lobby_state',{lobbyId:lobbyRef.current,previousLobbyId:previousLobbyIdRef.current,players:playersRef.current,state:publicGameSnapshot(stateRef.current),stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current,bet:betRef.current});if(stateRef.current)sendGameSnapshots(stateRef.current);}
   if(p.type==='create_lobby'&&!lobbyRef.current){const game=GAMES.find(g=>g.name===p.gameName);const hostPlayer=Array.isArray(p.players)?p.players.find(x=>x?.id===p.userId):null;if(typeof p.lobbyId!=='string'||!p.lobbyId.endsWith('-'+p.userId)||!hostPlayer||!game||['Truth and Dare','Brainstorm'].includes(game.name))return;setMinimized(false);minimizedRef.current=false;lobbyRef.current=p.lobbyId;hostRef.current=false;hostIdRef.current=p.userId;setSelected(game);setBet(Number(p.bet)||0);setPlayers([{...hostPlayer,id:p.userId,name:String(hostPlayer.name||'Player').slice(0,32)}]);setSeconds(60);secondsRef.current=60;setStage('lobby');subscribePrivateReceiver(p.lobbyId);setStatus('Join this game from the room.');if(!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='join_game'&&hostRef.current&&stageRef.current==='lobby'&&p.lobbyId===lobbyRef.current&&p.player?.id===p.userId&&(!selectedRef.current?.timed||secondsRef.current>0)){setPlayers(old=>{const cap=selectedRef.current?.name==='Carrom'?modeRef.current:selectedRef.current?.max;if(old.some(x=>x.id===p.player.id)||old.length>=cap)return old;const next=[...old,p.player];playersRef.current=next;publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:'lobby',selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current,bet:betRef.current});return next;});}
   if(p.type==='lobby_state'&&p.lobbyId&&(!lobbyRef.current||p.lobbyId===lobbyRef.current||p.previousLobbyId===lobbyRef.current)&&(p.userId===hostIdRef.current||!hostIdRef.current||p.previousLobbyId===lobbyRef.current)){if(!lobbyRef.current||p.previousLobbyId===lobbyRef.current){lobbyRef.current=p.lobbyId;hostIdRef.current=p.userId;hostRef.current=false;subscribePrivateReceiver(p.lobbyId);}else subscribePrivateReceiver(p.lobbyId);setPlayers(p.players||[]);playersRef.current=p.players||[];if(Number.isFinite(Number(p.seconds)))setSeconds(Math.max(0,Math.min(60,Number(p.seconds))));if(Number.isFinite(Number(p.bet)))setBet(Math.max(0,Math.min(1000000,Number(p.bet))));if(p.mode)setMode(p.mode);if(p.selected){const game=GAMES.find(g=>g.name===p.selected)||null;setSelected(game);if(game&&!['Truth and Dare','Brainstorm'].includes(game.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}if(p.stage==='play'&&p.state){stateRef.current=p.state;setState(p.state);setStage('play');publish('request_private_state',{lobbyId:p.lobbyId,recipientId:userId});}else setStage('lobby');}
   if(p.type==='start_game'&&stageRef.current==='lobby'&&(p.lobbyId===lobbyRef.current||p.previousLobbyId===lobbyRef.current)&&(p.userId===hostIdRef.current||p.authorizedStarter===true)){if(p.previousLobbyId===lobbyRef.current&&p.lobbyId!==lobbyRef.current){lobbyRef.current=p.lobbyId;subscribePrivateReceiver(p.lobbyId);}hostIdRef.current=p.userId;hostRef.current=false;stateRef.current=p.snapshot;setState(p.snapshot);setStage('play');publish('request_private_state',{lobbyId:p.lobbyId,recipientId:userId});if(!['Truth and Dare','Brainstorm'].includes(p.snapshot?.name)&&!minimizedRef.current)onGameAvailableRef.current?.();}
   if(p.type==='game_action'&&hostRef.current&&p.lobbyId===lobbyRef.current){const next=applyMove(stateRef.current,p.userId,p.action);sync(next);}
   if(p.type==='game_state'&&p.userId===hostIdRef.current&&p.lobbyId===lobbyRef.current&&!hostRef.current){stateRef.current=p.snapshot;setState(p.snapshot);if(p.snapshot?.winner)setStage('result');}
   if(p.type==='game_sound'&&p.lobbyId===lobbyRef.current)playGameSound();
   
   if(p.type==='leave_game'&&hostRef.current&&stageRef.current==='lobby'&&p.lobbyId===lobbyRef.current&&p.playerId===p.userId){setPlayers(old=>{const next=old.filter(x=>x.id!==p.playerId);playersRef.current=next;const isType5=selectedRef.current?.name==='29'||(selectedRef.current?.name==='Carrom'&&modeRef.current===4);if(isType5&&old.length>=4&&next.length<4){secondsRef.current=60;setSeconds(60);}publish('lobby_state',{lobbyId:lobbyRef.current,players:next,stage:stageRef.current,selected:selectedRef.current?.name,seconds:secondsRef.current,mode:modeRef.current,bet:betRef.current});return next;});}
   if(p.type==='lobby_closed'&&p.userId===hostIdRef.current&&p.lobbyId===lobbyRef.current){reset(false);}
  });
  ch.subscribe(st=>{if(st==='SUBSCRIBED')publish('request_state');});
  return()=>{channelRef.current=null;supabase.removeChannel(ch);clearPrivateChannels();};
 },[roomId,userId,supabase]);
 useEffect(()=>{if(stage!=='lobby'||!selected?.timed||players.length<timerMin||!hostRef.current||secondsRef.current<=0)return;timerRef.current=setInterval(()=>{const next=Math.max(0,secondsRef.current-1);secondsRef.current=next;setSeconds(next);publish('lobby_state',{lobbyId:lobbyRef.current,players:playersRef.current,stage:'lobby',selected:selectedRef.current?.name,seconds:next,mode:modeRef.current});if(next===0)clearInterval(timerRef.current);},1000);return()=>clearInterval(timerRef.current);},[stage,selected,bet,players.length,timerMin]);
 useEffect(()=>{if(stage==='lobby'&&seconds===0)setStatus(players.length<min?'Countdown finished — waiting for '+min+' players.':'The game is ready to start.');},[seconds,stage,players.length,min]);
 useEffect(()=>{
  if(stage!=='play'||state?.name!=='Carrom'||!state?.turnDeadline){setCarromTurnSeconds(0);return;}
  const tick=()=>setCarromTurnSeconds(Math.max(0,Math.ceil((Number(stateRef.current?.turnDeadline||0)-Date.now())/1000)));
  tick();const timer=setInterval(tick,200);return()=>clearInterval(timer);
 },[stage,state?.name,state?.turnDeadline,state?.turn]);
 useEffect(()=>{
  if(stage!=='play'||!hostRef.current||state?.name!=='Carrom'||!state?.turnDeadline||state?.boardComplete||state?.gameComplete||state?.winner)return;
  const deadline=state.turnDeadline;
  const timer=setInterval(()=>{
   const currentState=stateRef.current;
   if(!currentState||currentState.name!=='Carrom'||currentState.turnDeadline!==deadline||currentState.boardComplete||currentState.gameComplete||currentState.winner){clearInterval(timer);return;}
   if(Date.now()>=deadline){clearInterval(timer);const actor=currentState.players[currentState.turn]?.id;if(actor){const next=applyMove(currentState,actor,{type:'carrom_timeout'});sync(next);}}
  },200);
  return()=>clearInterval(timer);
 },[stage,state?.name,state?.turnDeadline,state?.turn,state?.boardComplete,state?.gameComplete,state?.winner]);
 useEffect(()=>{
  if(stage!=='play'||!hostRef.current||state?.name!=='Monster Crush'||state?.winner)return;
  const timer=setInterval(()=>{
   const currentState=stateRef.current;
   if(!currentState||currentState.name!=='Monster Crush'||currentState.winner){clearInterval(timer);return;}
   const left=Math.max(0,Math.ceil((Number(currentState.deadline||0)-Date.now())/1000));
   if(left===currentState.secondsLeft)return;
   const next=clone(currentState);next.secondsLeft=left;
   if(left===0){const winner=next.players.slice().sort((a,b)=>(next.score[b.id]||0)-(next.score[a.id]||0))[0];next.winner=winner?.id;next.status='Time is up. '+(winner?.name||'Player')+' wins with '+(next.score[winner?.id]||0)+' points.';}
   stateRef.current=next;setState(next);sendGameSnapshots(next);if(left===0)setStage('result');
   if(left===0)clearInterval(timer);
  },250);
  return()=>clearInterval(timer);
 },[stage,state?.name,state?.deadline,state?.winner]);

 const choose=g=>{const held={ 'Truth and Dare':'No single official Truth and Dare ruleset exists; this game remains unavailable under the official-rules-only requirement.','Brainstorm':'No single official Brainstorm ruleset exists; this game remains unavailable under the official-rules-only requirement.'};if(held[g.name]){setStatus(held[g.name]);return;}setSelected(g);setBet(0);if(g.name==='Carrom')setMode(2);if(g.name==='29')setMode(4);setStage('setup');};
 useEffect(()=>{if(!visible||!initialGameName||stage!=='select')return;const game=GAMES.find(item=>item.name===initialGameName);if(game){setMinimized(false);minimizedRef.current=false;choose(game);}onInitialGameOpened?.();},[visible,initialGameName,stage]);
 const create=()=>{if(!selected||!userId){setStatus('Choose a game first.');return;}if(['Truth and Dare','Brainstorm'].includes(selected.name)){setStatus('Rules for this game are still being finalised.');return;}const lid=String(Date.now())+'-'+userId,host={id:userId,name:creatorName,avatarUrl:selfProfile?.avatar_url||null,talkzyId:selfProfile?.talkzy_id||null};hostRef.current=true;hostIdRef.current=userId;lobbyRef.current=lid;setPlayers([host]);playersRef.current=[host];setSeconds(60);secondsRef.current=60;setStage('lobby');setStatus(bet===0?'Free play':'Selected bet: '+formatGoodCoins(bet)+' Good Coins per player.');publish('create_lobby',{lobbyId:lid,gameName:selected.name,players:[host],bet,mode});};
 const join=()=>{if(stage!=='lobby')return;if(selected?.timed&&seconds<=0&&players.length>=min){setStatus('The joining time has ended.');return;}if(!canJoin){setStatus('Take a room mic seat before joining this game.');return;}if(inLobby||players.length>=max)return;publish('join_game',{lobbyId:lobbyRef.current,player:{id:userId,name:creatorName,avatarUrl:selfProfile?.avatar_url||null,talkzyId:selfProfile?.talkzy_id||null}});setStatus('Join request sent.');};
 const start=()=>{if(!hostRef.current||playersRef.current.length<min||['Truth and Dare','Brainstorm'].includes(selectedRef.current?.name))return;previousLobbyIdRef.current=null;hostIdRef.current=userId;const s=initialGame(selectedRef.current.name,playersRef.current,modeRef.current);stateRef.current=s;setState(s);setMinimized(false);minimizedRef.current=false;setStage('play');playGameSound();publish('game_sound',{lobbyId:lobbyRef.current});publish('start_game',{lobbyId:lobbyRef.current,snapshot:publicGameSnapshot(s)});sendGameSnapshots(s);};
 useEffect(()=>{if(stage==='lobby'&&seconds===0&&players.length>=min&&hostRef.current)start();},[stage,seconds,players.length,min]);
 const act=action=>doAction(action);
 const roll=()=>act({type:'roll'});
 const currentHand=state?.hands?.[bridgeDummyTurn?state.dummy:userId]||[];
 const renderControls=()=>{
  if(!state)return null;
  if(state.name==='Monster Crush'){
   const rows=Array.from({length:5},(_,r)=>state.board.slice(r*9,(r+1)*9));
   return <><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}><Text style={{color:GOLD,fontWeight:'900'}}>MONSTERS FOUND {state.monstersFound}/{state.target}</Text><Text style={{color:state.secondsLeft<=10?'#FF7777':GOLD,fontWeight:'900'}}>TIME {state.secondsLeft}s</Text></View><Text style={{color:muted,textAlign:'center',fontSize:10,marginBottom:8}}>Find all 7 monsters · one fixed round · no levels</Text><View style={{width:'100%',maxWidth:360,alignSelf:'center',gap:4}}>{rows.map((row,r)=><View key={'mc-row-'+r} style={{flexDirection:'row',gap:3}}>{row.map(cell=><TouchableOpacity key={cell.id} disabled={!isMyTurn||cell.revealed||!!state.winner||state.secondsLeft<=0} onPress={()=>act({type:'monster_shot',cell:cell.id})} style={{flex:1,aspectRatio:1,borderRadius:6,borderWidth:1,borderColor:cell.revealed?'#796447':GOLD,backgroundColor:cell.revealed?'#211B29':'#3A2B43',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:cell.revealed?17:13,color:cell.revealed?ink:GOLD,fontWeight:'900'}}>{cell.revealed?(cell.monster?'👾':'·'):'?'}</Text></TouchableOpacity>)}</View>)}</View><Text style={{color:muted,textAlign:'center',fontSize:10,marginTop:8}}>Tap one covered tile on your turn. Monster = +10 points.</Text></>;
  }
  if(state.name==='Snakes and Ladders'){
  const boardRows=Array.from({length:10},(_,row)=>{const level=9-row,base=level*10,nums=Array.from({length:10},(_,i)=>level%2===0?base+i+1:base+10-i);return <View key={'snakerow'+row} style={{flexDirection:'row'}}>{nums.map(n=>{const occupants=state.players.map((pl,i)=>({pl,i})).filter(x=>state.positions[x.pl.id]===n);const ladder=state.ladders[n],snake=state.snakes[n];return <View key={n} style={{flex:1,aspectRatio:1,borderWidth:0.5,borderColor:'#78634C',backgroundColor:ladder?'#244A37':snake?'#4A2630':'#2A2134',alignItems:'center',justifyContent:'center',padding:1}}><Text style={{color:ink,fontSize:8,fontWeight:'800'}}>{n}</Text>{ladder&&<Text style={{color:'#8FE0A8',fontSize:7}}>↑{ladder}</Text>}{snake&&<Text style={{color:'#FF9A9A',fontSize:7}}>↓{snake}</Text>}{occupants.length>0&&<Text style={{color:ink,fontSize:8}}>{occupants.map(x=>['🔴','🔵','🟢','🟡'][x.i]).join('')}</Text>}</View>;})}</View>;});
  return <><View style={{width:'100%',maxWidth:320,alignSelf:'center',borderWidth:1,borderColor:GOLD,padding:2,borderRadius:8}}>{boardRows}</View>{state.phase==='start_roll'?<><Text style={{color:ink}}>Everyone spins once. Highest number starts.</Text><Text style={{color:muted}}>{state.tiedStartPlayers.map(pid=>(state.players.find(p=>p.id===pid)?.name||'Player')+': '+(state.startingRolls[pid]??'—')).join(' · ')}</Text><Btn title="SPIN TO CHOOSE START PLAYER" onPress={()=>act({type:'start_roll'})}/></>:<><Text style={{color:ink}}>Position: {state.positions[userId]} / 100</Text><Btn title="SPIN 1–6" onPress={roll}/></>}</>;
 }
  if(state.name==='Ludo'){
  const markers={};
  state.players.forEach((pl,seat)=>state.tokens[pl.id].forEach((progress,i)=>{let coord=null;if(progress===-1)coord=LUDO_BASES[seat][i];else if(progress===57)coord=[7,7];else if(progress>=52)coord=LUDO_HOME_LANES[seat][progress-52];else if(progress>=0)coord=LUDO_PATH[(seat*13+progress)%52];if(coord){const key=coord.join(',');if(!markers[key])markers[key]=[];markers[key].push({seat,i});}}));
  const startCells=[0,13,26,39],homeCellMap={};LUDO_HOME_LANES.forEach((lane,seat)=>lane.forEach(([r,col])=>homeCellMap[r+','+col]=seat));
  const board=Array.from({length:15},(_,r)=><View key={'lrow'+r} style={{flexDirection:'row'}}>{Array.from({length:15},(_,col)=>{const key=r+','+col,pathIndex=LUDO_PATH.findIndex(([rr,cc])=>rr===r&&cc===col),homeSeat=homeCellMap[key],baseSeat=r<6&&col<6?0:r<6&&col>8?1:r>8&&col>8?2:r>8&&col<6?3:-1,baseToken=markers[key]||[],safe=state.safe.includes(pathIndex),startSeat=startCells.indexOf(pathIndex),bg=pathIndex>=0?(startSeat>=0?LUDO_COLORS[startSeat]:safe?'#55452D':'#2A2134'):homeSeat!==undefined?LUDO_COLORS[homeSeat]:baseSeat>=0?LUDO_COLORS[baseSeat]+'33':r===7&&col===7?'#7A5A2C':'#1B1524';return <View key={key} style={{flex:1,aspectRatio:1,borderWidth:0.35,borderColor:'#76647E',backgroundColor:bg,alignItems:'center',justifyContent:'center'}}>{baseToken.length>0?<Text style={{fontSize:8,color:baseToken.length?LUDO_COLORS[baseToken[0].seat]:ink}}>{baseToken.length>1?'●'+baseToken.length:'●'}</Text>:pathIndex>=0&&safe?<Text style={{fontSize:7,color:GOLD}}>✦</Text>:r===7&&col===7?<Text style={{fontSize:8,color:GOLD}}>★</Text>:null}</View>;})}</View>);
  return <><Text style={{color:ink}}>Roll a die, then choose one legal token. Safe squares are marked ✦.</Text><View style={{width:'100%',maxWidth:320,alignSelf:'center',borderWidth:1,borderColor:GOLD,borderRadius:8,padding:2}}>{board}</View><Text style={{color:muted}}>Your tokens: {(state.tokens[userId]||[]).map((v,i)=>'T'+(i+1)+': '+(v<0?'Base':v===57?'Home':v)).join(' · ')}</Text><Btn title={state.pendingDie?'DIE '+state.pendingDie+' · CHOOSE TOKEN':'ROLL DICE'} onPress={()=>act({type:'ludo_roll'})} disabled={!!state.pendingDie}/>{state.tokens[userId]?.map((v,i)=><Tile key={i} onPress={()=>act({type:'ludo_move',token:i})} disabled={!state.pendingDie||v===57||(v===-1&&state.pendingDie!==6)||(v>=0&&v+state.pendingDie>57)} active>{'TOKEN '+(i+1)+' · '+(v<0?'BASE':v===57?'HOME':v)}</Tile>)}</>;
 }
  if(state.name==='Carrom'){
  const board=state.carromBoard,scale=0.29,starts=state.mode===2?[{x:500,y:900},{x:500,y:100}]:[{x:500,y:900},{x:100,y:500},{x:500,y:100},{x:900,y:500}],striker=starts[(state.turn+(state.seatRotation||0))%state.mode],piecesLeft={white:9-(board.pocketed?.white||0),black:9-(board.pocketed?.black||0)};
  return <><Text style={{color:ink}}>Team colour: {state.teamColours[state.turn%2]} · Score {state.matchPoints.join(' – ')} · Game {state.gameNumber}/3 · Board {state.boardNumber}/8 · Games won {state.gamesWon.join(' – ')}</Text><Text style={{color:muted}}>White {piecesLeft.white} · Black {piecesLeft.black} · Queen {board.coins.find(x=>x.color==='queen')?.pocketed?'pocketed':'on board'}{state.queenPending?' · Cover pending':''}</Text><Text style={{color:GOLD}}>15-second stroke timer: {carromTurnSeconds}s</Text><View style={{width:290,height:290,alignSelf:'center',backgroundColor:'#D7B77F',borderWidth:7,borderColor:'#79502B',borderRadius:12,overflow:'hidden'}}><View style={{position:'absolute',left:105,top:105,width:66,height:66,borderRadius:40,borderWidth:1,borderColor:'#8C5C34'}}/><View style={{position:'absolute',left:138.5,top:138.5,width:13,height:13,borderRadius:8,borderWidth:1,backgroundColor:'#B33B45',borderColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:250,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:263,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:27,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:53,top:40,width:184,height:1,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:27,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:40,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:250,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/><View style={{position:'absolute',left:263,top:53,width:1,height:184,backgroundColor:'#8C5C34'}}/>{[[0,0],[272,0],[0,272],[272,272]].map((pos,i)=><View key={'p'+i} style={{position:'absolute',left:pos[0],top:pos[1],width:18,height:18,borderRadius:10,backgroundColor:'#241A17',borderWidth:1,borderColor:'#F2D6A3'}}/>)}{board.coins.filter(x=>!x.pocketed).map(piece=><View key={piece.id} style={{position:'absolute',left:piece.x*scale-5.5,top:piece.y*scale-5.5,width:11,height:11,borderRadius:7,backgroundColor:piece.color==='queen'?'#C93E4B':piece.color==='white'?'#F4E9D2':'#241C24',borderWidth:1,borderColor:piece.color==='white'?'#8C6B43':'#E6C477'}}/>)}{striker&&!striker.pocketed&&<View style={{position:'absolute',left:striker.x*scale-7,top:striker.y*scale-7,width:14,height:14,borderRadius:8,backgroundColor:'#E7D4B2',borderWidth:2,borderColor:'#7A4E2D'}}/>}</View>{state.gameComplete?<><Text style={{color:GOLD}}>Game {state.gameNumber} complete · Games won {state.gamesWon.join(' – ')}</Text><Btn title="NEXT GAME" onPress={()=>act({type:'carrom_next_game'})}/></>:state.boardComplete?<><Text style={{color:GOLD}}>Board {state.boardNumber} complete · Team {state.boardWinnerTeam+1} scored {state.boardPoints}</Text><Btn title="NEXT BOARD" onPress={()=>act({type:'carrom_next_board'})}/></>:<><Text style={{color:ink}}>Aim angle: {carromAngle}° · Power: {carromPower}</Text><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}><Btn small title="ANGLE −10°" onPress={()=>setCarromAngle(v=>Math.max(-90,v-10))}/><Btn small title="ANGLE +10°" onPress={()=>setCarromAngle(v=>Math.min(90,v+10))}/><Btn small title="POWER −2" onPress={()=>setCarromPower(v=>Math.max(4,v-2))}/><Btn small title="POWER +2" onPress={()=>setCarromPower(v=>Math.min(28,v+2))}/></View><Btn title="SHOOT" onPress={()=>act({type:'carrom_shot',angle:carromAngle,power:carromPower})}/></>}</>;
 }
 if(state.name==='UNO'){
  if(state.pendingOpeningWild)return <><Text style={{color:ink}}>Opening Wild: choose the starting colour.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{colors.map(color=><Btn key={'open'+color} title={color.toUpperCase()} onPress={()=>act({type:'uno_opening_color',color})}/>)}</View></>;
  if(state.pendingChallenge)return <><Text style={{color:GOLD}}>Wild Draw Four challenge</Text><Text style={{color:ink}}>The previous player played a Wild Draw Four. Their remaining hand is shown for your challenge decision.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{(state.pendingChallenge.challengeHand||[]).map(card=><Tile key={card.id}>{String(card.rank)} {card.color}</Tile>)}</View><Btn title="ACCEPT +4" onPress={()=>act({type:'uno_accept'})}/><Btn title="CHALLENGE +4" onPress={()=>act({type:'uno_challenge'})}/></>;
  return <><Text style={{color:ink}}>Top: {String(state.discard.at(-1)?.rank)} · Colour: {state.activeColor}</Text><Text style={{color:GOLD}}>Match points: {state.matchPoints?.[userId]||0}/500</Text><Text style={{color:ink}}>Choose wild colour before playing:</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{colors.map(color=><Btn key={color} small title={color.toUpperCase()} onPress={()=>setUnoColor(color)}/>)}</View><Text style={{color:muted}}>Selected: {unoColor}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>{act({type:'uno_play',cardId:card.id,wildColor:unoColor,uno:currentHand.length===2&&unoCallSelected});setUnoCallSelected(false);}} disabled={state.drawnCard&&state.drawnCard!==card.id}>{String(card.rank)} {card.color==='wild'?'★':card.color}</Tile>)}</View>{state.drawnCard&&<Btn title="PASS AFTER DRAW" onPress={()=>act({type:'uno_pass_drawn'})}/>}<Btn title="DRAW ONE" onPress={()=>act({type:'uno_draw'})} disabled={!!state.drawnCard}/>{currentHand.length===2&&<Btn title={unoCallSelected?'UNO CALL: ON':'UNO CALL: OFF'} onPress={()=>setUnoCallSelected(v=>!v)}/>}</>;
 }

  if(state.name==='29')return <><Text style={{color:ink}}>Phase: {state.phase} · Trump: {state.trumpHidden?'Hidden':state.trump||'—'} · Tricks: {state.tricks.length}/8</Text><Text style={{color:ink}}>Team points: {state.teamPoints.join(' – ')} · Match: {state.matchScore.join(' – ')}</Text>{state.phase==='bidding'&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{(state.forcedDealerBid?[16]:[16,17,18,19,20,21,22,23,24,25,26,27,28].filter(v=>v>state.highBid)).map(v=><Btn key={v} title={'BID '+v} small onPress={()=>act({type:'29_bid',bid:v})}/>)}{!state.forcedDealerBid&&<Btn title="PASS" onPress={()=>act({type:'29_bid',pass:true})}/>}</View>}{state.phase==='deal2'&&state.contract?.player===userId&&<View style={{flexDirection:'row',flexWrap:'wrap'}}>{suits.map(s=><Btn key={s} title={'SELECT '+s} onPress={()=>act({type:'29_trump',suit:s})}/>)}</View>}{state.phase==='play'&&<><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(c=><Tile key={c.id} onPress={()=>act({type:'trick_card',cardId:c.id})}>{cardLabel(c)}</Tile>)}</View>{state.trumpHidden&&state.currentTrick.length>0&&!currentHand.some(x=>x.suit===state.currentTrick[0].card.suit)&&<Btn title="REVEAL TRUMP" onPress={()=>act({type:'29_reveal_trump'})}/>}</>}</>;if(state.name==='Playcards – Breez')return <><Text style={{color:ink}}>Board {state.boardNumber} · {state.phase==='auction'?'Auction':state.contract?.level+state.contract?.suit+' · '+state.contract?.multiplier+'×'} · Tricks {state.tricks.length}/13</Text>{state.phase==='auction'&&<><Text style={{color:muted}}>Highest bid: {state.lastBid?state.lastBid.level+state.lastBid.suit:'None'} · Passes: {state.passCount}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{Array.from({length:7},(_,i)=>i+1).flatMap(level=>bridgeStrains.map(strain=><Btn key={level+strain} small title={level+strain} onPress={()=>act({type:'bridge_bid',level,suit:strain})}/>))}</View><View style={{flexDirection:'row'}}><Btn title="PASS" onPress={()=>act({type:'bridge_bid',pass:true})}/>{state.lastBid&&<Btn title="DOUBLE" onPress={()=>act({type:'bridge_bid',double:true})}/>}{state.multiplier===2&&<Btn title="REDOUBLE" onPress={()=>act({type:'bridge_bid',redouble:true})}/>}</View></>}{state.phase==='play'&&<><Text style={{color:ink}}>Contract: {state.contract.level}{state.contract.suit} · Declarer: {state.players.find(p=>p.id===state.declarer)?.name} · Dummy: {state.dummyRevealed?state.players.find(p=>p.id===state.dummy)?.name:'Hidden'}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>act({type:'trick_card',cardId:card.id})}>{cardLabel(card)}</Tile>)}</View>{state.dummyRevealed&&<Text style={{color:muted}}>Dummy's hand is exposed.</Text>}</>}</>;
  if(state.name==='Jackaroo'){
  const chosen=currentHand.find(x=>x.id===jackarooCardId),seat=state.players.findIndex(p=>p.id===userId),partner=state.players[(seat+2)%4],owners=[userId,...(state.marbles[userId]?.every(v=>v>=52)?[partner?.id].filter(Boolean):[])],rows=owners.flatMap(owner=>state.marbles[owner].map((v,i)=>({owner,marble:i,progress:v}))),track=rows.filter(m=>m.progress>=0&&m.progress<52),movable=rows.filter(m=>m.progress>=0&&m.progress<=55),allTrack=state.players.flatMap(pl=>state.marbles[pl.id].map((v,i)=>({owner:pl.id,marble:i,progress:v}))).filter(m=>m.progress>0&&m.progress<52),markers={};if(state.pendingDiscard){const pd=state.pendingDiscard;if(pd.chooser==='attacker'&&pd.by===userId){const count=Math.max(0,Number(state.handCounts?.[pd.target]||0));return <><Text style={{color:GOLD}}>Choose one hidden card from the next player to discard.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{Array.from({length:count},(_,i)=><Btn key={'hidden'+i} title={'CARD BACK '+(i+1)} onPress={()=>act({type:'jackaroo_discard',index:i})}/>)}</View></>;}if(pd.chooser==='target'&&pd.target===userId){return <><Text style={{color:GOLD}}>Discard one card before taking your turn.</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} onPress={()=>act({type:'jackaroo_discard',cardId:card.id})}>{card.rank}{card.suit}</Tile>)}</View></>;}return <Text style={{color:ink}}>Waiting for the required discard.</Text>;}state.players.forEach((pl,pi)=>state.marbles[pl.id].forEach((progress,i)=>{const coord=progress<0?JACKAROO_BASES[pi][i]:progress>=52?JACKAROO_SAFETY[pi][progress-52]:JACKAROO_PATH[(pi*13+progress)%52],key=coord.join(',');if(!markers[key])markers[key]=[];markers[key].push(pi);}));const boardRows=Array.from({length:14},(_,r)=><View key={'jrow'+r} style={{flexDirection:'row'}}>{Array.from({length:14},(_,col)=>{const key=r+','+col,pathIndex=JACKAROO_PATH.findIndex(([rr,cc])=>rr===r&&cc===col),startSeat=[0,13,26,39].indexOf(pathIndex),safeSeat=JACKAROO_SAFETY.findIndex(lane=>lane.some(([rr,cc])=>rr===r&&cc===col)),baseSeat=r<6&&col<6?0:r<6&&col>7?1:r>7&&col>7?2:r>7&&col<6?3:-1,bg=pathIndex>=0?(startSeat>=0?JACKAROO_COLORS[startSeat]:'#30283A'):safeSeat>=0?JACKAROO_COLORS[safeSeat]:baseSeat>=0?JACKAROO_COLORS[baseSeat]+'33':r>=5&&r<=8&&col>=5&&col<=8?'#21172C':'#181321';return <View key={key} style={{flex:1,aspectRatio:1,borderWidth:0.35,borderColor:'#75617C',backgroundColor:bg,alignItems:'center',justifyContent:'center'}}>{markers[key]?.length?<Text style={{fontSize:8,color:JACKAROO_COLORS[markers[key][0]]}}>●{markers[key].length>1?markers[key].length:''}</Text>:startSeat>=0?<Text style={{fontSize:7,color:'#FFF0CC'}}>◆</Text>:safeSeat>=0?<Text style={{fontSize:7,color:'#FFF0CC'}}>◇</Text>:r===6&&col===6?<Text style={{fontSize:7,color:'#E8C477'}}>FIRE</Text>:null}</View>;})}</View>);
  const play=(owner,marble,steps,extra={})=>act({type:'jackaroo_play',cardId:chosen.id,ownerId:owner,marble,steps,...extra});
  return <><Text style={{color:ink}}>Clockwise · Partners sit opposite · Deal {state.handRound}/3</Text><View style={{width:'100%',maxWidth:280,alignSelf:'center',borderWidth:1,borderColor:GOLD,borderRadius:8,padding:2}}>{boardRows}</View><Text style={{color:muted}}>{state.players.map(p=>p.name+': '+state.marbles[p.id].map(v=>v<0?'H':v>=52?'S'+(v-51):String(v)).join(',')).join('  |  ')}</Text><View style={{flexDirection:'row',flexWrap:'wrap'}}>{currentHand.map(card=><Tile key={card.id} active={jackarooCardId===card.id} onPress={()=>{setJackarooCardId(card.id);setJackarooSource(null);setJackarooFirst(null);setJackarooSecond(null);setJackarooSplit(3);}}>{card.rank}{card.suit}</Tile>)}</View>{chosen&&<><Text style={{color:GOLD}}>Selected {chosen.rank}{chosen.suit}</Text>{(chosen.rank==='A'||chosen.rank==='K')&&rows.filter(m=>m.progress===-1).map(m=><Btn key={'e'+m.owner+m.marble} small title={'ENTER '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,0,{enter:true})}/>)}{chosen.rank==='J'&&<><Text style={{color:ink}}>Choose source marble, then target marble:</Text>{track.filter(m=>m.progress>0).map(m=><Btn key={'s'+m.owner+m.marble} small title={'SOURCE '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooSource({ownerId:m.owner,marble:m.marble})}/>)}{jackarooSource&&state.players.filter(p=>p.id!==jackarooSource.ownerId).flatMap(p=>state.marbles[p.id].map((v,i)=>({owner:p.id,marble:i,progress:v}))).filter(m=>m.progress>0&&m.progress<52).map(m=><Btn key={'t'+m.owner+m.marble} small title={'SWAP '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,source:jackarooSource,target:{ownerId:m.owner,marble:m.marble}})}/>)}</>}{chosen.rank==='7'&&<><Text style={{color:ink}}>Move 7 on one marble:</Text>{movable.map(m=><Btn key={'7'+m.owner+m.marble} small title={m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,7)}/>)}<Text style={{color:ink}}>Split 7 across two marbles:</Text>{movable.map(m=><Btn key={'a'+m.owner+m.marble} small title={'FIRST '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooFirst({ownerId:m.owner,marble:m.marble})}/>)}{jackarooFirst&&movable.filter(m=>m.owner!==jackarooFirst.ownerId||m.marble!==jackarooFirst.marble).map(m=><Btn key={'b'+m.owner+m.marble} small title={'SECOND '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>setJackarooSecond({ownerId:m.owner,marble:m.marble})}/>)}{jackarooFirst&&jackarooSecond&&<><View style={{flexDirection:'row',flexWrap:'wrap'}}>{[1,2,3,4,5,6].map(n=><Btn key={'split'+n} small title={n+' + '+(7-n)} onPress={()=>setJackarooSplit(n)}/>)}</View><Btn title={'PLAY SPLIT '+jackarooSplit+' + '+(7-jackarooSplit)} onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,moves:[{...jackarooFirst,steps:jackarooSplit},{...jackarooSecond,steps:7-jackarooSplit}]})}/></>}}</>}{chosen.rank==='Q'&&isRed(chosen.suit)&&(state.handCounts?.[state.players[(seat+1)%4]?.id]||0)>0&&<Btn title="DISCARD NEXT PLAYER'S CARD" onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,effect:'burn'})}/>}{chosen.rank==='10'&&(state.handCounts?.[state.players[(seat+1)%4]?.id]||0)>0&&<Btn title="FORCE NEXT PLAYER TO DISCARD" onPress={()=>act({type:'jackaroo_play',cardId:chosen.id,effect:'burn'})}/> }{chosen.rank==='5'&&state.players.flatMap(p=>state.marbles[p.id].map((v,i)=>({owner:p.id,marble:i,progress:v}))).filter(m=>m.progress>0&&m.progress<=55).map(m=><Btn key={'5'+m.owner+m.marble} small title={'MOVE 5 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,5,{targetOwnerId:m.owner})}/>)}{chosen.rank!=='J'&&chosen.rank!=='7'&&chosen.rank!=='5'&&!(chosen.rank==='Q'&&isRed(chosen.suit))&&!(chosen.rank==='10'&&true)&&movable.map(m=>{const steps=chosen.rank==='A'?1:chosen.rank==='K'?13:chosen.rank==='Q'?12:chosen.rank==='4'?-4:Number(chosen.rank);return <Btn key={'m'+m.owner+m.marble} small title={'MOVE '+steps+' '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,steps)}/>;})}{chosen.rank==='A'&&movable.map(m=><Btn key={'11'+m.owner+m.marble} small title={'MOVE 11 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,11)}/>)}{chosen.rank==='K'&&movable.map(m=><Btn key={'13'+m.owner+m.marble} small title={'MOVE 13 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,13)}/>)}{chosen.rank==='10'&&movable.map(m=><Btn key={'10'+m.owner+m.marble} small title={'MOVE 10 '+m.owner.slice(0,5)+' M'+(m.marble+1)} onPress={()=>play(m.owner,m.marble,10,{effect:'move'})}/> )}</>}{!jackarooHasLegalMove(state,userId)&&currentHand.length>0&&<Btn title="BURN ONE CARD (NO LEGAL MOVE)" onPress={()=>act({type:'jackaroo_burn',cardId:currentHand[0].id})}/>}</>};
  return null;
 };
 return <><Modal visible={visible&&!minimized} transparent animationType="fade" onRequestClose={close}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.82)',justifyContent:'center',padding:12}}><View style={{maxHeight:'94%',backgroundColor:'#0D0B14',borderColor:GOLD,borderWidth:2,borderRadius:24,padding:14,shadowColor:GOLD,shadowOffset:{width:0,height:0},shadowOpacity:0.34,shadowRadius:16,elevation:18}}>
  {stage==='select'&&<ScrollView><View style={{flexDirection:'row',flexWrap:'wrap'}}>{GAMES.map(g=>{const held=['Truth and Dare','Brainstorm'].includes(g.name);return <TouchableOpacity key={g.name} onPress={()=>choose(g)} style={{width:'25%',padding:4,alignItems:'center',opacity:held?0.72:1}}><View style={{width:62,height:62,borderRadius:14,backgroundColor:'#2A1D32',borderWidth:1,borderColor:held?'#766A59':GOLD,alignItems:'center',justifyContent:'center'}}><RoyalGameArtwork art={g.art}/></View><Text style={{color:held?muted:ink,fontSize:10,textAlign:'center'}}>{g.name}</Text></TouchableOpacity>;})}</View>{status? <Text style={{color:muted,textAlign:'center',padding:10}}>{status}</Text>:null}</ScrollView>}
  {stage==='setup'&&<ScrollView contentContainerStyle={{paddingBottom:4}}><View style={{alignItems:'center',paddingVertical:12}}><RoyalGameArtwork art={selected.art}/><Text style={{color:GOLD,fontSize:19,textAlign:'center',fontWeight:'900',marginTop:7}}>{selected.name}</Text></View>{selected.name==='Carrom'&&<View style={{marginBottom:12}}><View style={{flexDirection:'row',justifyContent:'center'}}><Btn title="1V1" onPress={()=>setMode(2)}/><Btn title="2V2" onPress={()=>setMode(4)}/></View></View>}{selected.name==='29'&&<Text style={{color:GOLD,textAlign:'center',marginBottom:12,fontWeight:'900'}}>2V2</Text>}<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,marginHorizontal:12}}><Text style={{color:GOLD,fontSize:13,fontWeight:'900'}}>Bet</Text><TouchableOpacity onPress={()=>setBet(BET_OPTIONS[Math.max(0,BET_OPTIONS.indexOf(bet)-1)])} accessibilityLabel="Decrease bet" style={{width:46,height:46,borderRadius:12,borderWidth:1.5,borderColor:GOLD,backgroundColor:'#21182B',alignItems:'center',justifyContent:'center'}}><Text style={{color:GOLD,fontSize:26,fontWeight:'700'}}>−</Text></TouchableOpacity><View style={{flex:1,minHeight:46,borderRadius:12,borderWidth:1.5,borderColor:GOLD,backgroundColor:'#21182B',alignItems:'center',justifyContent:'center',paddingHorizontal:8}}><Text numberOfLines={1} adjustsFontSizeToFit style={{color:ink,fontSize:19,fontWeight:'900'}}>{bet===0?'FREE':formatGoodCoins(bet)}</Text></View><TouchableOpacity onPress={()=>setBet(BET_OPTIONS[Math.min(BET_OPTIONS.length-1,Math.max(0,BET_OPTIONS.indexOf(bet))+1)])} accessibilityLabel="Increase bet" style={{width:46,height:46,borderRadius:12,borderWidth:1.5,borderColor:GOLD,backgroundColor:'#21182B',alignItems:'center',justifyContent:'center'}}><Text style={{color:GOLD,fontSize:26,fontWeight:'700'}}>+</Text></TouchableOpacity></View>{status?<Text style={{color:muted,textAlign:'center',marginTop:8}}>{status}</Text>:null}<View style={{marginTop:16}}><Btn title="CREATE" onPress={create}/></View></ScrollView>}
  {stage==='lobby'&&<ScrollView><Text style={{color:GOLD,fontSize:18,textAlign:'center',fontWeight:'900'}}>{selected?.name} Lobby</Text><Text style={{color:ink,textAlign:'center',marginTop:3,fontSize:11}}>{players.length}/{max===Infinity?'∞':max} players</Text><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:7,marginBottom:7}}><Text style={{color:GOLD,fontSize:10,fontWeight:'900'}}>BET · {formatGoodCoins(bet)} COINS</Text>{selected?.timed&&<Text style={{color:GOLD,fontSize:12,fontWeight:'900',fontVariant:['tabular-nums']}}>{players.length>=timerMin?String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'):'--:--'}</Text>}</View>{(selected?.name==='Carrom'||selected?.name==='29')&&<Text style={{color:muted,textAlign:'center',fontSize:9,marginBottom:6}}>{selected.name==='29'?'2 VS 2':mode===2?'1 VS 1':'2 VS 2'}</Text>}{(()=>{const isTeamGame=selected?.name==='Carrom'||selected?.name==='29';const teamSize=selected?.name==='29'?2:mode===4?2:1;const seatCount=isTeamGame?teamSize*2:(max===Infinity?Math.max(4,players.length):max);const renderSeat=(index)=>{const player=players[index];const card=player?playerCard(player):null;return <View key={'seat-'+index} style={{flex:1,minWidth:0,alignItems:'center',justifyContent:'center',paddingVertical:7,paddingHorizontal:2,borderRadius:10,borderWidth:1,borderColor:player&&player.id===hostIdRef.current?GOLD:'#51415B',backgroundColor:'#251B31'}}><View style={{width:34,height:34,borderRadius:17,overflow:'hidden',backgroundColor:'#49364F',borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center',marginBottom:4}}>{card?.avatarUrl?<Image source={{uri:card.avatarUrl}} style={{width:34,height:34}}/>:<Text style={{color:GOLD,fontWeight:'900',fontSize:14}}>{card?String(card.name||'P').trim().slice(0,1).toUpperCase():'+'}</Text>}</View><Text numberOfLines={1} style={{color:card?ink:muted,fontSize:9,fontWeight:'800',textAlign:'center',width:'100%'}}>{card?.name||'Empty'}</Text></View>;};return isTeamGame?<View style={{flexDirection:'row',alignItems:'stretch',gap:3,marginTop:3,marginBottom:7}}>{Array.from({length:teamSize},(_,i)=>renderSeat(i))}<View style={{justifyContent:'center',alignItems:'center',paddingHorizontal:2}}><Text style={{color:GOLD,fontSize:11,fontWeight:'900'}}>VS</Text></View>{Array.from({length:teamSize},(_,i)=>renderSeat(teamSize+i))}</View>:<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{flexDirection:'row',gap:5,marginTop:3,marginBottom:7}}>{Array.from({length:seatCount},(_,i)=><View key={'seat-wrap-'+i} style={{width:64}}>{renderSeat(i)}</View>)}</ScrollView>;})()}<Text style={{color:muted,textAlign:'center',fontSize:10,marginTop:2,marginBottom:5}}>{status}</Text>{hostRef.current&&inLobby?<Btn title="CLOSE GAME" onPress={()=>reset(true)}/>:inLobby?<Btn title="QUIT GAME" onPress={quitGame}/>:<Btn title="JOIN GAME" onPress={join} disabled={!canJoin||players.length>=max||(selected?.timed&&seconds<=0&&players.length>=min)}/>}</ScrollView>}
  {stage==='play'&&<ScrollView showsVerticalScrollIndicator={false}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:8,paddingBottom:7,borderBottomWidth:1,borderBottomColor:'#594632'}}>
    <View style={{flex:1}}><Text style={{color:GOLD,fontSize:18,fontWeight:'900'}}>{selected?.name}</Text><Text style={{color:muted,fontSize:9,letterSpacing:1}}>TALKZY GAME ARENA</Text></View>
    <View style={{flexDirection:'row',alignItems:'center',gap:9}}>
     <TouchableOpacity onPress={()=>setRulesVisible(true)} accessibilityLabel="Game rules" style={{width:26,height:26,borderRadius:13,borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center'}}><Text style={{color:GOLD,fontWeight:'900',fontSize:13}}>?</Text></TouchableOpacity>
     <TouchableOpacity onPress={toggleGameSound} accessibilityLabel={soundMuted?'Turn game sound on':'Turn game sound off'} style={{paddingHorizontal:3,paddingVertical:3}}><Text style={{fontSize:18}}>{soundMuted?'SOUND OFF':'SOUND ON'}</Text></TouchableOpacity>
     {canMinimize&&<TouchableOpacity onPress={()=>{setMinimized(true);minimizedRef.current=true;}} accessibilityLabel="Minimize game panel" style={{width:26,height:26,borderRadius:13,borderWidth:1,borderColor:'#806C52',alignItems:'center',justifyContent:'center'}}><Text style={{color:GOLD,fontSize:17,fontWeight:'900'}}>×</Text></TouchableOpacity>}
    </View>
   </View>
   <View style={{backgroundColor:'#21182B',padding:9,borderRadius:12,marginBottom:8}}>
    <Text style={{color:GOLD,fontSize:10,fontWeight:'900',letterSpacing:1,marginBottom:4}}>LIVE GAME STATUS</Text>
    <Text style={{color:ink,textAlign:'center',fontWeight:'800'}}>Turn: {current?.name||'—'}</Text>
    <Text style={{color:muted,textAlign:'center',fontSize:11,marginTop:3}}>{state.status}</Text>
    {!isMyTurn&&<Text style={{color:muted,textAlign:'center',fontSize:10,marginTop:4}}>Waiting for {current?.name||'player'}.</Text>}
   </View>
   <View style={{backgroundColor:'#21182B',padding:10,borderRadius:12,borderWidth:1,borderColor:'#4B3A54'}}>
    <View pointerEvents={isMyTurn?'auto':'none'} style={{opacity:isMyTurn?1:0.78}}>{renderControls()}</View>
    {state.name==='UNO'&&state.pendingUno===userId&&<Btn title="CALL UNO NOW" onPress={()=>act({type:'uno_call'})}/>}
    {state.name==='UNO'&&state.pendingUno&&state.pendingUno!==userId&&<Btn title="CATCH MISSED UNO (+2)" onPress={()=>act({type:'uno_catch'})}/>}
   </View>
   <View style={{marginTop:10,marginBottom:4}}>
    <Text style={{color:GOLD,fontSize:8,fontWeight:'900',letterSpacing:0.7,marginBottom:4}}>SCORES</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:4,paddingBottom:2}}>
     {gameResults(state).map(row=><View key={row.id} style={{width:72,backgroundColor:row.id===current?.id?'#3B2C22':'#251B31',borderWidth:1,borderColor:row.id===current?.id?GOLD:'#51415B',borderRadius:8,padding:4,alignItems:'center'}}>
      <View style={{width:20,height:20,borderRadius:10,backgroundColor:'#49364F',borderWidth:1,borderColor:GOLD,alignItems:'center',justifyContent:'center',marginBottom:2}}><Text style={{color:GOLD,fontWeight:'900',fontSize:7}}>{String(row.name||'P').trim().split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase()}</Text></View>
      <Text numberOfLines={1} style={{color:ink,fontSize:8,fontWeight:'700',maxWidth:66}}>{row.name}{row.id===userId?' (You)':''}</Text>
      <Text style={{color:GOLD,fontSize:10,fontWeight:'900',marginTop:1}}>{row.score}</Text>
      <Text style={{color:muted,fontSize:7}}>#{row.rank}</Text>
     </View>)}
    </ScrollView>
   </View>
   {state.winner&&<Btn title="VIEW RESULT" onPress={()=>setStage('result')}/>}
  </ScrollView>}
  {stage==='result'&&<View style={{maxHeight:520}}>
   <Text style={{color:GOLD,fontSize:20,textAlign:'center',fontWeight:'900'}}>GAME RESULTS</Text>
   <Text style={{color:muted,textAlign:'center',fontSize:11,marginTop:4,marginBottom:12}}>{state?.name||selected?.name} · Final rankings</Text>
   <ScrollView style={{maxHeight:390}} showsVerticalScrollIndicator>
    {gameResults(state).map(row=><View key={row.id} style={{flexDirection:'row',alignItems:'center',backgroundColor:row.isWinner||row.id===state?.winner?'#3B2C22':'#251B31',borderColor:row.isWinner||row.id===state?.winner?GOLD:'#51415B',borderWidth:1,borderRadius:12,paddingVertical:11,paddingHorizontal:12,marginBottom:8}}>
     <View style={{width:38,height:38,borderRadius:19,backgroundColor:row.rank===1?'#76572B':'#382B43',borderWidth:1,borderColor:row.rank===1?GOLD:'#66536F',alignItems:'center',justifyContent:'center',marginRight:11}}>
      <Text style={{color:row.rank===1?GOLD:ink,fontWeight:'900',fontSize:15}}>#{row.rank}</Text>
     </View>
     <View style={{flex:1}}>
      <Text numberOfLines={1} style={{color:ink,fontWeight:'900',fontSize:13}}>{row.name}{row.id===userId?' (You)':''}</Text>
      {(row.isWinner||row.id===state?.winner)&&<Text style={{color:GOLD,fontSize:10,fontWeight:'900',marginTop:2}}>{['Carrom','Playcards – Breez','Jackaroo'].includes(state?.name)?'WINNING TEAM':'WINNER'}</Text>}
     </View>
     <View style={{alignItems:'flex-end',marginLeft:8}}>
      <Text style={{color:GOLD,fontWeight:'900',fontSize:17}}>{row.score}</Text>
      <Text style={{color:muted,fontSize:9}}>{row.detail}</Text>
     </View>
    </View>)}
   </ScrollView>
   {state?.name==='UNO'&&state?.winner&&!state?.matchWinner&&hostRef.current&&<Btn title="NEXT ROUND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'uno_next_round'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}{state?.name==='29'&&state?.winner&&state?.matchWinner===null&&hostRef.current&&<Btn title="NEXT HAND" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'29_next_hand'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}<>{state?.name==='Playcards – Breez'&&state?.winner&&hostRef.current&&<Btn title="NEXT DEAL" onPress={()=>{const next=applyMove(state,state.players[state.turn]?.id,{type:'bridge_next_deal'});stateRef.current=next;setState(next);setStage('play');sendGameSnapshots(next);}}/>}<Btn title="BACK TO GAMES" onPress={reset}/></>
  </View>}
 </View></View></Modal><Modal visible={rulesVisible} transparent animationType="fade" onRequestClose={()=>setRulesVisible(false)}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.84)',justifyContent:'center',padding:18}}><View style={{maxHeight:'82%',backgroundColor:'#0D0B14',borderColor:GOLD,borderWidth:2,borderRadius:22,padding:15,shadowColor:GOLD,shadowOffset:{width:0,height:0},shadowOpacity:0.34,shadowRadius:16,elevation:18}}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><View style={{flex:1}}><Text style={{color:GOLD,fontSize:18,fontWeight:'900'}}>{selected?.name||'Game'} Rules</Text><Text style={{color:muted,fontSize:10}}>OFFICIAL RULES USED IN TALKZY</Text></View><TouchableOpacity onPress={()=>setRulesVisible(false)} style={{padding:5}}><Text style={{color:GOLD,fontSize:22}}>✕</Text></TouchableOpacity></View><ScrollView showsVerticalScrollIndicator><Text style={{color:ink,fontSize:12,lineHeight:19,marginBottom:12}}>{selected?.rules}</Text>{(GAME_RULE_SECTIONS[selected?.name]||[]).map((section,index)=><View key={section.title} style={{marginBottom:13}}><Text style={{color:GOLD,fontSize:13,fontWeight:'900',marginBottom:4}}>{index+1}. {section.title}</Text><Text style={{color:ink,fontSize:12,lineHeight:19}}>{section.body}</Text></View>)}</ScrollView><TouchableOpacity onPress={()=>setRulesVisible(false)} style={{backgroundColor:'#3B2C22',borderWidth:1,borderColor:GOLD,borderRadius:10,padding:11,alignItems:'center',marginTop:10}}><Text style={{color:GOLD,fontWeight:'900'}}>GOT IT</Text></TouchableOpacity></View></View></Modal>{minimized&&canMinimize&&<TouchableOpacity onPress={reopenGame} style={{position:'absolute',right:16,bottom:112,zIndex:999,elevation:20,backgroundColor:'#24152F',borderColor:GOLD,borderWidth:1.5,borderRadius:24,paddingHorizontal:16,paddingVertical:11}}><Text style={{color:GOLD,fontWeight:'900'}}>OPEN GAME</Text></TouchableOpacity>}</>;
}
