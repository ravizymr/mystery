import web3 from './web3';
import MysteryFactory from './build/MysteryFactory.json';
import Mystery from "./build/Mystery.json";

const factory = new web3.eth.Contract(
  (MysteryFactory.abi as any),
  '0x573018D91A1884464C4509ec9969414091990c26' // with pagination and create,solved event
  // '0x8D6426Bb165e8EF516c58D4C1c6eB7023D9cFedc' - correct cont
  // '0x0013AE6e5Ad93e239283afF7FdB6658b072646D9' - without pagination
);

const mystery = (address) => {
  return new web3.eth.Contract((Mystery.abi as any), address);
};

export { factory, mystery };
