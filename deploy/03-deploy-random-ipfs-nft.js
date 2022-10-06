const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");

const FUND_AMOUNT = "1000000000000000000000";
const imagesLocation = "./images/randomNft/";
let tokenUris = [
    "ipfs://QmRzEhU9K1z4NL6f7gAC31jZjP1Z6AuNh2Cr6fE6GVR7VV", //LEGENDARY
    "ipfs://QmWiweYjjkAcuYHKMUd1XUWv7U2dpeas9oFo5zFfiRX8Vt", //RARE
    "ipfs://QmaAffXgFCFQkKa2Kc37KnxpJKJoUqEYg31i984dAaw1Vz", //COMMON
];
// const imageUris = [
//     "ipfs://QmRbsGs2bJ7ickKe6Gd8wM5oV1soEKBtZh5aQgtpvQSGG7",  //LEGENDARY
//     "ipfs://QmW45uZSgjB1uWi112juqqiYwwyuDk2Auexjjn5xLf7xb7",  //RARE
//     "ipfs://QmQqXYuFWBdtRJyEE373yuv1tXpRu5NLgvvPt93BtsQANp",  //COMMON
// ]

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};

module.exports = async ({ getNamedAccounts, deployments, ethers, network }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId;

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    if (chainId == 31337) {
        // create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }
    log("----------------------------------------------------");
    arguments = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["mintFee"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
    ];
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId.toNumber(), randomIpfsNft.address);
        log("adding consumer...");
        log("Consumer added!");
    }

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(randomIpfsNft.address, arguments);
    }
};

async function handleTokenUris() {
    //https://www.pinata.cloud/
    tokenUris = [];
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate };
        if (files[imageUploadResponseIndex].includes("legendary")) {
            tokenUriMetadata.name = "Aura (Legendary)";
            tokenUriMetadata.description = `An adorable Legendary Aura!`;
            tokenUriMetadata.attributes = [
                {
                    trait_type: "Cuteness",
                    value: 100,
                },
            ];
        } else if (files[imageUploadResponseIndex].includes("rare")) {
            tokenUriMetadata.name = "Aura (Rare)";
            tokenUriMetadata.description = `An adorable Rare Aura!`;
            tokenUriMetadata.attributes = [
                {
                    trait_type: "Cuteness",
                    value: 85,
                },
            ];
        } else {
            tokenUriMetadata.name = "Aura (Common)";
            tokenUriMetadata.description = `An adorable Common Aura!`;
            tokenUriMetadata.attributes = [
                {
                    trait_type: "Cuteness",
                    value: 65,
                },
            ];
        }

        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token URIs uploaded! They are:");
    console.log(tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
