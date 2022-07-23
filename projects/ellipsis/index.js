const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require("@defillama/sdk");
const factoryAbi = require("./factory-abi.json");
const { default: BigNumber } = require("bignumber.js");
const factoryAddress = "0xf65bed27e96a367c61e0e06c54e14b16b84a5870";
const NULL_ADDRES = [
  "0x0000000000000000000000000000000000000000",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
];

const filterAbiByName = (list, name) => list.filter((e) => e.name === name)[0];

async function tvlbsc(time, block) {
  const chain = "bsc";
  const poolAddresses = await listPoolAddresses(chain, block, factoryAddress);

  const poolCoinsArray = (
    await sdk.api.abi.multiCall({
      calls: poolAddresses.map((address) => ({
        target: factoryAddress,
        params: address,
      })),
      abi: filterAbiByName(factoryAbi, "get_coins"),
      block,
      chain,
    })
  ).output.map(({ output }) =>
    output.filter((address) => !NULL_ADDRES.includes(address))
  );
  const poolBalancesArray = (
    await sdk.api.abi.multiCall({
      calls: poolAddresses.map((address) => ({
        target: factoryAddress,
        params: address,
      })),
      abi: filterAbiByName(factoryAbi, "get_balances"),
      block,
      chain,
    })
  ).output.map(({ output }) => output);
  const coinsBalance = {};
  poolCoinsArray.forEach((coins, index) => {
    coins.forEach((coin, coinIndex) => {
      const balance = poolBalancesArray[index][coinIndex];
      if (balance !== "0") {
        coinsBalance["bsc:" + coin] = balance;
      }
    });
  });
  return coinsBalance;
}

const listPoolAddresses = async (chain, block, factoryAddress) => {
  const numOfPools = (
    await sdk.api.abi.call({
      target: factoryAddress,
      abi: filterAbiByName(factoryAbi, "pool_count"),
      block,
      chain,
    })
  ).output;
  const poolAddressesCalls = [];
  for (let i = 0; i < numOfPools; i++) {
    poolAddressesCalls.push({ target: factoryAddress, params: i });
  }
  return (
    await sdk.api.abi.multiCall({
      calls: poolAddressesCalls,
      abi: filterAbiByName(factoryAbi, "pool_list"),
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
