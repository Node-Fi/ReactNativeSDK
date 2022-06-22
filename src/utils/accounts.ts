import { generateSecureRandom } from 'react-native-securerandom';
import * as bip39 from 'bip39';
import { ChainId, EOA, SmartWallet } from '@node-fi/sdk-core';

export const generateMnemonic = async () => {
  const bytes = await generateSecureRandom(32);
  let temp = '';
  for (let i = 0; i < bytes.length; i++) {
    const num = bytes[i].toString(16);
    temp += num.length < 2 ? `0${num}` : num;
  }

  const mnemonic = bip39.entropyToMnemonic(temp);
  return mnemonic;
};

export const createWallet = async (
  apiKey: string,
  chain: ChainId,
  smartWallet?: boolean,
  existingMnemonic?: string
) => {
  const mnemonic = existingMnemonic ?? (await generateMnemonic());
  const wallet = smartWallet
    ? new SmartWallet(apiKey, chain)
    : new EOA(apiKey, chain);
  await wallet._loadWallet({ mnemonic });
  await wallet.register();

  return { wallet, mnemonic };
};
