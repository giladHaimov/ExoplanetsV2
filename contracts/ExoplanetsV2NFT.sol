// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IBasicNFT.sol";


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/*
 * @title ExoplanetsV2NFT
 * @author giladha@gmail.com
 *
 * @dev Exoplanets V2 wrapper nft. Allows connecting the Exoplanets nfts to an offchain token-uri
 * @event: ExoplanetNFTV2Created
 */
contract ExoplanetsV2NFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable {

    IBasicNFT public immutable origExoplanets;

    string public baseURI;

    mapping( uint => bool) public alreadyMigrated;

    event ExoplanetNFTV2Created(address indexed origNFTOwner, uint indexed origTokenId);


    constructor( IBasicNFT origExoplanets_, string memory baseURI_) ERC721("ExoplanetsV2", "XPL2") {
        origExoplanets = origExoplanets_;
        baseURI = baseURI_;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address origNFTOwner, uint256 origTokenId, string memory perTokenUri)
        public
        onlyOwner
    {
        require( origNFTOwner == origExoplanets.ownerOf( origTokenId), "Not NFT owner");
        require( alreadyMigrated[origTokenId] == false, "Token already migrated");

        alreadyMigrated[origTokenId] = true;

        _safeMint( origNFTOwner, origTokenId);
        _setTokenURI( origTokenId, perTokenUri);

        emit ExoplanetNFTV2Created(origNFTOwner, origTokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
