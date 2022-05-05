import * as React from 'react';
import { createContainer } from 'unstated-next';
import { Wallet, SmartWallet, EOA, ChainId } from '@node-fi/node-sdk';
import type { WalletConfig } from '@node-fi/node-sdk/dist/src/wallet/Wallet';
import { asyncWriteObject } from './utils/asyncStorage';
import { DEFAULT_PREFIX, WALLET_KEY_SUFFIX } from './utils/storageKeys';
import { createWallet } from './utils/accounts';
import { Alert } from 'react-native';

export interface UseWalletProps {
  noSmartWallet?: boolean;
  walletConfig?: WalletConfig;
  onMnemonicChanged: (mnemonic: string) => Promise<void>;
}

interface UseWalletInnerType {
  wallet: Wallet;
  initialized: boolean;
  noSmartWallet?: boolean;
  onMnemonicChanged?: (mnemonic: string) => Promise<void>;
  setWallet: (wallet: Wallet) => void;
}

function useWalletInner(initialState: UseWalletProps | undefined) {
  const { noSmartWallet, walletConfig, onMnemonicChanged } = initialState ?? {};
  const apiKey = '';
  const chain = ChainId.Celo;
  const [initialized, setInitialized] = React.useState(false);
  const [wallet, setWallet] = React.useState<Wallet>(
    noSmartWallet
      ? new EOA(apiKey, chain, walletConfig?.eoa)
      : new SmartWallet(apiKey, chain, walletConfig?.smartWallet)
  );

  React.useEffect(() => {
    (async () => {
      if (walletConfig) {
        const newWallet = noSmartWallet
          ? new EOA(apiKey, chain, walletConfig?.eoa)
          : new SmartWallet(apiKey, chain, walletConfig?.smartWallet);
        await newWallet._loadWallet(walletConfig);
        setWallet(newWallet);
        setInitialized(true);
      }
    })();
  }, [noSmartWallet, setWallet, setInitialized, apiKey, chain, walletConfig]);

  // Save to async storage when finished.
  React.useEffect(() => {
    return () => {
      asyncWriteObject(
        `${DEFAULT_PREFIX}${WALLET_KEY_SUFFIX}`,
        noSmartWallet
          ? { eoa: wallet.address }
          : {
              eoa: (wallet as SmartWallet).eoa?.address,
              smartWallet: wallet.address,
            }
      );
    };
  });

  return { wallet, initialized, onMnemonicChanged, noSmartWallet, setWallet };
}

export const WalletContainer = createContainer<
  UseWalletInnerType,
  UseWalletProps
>(useWalletInner);

export const useWallet = () => {
  const { wallet } = WalletContainer.useContainer();
  return wallet;
};

export const useWalletAddress = () => {
  const { wallet } = WalletContainer.useContainer();
  return wallet.address;
};

export const useCreateWallet = () => {
  const { noSmartWallet, onMnemonicChanged, setWallet } =
    WalletContainer.useContainer();
  const apiKey = '';
  const chain = ChainId.Celo;
  return React.useMemo(
    () => async () => {
      const { wallet, mnemonic } = await createWallet(
        apiKey,
        chain,
        !noSmartWallet
      );
      setWallet(wallet);
      if (!onMnemonicChanged) {
        Alert.alert(
          'Cant Save Mnemonic',
          'No method was provided to save mnemonic to secure storage'
        );
      } else {
        await onMnemonicChanged(mnemonic);
      }
    },
    [chain, noSmartWallet, setWallet, onMnemonicChanged]
  );
};
