const joi = require('joi');

/**
 * Joi Validation schema for validating requests  for leaves.
 */
exports.CreateAccountValidator = {
  account_name: joi.string().required(),
  account_num: joi.number().required(),
  bank_name: joi.string().required(),
  
};


