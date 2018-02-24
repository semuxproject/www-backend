"use strict";

var rp = require('request-promise');
var Transactions = require('./models').Transactions;

const ENV = process.env.NODE_ENV || 'development';
const CONFIG = require('./config/config.json')[ENV];
const AMOUNT = 1000 * 1000000000;
const FEE = 0.005 * 1000000000;
const FROM = CONFIG.wallet.address;
const PASS = CONFIG.wallet.password;

async function makeTransfers() {
  let pendingRequests = await Transactions.findAll({where : {status : 'new'}});
  for (let request of pendingRequests) {
    let to = request.address;
    console.log('[FAUCET] Processing transfer to %s', to);
    try {
      let query = "transfer?from="+FROM+"&to="+to+"&value="+AMOUNT+"&fee="+FEE+"&password="+PASS;
      let options = {
        url: CONFIG.wallet.host + query,
        headers: {
          'Authorization': 'Basic ' + CONFIG.wallet.auth
        }
      };
      let transaction = JSON.parse(await rp(options));
      console.log(transaction);
      await request.update({status : 'sent'});
    } catch(e) {
      console.log('[FAUCET] Failed to send coins to %s', to)
      await request.update({status : 'error'});
    }
  }
}

/* Process the queue of pending transactions every 30 seconds */
let makeTransfersInterval = setInterval(makeTransfers, 30 * 1000);
