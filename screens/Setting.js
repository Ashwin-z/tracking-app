// screens/Setting.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Platform, StatusBar, ScrollView,
  TouchableOpacity, TextInput, Switch, Modal, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';

const THEME = { primary:'#10B981', dark:'#065F46', text:'#0F172A', sub:'#475569', card:'#FFF', bg:'#EEF2F6', border:'#E5E7EB' };
const STORAGE_KEYS = { fuelPrice:'fuel_price', playAlerts:'play_alerts_toggle' };

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, signOut, updateEmailLocal } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [fuelPrice, setFuelPrice] = useState('0');
  const [playAlerts, setPlayAlerts] = useState(true);

  // extra fields you wanted visible
  const [vehicleExpenses] = useState(0);
  const [maintenanceCount] = useState(0);

  // modals
  const [fuelModal, setFuelModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);

  // inputs
  const [nextFuel, setNextFuel] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [pwdForEmail, setPwdForEmail] = useState('');
  const [pwdCurr, setPwdCurr] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdNew2, setPwdNew2] = useState('');

  // disable Save while waiting for server
  const [savingFuel, setSavingFuel] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // --- animated background state (no separate component) ---
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const up = t.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const down = t.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const scaleA = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const scaleB = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  // ----------------------------------------------------------

  useEffect(() => {
    setEmail(user?.email || '');
    (async () => {
      const [savedFuel, savedToggle] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.fuelPrice),
        AsyncStorage.getItem(STORAGE_KEYS.playAlerts),
      ]);
      if (savedFuel) setFuelPrice(savedFuel);
      if (savedToggle != null) setPlayAlerts(savedToggle === '1');
    })();

    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/health`);
        if (!r.ok) throw new Error('Server not OK');
      } catch (e) {
        Alert.alert('Can’t reach server', `${e.message}\nURL: ${BASE_URL}`);
      }
    })();
  }, [user?.email]);

  const postJSON = async (path, body) => {
    const url = `${BASE_URL}${path}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const raw = await res.text();
      const isJSON = (res.headers.get('content-type') || '').includes('application/json');
      const data = isJSON && raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

      if (!res.ok) {
        const msg = (data && data.message) || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg + (isJSON ? '' : `\nNon-JSON from ${url}:\n${raw.slice(0,200)}`));
      }
      if (!data) throw new Error(`Expected JSON from ${url}, got:\n${raw.slice(0,200)}`);
      return data;
    } finally {
      clearTimeout(id);
    }
  };

  const onLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const onSaveFuel = async () => {
    if (savingFuel) return;
    const v = nextFuel.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,3})?$/.test(v)) return Alert.alert('Invalid value', 'Example: 259.0');

    try {
      setSavingFuel(true);
      await postJSON('/user/fuel-price', { email, fuelPrice: Number(v) });
      await AsyncStorage.setItem(STORAGE_KEYS.fuelPrice, v);
      setFuelPrice(v);
      setFuelModal(false);
      Alert.alert('Saved', `Fuel price set to Rs.${v}/L`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingFuel(false);
    }
  };

  const onSaveEmail = async () => {
    if (savingEmail) return;
    if (!newEmail || !pwdForEmail) return Alert.alert('Missing', 'Enter new email and your password.');
    try {
      setSavingEmail(true);
      const res = await postJSON('/user/change-email', {
        currentEmail: email,
        password: pwdForEmail,
        newEmail,
      });
      await updateEmailLocal(res.email);
      setEmail(res.email);
      setEmailModal(false);
      setNewEmail('');
      setPwdForEmail('');
      Alert.alert('Updated', 'Email updated.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const onSavePassword = async () => {
    if (savingPwd) return;
    if (!pwdCurr || !pwdNew || !pwdNew2) return Alert.alert('Missing', 'Fill all fields.');
    if (pwdNew.length < 6) return Alert.alert('Weak password', 'At least 6 characters.');
    if (pwdNew !== pwdNew2) return Alert.alert('Mismatch', 'New passwords do not match.');
    try {
      setSavingPwd(true);
      await postJSON('/user/change-password', {
        email,
        currentPassword: pwdCurr,
        newPassword: pwdNew,
      });
      setPwdModal(false);
      setPwdCurr(''); setPwdNew(''); setPwdNew2('');
      Alert.alert('Success', 'Password updated.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 }]}>
      {/* Animated background (behind everything, no touches) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[THEME.primary + '22', THEME.primary + '11', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 260 : 220 }}
        />
        <Animated.View
          style={[
            styles.blob,
            { backgroundColor: THEME.primary + '1A', top: -70, right: -40, transform: [{ translateY: up }, { scale: scaleA }] },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            { backgroundColor: THEME.dark + '14', bottom: -50, left: -60, width: 220, height: 220, transform: [{ translateY: down }, { scale: scaleB }] },
          ]}
        />
      </View>

      <ScrollView style={{ flex:1 }} contentContainerStyle={{ paddingBottom: 16 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* Gradient header */}
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </LinearGradient>

        <SectionHeader icon="person-circle-outline" label="Profile" />
        <Card>
          <Row
            icon="mail-outline" tint="#10B981"
            title={email || '—'} subtitle="Signed in email"
            right={<Button text="Logout" onPress={onLogout} />}
          />
          <Divider />
          <Row
            icon="key-outline" tint="#F59E0B"
            title="Password" subtitle="Update your password"
            right={<Button text="Change" onPress={() => setPwdModal(true)} />}
          />
          <Divider />
          <Row
            icon="at-outline" tint="#3B82F6"
            title="Change Email" subtitle="Update account email"
            right={<Button text="Update" onPress={() => { setNewEmail(''); setPwdForEmail(''); setEmailModal(true); }} />}
          />
        </Card>

        <SectionHeader icon="construct-outline" label="Tools" />
        <Card>
          <Row icon="map-outline" tint="#6366F1" title="Geofence Settings" chevron onPress={() => {}} />
          <Divider />
          <Row icon="notifications-outline" tint="#A855F7" title="Alerts Settings" chevron onPress={() => {}} />
          <Divider />
          <Row
            icon="megaphone-outline" tint="#EC4899" title="Play Alerts Announcement"
            right={
              <Switch
                value={playAlerts}
                onValueChange={async v => { setPlayAlerts(v); await AsyncStorage.setItem(STORAGE_KEYS.playAlerts, v ? '1' : '0'); }}
                trackColor={{ false:'#CBD5E1', true:'#86EFAC' }} thumbColor={playAlerts ? THEME.primary : '#fff'}
              />
            }
          />
          <Divider />
          <Row
            icon="cash-outline" tint="#F59E0B"
            title={`Fuel Cost: Rs.${fuelPrice || '0'}/L`}
            right={<Button text="Set Price" onPress={() => { setNextFuel(fuelPrice); setFuelModal(true); }} />}
          />
          <Divider />
          <Row icon="car-outline" tint="#06B6D4" title="Vehicle Expenses" subtitle={`Rs.${vehicleExpenses.toFixed(1)}`} />
          <Divider />
          <Row icon="settings-outline" tint="#EF4444" title="Maintenance" right={<CounterBadge value={maintenanceCount} />} />
        </Card>
      </ScrollView>

      {/* Fuel modal */}
      <Modal transparent visible={fuelModal} animationType="fade" onRequestClose={() => setFuelModal(false)}>
        <ModalSheet title="Set Fuel Price" onClose={() => setFuelModal(false)}>
          <LabeledInput label="Price (Rs/L)" value={nextFuel} onChangeText={setNextFuel} keyboardType="decimal-pad" placeholder="259.0" />
          <ModalActions onCancel={() => setFuelModal(false)} onSave={onSaveFuel} saving={savingFuel} />
        </ModalSheet>
      </Modal>

      {/* Email change modal */}
      <Modal transparent visible={emailModal} animationType="fade" onRequestClose={() => setEmailModal(false)}>
        <ModalSheet title="Change Email" onClose={() => setEmailModal(false)}>
          <LabeledInput label="New Email" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" />
          <LabeledInput label="Your Password" value={pwdForEmail} onChangeText={setPwdForEmail} secureTextEntry />
          <ModalActions onCancel={() => setEmailModal(false)} onSave={onSaveEmail} saving={savingEmail} />
        </ModalSheet>
      </Modal>

      {/* Password change modal */}
      <Modal transparent visible={pwdModal} animationType="fade" onRequestClose={() => setPwdModal(false)}>
        <ModalSheet title="Change Password" onClose={() => setPwdModal(false)}>
          <LabeledInput label="Current Password" value={pwdCurr} onChangeText={setPwdCurr} secureTextEntry />
          <LabeledInput label="New Password" value={pwdNew} onChangeText={setPwdNew} secureTextEntry />
          <LabeledInput label="Confirm New Password" value={pwdNew2} onChangeText={setPwdNew2} secureTextEntry />
          <ModalActions onCancel={() => setPwdModal(false)} onSave={onSavePassword} saving={savingPwd} />
        </ModalSheet>
      </Modal>
    </SafeAreaView>
  );
}

/* ------- small UI helpers ------- */
function SectionHeader({ icon, label }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <View style={styles.sectionBadge}><Ionicons name={icon} size={16} color="#fff" /></View>
      <Text style={styles.sectionText}>{label}</Text>
    </View>
  );
}
function Card({ children }) { return <View style={styles.card}>{children}</View>; }
function Divider() { return <View style={styles.divider} />; }
function Button({ text, onPress }) { return (<TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.9}><Text style={styles.btnText}>{text}</Text></TouchableOpacity>); }
function Row({ icon, tint, title, subtitle, right, chevron, onPress }) {
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.85 : 1} onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint + '1A', borderColor: tint + '55' }]}><Ionicons name={icon} size={18} color={tint} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
      {chevron ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" style={{ marginLeft: 8 }} /> : null}
    </TouchableOpacity>
  );
}
function CounterBadge({ value = 0 }) {
  const bg = value > 0 ? '#EF4444' : '#CBD5E1';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{value}</Text>
    </View>
  );
}
function ModalSheet({ title, children, onClose }) {
  return (
    <View style={styles.modalWrap}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#6B7280" /></TouchableOpacity>
        </View>
        {children}
      </View>
    </View>
  );
}
function LabeledInput(props) {
  const { label } = props;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor="#9CA3AF" />
    </View>
  );
}
function ModalActions({ onCancel, onSave, saving }) {
  return (
    <View style={styles.sheetActions}>
      <TouchableOpacity
        disabled={saving}
        onPress={onCancel}
        style={[styles.actionBtn, { backgroundColor: '#E5E7EB', opacity: saving ? 0.7 : 1 }]}
      >
        <Text style={[styles.actionText, { color: '#111827' }]}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={saving}
        onPress={onSave}
        style={[styles.actionBtn, { backgroundColor: THEME.primary, opacity: saving ? 0.7 : 1 }]}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={[styles.actionText, { color: '#fff' }]}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:THEME.bg },

  // gradient header
  header:{
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: 16,
  },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#fff' },

  // background blobs
  blob:{ position:'absolute', width:180, height:180, borderRadius:9999 },

  sectionHeader:{ marginTop:8, marginHorizontal:12, flexDirection:'row', alignItems:'center' },
  sectionLine:{ height:1.5, backgroundColor:THEME.primary, flex:1, borderRadius:2 },
  sectionBadge:{ width:26, height:26, borderRadius:13, backgroundColor:THEME.primary, alignItems:'center', justifyContent:'center', marginLeft:8 },
  sectionText:{ marginLeft:8, color:THEME.text, fontWeight:'800' },

  card:{ marginHorizontal:12, marginTop:10, backgroundColor:THEME.card, borderRadius:14, borderWidth:1, borderColor:THEME.border, paddingHorizontal:10, paddingVertical:6, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 },
  divider:{ height:1, backgroundColor:'#F1F5F9', marginHorizontal:8 },

  row:{ flexDirection:'row', alignItems:'center', paddingVertical:12 },
  rowIcon:{ width:34, height:34, borderRadius:10, marginRight:10, alignItems:'center', justifyContent:'center', borderWidth:1 },
  rowTitle:{ color:THEME.text, fontWeight:'700', fontSize:14 },
  rowSub:{ color:THEME.sub, fontSize:12, marginTop:2 },

  btn:{ backgroundColor:THEME.primary, paddingHorizontal:12, paddingVertical:6, borderRadius:999 },
  btnText:{ color:'#fff', fontWeight:'700', fontSize:12 },

  modalWrap:{ flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'flex-end' },
  modalBackdrop:{ ...StyleSheet.absoluteFillObject },
  sheet:{ backgroundColor:'#fff', paddingHorizontal:16, paddingTop:14, paddingBottom:10 + (Platform.OS==='android'?6:0), borderTopLeftRadius:18, borderTopRightRadius:18 },
  sheetHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  sheetTitle:{ fontSize:18, fontWeight:'800', color:THEME.text },
  inputLabel:{ color:THEME.sub, fontSize:12, marginBottom:6 },
  input:{ height:44, borderWidth:1, borderColor:THEME.border, borderRadius:10, paddingHorizontal:12, color:THEME.text, backgroundColor:'#fff' },
  sheetActions:{ flexDirection:'row', gap:10, marginTop:6, marginBottom:6 },
  actionBtn:{ flex:1, height:44, borderRadius:10, alignItems:'center', justifyContent:'center' },
  actionText:{ fontWeight:'800' },
});
