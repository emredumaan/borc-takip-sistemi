module.exports = (req,res,next) => {
    if(req.session.user.role !== 'admin' ) return res.render('error/404')
    next()
}