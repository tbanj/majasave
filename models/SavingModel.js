const mongoose = require('mongoose');

/**
 * Mongoose Account schema which is a description/blueprint of how we want our data to look like
 */
const SavingSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    accounts: {
        type: Array
    }
});

// Model which provides us with an interface for interacting with our data
const SavingModel = mongoose.model('Saving', SavingSchema);

module.exports = SavingModel;
