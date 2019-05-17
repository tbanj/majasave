const mongoose = require('mongoose');

/**
 * Mongoose Account schema which is a description/blueprint of how we want our data to look like
 */
const AccountSchema = new mongoose.Schema({
  account_num: {
    type: Number,
    required: true,
  },
  account_name: {
    type: String,
    required: true,
  },

  bank_name: {
    type: String,
    required: true,
  },

  current_balance: {
    type: Number,
  },

  created_date: {
    type: Date,
  },

  updated_date: {
    type: Date,
  },
  success_alert: {
    type: Number,
  },

  target_saving: {
    type: Number,
  },
  
  safe_lock: {
    type: Number,
  },
  majasave_flex: {
    type: Number,
  },
});

// Model which provides us with an interface for interacting with our data
const AccountModel = mongoose.model('Account', AccountSchema);

module.exports = AccountModel;
