import React, {useEffect,useState} from 'react';
import {SafeAreaView,View,Text,TextInput,TouchableOpacity,ScrollView,StatusBar,Alert} from 'react-native';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const defaults = {appName:'TALKZY',tagline:'Talk • Connect • Earn',primary:'#8B5CF6',background:'#0B0812',card:'#171225',bannerTitle:'Your voice. Your community.',bannerText:'Join conversations and meet new people.',announcement:'Welcome to TALKZY!'};
function apiUrl(path) {
 if (!API_BASE_URL) throw new Error('The app API address is not configured. Set EXPO_PUBLIC_API_BASE_URL before building the APK.');
 if (!API_BASE_URL.startsWith('https://') && !(__DEV__ && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE_URL))) {
  throw new Error('The TALKZY server address must use HTTPS.');
 }
 return `${API_BASE_URL}${path}`;
}
async function readResponse(response) {
 const data = await response.json().catch(()=>({}));
 if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
 return data;
}
function Btn({label,onPress,outline=false}) {
 return <TouchableOpacity onPress={onPress} style={{padding:13,borderRadius:13,backgroundColor:outline?'#21182F':'#8B5CF6',borderWidth:outline?1:0,borderColor:'#63458B',alignItems:'center',marginTop:9}}>
  <Text style={{color:'white',fontWeight:'800'}}>{label}</Text>
 </TouchableOpacity>;
}
export default function App(){
 const [config,setConfig]=useState(defaults),[screen,setScreen]=useState('home'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[token,setToken]=useState(''),[draft,setDraft]=useState(defaults),[loading,setLoading]=useState(false);
 async function refresh(showError=false){
  try { const c=await readResponse(await fetch(apiUrl('/api/config')));setConfig({...defaults,...c});setDraft({...defaults,...c}); }
  catch(e){ if(showError) Alert.alert('TALKZY server',e.message); }
 }
 useEffect(()=>{refresh(false);},[]);
 async function adminLogin(){
  try {setLoading(true);const d=await readResponse(await fetch(apiUrl('/api/admin/login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));
   setToken(d.token);setScreen('admin');setDraft({...config});setPassword('');
  }catch(e){Alert.alert('Owner login',e.message+' — check the HTTPS server address and owner credentials.');}finally{setLoading(false);}
 }
 async function save(){
  try{setLoading(true);const d=await readResponse(await fetch(apiUrl('/api/config'),{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(draft)}));
   setConfig({...defaults,...d});Alert.alert('Published','Interface settings saved. Refresh the app on other devices to load them.');setScreen('home');
  }catch(e){if(/session expired|sign-in required/i.test(e.message)){setToken('');setScreen('ownerLogin');}Alert.alert('Could not publish',e.message);}finally{setLoading(false);}
 }
 const bg=config.background||defaults.background;
 return <SafeAreaView style={{flex:1,backgroundColor:bg}}>
  <StatusBar barStyle="light-content"/><ExpoStatusBar style="light"/>
  <View style={{padding:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
   <View><Text style={{color:config.primary,fontWeight:'900',letterSpacing:3}}>{config.appName}</Text><Text style={{color:'#B9AEC8',fontSize:11}}>{config.tagline}</Text></View>
   <TouchableOpacity onPress={()=>setScreen('ownerLogin')}><Text style={{color:'#BCA5E8',fontSize:11}}>Owner</Text></TouchableOpacity>
  </View>
  {screen==='home'&&<ScrollView contentContainerStyle={{padding:18}}>
   <View style={{backgroundColor:config.card,padding:22,borderRadius:20,borderWidth:1,borderColor:'#45305F'}}>
    <Text style={{color:config.primary,fontWeight:'800'}}>WELCOME</Text><Text style={{color:'white',fontSize:27,fontWeight:'900',marginTop:12}}>{config.bannerTitle}</Text>
    <Text style={{color:'#C3B8D1',marginTop:8}}>{config.bannerText}</Text>
    <Btn label="Explore voice rooms" onPress={()=>Alert.alert('Demo','Room discovery is a placeholder in this owner-control starter.')}/>
   </View>
   <Text style={{color:'white',fontSize:18,fontWeight:'900',marginTop:22}}>Announcement</Text>
   <View style={{backgroundColor:config.card,padding:16,borderRadius:15,marginTop:10}}><Text style={{color:'#D8CDEA'}}>{config.announcement}</Text></View>
   <Btn label="Refresh interface" outline onPress={()=>refresh(true)}/>
   <Text style={{color:'#81758F',fontSize:11,marginTop:18}}>This starter demonstrates remote interface settings only. Live voice, accounts, payments and earning features are not included.</Text>
  </ScrollView>}
  {screen==='ownerLogin'&&<ScrollView contentContainerStyle={{padding:20}}>
   <Text style={{color:'white',fontSize:24,fontWeight:'900'}}>Owner sign in</Text><Text style={{color:'#B8ADC6',marginVertical:10}}>Only the owner account configured on your server can change the interface.</Text>
   <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="username" placeholder="Owner email" placeholderTextColor="#8C8098" style={{backgroundColor:'#171225',color:'white',padding:14,borderRadius:12,marginTop:12}}/>
   <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="Owner password" placeholderTextColor="#8C8098" style={{backgroundColor:'#171225',color:'white',padding:14,borderRadius:12,marginTop:10}}/>
   <Btn label={loading?'Please wait…':'Sign in as owner'} onPress={adminLogin}/>
   <Btn label="Back" outline onPress={()=>setScreen('home')}/>
  </ScrollView>}
  {screen==='admin'&&<ScrollView contentContainerStyle={{padding:20}}>
   <Text style={{color:'white',fontSize:23,fontWeight:'900'}}>Interface control</Text><Text style={{color:'#B8ADC6',marginBottom:12}}>Changes are published through your HTTPS backend.</Text>
   {[
    ['appName','App name'],['tagline','Tagline'],['primary','Accent colour (hex)'],['background','Background colour (hex)'],['card','Card colour (hex)'],['bannerTitle','Home banner title'],['bannerText','Home banner text'],['announcement','Announcement']
   ].map(([key,label])=><View key={key} style={{marginTop:10}}>
    <Text style={{color:'#CFC3DE',marginBottom:5,fontWeight:'700'}}>{label}</Text>
    <TextInput value={String(draft[key]??'')} onChangeText={v=>setDraft(p=>({...p,[key]:v}))} placeholder={label} placeholderTextColor="#82768F" style={{backgroundColor:'#171225',color:'white',padding:12,borderRadius:11,borderWidth:1,borderColor:'#38294A'}}/>
   </View>)}
   <Btn label={loading?'Publishing…':'Publish changes'} onPress={save}/>
   <Btn label="Preview home" outline onPress={()=>setScreen('home')}/>
  </ScrollView>}
 </SafeAreaView>;
}
