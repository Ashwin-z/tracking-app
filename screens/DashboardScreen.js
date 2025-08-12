import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VehicleStatusDonut from '../components/VehicleStatusDonut';
import AlertTile from '../components/AlertTile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();

  const statusCounts = useMemo(() => ({
    running: 2, stopped: 2, idle: 2, offline: 0, noData: 0, expired: 0,
  }), []);
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const todayAlerts = useMemo(() => ([
    { key: 'geofence',    label: 'Geofence',        count: 0,  icon: 'map-outline',           color: '#8B5CF6', border: '#8B5CF6' },
    { key: 'overspeed',   label: 'Overspeed',       count: 4,  icon: 'speedometer-outline',   color: '#F59E0B', border: '#F59E0B' },
    { key: 'excessIdle',  label: 'Excess Idle',     count: 1,  icon: 'pause-circle-outline',  color: '#3B82F6', border: '#3B82F6' },
    { key: 'excessDrive', label: 'Excess Driving',  count: 0,  icon: 'time-outline',          color: '#06B6D4', border: '#06B6D4' },
    { key: 'ignition',    label: 'Ignition on/off', count: 64, icon: 'power-outline',         color: '#10B981', border: '#10B981' },
    { key: 'parked',      label: 'Parked',          count: 47, icon: 'car-outline',           color: '#EF4444', border: '#EF4444' },
  ]), []);
  const totalAlerts = todayAlerts.reduce((s, a) => s + a.count, 0);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (notification icon removed) */}
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </LinearGradient>

        {/* Vehicle Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Status</Text>
          <View style={styles.statusWrap}>
            <VehicleStatusDonut
              size={190}
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
              segmentGapDeg={0.5}     // tiny gap
              centerFill="#CBD5E1"
            />
            <View style={styles.legend}>
              {[
                { dot: '#22C55E', label: 'Running' },
                { dot: '#EF4444', label: 'Stopped' },
                { dot: '#F59E0B', label: 'Idle' },
                { dot: '#6B7280', label: 'Offline' },
                { dot: '#A3A3A3', label: 'No Data' },
                { dot: '#9CA3AF', label: 'Expired' },
              ].map((row) => (
                <View key={row.label} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: row.dot }]} />
                  <Text style={styles.legendText}>{row.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.card}>
          <View style={styles.alertHeader}>
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
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F6' },
  container: { flex: 1 },

  header: {
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },

  statusWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  legend: { marginLeft: 16, flex: 1, rowGap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: '#374151', fontSize: 14, fontWeight: '600', flexShrink: 1 },

  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
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
  totalAlertsText: { fontSize: 14, fontWeight: '900', color: '#111827' },

  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default DashboardScreen;
