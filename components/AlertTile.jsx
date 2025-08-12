import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertTile = ({ label, count, icon, color, borderColor, onPress = () => {} }) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: (color || '#e5e7eb') + '44', radius: 120 }}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: borderColor || color },
        pressed && Platform.OS === 'ios' ? { opacity: 0.92 } : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: (color || '#000') + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={styles.label} numberOfLines={2} ellipsizeMode="tail">
        {label}
      </Text>

      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    minHeight: 100,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1.6,
    backgroundColor: '#F8FAFC',
    alignItems: 'center', // center icon + text
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    position: 'relative',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 16,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});

export default AlertTile;
