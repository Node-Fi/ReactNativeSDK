import * as React from 'react';
import {
  Address,
  Token,
  subscribeToTokenTransfers,
  ChainId,
} from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useWalletAddress } from './WalletContext';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSACTION_HISTORY_QUERY_KEY } from './hooks/useTransactionHistory';
import { PORTFOLIO_QUERY_KEY } from './hooks';
import { TOKEN_BALANCE_QUERY_KEY } from './hooks/useBalances';

export interface UseTokensInnerProps {
  initialTokens: Token[];
  chainId: ChainId;
}

/**
 * Maps addresses to a Token object (address, name, symbol, decimals)
 */
interface TokenMap {
  [address: Address]: Token;
}

interface UseTokensInnerType {
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
  const walletAddress = useWalletAddress();
  const tokenAddresses = React.useMemo(() => Object.keys(tokens), [tokens]);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!walletAddress || tokenAddresses.length === 0) return;
    const endSubscription = subscribeToTokenTransfers(
      walletAddress,
      chainId,
      tokenAddresses,
      (token) => {
        queryClient.invalidateQueries([TOKEN_BALANCE_QUERY_KEY, 'all']);
        queryClient.invalidateQueries([
          TOKEN_BALANCE_QUERY_KEY,
          token.toLowerCase(),
        ]);
        queryClient.invalidateQueries([TRANSACTION_HISTORY_QUERY_KEY]);
        queryClient.invalidateQueries([PORTFOLIO_QUERY_KEY]);
      }
    );

    return endSubscription;
  }, [walletAddress, tokens, tokenAddresses, chainId]);

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

  return { tokens, addToken, removeToken };
}

export const TokenContainer = createContainer<
  UseTokensInnerType,
  UseTokensInnerProps
>(useTokensInner);

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
export const useHistoricalTransfers = (): unknown[] | undefined => {
  console.warn(
    `useHistoricalTransfers is deprecated, use useHistoricalTransactions instead`
  );
  return [];
};
