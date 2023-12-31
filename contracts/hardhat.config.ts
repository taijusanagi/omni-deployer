import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./plugins/hardhat-omnideployer";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 5,
      forking: {
        url: "https://rpc.ankr.com/eth_goerli",
      },
    },
    goerli: {
      chainId: 5,
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    mumbai: {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    bscTestnet: {
      chainId: 97,
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    optimismGoerli: {
      chainId: 420,
      url: "https://endpoints.omniatech.io/v1/op/goerli/public",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    baseGoerli: {
      chainId: 84531,
      url: "https://goerli.base.org",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    arbitrumGoerli: {
      chainId: 421613,
      url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
