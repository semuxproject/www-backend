'use strict'

module.exports = function (sequelize, DataTypes) {
  var Transactions = sequelize.define('Transactions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    address: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'transactions', timestamps: false
  })

  return Transactions
}
