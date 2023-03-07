import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

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
