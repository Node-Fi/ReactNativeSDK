import type { UseQueryResult } from 'react-query';

export type FetchDetails = Omit<UseQueryResult, 'data'>;
