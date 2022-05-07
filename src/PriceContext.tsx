import * as React from 'react';
import { Address, fetchPrices } from '@node-fi/node-sdk';
import { createContainer } from 'unstated-next';

interface PriceMap {
  [address: Address]: number;
}

type CurrencyType = 'usd' | 'euro' | 'real';

interface UsePriceInnerType {
  prices?: PriceMap;
  defaultCurrency: CurrencyType;
  setDefaultCurrency: (ct: CurrencyType) => void;
}

function usePricesInner(): UsePriceInnerType {
  const [prices, setPrices] = React.useState<PriceMap>();
  const [defaultCurrency, setDefaultCurrency] =
    React.useState<CurrencyType>('usd');

  React.useEffect(() => {
    const fetchAndSetPrices = async () => {
      const fetchedPrices = await fetchPrices();
      setPrices(fetchedPrices);
    };
    fetchAndSetPrices();
    const intervalId = setInterval(fetchAndSetPrices, 1000 * 60 * 5); // Refresh every 5 mintues
    return () => {
      clearInterval(intervalId);
    };
  });
  return { prices, defaultCurrency, setDefaultCurrency };
}

export const PriceContainer = createContainer<UsePriceInnerType, void>(
  usePricesInner
);

export const useTokenPrices = () => {
  const { prices } = PriceContainer.useContainer();
  return prices;
};

export const useTokenPrice = (address: Address) => {
  const { prices } = PriceContainer.useContainer();
  const tokenPrice = prices?.[address];
  return React.useMemo(() => tokenPrice, [tokenPrice]);
};

export const useSetDefaultCurrency = () => {
  const { setDefaultCurrency } = PriceContainer.useContainer();
  return setDefaultCurrency;
};
