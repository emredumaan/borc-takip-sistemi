const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Debt = sequelize.define("debts", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lenderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Debt;