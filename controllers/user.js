const { Op } = require('sequelize')
const Debt = require('../models/Debt')
const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports.getHome = async (req, res) => {
    try {
        const debts = await Debt.findAll({ where: { debtorId: req.session.user.id, [Op.or]: [{ status: 'unpaid' }, { status: 'pay_pending' }] }, order: [['updatedAt', 'DESC']] })
        const lents = await Debt.findAll({ where: { lenderId: req.session.user.id, status: 'unpaid' }, order: [['updatedAt', 'DESC']] })

        res.render('user/home', {
            path: '/',
            debts: debts,
            lents: lents
        })
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
}

module.exports.getAccount = async (req, res) => {
    try {
        const debtRequests = await Debt.findAll({ where: { [Op.or]: [{ debtorId: req.session.user.id, status: 'pending' }, { lenderId: req.session.user.id, status: 'pay_pending' }] }, order: [['id', 'DESC']] })

        res.render('user/account', {
            path: '/account',
            debtRequests: debtRequests
        })
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
}

module.exports.createDebt = async (req, res) => {
    let isFormValid = true
    let mateObjects = []

    if (req.body.formType !== 'debtor' && req.body.formType !== 'lender') isFormValid = false
    if (req.body.amount.trim() === '' || isNaN(req.body.amount) || req.body.amount.includes('e') || req.body.amount.includes('E')) isFormValid = false
    if (req.body.mates.length === 0) isFormValid = false

    if (!isFormValid) return res.status(401).send({ msg: 'Lütfen formu uygun şekilde doldurun.' })

    try {
        const mates = await User.findAll({ where: { id: req.body.mates }, attributes: ['name', 'id'] })
        mateObjects = mates

    } catch (err) {
        console.log(err)
        return res.status(500).send({ msg: 'Bir sorun oluştu, lütfen tekrar deneyin.' })
    }

    if (mateObjects.length === 0) return res.status(401).send({ msg: 'Lütfen formu uygun şekilde doldurun.' })

    if (req.body.formType === 'lender') {
        try {
            mateObjects.forEach(async m => {
                await Debt.create({
                    amount: parseFloat(req.body.amount),
                    status: 'pending',
                    lenderId: req.session.user.id,
                    debtorId: m.id
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).send({ msg: 'Bir sorun oluştu, lütfen tekrar deneyin.' })
        }
        res.status(200).send({ msg: 'Borç onay bekliyor.' })

    }

    if (req.body.formType === 'debtor') {
        try {
            mateObjects.forEach(async m => {
                await Debt.create({
                    amount: parseFloat(req.body.amount),
                    status: 'unpaid',
                    lenderId: m.id,
                    debtorId: req.session.user.id
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).send({ msg: 'Bir sorun oluştu, lütfen tekrar deneyin.' })
        }

        res.status(200).send({ msg: 'Borç eklendi.' })
    }
}

module.exports.payDebt = async (req, res) => {
    if (req.body.type !== 'debt' && req.body.type !== 'lent' || isNaN(req.body.id)) return res.status(400).send({ message: '>:(' })
    if (req.body.type === 'debt') {
        try {
            const debt = await Debt.findByPk(parseInt(req.body.id))
            if (debt.debtorId !== req.session.user.id) return res.status(400).send({ message: '>:(' })

            debt.status = 'pay_pending'
            await debt.save()
            return res.status(200).send({ message: ':)' })


        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: ':(' })
        }
    }

    if (req.body.type === 'lent') {
        try {
            const lent = await Debt.findByPk(parseInt(req.body.id))
            if (lent.lenderId !== req.session.user.id) return res.status(400).send({ message: '>:(' })

            lent.status = 'paid'
            await lent.save()
            return res.status(200).send({ message: ':)' })


        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: ':(' })
        }
    }
}

module.exports.approveRequest = async (req, res) => {
    if (req.body.type !== 'debt' && req.body.type !== 'delete' || isNaN(req.body.id)) return res.status(400).send({ message: '>:(' })
    if (req.body.type === 'debt') {
        try {
            const debt = await Debt.findByPk(parseInt(req.body.id))
            if (debt.debtorId !== req.session.user.id) return res.status(400).send({ message: '>:(' })

            debt.status = req.body.isConfirmed ? 'unpaid' : 'denied'
            await debt.save()
            return res.status(200).send({ message: req.body.isConfirmed ? 'Talep onaylandı.' : 'Talep silindi.' })


        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: ':(' })
        }
    }
    if (req.body.type === 'delete') {
        try {
            const debt = await Debt.findByPk(parseInt(req.body.id))
            if (debt.lenderId !== req.session.user.id) return res.status(400).send({ message: '>:(' })

            debt.status = req.body.isConfirmed ? 'paid' : 'unpaid'
            await debt.save()
            return res.status(200).send({ message: req.body.isConfirmed ? 'Talep onaylandı.' : 'Talep silindi.' })


        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: ':(' })
        }
    }
}

module.exports.changePassword = async (req, res) => {
    const match = await bcrypt.compare(req.body.currentPassword,req.session.user.password)
    if(!match) return res.status(400).send({message: 'Parola hatalı.'})
    if(req.body.newPassword !== req.body.newPasswordConfirm) return res.status(400).send({message: 'Parolalar eşleşmiyor.'})

    const encryptedPassword = await bcrypt.hash(req.body.newPassword,12)
    try {
        const user = await User.findByPk(req.session.user.id)
        user.password = encryptedPassword
        user.save()
    } catch (err) {
        console.log(err) 
        return res.status(500).send({message: 'Bir sorun oluştu, lütfen tekrar deneyin.'})
    }

    res.status(200).send({message: 'Şifre başarıyla değiştirildi.'})
}

module.exports.logout = (req, res) => {
    req.session.destroy(()=>{
        res.redirect('/login')
    })
}