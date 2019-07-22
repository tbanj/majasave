const mongoose = require("mongoose");

// root url which your project images will be located
const root = "https://s3.amazonaws.com/mybucket";
/**
 * Mongoose User schema which is a description/blueprint of how we want our data to look like
 */
const AudienceFromSchema = new mongoose.Schema({
  val: {
    type: String,
    enum: [
      "twitter",
      "facebook",
      "instagram",
      "relation",
      "friend",
      "gsearch",
      "blog",
      "other"
    ],
    default: "twitter"
  },

  name: {
    type: String,
    required: true
  },

  // created_date: {
  //   type: Date
  // },

  updated_date: {
    type: Date,
    default: null
  },
  updated_by: {
    type: String,
    default: null
  }
});

// Model which provides us with an interface for interacting with our data
const AudienceFromModel = mongoose.model("audience_from", AudienceFromSchema);

module.exports = AudienceFromModel;
