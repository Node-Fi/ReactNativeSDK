import { DEFAULT_PREFIX, getMnemonic } from '@node-fi/react-native-sdk';
import * as React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { DEVICE_WIDTH } from '../styles/styles';
import { Text } from './ThemedComponents';
export default function GetMnemonicTest() {
  const [mnemonic, setMnemonic] = React.useState<string>();

  return (
    <View>
      <TouchableOpacity
        onPress={async () => {
          console.log(mnemonic);
          if (mnemonic) setMnemonic(undefined);
          else setMnemonic(await getMnemonic(DEFAULT_PREFIX));
        }}
        style={{
          paddingVertical: 15,
          width: DEVICE_WIDTH * 0.9,
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
          borderRadius: 16,
        }}
      >
        <Text>Toggle Mnemonic</Text>
      </TouchableOpacity>
      {mnemonic ? <Text>{mnemonic}</Text> : null}
    </View>
  );
}
