const RT = require('../wallet/rt');
const Wallet = require('../wallet/wallet');

class Miner{
    constructor(blockchain,rtPool,wallet,p2pServer){
        this.blockchain = blockchain;
        this.p2pServer = p2pServer;
        this.wallet = wallet;
        this.rtPool = rtPool;
    }

    mine(){
        /**
         * 1. grab rt from the pool that are valid
         * 2. create a block using the transactions
         * 3. synchronize the chain and include new block
         * 4. clear the rt pool to remove confirmed RTs
         */

         const validTransactions = this.rtPool.validRTs();

         // include reward for the miner in the valid RTs array

         validTransactions.push(RT.rewardRT(this.wallet,Wallet.blockchainWallet()));

         // create a block consisting of the valid rt

         const block = this.blockchain.addBlock(validTransactions);

         // synchronize the chains in the p2p server

         this.p2pServer.syncChain();

         // clear the RT pool

         this.rtPool.clear();

         // broadcast every miner to clear their pool

         this.p2pServer.broadcastClearRT();

         return block;


    }
}

module.exports = Miner;
