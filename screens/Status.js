// screens/Status.js
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
  primary: '#10B981',
  primaryDark: '#065F46',
  bg: '#EEF2F6',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  sub: '#475569',
};

const STATUS_META = {
  running: { label: 'Running',  color: '#22C55E', bg: '#ECFDF5' },
  stopped: { label: 'Stopped',  color: '#EF4444', bg: '#FEF2F2' },
  idle:    { label: 'Idle',     color: '#F59E0B', bg: '#FFFBEB' },
  offline: { label: 'Offline',  color: '#6B7280', bg: '#F4F4F5' },
  nodata:  { label: 'No Data',  color: '#9CA3AF', bg: '#F5F5F5' },
  expired: { label: 'Expired',  color: '#94A3B8', bg: '#F8FAFC' },
};

const mockVehicles = [
  { id: 'AAT-826', group: 'Demo', status: 'idle',    speed: 0,  last: '2m 36s', address: 'Dhoké Kashmiran, Lahore, Pakistan', battery: '13.6V', gps: true,  net: true,  lock: true  },
  { id: 'ABV-074', group: 'Demo', status: 'running', speed: 73, last: '9s',     address: 'Hazro Tehsil, Attock, Punjab, Pakistan', battery: '12.9V', gps: true,  net: true,  lock: false },
  { id: 'AHX-383', group: 'Demo', status: 'stopped', speed: 0,  last: '56s',    address: 'Karachi, Sindh, Pakistan', battery: '0V',    gps: false, net: true,  lock: true  },
  { id: 'KLM-221', group: 'Demo', status: 'offline', speed: 0,  last: '1h 12m', address: 'Faisalabad, Punjab, Pakistan', battery: '—',  gps: false, net: false, lock: false },
  { id: 'NOP-552', group: 'Demo', status: 'idle',    speed: 0,  last: '40s',    address: 'Rawalpindi, Punjab, Pakistan', battery: '12.4V', gps: true, net: true, lock: true },
];

