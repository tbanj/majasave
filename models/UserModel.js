const mongoose = require("mongoose");

// root url which your project images will be located
const root = "https://s3.amazonaws.com/mybucket";
/**
 * Mongoose User schema which is a description/blueprint of how we want our data to look like
 */
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  is_admin: {
    type: Boolean
  },
  age: {
    type: Number,
    default: 0
  },
  secret_token: {
    type: String
  },

  is_active: {
    type: Boolean
  },

  gender: {
    type: String,
    enum: ["male", "female"],
  },

  position: {
    type: String,
  },

  income_range: {
    type: String,
    enum: ["0-100000", "100001-300000", "300000-700000"],
    default: "0-100000"
  },

  user_status: {
    type: String,
    enum: ["single", "married", "divorce", "widowed"],
    default: "single"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  referral_code: {
    type: String,
    default: null
  },
  referer_token: {
    type: String,
    required: true
  },
  audience_from_id: {
    type: Number
  },
  user_image: {
    type: String,
    get: v => `${root}${v}`
  },

  created_date: {
    type: Date
  },

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
const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
