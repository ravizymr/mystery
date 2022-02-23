const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.ensureDirSync(buildPath);

const contractPath = path.resolve(__dirname, "contracts", "Mystery.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Mystery.sol": {
      content: source
    },
    "MysteryFactory.sol": {
      content: source
    }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.gasEstimates"]
      }
    }
  }
}

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts;
if (output.errors) {
  output.errors.forEach(err => {
    console.log(err.formattedMessage);
  });
} else {
  for (item in output) {
    const name = item.replace('.sol', '');
    const bytecode = output[item][name].evm.bytecode.object;
    fs.outputJsonSync(
      path.resolve(buildPath, name + ".json"), {
      bytecode,
      abi: output[item][name].abi,
      gasEstimates: output[item][name].evm.gasEstimates
    });
  }
}