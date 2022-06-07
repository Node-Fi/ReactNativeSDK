# @node-fi/node-sdk-react-native

A React Native wrapper for the Node Core SDK

## Installation

```sh
yarn add @node-fi/react-native-wrapper
```

### ios

```sh
npx pod-install
```

For FaceId to work, you must add permissions in your info.plist for `NSFaceIDUsageDescription`
Example:

```
...
<key>NSFaceIDUsageDescription</key>
	<string>Message here</string>
...
```

### Required Steps

#### Babel.config.js

Within `babel.config.js`, add:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      // other presets here
    ],
    plugins: [
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      ['module:react-native-dotenv'],
      // other settings here
    ],
    // anything else
  };
};
```

Alternatively, you can import the above and call one function, so your `babel.config.js` will look like:

```js
const nodeConfig = require('@node-fi/react-native-sdk/nodeWalletBabel');
module.exports = function (api) {
  return { ...nodeConfig(api) };
};
```

#### index.js

Within your `index.js`, you will need to import a script from the sdk in order to properly set up dependencies:

```js
/* dapp-begin */
require('@node-fi/react-native-sdk/setup');

/**
 * Other code goes here
 */

const { registerRootComponent } = require('expo');
const { default: App } = require('./frontend/App');
registerRootComponent(App);
/* dapp-end */
```

## Getting Started

In order to access the functionality of this SDK, you will need to wrap your app with the `NodeKitProvider` component.

```tsx
export default function App() {
  // code here
  return (
    <NodeKitProvider
      loadingComponent={loadingComponent}
      eoaOnly
      apiKey={API_KEY}
      tokenWhitelist={new Set(SUPPORTED_TOKENS)}
      tokenDetailsOverride={TOKEN_OVERRIDES}
      customTokens={[
        new Token(CHAIN, ADDRESS, DECIMALS, SYMBOL, NAME, LOGO_URL),
      ]}
      chainId={CHAIN_ID}
    >
      <App />
    </NodeKitProvider>
  );
}
```

## Creating a Wallet

Creating a wallet can be done with one single function! The SDK currently supports creating a new wallet from scratch, as well as importing a wallet using a seed phrase. When a new wallet is created, the mnemonic is saved to the device's secure storage, protected by biometrics. On subsequent app loads, when a user correctly authenticates themselves with biometrics their wallet information will be fetched.

Create wallet takes an argument of type `WalletCreationOpts`, allowing to create a wallet from a mnemonic as well as set the defaul gas currency on wallet creation. Note that alternate gas currencies are only supported on Celo and Alfajores.

```ts
import { useCreateWallet } from '@node-fi/react-native-wrapper';

// Creating a wallet from scratch:
const createWallet = useCreateWallet();

createWallet().then((wallet) => {
  // Do something!
});

// Importing a wallet using a seed phrase
const createWallet = useCreateWallet();
const mnemonic = 'test test test ... test';

createWallet({ mnemonic }).then((wallet) => {
  // Do something!
});

// Setting default currency on wallet creation
const createWallet = useCreateWallet();
const defaultGasCurrency = addressOf('CUSD');

createWallet({ defaultGasCurrency }).then((wallet) => {
  // Do something!
});
```

## Deleting a Wallet

Similar to creating a wallet, deleting one can be used with one single function call as well.

```ts
import { useDeleteWallet } from '@node-fi/react-native-wrapper';

const deleteWallet = useDeleteWallet(); // Grab the function from the hook
deleteWallet().then(() => {
  // Do something!
});
```

## Wallet Context Accessors

#### useWallet

A user's wallet lives within the global NodeProvider context, and can be accessed from any child.
There are several ways to access a user's wallet, the main way being the hook `useWallet`

```ts
import { useWallet } from '@node-fi/react-native-sdk';

function Component() {
  const wallet = useWallet();

  // Use the wallet
}

function useHook() {
  const wallet = useWallet();

  // Use the wallet
}
```

#### useWalletAddress

Alternatively, if the only field required is the wallet address, there is a hook `useWalletAddress()`

```ts
import { useWalletAddress } from '@node-fi/react-native-wrapper';

function Component() {
  const walletAddress = useWalletAddress();
  // Use the wallet
}

