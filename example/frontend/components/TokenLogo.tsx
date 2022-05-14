import React, { useMemo } from 'react';
import { Image, ImageStyle } from 'react-native';
import { Token } from '@node-fi/sdk-core';

export default function CurrencyLogo({
  currency,
  size = 24,
  style,
}: {
  readonly currency?: Token;
  readonly size?: number;
  readonly style?: ImageStyle;
}) {
  return (
    <Image
      //size={size}
      source={{ uri: currency.imageUri }}
      style={[
        {
          transform: [{ translateX: -3 }],
          marginRight: 4,
          width: size,
          height: size,
          borderRadius: size * 10,
        },
        style,
      ]}
      //   style={style}
    />
  );
}
