const express = require('express')
const router = express.Router()

const controllers = require('../controllers/auth')

router.get('/login',controllers.getLogin)
router.post('/login',controllers.postLogin)

module.exports = router