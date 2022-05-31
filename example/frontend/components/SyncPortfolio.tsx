import {
  DEFAULT_PREFIX,
  getMnemonic,
  useWallet,
} from '@node-fi/react-native-sdk';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { styles } from '../App';
import { getColor } from '../styles/colors';
import { DEVICE_WIDTH, layout } from '../styles/styles';
import { Text } from './ThemedComponents';

export const SyncPortfolioButton = () => {
  const wallet = useWallet();
  const handlePress = async () => {
    console.log(await wallet.syncBackendPortfolioValue());
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        style={[
          layout.centered,
          {
            width: DEVICE_WIDTH * 0.8,
            paddingVertical: 10,
            backgroundColor: getColor('purple', 0.6),
          },
        ]}
      >
        <Text>Sync</Text>
      </View>
    </TouchableOpacity>
  );
};
