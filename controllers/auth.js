const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports.getLogin = (req,res) => {
    res.render('auth/login')
}

module.exports.postLogin = async (req,res) => {
    const password = req.body.password
    const username = req.body.username

    if(!username || !password) return res.render('auth/login',{error:'Lütfen bütün alanları doldurun.'})

    const user = await User.findAll({where: {username: username}})
    if(user.length === 0) return res.render('auth/login',{error: 'Kullanıcı adı veya şifre hatalı'})

    const passwordMatched = await bcrypt.compare(password,user[0].password)
    if(!passwordMatched) return res.render('auth/login',{error: 'Kullanıcı adı veya şifre hatalı'})

    if(user[0].role === 'admin') req.session.isAdmin = true
    req.session.isAuth = true
    req.session.user = user[0]
    res.redirect('/')
} 