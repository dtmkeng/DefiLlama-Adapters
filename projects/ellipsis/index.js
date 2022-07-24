const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require("@defillama/sdk");
const factoryAbi = require("./factory-abi.json");
const { default: BigNumber } = require("bignumber.js");
const { fixBscBalances } = require('../helper/portedTokens')
const registryAddress = "0x266Bb386252347b03C7B6eB37F950f476D7c3E63";
const balanceAbi = {
  "stateMutability": "view",
  "type": "function",
  "name": "balances",
  "inputs": [
      {
          "name": "i",
          "type": "uint256"
      }
  ],
  "outputs": [
      {
          "name": "",
          "type": "uint256"
      }
  ],
  "gas": 7289
};

const NULL_ADDRES = [
  "0x0000000000000000000000000000000000000000",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x6c7AA02Bc9Da5e67099Ba56ff3C3E8efEA4bCf90",
  "0x1e987DF68CC13d271e621ec82E050A1BbD62c180",
  "0x2e3E3e3CAD5478F63549b7207c860A7f8FEDf4C9", // not price
  "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762", // not price
];

const mapAddres = {
  "0x1dDcaa4Ed761428ae348BEfC6718BCb12e63bFaa":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0xBb1Aa6e59E5163D8722a122cd66EBA614b59df0d":
    "0xBb1Aa6e59E5163D8722a122cd66EBA614b59df0d",
  "0x88fd584dF3f97c64843CD474bDC6F78e398394f4":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x71be881e9C5d4465B3FfF61e89c6f3651E69B5bb":
    "0x71be881e9C5d4465B3FfF61e89c6f3651E69B5bb",
  "0x6c7AA02Bc9Da5e67099Ba56ff3C3E8efEA4bCf90":
    "0x3F7E46d6A9ff6DdA5f575C3E36DE0d73D03A5549",
  "0x2d871631058827b703535228fb9Ab5F35cf19E76":
    "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  "0x1075bEa848451a13fD6F696b5D0FdA52743E6439":
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  "0x7465B49f83bfd74e8Df8574d43BFFF34EDbC1758":
    "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
  "0xe04fe47516C4Ebd56Bc6291b15D46A47535e736B":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0xF71b4b8AA71F7923c94C7e20B8a434a4d9368eee":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x03ab98f5dc94996F8C33E15cD4468794d12d41f9":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0xD295F4b58D159167DB247de06673169425B50EF2":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0xDA279B4a038B2C10792178d77911627a98eeB3f8":
    "0xDA279B4a038B2C10792178d77911627a98eeB3f8",
  "0x772F317ec695ce20290b56466b3f48501ba81352":
    "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
  "0xDE7d1CE109236b12809C45b23D22f30DbA0eF424":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x4f7F052d34F0Cf6412E6356BB46aC5dAf43be122":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x8B02998366F7437F6c4138F4b543EA5c000cD608":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  "0x6DEdCEeE04795061478031b1DfB3c1ddCA80B204":
    "0x6DEdCEeE04795061478031b1DfB3c1ddCA80B204",
  "0x316622977073BBC3dF32E7d2A9B3c77596a0a603":
    "0x316622977073BBC3dF32E7d2A9B3c77596a0a603",
  "0x2e3E3e3CAD5478F63549b7207c860A7f8FEDf4C9":
    "0x2e3E3e3CAD5478F63549b7207c860A7f8FEDf4C9",
  "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762":
    "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762",
};
const basePool = {
  '0x160CAed03795365F3A589f10C379FfA7d75d4E76': [
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0x55d398326f99059fF775485246999027B3197955'
  ],
  '0x2477fB288c5b4118315714ad3c7Fd7CC69b00bf9': ['0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c','0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c'],
  '0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d': [
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0x55d398326f99059fF775485246999027B3197955',
  ],
  '0xfA715E7C8fA704Cf425Dd7769f4a77b81420fbF2': ['0x204992f7fCBC4c0455d7Fec5f712BeDd98E7d6d6','0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c'],
};

const filterAbiByName = (list, name) => list.filter((e) => e.name === name)[0];

async function tvlbsc(time, block) {
  const chain = "bsc";
  const poolAddresses = await listPoolAddresses(chain, block, registryAddress);
  const poolCoins = (
    await sdk.api.abi.multiCall({
      calls: poolAddresses.map((address) => ({
        target: registryAddress,
        params: address,
      })),
      abi: filterAbiByName(factoryAbi, "get_coins"),
      block,
      chain,
    })
  ).output.map(({ output }) =>
    output.filter((address) => !NULL_ADDRES.includes(address))
  );
  const basePoolCoin = Object.keys(basePool).map(e => basePool[e])
  const poolCoinsArray = poolCoins.concat(basePoolCoin);
  const poolBalances = (
    await sdk.api.abi.multiCall({
      calls: poolAddresses.map((address) => ({
        target: registryAddress,
        params: address,
      })),
      abi: filterAbiByName(factoryAbi, "get_balances"),
      block,
      chain,
    })
  ).output.map(({ output }) => output);
  const basePoolBalance = []
  for(const basePoolAdress of Object.keys(basePool)) {
    const balances = await Promise.all(basePool[basePoolAdress].map(async (_, index) =>
        await sdk.api.abi.call({
          chain: 'bsc',
          block,
          target: basePoolAdress,
          abi: balanceAbi,
          params:[index]
        })
      )
    )
    basePoolBalance.push(balances.map(e => e.output))
  }


  const poolBalancesArray = poolBalances.concat(basePoolBalance)
  const coinsBalance = {};
  poolCoinsArray.forEach((coins, index) => {
    coins.forEach((coin, coinIndex) => {
      const balance = poolBalancesArray[index][coinIndex];
      if (balance !== "0") {
        coinsBalance["bsc:"+(mapAddres[coin] ? mapAddres[coin] : coin)] =
          balance;
      }
    });
  });
  return fixBscBalances(coinsBalance);
}

const listPoolAddresses = async (chain, block, registryAddress, isBasePool=false) => {
  const prefix = isBasePool ? "base_" : "";
  const numOfPools = (
    await sdk.api.abi.call({
      target: registryAddress,
      abi: filterAbiByName(factoryAbi, `${prefix}pool_count`),
      block,
      chain,
    })
  ).output;
  const poolAddressesCalls = [];
  for (let i = 0; i < numOfPools; i++) {
    poolAddressesCalls.push({ target: registryAddress, params: i });
  }
  return (
    await sdk.api.abi.multiCall({
      calls: poolAddressesCalls,
      abi: filterAbiByName(factoryAbi, `${prefix}pool_list`),
      block,
      chain,
    })
  ).output.map(({ output }) => output);
};
const lockedSupply = {
  inputs: [],
  name: "lockedSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};
const stakingContract = "0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c";
const eps = "0xa7f552078dcc247c2684336020c03648500c6d9f";
async function staking(time, ethBlock, chainBlocks) {
  const locked = await sdk.api.abi.call({
    target: stakingContract,
    block: chainBlocks.bsc,
    chain: "bsc",
    abi: lockedSupply,
  });
  return {
    ["bsc:" + eps]: locked.output,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([tvlbsc]),
    staking,
  },
};
