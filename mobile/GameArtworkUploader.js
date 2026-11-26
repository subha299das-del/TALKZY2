import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, Modal, ActivityIndicator,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Founder-only PNG and WebP artwork uploader for Greedy and other TALKZY games.
 *
 * Props:
 *   visible: boolean
 *   onClose: () => void
 *   supabase: configured Supabase client
 *   onUploaded: ({ gameKey, screen, url, path }) => void
 *
 * Storage prerequisite:
 *   Create a PUBLIC Supabase Storage bucket named "talkzy-game-artwork".
 *   Add authenticated upload permission for Founder accounts only (enforce
 *   Founder identity in Storage policies; do not rely only on hiding this UI).
 */
const GAME_OPTIONS = [
  { key: 'thunder-king', name: 'Thunder King' },
  { key: 'lucky-elephant', name: 'Lucky Elephant' },
  { key: 'wild-kingdom', name: 'Wild Kingdom' },
  { key: 'royal-77', name: 'Royal 77' },
  { key: 'ruby-jackpot', name: 'Ruby Jackpot' },
  { key: 'greedy-game-7', name: 'Greedy Game 7' },
  { key: 'greedy-game-8', name: 'Greedy Game 8' },
  { key: 'greedy-game-9', name: 'Greedy Game 9' },
  { key: 'greedy-game-10', name: 'Greedy Game 10' },
  { key: 'room-games', name: 'Room Games' }
];
const SCREENS = [
  { key: 'main', name: 'Main panel' },
  { key: 'result', name: 'Result panel' },
  { key: 'icon', name: 'Game icon / DP' }
];
const BUCKET = 'talkzy-game-artwork';

export default function GameArtworkUploader({ visible, onClose, supabase, onUploaded }) {
  const [gameKey, setGameKey] = useState(GAME_OPTIONS[0].key);
  const [screen, setScreen] = useState('main');
  const [asset, setAsset] = useState(null);
  const [busy, setBusy] = useState(false);

  const chooseArtwork = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow photo access to select your PNG or WebP artwork.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1
    });
    if (result.canceled || !result.assets?.[0]) return;
    const picked = result.assets[0];
    const mime = picked.mimeType || '';
    const name = (picked.fileName || picked.uri.split('/').pop() || '').toLowerCase();
    const isPng = mime === 'image/png' || name.endsWith('.png');
    const isWebp = mime === 'image/webp' || name.endsWith('.webp');
    if (!isPng && !isWebp) {
      Alert.alert('Unsupported format', 'Please select a PNG or WebP file. JPG and other formats are not accepted.');
      return;
    }
    if (mime && mime !== 'image/png' && mime !== 'image/webp') {
      Alert.alert('File type mismatch', 'The selected file is not identified as PNG or WebP.');
      return;
    }
    picked.uploadMimeType = isWebp ? 'image/webp' : 'image/png';
    picked.uploadExtension = isWebp ? 'webp' : 'png';
    if (picked.fileSize && picked.fileSize > 15 * 1024 * 1024) {
      Alert.alert('File too large', 'Please choose a PNG or WebP smaller than 15 MB.');
      return;
    }
    setAsset(picked);
  };

  const upload = async () => {
    if (!supabase) {
      Alert.alert('Not configured', 'The Supabase client was not supplied to this uploader.');
      return;
    }
    if (!asset) {
      Alert.alert('Choose artwork', 'Select a PNG or WebP file before uploading.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(asset.uri);
      const bytes = await response.arrayBuffer();
      const contentType = asset.uploadMimeType || (asset.fileName?.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/png');
      const extension = asset.uploadExtension || (contentType === 'image/webp' ? 'webp' : 'png');
      const path = gameKey + '/' + screen + '-' + Date.now() + '.' + extension;
      const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType,
        upsert: true,
        cacheControl: '3600'
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const payload = { gameKey, screen, url: data.publicUrl, path };
      onUploaded?.(payload);
      Alert.alert('Artwork uploaded', ((contentType === 'image/webp' ? 'WebP' : 'PNG') + ' uploaded successfully. Save the returned artwork URL in the game configuration to display it.'));
      setAsset(null);
    } catch (error) {
      Alert.alert('Upload failed', error?.message || 'Could not upload artwork. Check the bucket and its Storage policies.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>GAME ARTWORK UPLOAD</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
          </View>
          <Text style={styles.label}>SELECT GAME</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.options}>
            {GAME_OPTIONS.map(item => (
              <TouchableOpacity key={item.key} onPress={() => setGameKey(item.key)}
                style={[styles.option, gameKey === item.key && styles.selected]}>
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>ARTWORK TYPE</Text>
          <View style={styles.row}>
            {SCREENS.map(item => (
              <TouchableOpacity key={item.key} onPress={() => setScreen(item.key)}
                style={[styles.option, styles.screenOption, screen === item.key && styles.selected]}>
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.choose} onPress={chooseArtwork} disabled={busy}>
            <Text style={styles.chooseText}>{asset ? 'CHOOSE DIFFERENT ARTWORK' : 'SELECT PNG / WEBP FROM PHONE'}</Text>
          </TouchableOpacity>
          {asset && <View style={styles.previewWrap}>
            <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="contain" />
            <Text style={styles.fileName}>{asset.fileName || 'Selected artwork'}</Text>
          </View>}
          <TouchableOpacity style={[styles.upload, (!asset || busy) && styles.disabled]}
            onPress={upload} disabled={!asset || busy}>
            {busy ? <ActivityIndicator color="#211707" /> : <Text style={styles.uploadText}>UPLOAD ARTWORK</Text>}
          </TouchableOpacity>
          <Text style={styles.note}>PNG + WebP · Maximum 15 MB · Uploading stores the artwork; the game screen must be configured to use its URL.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', padding: 16 },
  panel: { maxHeight: '92%', backgroundColor: '#10151E', borderColor: '#B68A3A', borderWidth: 1, borderRadius: 14, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#F5D77C', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  close: { color: '#F5D77C', fontSize: 28, paddingHorizontal: 5 },
  label: { color: '#C9B47F', fontSize: 10, fontWeight: '900', marginTop: 15, marginBottom: 7, letterSpacing: 1 },
  options: { flexGrow: 0 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  option: { paddingHorizontal: 11, paddingVertical: 9, marginRight: 6, marginBottom: 5, borderRadius: 8, borderWidth: 1, borderColor: '#675633', backgroundColor: '#1B2029' },
  screenOption: { marginRight: 0 },
  selected: { backgroundColor: '#59421C', borderColor: '#F5D77C' },
  optionText: { color: '#F1E5C5', fontSize: 11, fontWeight: '700' },
  choose: { marginTop: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#C49A4D', borderRadius: 10, padding: 15, alignItems: 'center' },
  chooseText: { color: '#F5D77C', fontSize: 12, fontWeight: '900' },
  previewWrap: { alignItems: 'center', marginTop: 12 },
  preview: { width: '100%', height: 170, backgroundColor: '#090D13', borderRadius: 8 },
  fileName: { color: '#BDB39B', fontSize: 10, marginTop: 5 },
  upload: { marginTop: 16, backgroundColor: '#D7B15C', borderRadius: 9, padding: 14, alignItems: 'center' },
  disabled: { opacity: 0.45 },
  uploadText: { color: '#211707', fontWeight: '900', fontSize: 12 },
  note: { color: '#A9A18F', fontSize: 9, lineHeight: 14, marginTop: 10, textAlign: 'center' }
});
