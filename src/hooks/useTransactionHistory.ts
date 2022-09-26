import type { TokenTransactionBase } from '@node-fi/sdk-core/dist/src/Transactions/types';
import { QueryOptions, useQuery } from 'react-query';
import { useDefaultCurrency, useGetToken, useWallet } from '..';

export const TRANSACTION_HISTORY_QUERY_KEY = 'transaction_history';

/**
 *
 * @param maxTransfers Maximum number of transfers to retrieve. Will default to "all"
 * @param startBlock The block to start searching for transactions from.  Defaults to "earliest"
 * @param subscribe If true, will receive new transactions as they come in
 * @param filter callback to filter transfers.  Default filters transfers < $0.001
 * @returns A list of Transfers
 */
export const useTransactionHistory = (
  page?: number,
  countPerPage?: number,
  currencyOverride?: string,
  queryOpts?: QueryOptions<TokenTransactionBase[]>
) => {
  const wallet = useWallet();
  const currency = useDefaultCurrency();
  const getToken = useGetToken();

  const fetch = () =>
    wallet?.getHistoricalTransactions(getToken, {
      page,
      perPage: countPerPage,
      localCurrencyCode: currencyOverride ?? currency,
    }) ?? [];

  const { data, ...fetchDetails } = useQuery(
    [
      TRANSACTION_HISTORY_QUERY_KEY,
      wallet.address,
      currency,
      page,
      countPerPage,
      currencyOverride,
    ],
    fetch,
    {
      keepPreviousData: true,
      ...queryOpts,
    }
  );

  return {
    history: data,
    fetchDetails,
  };
};
