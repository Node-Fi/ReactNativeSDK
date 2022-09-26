import * as React from 'react';
import {
  Address,
  Token,
  TokenAmount,
  subscribeToTokenTransfers,
  ChainId,
  getBalances,
} from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useWalletAddress } from './WalletContext';
import { useTokenPrices } from './PriceContext';
import type { FetchDetails } from './types';
import { useQueryClient } from 'react-query';
import { TRANSACTION_HISTORY_QUERY_KEY } from './hooks/useTransactionHistory';
import { PORTFOLIO_QUERY_KEY } from './hooks';

export interface UseTokensInnerProps {
  initialTokens: Token[];
  chainId: ChainId;
}

/**
 * Maps addresses to TokenAmount (Token, balance)
 */
interface TokenBalances {
  [address: Address]: TokenAmount;
}

/**
 * Maps addresses to a Token object (address, name, symbol, decimals)
 */
interface TokenMap {
  [address: Address]: Token;
}

interface UseTokensInnerType {
  balances: TokenBalances;
  tokens: TokenMap;
  addToken: (token: Token) => void;
  removeToken: (token: Address) => void;
}
function useTokensInner(props?: UseTokensInnerProps) {
  const chainId = props?.chainId ?? ChainId.Celo;
  const [tokens, setTokens] = React.useState<TokenMap>(
    props?.initialTokens?.reduce(
      (accum: TokenMap, cur: Token) => ({
        ...accum,
        [cur.address.toLowerCase()]: cur,
      }),
      {}
    ) ?? {}
  );
  const [balances, setBalances] = React.useState<TokenBalances>({});
  const walletAddress = useWalletAddress();
  const tokenAddresses = React.useMemo(() => Object.keys(tokens), [tokens]);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!walletAddress || tokenAddresses.length === 0) return;
    (async () => {
      const fetchedBalances = await getBalances(
        chainId,
        walletAddress,
        tokenAddresses
      );
      setBalances(
        Object.entries(fetchedBalances).reduce(
          (accum: TokenBalances, [address, balance]) => ({
            ...accum,
            [address.toLowerCase()]: new TokenAmount(tokens[address], balance),
          }),
          {}
        )
      );
    })();
    const endSubscription = subscribeToTokenTransfers(
      walletAddress,
      chainId,
      tokenAddresses,
      (token, balance, e) => {
        setBalances((b) => ({
          ...b,
          [token.toLowerCase()]: new TokenAmount(
            tokens[token.toLowerCase()],
            balance
          ),
        }));
        queryClient.invalidateQueries(TRANSACTION_HISTORY_QUERY_KEY);
        queryClient.invalidateQueries(PORTFOLIO_QUERY_KEY);
      }
    );

    return endSubscription;
  }, [walletAddress, tokens, setBalances, tokenAddresses, chainId]);

  const addToken = React.useCallback(
    (newToken: Token) => {
      setTokens(
        (t: TokenMap): TokenMap => ({ ...t, [newToken.address]: newToken })
      );
    },
    [setTokens]
  );

  const removeToken = React.useCallback(
    (address: string) =>
      setTokens((t) => {
        // eslint-disable-next-line
        const { [address.toLowerCase()]: remove, ...rest } = t;
        return rest;
      }),
    [setTokens]
  );

  return { balances, tokens, addToken, removeToken };
}

export const TokenContainer = createContainer<
  UseTokensInnerType,
  UseTokensInnerProps
>(useTokensInner);

/**
 *
 * @param token Address or Token object to fetch balance for
 * @returns Token
 */
export const useBalance = (token: Token | Address): TokenAmount => {
  const { balances } = TokenContainer.useContainer();
  const tokenAddress = typeof token === 'string' ? token : token.address;
  const balance = balances[tokenAddress];
  return React.useMemo(() => balance, [balance]);
};

/**
 *
 * @returns All balances for supported tokens.  A token is in the map if and only if the user has a non zero balance
 */
export const useBalances = (): TokenBalances => {
  const { balances } = TokenContainer.useContainer();
  return balances;
};

/**
 *
 * @returns Balances multiplied by the price of the token
 */
export const usePricedBalances = (): {
  pricedBalances?: TokenBalances;
  fetchDetails: FetchDetails;
} => {
  const balances = useBalances();
  const { prices, fetchDetails } = useTokenPrices() ?? {};
  return React.useMemo(
    () =>
      !prices
        ? { fetchDetails }
        : {
            pricedBalances: Object.entries(balances)
              .filter(([addr]) => prices?.[addr.toLowerCase()])
              .reduce(
                (accum, [addr, tokAmount]) => ({
                  ...accum,
                  [addr]: new TokenAmount(
                    tokAmount.token,
                    tokAmount.raw.multipliedBy(
                      prices[addr.toLowerCase()]?.current ?? 1
                    )
                  ),
                }),
                {}
              ),
            fetchDetails,
          },
    [prices, fetchDetails, balances]
  );
};

export const useTokens = (): TokenMap => {
  const { tokens } = TokenContainer.useContainer();
  return tokens;
};

export const useAddToken = (): ((newToken: Token) => Promise<void>) => {
  const { addToken } = TokenContainer.useContainer();
  return React.useCallback(
    async (newToken: Token) => {
      if (
        newToken.address &&
        (!newToken.name || !newToken.decimals || !newToken.symbol)
      ) {
        await newToken.loadDetails();
      }
      addToken(newToken);
    },
    [addToken]
  );
};

export const useGetToken = () => {
  const { tokens } = TokenContainer.useContainer();

  return (addr: string) => tokens[addr.toLowerCase()];
};

export const useRemoveToken = () => {
  const { removeToken } = TokenContainer.useContainer();
  return removeToken;
};

/**
 * @deprecated
 * @param maxTransfers
 * @param startBlock
 * @param subscribe
 * @param filter
 */
export const useHistoricalTransfers = (
  maxTransfers?: number | 'all',
  startBlock?: number,
  subscribe?: boolean,
  filter?: (t: unknown) => boolean
): unknown[] | undefined => {
  console.warn(
    `useHistoricalTransfers is deprecated, use useHistoricalTransactions instead`
  );
  return [];
};
