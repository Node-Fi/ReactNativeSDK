import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
} from 'react-native-keychain';
export const WALLET_KEY_SUFFIX = '/Wallet/Info';
export const DEFAULT_PREFIX = '@node-fi/sdk';
export const MNEMONIC = '/secret';
export const SECURE_ENCLAVE_LABEL = '0xNodeFiSecureEnclave';

export const KEYCHAIN_SETTINGS = (service: string) => ({
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  service,
});
