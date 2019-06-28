'use strict'

var rp = require('request-promise')
var express = require('express')
var router = express.Router()

var Transactions = require('../models').Transactions
var EthAirdropAddresses = require('../models').EthAirdropAddresses

const ENV = process.env.NODE_ENV || 'development'
const CONFIG = require('../config/config.json')[ENV]

router.get('/airdrop/eth', async function (req, res) {
  return res.redirect('/airdrop/eth/summary')
  // res.render('airdrop')
})

router.post('/airdrop/eth', async function (req, res) {
  let options = {
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    form: {
      secret: CONFIG.recaptchaSecret,
      response: req.body['g-recaptcha-response']
    }
  }
  let verification = {}
  try {
    verification = JSON.parse(await rp(options))
  } catch (e) { console.log(e) }

  if (verification.success !== true) {
    return res.render('airdrop', { error: true, reason: 'Recaptcha verification failed' })
  }

  if (!req.body.eth_address || !req.body.sem_address || !req.body.signature) {
    return res.render('airdrop', { error: true, reason: 'ETH Address, SEM Address and Signature are required' })
  }

  let address = req.body.eth_address
  if (!address.match(/^0x/)) {
    address = '0x' + address
  }

  /*
  let participant = await EthAirdropAddresses.findOne({where : {eth_address : address}});
  if (participant) {
    return res.render('airdrop', {error : true, reason : 'This ETH address is already registered for airdrop'});
  }
  */

  try {
    await EthAirdropAddresses.create({
      eth_address: address,
      sem_address: req.body.sem_address,
      signature: req.body.signature,
      reward: 0,
      created_at: Math.floor(Date.now() / 1000)
    })
  } catch (e) { console.log(e) }

  res.render('airdrop', { success: true, reward: 0 })
})

router.get('/airdrop/eth/summary', async function (req, res) {
  res.render('airdrop_summary', { stats: ethAirdropSummary, total: semToEthSent })
})

var ethAirdropSummary = []
var semToEthSent = 0

async function updateEthAirdrop () {
  let json = []
  try {
    json = JSON.parse(await rp('https://www.semux.org/assets/airdrop/ethereum/summary.json'))
  } catch (e) { return }

  if (json) {
    ethAirdropSummary = json
    ethAirdropSummary.sort(function (a, b) {
      if (parseFloat(a.eth_balance) > parseFloat(b.eth_balance)) { return -1 }
      if (parseFloat(a.eth_balance) < parseFloat(b.eth_balance)) { return 1 }
      return 0
    })
  }
  let sum = 0
  for (let item of json) {
    sum += parseFloat(item.airdrop)
  }
  semToEthSent = sum
  console.log('Updated ETH Aridrop Summary')
  json = null
}

/* Update ETH Airdrop summary every 1 hour and on startup */
setInterval(updateEthAirdrop, 60 * 60 * 1000)
updateEthAirdrop()

router.get('/testnetfaucet', async function (req, res) {
  res.render('faucet')
})

router.post('/testnetfaucet', async function (req, res) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

  let options = {
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    form: {
      secret: CONFIG.recaptchaSecret,
      response: req.body['g-recaptcha-response']
    }
  }
  let verification = {}
  try {
    verification = JSON.parse(await rp(options))
  } catch (e) { console.log(e) }

  if (verification.success !== true) {
    return res.render('faucet', { error: true, reason: 'Recaptcha verification failed' })
  }

  if (!req.body.address) {
    return res.render('faucet', { error: true, reason: 'Address is required' })
  }

  if (req.body.address.length !== 42 || !req.body.address.match(/^0x/)) {
    return res.render('faucet', { error: true, reason: 'Wrong address format' })
  }

  let prevRequest = await Transactions.findOne({
    where: { ip: ip }, order: [['id', 'DESC']]
  })
  if (prevRequest) {
    /* if last successful request from this IP has been made less than 3 hours ago */
    if (prevRequest.created_at > now() - 60 * 60 * 3) {
      return res.render('faucet', {
        error: true,
        reason: 'Someone already requested testnet coins from this ip ' + ip + '. Please wait at least 3 hours before making new request.'
      })
    }
  }

  try {
    await Transactions.create({
      address: req.body.address, status: 'new', ip: ip, created_at: now()
    })
  } catch (e) {
    return res.render('faucet', { error: true, reason: 'This address already received 1000 testnet coins' })
  }

  res.render('faucet', { success: true, address: req.body.address })
})

function now () {
  return Math.floor(Date.now() / 1000)
}

module.exports = router
