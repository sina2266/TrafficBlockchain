const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5101;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    report: 'REPORT',
    clear_report : 'CLEAR_REPORTS'
};

class P2pServer {
    constructor(blockchain, reportPool) {
        this.blockchain = blockchain;
        this.reportPool = reportPool;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({port: P2P_PORT});
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log(`Listening for p2p connection on : ${P2P_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket)

        socket.send(JSON.stringify(this.blockchain.chain));
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket))
        })
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.stringify(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.report:
                    this.reportPool.updateOrAddReport(data.report);
                    break;
                case MESSAGE_TYPES.clear_report:
                    this.reportPool.clear();
                    break;
            }
        })
    }

    sendChain(socket) {
        socket.send(JSON.stringify({type: MESSAGE_TYPES.chain, chain: this.blockchain.chain}))
    }

    sendReport(socket, report) {
        socket.send(JSON.stringify({type: MESSAGE_TYPES.report, report}))
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket))
    }

    broadcastReport(transaction) {
        this.sockets.forEach(socket => this.sendReport(socket, transaction));
    }

    broadcastClearReports(){
        this.sockets.forEach(socket => socket.send(JSON.stringify({type : MESSAGE_TYPES.clear_report})))
    }
}

module.exports = P2pServer;
