const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../Config');

class Report{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.data = null;
        this.verdict = MINING_REWARD/1000;
        this.lat = null;
        this.lng = null;
        this.weight = null;
        this.time = new Date().getTime();
    }

    static newReport(senderWallet,data){
       const report = new this;
       report.data = data;
       this.signReport(report,senderWallet);

       return report
    }

    static rewardReport(minerWallet,blockchainWallet){
        return Report.transactionWithOutputs(minerWallet,[{amount : MINING_REWARD,address : minerWallet.publicKey}]);
    }

    static signReport(report,senderWallet){
        report.input = {
            timestamp : Date.now(),
            address :senderWallet.publicKey,
            signature : senderWallet.sign(ChainUtil.hash(report.data))
        }
    }

    static verifyReport(report){
        ChainUtil.verifySignature(report.input.address,
            report.input.signature,
            ChainUtil.hash(report.data))
    }

}

module.exports = Report;
