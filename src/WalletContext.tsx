import * as React from 'react';
import { createContainer } from 'unstated-next';
import {
  Wallet,
  SmartWallet,
  EOA,
  ChainId,
  Address,
  validateAndParseAddress,
} from '@node-fi/sdk-core';
import type {
  WalletConfig,
  WalletOptions,
} from '@node-fi/sdk-core/dist/src/wallet/Wallet';
import { asyncClear, asyncWriteObject } from './utils/asyncStorage';
import { DEFAULT_PREFIX, WALLET_KEY_SUFFIX } from './utils/storageKeys';
import { createWallet, MnemonicLanguageOption } from './utils/accounts';
import { Alert } from 'react-native';
import { useOnClose } from './hooks';
import invariant from 'tiny-invariant';

export interface UseWalletProps {
  noSmartWallet?: boolean;
  walletConfig?: WalletConfig & { opts?: WalletOptions };
  onMnemonicChanged: (mnemonic: string) => Promise<void>;
  onWalletDeletion: () => Promise<void>;
  apiKey: string;
  chainId?: ChainId;
}

export interface UseWalletInnerType {
  wallet: Wallet;
  initialized: boolean;
  noSmartWallet?: boolean;
  onMnemonicChanged?: (mnemonic: string) => Promise<void>;
  onWalletDeletion?: () => Promise<void>;
  setWallet: (wallet: Wallet) => void;
  chainId?: ChainId;
  apiKey?: string;
}

export interface WalletCreationOpts {
  defaultGasCurrency?: Address;
  mnemonic?: string;
  bip39Language?: MnemonicLanguageOption;
}

function useWalletInner(initialState: UseWalletProps | undefined) {
  const {
    noSmartWallet,
    walletConfig,
    onMnemonicChanged,
    onWalletDeletion,
    apiKey,
    chainId,
  } = initialState ?? {};
  const [initialized, setInitialized] = React.useState(false);
  const [wallet, setWallet] = React.useState<Wallet>(
    noSmartWallet
      ? new EOA(apiKey, chainId, walletConfig?.eoa)
      : new SmartWallet(apiKey, chainId, walletConfig?.smartWallet)
  );
  const address = wallet.address;
  const eoaAddress = wallet instanceof SmartWallet && wallet.eoa?.address;

  React.useEffect(() => {
    (async () => {
      if (walletConfig) {
        const newWallet = noSmartWallet
          ? new EOA(apiKey, chainId, walletConfig?.eoa, walletConfig.opts)
          : new SmartWallet(
              apiKey,
              chainId,
              walletConfig?.smartWallet,
              walletConfig.opts
            );
        await newWallet._loadWallet(walletConfig);

        setWallet(newWallet);
        setInitialized(true);
      }
    })();
  }, [noSmartWallet, setWallet, setInitialized, apiKey, walletConfig, chainId]);

  // Save to async storage when finished.
  useOnClose(async () => {
    const opts = {
      defaultGasToken: wallet.feeCurrency,
    };
    await asyncWriteObject(
      `${DEFAULT_PREFIX}${WALLET_KEY_SUFFIX}`,
      noSmartWallet
        ? { eoa: address, opts }
        : {
            eoa: eoaAddress,
            smartWallet: address,
            opts,
          }
    );
  });

  return {
    wallet,
    initialized,
    onMnemonicChanged,
    noSmartWallet,
    setWallet,
    onWalletDeletion,
    chainId,
    apiKey,
  };
}

export const WalletContainer = createContainer<
  UseWalletInnerType,
  UseWalletProps
>(useWalletInner);

export const useWalletBase = WalletContainer.useContainer;

export const useApiKey = () => {
  const { apiKey } = WalletContainer.useContainer();

  return React.useMemo(() => apiKey, [apiKey]);
};

export const useChainId = () => {
  const { chainId } = WalletContainer.useContainer();
  return chainId;
};

export const useWallet = () => {
  const { wallet } = WalletContainer.useContainer();
  return wallet;
};

export const useWalletAddress = () => {
  const { wallet } = WalletContainer.useContainer();
  return wallet.address;
};

export const useCreateWallet = () => {
  const { noSmartWallet, onMnemonicChanged, setWallet, chainId, apiKey } =
    WalletContainer.useContainer();
  invariant(!!apiKey, 'Api Key Required');
  const chain = chainId;
  return React.useCallback(
    async (opts: WalletCreationOpts = {}) => {
      const { wallet, mnemonic } = await createWallet(
        apiKey,
        chain ?? ChainId.Celo,
        opts.bip39Language,
        !noSmartWallet,
        opts.mnemonic
      );
      if (opts && opts.defaultGasCurrency) {
        wallet.setFeeCurrency(opts.defaultGasCurrency);
      }

      setWallet(wallet);
      if (!onMnemonicChanged) {
        Alert.alert(
          'Cant Save Mnemonic',
          'No method was provided to save mnemonic to secure storage'
        );
      } else {
        await onMnemonicChanged(mnemonic);
      }
      return wallet;
    },
    [chain, noSmartWallet, setWallet, onMnemonicChanged, apiKey]
  );
};

export const useDeleteWallet = () => {
  const { onWalletDeletion, setWallet, noSmartWallet } =
    WalletContainer.useContainer();
  return React.useCallback(async () => {
    setWallet(noSmartWallet ? new EOA() : new SmartWallet());
    await asyncClear(`${DEFAULT_PREFIX}${WALLET_KEY_SUFFIX}`);
    onWalletDeletion && (await onWalletDeletion());
  }, [onWalletDeletion, setWallet, noSmartWallet]);
};

export const useSetGasToken = () => {
  const { wallet } = WalletContainer.useContainer();
  const currentGasToken = wallet.feeCurrency;

  const setGasToken = React.useCallback(
    (newFeeCurrency: string) => {
      const address = validateAndParseAddress(newFeeCurrency);
      invariant(address, 'Not a valid address!');
      try {
        wallet.setFeeCurrency(newFeeCurrency);
      } catch (e) {
        console.error(e);
      }
    },
    [wallet]
  );

  return [currentGasToken, setGasToken];
};

// export WalletContainer as  React.ReactComponentElement<any, {initalValues: UseWalletInnerType}>
