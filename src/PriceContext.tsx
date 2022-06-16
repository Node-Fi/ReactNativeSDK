import * as React from 'react';
import { Address, ChainId, fetchPrices } from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useOnClose } from './hooks';
import { asyncWriteObject, DEFAULT_PREFIX, PRICE_KEY_SUFFICE } from './utils';

interface PriceMap {
  [address: Address]: {
    current: number;
    yesterday: number;
  };
}

type CurrencyType = 'usd' | 'euro' | 'real';

export interface UsePriceInnerType {
  prices?: PriceMap;
  defaultCurrency: CurrencyType;
  setDefaultCurrency: (ct: CurrencyType) => void;
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
  const [prices, setPrices] = React.useState<PriceMap | undefined>(_prices);
  const [defaultCurrency, setDefaultCurrency] =
    React.useState<CurrencyType>(_defaultCurrency);

  React.useEffect(() => {
    const fetchAndSetPrices = async () => {
      const fetchedPrices = await fetchPrices(apiKey, chainId, defaultCurrency);
      setPrices(fetchedPrices);
    };
    fetchAndSetPrices();
    const intervalId = setInterval(fetchAndSetPrices, 1000 * 60 * 5); // Refresh every 5 mintues
    return () => {
      clearInterval(intervalId);
    };
  }, [setPrices, apiKey, chainId, defaultCurrency]);

  useOnClose(async () => {
    await asyncWriteObject(`${DEFAULT_PREFIX}${PRICE_KEY_SUFFICE}`, {
      defaultCurrency,
      prices,
    });
  });
  return { prices, defaultCurrency, setDefaultCurrency };
}

export const PriceContainer = createContainer<
  UsePriceInnerType,
  { apiKey: string; chainId: ChainId }
>(usePricesInner);

export const useTokenPrices = () => {
  const { prices } = PriceContainer.useContainer();
  return prices;
};

export const useTokenPrice = (address: Address) => {
  const { prices } = PriceContainer.useContainer();
  const tokenPrice = prices?.[address.toLowerCase()];
  return React.useMemo(() => tokenPrice, [tokenPrice]);
};

export const useSetDefaultCurrency = () => {
  const { setDefaultCurrency } = PriceContainer.useContainer();
  return setDefaultCurrency;
};

export const useDefaultCurrency = () => {
  const { defaultCurrency } = PriceContainer.useContainer();
  return defaultCurrency;
};
