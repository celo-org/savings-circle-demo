const SavingsCircle = artifacts.require("SavingsCircle");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(SavingsCircle);
};