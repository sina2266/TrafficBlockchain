const express = require('express');
const Blockchain = require('../blockchain/blockchain');
const bodyParser = require('body-parser');
const P2pserver = require('./p2p-server');
const Miner = require('./miner');

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const Wallet = require('../wallet/wallet');
const RTPool = require('../wallet/rt-pool');

//create a new app
const app = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet();

// create a new RT pool which will be later
// decentralized and synchronized using the peer to peer server
const rtPool = new RTPool();

// create a p2p server instance with the blockchain and the RT pool
const p2pserver = new P2pserver(blockchain, rtPool);

// create a miner
const miner = new Miner(blockchain, rtPool, wallet, p2pserver);
//EXPOSED APIs

//api to get the blocks
app.get('/blocks', (req, res) => {

    res.json(blockchain.chain);

});

//api to add blocks
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    /**
     * use the synchain method to synchronise the
     * state of the blockchain
     */
    p2pserver.syncChain();
    res.redirect('/blocks');
});

// api to start mining
app.get('/mine-rts', (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
});

// api to view RT in the RT pool
app.get('/rts', (req, res) => {
    res.json(rtPool.RTs);
});


// create RT
app.post('/rt', (req, res) => {
    const {report, transaction} = req.body;
    const rt = wallet.createRT(report, transaction, blockchain, rtPool);
    if (!rt)
        res.json({Error : "No RT created"});
    else {
        p2pserver.broadcastRT(rt);
        res.redirect('/rts');
    }
});


// get wallet balance
app.all('/balance', (req, res) => {
    //if no address associated use current user's wallet address
    const address = req.body.address || wallet.publicKey;
    const balance = Wallet.calculateBalanceWithAddress(blockchain, address);
    res.json({balance: balance});
});

// get public key
app.get('/public-key', (req, res) => {
    res.json({publicKey: wallet.publicKey});
});

// app server configurations
app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`);
});

// p2p server configuration
p2pserver.listen();
