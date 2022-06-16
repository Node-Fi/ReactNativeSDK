import {
  DateRange,
  dateRangeToDefaultInterval,
  dateRangeToReadable,
  formatHistoricalPortfolioQuery,
  formatHistoricalPricesQuery,
} from '@node-fi/sdk-core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQuery } from 'react-query';
import { useDefaultCurrency } from './PriceContext';
import {
  useCreateWallet,
  useWallet,
  useWalletAddress,
  useDeleteWallet,
  useSetGasToken,
  useApiKey,
  useChainId,
} from './WalletContext';

export {
  useCreateWallet,
  useWallet,
  useWalletAddress,
  useDeleteWallet,
  useSetGasToken,
  useApiKey,
  useChainId,
};
export {
  useSetDefaultCurrency,
  useTokenPrice,
  useTokenPrices,
  useDefaultCurrency,
} from './PriceContext';
export {
  useAddToken,
  useBalances,
  useRemoveToken,
  useTokens,
  useHistoricalTransfers,
  usePricedBalances,
} from './TokensContext';

export * from './SwapProvider';

export const useOnClose = (callback: () => Promise<void>) => {
  useEffect(() => {
    const onClose = (appstate: AppStateStatus) => {
      if (appstate.match(/inactive|background/)) {
        callback();
      }
    };
    AppState.addEventListener('change', onClose);
    return () => {
      AppState.removeEventListener('change', onClose);
    };
  }, [callback]);
};

export function useHistoricalTokenPrices(address: string, range: DateRange) {
  const period = dateRangeToReadable[range];
  const interval = dateRangeToDefaultInterval[range];
  const defaultCurrency = useDefaultCurrency();

  const fetch = async () => {
    try {
      const query = formatHistoricalPricesQuery(
        address,
        interval,
        period,
        defaultCurrency
      );
      return axios
        .get<{
          message: { time: number; priceusd: number; price: number }[];
        }>(query)
        .then((resp) => {
          return resp.data.message;
        });
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const res = useQuery([address, period, interval, defaultCurrency], fetch);
  return res?.data;
}

export function usePortfolioHistory(range: DateRange) {
  const walletAddress = useWalletAddress();
  const period = dateRangeToReadable[range];
  const interval = dateRangeToDefaultInterval[range];
  const defaultCurrency = useDefaultCurrency();

  const fetch = async () => {
    if (!walletAddress) {
      return undefined;
    }
    const query = formatHistoricalPortfolioQuery(
      walletAddress,
      interval,
      period,
      defaultCurrency
    );
    const resp = await axios.get<{ data: { total: number; time: number }[] }>(
      query
    );
    return resp.data.data.length === 0
      ? new Array(50).fill({ total: 0, time: Math.random() * 100000 })
      : resp.data.data;
  };

  const res = useQuery([period, interval, defaultCurrency], fetch);
  return res?.data;
}

// modified from https://usehooks.com/useDebounce/
export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
