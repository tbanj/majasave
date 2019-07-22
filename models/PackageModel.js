const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    package_name: {
        type: String,
        required: true,
    },
    rate: {
        type: String,
        enum: ['0.01','0.02','0.03','0.04','0.05','0.06','0.07','0.08','0.09','0.11','0.12','0.10','0.13','0.14',],
        default: '0.01'
    },
    duration: {
        type: Date,
        required: true,
    }, 
    saving_term: {
        type: String,
        enum: ['monthly', 'quaterly','yearly'],
        default: 'monthly'
    },
    created_date: {
        type: Date
    }

});

// Model which provides us with an interface for interacting with our data
const  PackageModel = mongoose.model('Package',  PackageSchema);


module.exports = PackageModel;