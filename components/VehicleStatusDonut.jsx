import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

const VehicleStatusDonut = ({
  size = 180,
  strokeWidth = 22,
  data = [],
  total = 0,
  trackColor = '#E5E7EB',
  centerFill = '#CBD5E1',
  segmentGapDeg = 0.5,   // very small gap
}) => {
  const radius = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  const circumference = 2 * Math.PI * radius;

  const totalGapDegrees = segmentGapDeg * Math.max(data.length, 1);
  const usableDegrees = 360 - totalGapDegrees;

  let startAngle = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G origin={`${cx}, ${cy}`}>
          {/* Background track */}
          <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} opacity={0.35} />
          {data.map((d, i) => {
            const sweep = (d.value / sum) * usableDegrees;
            const dash = (sweep / 360) * circumference;
            const gap = Math.max(0, circumference - dash);

            const node = (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="round"  // smoother joins, no “broken” edges
                fill="none"
                rotation={startAngle}
                origin={`${cx}, ${cy}`}
              />
            );
            startAngle += sweep + segmentGapDeg;
            return node;
          })}
        </G>
      </Svg>

      {/* Center disc + number */}
      <View
        style={[
          styles.centerFill,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: centerFill,
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.total}>{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerFill: { position: 'absolute' },
  total: { fontSize: 30, fontWeight: '900', color: '#111827' },
});

export default VehicleStatusDonut;
