const joi = require('joi');
exports.PaymentValidator = {
  amount: joi.string().required(),
  // currency: joi.string().required(),
  rate: joi.string().required,
  email: joi.string().required(),
  currency: joi.string().default({currency:"NGN"}),
  // account_type: joi.string().default()
  
};
