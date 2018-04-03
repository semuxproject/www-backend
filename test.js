
var csv = require('csvtojson');
var snapshot = {};

csv()
.fromFile('./eth.txt')
.on('json',(jsonObj) => {
  snapshot[jsonObj.address] = jsonObj.balance;
})
.on('done',(error) => {
  console.log('ETH Snapshot loaded');
});
