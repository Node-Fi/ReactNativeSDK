// @ts-ignore
import * as React from 'react';
// import { TokenContainer } from './TokensContext';
import { WalletContainer } from './WalletContext';
// import { PriceContainer } from './PriceContext';
import type { Address } from '@node-fi/node-sdk';
import type { WalletConfig } from '@node-fi/node-sdk/dist/src/wallet/Wallet';
import ECEncryption from 'react-native-ec-encryption';
import * as Keychain from 'react-native-keychain';
import {
  DEFAULT_PREFIX,
  KEYCHAIN_SETTINGS,
  SECURE_ENCLAVE_LABEL,
  WALLET_KEY_SUFFIX,
} from './utils/storageKeys';
import invariant from 'tiny-invariant';
import { asyncReadObject } from './utils/asyncStorage';
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

export const getMnemonic = async (service: string) => {
  const existingCredentials = await Keychain.getGenericPassword(
    KEYCHAIN_SETTINGS(service)
  );
  if (!existingCredentials) return undefined;
  const { mnemonicCipher } = JSON.parse(existingCredentials.password);
  const mnemonic: string = await ECEncryption.decrypt({
    data: mnemonicCipher,
    label: SECURE_ENCLAVE_LABEL,
  });
  return mnemonic;
};

export const clearMnemonic = async (service: string) => {
  await Keychain.resetGenericPassword(KEYCHAIN_SETTINGS(service));
};

export const saveMnemonic = async (service: string, mnemonic: string) => {
  const existingCredentials = await getMnemonic(service);
  invariant(
    !!existingCredentials,
    'Mnemonic already exists here, delete mnemonic before overriding'
  );
  const mnemonicCipher: string = await ECEncryption.encrypt({
    data: mnemonic,
    label: SECURE_ENCLAVE_LABEL,
  });
  await Keychain.setGenericPassword(
    service,
    mnemonicCipher,
    KEYCHAIN_SETTINGS(service)
  );
};

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

  console.log({ loaded });

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
