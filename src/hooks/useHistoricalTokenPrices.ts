import {
  DateRange,
  dateRangeToDefaultInterval,
  dateRangeToReadable,
  formatHistoricalPricesQuery,
} from '@node-fi/sdk-core';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useDefaultCurrency } from '../PriceContext';

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
