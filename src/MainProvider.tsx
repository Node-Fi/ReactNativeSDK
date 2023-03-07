import * as React from 'react';
import { WalletContainer } from './WalletContext';
import { PriceContainer, UsePriceInnerProps } from './PriceContext';
import { Address, ChainId, Token } from '@node-fi/sdk-core';
import type {
  WalletConfig,
  WalletOptions,
} from '@node-fi/sdk-core/dist/src/wallet/Wallet';
import {
  DEFAULT_PREFIX,
  PRICE_KEY_SUFFICE,
  setStoragePrefix,
  SWAP_KEY_SUFFIX,
  TOKENS_KEY_SUFFIX,
  WALLET_KEY_SUFFIX,
} from './utils/storageKeys';
import { asyncReadObject } from './utils/asyncStorage';
import { clearMnemonic, getMnemonic, saveMnemonic } from './utils/security';
import { TokenContainer, UseTokensInnerProps } from './TokensContext';
import DEFAULT_TOKENS from '@ubeswap/default-token-list/ubeswap-experimental.token-list.json';
import {
  reduceArrayToMap,
  setPriceRefetchInterval,
  setSwapQuoteRefetchInterval,
} from './utils';
import { SwapContainer, UseSwappInnerProps } from './SwapProvider';
import type { CurrencyType } from './types';
import DynamicQueryClient from './PersistedQueryClient';
import bip39 from '@node-fi/react-native-bip39';

export type TokenConfig = {
  address: Address;
  name?: string;
  symbol?: string;
  decimals?: number;
  newAddress?: Address;
  chainId?: ChainId;
  logoURI?: string;
};

export type ConstantsOverride = Partial<{
  storagePrefix: string;
  priceRefetchPeriod: number;
  swapQuoteRefetchPeriod: number;
}>;

export interface NodeKitProviderProps {
  children: React.ReactElement | React.ReactElement[];
  customTokens?: Token[];
  tokenWhitelist?: Set<Address>;
  tokenDetailsOverride?: TokenConfig[];
  tokenBlacklist?: Set<Address>;
  walletConfig?: WalletConfig & { opts?: WalletOptions };
  smartContractWallet?: boolean;
  loadingComponent?: React.ReactElement;
  apiKey: string;
  chainId?: ChainId;
  constantsOverride?: ConstantsOverride;
  defaultCurrencyOverride?: CurrencyType;
}

interface PersistedData {
  wallet: WalletConfig;
  tokens?: UseTokensInnerProps;
  price?: UsePriceInnerProps;
  swap?: UseSwappInnerProps;
}

export function NodeKitProvider(props: NodeKitProviderProps) {
  const {
    children,
    walletConfig,
    loadingComponent,
    apiKey,
    tokenDetailsOverride,
    tokenWhitelist,
    tokenBlacklist,
    customTokens,
    smartContractWallet,
    chainId = ChainId.Celo,
    defaultCurrencyOverride,
    constantsOverride: {
      storagePrefix = DEFAULT_PREFIX,
      swapQuoteRefetchPeriod,
      priceRefetchPeriod,
    } = {},
  } = props;
  const [persistedData, setPersistedData] = React.useState<PersistedData>();
  const [loaded, setLoaded] = React.useState(false);

  const tokenOverride = React.useMemo(
    () => reduceArrayToMap(tokenDetailsOverride ?? [], 'address'),
    [tokenDetailsOverride]
  );

  React.useEffect(() => {
    if (storagePrefix !== DEFAULT_PREFIX) setStoragePrefix(storagePrefix);
    if (swapQuoteRefetchPeriod)
      setSwapQuoteRefetchInterval(swapQuoteRefetchPeriod);
    if (priceRefetchPeriod) setPriceRefetchInterval(priceRefetchPeriod);

    (async () => {
      const persistedWalletConfig = (await asyncReadObject(
        `${storagePrefix}${WALLET_KEY_SUFFIX}`
      )) as WalletConfig;
      const persistedTokens = (await asyncReadObject(
        `${storagePrefix}${TOKENS_KEY_SUFFIX}`
      )) as UseTokensInnerProps | undefined;
      const persistedPrice = (await asyncReadObject(
        `${storagePrefix}${PRICE_KEY_SUFFICE}`
      )) as UsePriceInnerProps | undefined;
      const persistedSwap = (await asyncReadObject(
        `${storagePrefix}${SWAP_KEY_SUFFIX}`
      )) as UseSwappInnerProps | undefined;
      if (persistedWalletConfig) {
        if (persistedTokens && persistedTokens.chainId !== chainId) {
          // indicates a chain id switch since last load
          setPersistedData({
            wallet: {
              ...persistedWalletConfig,
              getMnemonic: () => getMnemonic(storagePrefix),
            },
            swap: persistedSwap,
          });
        } else {
          setPersistedData({
            wallet: {
              ...persistedWalletConfig,
              getMnemonic: () => getMnemonic(storagePrefix),
            },
            tokens: persistedTokens,
            price: persistedPrice,
            swap: persistedSwap,
          });
        }
      }
      setLoaded(true);
    })();
  }, [setLoaded, storagePrefix, swapQuoteRefetchPeriod, priceRefetchPeriod]);

  return !loaded ? (
    loadingComponent ?? null
  ) : (
    <DynamicQueryClient>
      <WalletContainer.Provider
        initialState={{
          apiKey,
          walletConfig: {
            ...(persistedData?.wallet ?? {}),
            ...(walletConfig ?? {}),
            bip39: bip39 as any,
          },
          onWalletDeletion: () => clearMnemonic(storagePrefix),
          noSmartWallet: !smartContractWallet,
          onMnemonicChanged: async (mnemonic: string) =>
            await saveMnemonic(storagePrefix, mnemonic),
          chainId,
        }}
      >
        <TokenContainer.Provider
          initialState={{
            chainId,
            initialTokens: DEFAULT_TOKENS.tokens
              .filter(({ address }) => {
                const hasBlacklist = tokenBlacklist?.size !== undefined;
                const hasWhitelist = tokenWhitelist?.size !== undefined;
                if (hasBlacklist && hasWhitelist) {
                  return (
                    !tokenBlacklist.has(address.toLowerCase()) &&
                    tokenWhitelist.has(address.toLowerCase())
                  );
                }
                if (hasBlacklist) return !tokenBlacklist.has(address);
                if (hasWhitelist) {
                  return tokenWhitelist.has(address);
                }
                return true;
              })
              .map((t) => {
                const {
                  address,
                  name,
                  symbol,
                  chainId: tokenChainId,
                  decimals,
                  logoURI,
                  newAddress,
                } = {
                  ...t,
                  ...tokenOverride[t.address],
                } as TokenConfig & { chainId: number };
                return new Token(
                  tokenChainId,
                  newAddress ?? address,
                  decimals,
                  symbol,
                  name,
                  logoURI
                );
              })
              .concat(customTokens ?? [])
              .filter((el) => el.chainId === chainId),
            ...persistedData?.tokens,
          }}
        >
          <PriceContainer.Provider
            initialState={{
              apiKey,
              chainId,
              ...persistedData?.price,
              defaultCurrency:
                persistedData?.price?.defaultCurrency ??
                defaultCurrencyOverride,
            }}
          >
            <SwapContainer.Provider initialState={persistedData?.swap}>
              {children}
            </SwapContainer.Provider>
          </PriceContainer.Provider>
        </TokenContainer.Provider>
      </WalletContainer.Provider>
    </DynamicQueryClient>
  );
}
