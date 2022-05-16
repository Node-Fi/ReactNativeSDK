import * as React from 'react';
import {
  Animated,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useBalances,
  useRemoveToken,
  useTokenPrice,
  useWallet,
} from '@node-fi/react-native-sdk';
import { Token } from '@node-fi/sdk-core';
import { layout, text } from '../styles/styles';
import { formatTokenAmount, shortenAddress } from '../utils';

import CurrencyLogo from './TokenLogo';
import { InfoRow, Text, ViewProps } from './ThemedComponents';
import BigNumber from 'bignumber.js';
import { getColor } from '../styles/colors';

type PropTypes = ViewProps & {
  readonly token: Token;
  readonly priceMultiplier?: (p: number) => number;
  readonly sizeMultiplier?: number;
};

export const InfoBlock = ({
  top,
  bottom,
  bottomColor,
  topStyle,
  bottomStyle,
  style,
}: {
  readonly top: string;
  readonly bottom: string;
  readonly bottomColor?: string;
  readonly topStyle?: TextStyle;
  readonly bottomStyle?: TextStyle;
} & ViewProps) => (
  <View style={[layout.column, { marginLeft: 0 }, style]}>
    <Text
      style={[
        text.h2,
        text.strong,
        { fontWeight: '700', textAlign: 'right' },
        topStyle,
      ]}
    >
      {top}
    </Text>
    <Text
      style={[
        { fontSize: 12 },
        bottomStyle,
        bottomColor ? { color: bottomColor, textAlign: 'right' } : {},
      ]}
    >
      {bottom}
    </Text>
  </View>
);

const TokenDetails = ({ token }: { token: Token }) => {
  const remove = useRemoveToken();
  const balances = useBalances();
  const balance =
    balances[token.address] ?? balances[token.address.toLowerCase()];
  const wallet = useWallet();

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <InfoRow left="Name" right={token.name} />
      <InfoRow left="Balance" right={balance?.toFixed(2) ?? '0.00'} />
      <InfoRow left="Address" right={shortenAddress(token.address)} />
      <TouchableOpacity
        onPress={() => remove(token.address)}
        style={{
          backgroundColor: getColor('red', 0.9),
          marginTop: 10,
          padding: 10,
          borderRadius: 13,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Remove</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          try {
            const resp = await wallet.transferToken(
              token,
              new BigNumber('1000'),
              wallet.address
            );
            console.log(resp);
          } catch (e) {
            console.error(e);
            try {
              const resp = await wallet.transferToken(
                token.address,
                new BigNumber('1000'),
                wallet.address
              );
              console.log(resp);
            } catch (e) {
              console.error(e);
            }
          }
        }}
        style={{
          backgroundColor: getColor('green', 0.9),
          marginTop: 10,
          padding: 10,
          borderRadius: 13,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Send from Wallet
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          try {
            const resp = await token.send(
              new BigNumber('100'),
              wallet,
              wallet.address
            );
            console.log(resp);
          } catch (e) {
            console.error(e);
          }
        }}
        style={{
          backgroundColor: getColor('blue', 0.9),
          marginTop: 10,
          padding: 10,
          borderRadius: 13,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Send from Token
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const TokenRow = ({
  token,
  priceMultiplier = (p) => p,
  sizeMultiplier = 1,
}: PropTypes) => {
  const priceData = useTokenPrice(token.address);
  const currentPrice = priceData?.current; //useTokenPrice(token.address);
  const previousDayPrice = priceData?.yesterday;
  const priceChange = currentPrice ? currentPrice - previousDayPrice : 0;
  const percentChange =
    previousDayPrice && previousDayPrice > 0
      ? (priceChange / previousDayPrice) * 100
      : 0; //currentPrice.divide(priceChange);
  const negative = priceChange < 0;
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[layout.row, styles.actionRow]}
        onPress={() => setShowDetails((b) => !b)}
      >
        <View style={[layout.row, { height: 80 }]}>
          <CurrencyLogo currency={token} size={50 * sizeMultiplier} />
          <InfoBlock
            top={token.symbol}
            topStyle={{ fontWeight: '600', textAlign: 'left' }}
            bottom={token.name}
            style={{ marginLeft: 5 }}
          />
        </View>
        <InfoBlock
          top={`$${formatTokenAmount(priceMultiplier(currentPrice ?? 1))}`}
          bottom={`${percentChange.toFixed(1)}% (${
            negative ? '-' : '+'
          }$${formatTokenAmount(priceChange)})`}
          bottomColor={negative ? 'red' : 'green'}
        />
      </TouchableOpacity>
      {showDetails ? <TokenDetails token={token} /> : null}
    </View>
  );
};

export default TokenRow;

const styles = StyleSheet.create({
  actionRow: {
    paddingHorizontal: 20,
    minHeight: 80,
    justifyContent: 'space-between',
  },
});
