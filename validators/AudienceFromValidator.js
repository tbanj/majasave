const joi = require("joi");

/**
 * Joi Validation schema for validating requests  for leaves.
 */
exports.AudienceFromValidator = {
  // val: joi.object().keys({
  //   type: joi
  //     .string()
  //     .valid(
  //       "twitter",
  //       "facebook",
  //       "instagram",
  //       "relation",
  //       "friend",
  //       "search engine",
  //       "online blog",
  //       "other"
  //     )
  // }),
  val: joi
    .string()
    .valid(
      "twitter",
      "facebook",
      "instagram",
      "relation",
      "friend",
      "gsearch",
      "blog",
      "other"
    )
    .required(),
  name: joi.string().required()
};
