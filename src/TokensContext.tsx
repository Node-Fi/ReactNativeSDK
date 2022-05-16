import * as React from 'react';
import {
  Address,
  Token,
  TokenAmount,
  subscribeToTokenTransfers,
  ChainId,
  getBalances,
  TransferTransaction,
  fetchTransfers,
} from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useWalletAddress, WalletContainer } from './WalletContext';
import { useTokenPrices } from './PriceContext';
import { useQuery } from 'react-query';

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
  transferCounter: number;
}
function useTokensInner(props?: UseTokensInnerProps) {
  const chainId = props?.chainId ?? ChainId.Celo;
  const [transferCounter, setTransferCounter] = React.useState(0);
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
            [address]: new TokenAmount(tokens[address], balance),
          }),
          {}
        )
      );
    })();
    const subscription = subscribeToTokenTransfers(
      walletAddress,
      chainId,
      tokenAddresses,
      (token, balance) => {
        setBalances((b) => ({
          ...b,
          [token.toLowerCase()]: new TokenAmount(
            tokens[token.toLowerCase()],
            balance
          ),
        }));
        setTransferCounter((t) => t + 1);
      }
    );

    return subscription;
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

  return { balances, tokens, addToken, removeToken, transferCounter };
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

export const useBalances = (): TokenBalances => {
  const { balances } = TokenContainer.useContainer();
  return balances;
};

export const usePricedBalances = (): TokenBalances => {
  const balances = useBalances();
  const prices = useTokenPrices() ?? {};
  return Object.entries(balances).reduce(
    (accum, [addr, tokAmount]) => ({
      ...accum,
      [addr]: new TokenAmount(
        tokAmount.token,
        tokAmount.raw.multipliedBy(prices[addr.toLowerCase()]?.current ?? 1)
      ),
    }),
    {}
  );
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

export const useHistoricalTransfers = (
  startBlock?: number,
  subscribe?: boolean
): TransferTransaction[] | undefined => {
  const { wallet, chainId } = WalletContainer.useContainer();
  const { transferCounter, tokens } = TokenContainer.useContainer();
  const tokenAddresses = Object.values(tokens).map(({ address }) => address);

  const fetch = async () => {
    if (!wallet || !wallet.address) {
      return [];
    }
    try {
      const transfers = await fetchTransfers(
        chainId ?? ChainId.Celo,
        wallet.address ?? '',
        tokenAddresses,
        startBlock ?? 'earliest'
      );
      return transfers;
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  const res = useQuery(
    [tokenAddresses, subscribe ? transferCounter : 0, wallet.address],
    fetch
  );
  return res?.data;
};
