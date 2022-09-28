import {
  convertTimeframeToUnixSeconds,
  Interval,
  TimeFrame,
} from '@node-fi/sdk-core';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { useDefaultCurrency } from '../PriceContext';
import { useWallet } from '../WalletContext';

export const PORTFOLIO_QUERY_KEY = 'historical_portfolio';

export function usePortfolioHistory(
  range: TimeFrame,
  interval?: Interval,
  queryOpts?: QueryOptions<{ total: number; time: number }[] | undefined>
) {
  const wallet = useWallet();
  const defaultCurrency = useDefaultCurrency();

  const fetch = async () => {
    if (!wallet || !wallet.address) {
      return [];
    }
    const unixSeconds = convertTimeframeToUnixSeconds(range);

    let assumedInterval = 4;

    if (unixSeconds < 60 * 60 * 24 * 2) assumedInterval = 0;
    else if (unixSeconds < 60 * 60 * 24 * 7) assumedInterval = 1;
    else if (unixSeconds < 60 * 60 * 24 * 14) assumedInterval = 2;
    else if (unixSeconds < 60 * 60 * 24 * 31) assumedInterval = 3;

    return wallet.fetchBackendPortfolioValue(
      interval ?? assumedInterval,
      range,
      defaultCurrency
    );
  };

  const { data, ...fetchDetails } = useQuery(
    [PORTFOLIO_QUERY_KEY, range, interval, defaultCurrency],
    fetch,
    queryOpts
  );
  return {
    history: data,
    fetchDetails,
  };
}
