import { Token, TokenAmount } from '@node-fi/sdk-core';
import { PaymentRequest } from '@node-fi/sdk-core/dist/src/PaymentRequest/PaymentRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000000000000000, // 24 hours
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  key: '@node-fi/async-storage/cache',
  storage: AsyncStorage,
  serialize: (c) => {
    return JSON.stringify(c);
  },
  deserialize: (str) => {
    return JSON.parse(str, (_, v) => {
      if (!v) return v;

      if (Token.isSerializedToken(v)) return Token.parseJson(v);
      if (TokenAmount.isSerializedTokenAmount(v))
        return TokenAmount.parseJson(v);
      if (PaymentRequest.isSerializedPaymentRequest(v))
        return PaymentRequest.parseJson(v);

      return v;
    });
  },
});

const queryClientNoAsyncPersistance = new QueryClient();

export default function DynamicQueryClient({ children }: { children: any }) {
  if (process.env.NODE_FINANCE_NO_PERSIST) {
    return (
      <QueryClientProvider
        client={queryClientNoAsyncPersistance}
        children={children}
      />
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      children={children}
    />
  );
}
