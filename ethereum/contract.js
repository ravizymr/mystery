import web3 from './web3';
import MysteryFactory from './build/MysteryFactory.json';
import Mystery from "./build/Mystery.json";

const factory = new web3.eth.Contract(
  MysteryFactory.abi,
  '0x8D6426Bb165e8EF516c58D4C1c6eB7023D9cFedc'
  // '0x0013AE6e5Ad93e239283afF7FdB6658b072646D9' - without pagination
);

const mystery = (address) => {
  return new web3.eth.Contract(Mystery.abi, address);
};

export { factory, mystery };
