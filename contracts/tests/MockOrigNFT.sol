// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* zzzzz
1. doc page
2. move to hardhat
3. ipfs */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../IBasicNFT.sol";


contract MockOrigNFT is ERC721, Ownable {

    constructor() ERC721("MockOrigNFT", "MOK") {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint( to, tokenId);
        //_setTokenURI( tokenId, uri);
    }

    function tokenExists(uint256 tokenId) external view returns (bool) {
      return _exists( tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
