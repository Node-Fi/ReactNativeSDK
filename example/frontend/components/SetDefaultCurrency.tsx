import {
  useDefaultCurrency,
  useSetDefaultCurrency,
} from '@node-fi/react-native-sdk';
import * as React from 'react';
import { View } from 'react-native';

import { NodeButton, Text, TextInput } from './ThemedComponents';

export default function SetDefaultCurrency() {
  const [str, setStr] = React.useState<string>();
  const defaultCurrency = useDefaultCurrency();
  const setDefaultCurrency = useSetDefaultCurrency();

  return (
    <View>
      <Text>{`Current Default Currency: ${defaultCurrency}`}</Text>
      <TextInput onChangeText={setStr} placeholder="New Default" />
      {str ? (
        <NodeButton
          text="Change"
          onPress={() => {
            setDefaultCurrency((str as unknown) as 'usd');
            setStr(undefined);
          }}
        />
      ) : null}
    </View>
  );
}
