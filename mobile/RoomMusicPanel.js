import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';

export default function RoomMusicPanel({ visible, roomId, userId, api, supabase, colors, onClose }) {
  const [minimized, setMinimized] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [streams, setStreams] = useState([]);
  const playerRef = useRef(null);
  const localPathRef = useRef(null);
  const remotePlayersRef = useRef({});
  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const repeatRef = useRef('off');
  const shuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const playingRef = useRef(false);
  const lastWriteRef = useRef(0);
  const syncBusyRef = useRef(false);
  const endHandlerRef = useRef(null);

  const applyState = state => {
    if (!state) return;
    const nextQueue = state.queue || [];
    queueRef.current = nextQueue;
    indexRef.current = Number(state.current_index || 0);
    repeatRef.current = state.repeat_mode || 'off';
    shuffleRef.current = !!state.shuffle;
    volumeRef.current = Number(state.volume ?? 0.8);
    playingRef.current = !!state.is_playing;
    setQueue(nextQueue);
    setCurrentIndex(indexRef.current);
    setRepeatMode(repeatRef.current);
    setShuffle(shuffleRef.current);
    setVolume(volumeRef.current);
    setPlaying(playingRef.current);
  };

  const saveState = async (next = {}) => {
    if (!roomId) return null;
    const list = Array.isArray(next.queue) ? next.queue : queueRef.current;
    const result = await api(`/api/rooms/${roomId}/music/me`, {
      method: 'PUT',
      body: JSON.stringify({
        queue: list.map(item => ({ object_path: item.object_path, title: item.title })),
        current_index: Number(next.current_index ?? indexRef.current),
        is_playing: Boolean(next.is_playing ?? playingRef.current),
        current_time_seconds: Math.max(0, Number(next.current_time_seconds ?? currentTime ?? 0)),
        repeat_mode: next.repeat_mode ?? repeatRef.current,
        shuffle: next.shuffle ?? shuffleRef.current,
        volume: next.volume ?? volumeRef.current
      })
    });
    applyState(result.state);
    lastWriteRef.current = Date.now();
    return result.state;
  };

  const playAt = async (index, restart = true) => {
    const item = queueRef.current[index];
    if (!item?.url) return;
    try {
      const player = playerRef.current || createAudioPlayer(null, { updateInterval: 500 });
      if (!playerRef.current) {
        playerRef.current = player;
        player.addListener('playbackStatusUpdate', status => {
          if (status?.didJustFinish) endHandlerRef.current?.();
        });
      }
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: true });
      if (localPathRef.current !== item.object_path) {
        player.replace(item.url);
        localPathRef.current = item.object_path;
      }
      if (restart) await player.seekTo(0);
      player.volume = volumeRef.current;
      player.play();
      indexRef.current = index;
      playingRef.current = true;
      setCurrentIndex(index);
      setPlaying(true);
      setCurrentTime(restart ? 0 : Number(player.currentTime || 0));
      await saveState({ current_index: index, is_playing: true, current_time_seconds: restart ? 0 : Number(player.currentTime || 0) });
    } catch (error) {
      Alert.alert('Music player', error.message || 'Could not start this song.');
    }
  };

  const skip = async direction => {
    const list = queueRef.current;
    if (!list.length) return;
    const current = indexRef.current;
    let next = current + direction;
    if (direction > 0 && shuffleRef.current && list.length > 1) {
      do { next = Math.floor(Math.random() * list.length); } while (next === current);
    } else if (next < 0 || next >= list.length) {
      if (repeatRef.current === 'all') next = (next + list.length) % list.length;
      else if (direction < 0) next = 0;
      else {
        playerRef.current?.pause();
        playingRef.current = false;
        setPlaying(false);
        await saveState({ is_playing: false, current_time_seconds: 0 });
        return;
      }
    }
    await playAt(next, true);
  };

  endHandlerRef.current = async () => {
    if (repeatRef.current === 'one') await playAt(indexRef.current, true);
    else await skip(1);
  };

  const togglePlayback = async () => {
    if (!queueRef.current.length) {
      Alert.alert('My Music', 'Choose an audio file from your phone first.');
      return;
    }
    const player = playerRef.current;
    if (playingRef.current) {
      const seconds = Number(player?.currentTime || currentTime || 0);
      player?.pause();
      playingRef.current = false;
      setPlaying(false);
      try { await saveState({ is_playing: false, current_time_seconds: seconds }); }
      catch (error) { Alert.alert('Music', error.message || 'Could not pause your stream.'); }
    } else if (!player || !localPathRef.current) {
      await playAt(indexRef.current, false);
    } else {
      if (duration > 0 && currentTime >= duration - 0.5) await player.seekTo(0);
      player.volume = volumeRef.current;
      player.play();
      playingRef.current = true;
      setPlaying(true);
      try { await saveState({ is_playing: true, current_time_seconds: Number(player.currentTime || 0) }); }
      catch (error) { Alert.alert('Music', error.message || 'Could not resume your stream.'); }
    }
  };

  const chooseFiles = async () => {
    if (!roomId || uploading) return;
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true
      });
      if (picked.canceled || !picked.assets?.length) return;
      const existing = queueRef.current;
      if (existing.length + picked.assets.length > 20) {
        Alert.alert('My Music', 'Your playlist can contain up to 20 songs.');
        return;
      }
      setUploading(true);
      const additions = [];
      for (let i = 0; i < picked.assets.length; i += 1) {
        const asset = picked.assets[i];
        if (asset.size && asset.size > 20 * 1024 * 1024) {
          throw new Error(`${asset.name || 'This file'} is larger than the 20 MB limit.`);
        }
        const blob = await (await fetch(asset.uri)).blob();
        const safeName = String(asset.name || `track-${i}.mp3`).replace(/[^A-Za-z0-9._-]/g, '_').slice(-90);
        const objectPath = `${userId}/${roomId}/${Date.now()}-${i}-${safeName}`;
        const { error } = await supabase.storage.from('talkzy-room-music').upload(objectPath, blob, {
          contentType: asset.mimeType || 'audio/mpeg',
          upsert: false
        });
        if (error) throw error;
        additions.push({
          object_path: objectPath,
          title: String(asset.name || 'Audio track').replace(/\.[^.]+$/, '').slice(0, 120)
        });
      }
      const nextQueue = [...existing, ...additions];
      const firstUpload = existing.length === 0;
      const state = await saveState({
        queue: nextQueue,
        current_index: firstUpload ? 0 : indexRef.current,
        is_playing: firstUpload ? true : playingRef.current,
        current_time_seconds: firstUpload ? 0 : currentTime
      });
      if (firstUpload && state?.queue?.[0]?.url) {
        queueRef.current = state.queue;
        await playAt(0, true);
      }
      setMinimized(false);
    } catch (error) {
      Alert.alert('Music upload', error.message || 'Could not upload your audio file.');
    } finally {
      setUploading(false);
    }
  };

  const stopMyStream = async () => {
    try {
      await api(`/api/rooms/${roomId}/music/me`, { method: 'DELETE' });
    } catch (error) {
      Alert.alert('Music', error.message || 'Could not stop your stream.');
    }
    playerRef.current?.pause();
    playerRef.current?.remove();
    playerRef.current = null;
    localPathRef.current = null;
    queueRef.current = [];
    indexRef.current = 0;
    playingRef.current = false;
    setQueue([]);
    setCurrentIndex(0);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const refreshStreams = async () => {
    if (!roomId || syncBusyRef.current) return;
    syncBusyRef.current = true;
    try {
      const result = await api(`/api/rooms/${roomId}/music`);
      const list = Array.isArray(result.streams) ? result.streams : [];
      setStreams(list);
      const keep = new Set();
      for (const stream of list) {
        if (stream.user_id === userId) continue;
        const item = stream.queue?.[stream.current_index];
        if (!item?.url) continue;
        keep.add(stream.user_id);
        let entry = remotePlayersRef.current[stream.user_id];
        if (!entry || entry.objectPath !== item.object_path) {
          if (entry?.player) { entry.player.pause(); entry.player.remove(); }
          entry = { player: createAudioPlayer(item.url, { updateInterval: 1000 }), objectPath: item.object_path };
          remotePlayersRef.current[stream.user_id] = entry;
        }
        const remote = entry.player;
        remote.volume = Math.min(1, Math.max(0, Number(stream.volume ?? 0.8)));
        const expected = Number(stream.current_time_seconds || 0) +
          (stream.is_playing && stream.updated_at ? Math.max(0, (Date.now() - new Date(stream.updated_at).getTime()) / 1000) : 0);
        if (stream.is_playing) {
          if (Math.abs(Number(remote.currentTime || 0) - expected) > 3) {
            try { await remote.seekTo(expected); } catch {}
          }
          if (!remote.playing) remote.play();
        } else if (remote.playing) remote.pause();
      }
      Object.keys(remotePlayersRef.current).forEach(id => {
        if (!keep.has(id)) {
          const entry = remotePlayersRef.current[id];
          entry?.player?.pause();
          entry?.player?.remove();
          delete remotePlayersRef.current[id];
        }
      });
    } catch (error) {
      console.log('Room music sync error:', error.message);
    } finally {
      syncBusyRef.current = false;
    }
  };

  useEffect(() => { if (visible) setMinimized(false); }, [visible]);

  useEffect(() => {
    if (!roomId) return undefined;
    let active = true;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: true }).catch(() => {});
    const refresh = () => { if (active) refreshStreams(); };
    refresh();
    const poll = setInterval(refresh, 3500);
    const progress = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(Number(player.currentTime || 0));
      setDuration(Number(player.duration || 0));
      if (playingRef.current && Date.now() - lastWriteRef.current > 8000) {
        saveState({ current_time_seconds: Number(player.currentTime || 0), is_playing: true })
          .catch(error => console.log('Music position sync:', error.message));
      }
    }, 1000);
    return () => {
      active = false;
      clearInterval(poll);
      clearInterval(progress);
      api(`/api/rooms/${roomId}/music/me`, { method: 'DELETE' }).catch(() => {});
      playerRef.current?.pause();
      playerRef.current?.remove();
      playerRef.current = null;
      Object.values(remotePlayersRef.current).forEach(entry => {
        entry?.player?.pause();
        entry?.player?.remove();
      });
      remotePlayersRef.current = {};
    };
  }, [roomId]);

  if (!visible) return null;

  const currentTitle = queue[currentIndex]?.title || 'My Music';
  const otherStreams = streams.filter(item => item.user_id !== userId && item.is_playing);
  const toggleRepeat = () => {
    const next = repeatMode === 'off' ? 'one' : repeatMode === 'one' ? 'all' : 'off';
    repeatRef.current = next;
    setRepeatMode(next);
    saveState({ repeat_mode: next }).catch(error => Alert.alert('Music', error.message));
  };
  const toggleShuffle = () => {
    const next = !shuffle;
    shuffleRef.current = next;
    setShuffle(next);
    saveState({ shuffle: next }).catch(error => Alert.alert('Music', error.message));
  };
  const changeVolume = amount => {
    const next = Math.min(1, Math.max(0, Math.round((volume + amount) * 10) / 10));
    volumeRef.current = next;
    setVolume(next);
    if (playerRef.current) playerRef.current.volume = next;
    saveState({ volume: next }).catch(() => {});
  };

  return (
    <View style={{
      position: 'absolute', left: 12, right: 12, bottom: 86,
      maxHeight: minimized ? undefined : '55%',
      backgroundColor: colors.card, borderRadius: 16, padding: 13,
      borderWidth: 1, borderColor: colors.line, zIndex: 35, elevation: 22
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 7, paddingVertical: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 19 }}>✕</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '900', flex: 1, textAlign: 'center' }}>🎵 {currentTitle}</Text>
        <TouchableOpacity onPress={() => setMinimized(!minimized)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 20 }}>{minimized ? '▢' : '－'}</Text>
        </TouchableOpacity>
      </View>
      {!minimized ? (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ height: 4, backgroundColor: colors.line, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
            <View style={{ width: duration > 0 ? `${Math.min(100, currentTime / duration * 100)}%` : '0%', height: 4, backgroundColor: colors.accent }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 10 }}>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</Text>
            <Text style={{ color: colors.muted, fontSize: 10 }}>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 }}>
            <TouchableOpacity onPress={toggleRepeat}><Text style={{ color: repeatMode !== 'off' ? colors.gold : colors.muted, fontWeight: '900', fontSize: 11 }}>🔁 {repeatMode === 'off' ? 'Off' : repeatMode === 'one' ? 'One' : 'All'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={toggleShuffle}><Text style={{ color: shuffle ? colors.gold : colors.muted, fontWeight: '900', fontSize: 12 }}>🔀</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => skip(-1)}><Text style={{ color: colors.text, fontSize: 21 }}>⏮</Text></TouchableOpacity>
            <TouchableOpacity onPress={togglePlayback} style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{playing ? 'Ⅱ' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => skip(1)}><Text style={{ color: colors.text, fontSize: 21 }}>⏭</Text></TouchableOpacity>
            <TouchableOpacity onPress={chooseFiles} disabled={uploading}>
              {uploading ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900' }}>My Music</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
            <Text style={{ color: colors.muted, fontSize: 12, marginRight: 10 }}>🔉 Volume</Text>
            <TouchableOpacity onPress={() => changeVolume(-0.1)}><Text style={{ color: colors.text, fontSize: 19 }}>－</Text></TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 12, width: 42, textAlign: 'center' }}>{Math.round(volume * 100)}%</Text>
            <TouchableOpacity onPress={() => changeVolume(0.1)}><Text style={{ color: colors.text, fontSize: 19 }}>＋</Text></TouchableOpacity>
          </View>
          {queue.length > 0 && <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7 }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>YOUR PLAYLIST · {queue.length}/20</Text>
            {queue.map((item, index) => (
              <TouchableOpacity key={item.object_path || index} onPress={() => playAt(index, true)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
                <Text numberOfLines={1} style={{ color: index === currentIndex ? colors.gold : colors.text, fontSize: 11, flex: 1 }}>{index === currentIndex && playing ? '♫ ' : ''}{index + 1}. {item.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 10 }}>{index === currentIndex ? 'Playing' : 'Play'}</Text>
              </TouchableOpacity>
            ))}
          </View>}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7, marginTop: 6 }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>OTHER ROOM STREAMS · {otherStreams.length}</Text>
            {otherStreams.map(stream => <Text key={stream.user_id} numberOfLines={1} style={{ color: colors.text, fontSize: 11, paddingVertical: 3 }}>🔊 {stream.display_name} · {stream.queue?.[stream.current_index]?.title || 'Music'}</Text>)}
            <Text style={{ color: colors.muted, fontSize: 9, marginTop: 4 }}>Only you control your playlist. Other members’ songs play independently.</Text>
          </View>
          <TouchableOpacity onPress={stopMyStream} style={{ alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 8 }}>
            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '900' }}>Stop my stream</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 11, flex: 1 }}>{playing ? '♫ ' : 'Ⅱ '}{currentTitle}</Text>
          <TouchableOpacity onPress={togglePlayback} style={{ paddingHorizontal: 10 }}><Text style={{ color: colors.text, fontSize: 18 }}>{playing ? 'Ⅱ' : '▶'}</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}
