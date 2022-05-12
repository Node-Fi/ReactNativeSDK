/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("dotenv/config");

const { HARDHAT_PORT } = process.env;

module.exports = {
  solidity: "0.7.3",
  networks: {
    localhost: { url: `http://127.0.0.1:${HARDHAT_PORT}` },
    hardhat: {
      accounts: [{"privateKey":"0x1a2c345b41eb21e309ac0ca522c3d19069faad7cfc4036fc7fa98e1b2b209b6f","balance":"1000000000000000000000"},{"privateKey":"0xe4c4ea7d9218dbb996ff4c95eb01cae217c91e5231d0d7e5a1df7b7db8f37c86","balance":"1000000000000000000000"},{"privateKey":"0x2bc8d33f86f690564bfda33eec77ba1e4c326c5dd522dc03f8c79a0db7722fdb","balance":"1000000000000000000000"},{"privateKey":"0x9b6bf7bab4d8589d56aa18cdad8f73bd2b7d6a9db3e2d081f91530a92c0abb69","balance":"1000000000000000000000"},{"privateKey":"0x4db50cf6e94db71f0f33c6d4ac92f2d0b24aaf9726742fcc7aa1740ff7cd9822","balance":"1000000000000000000000"},{"privateKey":"0x997dd74a2bf179dfed02a435e7a2ffe1d8493256d24770779e6a7aceb0ec5e73","balance":"1000000000000000000000"},{"privateKey":"0x677edd09e5466192f8562bef154c277f3ba3af6d83fa076e9263c79dd70182c6","balance":"1000000000000000000000"},{"privateKey":"0x21fc42e73934ca79c6474130ce0d0a6acd8b8749ff9094550f7d2e6d3aa1c831","balance":"1000000000000000000000"},{"privateKey":"0xbd99e2930fb9eabf7f03d00f385aa6e9a927e039f24392a29bb4f2bbd83777a2","balance":"1000000000000000000000"},{"privateKey":"0x06a3abe11b2df030b89a4f252cafb93bbc729614183eb130b49efa33812c0c8b","balance":"1000000000000000000000"}]
    },
  },
  paths: {
    sources: './contracts',
    tests: './__tests__/contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
};