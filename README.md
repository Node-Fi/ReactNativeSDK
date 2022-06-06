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
