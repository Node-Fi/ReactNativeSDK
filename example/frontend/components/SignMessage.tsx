import { useWallet } from '@node-fi/react-native-sdk';
import { EOA } from '@node-fi/sdk-core';
import * as React from 'react';
import { View } from 'react-native';
import { layout } from '../styles/styles';

import { NodeButton, Text, TextInput } from './ThemedComponents';

export default function SignMessage() {
  const [str, setStr] = React.useState<string>();
  const [signed, setSigned] = React.useState<string>();
  const wallet = useWallet() as EOA;
  return (
    <View style={[{ marginTop: 30 }, layout.centered]}>
      {signed ? <Text>{`Signed Message: ${signed}`}</Text> : null}
      <TextInput onChangeText={setStr} placeholder="Message to Sign" />
      {str ? (
        <NodeButton
          text="Sign"
          onPress={async () => {
            // setDefaultCurrency('brl');
            if (wallet && wallet.signMessage) {
              const payload = await wallet.signMessage(str);
              console.log(payload);
              setSigned(payload.signature);

              const signer = wallet.web3.eth.accounts.recover(payload);
              console.log({
                signer,
                expected: wallet.address,
                isEqual: signer === wallet.address,
              });
            }
            setStr(undefined);
          }}
        />
      ) : null}
    </View>
  );
}
