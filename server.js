
const config = require("./config")

const express = require('express')
const app = express()
const path = require("path")
const cookieParser = require('cookie-parser')
const session = require('express-session')
const SessionStore = require('express-session-sequelize')(session.Store)

const sequelize = require('./data/db')
const sequelizeSessionStore = new SessionStore({
    db: sequelize,
})

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
    secret: "JSKDFKSDFLJGEWOIGLssjdkfsfhsdkjfsdhkfj234___234324ewrfgd",
    resave: false,
    saveUninitialized: false,
    store: sequelizeSessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 120
    }
}))

const userRoutes = require("./routes/user")
const adminRoutes = require("./routes/admin")
const authRoutes = require('./routes/auth')

const isAuth = require('./middlewares/auth')

app.use(express.static(path.join(__dirname, "public")))

app.use(authRoutes)
app.use(isAuth)
app.use('/admin', adminRoutes)
app.use(userRoutes)
app.use((req, res) => res.render('error/404'))

const User = require('./models/User')
const Debt = require('./models/Debt')

Debt.belongsTo(User, {
    foreignKey: 'debtorId'
})

sequelize.sync()

app.listen(config.server.port, () => {
    console.log(`app started at port ${config.server.port}.`)
})
