// @ts-ignore
import * as React from 'react';
import { WalletContainer } from './WalletContext';
// import { PriceContainer } from './PriceContext';
import type { Address } from '@node-fi/node-sdk';
import type { WalletConfig } from '@node-fi/node-sdk/dist/src/wallet/Wallet';
import { DEFAULT_PREFIX, WALLET_KEY_SUFFIX } from './utils/storageKeys';
import { asyncReadObject } from './utils/asyncStorage';
import { clearMnemonic, getMnemonic, saveMnemonic } from './utils/security';
// import { TokenContainer } from './TokensContext';
// import DEFAULT_TOKENS from '@node-fi/default-token-list';

export interface TokenConfig {
  address: Address;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface NodeKitProviderProps {
  children: React.ReactElement | React.ReactElement[];
  supportedTokens?: TokenConfig[];
  tokenDetailsOverride?: TokenConfig[];
  tokenBlacklist?: Address[];
  storagePrefix?: string;
  walletConfig?: WalletConfig;
  eoaOnly?: boolean;
  loadingComponent?: React.ReactElement;
}

interface PersistedData {
  wallet: WalletConfig;
}

export function NodeKitProvider(props: NodeKitProviderProps) {
  const {
    children,
    storagePrefix = DEFAULT_PREFIX,
    eoaOnly,
    walletConfig,
    loadingComponent,
  } = props;

  const [persistedData, setPersistedData] = React.useState<PersistedData>();
  const [loaded, setLoaded] = React.useState(false);

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
    <WalletContainer.Provider
      initialState={{
        walletConfig: walletConfig ?? persistedData?.wallet,
        onWalletDeletion: () => clearMnemonic(storagePrefix),
        noSmartWallet: eoaOnly,
        onMnemonicChanged: async (mnemonic: string) =>
          await saveMnemonic(storagePrefix, mnemonic),
      }}
    >
      {children}
      {/* <TokenContainer.Provider
        initialState={{
          initialTokens: DEFAULT_TOKENS.tokens.map(
            ({ address, name, symbol, chainId, decimals }) =>
              new Token(chainId, address, decimals, symbol, name)
          ),
        }}
      >
        <PriceContainer.Provider>{children}</PriceContainer.Provider>
      </TokenContainer.Provider> */}
    </WalletContainer.Provider>
  );
}
