const Block = require('./Block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]
    }

    addBlock(data) {
        const lastBlock = this.chain[this.chain.length - 1];
        return this.chain.push(Block.mineBlock(lastBlock, data));
    }

    static isChainValid(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];
            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
                return false
            }
        }
        return true
    }


    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            return;
        } else if (!Blockchain.isChainValid(newChain)) {
            return;
        }
        this.chain = newChain;

    }
}

module.exports = Blockchain;
