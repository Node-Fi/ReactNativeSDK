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
createWallet(mnemonic).then((wallet) => {
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

## Accessing a Wallet

A user's wallet lives within the global NodeProvider context, and can be accessed from any child.
There are several ways to access a user's wallet
