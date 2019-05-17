const joi = require('joi');

/**
 * Validation middleware that uses joi to validate the request body.
 * @param schema Joi schema to use to validate the request body
 */
module.exports = function JoiValidator(schema) {
  return async (req, res, next) => {
    try {
      const result = await joi.validate(req.body, schema, {
        abortEarly: false,
      });
      next();
    } catch (err) {
      const errorDetails = err.details.map(e => e.message);
      res.status(422).json({
        status: 'error',
        message: 'Some validation errors occured',
        errors: errorDetails,
      });
    }
  };
};
