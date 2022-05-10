import * as React from 'react';
import { useCreateWallet, useWallet } from '@node-fi/node-sdk-react-native';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './App';
import { useDeleteWallet } from '@node-fi/node-sdk-react-native/lib/typescript/WalletContext';
export function CreateWallet() {
  const wallet = useWallet();
  const createWallet = useCreateWallet();
  const deleteWallet = useDeleteWallet();
  return wallet?.address ? (
    <View style={[styles.center]}>
      <Text style={{ textAlign: 'center' }}>{`Wallet: ${wallet.address}`}</Text>
      <TouchableOpacity
        style={{
          paddingVertical: 15,
          width: Dimensions.get('screen').width * 0.9,
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
          borderRadius: 16,
        }}
        onPress={deleteWallet}
      >
        <Text style={{ color: 'white', fontSize: 20, lineHeight: 25 }}>
          Reset Wallet
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity onPress={createWallet}>
      <View
        style={{
          paddingVertical: 15,
          width: Dimensions.get('screen').width * 0.9,
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'green',
          borderRadius: 16,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, lineHeight: 25 }}>
          Create Wallet
        </Text>
      </View>
    </TouchableOpacity>
  );
}
