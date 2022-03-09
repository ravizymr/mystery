const assert = require("assert");
const ganache = require("ganache-cli");
const ethers = require("ethers").ethers;
const BigNumber = require("ethers").BigNumber;


const provider = new ethers.providers.Web3Provider(ganache.provider());

const compiledFactory = require("../build/MysteryFactory.json");
const compiledMystery = require("../build/Mystery.json");

const minimumContribution = ethers.utils.parseEther('1')
const getBalanceInEther = async (account) => {
  const balance = provider.getBalance(account);
  return Number(ethers.utils.formatEther(balance));
}

let accounts;
beforeEach(async () => {
  accounts = [provider.getSigner(0), provider.getSigner(1), provider.getSigner(2), provider.getSigner(3)];
})

describe('Deploy Factory and Mystrey', () => {
  it('deploy factory', async () => {
    const contract = new ethers.ContractFactory(compiledFactory.abi, compiledFactory.bytecode, accounts[0]);
    const factory = await contract.deploy();
    await factory.deployTransaction.wait();
    assert.ok(factory.address)
  })

  it('deploy mystery', async () => {
    const contract = new ethers.ContractFactory(compiledFactory.abi, compiledFactory.bytecode, accounts[0]);
    const factory = await contract.deploy();
    factory.deployTransaction.wait();

    const tx = await factory.createMystery("test", "test", 50, minimumContribution, {
      value: minimumContribution
    })
    await tx.wait()

    const data = await factory.getDeployedMystery(0, 0);
    assert.equal(data.mystery.length, 1)
    assert.equal(data.total, 1)

  })

  it('get address of deployed mystery', async () => {
    const contract = new ethers.ContractFactory(compiledFactory.abi, compiledFactory.bytecode, accounts[0]);
    const factory = await contract.deploy();
    factory.deployTransaction.wait();

    let eventData = {};


    // factory.on('MysteryCreated', async (address, manager, desc) => {
    //   eventData = {
    //     address,
    //     manager,
    //     desc
    //   }
    //   console.log(eventData, await accounts[0].getAddress());
    // });

    const tx = await factory.createMystery("test", "test", 50, minimumContribution, {
      value: minimumContribution
    })
    await tx.wait()

    const data = await factory.getDeployedMystery(0, 0);
    const mystery = new ethers.Contract(
      data.mystery[0].mystery,
      compiledMystery.abi,
      accounts[0]
    );
    assert.equal(mystery.address, data.mystery[0].mystery);
    assert.equal(await mystery.manager(), await accounts[0].getAddress());
    assert.equal(await mystery.description(), "test");
  })
})


// describe("Mystery Factory Operation", () => {
//   let factory;
//   let mystery;

//   beforeEach(async () => {
//     factory = await new web3.eth.Contract(compiledFactory.abi)
//       .deploy({ data: compiledFactory.bytecode, arguments: [] })
//       .send({ from: accounts[0], gas: '5000000' });

//     await factory.methods.createMystery("test", "test", 50, minimumContribution)
//       .send({
//         from: accounts[0],
//         value: minimumContribution,
//         gas: "2000000"
//       });

//     const data = await factory.methods.getDeployedMystery(0, 0).call();
//     mystery = await new web3.eth.Contract(
//       compiledMystery.abi,
//       data.mystery[0].mystery
//     );
//   });

//   it("deploys a factory and a mystery", async () => {
//     assert.ok(factory.options.address);
//     assert.ok(mystery.options.address);
//     const data = await mystery.methods.getSummary().call();
//     assert.equal(data['totalBalance'], minimumContribution);
//   });

//   it('get Mystery deployed by me', async () => {
//     await factory.methods.createMystery("test", "test", 50, minimumContribution)
//       .send({
//         from: accounts[0],
//         value: minimumContribution,
//         gas: "2000000"
//       });
//     await factory.methods.createMystery("test", "test", 50, minimumContribution)
//       .send({
//         from: accounts[0],
//         value: minimumContribution,
//         gas: "2000000"
//       });
//     const data = await factory.methods.getMyMystery(0, 0).call();
//     assert.equal(data.mystery.length, 3)
//   })

//   it("manager try to solve mystery", async () => {
//     try {
//       await mystery.methods.tryMystery("check")
//         .send({
//           from: accounts[0],
//           value: minimumContribution,
//           gas: '1000000'
//         });
//       assert(false);
//     } catch (err) {
//       assert(err);
//     }
//   });

//   it("user try to solve mystery with incorrect guess", async () => {
//     try {
//       await mystery.methods.tryMystery("check")
//         .send({
//           from: accounts[2],
//           value: minimumContribution,
//           gas: '1000000'
//         });
//       assert(false)
//     } catch (e) {
//       const data = await mystery.methods.getSummary().call();
//       assert.equal(data['triedCount'], 1)
//     }
//   });

//   it("user try to solve mystery with guess, pass at 2nd try", async () => {
//     let eventData;
//     try {
//       factory.events.MysterySolved({}, (error, event) => {
//         if (event) {
//           eventData = event.returnValues;
//         }
//       });
//       await mystery.methods.tryMystery("check")
//         .send({
//           from: accounts[2],
//           value: minimumContribution,
//           gas: '1000000'
//         });
//       assert(false)
//     } catch (e) {
//       const data = await mystery.methods.getSummary().call();
//       assert.equal(data['triedCount'], 1)
//     }
//     await mystery.methods.tryMystery("test")
//       .send({
//         from: accounts[2],
//         value: minimumContribution,
//         gas: '1000000'
//       });
//     const data = await mystery.methods.getSummary().call();
//     assert.equal(data['triedCount'], 2)
//     assert.equal(data['winner'], accounts[2])
//     const solved = await mystery.methods.getAnswer().call();
//     assert.equal(solved, "test")
//     assert.equal(eventData.winner, accounts[2])
//     assert.equal(eventData.mystery, mystery.options.address);
//     assert(eventData.winAmount)
//     assert.equal(eventData.triedCount, 2)
//   });

//   it('getAnswer method call before solve', async () => {
//     try {
//       await mystery.methods.getAnswer().call();
//       assert(false)
//     } catch (e) {
//       assert(e)
//     }
//   });

//   it('distribute balance after solve mistery and 0 balance', async () => {
//     let x = 0;
//     while (x < 20) {
//       x++;
//       await mystery.methods.tryMystery("check")
//         .send({
//           from: accounts[2],
//           value: minimumContribution,
//           gas: '1000000'
//         });
//     }
//     await mystery.methods.tryMystery("test")
//       .send({
//         from: accounts[4],
//         value: minimumContribution,
//         gas: '1000000'
//       });
//     const data = await mystery.methods.getSummary().call();
//     assert.equal(data['triedCount'], 21);
//     assert.equal(await getBalanceInEther(mystery.options.address), 0)
//   })
// });
