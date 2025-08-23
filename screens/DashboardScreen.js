// screens/DashboardScreen.js
import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VehicleStatusDonut from '../components/VehicleStatusDonut';
import AlertTile from '../components/AlertTile';

const { width } = Dimensions.get('window');

const THEME = {
  bg: '#EEF2F6',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  sub: '#334155',
  primary: '#10B981',
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  // breakpoints
  const isVeryNarrow = width < 360;
  const isNarrow = width < 400;

  // donut size that never overflows the card
  const donutSize = Math.min(220, Math.max(160, Math.floor(width * (isNarrow ? 0.72 : 0.52))));

  // animated background (subtle blobs for consistency)
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

  const statusCounts = useMemo(
    () => ({ running: 2, stopped: 2, idle: 2, offline: 0, noData: 0, expired: 0 }),
    []
  );
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const todayAlerts = useMemo(
    () => [
      { key: 'geofence',    label: 'Geofence',        count: 0,  icon: 'map-outline',            color: '#8B5CF6', border: '#8B5CF6' },
      { key: 'overspeed',   label: 'Overspeed',       count: 4,  icon: 'speedometer-outline',    color: '#F59E0B', border: '#F59E0B' },
      { key: 'excessIdle',  label: 'Excess Idle',     count: 1,  icon: 'pause-circle-outline',   color: '#3B82F6', border: '#3B82F6' },
      { key: 'excessDrive', label: 'Excess Driving',  count: 0,  icon: 'time-outline',           color: '#06B6D4', border: '#06B6D4' },
      { key: 'ignition',    label: 'Ignition on/off', count: 64, icon: 'power-outline',          color: '#10B981', border: '#10B981' },
      { key: 'parked',      label: 'Parked',          count: 47, icon: 'car-outline',            color: '#EF4444', border: '#EF4444' },
    ],
    []
  );
  const totalAlerts = todayAlerts.reduce((s, a) => s + a.count, 0);

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
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 240 : 210 }}
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

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Overview of your fleet today</Text>
        </LinearGradient>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KPI label="Total" value={total} tint="#0EA5E9" />
          <KPI label="Running" value={statusCounts.running} tint="#22C55E" />
          <KPI label="Stopped" value={statusCounts.stopped} tint="#EF4444" />
        </View>

        {/* Vehicle Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Status</Text>

          <View style={[styles.statusWrap, isNarrow && styles.statusWrapCol]}>
            {/* Donut */}
            <View style={styles.donutHolder}>
              <VehicleStatusDonut
                size={donutSize}
                strokeWidth={24}
                data={[
                  { label: 'Running', value: statusCounts.running, color: '#22C55E' },
                  { label: 'Stopped', value: statusCounts.stopped, color: '#EF4444' },
                  { label: 'Idle',    value: statusCounts.idle,    color: '#F59E0B' },
                  { label: 'Offline', value: statusCounts.offline, color: '#6B7280' },
                  { label: 'No Data', value: statusCounts.noData,  color: '#A3A3A3' },
                  { label: 'Expired', value: statusCounts.expired, color: '#9CA3AF' },
                ]}
                total={total}
                segmentGapDeg={0.6}
                centerFill="#CBD5E1"
              />
            </View>

            {/* Legend + Matrix */}
            <View style={[styles.legendWrap, isNarrow && { marginTop: 14, marginLeft: 0 }]}>
              <View style={styles.legendGrid}>
                {[
                  { dot: '#22C55E', label: 'Running' },
                  { dot: '#EF4444', label: 'Stopped' },
                  { dot: '#F59E0B', label: 'Idle' },
                  { dot: '#6B7280', label: 'Offline' },
                  { dot: '#A3A3A3', label: 'No Data' },
                  { dot: '#9CA3AF', label: 'Expired' },
                ].map((row) => (
                  <View key={row.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: row.dot }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {row.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.matrixRow, isVeryNarrow && { gap: 6 }]}>
                <MatrixPill label="Running" value={statusCounts.running} tint="#22C55E" />
                <MatrixPill label="Stopped" value={statusCounts.stopped} tint="#EF4444" />
                <MatrixPill label="Idle" value={statusCounts.idle} tint="#F59E0B" />
                <MatrixPill label="Offline" value={statusCounts.offline} tint="#6B7280" />
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Alerts (Today)</Text>
            <View style={styles.totalAlerts}>
              <Text style={styles.totalAlertsText}>{totalAlerts}</Text>
            </View>
          </View>

          <View style={styles.tileGrid}>
            {todayAlerts.map((a) => (
              <AlertTile
                key={a.key}
                label={a.label}
                count={a.count}
                icon={a.icon}
                color={a.color}
                borderColor={a.border}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- Small UI bits --- */

function KPI({ label, value, tint }) {
  return (
    <View style={[styles.kpi, { borderColor: `${tint}55`, backgroundColor: `${tint}12` }]}>
      <Text style={[styles.kpiValue, { color: tint }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function MatrixPill({ label, value, tint }) {
  return (
    <View style={[styles.pill, { borderColor: `${tint}55`, backgroundColor: `${tint}10` }]}>
      <Text style={[styles.pillValue, { color: tint }]}>{value}</Text>
      <Text style={styles.pillLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  container: { flex: 1 },

  // background blobs
  blob:{ position:'absolute', width:180, height:180, borderRadius:9999 },

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

  /* KPIs */
  kpiRow: {
    marginTop: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpi: {
    width: '32%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  kpiValue: { fontSize: 18, fontWeight: '900', lineHeight: 22 },
  kpiLabel: { color: THEME.sub, marginTop: 2, fontWeight: '700', fontSize: 12 },

  /* Card */
  card: {
    backgroundColor: THEME.card,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: THEME.text, marginBottom: 8 },

  /* Vehicle status layout */
  statusWrap: { flexDirection: 'row', alignItems: 'flex-start', columnGap: 14 },
  statusWrapCol: { flexDirection: 'column' },

  donutHolder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },

  legendWrap: { flex: 1, marginLeft: 6 },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: '#374151', fontSize: 14, fontWeight: '700', flexShrink: 1 },

  matrixRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  pill: {
    flexGrow: 1,
    minWidth: '46%',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pillValue: { fontSize: 16, fontWeight: '900', lineHeight: 18 },
  pillLabel: { color: THEME.sub, fontSize: 12, fontWeight: '700', marginTop: 2 },

  /* Alerts */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalAlerts: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  totalAlertsText: { fontSize: 14, fontWeight: '900', color: THEME.text },

  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
