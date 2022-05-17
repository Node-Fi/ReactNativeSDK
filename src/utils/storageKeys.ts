import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
  BIOMETRY_TYPE,
} from 'react-native-keychain';
export const WALLET_KEY_SUFFIX = '/Wallet/Info';
export const DEFAULT_PREFIX = '@node-fi/sdk';
export const MNEMONIC = '/secret';
export const SECURE_ENCLAVE_LABEL = '0xNodeFiSecureEnclave';

export const KEYCHAIN_SETTINGS = (
  service: string,
  biometryType: BIOMETRY_TYPE | null
) => ({
  accessControl: biometryType
    ? ACCESS_CONTROL.BIOMETRY_CURRENT_SET
    : ACCESS_CONTROL.USER_PRESENCE,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  service,
});
