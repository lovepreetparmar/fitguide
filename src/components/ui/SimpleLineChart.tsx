import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

interface ChartDataPoint {
  x: number;
  y: number;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  label?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function SimpleLineChart({
  data,
  color = '#6C63FF',
  height = 180,
  label,
}: SimpleLineChartProps) {
  if (data.length < 2) {
    return (
      <View className="items-center justify-center" style={{ height }}>
        <Text className="text-text-secondary">Not enough data</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 72;
  const padding = { top: 20, right: 16, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const yValues = data.map((d) => d.y);
  const minY = Math.min(...yValues) - 1;
  const maxY = Math.max(...yValues) + 1;
  const yRange = maxY - minY || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.y - minY) / yRange) * innerHeight,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  return (
    <View>
      {label && <Text className="mb-2 text-sm text-text-secondary">{label}</Text>}
      <Svg width={chartWidth} height={height}>
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + innerHeight * (1 - ratio);
          const value = (minY + yRange * ratio).toFixed(1);
          return (
            <React.Fragment key={ratio}>
              <Line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#2A2A2A"
                strokeDasharray="4,4"
              />
              <SvgText x={4} y={y + 4} fill="#666666" fontSize={10}>
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Path d={areaPath} fill={`${color}20`} />
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Path
              d={`M ${p.x} ${p.y} m -3, 0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0`}
              fill={color}
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
