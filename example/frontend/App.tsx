import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NodeKitProvider } from '@node-fi/node-sdk-react-native';
import { CreateWallet } from './CreateWallet';

export const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
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
    <NodeKitProvider loadingComponent={loadingComponent} eoaOnly>
      <View style={[StyleSheet.absoluteFill, styles.center, styles.white]}>
        <CreateWallet />
      </View>
    </NodeKitProvider>
  );
}
