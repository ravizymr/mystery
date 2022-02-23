// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

struct mysteryData {
    uint256 min;
    uint256 totalBalance;
    string desc;
    uint256 winAmount;
    uint256 triedCount;
    address manager;
    address winner;
}

contract Mystery {
    string public description;
    string private answer;
    uint256 public winAmount; // amount send to winner
    address public winner; // winner of mystery
    address public manager; // creator of mystery
    uint256 public triedCount; // user try till now
    uint256 private winnerPercentage; // winner profit
    uint256 private managerPercentage; // creater profit
    address private owner;
    uint256 public minimumContribution; // min amount to give answer
    bool public solved;
    uint256 public totalAmount;
    address private factoryAddress;

    constructor(
        string memory mysteryQuestion_,
        string memory answer_,
        uint256 winnerProfit_,
        address manager_,
        uint256 minimumContribution_,
        address owner_,
        address factoryAddress_
    ) payable {
        require(winnerProfit_ >= 50, "Winner should get atleast 50% !");
        uint256 managerProfit_ = 100 - winnerProfit_;
        require(
            winnerProfit_ + managerProfit_ == 100,
            "Distribution should be 100% !"
        );
        owner = owner_;
        manager = manager_;
        minimumContribution = minimumContribution_;
        answer = answer_;
        description = mysteryQuestion_;
        winnerPercentage = (winnerProfit_ * 95) / 100;
        managerPercentage = (managerProfit_ * 95) / 100;
        totalAmount = minimumContribution;
        winAmount = (minimumContribution * winnerPercentage) / 100;
        factoryAddress = factoryAddress_;
    }

    function getBal() public view returns (uint256) {
        return address(this).balance;
    }

    event MysteryWonBy(address, uint256, uint256, uint256);

    receive() external payable {}

    function tryMystery(string calldata guessedAnswer) public payable {
        require(
            msg.value >= minimumContribution,
            "Minimum balance is required to solve Mystery."
        );
        require(
            msg.sender != manager,
            "Creator is not allowed to solve Mystery."
        );
        require(!solved, "Mystery is Already Solved.");
        triedCount++;
        winAmount = (address(this).balance * winnerPercentage) / 100;
        totalAmount = address(this).balance;
        if (
            keccak256(abi.encodePacked(answer)) ==
            keccak256(abi.encodePacked(guessedAnswer))
        ) {
            uint256 a_man = (address(this).balance * managerPercentage) / 100;
            uint256 a_own = ((address(this).balance *
                (100 - winnerPercentage - managerPercentage)) / 100);
            payable(msg.sender).transfer(winAmount);
            payable(manager).transfer(a_man);
            payable(owner).transfer(a_own);
            winner = msg.sender;
            solved = true;
            emit MysteryWonBy(winner, winAmount, a_man, totalAmount);
            MysteryFactory x = MysteryFactory(factoryAddress);
            x.mysterySolved(payable(this));
        }
    }

    function getAnswer() public view returns (string memory) {
        require(solved);
        return answer;
    }

    function getSummary() public view returns (mysteryData memory) {
        return
            mysteryData(
                minimumContribution,
                totalAmount,
                description,
                winAmount,
                triedCount,
                manager,
                winner
            );
    }
}

contract MysteryFactory {
    address private owner;
    mapping(address => address[]) _mysteryByUser;
    address[] private deployedMystery;
    mapping(address => bool) public _isMysterySolved;

    constructor() {
        owner = msg.sender;
    }

    event MysteryCreated(address, string);

    function createMystery(
        string calldata mysteryQuestion,
        string calldata mysteryAnswer,
        uint256 winnerProfit,
        uint256 minimumAmountToAnswer
    ) public payable {
        require(
            msg.value >= minimumAmountToAnswer,
            "Minimum balance is required to create a Mystery!"
        );
        Mystery newMystery = new Mystery(
            mysteryQuestion,
            mysteryAnswer,
            winnerProfit,
            msg.sender,
            minimumAmountToAnswer,
            owner,
            address(this)
        );
        payable(newMystery).transfer(address(this).balance);
        deployedMystery.push(address(newMystery));
        emit MysteryCreated(address(newMystery), mysteryQuestion);
        _mysteryByUser[msg.sender].push(address(newMystery));
        _isMysterySolved[address(newMystery)] = false;
    }

    function geyMysteryDetail(address payable mystery)
        public
        view
        returns (mysteryData memory)
    {
        Mystery x = Mystery(mystery);
        return x.getSummary();
    }

    function mysterySolved(address payable _mystery) external {
        Mystery x = Mystery(_mystery);
        _isMysterySolved[address(_mystery)] = x.solved();
    }

    function getDeployedMystery(uint256 offset, uint256 limit)
        public
        view
        returns (
            address[] memory mystery,
            uint256 nextOffset,
            uint256 total
        )
    {
        uint256 totalMystery = deployedMystery.length;
        if (limit == 0) {
            limit = 10;
        }

        if (limit > totalMystery - offset) {
            limit = totalMystery - offset;
        }

        address[] memory mystery_ = new address[](limit);
        for (uint256 i = 0; i < limit; i++) {
            mystery_[i] = deployedMystery[offset + i];
        }
        return (mystery_, offset + limit, totalMystery);
    }

    function getMyMystery(uint256 offset, uint256 limit)
        public
        view
        returns (
            address[] memory mystery,
            uint256 nextOffset,
            uint256 total
        )
    {
        uint256 totalMystery = _mysteryByUser[msg.sender].length;
        if (limit == 0) {
            limit = 10;
        }

        if (limit > totalMystery - offset) {
            limit = totalMystery - offset;
        }

        address[] memory mystery_ = new address[](limit);
        for (uint256 i = 0; i < limit; i++) {
            mystery_[i] = _mysteryByUser[msg.sender][offset + i];
        }
        return (mystery_, offset + limit, totalMystery);
    }
}
