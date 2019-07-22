const joi = require('joi');

/**
 * Joi Validation schema for validating requests  for leaves.
 */
exports.WithdrawalValidator = {
  
  account_number: joi.string().required(),
  bank_name: joi.string().required(),
  account_name: joi.string().required(),

  // user: joi.string().default(),
  // majasave_flex: joi.number().default(),
  // safe_lock: joi.number().default(),
  // success_alert: joi.number().default(),
  // target_saving: joi.number().default(),
  // created_by: joi.string().default(),
  // updated_by: joi.string().default(),
  // created_date: joi.date().default(),
  // updated_date: joi.date().default(),
  // current_balance: joi.number().default(),
  // account_name: joi.string().default(),
  
};


