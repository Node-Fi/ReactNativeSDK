import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NodeKitProvider } from '@node-fi/node-sdk-react-native';
import { CreateWallet } from './CreateWallet';
import { env } from 'process';
import { TokenList } from './TokenList';
import { SUPPORTED_TOKENS, TOKEN_OVERRIDES } from './constants/Tokens';

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
      customTokens={[]}
    >
      <SafeAreaView style={[styles.center, styles.white]}>
        <CreateWallet />
        <TokenList />
      </SafeAreaView>
    </NodeKitProvider>
  );
}
