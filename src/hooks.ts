import {
  DateRange,
  dateRangeToDefaultInterval,
  dateRangeToReadable,
  formatHistoricalPortfolioQuery,
  formatHistoricalPricesQuery,
} from '@node-fi/sdk-core';
import axios from 'axios';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQuery } from 'react-query';
import {
  useCreateWallet,
  useWallet,
  useWalletAddress,
  useDeleteWallet,
} from './WalletContext';

export { useCreateWallet, useWallet, useWalletAddress, useDeleteWallet };
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
} from './TokensContext';

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

  const fetch = async () => {
    try {
      const query = formatHistoricalPricesQuery(address, interval, period);
      console.log({ query });
      return axios
        .get<{
          message: { time: number; priceusd: number }[];
        }>(formatHistoricalPricesQuery(address, interval, period))
        .then((resp) => {
          return resp.data.message;
        });
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const res = useQuery([address, period, interval], fetch);
  return res?.data;
}

export function usePortfolioHistory(range: DateRange) {
  const walletAddress = useWalletAddress();
  const period = dateRangeToReadable[range];
  const interval = dateRangeToDefaultInterval[range];
  const fetch = async () => {
    if (!walletAddress) {
      return undefined;
    }
    const query = formatHistoricalPortfolioQuery(
      walletAddress,
      interval,
      period
    );
    const resp = await axios.get<{ data: { total: number; time: number }[] }>(
      query
    );
    return resp.data.data.length === 0
      ? new Array(50).fill({ total: 0, time: Math.random() * 100000 })
      : resp.data.data;
  };

  const res = useQuery([period, interval], fetch);
  return res?.data;
}
