'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('airdrop_eth', ['airdrop_eth_eth_address_key'])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('airdrop_eth', ['eth_address'])
  }
}
