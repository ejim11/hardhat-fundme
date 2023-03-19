require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("hardhat-deploy");
require("dotenv").config();
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */

const TEST_SEPOLIA_URL =
    process.env.TEST_SEPOLIA_URL || "https:\\eth-sepolia/example";
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || "key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COIN_MARKET_CAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY || "key";

module.exports = {
    defaultNetwork: "hardhat",
    // solidity: "0.8.18",
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
    },
    
    networks: {
        sepolia: {
            url: TEST_SEPOLIA_URL,
            accounts: [TEST_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_CAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
