import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Primary uses a gradient; others use flat background
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        {...rest}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.sage, Colors.sageDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyles[size], isDisabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.offwhite} size="small" />
          ) : (
            <Text style={[styles.text, textSizeStyles[size], styles.textPrimary]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...rest}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? Colors.sand : Colors.offwhite}
          size="small"
        />
      ) : (
        <Text style={[styles.text, textSizeStyles[size], textVariantStyles[variant]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: Colors.offwhite,
  },
  disabled: {
    opacity: 0.45,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: 16, minWidth: 80 },
  md: { paddingVertical: 14, paddingHorizontal: 24, minWidth: 120 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, minWidth: 160 },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
});

const variantStyles = StyleSheet.create({
  primary: {},
  secondary: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
  },
  danger: {
    backgroundColor: Colors.blushDark,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: Colors.offwhite },
  secondary: { color: Colors.sand },
  ghost: { color: Colors.sand },
  danger: { color: Colors.offwhite },
});
