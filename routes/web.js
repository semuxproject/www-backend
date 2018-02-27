"use strict";

var rp = require('request-promise');
var express = require('express');
var router = express.Router();

var Transactions = require('../models').Transactions;

const ENV = process.env.NODE_ENV || 'development';
const CONFIG = require('../config/config.json')[ENV];

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
    where : {ip : ip, status : 'sent'}, order : [['id', 'DESC']]
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
