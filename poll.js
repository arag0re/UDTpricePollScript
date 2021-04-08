// created by Anton Stadie on 09/04/2021
let Web3 = require("./node_modules/web3");
let abi = require("./abis/abi.js");
let currentNode =
  "wss://mainnet.infura.io/ws/v3/fa39b33c7d9f40f2aad8760e1ca0a26f";
let pairAddress = "0x9ca8aef2372c705d6848fdda3c1267a7f51267c1";
let poll = {
  setup() {
    this.web3 = new Web3(currentNode);
    this.instance = new this.web3.eth.Contract(abi, pairAddress);
  },
  async getCurrentBlock() {
    return (await this.web3.eth.getBlock("latest")).number;
  },
};
poll.setup();
console.log(poll.getCurrentBlock());
