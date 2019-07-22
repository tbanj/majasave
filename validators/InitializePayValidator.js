const joi = require('joi');
exports.InitializePayValidator = {
  amount: joi.string().required(),
  // currency: joi.string().required(),
  // rate: joi.object().required(),
  email: joi.string().required(),
  currency: joi.string().default({currency:"NGN"}),
  // account_type: joi.string().default()
  
};
