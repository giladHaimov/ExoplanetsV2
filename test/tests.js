const Web3 = require('web3');
const BN = require('bn.js');
const { expectEvent, expectRevert }  = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

const ExoplanetsMigrator = artifacts.require("./contracts/ExoplanetsMigrator.sol");
const ExoplanetsV2NFT = artifacts.require("./contracts/ExoplanetsV2NFT.sol");
const MockOrigNFT = artifacts.require("./contracts/tests/MockOrigNFT.sol");

contract("ExoplanetsMigrator", (accounts_) => {

   let mockOrigNFTInstance;
   let migratorInstance;
   let exoplanetsV2Instance;
   let origNFTOwner;
   let migratorOwner;

   beforeEach( async function () {
      mockOrigNFTInstance = await MockOrigNFT.deployed();
      migratorInstance = await ExoplanetsMigrator.deployed();

      migratorOwner = await migratorInstance.owner();

      assert.equal( accounts_[0], migratorOwner, "incorrect migrator owner");

      let v2addr = await migratorInstance.getExoplanetsV2Address();
      console.log(`getExoplanetsV2Address: ${v2addr}`);
      exoplanetsV2Instance = await ExoplanetsV2NFT.at(v2addr);

      origNFTOwner = accounts_[1];

      await createMockOrigTokenIfNeeded(1);
      await createMockOrigTokenIfNeeded(2);
      await createMockOrigTokenIfNeeded(3);
      await createMockOrigTokenIfNeeded(4);
      await createMockOrigTokenIfNeeded(5);
      await createMockOrigTokenIfNeeded(6);
      await createMockOrigTokenIfNeeded(7);
      await createMockOrigTokenIfNeeded(8);

      let orig1_owner = await mockOrigNFTInstance.ownerOf(1);
      let orig2_owner = await mockOrigNFTInstance.ownerOf(2);
      let orig3_owner = await mockOrigNFTInstance.ownerOf(3);
      let orig4_owner = await mockOrigNFTInstance.ownerOf(4);

      assert.equal( orig1_owner, origNFTOwner, "incorrect owner/1");
      assert.equal( orig2_owner, origNFTOwner, "incorrect owner/2");
      assert.equal( orig3_owner, origNFTOwner, "incorrect owner/3");
      assert.equal( orig4_owner, origNFTOwner, "incorrect owner/4");
   });

   async function createMockOrigTokenIfNeeded(tokenId_) {
     const exists_ = await mockOrigNFTInstance.tokenExists(tokenId_);
     if (!exists_) {
       await mockOrigNFTInstance.safeMint(origNFTOwner, tokenId_);
     }
   }

   it("verifies token uri", async () => {
       const BASE_URI = "base-uri"; //zzzz
       const origTokenId = 6;
       const tokenUri = "/x/some-uri";
       await migratorInstance.migrateNFT( origTokenId, tokenUri, {from: origNFTOwner});

       let fullUri = await exoplanetsV2Instance.tokenURI( origTokenId);
       console.log(`fullUri: ${fullUri}`);

       assert.equal( fullUri, BASE_URI + tokenUri, "incorrect uri");
   });

   it("verifies V2 successful minting", async () => {
       const origTokenId = 5;
       await migratorInstance.migrateNFT( origTokenId, "some-uri", {from: origNFTOwner});

       let actual_owner = await exoplanetsV2Instance.ownerOf(origTokenId);

       assert.equal( actual_owner, origNFTOwner, "incorrect owner");
   });


  it("verifies orig owner may only mint V2 nft once", async () => {
      const tokenId = 4;
      await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});

      try {
          await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});
          assert.fail( "cannot mint twice");
       } catch(err) {
          logExpectedError(err);
       }
  });

  it("verifies that orig owner may mint several different NFTs", async () => {
    let tokenId = 1;
    await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});
    tokenId = 2;
    await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});
    tokenId = 3;
    await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});

    // but not the same token twice:
    try {
        await migratorInstance.migrateNFT( tokenId, "some-uri", {from: origNFTOwner});
        assert.fail( "cannot mint twice");
    } catch(err) {
        logExpectedError(err);
    }
  });

  it("verifies only orig nft owner may mint", async () => {
      const tokenId = 1;
      try {
          let nonOwnerAddress = accounts_[4];
          await migratorInstance.migrateNFT( tokenId, "some-uri", {from: nonOwnerAddress});
          assert.fail( "only orig NFT owner may mint");
       } catch(err) {
          logExpectedError(err);
       }
  });

  it("verifies cannot mint non-existing NFT", async () => {
      const nonexisting_tokenId = 100;
      try {
          await migratorInstance.migrateNFT( nonexisting_tokenId, "some-uri", {from: origNFTOwner});
          assert.fail( "cannot mint non existing token");
       } catch(err) {
          logExpectedError(err);
       }
  });

  it("tests migrator ownership", async () => {
      let owner_ = await migratorInstance.owner();
      console.log(`orig migrator owner: ${owner_}`);
      assert.equal( owner_, migratorOwner, "bad owner");

      try {
          await migratorInstance.transferOwnership(accounts_[2], {from: accounts_[1]});
          assert.fail( "only owner may invoke transferOwnership");
       } catch(err) {
          logExpectedError(err);
       }

       await migratorInstance.transferOwnership(accounts_[2], {from: migratorOwner});
       let owner_2 = await migratorInstance.owner();
       assert.equal( owner_2, accounts_[2], "bad owner-2");

       // and rever to orig owner
       await migratorInstance.transferOwnership(migratorOwner, {from: owner_2});
  });


  it("tests V2 contract ownership", async () => {
      let owner_ = await exoplanetsV2Instance.owner();
      console.log(`orig v2 owner: ${owner_}`);
      assert.equal( owner_, migratorInstance.address, "bad V2 owner");

      try {
          await migratorInstance.updateExoplanetsV2NFTOwner(accounts_[2], {from: accounts_[1]});
          assert.fail( "only owner may invoke updateExoplanetsV2NFTOwner");
       } catch(err) {
          logExpectedError(err);
       }

       await migratorInstance.updateExoplanetsV2NFTOwner(accounts_[2], {from: migratorOwner});
       let owner_2 = await exoplanetsV2Instance.owner();
       assert.equal( owner_2, accounts_[2], "bad owner-2");

  });

  function logExpectedError(err) {
      console.log(`Expected error: ${err.message}`);
  }

});
