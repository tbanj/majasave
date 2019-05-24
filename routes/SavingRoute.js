const express = require('express');
const router = express.Router();
const SavingModel = require('../models/SavingModel');


router.post('/create', async function (req, res) {
    try {
        const account = await SavingModel.create({
            ...req.body,
            accounts: [
                {
                    accountType: 'saving',
                    balanace: 0.00,
                    createdAt: new Date()
                },
                {
                    accountType: 'current',
                    balanace: 0.00,
                    createdAt: new Date()
                }
            ]
        })
        res.status(201).json({status: 'success', data: account})
    } catch (error) {
       res.status(500).json({status: 'error', message: 'server error occured'}) 
    }
})
router.post('/fund-account', async function (req, res) {
    try {
        const user = await SavingModel.findById('5ce70e7120e1133d6c0d14d5');
        const savingAccount = user.accounts[0].balanace;
        const account = await SavingModel.findByIdAndUpdate('5ce70e7120e1133d6c0d14d5', {
            accounts: [
                {
                    accountType: 'saving',
                    balanace:savingAccount+ req.body.amount,
                    createdAt: new Date()
                },
            ]
        }, {new: true})
        res.status(201).json({status: 'success', data: account})
    } catch (error) {
       res.status(500).json({status: 'error', message: 'server error occured'}) 
    }
})


module.exports = router;