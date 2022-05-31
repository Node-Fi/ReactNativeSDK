import * as React from 'react';
import {
  useTokens,
  usePricedBalances,
  useWallet,
  useHistoricalTransfers,
} from '@node-fi/react-native-sdk';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Token } from '@node-fi/sdk-core';
import TokenRow from './components/TokenRow';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from './styles/styles';
import { AddTokenModal } from './components/AddTokenModal';
import { Text } from './components/ThemedComponents';

const RenderRow = ({ item: token }: { item: Token }) => (
  <TokenRow token={token} style={{ maxWidth: DEVICE_WIDTH * 0.8 }} />
);

export function TokenList() {
  const tokens = useTokens();
  const [showModal, setShowModal] = React.useState(false);
  const RenderToggleModal = () => (
    <TouchableOpacity onPress={() => setShowModal(true)}>
      <Text>Add Token</Text>
    </TouchableOpacity>
  );
  return (
    <View
      style={{
        height: DEVICE_HEIGHT * 0.5,
        width: DEVICE_WIDTH * 0.8,
        paddingTop: 20,
      }}
    >
      <AddTokenModal
        onClose={() => setShowModal(false)}
        modalVisible={showModal}
      />
      <FlatList
        data={Object.values(tokens)}
        renderItem={RenderRow}
        ListFooterComponent={RenderToggleModal}
      />
    </View>
  );
}
