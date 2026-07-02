import React from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type PremiumActionButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PremiumActionButton({
  title,
  subtitle,
  icon = 'arrow-forward',
  loading = false,
  variant = 'primary',
  compact = false,
  style,
  disabled,
  ...props
}: PremiumActionButtonProps) {
  if (variant === 'secondary') {
    return (
      <Pressable
        {...props}
        disabled={disabled || loading}
        className="overflow-hidden rounded-full"
        style={[
          {
            minHeight: compact ? 56 : 64,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            paddingHorizontal: compact ? 22 : 28,
            justifyContent: 'center',
            opacity: disabled || loading ? 0.6 : 1,
          },
          style,
        ]}
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text className={`text-white ${compact ? 'text-[15px]' : 'text-[17px]'} font-bold`}>
                {title}
              </Text>
              {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color="#FFFFFF" style={{ marginLeft: 10 }} /> : null}
            </>
          )}
        </View>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable
        {...props}
        disabled={disabled || loading}
        className="overflow-hidden rounded-full"
        style={[
          {
            minHeight: compact ? 56 : 64,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(255,90,95,0.35)',
            backgroundColor: 'rgba(255,90,95,0.12)',
            paddingHorizontal: compact ? 22 : 28,
            justifyContent: 'center',
            opacity: disabled || loading ? 0.6 : 1,
          },
          style,
        ]}
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator color="#FF5A5F" />
          ) : (
            <>
              <Text className={`text-[#FF5A5F] ${compact ? 'text-[15px]' : 'text-[17px]'} font-bold`}>
                {title}
              </Text>
              {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color="#FF5A5F" style={{ marginLeft: 10 }} /> : null}
            </>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className="overflow-hidden rounded-full"
      style={[
        {
          borderRadius: 999,
          shadowColor: '#0076FC',
          shadowOpacity: 0.32,
          shadowRadius: compact ? 16 : 20,
          shadowOffset: { width: 0, height: compact ? 10 : 12 },
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['#4AA3FF', '#0076FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: compact ? 56 : 64,
          borderRadius: 999,
          paddingHorizontal: compact ? 22 : 28,
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : subtitle ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-white">{title}</Text>
              <Text className="mt-1 text-sm text-white/75">{subtitle}</Text>
            </View>
            {icon ? <Ionicons name={icon} size={20} color="#FFFFFF" /> : null}
          </View>
        ) : (
          <View className="flex-row items-center justify-center">
            <Text className={`text-white ${compact ? 'text-[15px]' : 'text-[17px]'} font-bold`}>
              {title}
            </Text>
            {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color="#FFFFFF" style={{ marginLeft: 10 }} /> : null}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
