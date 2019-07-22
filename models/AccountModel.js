const mongoose = require('mongoose');

/**
 * Mongoose Account schema which is a description/blueprint of how we want our data to look like
 */
const AccountSchema = new mongoose.Schema({
  payment_transaction: {
    type: String,

  },
  user: {
    // The user ID
    type: String,
    required: true,
  },
 
  updated_by: {
    type:String,
    default: null
  },
  created_by: {
    type: String,
  },
});

// Model which provides us with an interface for interacting with our data
const AccountModel = mongoose.model('Account', AccountSchema);

module.exports = AccountModel;
