import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors } from '../../utils/colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, padded = true, elevated = false, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  padded: {
    padding: 20,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
