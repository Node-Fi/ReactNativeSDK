// @ts-ignore
import * as React from 'react';
import { WalletContainer } from './WalletContext';
import { PriceContainer } from './PriceContext';
import { Address, Token } from '@node-fi/sdk-core';
import type { WalletConfig } from '@node-fi/sdk-core/dist/src/wallet/Wallet';
import { DEFAULT_PREFIX, WALLET_KEY_SUFFIX } from './utils/storageKeys';
import { asyncReadObject } from './utils/asyncStorage';
import { clearMnemonic, getMnemonic, saveMnemonic } from './utils/security';
import { TokenContainer } from './TokensContext';
import DEFAULT_TOKENS from '@node-fi/default-token-list';
import { QueryClient, QueryClientProvider } from 'react-query';
import { reduceArrayToMap } from './utils';

export type TokenConfig = {
  address: Address;
  name?: string;
  symbol?: string;
  decimals?: number;
};

export interface NodeKitProviderProps {
  children: React.ReactElement | React.ReactElement[];
  customTokens: Token[];
  tokenWhitelist?: Set<Address>;
  tokenDetailsOverride?: TokenConfig[];
  tokenBlacklist?: Set<Address>;
  storagePrefix?: string;
  walletConfig?: WalletConfig;
  eoaOnly?: boolean;
  loadingComponent?: React.ReactElement;
  apiKey: string;
}

interface PersistedData {
  wallet: WalletConfig;
}

const queryClient = new QueryClient();

export function NodeKitProvider(props: NodeKitProviderProps) {
  const {
    children,
    storagePrefix = DEFAULT_PREFIX,
    eoaOnly,
    walletConfig,
    loadingComponent,
    apiKey,
    tokenDetailsOverride,
    tokenWhitelist,
    tokenBlacklist,
    customTokens,
  } = props;

  const [persistedData, setPersistedData] = React.useState<PersistedData>();
  const [loaded, setLoaded] = React.useState(false);

  const tokenOverride = React.useMemo(
    () => reduceArrayToMap(tokenDetailsOverride ?? [], 'address'),
    [tokenDetailsOverride]
  );

  React.useEffect(() => {
    (async () => {
      const persistedWalletConfig = (await asyncReadObject(
        `${storagePrefix}${WALLET_KEY_SUFFIX}`
      )) as WalletConfig;
      console.log(persistedWalletConfig);
      if (persistedWalletConfig) {
        setPersistedData({
          wallet: {
            ...persistedWalletConfig,
            getMnemonic: () => getMnemonic(storagePrefix),
          },
        });
      }
      setLoaded(true);
    })();
  }, [setLoaded, storagePrefix]);

  return !loaded ? (
    loadingComponent ?? null
  ) : (
    <QueryClientProvider client={queryClient}>
      <WalletContainer.Provider
        initialState={{
          apiKey,
          walletConfig: walletConfig ?? persistedData?.wallet,
          onWalletDeletion: () => clearMnemonic(storagePrefix),
          noSmartWallet: eoaOnly,
          onMnemonicChanged: async (mnemonic: string) =>
            await saveMnemonic(storagePrefix, mnemonic),
        }}
      >
        <TokenContainer.Provider
          initialState={{
            initialTokens: DEFAULT_TOKENS.tokens
              .filter(({ address }) => {
                if (tokenBlacklist) return !tokenBlacklist.has(address);
                if (tokenWhitelist) return tokenWhitelist.has(address);
                return true;
              })
              .map((t) => {
                const { address, name, symbol, chainId, decimals, logoURI } = {
                  ...t,
                  ...tokenOverride[t.address],
                } as TokenConfig & { chainId: number; logoURI: string };
                return new Token(
                  chainId,
                  address,
                  decimals,
                  symbol,
                  name,
                  logoURI
                );
              })
              .concat(customTokens ?? []),
          }}
        >
          <PriceContainer.Provider initialState={{ apiKey }}>
            {children}
          </PriceContainer.Provider>
        </TokenContainer.Provider>
      </WalletContainer.Provider>
    </QueryClientProvider>
  );
}
