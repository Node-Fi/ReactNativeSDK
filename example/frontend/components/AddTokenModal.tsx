import * as React from 'react';
import { useAddToken } from '@node-fi/react-native-sdk';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { DEVICE_HEIGHT, DEVICE_WIDTH, layout, text } from '../styles/styles';
import {
  Card,
  InfoRow,
  ListSeparator,
  RowBetween,
  Text,
  TextInput,
} from './ThemedComponents';
import { FontAwesome } from '@expo/vector-icons';
import { ChainId, Token, validateAndParseAddress } from '@node-fi/sdk-core';

const RenderHeader = ({ onClose }: { onClose: () => void }) => (
  <View
    style={{
      zIndex: 999,
      backgroundColor: 'white',
      width: '100%',
      paddingTop: 20,
    }}
  >
    <RowBetween style={[layout.row, { padding: 10 }]}>
      <Text style={text.h2}>Add a Token</Text>
      <TouchableOpacity onPress={onClose}>
        <FontAwesome name="times-circle" size={30} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    </RowBetween>
    <ListSeparator
      style={{
        width: DEVICE_WIDTH,
        marginLeft: -22,
        marginRight: 'auto',
        zIndex: 999,
      }}
    />
  </View>
);

export function AddTokenModal({
  onClose,
  modalVisible,
}: {
  onClose: () => void;
  modalVisible?: boolean;
}) {
  const addToken = useAddToken();
  const [token, setToken] = React.useState<Token>();
  const [address, setAddress] = React.useState<string>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const loadToken = async () => {
    const token = new Token(ChainId.Celo, address);
    try {
      await token.loadDetails();
      setToken(token);
    } catch (e) {
      setError(e);
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Modal
      key={`token-search-modal`}
      animationIn="slideInUp"
      isVisible={modalVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      hideModalContentWhileAnimating={true}
      useNativeDriverForBackdrop={true}
      coverScreen
      style={{ marginHorizontal: 0 }}
      useNativeDriver={true}
    >
      <Card
        outerStyle={[
          layout.centered,
          {
            position: 'absolute',
            top: DEVICE_HEIGHT * 0.33,
            padding: 0,
            overflow: 'hidden',
            paddingTop: 20,
            borderRadius: 20,
          },
        ]}
        style={{ width: '100%' }}
      >
        <RenderHeader onClose={onClose} />
        <TextInput
          placeholder="0xAddress"
          value={address}
          style={[layout.row, text.h3, { width: '100%' }]}
          onChangeText={async (t) => {
            setAddress(t.trim());
            if (t.trim().length === 42) {
              setLoading(true);
              await loadToken();
            }
          }}
        />
        {loading ? (
          <ActivityIndicator />
        ) : token ? (
          <View>
            <InfoRow left="Name" right={token.name} />
            <InfoRow left="Symbol" right={token.symbol} />
            <InfoRow left="Decimals" right={token.decimals.toFixed(0)} />
            <TouchableOpacity
              onPress={() => {
                addToken(token);
                onClose();
              }}
            />
          </View>
        ) : error ? (
          <Text>Not a token</Text>
        ) : null}
      </Card>
    </Modal>
  );
}
