// screens/Alerts.js
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
  primary: '#10B981',
  dark: '#065F46',
  text: '#0F172A',
  sub: '#475569',
  card: '#FFFFFF',
  bg: '#EEF2F6',
  border: '#E5E7EB',
  chip: '#F1F5F9',
};

const CHIP_HEIGHT = 34;
const GAP_BELOW_FILTERS = 12;
const FILTERS = ['All', 'Ignition', 'Overspeed', 'Parked', 'Geofence', 'Data Lost'];

const ICONS = {
  ignition_on:  { name: 'flash-outline',         tint: '#10B981', label: 'Ignition ON',    group: 'Ignition' },
  ignition_off: { name: 'flash-off-outline',     tint: '#EF4444', label: 'Ignition OFF',   group: 'Ignition' },
  overspeed:    { name: 'speedometer-outline',   tint: '#F59E0B', label: 'Overspeed',      group: 'Overspeed' },
  parked:       { name: 'car-outline',           tint: '#EF4444', label: 'Parked',         group: 'Parked' },
  geofence_in:  { name: 'map-outline',           tint: '#8B5CF6', label: 'Geofence Enter', group: 'Geofence' },
  geofence_out: { name: 'map-outline',           tint: '#6366F1', label: 'Geofence Exit',  group: 'Geofence' },
  data_lost:    { name: 'cloud-offline-outline', tint: '#6B7280', label: 'Data Lost',      group: 'Data Lost' },
};

// demo data
const SEED_ALERTS = [
  { id: '1', vehicle: 'AAT-826', type: 'ignition_on',  at: Date.now() - 60_000 },
  { id: '2', vehicle: 'ABV-074', type: 'ignition_on',  at: Date.now() - 90_000 },
  { id: '3', vehicle: 'AHX-383', type: 'ignition_off', at: Date.now() - 120_000 },
  { id: '4', vehicle: 'ACG-953', type: 'parked',       at: Date.now() - 3_600_000 },
  { id: '5', vehicle: 'AAT-826', type: 'overspeed',    at: Date.now() - 9_000_000 },
  { id: '6', vehicle: 'ABV-074', type: 'data_lost',    at: Date.now() - 10_000_000 },
  { id: '7', vehicle: 'AHX-383', type: 'geofence_in',  at: Date.now() - 11_000_000 },
  { id: '8', vehicle: 'AHX-383', type: 'geofence_out', at: Date.now() - 12_000_000 },
];

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState(SEED_ALERTS);

  // animated background (subtle blobs)
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

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((a) => {
      const meta = ICONS[a.type];
      const matchFilter = filter === 'All' || (meta && meta.group === filter);
      const matchQuery =
        !q ||
        a.vehicle.toLowerCase().includes(q) ||
        (meta?.label.toLowerCase() ?? '').includes(q);
      return matchFilter && matchQuery;
    });
  }, [alerts, query, filter]);

  const renderItem = useCallback(({ item }) => <AlertRow item={item} />, []);
  const keyExtractor = useCallback((item) => item.id, []);

  const onTrash = useCallback(() => {
    if (data.length === 0) return;
    const label = filter === 'All' && !query ? 'all alerts'
      : `these ${data.length} alert${data.length > 1 ? 's' : ''}`;
    Alert.alert('Delete', `Remove ${label} from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          setAlerts((prev) => {
            const remove = new Set(data.map((d) => d.id));
            return prev.filter((a) => !remove.has(a.id));
          }),
      },
    ]);
  }, [data, filter, query]);

  const trashDisabled = data.length === 0;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 },
      ]}
    >
      {/* animated background layer */}
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

      {/* Gradient header for consistency */}
      <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
        <Text style={styles.headerTitle}>Events & Alerts</Text>
        <TouchableOpacity
          activeOpacity={trashDisabled ? 1 : 0.9}
          style={[styles.trashBtn, trashDisabled && { opacity: 0.5 }]}
          onPress={onTrash}
          disabled={trashDisabled}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginLeft: 10 }} />
        <TextInput
          placeholder="Search Vehicle or Alert"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 0 }}
      >
        {FILTERS.map((f) => (
          <FilterChip key={f} label={f} active={f === filter} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {/* Consistent spacer below filters */}
      <View style={{ height: GAP_BELOW_FILTERS }} />

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 110 + insets.bottom }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyText}>No alerts found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ---- UI bits ---- */

const FilterChip = React.memo(function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#00000022', borderless: false }}
      style={[
        styles.chip,
        active && { backgroundColor: THEME.primary + '22', borderColor: THEME.primary },
      ]}
    >
      <Text
        style={[styles.chipText, active && { color: THEME.primary, fontWeight: '800' }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const AlertRow = React.memo(function AlertRow({ item }) {
  const meta = ICONS[item.type] || {};
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.row}>
      <View style={[styles.leftIcon, { backgroundColor: (meta.tint || '#64748B') + '1A' }]}>
        <Ionicons name={meta.name || 'alert-outline'} size={18} color={meta.tint || '#64748B'} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleBadgeText}>{item.vehicle}</Text>
        </View>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {meta.label || 'Alert'}
        </Text>
      </View>

      <View style={styles.rightBox}>
        <Text style={styles.rowTime}>{formatDate(item.at)}</Text>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },

  // background blobs
  blob: { position: 'absolute', width: 180, height: 180, borderRadius: 9999 },

  header: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '800' },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  searchWrap: {
    marginTop: 10,
    marginHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 14, color: THEME.text },

  chip: {
    marginBottom: 18,
    height: CHIP_HEIGHT,
    minWidth: 64,
    paddingHorizontal: 12,
    backgroundColor: THEME.chip,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: THEME.sub,
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 16,
    textAlignVertical: 'center',
  },

  row: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  leftIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  vehicleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  vehicleBadgeText: { fontSize: 11, fontWeight: '800', color: '#7C2D12' },

  rowTitle: { fontSize: 14, color: THEME.text, fontWeight: '800' },

  rightBox: { alignItems: 'flex-end', marginLeft: 10 },
  rowTime: { fontSize: 11, color: '#64748B', marginBottom: 4 },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { marginTop: 8, color: '#94A3B8', fontWeight: '700' },
});
