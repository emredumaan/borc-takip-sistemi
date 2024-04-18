const User = require('../models/User')
const {Op} = require('sequelize')

module.exports = async (req,res,next) => {
    if(!req.session.isAuth) return res.redirect('/login')
    try {
        const roommates = await User.findAll({where: {id: {[Op.ne]:req.session.user.id}} })
        res.locals.roommates = roommates
        res.locals.user = req.session.user
        next()
    }
    catch {
        res.render('auth/login',{error:'Something went wrong. Please try again.'})
    }
}