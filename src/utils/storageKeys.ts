import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
  BIOMETRY_TYPE,
} from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
export const WALLET_KEY_SUFFIX = '/Wallet/Info';
export const PRICE_KEY_SUFFICE = '/price/info';
export const SWAP_KEY_SUFFIX = '/swap/info';
export const TOKENS_KEY_SUFFIX = '/tokens/info';
export let DEFAULT_PREFIX = '@node-fi/sdk-core';
export const MNEMONIC = '/secret';
export const SECURE_ENCLAVE_LABEL = '0xNodeFiSecureEnclave';

export const setStoragePrefix = (newPrefix: string) =>
  (DEFAULT_PREFIX = newPrefix);

export const KEYCHAIN_SETTINGS = (
  service: string,
  biometryType: BIOMETRY_TYPE | null
) => {
  if (DeviceInfo.isEmulatorSync() && Platform.OS === 'ios') {
    console.warn(
      'iOS Emulator detected, disabling Biometrics for this session.  If you are not on an emulator contact dylan@thenode.fi immediately to report this bug.'
    );
    return { service };
  }

  return {
    accessControl: biometryType
      ? ACCESS_CONTROL.BIOMETRY_CURRENT_SET
      : ACCESS_CONTROL.USER_PRESENCE,
    accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    service,
  };
};
