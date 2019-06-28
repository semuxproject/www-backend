'use strict'

module.exports = function (sequelize, DataTypes) {
  var EthAirdropAddresses = sequelize.define('EthAirdropAddresses', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    eth_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sem_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reward: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'new'
    },
    created_at: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'airdrop_eth', timestamps: false
  })

  return EthAirdropAddresses
}
