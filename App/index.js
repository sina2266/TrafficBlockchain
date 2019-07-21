const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Base/Blockchain');
const P2pServer = require('../PP/p2p-server');
const Wallet = require('../Wallet/Wallet');
const ReportPool = require('../Wallet/ReportPool');
const Miner = require('./Miner');

const HTTP_PORT = process.env.HTTP_PORT || 2266;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const rp = new ReportPool();
const p2pSever = new P2pServer(bc,rp);
const miner = new Miner(bc,rp,wallet,p2pSever);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain)
});

app.post('/mine',(req,res)=> {
    const block = bc.addBlock(req.body.data);
    p2pSever.syncChains();
    res.redirect('/block')
});

app.get('/transactions',(req,res)=>{
    res.json(rp.reports);
});

app.post('/transact',(req,res)=> {
    const{recipient,amount} = req.body;
    const report = wallet.createTransaction(recipient,amount,bc,rp);
    p2pSever.broadcastReport(report);
    res.redirect('/transactions');
});

app.get('/mine-transactions',(req,res)=>{
    const block = miner.mine();
    res.redirect('/blocks')
});

app.get('/public-key',(req,res)=>{
    res.json({publicKey : wallet.publicKey});
});

app.listen(HTTP_PORT,()=>console.log(`Listening on port ${HTTP_PORT}`));
p2pSever.listen();
