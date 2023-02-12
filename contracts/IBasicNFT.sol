// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IBasicNFT {

  // the only nft function used by the migration flow
  function ownerOf(uint256 tokenId) external view returns (address);
}
