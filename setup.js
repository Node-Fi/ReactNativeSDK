/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// This file has been auto-generated by Ξ create-react-native-dapp Ξ.
// Feel free to modify it, but please take care to maintain the exact
// procedure listed between /* dapp-begin */ and /* dapp-end */, as
// this will help persist a known template for future migrations.

/* dapp-begin */
const { Platform, LogBox } = require('react-native');

if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
  LogBox.ignoreLogs([
    "Warning: The provided value 'ms-stream' is not a valid 'responseType'.",
    "Warning: The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.",
  ]);
}

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

global.btoa = global.btoa || require('base-64').encode;
global.atob = global.atob || require('base-64').decode;

process.version = 'v9.40';

/* dapp-end */
