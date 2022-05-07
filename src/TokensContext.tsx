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
  setTokens: (tokens: TokenMap) => void;
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

  return { balances, tokens, setTokens };
}

export const TokenContainer = createContainer<
  UseTokensInnerType,
  UseTokensInnerProps
>(useTokensInner);
