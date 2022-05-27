import * as React from 'react';
import {
  useCreateWallet,
  useWallet,
  useDeleteWallet,
  clearMnemonic,
  asyncClear,
  DEFAULT_PREFIX,
  useHistoricalTransfers,
} from '@node-fi/react-native-sdk';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './App';

export function CreateWallet() {
  const wallet = useWallet();
  const createWallet = useCreateWallet();
  const deleteWallet = useDeleteWallet();
  const transactions = useHistoricalTransfers(4);
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
    <View style={{ height: 100, backgroundColor: 'red' }}>
      <TouchableOpacity onPress={() => createWallet()}>
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
      <TouchableOpacity
        onPress={() =>
          createWallet(
            'trend process render future worth one warm ahead master enter inch pioneer indoor elevator upper embrace symbol awful pretty route must country film science'
          )
        }
      >
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
            Create Wallet from Mnemonic
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          await Promise.all([
            asyncClear(DEFAULT_PREFIX),
            clearMnemonic(DEFAULT_PREFIX),
          ]);
        }}
      >
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
            marginTop: 10,
          }}
        >
          <Text style={{ color: 'white', fontSize: 20, lineHeight: 25 }}>
            Clear Async Storage
            {JSON.stringify(transactions)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
