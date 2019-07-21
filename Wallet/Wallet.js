const ChainUtil = require('../chain-util');
const Report = require('./Report')
const INITAL_BALANCE = 500;

class Wallet {
    constructor() {
        this.balance = INITAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
        publicKey : ${this.publicKey.toString()}
        balance   : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain,reportPool) {
        this.balance = this.calculateBalance(blockchain);
        if (amount > this.balance) {
            return;
        }

        let report = reportPool.existingTransaction(this.publicKey);

        if (report) {
            report.update(this, recipient, amount);
        } else {
            report = Report.newTransaction(this, recipient, amount);
            reportPool.updateOrAddTransaction(transaction);
        }

        return report;
    }

    calculateBalance(blockchain) {
        let balance = this.balance;
        let reports = [];
        blockchain.chain.forEach(block => block.data.forEach(report => {
            reports.push(report)
        }));

        const walletInputTs = reports.filter(report => report.input.address() === this.publicKey);

        /*let startTime = 0;

        if (walletInputTs.length > 0) {

            const recentInputT = walletInputTs.reduce((prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current);

            balance = recentInputT.outputs.find(output => output.address() === this.publicKey).amount;
            startTime = recentInputT.input.timestamp
        }

        reports.forEach(report => {
            if (report.input.timestamp > startTime) {
                report.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                })
            }
        })*/

        reports.forEach(report => {
            if (report.input.timestamp > startTime) {
                if (report.input.address === this.publicKey) {
                    balance += report.verdict;
                }
            }
        })
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
}


module.exports = Wallet;
