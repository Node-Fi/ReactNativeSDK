import env from 'process';

import { NodeKitProvider } from '@node-fi/react-native-sdk';
import { ChainId, Token } from '@node-fi/sdk-core';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CreateWallet } from './CreateWallet';
import { TokenList } from './TokenList';
import GetMnemonicTest from './components/GetMnemonic';
import { KeychainButton } from './components/Keychain';
import SetDefaultCurrency from './components/SetDefaultCurrency';
import SignMessage from './components/SignMessage';
import { SyncPortfolioButton } from './components/SyncPortfolio';
import { SUPPORTED_TOKENS, TOKEN_OVERRIDES } from './constants/Tokens';
import { DEVICE_HEIGHT, DEVICE_WIDTH, layout } from './styles/styles';

export const styles = StyleSheet.create({
  center: { alignItems: 'center' },
   
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
      apiKey={'c72d0ce2d50a447d874da93b7e44abb1'} // sandbox api key - will only work on alfajores
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
        new Token(
          44787,
          '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
          18,
          'CELO',
          'Cello'
        ),
      ]}
      chainId={ChainId.Alfajores}
    >
      <SafeAreaView style={[StyleSheet.absoluteFill, layout.centered]}>
        <ScrollView>
          <CreateWallet />
          {/* <TokenList /> */}
          {/* <KeychainButton />
            <SyncPortfolioButton />
            <SetDefaultCurrency />
            <GetMnemonicTest /> */}
          <SignMessage />
        </ScrollView>
      </SafeAreaView>
    </NodeKitProvider>
  );
}
