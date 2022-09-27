import * as Keychain from 'react-native-keychain';
import { DEFAULT_PREFIX, KEYCHAIN_SETTINGS } from './storageKeys';
import invariant from 'tiny-invariant';
// import * as LocalAuthentication from 'expo-local-authentication';
// import { Platform } from 'react-native';

export const getMnemonic = async (
  storagePrefix: string = DEFAULT_PREFIX
  // attempt = 0
): Promise<string | undefined> => {
  const biometrySupported = await Keychain.getSupportedBiometryType();

  const existingCredentials = await Keychain.getGenericPassword(
    KEYCHAIN_SETTINGS(storagePrefix, biometrySupported)
  );
  if (!existingCredentials) return undefined;
  // if (Platform.OS === 'android') {
  //   const auth = await LocalAuthentication.authenticateAsync();
  //   if (!auth.success) {
  //     if (attempt > 3) throw new Error('Unauthorized access');
  //     return getMnemonic(service, attempt + 1);
  //   }
  // }
  const { mnemonic } = JSON.parse(existingCredentials.password);
  // const mnemonic: string = await ECEncryption.decrypt({
  //   data: mnemonicCipher,
  //   label: SECURE_ENCLAVE_LABEL,
  // });
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
