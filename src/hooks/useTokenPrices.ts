import { Address, fetchPrices } from '@node-fi/sdk-core';
import React from 'react';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import {
  PRICE_REFETCH_INTERVAL,
  useApiKey,
  useChainId,
  useDefaultCurrency,
} from '..';

export interface PriceMap {
  [address: Address]: {
    current: number;
    yesterday: number;
  };
}

export const PRICE_QUERY_KEY = 'price';

export const useTokenPrices = (queryOpts?: QueryOptions<PriceMap>) => {
  const defaultCurrency = useDefaultCurrency();
  const apiKey = useApiKey();
  const chainId = useChainId();

  const { data: prices, ...fetchDetails } = useQuery<PriceMap>(
    ['prices', defaultCurrency],
    async () => await fetchPrices(apiKey ?? '', chainId, defaultCurrency),
    {
      keepPreviousData: true,
      refetchInterval: PRICE_REFETCH_INTERVAL,
      ...queryOpts,
    }
  );

  return { prices, fetchDetails };
};

export const useTokenPrice = (address: Address) => {
  const { prices, fetchDetails } = useTokenPrices();
  const price = prices?.[address.toLowerCase()];
  return React.useMemo(() => ({ price, fetchDetails }), [price, fetchDetails]);
};
