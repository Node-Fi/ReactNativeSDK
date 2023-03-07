import * as Keychain from 'react-native-keychain';
import { DEFAULT_PREFIX, KEYCHAIN_SETTINGS } from './storageKeys';
import invariant from 'tiny-invariant';
// import * as LocalAuthentication from 'expo-local-authentication';
// import { Platform } from 'react-native';

export const getMnemonic = async (
  storagePrefix: string = DEFAULT_PREFIX
): Promise<string | undefined> => {
  const biometrySupported = await Keychain.getSupportedBiometryType();

  const existingCredentials = await Keychain.getGenericPassword(
    KEYCHAIN_SETTINGS(storagePrefix, biometrySupported)
  );
  if (!existingCredentials) return undefined;
  const { mnemonic } = JSON.parse(existingCredentials.password);
  return mnemonic;
};

export const clearMnemonic = async (storagePrefix: string = DEFAULT_PREFIX) => {
  const biometrySupported = await Keychain.getSupportedBiometryType();
  await Keychain.resetGenericPassword(
    KEYCHAIN_SETTINGS(storagePrefix, biometrySupported)
  );
};

export const saveMnemonic = async (
  storagePrefix: string = DEFAULT_PREFIX,
  mnemonic: string
) => {
  const biometrySupported = await Keychain.getSupportedBiometryType();
  const existingCredentials = await getMnemonic(storagePrefix);
  invariant(
    !existingCredentials,
    'Mnemonic already exists here, delete mnemonic before overriding'
  );
  // const mnemonicCipher: string = await ECEncryption.encrypt({
  //   data: mnemonic,
  //   label: SECURE_ENCLAVE_LABEL,
  // });
  await Keychain.setGenericPassword(
    storagePrefix,
    JSON.stringify({ mnemonic, _v: 0 }), //mnemonicCipher,
    KEYCHAIN_SETTINGS(storagePrefix, biometrySupported)
  );
};
