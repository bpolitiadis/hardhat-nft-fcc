//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://QmYLtEFMdCQWsFv6W52VrCaPQtvUUg1VpmUfGYWRVbvavG?filename=Pixel_meta.json";

    constructor() ERC721("Pixel", "PXL") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }
}
