# Sample NFT Hardhat Project

This project demonstrates some basic concepts of creating an NFT.

BasicNFT.sol : Creates an ERC721 NFT, which has a fixed tokenURI+imageURI that has been uploaded to IPFS previously. Price of minting is free.

RandomIpfsNft.sol : Creates an ERC721 NFT, which first ask a random number from Chainlink VRF Coordinator and mints a provably rare NFT based on a chance array. The deploy script for this contract also uploads to IPFS the three images found on images/randomNft using the Pinata SDK.

DynamicSvgNft.sol : Creates an Dynamic SVG ERC721 NFT which hosts the tokenURI on-chain. This is possible using the SVG properties and storing the hash of an HTML file as a tokenURI for the NFT Tokens. The user inputs a threshold for ETH price and the NFT images changes if ETH price is below or above that threshold.


Try running some of the following tasks:

To install the project:
```shell
yarn
```
To deploy the contracts on hardhat localhost
```shell
yarn hardhat deploy
```
To deploy the contracts in Goerli Ethereum Testnet:
```shell
yarn hardhat deploy --network goerli
```

To run the project's tests
```shell
yarn hardhat test
```
