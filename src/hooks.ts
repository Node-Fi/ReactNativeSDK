import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
export {
  useCreateWallet,
  useWallet,
  useWalletAddress,
  useDeleteWallet,
} from './WalletContext';
export {
  useSetDefaultCurrency,
  useTokenPrice,
  useTokenPrices,
  useDefaultCurrency,
} from './PriceContext';
export {
  useAddToken,
  useBalances,
  useRemoveToken,
  useTokens,
} from './TokensContext';

export const useOnClose = (callback: () => Promise<void>) => {
  useEffect(() => {
    const onClose = (appstate: AppStateStatus) => {
      if (appstate.match(/inactive|background/)) {
        callback();
      }
    };
    AppState.addEventListener('change', onClose);
    return () => {
      AppState.removeEventListener('change', onClose);
    };
  }, [callback]);
};
