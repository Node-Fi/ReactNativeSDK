import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NodeKitProvider } from '@node-fi/react-native-sdk';
import { CreateWallet } from './CreateWallet';
import { env } from 'process';
import { TokenList } from './TokenList';
import { SUPPORTED_TOKENS, TOKEN_OVERRIDES } from './constants/Tokens';
import { ChainId, Token } from '@node-fi/sdk-core';
import { KeychainButton } from './components/Keychain';

export const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  // eslint-disable-next-line react-native/no-color-literals
  white: { backgroundColor: 'white' },
  red: { backgroundColor: 'red' },
  blue: { backgroundColor: 'blue' },
  square: { width: 100, height: 100 },
});

export default function App(): JSX.Element {
  const loadingComponent = (
    <View style={[StyleSheet.absoluteFill, styles.center, styles.blue]}>
      <Text>Loading</Text>
    </View>
  );

  return (
    <NodeKitProvider
      loadingComponent={loadingComponent}
      eoaOnly
      apiKey={env.NODE_API_KEY}
      tokenWhitelist={new Set(SUPPORTED_TOKENS)}
      tokenDetailsOverride={TOKEN_OVERRIDES}
      customTokens={[
        new Token(
          44787,
          '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
          18,
          'cUSD',
          'Cello Dollar'
        ),
      ]}
      chainId={ChainId.Alfajores}
    >
      <SafeAreaView style={[styles.center, styles.white]}>
        <CreateWallet />
        <TokenList />
        <KeychainButton />
      </SafeAreaView>
    </NodeKitProvider>
  );
}
