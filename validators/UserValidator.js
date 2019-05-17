const joi = require('joi');

/**
 * Joi Validation schema for validating requests  for leaves.
 */
exports.CreateUserValidator = {
  first_name: joi.string().required(),
  last_name: joi.string().required(),
  gender: joi.string().required(),
  age: joi.number().required(),
  income_range: joi.string().required(),
  user_status: joi.string().required(),
  email: joi.string().email({minDomainSegments: 2 }).required(),
  user_image: joi.string().default(),
  password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  is_admin: joi.boolean().default(),
  is_active: joi.boolean().default(),
  secret_token: joi.string().default(),
  
};
