import * as Keychain from 'react-native-keychain';
import ECEncryption from 'react-native-ec-encryption';
import { KEYCHAIN_SETTINGS, SECURE_ENCLAVE_LABEL } from './storageKeys';
import invariant from 'tiny-invariant';

export const getMnemonic = async (service: string) => {
  const existingCredentials = await Keychain.getGenericPassword(
    KEYCHAIN_SETTINGS(service)
  );
  console.log({ existingCredentials });
  if (!existingCredentials) return undefined;
  const { mnemonicCipher } = JSON.parse(existingCredentials.password);
  const mnemonic: string = await ECEncryption.decrypt({
    data: mnemonicCipher,
    label: SECURE_ENCLAVE_LABEL,
  });
  return mnemonic;
};

export const clearMnemonic = async (service: string) => {
  console.log(service);
  await Keychain.resetGenericPassword(KEYCHAIN_SETTINGS(service));
};

export const saveMnemonic = async (service: string, mnemonic: string) => {
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
    KEYCHAIN_SETTINGS(service)
  );
};
