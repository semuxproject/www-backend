"use strict";

var rp = require('request-promise');
var express = require('express');
var router = express.Router();

var Transactions = require('../models').Transactions;

const ENV = process.env.NODE_ENV || 'development';
const CONFIG = require('../config/config.json')[ENV];
const DECIMALS = 1000000000;

router.get('/get_balance', async function(req, res) {

  let options = {
    url: CONFIG.wallet.host + 'get_account?address='+CONFIG.wallet.address,
    headers: {
      'Authorization': 'Basic ' + CONFIG.wallet.auth
    }
  };

  let balance = {};
  try {
    balance = JSON.parse(await rp(options)).result;
  } catch(e) {}

  balance = balance.available ? parseInt(balance.available / DECIMALS, 10) : 0;

  let sent = await Transactions.count('amount', {where : {status : 'sent'}});

  return res.json({"result" : "success", "balance" : balance, "sent" : sent * 1000});

});

module.exports = router;
