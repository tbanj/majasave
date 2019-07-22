const joi = require('joi');
exports.VerifyAccountPayValidator = {
  amount: joi.string().required(),
  reference: joi.string().required(),
  package_name: joi.string().required,
  saving_term: joi.string().required(),
  currency: joi.string().default({currency:"NGN"}),
  // account_type: joi.string().default()
  
};
