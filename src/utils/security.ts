import * as Keychain from 'react-native-keychain';
import ECEncryption from 'react-native-ec-encryption';
import { KEYCHAIN_SETTINGS, SECURE_ENCLAVE_LABEL } from './storageKeys';
import invariant from 'tiny-invariant';

export const getMnemonic = async (service: string) => {
  const biometrySupported = await Keychain.getSupportedBiometryType();

  const existingCredentials = await Keychain.getGenericPassword(
    KEYCHAIN_SETTINGS(service, biometrySupported)
  );
  if (!existingCredentials) return undefined;
  const mnemonicCipher = existingCredentials.password;
  const mnemonic: string = await ECEncryption.decrypt({
    data: mnemonicCipher,
    label: SECURE_ENCLAVE_LABEL,
  });
  return mnemonic;
};

export const clearMnemonic = async (service: string) => {
  const biometrySupported = await Keychain.getSupportedBiometryType();
  await Keychain.resetGenericPassword(
    KEYCHAIN_SETTINGS(service, biometrySupported)
  );
};

export const saveMnemonic = async (service: string, mnemonic: string) => {
  const biometrySupported = await Keychain.getSupportedBiometryType();
  const existingCredentials = await getMnemonic(service);
  invariant(
    !existingCredentials,
    'Mnemonic already exists here, delete mnemonic before overriding'
  );
  const mnemonicCipher: string = await ECEncryption.encrypt({
    data: mnemonic,
    label: SECURE_ENCLAVE_LABEL,
  });
  await Keychain.setGenericPassword(
    service,
    mnemonicCipher,
    KEYCHAIN_SETTINGS(service, biometrySupported)
  );
};
