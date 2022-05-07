// @ts-ignore
import * as React from 'react';
import { TokenContainer } from './TokensContext';
import { WalletContainer } from './WalletContext';
import { PriceContainer } from './PriceContext';
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

export interface TokenConfig {
  address: Address;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface NodeKitProviderProps {
  children: React.ReactChild | React.ReactChild[];
  supportedTokens?: TokenConfig[];
  tokenDetailsOverride?: TokenConfig[];
  tokenBlacklist?: Address[];
  storagePrefix?: string;
  walletConfig?: WalletConfig;
  eoaOnly?: boolean;
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

export default function NodeKitProvider(props: NodeKitProviderProps) {
  const {
    children,
    storagePrefix = DEFAULT_PREFIX,
    eoaOnly,
    walletConfig,
  } = props;

  const [persistedData, setPersistedData] = React.useState<PersistedData>();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    async () => {
      const persistedWalletConfig = (await asyncReadObject(
        `${storagePrefix}${WALLET_KEY_SUFFIX}`
      )) as WalletConfig;

      if (persistedWalletConfig) {
        setPersistedData({
          wallet: {
            ...persistedWalletConfig,
            getMnemonic: () => getMnemonic(storagePrefix),
          },
        });
      }
      setLoaded(true);
    };
  });

  return !loaded ? null : (
    <WalletContainer.Provider
      initialState={{
        walletConfig: walletConfig ?? persistedData?.wallet,
        noSmartWallet: eoaOnly,
        onMnemonicChanged: async (mnemonic: string) =>
          await saveMnemonic(storagePrefix, mnemonic),
      }}
    >
      <TokenContainer.Provider>
        <PriceContainer.Provider>{children}</PriceContainer.Provider>
      </TokenContainer.Provider>
    </WalletContainer.Provider>
  );
}
