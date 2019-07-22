const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    paystack_reference: {
        type: String,
        required: true,
    },
    transaction_date: {
        type: String,
        required: true,
    },
    package_type: {
        type: String
    },
    
    amount_invested: {
        type: Number,
    },
    
      safe_lock: {
        type: String,
        default: "pass123"
      },
    start_date : {
        type: Date,
    },
    end_date :{
        type: Date
    }
});


// Model which provides us with an interface for interacting with our data
const  TransactionModel = mongoose.model(' TransactionModel',  TransactionSchema)
module.exports = TransactionModel;
