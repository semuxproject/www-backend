'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, { charset: 'utf8' })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('transactions')
  }
}
