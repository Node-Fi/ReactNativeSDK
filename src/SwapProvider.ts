import * as React from 'react';
import {
  Address,
  SmartRouter,
  Token,
  TokenAmount,
  RouterPayloadRequest,
  SmartWallet,
  RouterResponse,
} from '@node-fi/sdk-core';
import { createContainer } from 'unstated-next';
import { useQuery } from '@tanstack/react-query';
import type { TransactionConfig } from 'web3-eth';
import { BigNumber } from 'bignumber.js';
import { useTokens } from './TokensContext';
import { useDebounce } from './hooks/index';
import { useWallet, WalletContainer } from './WalletContext';
import type { FetchDetails } from './types';
import { SWAP_QUOTE_REFETCH_INTERVAL } from './utils';

export interface UseSwappInnerProps {
  slippage?: number;
}

interface SwapProviderType {
  slippage: number;
  setSlippage: (slippage: number) => void;
}

// Default slippage is 10 bips
function useSwapInner(props?: UseSwappInnerProps): SwapProviderType {
  const { slippage = 10 } = props ?? {};
  const [_slippage, setSlippage] = React.useState<number>(slippage ?? 10);
  return { slippage: _slippage, setSlippage };
}

export const SwapContainer = createContainer(useSwapInner);

/**
 *
 * @returns [slippage, setter for slippage] slippage is in bips
 */
export function useSlippage() {
  const { slippage, setSlippage } = SwapContainer.useContainer();
  return [slippage, setSlippage];
}

/**
 *
 * @param input input token amount
 * @param outputToken expected token received
 * @param recipient recipient to receive the tokens, defaults to wallet address
 * @returns information on the calculated path, and a callback to execute the swap
 */
export function useSwapQuote(
  input?: TokenAmount,
  outputToken?: Token,
  recipient?: string,
  opts?: Partial<
    Omit<RouterPayloadRequest, 'tokenIn' | 'tokenOut' | 'amountIn'>
  >
): {
  trade?: Partial<
    Omit<RouterResponse, 'output' | 'minimumOutput' | 'priceImpact'>
  > & {
    output?: TokenAmount;
    minimumOutput?: TokenAmount;
    txn?: TransactionConfig;
    priceImpact?: number;
  };
  fetchDetails: FetchDetails;
} {
  const { slippage } = SwapContainer.useContainer();
  const wallet = useWallet();
  const from =
    wallet instanceof SmartWallet ? wallet.eoa?.address : wallet.address;
  const { apiKey } = WalletContainer.useContainer();

  const swapMaster = React.useMemo(
    () => new SmartRouter(apiKey, wallet),
    [wallet, apiKey]
  );
  const inputToken = input?.token;
  const inputAmount = input?.raw;

  const fetch = React.useCallback(
    async () =>
      inputToken && inputAmount && outputToken
        ? swapMaster.getRouteBase(inputToken, outputToken, inputAmount, {
            slippage,
            from,
            to: recipient ?? wallet.address,
            includeTxn: true,
            priceImpact: true,
            ...opts,
          })
        : undefined,
    [inputToken, inputAmount, outputToken, swapMaster]
  );
  const {
    data: { details, routerAddress, error, expectedOut, ...dataRest } = {},
    ...swapQueryDetails
  } = useQuery(
    [
      'swap',
      inputToken?.address,
      inputAmount?.toFixed(0),
      outputToken,
      opts?.slippage,
    ],
    fetch,
    {
      keepPreviousData: true,
      refetchInterval: SWAP_QUOTE_REFETCH_INTERVAL,
    }
  );

  return React.useMemo(() => {
    if (!details || !routerAddress || !expectedOut)
      return { fetchDetails: swapQueryDetails };
    return {
      trade: {
        details,
        output: expectedOut
          ? new TokenAmount(outputToken as Token, expectedOut)
          : undefined,
        minimumOutput: expectedOut
          ? new TokenAmount(
              outputToken as Token,
              expectedOut.minus(expectedOut.multipliedBy(slippage).div(10000))
            )
          : undefined,
        routerAddress,
        ...dataRest,
      },
      fetchDetails: swapQueryDetails,
    };
  }, [
    routerAddress,
    error,
    expectedOut?.toFixed(0),
    outputToken?.address,
    inputToken?.address,
    slippage,
  ]);
}

/**
 *
 * @param inputAddress address of token being swapped
 * @param outputAddress address of token being swapped to
 * @param typedAmount input amount in human-readable format (not accounting for decimals)
 * @param recipient recipient for swap - defaults to current wallet
 * @param debounceDelayMs delay to refresh quote as typedAmount chages.  Increase for greater response at the cost of performance
 * @returns
 */
export function useSwapTypedAmount(
  inputAddress?: Address,
  outputAddress?: Address,
  typedAmount?: string | number,
  recipient?: Address,
  opts?: Partial<
    Omit<RouterPayloadRequest, 'tokenIn' | 'tokenOut' | 'amountIn'> & {
      debounceDelayMs: number;
    }
  >
) {
  const tokens = useTokens();
  const {
    [inputAddress?.toLowerCase() ?? '']: inputToken,
    [outputAddress?.toLowerCase() ?? '']: outputToken,
  } = tokens;
  const debouncedInput = useDebounce(typedAmount, opts?.debounceDelayMs ?? 500);
  const input =
    inputToken && debouncedInput
      ? new TokenAmount(
          inputToken,
          new BigNumber(debouncedInput).times(
            new BigNumber(10).pow(inputToken.decimals)
          )
        )
      : undefined;
  return useSwapQuote(input, outputToken, recipient, opts);
}
