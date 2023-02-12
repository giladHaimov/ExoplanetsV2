//truffle migrate --compile-none --reset

const MigratorContract = artifacts.require("./contracts/ExoplanetsMigrator.sol");
const MockOrigNFTContract = artifacts.require("./contracts/tests/MockOrigNFT.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MockOrigNFTContract);
  const mockNFT = await MockOrigNFTContract.deployed();
  
  const BASE_URI = "base-uri"; //zzzz
  await deployer.deploy( MigratorContract, mockNFT.address, BASE_URI);
};
