const Moralis = require('moralis/node');

/* Moralis init code */
const serverUrl = "SERVER_URL";
const appId = "APP_ID";
Moralis.start({ serverUrl, appId });

/**
 * This function takes a range of blocks and parses the given blockchain
 * for price every blockInterval minutes by block.
 * @param {number} startBlock     - first block to parse data
 * @param {number} endBlock       - last block to parse data
 * @param {number} blockInterval  - minutes between each block parse
 * @returns {object} An array of price data per block every blockInterval minutes
 */
async function getBlockData(startBlock, endBlock, blockInterval) {
    if (endBlock < startBlock)
        throw new Error("End block smaller than start block");

    // initialize function level variables
    var blockDataArr = [];
    var currBlock = startBlock;
    var prevBlock;
    var blockTimestamp;
    var nextTimestamp;

    // loop through blocks every blockInterval minutes
    // Note: currBlock != prevBlock will not pass when the loop reaches the actual latest block
    // Note Error: if endBlock is greater than the latest actual block the last price interval will be <blockInterval mins
    while (currBlock < endBlock && currBlock != prevBlock) {
        let price = await getBlockPrice(currBlock);
        blockTimestamp = new Date(await getBlockTimestamp(currBlock)).getTime(); // unix milleseconds

        // add blockInterval mins to get next timestamp to search block
        // Calculation: timestamp + (blockInterval*60000)/1000
        // 60000 unix time milliseconds = 1 second
        // Divide by 1000 to convert to unix timestamp in seconds 
        nextTimestamp = (blockTimestamp + blockInterval*60000)/1000; // unix seconds
        if (isNaN(nextTimestamp))
            throw new Error("Not a number");

        // grab next block by timestamp
        prevBlock = currBlock;
        currBlock = await getBlockByTimestamp(nextTimestamp.toString());    
        
        blockDataArr.push({block: prevBlock, timestamp: blockTimestamp, usdPrice: price});

        console.log(blockDataArr); // TODO: for testing
    }

    return blockDataArr;
}

/**
 * This helper function grabs the block price.
 * @param {number} blockNumber - block to get data from
 * @returns {number} of the USD price of the token
 */
async function getBlockPrice(blockNumber) {
    // Get token price of Aave from sushiswap
    const options = {
        address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
        chain: "eth",
        exchange: "sushiswap",
        to_block: blockNumber,
    };
    const priceData = await Moralis.Web3API.token.getTokenPrice(options);
    
    return priceData.usdPrice;
}

/**
 * This helper function grabs a blocks timestamp.
 * @param {number} blockNumber - block to get timestamp from
 * @returns {number} of the block's timestamp in unix (milleseconds)
 */
async function getBlockTimestamp(blockNumber) {
    const options = { chain: "eth", block_number_or_hash: blockNumber };

    // get block content on 'chain'
    const transactions = await Moralis.Web3API.native.getBlock(options);
    return transactions.timestamp;
}

/**
 * This helper function grabs the block closest to the timestamp.
 * @param {number} timestamp - unix timestamp (seconds)
 * @returns {number} of the block closest to the timestamp
 */
async function getBlockByTimestamp(timestamp) {
    const options = {
        chain: "eth",
        date: timestamp,
    };

    // get block data by timestamp 
    const blockData = await Moralis.Web3API.native.getDateToBlock(options);
    return blockData.block;
}

// TODO: for testing
try {
    getBlockData(14275140, 142791401, 30);
} catch (err) {
    console.log(err.Error);
}

