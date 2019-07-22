const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({

    bank_name: {
        type: String,
        required: true,
    },
    account_number: {
        type: String,
        required: true,
    },
    package_type: {
        type: String,
    },
    account_name: {
        type: String,
        required: true,
    },
    created_date: {
        type: Date,
    },
    updated_date: {
        type: Date,
        default: null
    },
    withdrawal_amount: {
        type: Number,
        default: 0
    }

})

// Model which provides us with an interface for interacting with our data
const WithdrawalModel = mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = WithdrawalModel;