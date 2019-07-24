const RT = require('./rt');
const {MINING_REWARD} = require('../config');
const GeometryUtil = require('../geometry-util');
const TEST_ROAD_DATA = require('../test-road-data');

class RTPool {
    constructor() {
        // represents a collections of RT in the pool
        this.RTs = [];
    }

    /**
     * this method will add a RT
     * it is possible that the rt exists already
     * so it will replace the rt with the new et
     * after checking the id and adding new data if any
     * we call this method and replace the rt in the pool
     */
    updateOrAddRT(rt) {
        // get the rt while checking if it exists
        let rtWithId = this.RTs.find(t => t.id === rt.id);

        if (rtWithId) {
            this.RTs[this.RTs.indexOf(rtWithId)] = rt;
        } else {
            this.RTs.push(rt);
        }
    }

    /**
     * returns a existing rt from the pool
     * if the header matches
     */

    existingRT(address) {
        return this.RTs.find(rt => rt.userAddress === address);
    }

    /**
     * sends valid RTs to the miner
     */

    validRTs() {
        /**
         * valid RTs are the one whose total output amounts to the input
         * and whose signatures are same
         */
        return this.RTs.filter((rt) => {

            if (rt.report) {
                var closestLine = GeometryUtil.findClosestLineToPoint({
                    x: rt.report.lng,
                    y: rt.report.lat
                }, TEST_ROAD_DATA);
                if (closestLine.roadId !== -1) {
                rt.report.roadId = closestLine.roadId;
                this.calculateRoadReportVerdict(rt)
                } else {
                    //User is not near a road
                    rt.report = {}
                }
            }

            // reduce function adds up all the items and saves it in variable
            // passed in the arguments, second param is the initial value of the 
            // sum total
            const outputTotal = rt.transactions.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            /* TODO create calculateCurrentBalance(UserAddress) method
            if( rt.input.amount !== outputTotal ){
                console.log(`Invalid transaction from ${rt.userAddress}`);
                return;
            }*/

            if (!RT.verifyRT(rt)) {
                console.log(`Invalid signature from ${rt.userAddress}`);
                return;
            }

            return rt;
        })
    }

    calculateRoadReportVerdict(rt) {
        //get RTs in current road until 5 minutes ago
        var currentRoadRTs = this.RTs.find(aRt => (aRt.report.roadId === rt.report.roadId) && (aRt.timestamp - rt.timestamp) > 30000);
        if (currentRoadRTs) {
            currentRoadRTs.push(rt);
            let averageRoadWeight = Math.round((currentRoadRTs.map(rt => rt.report.weight).reduce((a, b) => a + b, 0)) / currentRoadRTs.size);
            for (let currentRoadRT in currentRoadRTs) {
                if (currentRoadRT.report.weight >= (averageRoadWeight - 1) && currentRoadRT.report.weight <= (averageRoadWeight + 1)) {
                    //Report data is true so users get reward
                    currentRoadRT.report.verdict = MINING_REWARD / 1000;
                } else {
                    //Report data is false so users get punished
                    currentRoadRT.report.verdict = -5 * (MINING_REWARD / 1000);
                }
            }
        } else
            rt.report.verdict = 0;
    }

    clear() {
        this.RTs = [];
    }
}

module.exports = RTPool;
