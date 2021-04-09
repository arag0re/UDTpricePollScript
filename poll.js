// created by Anton Stadie on 09/04/2021
//let Web3 = require("web3");
//let abi = require("./abis/abi.js");
let { request, gql } = require("graphql-request");
let Web3 = require("web3");
let abi = require("./abis/abi.json");
let currentNode = "wss://mainnet.infura.io/ws/v3/fa39b33c7d9f40f2aad8760e1ca0a26f";
let pairAddress = "0x9ca8aef2372c705d6848fdda3c1267a7f51267c1";
let block
let poll = {
  setup() {
    this.web3 = new Web3(currentNode);
    this.instance = new this.web3.eth.Contract(abi, pairAddress);
  },
  async getCurrentBlock() {
    return (await this.web3.eth.getBlock("latest")).number - 5;
  },
  async interval(){
    setInterval(async function(){ poll.test(); }, 10000);
  },

  async test(){
    block = await poll.getCurrentBlock();
    let priceInETH = await poll.getPrice();
    let ethPrice = await poll.getETHPrice();
    let priceInUSD = priceInETH * ethPrice
    let prices = {
      "priceInUSD": priceInUSD,
      "priceInETH": priceInETH
    }
    console.log(prices);
  },
  async getPrice() {
  const pairdata =
    gql`{
    pair(id: "0x9ca8aef2372c705d6848fdda3c1267a7f51267c1", block: { number: `+
    block+`}) {
          token0 {
            id
            symbol
            name
            derivedETH
          }
          token1 {
            id
            symbol
            name
            derivedETH
          }
          reserve0
          reserve1
          reserveUSD
          trackedReserveETH
          token0Price
          token1Price
          volumeUSD
          txCount
        }
      }
    `;
  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    pairdata
    );
  let reserve0 = parseFloat(response.pair.reserve0)
  let reserve1 = parseFloat(response.pair.reserve1)
  let priceInETH = reserve1/reserve0
  return priceInETH
  },
  async getETHPrice() {
  let query = `{
      bundle(id: "1") {
        ethPrice
      },
    }`;
  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    query
  );
  return parseFloat(response.bundle.ethPrice);
}
};

poll.setup();
poll.interval();
