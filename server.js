const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
require("./config/passport");
const cors = require("cors");
const dotenv = require("dotenv").config();
const UserRoute = require("./routes/UserRoute");
const AccountRoute = require("./routes/AccountRoute");
const MiscRoute = require("./routes/MiscRoute");
const env = require("./env");
const app = express();

// Connect to MongoDB
mongoose
  .connect(env.mongodb_url, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    console.log("🚌 Successfully connected to MongoDB");
  })
  .catch(err => {
    console.log("An error occured while conencting to MongoDB", err);
  });

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// Logger middleware
app.use((req, res, next) => {
  console.log(
    `🔥🍕[${new Date().toTimeString()}]: ${req.method} ${req.url}🔥🍕`
  );
  next();
});

// Add middlewares for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/user", UserRoute);

app.use("/account", AccountRoute);
app.use("/misc", MiscRoute);

app.listen(env.port).on("listening", () => {
  console.log("🚀 We are live on " + env.port);
});
