import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { TokenAmount } from '@node-fi/sdk-core';
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';

export function shortenAddress(address: string, len = 5): string {
  return `${address.slice(0, len)}...${address.slice(-3)}`;
}

export function formatExplorerURL(txnHash: string) {
  return `https://celoscan.xyz/tx/${txnHash}`;
}

export const formatTokenAmount = (
  amount: TokenAmount | number,
  force?: number
) => {
  let scaledAmount =
    typeof amount === 'number'
      ? new BigNumber(amount)
      : amount.raw.dividedBy(new BigNumber(`1e+${amount.token.decimals}`));
  return !amount
    ? undefined
    : force !== undefined
    ? scaledAmount.toFixed(force)
    : scaledAmount.isGreaterThan('0') && scaledAmount.isLessThan('1')
    ? scaledAmount.toFormat(2)
    : scaledAmount.toFormat(6);
};

// https://stackoverflow.com/questions/63721110/how-can-i-convert-image-url-to-base64-string
export async function getBase64ImageFromUrl(imageUrl: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      function () {
        resolve(reader.result);
      },
      false
    );
    reader.onerror = () => {
      return reject(this);
    };
    reader.readAsDataURL(blob);
  });
}
