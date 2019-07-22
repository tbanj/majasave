const joi = require('joi');
exports.SavingValidator = {
  account_number: joi.string().required(),
  bank_name: joi.string().required()
};
