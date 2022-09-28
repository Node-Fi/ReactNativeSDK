import { Address, getBalances, Token, TokenAmount } from '@node-fi/sdk-core';
import React from 'react';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import type { FetchDetails } from 'src/types';
import { useTokens, useWallet } from '..';
import { PriceMap, useTokenPrices } from './useTokenPrices';

/**
 * Maps addresses to TokenAmount (Token, balance)
 */
interface TokenBalances {
  [address: Address]: TokenAmount;
}

export const TOKEN_BALANCE_QUERY_KEY = 'token_balances';

export function useBalances(
  queryOpts?: QueryOptions<TokenBalances | undefined>
) {
  const wallet = useWallet();
  const tokens = useTokens();

  const fetch = async () => {
    if (!wallet || !wallet.address) return {};
    const balances: { [addressLowerCase: string]: TokenAmount } = {};
    const tokenArr = Object.values(tokens);
    const balancesRaw = await getBalances(
      wallet.homeChain,
      wallet.address,
      tokenArr.map((t) => t.address)
    );

    for (const [address, balance] of Object.entries(balancesRaw)) {
      balances[address.toLowerCase()] = new TokenAmount(
        tokens[address.toLowerCase()],
        balance
      );
    }

    return balances;
  };

  const { data, ...fetchDetails } = useQuery(
    [TOKEN_BALANCE_QUERY_KEY, 'all', wallet.address],
    fetch,
    queryOpts
  );

  return {
    balances: data as TokenBalances,
    fetchDetails,
  };
}

/**
 *
 * @param token Address or Token object to fetch balance for
 * @returns Token
 */
export const useBalance = (
  token: Token | Address,
  queryOpts?: QueryOptions<TokenAmount | undefined>
) => {
  const wallet = useWallet();
  const tokens = useTokens();

  const fetch = async () => {
    if (!wallet || !wallet.address) return undefined;
    token = typeof token === 'string' ? tokens[token.toLowerCase()] : token;
    const balancesRaw = await getBalances(wallet.homeChain, wallet.address, [
      token.address,
    ]);

    return new TokenAmount(token, balancesRaw[token.address.toLowerCase()]);
  };

  const { data, ...fetchDetails } = useQuery(
    [
      TOKEN_BALANCE_QUERY_KEY,
      typeof token === 'string'
        ? token.toLowerCase()
        : token.address.toLowerCase(),
      wallet.address,
    ],
    fetch,
    queryOpts
  );

  return {
    balance: data,
    fetchDetails,
  };
};

/**
 *
 * @returns Balances multiplied by the price of the token
 */
export const usePricedBalances = (
  queryOptsGeneral?: QueryOptions,
  queryOptsBalances?: QueryOptions<TokenBalances | undefined>,
  queryOptsPrices?: QueryOptions<PriceMap>
): {
  pricedBalances?: TokenBalances;
  fetchDetails: {
    priceFetchDetails: FetchDetails;
    balanceFetchDetails: FetchDetails;
  };
} => {
  const { balances, fetchDetails: balanceFetchDetails } = useBalances(
    queryOptsBalances ?? (queryOptsGeneral as any)
  );
  const { prices, fetchDetails: priceFetchDetails } =
    useTokenPrices(queryOptsPrices ?? (queryOptsGeneral as any)) ?? {};

  const fetchDetails = {
    balanceFetchDetails,
    priceFetchDetails,
  };

  return React.useMemo(
    () =>
      !prices || !balances
        ? { fetchDetails }
        : {
            pricedBalances: Object.entries(balances)
              .filter(([addr]) => prices?.[addr.toLowerCase()])
              .reduce(
                (accum, [addr, tokAmount]) => ({
                  ...accum,
                  [addr]: new TokenAmount(
                    tokAmount.token,
                    tokAmount.raw.multipliedBy(prices[addr.toLowerCase()] ?? 1)
                  ),
                }),
                {}
              ),
            fetchDetails,
          },
    [prices, fetchDetails, balances]
  );
};
