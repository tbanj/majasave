const mongoose = require('mongoose');

/**
 * Mongoose User schema which is a description/blueprint of how we want our data to look like
 */
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Boolean,
  },
  age: {
    type: Number,
    required: true,
  },
  secret_token: { 
    type: String},

    is_active: {
      type: Boolean},

  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },

  income_range: {
    type: String,
    enum: ["0-100000","100001-300000","300000-700000"],
    required: true,
  },

  user_status: {
    type: String,
    enum: ['single', 'married','divorce','widowed'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  user_image: {
    type: String,
  },
});

// Model which provides us with an interface for interacting with our data
const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
