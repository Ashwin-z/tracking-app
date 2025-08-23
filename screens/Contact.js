// screens/Contact.js
import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Platform, StatusBar,
  TouchableOpacity, Linking, Alert, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
  primary: '#10B981', dark: '#065F46', text: '#0F172A', sub: '#475569',
  card: '#FFFFFF', bg: '#EEF2F6', border: '#E5E7EB',
};

// Targets
const PHONE_DISPLAY = '+92 03363694133';
const PHONE_E164    = '+923363694133';  // canonical
const WA_PHONE      = '923363694133';
const WEBSITE       = 'https://ashwin-dev-portfolio.netlify.app';
const EMAIL         = 'girachashwin048@gmail.com';
const IG            = 'https://instagram.com/ashwin_khatri5';
const FB            = 'https://facebook.com';

// Address
const ADDRESS_ONE_LINE = 'Office 6969, Main Hq, Floor 5 Block B, Hyderabad, Sindh, Pakistan';
const ADDRESS_MULTI    = 'Office 6969, Main Hq, Floor 5 Block B\nHyderabad, Sindh, Pakistan';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  // Hero animation
  const pulse = useRef(new Animated.Value(0)).current;
  const spin  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 6000, useNativeDriver: true })).start();
  }, [pulse, spin]);

  const ringScale   = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  // Background blobs (same vibe as Settings)
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

  const openURL = async (url) => {
    try { await Linking.openURL(url); } catch { Alert.alert('Unable to open', url); }
  };
  const sanitizePhone = (s) => (s || '').replace(/[^\d+]/g, '').replace(/^00/, '+');

  const onCall = async () => {
    const number = sanitizePhone(PHONE_E164 || PHONE_DISPLAY);
    try {
      await Linking.openURL(`tel:${number}`);      // Android/iOS
    } catch {
      try { await Linking.openURL(`telprompt:${number}`); }
      catch { Alert.alert('Unable to open dialer', number); }
    }
  };
  const onWhatsApp  = async () => {
    const app = `whatsapp://send?phone=${WA_PHONE}`;
    const web = `https://wa.me/${WA_PHONE}`;
    const can = await Linking.canOpenURL(app);
    openURL(can ? app : web);
  };
  const onWebsite   = () => openURL(WEBSITE);
  const onEmail     = () => openURL(`mailto:${EMAIL}?subject=${encodeURIComponent('Inquiry')}`);
  const onInstagram = () => openURL(IG);
  const onFacebook  = () => openURL(FB);

  const openMaps = () => {
    const q = encodeURIComponent(ADDRESS_ONE_LINE);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    });
    openURL(url);
  };

  const comingSoon = (title) => Alert.alert(title, 'Coming soon');

  return (
    <SafeAreaView
      style={[styles.safe, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 }]}
    >
      {/* Animated background behind content */}
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient header for consistency */}
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
          <Text style={styles.headerTitle}>Contact Us</Text>
        </LinearGradient>

        {/* Hero */}
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.hero}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.ringSmall, { opacity: ringOpacity }]} />
          <View style={styles.heroBadge}><Ionicons name="chatbubbles-outline" size={30} color="#fff" /></View>
          <Text style={styles.heroCaption}>We’re here to help</Text>
        </LinearGradient>

        {/* Actions grid */}
        <View style={styles.grid}>
          <Action icon="call-outline"        label="Call"      onPress={onCall}     tint={THEME.primary} />
          <Action icon="mail-outline"        label="Email"     onPress={onEmail}    tint="#3B82F6" />
          <Action icon="globe-outline"       label="Website"   onPress={onWebsite}  tint="#06B6D4" />
          <Action icon="logo-whatsapp"       label="WhatsApp"  onPress={onWhatsApp} tint="#22C55E" />
          <Action icon="logo-facebook"       label="Facebook"  onPress={onFacebook} tint="#1D4ED8" />
          <Action icon="logo-instagram"      label="Instagram" onPress={onInstagram}tint="#EF4444" />
        </View>

        {/* Quick links (labels only) */}
        <View style={styles.card}>
          <Row icon="call-outline" tint={THEME.primary} title="Phone Number" subtitle="Tap to call or use WhatsApp" onPress={onCall} />
          <Divider />
          <Row icon="mail-outline" tint="#3B82F6" title="Email" subtitle="Send us a message" onPress={onEmail} />
          <Divider />
          <Row icon="globe-outline" tint="#06B6D4" title="Website" subtitle="Open in browser" onPress={onWebsite} />
        </View>

        {/* Links / Policies */}
        <View style={styles.card}>
          <LinkRow title="Terms and Conditions" onPress={() => comingSoon('Terms and Conditions')} />
          <Divider />
          <LinkRow title="Privacy Policy" onPress={() => comingSoon('Privacy Policy')} />
          <Divider />
          <LinkRow title="Company News" onPress={() => comingSoon('Company News')} />
        </View>

        {/* Office Address */}
        <View style={styles.card}>
          <View style={styles.addrHeader}>
            <Ionicons name="location-outline" size={18} color={THEME.primary} />
            <Text style={styles.addrTitle}>Office Address</Text>
          </View>
          <Text style={styles.addrText}>{ADDRESS_MULTI}</Text>
          <TouchableOpacity onPress={openMaps} activeOpacity={0.9} style={styles.directionsBtn}>
            <Ionicons name="navigate-outline" size={16} color="#fff" />
            <Text style={styles.directionsText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- small UI components --- */

function Action({ icon, label, onPress, tint }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.action}>
      <View style={[styles.actionIcon, { backgroundColor: `${tint}1A`, borderColor: `${tint}55` }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Row({ icon, tint, title, subtitle, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: `${tint}1A`, borderColor: `${tint}55` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function LinkRow({ title, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.linkRow}>
      <Text style={styles.linkText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function Divider() { return <View style={styles.divider} />; }

/* --- styles --- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },

  // gradient header (consistent)
  header:{
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },

  // background blobs
  blob:{ position:'absolute', width:180, height:180, borderRadius:9999 },

  hero: {
    marginHorizontal: 12, marginBottom: 12, borderRadius: 16,
    paddingVertical: 22, alignItems: 'center', overflow: 'hidden',
  },
  ring: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  ringSmall: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  heroBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  heroCaption: { color: '#fff', fontWeight: '800', marginTop: 8 },

  grid: { marginHorizontal: 12, marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  action: { width: '32%', alignItems: 'center' },
  actionIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionLabel: { marginTop: 6, fontWeight: '700', color: THEME.text, fontSize: 12, textAlign: 'center' },

  card: { marginHorizontal: 12, marginTop: 10, backgroundColor: THEME.card, borderRadius: 14, borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 10, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rowTitle: { color: THEME.text, fontWeight: '700' },
  rowSub: { color: THEME.sub, fontSize: 12, marginTop: 2 },

  linkRow: { height: 48, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: THEME.border, marginVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { color: THEME.text, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 8 },

  addrHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  addrTitle: { fontWeight: '800', color: THEME.text },
  addrText: { color: THEME.sub, lineHeight: 20, marginBottom: 10 },
  directionsBtn: { alignSelf: 'flex-start', backgroundColor: THEME.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  directionsText: { color: '#fff', fontWeight: '800' },
});
