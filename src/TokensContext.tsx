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
  convertLogToTransferObject,
} from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useWalletAddress, WalletContainer } from './WalletContext';
import { useTokenPrices } from './PriceContext';
import { useQuery } from 'react-query';
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import type { FetchDetails } from './types';

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
  newTransfers: TransferTransaction[];
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
  const [newTransfers, setNewTransfers] = React.useState<TransferTransaction[]>(
    []
  );
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
        const transfer = convertLogToTransferObject(e, new Web3(), false);
        setNewTransfers((t) => [
          ...t,
          { ...transfer, outgoing: transfer.from === walletAddress },
        ]);
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

  return { balances, tokens, addToken, removeToken, newTransfers };
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
 *
 * @param maxTransfers Maximum number of transfers to retrieve. Will default to "all"
 * @param startBlock The block to start searching for transactions from.  Defaults to "earliest"
 * @param subscribe If true, will receive new transactions as they come in
 * @param filter callback to filter transfers.  Default filters transfers < $0.001
 * @returns A list of Transfers
 */
export const useHistoricalTransfers = (
  maxTransfers?: number | 'all',
  startBlock?: number,
  subscribe?: boolean,
  filter?: (t: TransferTransaction) => boolean
): TransferTransaction[] | undefined => {
  const { wallet, chainId } = WalletContainer.useContainer();
  const { newTransfers, tokens } = TokenContainer.useContainer();
  const tokenAddresses = Object.values(tokens).map(({ address }) => address);

  const defaultTransferFilter = React.useCallback(
    (transfer: TransferTransaction) => {
      const token = tokens[transfer.token.toLowerCase()];
      return transfer.amount.isGreaterThan(
        new BigNumber('10').pow(token.decimals - 3)
      );
    },
    [tokens]
  );

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
  const res = useQuery([wallet?.address], fetch);
  const transfers = React.useMemo(() => {
    const mid = subscribe
      ? res?.data?.concat(newTransfers).filter(filter ?? defaultTransferFilter)
      : res?.data?.filter(filter ?? defaultTransferFilter);
    return mid?.sort((t1, t2) => t2.blockNumber - t1.blockNumber);
  }, [res.isLoading, newTransfers]);
  return React.useMemo(
    () =>
      !transfers
        ? undefined
        : maxTransfers === 'all' ||
          maxTransfers === undefined ||
          transfers?.length < maxTransfers
        ? transfers
        : transfers?.slice(0, maxTransfers),
    [transfers, maxTransfers]
  );
};
