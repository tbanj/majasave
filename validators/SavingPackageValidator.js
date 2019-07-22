const joi = require('joi');
exports.SavingPackageValidator = {
  amount: joi.string().required(),
  package_name: joi.string().required(),
  confirm: joi.string().default(),
  saving_term: joi.string().required(),
  currency: joi.string().default({currency:"NGN"}),
  duration: joi.string().required()
  
};
