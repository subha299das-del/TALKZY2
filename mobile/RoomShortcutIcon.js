import React from 'react';
import { View, Text } from 'react-native';

const ART = {
  music: { mark: '♫', accent: '#E8C56F', glow: '#76521D' },
  youtube: { mark: '▶', accent: '#F0CE79', glow: '#8A3028' },
  effects: { mark: '✧', accent: '#F0D28B', glow: '#8B672D' },
  propStore: { mark: '▱', accent: '#E9C66F', glow: '#77521F' },
  dice: { mark: '⚄', accent: '#F1D58D', glow: '#8A672B' },
  luckyNo: { mark: '777', accent: '#F5D987', glow: '#946B27' },
  luckyBag: { mark: '♧', accent: '#F0CE79', glow: '#8A6427' },
  activity: { mark: '✦', accent: '#F5D98C', glow: '#A27B35' },
  theme: { mark: '◉', accent: '#F2D38A', glow: '#805A29' },
  clearChat: { mark: '', accent: '#F0CE79', glow: '#8A6427' },
};

export default function RoomShortcutIcon({ type, size = 54 }) {
  const art = ART[type] || ART.activity;
  const isNumber = type === 'luckyNo';
  const isMusic = type === 'music';
  const isYoutube = type === 'youtube';
  if (type === 'clearChat') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: size * .91, height: size * .91, borderRadius: size * .25, backgroundColor: '#21180D', borderWidth: 1.2, borderColor: art.accent, shadowColor: art.glow, shadowOpacity: .75, shadowRadius: 7, elevation: 5 }} />
        <View style={{ width: size * .57, height: size * .43, borderRadius: size * .13, borderWidth: 2.2, borderColor: '#F5D98C', backgroundColor: '#3A2A16', alignItems: 'center', justifyContent: 'center', marginLeft: -size * .04, marginTop: size * .04 }}>
          <View style={{ width: size * .28, height: 2, backgroundColor: '#E8C56F', marginTop: -size * .08, borderRadius: 2 }} />
          <View style={{ position: 'absolute', bottom: -size * .065, left: size * .10, width: size * .14, height: size * .14, backgroundColor: '#3A2A16', borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#F5D98C', transform: [{ rotate: '-25deg' }] }} />
        </View>
        <View style={{ position: 'absolute', width: size * .075, height: size * .48, borderRadius: size * .04, backgroundColor: '#F3D58A', borderWidth: 1, borderColor: '#FFF0BC', transform: [{ rotate: '42deg' }], top: size * .10, right: size * .25 }} />
        <View style={{ position: 'absolute', width: size * .22, height: size * .13, borderRadius: size * .035, backgroundColor: '#C58B3A', borderWidth: 1, borderColor: '#FFE4A0', transform: [{ rotate: '42deg' }], top: size * .49, right: size * .12 }} />
        <View style={{ position: 'absolute', width: size * .07, height: size * .07, borderRadius: size, backgroundColor: '#FFF0B4', top: size * .16, left: size * .19 }} />
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * .91, height: size * .91, borderRadius: size * .25, backgroundColor: '#21180D', borderWidth: 1.2, borderColor: art.accent, shadowColor: art.glow, shadowOpacity: .75, shadowRadius: 7, elevation: 5 }} />
      <View style={{ position: 'absolute', width: size * .76, height: size * .76, borderRadius: size * .21, borderWidth: 1, borderColor: '#72572E', backgroundColor: '#100D09' }} />
      <Text style={{ color: art.accent, fontSize: isNumber ? size * .31 : size * .58, lineHeight: size * .69, fontWeight: '900', textAlign: 'center', textShadowColor: art.glow, textShadowRadius: 7 }}>
        {isMusic ? '♫' : isYoutube ? '▶' : art.mark}
      </Text>
      {isNumber && <Text style={{ position: 'absolute', bottom: size * .12, color: '#FFF0BC', fontSize: size * .12, fontWeight: '900', letterSpacing: 1 }}>LUCKY</Text>}
      {type === 'effects' && <Text style={{ position: 'absolute', top: size * .08, right: size * .13, color: '#FFF1C4', fontSize: size * .2 }}>✦</Text>}
      {type === 'activity' && <View style={{ position: 'absolute', width: size * .13, height: size * .13, borderRadius: size, backgroundColor: '#FFF0B4', top: size * .15, right: size * .18 }} />}
      {type === 'theme' && <Text style={{ position: 'absolute', bottom: size * .04, right: size * .12, color: '#E9A7A1', fontSize: size * .18 }}>●</Text>}
      {type === 'propStore' && <Text style={{ position: 'absolute', bottom: size * .02, color: '#F5E2AE', fontSize: size * .15, fontWeight: '900' }}>✦</Text>}
      {type === 'luckyBag' && <Text style={{ position: 'absolute', top: size * .08, color: '#FFF0B4', fontSize: size * .17 }}>✦</Text>}
      {type === 'dice' && <Text style={{ position: 'absolute', bottom: size * .03, right: size * .12, color: '#FFF0B4', fontSize: size * .17 }}>•</Text>}
    </View>
  );
}
