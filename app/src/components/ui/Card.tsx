import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Props extends ViewProps {
  padding?: number;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ padding = 16, elevated = false, style, children, ...rest }: Props) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          padding,
          borderWidth: elevated ? 0 : 1,
          borderColor: colors.hairline,
        },
        elevated ? colors.shadow.soft : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
