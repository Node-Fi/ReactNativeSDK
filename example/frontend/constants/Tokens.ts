import { TokenConfig } from '@node-fi/react-native-sdk';
export const SUPPORTED_TOKENS: readonly string[] = [
  '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
  '0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58',
  '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
  '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
];
export const TOKEN_OVERRIDES: readonly TokenConfig[] = [
  {
    address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
    name: 'Ethereum',
    symbol: 'ETH',
  },
  {
    address: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
    name: 'Mobius',
  },
  {
    address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    name: 'Real',
    symbol: 'RL',
  },
  {
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    name: 'Euro',
    symbol: 'EUR',
  },
  {
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    name: 'US Dollar',
    symbol: 'USD',
  },
];