export default function StatusScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all'); // all | running | stopped | idle | offline | nodata | expired

  // animated background (subtle)
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

  const counts = useMemo(() => {
    const base = { total: mockVehicles.length, running:0, stopped:0, idle:0, offline:0, nodata:0, expired:0 };
    for (const v of mockVehicles) base[v.status] += 1;
    return base;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockVehicles.filter(v => {
      const byTab = tab === 'all' ? true : v.status === tab;
      const byQuery = !q || v.id.toLowerCase().includes(q) || v.group.toLowerCase().includes(q);
      return byTab && byQuery;
    });
  }, [tab, query]);

  const renderChip = (key, label, color, value) => (
    <Pressable
      key={key}
      onPress={() => setTab(key)}
      style={[
        styles.chip,
        { borderColor: color, backgroundColor: tab === key ? color + '1A' : '#FFFFFF' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.chipLabel}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{value}</Text>
      </View>
    </Pressable>
  );

  const ListHeader = (
    <>
      {/* Gradient header (card-style like other screens) */}
      <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
        <Text style={styles.headerTitle}>Status</Text>
        <Text style={styles.headerSub}>Live snapshot of all vehicles</Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginLeft: 10 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Vehicle or Group"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      {/* Summary chips */}
      <View style={styles.chipRow}>
        {renderChip('all',     'Total',   THEME.primary, counts.total)}
        {renderChip('running', 'Running', STATUS_META.running.color, counts.running)}
        {renderChip('stopped', 'Stopped', STATUS_META.stopped.color, counts.stopped)}
        {renderChip('idle',    'Idle',    STATUS_META.idle.color, counts.idle)}
        {renderChip('offline', 'Offline', STATUS_META.offline.color, counts.offline)}
        {renderChip('nodata',  'No data', STATUS_META.nodata.color, counts.nodata)}
        {renderChip('expired', 'Expired', STATUS_META.expired.color, counts.expired)}
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 },
      ]}
    >
      {/* background layer */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[THEME.primary + '22', THEME.primary + '11', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 220 : 200 }}
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
            { backgroundColor: '#065F46' + '14', bottom: -50, left: -60, width: 220, height: 220, transform: [{ translateY: down }, { scale: scaleB }] },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VehicleCard item={item} />}
        style={{ flex: 1 }}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="car-outline" size={28} color="#94A3B8" />
            <Text style={{ color: '#94A3B8', marginTop: 8 }}>No vehicles match your filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function VehicleCard({ item }) {
  const meta = STATUS_META[item.status] ?? { color: '#CBD5E1', bg: '#F8FAFC' };

  return (
    <View style={[styles.card, { backgroundColor: THEME.card, borderColor: meta.color + '55' }]}>
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: meta.color }]} />

      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.plate, { backgroundColor: meta.color }]}>
          <Text style={styles.plateText}>{item.id}</Text>
        </View>
        <View style={styles.groupPill}>
          <Text style={styles.groupLabel}>Group: </Text>
          <Text style={[styles.groupValue, { color: THEME.primaryDark }]}>{item.group}</Text>
        </View>
      </View>

      {/* Main */}
      <View style={styles.mainRow}>
        {/* Left info */}
        <View style={{ flex: 1, paddingRight: 8 }}>
          <InfoRow icon="speedometer-outline" color={meta.color}>
            <Text style={styles.infoText}>
              Speed: <Text style={styles.bold}>{item.speed}</Text> km/h
            </Text>
          </InfoRow>
          <InfoRow icon="time-outline" color={meta.color}>
            <Text style={styles.infoText}>
              Status: <Text style={styles.bold}>{STATUS_META[item.status]?.label || item.status}</Text>
            </Text>
          </InfoRow>
          <InfoRow icon="refresh-outline" color={meta.color}>
            <Text style={styles.infoText}>
              Update: <Text style={styles.bold}>{item.last}</Text>
            </Text>
          </InfoRow>

          {/* Indicators */}
          <View style={styles.indicatorRow}>
            <MiniIcon name="wifi"          off={!item.net} />
            <MiniIcon name="navigate"      off={!item.gps} />
            <MiniIcon name={item.lock ? 'lock-closed' : 'lock-open'} off={!item.lock} />
            <MiniIcon name="battery-half"  label={item.battery} />
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>

        {/* Right badge */}
        <View style={[styles.sideBadge, { borderColor: meta.color + '55' }]}>
          <View style={[styles.sideIconWrap, { backgroundColor: meta.color + '18' }]}>
            <Ionicons name="car-outline" size={22} color={meta.color} />
          </View>
        </View>
      </View>
    </View>
  );
}

function InfoRow({ icon, color, children }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={color} style={{ width: 18 }} />
      {children}
    </View>
  );
}

function MiniIcon({ name, off = false, label }) {
  const color = off ? '#94A3B8' : THEME.primary;
  return (
    <View style={[styles.miniIcon, { backgroundColor: color + '1A', borderColor: color + '66' }]}>
      <Ionicons name={name} size={12} color={color} />
      {label ? <Text style={[styles.miniLabel, { color }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },

  /* background blobs */
  blob: { position: 'absolute', width: 180, height: 180, borderRadius: 9999 },

  /* Header (card-style) */
  header: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.92)', marginTop: 2, fontSize: 12, fontWeight: '600' },

  /* Search */
  searchWrap: {
    marginTop: 10,
    marginHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 14, color: THEME.text },

  /* Chips */
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  chip: {
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  chipLabel: { color: THEME.text, fontWeight: '700', marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  /* Cards */
  card: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    backgroundColor: THEME.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accent: { height: 3, borderRadius: 3, marginHorizontal: -12, marginTop: -12, marginBottom: 8 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plate: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  plateText: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  groupPill: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  groupLabel: { color: '#64748B', fontSize: 12, marginRight: 2 },
  groupValue: { fontSize: 12, fontWeight: '700' },

  mainRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { color: THEME.sub, fontSize: 13, marginLeft: 6 },
  bold: { color: THEME.text, fontWeight: '800' },

  indicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  miniIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  miniLabel: { fontSize: 11, fontWeight: '700' },

  address: { color: '#64748B', fontSize: 12, marginTop: 8 },

  sideBadge: { width: 56, alignItems: 'center', borderLeftWidth: 1, paddingLeft: 10 },
  sideIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