function useHook() {
  const walletAddress = useWalletAddress();
  // Use the wallet
}
```

#### useSetGasToken

useSetGasToken returns a state variable and a setter for the current default gas currency. Gas currency is persisted across sessions.

The state variable is the address of the current gas token. The updater method takes as argument the address of a gas token. Note that the only check performed is that the provided string is a valid address. If the address of a non-accepted currency is provided, transactions will fail. Future iterations of the SDK will check for valid gas currencies.

```tsx
import { useSetGasToken } from '@node-fi/react-native-wrapper';

function Component() {
  const [currentGasToken, setGasToken]: [string, (s: String) => void] =
    useSetGasToken();

  return (
    <View>
      <Text>{`Your current gas token is: ${currentGasToken}`}</Text>
      <Pressable onPress={() => setGasToken(OTHER_TOKEN)}>
        <Text> {`Set gas token to ${OTHER_TOKEN}`} </Text>
      </Pressable>
    </View>
  );
}
```

#### usePortfolioHistory

This hook will return an array of objects relating to a wallet's balance at a specific point in time. The range for which to fetch balances is a required parameter, and corresponds to the number of days to retrieve data for. Values are mapped to an enum `DateRange`.

While data is loading, the returned value will be `undefined`

`usePortfolioHistory(range: DateRange)`

```tsx
import { usePortfolioHistory } from '@node-fi/react-native-sdk';
import { DateRange } from '@node-fi/sdk-core';

// Possible Values for DateRange
DateRange['1H']; // 1 Hour
DateRange['1D']; // 1 Day
DateRange['1W']; // 7 Day
DateRange['1M']; // 30 Day
DateRange['1Y']; // 365 Day
DateRange['ALL']; // Entire History

function GraphComponent() {
  const [range, setRange] = useState<DateRange>(DateRange['1W']);
  const portfolioHistory = usePortfolioHistory(range);

  if (!portfolioHistory) {
    // If portfolioHistory === undefined, content is loading
    return <LoadingComponent />;
  }

  return <Chart data={portolioHistory} x="time" y="total" />;
}
```

## Token Context Hooks

The Token context covers token balances, details, and prices.

#### useTokens

This hook returns a mapping from address to a token object for each supported token. Within the NodeProvider, a whitelist for tokens can be supplied as well as a blacklist. Additionally, custom tokens can be declared.

The Token object contains fields for address, decimals, name, symbol, and url of image.

Addresses in the mapping are all lowercase, to avoid capit

```ts
import { useTokens } from '@node-fi/react-native-sdk';

function Component() {
  const tokens = useTokens();
  const tokenAddress = '0xAddress';

  const tokenObject = tokens[tokenAddress.toLowerCase()];

  // ...rest
}
```

#### useAddToken

This hook allows for a user to dynamically add new tokens to be recognized by their wallet. In most cases, it is unlikely that an added token will have a correlated price.

The hook returns a callback that takes in a Token object, and adds it to the internal token mapping. This token object only needs to be populated with the address and the ChainId, and the rest of the details will be loaded.

```tsx
import { useAddToken, useChainId } from "@node-fi/react-native-sdk"
import { Token } from "@node-fi/sdk-core"

function AddTokenComponent() {
  const [address, setAddress] = React.useState<string>()
  const addToken = useAddToken()
  const chainId = useChainId()

  const addNewToken = React.useCallback(async () => {
    const newToken = new Token(chainId, address)
    await addToken(newToken)
  }, [address])

  return (
    <>
      <TextInput onChange={setAddress}>
      <Button text="Add Token!" onPress={addNewToken} >
    </>
  )
}
```

#### useRemoveToken

This hook allows the user to dynamically remove tokens from being recognized by their wallet.

It takes as input the address of the token to remove.

```ts
import { useRemoveToken } from '@node-fi/react-native-sdk';

function Component() {
  const removeToken = useRemoveToken();
  const tokenToRemove = '0xAddress';

  const handleRemove = React.useCallback(
    () => removeToken(tokenToRemove),
    [removeToken]
  );

  // ...rest
}
```

#### useHistoricalTransfers

This hook allows a component to subscribe to past and future token transfers. Transfers are given in the following shape:

```ts
type TransferTransaction = {
  amount: BigNumber;
  blockNumber: number; // block during which the transfer occured
  token: Address; // address of token that was transfered
  from: Address; // address of sender
  to: Address; // address of receiver
  outgoing?: boolean | undefined; // true if the transfer was outgoing from the tracked wallet
};
```

Inputs for the hook are as follows:
| Param | Type | Required? | Purpose | Default Value |
|--------------|-------------------------------------|-----------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| maxTransfers | number \| "all" | N | Specifies the maximum number of transfers to retrieve | "all" |
| startBlock | number | N | Specifies the block to begin tracking transfers from. If not provided, begins at token genesis | undefined |
| subscribe | boolean | N | If true, then the returned value will be updated to included new transfers in real time | false |
| filter | (t: TransferTransaction) => boolean | N | Provides a way to filter transactions on the fly. | Filters out transfers where the amount does not exceed 1/1000 of a token |

#### useBalances

This hook returns a mapping from addresses to the wallet's current balance, as a `TokenAmount` object. Addresses are all lowercase within the mapping, so to access the balance of a given token you will need to use a lowercase address.

If a supported token is not contained in the mapping, then the wallet's balance is 0 for that token.

```ts
import { useBalances } from '@node-fi/react-native-sk';

