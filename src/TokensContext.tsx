import * as React from 'react';
import {
  Address,
  Token,
  TokenAmount,
  subscribeToTokenTransfers,
  ChainId,
  getBalances,
} from '@node-fi/node-sdk';
import { createContainer } from 'unstated-next';
import { useWalletAddress } from './WalletContext';

export interface UseTokensInnerProps {
  initialTokens: Token[];
}

interface TokenBalances {
  [address: Address]: TokenAmount;
}

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
  const tokenAddresses = Object.keys(tokens);

  React.useEffect(() => {
    if (!walletAddress || tokenAddresses.length === 0) return;

    (async () => {
      const fetchedBalances = await getBalances(walletAddress, tokenAddresses);
      setBalances(
        Object.entries(fetchedBalances).reduce(
          (accum: TokenBalances, [address, balance]) => ({
            ...accum,
            [address]: new TokenAmount(tokens[address], balance),
          }),
          {}
        )
      );
    })();

    const subscription = subscribeToTokenTransfers(
      walletAddress,
      ChainId.Celo,
      Object.keys(tokenAddresses),
      (token, balance) => {
        setBalances((b) => ({
          ...b,
          [token.toLowerCase()]: new TokenAmount(
            tokens[token.toLowerCase()],
            balance
          ),
        }));
      }
    );

    return subscription;
  }, [walletAddress, tokenAddresses, tokens]);

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

export const useBalances = (): TokenBalances => {
  const { balances } = TokenContainer.useContainer();
  return balances;
};

export const useTokens = (): TokenMap => {
  const { tokens } = TokenContainer.useContainer();
  return tokens;
};

export const useAddToken = (): ((newToken: Token) => Promise<void>) => {
  const { addToken } = TokenContainer.useContainer();
  return async (newToken: Token) => {
    if (
      newToken.address &&
      (!newToken.name || !newToken.decimals || !newToken.symbol)
    ) {
      await newToken.loadDetails();
    }
    addToken(newToken);
  };
};

export const useRemoveToken = () => {
  const { removeToken } = TokenContainer.useContainer();
  return removeToken;
};
