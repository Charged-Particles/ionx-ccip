require('dotenv').config()
import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-abi-exporter';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers'

const mnemonic = {
  testnet: `${process.env.TESTNET_MNEMONIC}`.replace(/_/g, ' '),
  mainnet: `${process.env.MAINNET_MNEMONIC}`.replace(/_/g, ' '),
};
const optimizerDisabled = process.env.OPTIMIZER_DISABLED

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: !optimizerDisabled,
            runs: 200
          }
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    protocolOwner: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
    user3: {
      default: 4,
    },
  },
  paths: {
      sources: './contracts',
      tests: './test',
      cache: './cache',
      artifacts: './build/contracts',
      deploy: './deploy',
      deployments: './deployments'
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_ETH_APIKEY,
        blockNumber: 20000000
      },
      accounts: {
        mnemonic: mnemonic.testnet,
        initialIndex: 0,
        count: 10,
      },
    },
    sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_ETH_APIKEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.testnet,
            initialIndex: 0,
            count: 10,
        },
        chainId: 11155111
    },
    mainnet: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ETH_APIKEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.mainnet,
            initialIndex: 0,
            count: 10,
        }
    },
    modeSepolia: {
      url: "https://sepolia.mode.network",
      gasPrice: 'auto',
      accounts: {
          mnemonic: mnemonic.testnet,
          initialIndex: 0,
          count: 10,
      },
      chainId: 919,
    },
    mode: {
      url: "https://mainnet.mode.network",
      gasPrice: 'auto',
      accounts: {
          mnemonic: mnemonic.mainnet,
          initialIndex: 0,
          count: 10,
      },
      chainId: 34443,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_APIKEY ?? '',
      sepolia: process.env.ETHERSCAN_APIKEY ?? '',
      modeSepolia: 'MODE-NETWORK-TESTNET',
    },
    customChains: [
      {
        network: 'modeSepolia',
        chainId: 919,
        urls: {
          apiURL: 'https://sepolia.explorer.mode.network/api',
          browserURL: 'https://sepolia.explorer.mode.network'
        }
      },
      {
        network: 'mode',
        chainId: 34443,
        urls: {
          apiURL: 'https://explorer.mode.network/api',
          browserURL: 'https://explorer.mode.network'
        }
      },
    ]
  },
  gasReporter: {
      currency: 'USD',
      gasPrice: 32,
      enabled: (process.env.REPORT_GAS) ? true : false
  },
  abiExporter: {
    path: './abis',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [
      'IonxCCIP',
      'Ionx',
      'Bridge',
      'Configuration',
      'BurnMintTokenPool',
      'LockReleaseTokenPool',
    ],
  },
};

export default config;
