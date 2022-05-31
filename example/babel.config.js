const nodeConfig = require('@node-fi/react-native-sdk/nodeWalletBabel');
module.exports = function (api) {
  return { ...nodeConfig(api) };
};
