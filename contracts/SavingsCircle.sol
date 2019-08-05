pragma solidity ^0.5.8;

import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

import "./Initializable.sol";
import "./IERC20Token.sol";

contract SavingsCircle is ReentrancyGuard, Ownable, Initializable {
  using SafeMath for uint256;

  struct Circle {
    address owner;
    string name;
    address[] members;
    uint256 currentIndex;
    uint256 depositAmount;
    address tokenAddress;
    uint256 timestamp;
    mapping(address => uint256) balances;
  }
  mapping (bytes32 => Circle) circles;
  mapping (address => bytes32[]) circleMemberships;

  function initialize(
  ) external initializer {
    _transferOwnership(msg.sender);
  }

  function circleMembers(bytes32 hashedName) public view returns (address[] memory) {
    return circles[hashedName].members;
  }

  function circlesFor(address user) public view returns (bytes32[] memory) {
    return circleMemberships[user];
  }

  function circleInfo(bytes32 hashedName) public view returns (string memory, address[] memory, address, uint256, uint256) {
    Circle storage circle = circles[hashedName];
    return (circle.name, circle.members, circle.tokenAddress, circle.depositAmount, circle.timestamp);
  }

  function addCircle(string calldata name, address[] calldata members, address tokenAddress, uint256 depositAmount) external {
    bytes32 hashedName = keccak256(abi.encodePacked(name));

    require(circleMembers(hashedName).length == 0, "Already added circle");

    Circle storage circle = circles[hashedName];

    circle.owner = msg.sender;
    circle.members = members;
    circle.tokenAddress = tokenAddress;
    circle.depositAmount = depositAmount;
    circle.name = name;
    // solhint-disable-next-line not-rely-on-time
    circle.timestamp = now;

    for (uint256 index = 0; index < members.length; index++) {
      circleMemberships[members[index]].push(hashedName);
    }
  }

  function balancesForCircle(bytes32 hashedName) public view returns (address[] memory, uint256[] memory) {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    uint256[] memory balances = new uint256[](circle.members.length);

    for (uint256 index = 0; index < circle.members.length; index++) {
      balances[index] = circle.balances[circle.members[index]];
    }

    return (circle.members, balances);
  }


  function contribute(bytes32 hashedName, uint256 value) external{
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    require(
      IERC20Token(circle.tokenAddress).transferFrom(
        msg.sender,
        address(this),
        value
      ),
      "Transfer of contribution failed"
    );

    circle.balances[msg.sender] = circle.balances[msg.sender].add(value);
  }

  function withdrawable(bytes32 hashedName) public view returns (bool) {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    for (uint256 index = 0; index < circle.members.length; index++) {
      if (circle.balances[circle.members[index]] < circle.depositAmount && circle.currentIndex != index) {
        return false;
      }
    }

    return true;
  }

  function withdraw(bytes32 hashedName) external {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    require(withdrawable(hashedName), "Circle is not withdrawable");

    require(circle.members[circle.currentIndex] == msg.sender, "It's not our turn");

    require(
      IERC20Token(circle.tokenAddress).transfer(
        msg.sender,
        circle.depositAmount.mul(circle.members.length.sub(1))
      ),
      "Transfer of withdrawal failed"
    );

    for (uint256 index = 0; index < circle.members.length; index++) {
      if (circle.currentIndex != index) {
        circle.balances[circle.members[index]] = circle.balances[circle.members[index]].sub(circle.depositAmount);
      }
    }

    circle.currentIndex = circle.currentIndex.add(1).mod(circle.members.length);
    // solhint-disable-next-line not-rely-on-time
    circle.timestamp = now;
  }
}
