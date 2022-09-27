import type { UseQueryResult } from 'react-query';
import type { SUPPORTED_BASE_CURRENCIES } from './utils';

export type FetchDetails = Omit<UseQueryResult, 'data'>;
export type CurrencyType = typeof SUPPORTED_BASE_CURRENCIES[number];
