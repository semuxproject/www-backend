'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('airdrop_eth', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      eth_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sem_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reward: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'new'
      },
      created_at: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    }, { charset: 'utf8' })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('airdrop_eth')
  }
}
