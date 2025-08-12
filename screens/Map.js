// screens/Map.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_PRIMARY = '#10B981';
const THEME_DARK = '#065F46';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 31.5204,   // Lahore fallback
    longitude: 74.3587,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  });
  const [hasTraffic, setHasTraffic] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const next = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(next);
        mapRef.current?.animateToRegion(next, 800);
      } catch {
        // keep fallback region
      }
    })();
  }, []);

  const recenter = () => {
    if (!region) return;
    mapRef.current?.animateToRegion(region, 700);
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 0 },
      ]}
    >
      <View style={styles.root}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={region}
          mapType="standard"                // correct casing
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
          showsTraffic={hasTraffic}
        >
          {/* Demo marker; replace when you have real data */}
          <Marker
            coordinate={{ latitude: 31.55, longitude: 74.35 }}
            title="Demo vehicle"
            description="No live data yet"
          >
            <Ionicons name="car-sport" size={24} color={THEME_PRIMARY} />
          </Marker>
        </MapView>

        {/* Top search bar (UI only) */}
        <View style={[styles.searchWrap, { marginTop: 8 }]}>
          <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Search vehicle..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* Right-side floating actions */}
        <View style={[styles.fabColumn, { bottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: THEME_PRIMARY }]}
            onPress={recenter}
            activeOpacity={0.85}
          >
            <Ionicons name="locate-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: THEME_DARK }]}
            onPress={() => setHasTraffic(v => !v)}
            activeOpacity={0.85}
          >
            <Ionicons name="layers-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F6' },
  root: { flex: 1 },
  searchWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 14, color: '#111827' },
  fabColumn: { position: 'absolute', right: 12, alignItems: 'center', gap: 12 },
  fab: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
});
