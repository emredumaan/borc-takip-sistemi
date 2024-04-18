const express = require('express')
const router = express.Router()

const controllers = require('../controllers/user')

router.get('/',controllers.getHome)
router.get('/account',controllers.getAccount)
router.get('/logout',controllers.logout)

router.post('/add-debt',controllers.createDebt)
router.post('/pay-debt',controllers.payDebt)
router.post('/approve-request', controllers.approveRequest)
router.post('/change-password', controllers.changePassword)

module.exports = router