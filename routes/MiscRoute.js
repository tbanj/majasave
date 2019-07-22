const express = require("express");
const axios = require("axios");
const AudienceFromModel = require("../models/AudienceFromModel");
const AuthMiddleware = require("../middlewares/auth");

const JoiValidator = require("../middlewares/validator");
const {
  AudienceFromValidator
} = require("../validators/AudienceFromValidator");
const env = require("../env");

const router = express.Router();

// Sign up a user
router.post(
  "/audience-from",

  JoiValidator(AudienceFromValidator),
  AuthMiddleware,
  async function(req, res) {
    try {
      // Checking if audience is already inputted
      const checkAudience = await AudienceFromModel.findOne({
        name: req.body.name
      });
      if (checkAudience) {
        console.log(checkAudience);

        res.status(201).json({
          status: "402",
          message: "referral name already exist"
        });

        return;
      }

      // Add audience name to the list
      const audience = await AudienceFromModel.create({
        ...req.body
      });
      const result = audience.toJSON();
      // console.log(result.user_image);
      // delete result.password;

      // delete result.secret_token;
      // delete result.is_active;
      res.status(200).json({
        status: "success",
        data: { audience: result }
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        status: "error",
        message: "An error occured while creating your account 😭"
      });
    }
  }
);

// Get all users
router.get("/get-audiences", async function(req, res) {
  try {
    // const search = req.query.name ? { name: req.query.name } : {};
    // console.log(search);
    const audiences = await AudienceFromModel.find({});
    res.json({
      status: "succcess",
      data: audiences
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "An error occured while getting user's"
    });
  }
});

module.exports = router;
