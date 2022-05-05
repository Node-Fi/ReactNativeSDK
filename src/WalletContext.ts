import * as React from 'react';
import { createContainer } from 'unstated-next';
import { Wallet, SmartWallet, EOA, ChainId } from '@node-fi/node-sdk';
import type { WalletConfig } from '@node-fi/node-sdk/dist/src/wallet/Wallet';
import { asyncWriteObject } from './utils/asyncStorage';
import { DEFAULT_PREFIX, WALLET_KEY_SUFFIX } from './utils/storageKeys';

export interface UseWalletProps {
  noSmartWallet?: boolean;
  walletConfig?: WalletConfig;
}

function useWalletInner(initialState: UseWalletProps | undefined) {
  const { noSmartWallet, walletConfig } = initialState ?? {};
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
  return { wallet, initialized };
}

export const WalletContainer = createContainer<
  { wallet: Wallet; initialized: boolean },
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
