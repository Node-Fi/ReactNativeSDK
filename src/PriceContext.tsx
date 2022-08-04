import * as React from 'react';
import { Address, ChainId, fetchPrices } from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useOnClose } from './hooks';
import {
  asyncWriteObject,
  DEFAULT_PREFIX,
  PRICE_KEY_SUFFICE,
  PRICE_REFETCH_INTERVAL,
  SUPPORTED_BASE_CURRENCIES,
} from './utils';
import { useQuery } from 'react-query';
import type { FetchDetails } from './types';

interface PriceMap {
  [address: Address]: {
    current: number;
    yesterday: number;
  };
}

type CurrencyType = typeof SUPPORTED_BASE_CURRENCIES[number];

export interface UsePriceInnerType {
  prices?: PriceMap;
  defaultCurrency: CurrencyType;
  setDefaultCurrency: (ct: CurrencyType) => void;
  fetchDetails: FetchDetails;
}

export interface UsePriceInnerProps {
  apiKey: string;
  chainId: ChainId;
  defaultCurrency?: CurrencyType;
  prices?: PriceMap;
}

function usePricesInner(initialState?: UsePriceInnerProps): UsePriceInnerType {
  const {
    apiKey = '',
    chainId,
    defaultCurrency: _defaultCurrency = 'usd',
    prices: _prices,
  } = initialState ?? {};
  const [defaultCurrency, setDefaultCurrency] =
    React.useState<CurrencyType>(_defaultCurrency);

  const { data: prices, ...pricesStatus } = useQuery<PriceMap>(
    ['prices', defaultCurrency],
    async () => await fetchPrices(apiKey, chainId, defaultCurrency),
    {
      keepPreviousData: true,
      initialData: _prices,
      refetchInterval: PRICE_REFETCH_INTERVAL,
    }
  );

  useOnClose(async () => {
    await asyncWriteObject(`${DEFAULT_PREFIX}${PRICE_KEY_SUFFICE}`, {
      defaultCurrency,
      prices,
    });
  });
  return {
    prices,
    defaultCurrency,
    setDefaultCurrency,
    fetchDetails: pricesStatus,
  };
}

export const PriceContainer = createContainer<
  UsePriceInnerType,
  { apiKey: string; chainId: ChainId }
>(usePricesInner);

export const useTokenPriceFetchDetails = () => {
  const { fetchDetails } = PriceContainer.useContainer();
  return fetchDetails;
};

export const useTokenPrices = () => {
  const { prices, fetchDetails } = PriceContainer.useContainer();
  return React.useMemo(
    () => ({ prices, fetchDetails }),
    [prices, fetchDetails]
  );
};

export const useTokenPrice = (address: Address) => {
  const { prices, fetchDetails } = PriceContainer.useContainer();
  const price = prices?.[address.toLowerCase()];
  return React.useMemo(() => ({ price, fetchDetails }), [price, fetchDetails]);
};

export const useSetDefaultCurrency = () => {
  const { setDefaultCurrency } = PriceContainer.useContainer();
  return setDefaultCurrency;
};

export const useDefaultCurrency = () => {
  const { defaultCurrency } = PriceContainer.useContainer();
  return defaultCurrency;
};
