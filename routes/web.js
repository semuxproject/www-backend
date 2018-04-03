"use strict";

var rp = require('request-promise');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();

var Transactions = require('../models').Transactions;
var EthAirdropAddresses = require('../models').EthAirdropAddresses;

const ENV = process.env.NODE_ENV || 'development';
const CONFIG = require('../config/config.json')[ENV];

const MIN_AIRDROP_AMOUNT = 1;
const MAX_AIRDROP_AMOUNT = 1000;
const AIRDROP_RATIO = 0.1; // 1 SEM = 10 ETH

var snapshot = {};

csv().fromFile('./assets/eth.txt')
.on('json',(json) => {
  if (!json.address.match(/^0x/)) {
    json.address = '0x' + json.address;
  }
  snapshot[json.address] = json.balance;
})
.on('done',(error) => {
  console.log('ETH Snapshot loaded');
});

router.get('/airdrop/eth', async function(req, res) {
  res.render('airdrop');
});

router.post('/airdrop/eth', async function(req, res) {
  console.dir(req.body);

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";

  let options = {
    url : 'https://www.google.com/recaptcha/api/siteverify',
    method : 'POST',
    form: {
      secret: CONFIG.recaptchaSecret,
      response: req.body['g-recaptcha-response']
    }
  };
  let verification = {};
  try {
    verification = JSON.parse(await rp(options));
  } catch(e) { console.log(e); }

  if (verification.success != true) {
    return res.render('airdrop', {error : true, reason : 'Recaptcha verification failed'});
  }

  if (!req.body.eth_address || !req.body.sem_address || !req.body.signature) {
    return res.render('airdrop', {error : true, reason : 'ETH Address, SEM Address and Signature are required'});
  }

  let address = req.body.eth_address;
  if (!address.match(/^0x/)) {
    address = '0x' + address;
  }

  let participant = await EthAirdropAddresses.findOne({where : {eth_address : address}});
  if (participant) {
    return res.render('airdrop', {error : true, reason : 'This ETH address is already registered for airdrop'});
  }

  let balance = snapshot[address];

  let reward = parseInt(AIRDROP_RATIO * parseFloat(balance), 10);
  if (reward < MIN_AIRDROP_AMOUNT) {
    reward = MIN_AIRDROP_AMOUNT;
  }
  if (reward > MAX_AIRDROP_AMOUNT) {
    reward = MAX_AIRDROP_AMOUNT;
  }

  try {
    await EthAirdropAddresses.create({
      eth_address : address,
      sem_address : req.body.sem_address,
      signature : req.body.signature,
      reward : reward,
      created_at : Math.floor(Date.now() / 1000)
    });
  } catch(e) { console.log(e); }

  res.render('airdrop', {success : true, reward : reward});
});

router.get('/eth_airdrop_balance', async function(req, res) {
  let address = req.query.eth_address;
  if (!address.match(/^0x/)) {
    address = '0x' + address;
  }
  let balance = snapshot[address];
  if (!balance) {
    return res.json({"result" : "success", balance : 0, reward : 0});
  }

  let participant = await EthAirdropAddresses.findOne({where : {eth_address : address}});
  if (participant) {
    return res.json({
      "result" : "error",
      message : 'This ETH address is already registered for airdrop',
      balance : 0, reward : 0});
  }

  let reward = parseInt(AIRDROP_RATIO * parseFloat(balance), 10);
  if (reward < MIN_AIRDROP_AMOUNT) {
    reward = MIN_AIRDROP_AMOUNT;
  }
  if (reward > MAX_AIRDROP_AMOUNT) {
    reward = MAX_AIRDROP_AMOUNT;
  }
  return res.json({"result" : "success", balance : balance, reward : reward});
});

router.get('/testnetfaucet', async function(req, res) {
  res.render('faucet');
});

router.post('/testnetfaucet', async function(req, res) {

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";

  let options = {
    url : 'https://www.google.com/recaptcha/api/siteverify',
    method : 'POST',
    form: {
      secret: CONFIG.recaptchaSecret,
      response: req.body['g-recaptcha-response']
    }
  };
  let verification = {};
  try {
    verification = JSON.parse(await rp(options));
  } catch(e) { console.log(e); }

  if (verification.success != true) {
    return res.render('faucet', {error : true, reason : 'Recaptcha verification failed'});
  }

  if (!req.body.address) {
    return res.render('faucet', {error : true, reason : 'Address is required'});
  }

  if (req.body.address.length != 42 || !req.body.address.match(/^0x/)) {
    return res.render('faucet', {error : true, reason : 'Wrong address format'});
  }

  let prevRequest = await Transactions.findOne({
    where : {ip : ip}, order : [['id', 'DESC']]
  });
  if (prevRequest) {
    /* if last successful request from this IP has been made less than 3 hours ago */
    if (prevRequest.created_at > now() - 60 * 60 * 3) {
      return res.render('faucet', {
        error : true,
        reason : 'Someone already requested testnet coins from this ip '+ip+'. Please wait at least 3 hours before making new request.'
      });
    }
  }

  try {
    await Transactions.create({
      address : req.body.address, status : 'new', ip : ip, created_at : now()
    });
  } catch(e) {
    return res.render('faucet', {error : true, reason : 'This address already received 1000 testnet coins'});
  }

  res.render('faucet', {success : true, address : req.body.address});
});

function now() {
  return Math.floor(Date.now() / 1000);
}

module.exports = router;
