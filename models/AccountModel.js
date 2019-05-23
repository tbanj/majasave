const mongoose = require('mongoose');

/**
 * Mongoose Account schema which is a description/blueprint of how we want our data to look like
 */
const AccountSchema = new mongoose.Schema({
  account_number: {
    type: String,
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
    default: 0
  },

  created_date: {
    type: Date,
  },

  updated_date: {
    type: Date,
    default: null
  },
  updated_by: {
    type:String,
    default: null
  },
  created_by: {
    type: String,
  },
  success_alert: {
    type: Number,
  },

  target_saving: {
    type: Number,
  },

  user: {
    // The user ID
    type: String,
    required: true,
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
