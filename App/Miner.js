const Wallet = require('../Wallet/Wallet');
const Report = require('../Wallet/Report');


class Miner{
    constructor(blockchain,reportPool,wallet,p2pServer){
        this.blockchain = blockchain;
        this.reportPool = reportPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine(){
        const  validTransactions = this.reportPool.validReport();
        //Miner reward
        validTransactions.push(Report.rewardReport(this.wallet,this.wallet.blockchainWallet()));
        //create a block consisting of the valid transactions
        const block = this.blockchain.addBlock(validTransactions);
        //Sync p2p servers chain
        this.p2pServer.syncChains();
        //Clear transaction pool
        this.reportPool.clear();
        //Broadcast p2p clear Transaction pool
        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}

module.exports = Miner;
