// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./ExoplanetsV2NFT.sol";
import "./IBasicNFT.sol";

/*
 * @title ExoplanetsMigrator
 * @author giladha@gmail.com
 *
 * @dev Allow orig-Exoplanets nft owners to mint a new ExoplanetsV2NFT wrapper nft
 *      Note: original nfts will not be burned
 * @event: ExoplanetsV2NFTOwnerUpdated
 */
contract ExoplanetsMigrator is Ownable, Pausable {

  // ORIG_EXOPLANETS = '0xb12E260275BcD28E6f8820666Ba02C67c9600843'
  IBasicNFT public immutable origExoplanets;

  ExoplanetsV2NFT private immutable exoplanetsV2NFT;

  event ExoplanetsV2NFTOwnerUpdated(address indexed newOwner);

  modifier onlyOrigNFTOwner(uint tokenId) {
      require( msg.sender == origExoplanets.ownerOf( tokenId), "Not NFT owner");
      _;
  }


  constructor(address origExoplanetsAddr_, string memory baseURI_) {
      origExoplanets = IBasicNFT(origExoplanetsAddr_);
      exoplanetsV2NFT = new ExoplanetsV2NFT(origExoplanets, baseURI_);
      require( exoplanetsV2NFT.owner() == address(this), "Ownership not set correctly");
  }

  function getExoplanetsV2Address() external view returns(address) {
      return address(exoplanetsV2NFT);
  }

  function migrateNFT(uint tokenId, string memory perTokenURI) external onlyOrigNFTOwner(tokenId) {
      exoplanetsV2NFT.safeMint( msg.sender, tokenId, perTokenURI);
      // do not burn orig Exoplanets nft!
  }

  function updateExoplanetsV2NFTOwner(address newOwner) external onlyOwner {
      exoplanetsV2NFT.transferOwnership( newOwner);
      emit ExoplanetsV2NFTOwnerUpdated(newOwner);
  }

  function v2NFTAddress() external view returns(address) {
      return address(exoplanetsV2NFT);
  }

}
