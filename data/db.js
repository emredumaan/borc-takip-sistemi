const config = require("../config")
const mysql = require('mysql2/promise')

const Sequelize = require("sequelize")

const { database,host,password,port,user } = config.db

const sequelize = new Sequelize(database, user, password, {
    dialect: "mysql",
    host: host,
    port: port
})

async function connect() {
    try {
        await sequelize.authenticate()
        console.log("database connection successfull")
    }
    catch (err) {
        console.log("database connection error", err)
    }
}

connect()

module.exports = sequelize