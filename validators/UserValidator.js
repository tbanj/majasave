const joi = require("joi");
exports.CreateUserValidator = {
  first_name: joi.string().required(),
  last_name: joi.string().required(),
  audience_from: joi.string().required(),
  referral_code: joi.string().default(),
  email: joi
    .string()
    .email({ minDomainSegments: 2 })
    .required(),
  user_image: joi.string().default(),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  is_admin: joi.boolean().default(),
  is_active: joi.boolean().default(),
  secret_token: joi.string().default()
};
