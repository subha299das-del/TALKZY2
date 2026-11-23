import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import { File as ExpoFile } from 'expo-file-system';

export default function RoomMusicPanel({ visible, roomId, userId, api, supabase, colors, onClose, onMinimize }) {
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
  const [musicPage, setMusicPage] = useState('player');
  const [localAssets, setLocalAssets] = useState([]);
  const [selectedLocalIds, setSelectedLocalIds] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
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
  const activeRoomIdRef = useRef(roomId);
  const refreshGenerationRef = useRef(0);
  activeRoomIdRef.current = roomId;

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

  const openMyMusic = () => { setMusicPage('library'); setLibrarySearch(''); };
  const loadLocalMusic = async () => {
    if (loadingLocal) return; setLoadingLocal(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
      if (!permission.granted) { Alert.alert('Permission needed', 'Allow TALKZY to access audio files on your phone.'); return; }
      const result = await MediaLibrary.getAssetsAsync({ mediaType: MediaLibrary.MediaType.audio, first: 500, sortBy: [MediaLibrary.SortBy.creationTime] });
      setLocalAssets(result.assets || []); setSelectedLocalIds([]); setLocalSearch(''); setMusicPage('local');
    } catch (error) { Alert.alert('My Local Music', error.message || 'Could not read music from your phone.'); }
    finally { setLoadingLocal(false); }
  };
  const toggleLocalSelection = id => setSelectedLocalIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const uploadSelectedMusic = async () => {
    if (!roomId || uploading || !selectedLocalIds.length) return;
    const selected = localAssets.filter(asset => selectedLocalIds.includes(asset.id)); const existing = queueRef.current;
    if (existing.length + selected.length > 20) { Alert.alert('My Music', 'Your playlist can contain up to 20 songs.'); return; }
    setUploading(true);
    try {
      const additions = [];
      for (let i = 0; i < selected.length; i += 1) {
        const asset = selected[i]; const info = await MediaLibrary.getAssetInfoAsync(asset); const uri = info.localUri || asset.uri;
        const file = new ExpoFile(uri); const name = asset.filename || ('track-' + (i + 1) + '.mp3');
        const fileSize = Number(file.size || asset.fileSize || 0);
        if (fileSize > 20 * 1024 * 1024) throw new Error(name + ' is larger than the 20 MB limit.');
        const bytes = await file.bytes();
        if (!bytes?.length) throw new Error('Could not read ' + name + ' from your phone. Please choose another file.');
        if (bytes.byteLength > 20 * 1024 * 1024) throw new Error(name + ' is larger than the 20 MB limit.');
        const safeName = String(name).replace(/[^A-Za-z0-9._-]/g, '_').slice(-90); const path = userId + '/' + roomId + '/' + Date.now() + '-' + i + '-' + safeName;
        let result; let lastUploadError;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          result = await supabase.storage.from('talkzy-room-music').upload(path, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { contentType: asset.mimeType || 'audio/mpeg', upsert: true });
          if (!result.error) break;
          lastUploadError = result.error;
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 900 * (attempt + 1)));
        }
        if (result?.error) throw new Error('Upload failed after 3 attempts: ' + (lastUploadError.message || 'Network connection failed.'));
        additions.push({ object_path: path, title: String(name).replace(/\.[^.]+$/, '').slice(0, 120) });
      }
      const nextQueue = [...existing, ...additions]; const first = existing.length === 0;
      let state; let lastSaveError;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          state = await saveState({ queue: nextQueue, current_index: first ? 0 : indexRef.current, is_playing: first ? true : playingRef.current, current_time_seconds: first ? 0 : currentTime });
          break;
        } catch (saveError) {
          lastSaveError = saveError;
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1200 * (attempt + 1)));
        }
      }
      if (!state) throw new Error('Songs uploaded, but TALKZY could not sync your playlist: ' + (lastSaveError?.message || 'Network error. Please retry when connection is stable.'));
      if (first && state?.queue?.[0]?.url) { queueRef.current = state.queue; await playAt(0, true); }
      setSelectedLocalIds([]); setMusicPage('library'); setMinimized(false);
    } catch (error) {
      const message = error?.message || 'Could not upload selected songs.';
      const networkLike = /network|fetch|timeout|connection|offline/i.test(message);
      Alert.alert('Music upload', networkLike ? message + '\n\nPlease check your internet connection and try again. Your selected songs are still selected.' : message);
    }
    finally { setUploading(false); }
  };
  const chooseFiles = () => openMyMusic();

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
    const requestRoomId = roomId;
    const requestGeneration = refreshGenerationRef.current;
    const isCurrentRequest = () =>
      activeRoomIdRef.current === requestRoomId &&
      refreshGenerationRef.current === requestGeneration;
    syncBusyRef.current = true;
    try {
      const result = await api(`/api/rooms/${requestRoomId}/music`);
      if (!isCurrentRequest()) return;
      const list = Array.isArray(result.streams) ? result.streams : [];
      setStreams(list);

      // Restore this user's own saved stream when the panel first mounts or the
      // room is re-entered. Each user still controls only their own player.
      const mine = list.find(stream => stream.user_id === userId);
      if (mine) {
        applyState(mine);
        const ownItem = mine.queue?.[mine.current_index];
        if (ownItem?.url) {
          let ownPlayer = playerRef.current;
          const isNewOwnPlayer = !ownPlayer;
          if (!ownPlayer) {
            ownPlayer = createAudioPlayer(ownItem.url, { updateInterval: 500 });
            playerRef.current = ownPlayer;
            ownPlayer.addListener('playbackStatusUpdate', status => {
              if (status?.didJustFinish) endHandlerRef.current?.();
            });
            localPathRef.current = ownItem.object_path;
          } else if (localPathRef.current !== ownItem.object_path) {
            ownPlayer.replace(ownItem.url);
            localPathRef.current = ownItem.object_path;
          }
          const ownExpected = Number(mine.current_time_seconds || 0) +
            (mine.is_playing && mine.updated_at ? Math.max(0, (Date.now() - new Date(mine.updated_at).getTime()) / 1000) : 0);
          if (isNewOwnPlayer || Math.abs(Number(ownPlayer.currentTime || 0) - ownExpected) > 3) {
            try { await ownPlayer.seekTo(ownExpected); } catch {}
            if (!isCurrentRequest()) return;
          }
          if (!isCurrentRequest()) return;
          ownPlayer.volume = Math.min(1, Math.max(0, Number(mine.volume ?? 0.8)));
          if (mine.is_playing && !ownPlayer.playing) ownPlayer.play();
          if (!mine.is_playing && ownPlayer.playing) ownPlayer.pause();
          setCurrentTime(ownExpected);
          setDuration(Number(ownPlayer.duration || 0));
        }
      } else {
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
      }

      const keep = new Set();
      for (const stream of list) {
        if (!isCurrentRequest()) return;
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
            if (!isCurrentRequest()) return;
          }
          if (!isCurrentRequest()) return;
          if (!remote.playing) remote.play();
        } else if (remote.playing) remote.pause();
      }
      if (!isCurrentRequest()) return;
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

  useEffect(() => { if (visible) { setMinimized(false); setMusicPage('player'); } }, [visible]);

  useEffect(() => {
    if (!roomId) return undefined;
    refreshGenerationRef.current += 1;
    activeRoomIdRef.current = roomId;
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
      refreshGenerationRef.current += 1;
      clearInterval(poll);
      clearInterval(progress);
      api(`/api/rooms/${roomId}/music/me`, { method: 'DELETE' }).catch(() => {});
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
      setStreams([]);
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
  const filteredQueue = queue.filter(item => String(item.title || '').toLowerCase().includes(librarySearch.toLowerCase()));
  const filteredLocal = localAssets.filter(asset => String(asset.filename || '').toLowerCase().includes(localSearch.toLowerCase()));
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
      maxHeight: musicPage === 'player' ? (minimized ? undefined : '55%') : '92%',
      backgroundColor: colors.card, borderRadius: 16, padding: 13,
      borderWidth: 1, borderColor: colors.line, zIndex: 35, elevation: 22
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => musicPage === 'player' ? onClose() : setMusicPage(musicPage === 'local' ? 'library' : 'player')} style={{ paddingHorizontal: 7, paddingVertical: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 19 }}>{musicPage === 'player' ? '✕' : '‹'}</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '900', flex: 1, textAlign: 'center' }}>{musicPage === 'local' ? 'My Local Music' : musicPage === 'library' ? 'My Music' : '🎵 ' + currentTitle}</Text>
        {musicPage === 'player' ? <TouchableOpacity onPress={() => { setMinimized(true); onMinimize?.(); }} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 20 }}>－</Text>
        </TouchableOpacity> : <View style={{ width: 28 }} />}
      </View>
      {!minimized ? (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {musicPage === 'library' ? (
            <View>
              <TextInput value={librarySearch} onChangeText={setLibrarySearch} placeholder="Search music" placeholderTextColor={colors.muted} style={{ color: colors.text, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 9 }} />
              {filteredQueue.length ? filteredQueue.map(item => {
                const actualIndex = queue.indexOf(item);
                return <TouchableOpacity key={item.object_path || actualIndex} onPress={() => playAt(actualIndex, true)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                  <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}><Text style={{ color: colors.gold, fontSize: 17 }}>♫</Text></View>
                  <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: actualIndex === currentIndex ? colors.gold : colors.text, fontWeight: '700', fontSize: 12 }}>{item.title}</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>{actualIndex === currentIndex && playing ? 'Now playing' : 'Tap to play'}</Text></View>
                  <Text style={{ color: colors.accent, fontSize: 18 }}>{actualIndex === currentIndex && playing ? 'Ⅱ' : '▶'}</Text>
                </TouchableOpacity>;
              }) : <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>{queue.length ? 'No songs match your search.' : 'No songs uploaded yet.'}</Text>}
              <TouchableOpacity onPress={loadLocalMusic} disabled={loadingLocal} style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 12, marginBottom: 5 }}>{loadingLocal ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '900' }}>＋ Add Music</Text>}</TouchableOpacity>
            </View>
          ) : musicPage === 'local' ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                <TouchableOpacity onPress={() => setSelectedLocalIds(selectedLocalIds.length === filteredLocal.length && filteredLocal.length ? [] : filteredLocal.map(asset => asset.id))}><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>{selectedLocalIds.length === filteredLocal.length && filteredLocal.length ? '✓ Deselect All' : 'Select All'}</Text></TouchableOpacity>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{selectedLocalIds.length} selected</Text>
              </View>
              <TextInput value={localSearch} onChangeText={setLocalSearch} placeholder="Search local audio" placeholderTextColor={colors.muted} style={{ color: colors.text, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 9 }} />
              {filteredLocal.length ? filteredLocal.map(asset => {
                const checked = selectedLocalIds.includes(asset.id);
                return <TouchableOpacity key={asset.id} onPress={() => toggleLocalSelection(asset.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                  <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: checked ? colors.accent : colors.muted, backgroundColor: checked ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}><Text style={{ color: '#FFF', fontWeight: '900' }}>{checked ? '✓' : ''}</Text></View>
                  <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 9 }}><Text style={{ color: colors.gold }}>♫</Text></View>
                  <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>{asset.filename || 'Audio file'}</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>{Math.floor((asset.duration || 0) / 60)}:{String(Math.floor((asset.duration || 0) % 60)).padStart(2, '0')}</Text></View>
                </TouchableOpacity>;
              }) : <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>No audio files found on this device.</Text>}
              <TouchableOpacity onPress={uploadSelectedMusic} disabled={!selectedLocalIds.length || uploading} style={{ backgroundColor: selectedLocalIds.length ? colors.accent : colors.line, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 12, marginBottom: 5 }}>{uploading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '900' }}>Upload Selected · {selectedLocalIds.length}</Text>}</TouchableOpacity>
            </View>
          ) : (
          <>
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
              {uploading ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={{ color: colors.gold, fontSize: 20, fontWeight: '900' }}>♫</Text>}
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
          </>
          )}
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