type TokenBalances = {
  [lowerCaseAddress: string]: TokenAmount;
};

function Component() {
  const balances = useBalances();

  const cusdBalance = balances[addressOf('CUSD')];

  // ...rest
}
```

#### useBalance

This hook returns the balance for a single token, as a TokenAmount object. TokenAmount object contain both the underlying token, the raw amount (not accounting for decimals), and the amoun accounting for decimals.

This hook accepts either a token object, or the address of a token.

```ts
import { useBalance } from '@node-fi/react-native-sdk';

function Component() {
  const CUSD = '0xAddress';
  const CELO = new Token(ChainId.Celo, CELO_ADDRESS, 18);

  const cusdBalance = useBalance(CUSD);
  const celoBalance = useBalance(CELO);

  // ...rest
}
```

#### usePricedBalances

This hook will return a mapping of token addresses to the dollar value of the wallet's current balance.
If a token does not have a subsequent balance in the mapping, then the user either has 0 balance or there is no price recorded for that token

```ts
import { usePricedBalances } from '@node-fi/react-native-wrapper';

function Component() {
  const pricedBalances = usePricedBalances();
  const MY_TOKEN = '0xAddress';

  const dollarValueOfMyHoldings = pricedBalances[MY_TOKEN.toLowerCase()];
}
```

#### useTokenPrices

This hook returns a mapping from token addresses to their respective price in the default currency.

A price object is of the shape:

```ts
type PriceObject = {
  current: number;
  yesterday: number;
};
```

Example use:

```tsx
import { useTokenPrices } from "@node-fi/react-native-sdk"

function Component() {
  const prices = useTokenPrices();
  const MAIN_TOKEN = "0xAddress"

  return (
    <Text>{`Price of main token: ${prices[MAIN_TOKEN.toLowerCase()].current}`}</Text>
    {Object.entries(prices).map(([address, {current}]) =>
      <Text key={`price-${address}`}> {`Current price of token ${address}: ${current}`} </Text>)}
  )
}
```

#### useTokenPrice

This hook returns the price object for a specific token. It takes as argument the address of the token.

```ts
import { useTokenPrice } from '@node-fi/react-native-sdk';

function Component() {
  const MY_TOKEN = '0xAddress';

  const { current: currentPrice, yesterday: yesterdayPrice } =
    prices[MY_TOKEN.toLowerCase()];

  // ...rest
}
```

#### useHistoricalTokenPrices

This hook returns the historical prices for any supported token.

While data is loading, the return value will be undefined. Otherwise, it will be of the shape:

```ts
type UseHistoricalPricesShape = {
  time: number; // unix time
  priceusd: number; // price in usd -- future versions of the sdk will simply use a 'price' field that adjusts based off of preferred currency
};
```

The inputs for the hook are as follows:

| Param   | Type                                | Required? | Purpose                                                              | Default Value    |
| ------- | ----------------------------------- | --------- | -------------------------------------------------------------------- | ---------------- |
| address | string                              | Yes       | Specifies the address of the token to retrieve historical prices for | N / A - REQUIRED |
| range   | DateRange (1h, 1d, 1w, 1m, 1y, all) | Y         | Specifies the time range to fetch token prices for                   | N / A - REQUIRED |

Example Use Case:

```tsx
import { useHistoricalTokenPrices } from "@node-fi/react-native-sdk"
import { DateRange } from "@node-fi/sdk-core"

function Component() {
  const MY_TOKEN = "0xAddress"
  const DATE_RANGE = DateRange['1W']

  const historicalPrices = useHistoricalTokenPrices(MY_TOKEN, DATE_RANGE)

  if (historicalPrices === undefined) return <LoadingComponent />

  return <ChartComponent data={historicalPrices} x="time" y="priceusd">
}
```
