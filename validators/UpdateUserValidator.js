const joi = require("joi");
exports.UpdateUserValidator = {
  gender: joi.string().required(),
  age: joi.number().required(),
  income_range: joi.string().required(),
  user_status: joi.string().required()
};
