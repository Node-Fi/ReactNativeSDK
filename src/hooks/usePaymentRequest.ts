import type { PageInfo, TokenAmount } from '@node-fi/sdk-core';
import { PaymentRequest } from '@node-fi/sdk-core/dist/src/PaymentRequest/PaymentRequest';
import {
  MutationOptions,
  QueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useGetToken, useWallet } from '..';

export const PAYMENT_REQUEST_GROUP_QUERY_KEY = 'node_sdk_payment_requests';
export const PAYMENT_REQUEST_SINGLE_QUERY_KEY =
  'node_sdk_payment_request_single';

export interface PaymentRequestQueryOptions {
  type?: 'pending' | 'completed' | 'all' | undefined;
  page?: number | undefined;
  count?: number | undefined;
}

export const usePaymentRequestsForWallet = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  options?: PaymentRequestQueryOptions,
  queryOpts?: QueryOptions<{
    requests: PaymentRequest<T>[];
    pageInfo: PageInfo;
  }>
) => {
  const wallet = useWallet();
  const getToken = useGetToken();

  const { data, ...fetchDetails } = useQuery(
    [PAYMENT_REQUEST_GROUP_QUERY_KEY, options],
    async () => wallet.fetchPaymentRequests<T>(getToken, options),
    {
      refetchInterval: 5 * 1000,
      keepPreviousData: true,
      ...queryOpts,
    }
  );

  if (!data) return { fetchDetails };

  return {
    ...data,
    fetchDetails,
  };
};

export const useFulfillRequest = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  mutationOptions?: Omit<
    MutationOptions<
      {
        request: PaymentRequest<T>;
        receipt: {
          amountCredited: TokenAmount;
          isFullyRepaid: boolean;
          hash: string;
          rid: number;
          time: number;
        };
      },
      unknown,
      {
        request: PaymentRequest<T>;
        amount: TokenAmount;
      }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const wallet = useWallet();

  return useMutation(
    ({ request, amount }) => wallet.fulfillPaymentRequest<T>(request, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(PAYMENT_REQUEST_SINGLE_QUERY_KEY);
      },
      ...mutationOptions,
    }
  );
};

export const useRequest = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  requestId: number,
  queryOpts?: QueryOptions<PaymentRequest<T>>
) => {
  const getToken = useGetToken();
  const { data: request, ...fetchDetails } = useQuery(
    [PAYMENT_REQUEST_SINGLE_QUERY_KEY, requestId],
    async () => PaymentRequest.fetch<T>(requestId, getToken),
    queryOpts
  );

  return {
    request,
    fetchDetails,
  };
};
