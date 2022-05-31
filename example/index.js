/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// This file has been auto-generated by Ξ create-react-native-dapp Ξ.
// Feel free to modify it, but please take care to maintain the exact
// procedure listed between /* dapp-begin */ and /* dapp-end */, as
// this will help persist a known template for future migrations.

/* dapp-begin */
const { Platform, LogBox } = require('react-native');
require('@node-fi/react-native-sdk/setup');

const { registerRootComponent, scheme } = require('expo');
const { default: App } = require('./frontend/App');

const {
  default: AsyncStorage,
} = require('@react-native-async-storage/async-storage');
const { withWalletConnect } = require('@walletconnect/react-native-dapp');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(
  withWalletConnect(App, {
    redirectUrl:
      Platform.OS === 'web' ? window.location.origin : `${scheme}://`,
    storageOptions: {
      asyncStorage: AsyncStorage,
    },
  })
);
/* dapp-end */
