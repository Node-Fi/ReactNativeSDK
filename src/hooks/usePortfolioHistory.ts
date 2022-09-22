import {
  DateRange,
  dateRangeToDefaultInterval,
  dateRangeToReadable,
  formatHistoricalPortfolioQuery,
} from '@node-fi/sdk-core';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useDefaultCurrency } from '../PriceContext';
import { useWalletAddress } from '../WalletContext';

export function usePortfolioHistory(range: DateRange):
  | {
      total: number;
      time: number;
    }[]
  | undefined {
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
    return resp.data.data;
  };

  const res = useQuery([period, interval, defaultCurrency], fetch);
  return res?.data;
}
