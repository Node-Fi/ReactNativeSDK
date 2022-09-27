import * as React from 'react';
import type { ChainId } from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useOnClose } from './hooks';
import { asyncWriteObject, DEFAULT_PREFIX, PRICE_KEY_SUFFICE } from './utils';
import type { CurrencyType } from './types';

export interface UsePriceInnerType {
  defaultCurrency: CurrencyType;
  setDefaultCurrency: (ct: CurrencyType) => void;
}

export interface UsePriceInnerProps {
  apiKey: string;
  chainId: ChainId;
  defaultCurrency?: CurrencyType;
}

function usePricesInner(initialState?: UsePriceInnerProps): UsePriceInnerType {
  const { defaultCurrency: _defaultCurrency = 'usd' } = initialState ?? {};
  const [defaultCurrency, setDefaultCurrency] =
    React.useState<CurrencyType>(_defaultCurrency);

  useOnClose(async () => {
    await asyncWriteObject(`${DEFAULT_PREFIX}${PRICE_KEY_SUFFICE}`, {
      defaultCurrency,
    });
  });
  return {
    defaultCurrency,
    setDefaultCurrency,
  };
}

export const PriceContainer = createContainer<
  UsePriceInnerType,
  UsePriceInnerProps
>(usePricesInner);

export const useSetDefaultCurrency = () => {
  const { setDefaultCurrency } = PriceContainer.useContainer();
  return setDefaultCurrency;
};

export const useDefaultCurrency = () => {
  const { defaultCurrency } = PriceContainer.useContainer();
  return defaultCurrency;
};
