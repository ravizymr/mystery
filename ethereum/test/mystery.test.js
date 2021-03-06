const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../build/MysteryFactory.json");
const compiledMystery = require("../build/Mystery.json")

const minimumContribution = web3.utils.toWei('1'.toString(), 'ether');
const getBalanceInEther = async (account) => {
  return Number(web3.utils.fromWei(await web3.eth.getBalance(account), 'ether'));
}

let accounts;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
})

describe('Deploy Factory and Mystrey', () => {
  it('deploy factory', async () => {
    const factory = await new web3.eth.Contract(compiledFactory.abi)
      .deploy({ data: compiledFactory.bytecode, arguments: [] })
      .send({ from: accounts[0], gas: '5000000' });
    assert.ok(factory.options.address)
  })

  it('deploy mystery', async () => {
    const factory = await new web3.eth.Contract(compiledFactory.abi)
      .deploy({ data: compiledFactory.bytecode, arguments: [] })
      .send({ from: accounts[0], gas: '5000000' });

    await factory.methods.createMystery("test", "test", 50, minimumContribution)
      .send({
        from: accounts[0],
        value: minimumContribution,
        gas: "2000000"
      });

    const data = await factory.methods.getDeployedMystery(0, 0).call();
    assert.equal(data.mystery.length, 1)
    assert.equal(data.total, 1)
  })

  it('get address of deployed mystery', async () => {
    const factory = await new web3.eth.Contract(compiledFactory.abi)
      .deploy({ data: compiledFactory.bytecode, arguments: [] })
      .send({ from: accounts[0], gas: '5000000' });

    let eventData;

    factory.events.MysteryCreated({}, (error, event) => {
      if (event) {
        eventData = event.returnValues;
      }
    });

    await factory.methods.createMystery("test", "test", 50, minimumContribution)
      .send({
        from: accounts[0],
        value: minimumContribution,
        gas: "2000000"
      });
    const data = await factory.methods.getDeployedMystery(0, 0).call();
    const mystery = await new web3.eth.Contract(
      compiledMystery.abi,
      data.mystery[0].mystery
    );
    assert.equal(mystery.options.address, data.mystery[0].mystery);
    assert.equal(eventData.manager, accounts[0]);
    assert.equal(eventData.mystery, mystery.options.address);
    assert.equal(eventData.desc, "test");
  })
})


describe("Mystery Factory Operation", () => {
  let factory;
  let mystery;

  beforeEach(async () => {
    factory = await new web3.eth.Contract(compiledFactory.abi)
      .deploy({ data: compiledFactory.bytecode, arguments: [] })
      .send({ from: accounts[0], gas: '5000000' });

    await factory.methods.createMystery("test", "test", 50, minimumContribution)
      .send({
        from: accounts[0],
        value: minimumContribution,
        gas: "2000000"
      });

    const data = await factory.methods.getDeployedMystery(0, 0).call();
    mystery = await new web3.eth.Contract(
      compiledMystery.abi,
      data.mystery[0].mystery
    );
  });

  it("deploys a factory and a mystery", async () => {
    assert.ok(factory.options.address);
    assert.ok(mystery.options.address);
    const data = await mystery.methods.getSummary().call();
    assert.equal(data['totalBalance'], minimumContribution);
  });

  it('get Mystery deployed by me', async () => {
    await factory.methods.createMystery("test", "test", 50, minimumContribution)
      .send({
        from: accounts[0],
        value: minimumContribution,
        gas: "2000000"
      });
    await factory.methods.createMystery("test", "test", 50, minimumContribution)
      .send({
        from: accounts[0],
        value: minimumContribution,
        gas: "2000000"
      });
    const data = await factory.methods.getMyMystery(0, 0).call();
    assert.equal(data.mystery.length, 3)
  })

  it("manager try to solve mystery", async () => {
    try {
      await mystery.methods.tryMystery("check")
        .send({
          from: accounts[0],
          value: minimumContribution,
          gas: '1000000'
        });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("user try to solve mystery with incorrect guess", async () => {
    try {
      await mystery.methods.tryMystery("check")
        .send({
          from: accounts[2],
          value: minimumContribution,
          gas: '1000000'
        });
      assert(false)
    } catch (e) {
      const data = await mystery.methods.getSummary().call();
      assert.equal(data['triedCount'], 1)
    }
  });

  it("user try to solve mystery with guess, pass at 2nd try", async () => {
    let eventData;
    try {
      factory.events.MysterySolved({}, (error, event) => {
        if (event) {
          eventData = event.returnValues;
        }
      });
      await mystery.methods.tryMystery("check")
        .send({
          from: accounts[2],
          value: minimumContribution,
          gas: '1000000'
        });
      assert(false)
    } catch (e) {
      const data = await mystery.methods.getSummary().call();
      assert.equal(data['triedCount'], 1)
    }
    await mystery.methods.tryMystery("test")
      .send({
        from: accounts[2],
        value: minimumContribution,
        gas: '1000000'
      });
    const data = await mystery.methods.getSummary().call();
    assert.equal(data['triedCount'], 2)
    assert.equal(data['winner'], accounts[2])
    const solved = await mystery.methods.getAnswer().call();
    assert.equal(solved, "test")
    assert.equal(eventData.winner, accounts[2])
    assert.equal(eventData.mystery, mystery.options.address);
    assert(eventData.winAmount)
    assert.equal(eventData.triedCount, 2)
  });

  it('getAnswer method call before solve', async () => {
    try {
      await mystery.methods.getAnswer().call();
      assert(false)
    } catch (e) {
      assert(e)
    }
  });

  it('distribute balance after solve mistery and 0 balance', async () => {
    let x = 0;
    while (x < 20) {
      x++;
      await mystery.methods.tryMystery("check")
        .send({
          from: accounts[2],
          value: minimumContribution,
          gas: '1000000'
        });
    }
    await mystery.methods.tryMystery("test")
      .send({
        from: accounts[4],
        value: minimumContribution,
        gas: '1000000'
      });
    const data = await mystery.methods.getSummary().call();
    assert.equal(data['triedCount'], 21);
    assert.equal(await getBalanceInEther(mystery.options.address), 0)
  })
});
