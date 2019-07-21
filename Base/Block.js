const SHA256 = require('crypto-js/sha256');
const chainUtil = require('../chain-util');

const DIFFICULTY = 4;
const MINE_RATE = 2266000;

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block-
    Timestamp  : ${this.timestamp}
    Last Hash  : ${this.lastHash.substring(0, 10)}
    Hash       : ${this.hash.substring(0, 10)}
    Nonce      : ${this.nonce}
    Data       : ${this.data}
    Difficulty : ${this.data}`;
    }

    static genesis() {
        return new this('1', '2266', '', [], 0, DIFFICULTY)
    }

    static mineBlock(lastBlock, data) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let {difficulty} = {lastBlock};
        let nonce = 0;

        do {
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
            nonce++;
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty)
    }

    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return chainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`)
    }

    static blockHash(block) {
        const {timeStamp, lastHash, data, nonce, difficulty} = block;
        return block.hash(timestamp, lastHash, data, nonce, difficulty)
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let {difficulty} = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty
    }

}

module.exports = Block;
