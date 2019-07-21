const Report = require('../Wallet/Report');

class ReportPool {
    constructor() {
        this.reports = [];
    }

    updateOrAddReport(report) {
        let reportWithId = this.reports.find(t => t.id === report.id);

        if (reportWithId) {
            this.reports[this.reports.indexOf(reportWithId)] = report
        } else {
            this.reports.push(report)
        }
    }

    existingReport(address) {
        return this.reports.find(t => t.input.address() === address);
    }

    validReport() {
        return true
        //TODO HEREEEEEEEEEE
        /*return this.reports.filter(report => {
            const outputTotal = report.outputs.reduce((total, output) => {
                return total + output.amount
            }, 0);

            if (transaction.input.amount !== outputTotal) {
                return;
            }

            if (!Transaction.verifyTransaction(transaction)) {
                return;
            }
            return transaction;
        });*/
    }

    clear(){
        this.reports = [];
    }
}

module.exports = ReportPool;
