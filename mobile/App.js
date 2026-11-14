import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  }
);

const defaults = {
  appName: 'TALKZY',
  tagline: 'Talk • Connect • Earn',
  primary: '#8B5CF6',
  background: '#0B0812',
  card: '#171225',
  bannerTitle: 'Your voice. Your community.',
  bannerText: 'Join conversations and meet new people.',
  announcement: 'Welcome to TALKZY!',
  logoUrl: ''
};

function Button({ label, onPress, outline = false, disabled = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        padding: 14,
        borderRadius: 13,
        backgroundColor: outline ? '#21182F' : '#8B5CF6',
        borderWidth: outline ? 1 : 0,
        borderColor: '#63458B',
        alignItems: 'center',
        marginTop: 10,
        opacity: disabled ? 0.6 : 1
      }}
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field(props) {
  return (
    <TextInput
      placeholderTextColor="#8C8098"
      {...props}
      style={[
        {
          backgroundColor: '#171225',
          color: 'white',
          padding: 14,
          borderRadius: 12,
          marginTop: 12,
          borderWidth: 1,
          borderColor: '#38294A'
        },
        props.style
      ]}
    />
  );
}

export default function App() {
  const [config, setConfig] = useState(defaults);
  const [screen, setScreen] = useState('auth');
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerToken, setOwnerToken] = useState('');
  const [draft, setDraft] = useState(defaults);

  const bg = config.background || defaults.background;

  function checkSupabase() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        'Supabase settings are missing. Check GitHub Actions repository secrets and rebuild the APK.'
      );
    }
  }

  async function refreshConfig(showError = false) {
    try {
      if (!API_BASE_URL) return;

      const response = await fetch(`${API_BASE_URL}/api/config`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Server request failed (${response.status}).`);
      }

      setConfig({ ...defaults, ...data });
      setDraft({ ...defaults, ...data });
    } catch (error) {
      console.log('Config refresh:', error.message);
      if (showError) Alert.alert('TALKZY server', error.message);
    }
  }

  useEffect(() => {
    refreshConfig(false);

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('Session restore:', error.message);
        return;
      }
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!session?.user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('talkzy_profiles')
          .select('talkzy_id, display_name')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (active) setProfile(data);
      } catch (error) {
        console.log('Profile loading:', error.message);
        if (active) setProfile(null);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      setScreen('home');
    } else {
      setProfile(null);
      setScreen('auth');
    }
  }, [session?.user?.id]);

  async function register() {
    try {
      checkSupabase();

      if (name.trim().length < 2) {
        throw new Error('Please enter your name (at least 2 characters).');
      }
      if (!email.trim() || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 8) {
        throw new Error('Password must contain at least 8 characters.');
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { display_name: name.trim() }
        }
      });

      if (error) throw error;

      setPassword('');

      if (data.session && data.user) {
        const { error: profileError } = await supabase
          .from('talkzy_profiles')
          .update({ display_name: name.trim() })
          .eq('id', data.user.id);

        if (profileError) {
          console.log('Display name update:', profileError.message);
        }

        setSession(data.session);
        Alert.alert('Welcome to TALKZY', 'Your account has been created.');
      } else {
        setMode('login');
        Alert.alert(
          'Verify your email',
          'Your account has been created. Check your email for the verification link, then sign in.'
        );
      }
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    try {
      checkSupabase();

      if (!email.trim() || !password) {
        throw new Error('Please enter your email and password.');
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      setSession(data.session);
      setPassword('');
      setScreen('home');
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    try {
      checkSupabase();
      setLoading(true);

      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error('Google sign-in URL was not created.');
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type !== 'success' || !result.url) {
        throw new Error('Google sign-in was cancelled or did not finish.');
      }

      const callback = Linking.parse(result.url);
      const params = callback.queryParams || {};

      if (params.error_description) {
        throw new Error(String(params.error_description));
      }

      if (!params.code) {
        throw new Error('No login code was received. Please try again.');
      }

      const { data: authData, error: authError } =
        await supabase.auth.exchangeCodeForSession(String(params.code));

      if (authError) throw authError;

      setSession(authData.session);
      setScreen('home');
    } catch (error) {
      Alert.alert('Google sign-in', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setProfile(null);
      setScreen('auth');
    } catch (error) {
      Alert.alert('Sign out', error.message);
    }
  }

  async function ownerLogin() {
    try {
      if (!API_BASE_URL) {
        throw new Error('TALKZY server URL is missing.');
      }
      if (!ownerEmail.trim() || !ownerPassword) {
        throw new Error('Enter the owner email and password.');
      }

      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail.trim(),
          password: ownerPassword
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Owner login failed (${response.status}).`);
      }
      if (!data.token) {
        throw new Error('The server did not return an owner session token.');
      }

      setOwnerToken(data.token);
      setDraft({ ...config });
      setOwnerPassword('');
      setScreen('admin');
    } catch (error) {
      Alert.alert('Owner login', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    try {
      if (!API_BASE_URL || !ownerToken) {
        throw new Error('Owner session or server address is missing. Sign in again.');
      }

      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify(draft)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Could not save settings (${response.status}).`);
      }

      setConfig({ ...defaults, ...data });
      Alert.alert('Published', 'TALKZY interface settings have been saved.');
      setScreen(session ? 'home' : 'auth');
    } catch (error) {
      Alert.alert('Could not publish', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle="light-content" />
      <ExpoStatusBar style="light" />

      <View
        style={{
          padding: 18,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {config.logoUrl ? (
            <Image
              source={{ uri: config.logoUrl }}
              style={{ width: 45, height: 45, marginRight: 10 }}
              resizeMode="contain"
            />
          ) : null}
          <View>
            <Text
              style={{
                color: config.primary,
                fontWeight: '900',
                letterSpacing: 3,
                fontSize: 19
              }}
            >
              {config.appName}
            </Text>
            <Text style={{ color: '#B9AEC8', fontSize: 11 }}>
              {config.tagline}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setScreen('ownerLogin')}>
          <Text style={{ color: '#BCA5E8', fontSize: 12 }}>Owner</Text>
        </TouchableOpacity>
      </View>

      {screen === 'auth' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 27, fontWeight: '900' }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </Text>
          <Text style={{ color: '#B8ADC6', marginTop: 8 }}>
            {mode === 'login'
              ? 'Sign in to your TALKZY account.'
              : 'Join the TALKZY community and get your unique ID.'}
          </Text>

          {mode === 'register' && (
            <Field
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}

          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Field
            value={password}
            onChangeText={setPassword}
            placeholder="Password (minimum 8 characters)"
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
          />

          <Button
            label={
              loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'
            }
            onPress={mode === 'login' ? login : register}
            disabled={loading}
          />

          <Button
            label="Continue with Google"
            outline
            onPress={googleLogin}
            disabled={loading}
          />

          <Button
            label={
              mode === 'login'
                ? 'Create a new account'
                : 'Already have an account? Sign in'
            }
            outline
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={loading}
          />

          <Button
            label="Owner control"
            outline
            onPress={() => setScreen('ownerLogin')}
            disabled={loading}
          />

          <Text style={{ color: '#81758F', fontSize: 11, marginTop: 20 }}>
            TALKZY uses email/password and Google sign-in. Mobile-number OTP is not used.
          </Text>
        </ScrollView>
      )}

      {screen === 'home' && session?.user && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: config.card,
              padding: 22,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#45305F'
            }}
          >
            <Text style={{ color: config.primary, fontWeight: '800' }}>
              WELCOME TO TALKZY
            </Text>

            <Text
              style={{
                color: 'white',
                fontSize: 25,
                fontWeight: '900',
                marginTop: 12
              }}
            >
              {profile?.display_name ||
                session.user.user_metadata?.display_name ||
                'TALKZY User'}
            </Text>

            <Text style={{ color: '#C3B8D1', marginTop: 12 }}>
              Your TALKZY ID
            </Text>

            <Text
              style={{
                color: config.primary,
                fontSize: 24,
                fontWeight: '900',
                marginTop: 5
              }}
            >
              {profile?.talkzy_id || 'Loading your ID...'}
            </Text>

            <Text style={{ color: '#B9AEC8', marginTop: 12, fontSize: 12 }}>
              {session.user.email || ''}
            </Text>
          </View>

          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '900',
              marginTop: 25
            }}
          >
            {config.bannerTitle}
          </Text>

          <Text style={{ color: '#C3B8D1', marginTop: 8 }}>
            {config.bannerText}
          </Text>

          <View
            style={{
              backgroundColor: config.card,
              padding: 16,
              borderRadius: 14,
              marginTop: 18
            }}
          >
            <Text style={{ color: '#D8CDEA' }}>{config.announcement}</Text>
          </View>

          <Button
            label="Explore voice rooms"
            onPress={() =>
              Alert.alert(
                'Coming next',
                'Room discovery and room creation will be connected in the next development step. Live audio is not connected yet.'
              )
            }
          />

          <Button
            label="Refresh interface"
            outline
            onPress={() => refreshConfig(true)}
          />

          <Button label="Sign out" outline onPress={logout} />
        </ScrollView>
      )}

      {screen === 'ownerLogin' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>
            Owner sign in
          </Text>
          <Text style={{ color: '#B8ADC6', marginTop: 8 }}>
            Sign in with the owner credentials configured on your TALKZY server.
          </Text>

          <Field
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            placeholder="Owner email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Field
            value={ownerPassword}
            onChangeText={setOwnerPassword}
            placeholder="Owner password"
            secureTextEntry
          />

          <Button
            label={loading ? 'Please wait...' : 'Sign in as owner'}
            onPress={ownerLogin}
            disabled={loading}
          />

          <Button
            label="Back"
            outline
            onPress={() => setScreen(session ? 'home' : 'auth')}
          />
        </ScrollView>
      )}

      {screen === 'admin' && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'white', fontSize: 23, fontWeight: '900' }}>
            Interface control
          </Text>
          <Text style={{ color: '#B8ADC6', marginTop: 8 }}>
            Changes are published through your TALKZY backend.
          </Text>

          {[
            ['appName', 'App name'],
            ['tagline', 'Tagline'],
            ['logoUrl', 'Logo image URL (HTTPS)'],
            ['primary', 'Accent colour (hex)'],
            ['background', 'Background colour (hex)'],
            ['card', 'Card colour (hex)'],
            ['bannerTitle', 'Home banner title'],
            ['bannerText', 'Home banner text'],
            ['announcement', 'Announcement']
          ].map(([key, label]) => (
            <View key={key} style={{ marginTop: 12 }}>
              <Text
                style={{
                  color: '#CFC3DE',
                  marginBottom: 5,
                  fontWeight: '700'
                }}
              >
                {label}
              </Text>
              <Field
                value={String(draft[key] ?? '')}
                onChangeText={value =>
                  setDraft(previous => ({
                    ...previous,
                    [key]: value
                  }))
                }
                placeholder={label}
                autoCapitalize="sentences"
              />
            </View>
          ))}

          <Button
            label={loading ? 'Publishing...' : 'Publish changes'}
            onPress={saveConfig}
            disabled={loading}
          />

          <Button
            label="Back"
            outline
            onPress={() => setScreen(session ? 'home' : 'auth')}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
