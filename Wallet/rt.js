const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../config');

class RT {
    constructor() {
        this.id = ChainUtil.id();
        this.userAddress = null;
        this.timestamp = null;
        this.signature = null;
        this.report = null;
        this.transactions = [];
    }

    /**
     * edit report or add extra transaction to the RT
     */

    updateTransactions(senderWallet, recipient, amount) {
        const senderTransaction = this.transactions.find(transaction => transaction.address === senderWallet.publicKey);

        if (amount > senderWallet.amount) {
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }

        senderTransaction.amount = senderTransaction.amount - amount;
        this.transactions.push({amount: amount, address: recipient});
        RT.signRT(this, senderWallet);

        return this;
    }

    /**
     * edit report or add extra transaction to the RT
     */

    updateReport(senderWallet, report) {

        this.report = report;
        RT.signRT(this, senderWallet);

        return this;
    }

    /**
     * create a new RT
     */

    static newRT(senderWallet, report, transaction) {

        var transactions = [];
        if (transaction&&transaction.amount) {
            if (transaction.amount > senderWallet.balance) {
                console.log(`Amount : ${transaction.amount} exceeds the balance`);
                return;
            }
            transactions = [{amount: senderWallet.balance - transaction.amount, address: senderWallet.publicKey},
                {amount: transaction.amount, address: transaction.address}];
        }
        // call to the helper function that creates and signs the transaction outputs
        return RT.rtWithReportAndTransactions(senderWallet, report, transactions)
    }

    /**
     * helper function for create rt
     */

    static rtWithReportAndTransactions(senderWallet, report, transactions) {
        const rt = new this();
        rt.transactions.push(...transactions);
        rt.report = report;
        RT.signRT(rt, senderWallet);
        return rt;
    }

    /**
     * create header and sign the report and the transactions
     */

    static signRT(rt, senderWallet) {
        rt.timestamp = Date.now();
        rt.userAddress = senderWallet.publicKey;
        rt.signature = senderWallet.sign(ChainUtil.hash(rt.report + rt.transactions));
        /*rt.input = {
            amount: senderWallet.balance,
        }*/
    }

    /**
     * verify the RT by decrypting and matching
     */

    static verifyRT(rt) {
        var reportWithoutVerdict = JSON.parse(JSON.stringify(rt.report));
        delete reportWithoutVerdict.verdict;
        return ChainUtil.verifySignature(
            rt.userAddress,
            rt.signature,
            ChainUtil.hash(reportWithoutVerdict + rt.transactions)
        )
    }

    static rewardRT(minerWallet, blockchainWallet) {
        return RT.rtWithReportAndTransactions(blockchainWallet, {}, [{
            amount: MINING_REWARD,
            address: minerWallet.publicKey
        }]);
    }
}

module.exports = RT;
