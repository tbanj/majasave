const express = require('express');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const randomstring = require('randomstring');
const passport = require('passport');
const AuthMiddleware = require('../middlewares/auth');
const JoiValidator = require('../middlewares/validator');
const { CreateUserValidator } = require('../validators/UserValidator');
const { AdminUserValidator } = require('../validators/AdminUserValidation');
const env = require('../env');
const router = express.Router();


// Authorization 
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('error:' + 'Sorry, but you must be registered first !');
    res.redirect('/');
  }
};

const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('error' + 'Sorry, but you are already logged in!');

    res.redirect('user/signin');
  } else {
    return next();
  }
};


// Sign up a user
router.post('/',
  JoiValidator(CreateUserValidator),
  async function (req, res) {
    try {

      // Checking if email is already taken
      const checkUser = await UserModel.findOne({ 'email': req.body.email.trim() });
      if (checkUser) {
        console.log(checkUser);

        if (checkUser !== null && checkUser.is_active === false) {
          // Compose email
          sgMail.setApiKey(env.sendgrid_api_key);
          const msg = {
            to: checkUser.email,
            from: 'info@majasave.com',
            subject: 'Verify your majasave account',
            text: 'and easy to do anywhere, even with Node.js',
            text: `Hi ${req.body.first_name},
          Thank you for registering!
          Please verify your email by typing the following token:
          Token: ${checkUser.secret_token}
          On the following page: http://localhost:3000/user/verify
          Have a pleasant day.`,
            html: `<p>Hi ${req.body.first_name},
            Thank you for registering!
            Please verify your email by typing the following token:<br>
            Token id: <strong> ${checkUser.secret_token}</strong> <br>
            On the following page: http://localhost:3000/user/verify
            Have a pleasant day.</p>`,
          };
          sgMail.send(msg);
          res.status(400).json({
            status: '400',
            message: 'email already exist check your email to verify',
            url: '/user/verify',
          })
        }
        else {
          res.status(400).json({
            status: '400',
            message: 'email already exist, you have already verified please login',
            url: '/signin',
          });
        }

        return true;
      }

      req.body.password = await bcrypt.hash(req.body.password, 10);

      //step1 activate user Generate secret token
      const secretToken = randomstring.generate();
      //step1 activate user Generate secret token
      const refererToken = randomstring.generate(7);
      // Save secret token Is_active to the DB
      const user = await UserModel.create({
        ...req.body,
        secret_token: secretToken,
        referer_token: refererToken,
        is_admin: false,
        is_active: false
      });
      const result = user.toJSON();
      console.log(result.user_image);
      delete result.password;



      const token = jwt.sign({ id: user.id }, env.jwt_secret, {
        expiresIn: '1h',
      });

      // Compose email
      sgMail.setApiKey(env.sendgrid_api_key);
      const msg = {
        to: req.body.email,
        from: 'info@majasave.com',
        subject: 'Verify your majasave account',
        text: 'and easy to do anywhere, even with Node.js',
        text: `Hi ${req.body.first_name},
      Thank you for registering!
      Please verify your email by typing the following token:
      Token: ${result.secret_token}
      On the following page: http://localhost:3000/user/verify
      Have a pleasant day.`,
        html: `<p>Hi ${req.body.first_name},
        Thank you for registering!<br>
        Please verify your email by typing the following token:
        Token: <strong>${result.secret_token}</strong><br>
        On the following page: http://localhost:3000/user/verify
        Have a pleasant day.</p>`,
      };
      sgMail.send(msg);

      delete result.secret_token;
      delete result.is_active;
      res.status(201).json({
        status: 'success',
        data: { user: result, token },
        url: '/user/verify',
        message: 'Registration successful, please check your mail to verify account',

      });


    } catch (err) {
      console.log(err);

      res.status(500).json({
        status: 'error',
        message: 'An error occured while creating your account 😭',
      });
    }
  });

/* 
   check if user exist
   if it does send email to the user with router which he will call to add password to his account
  create a router to call to add password to the existing record
*/
router.post('/forget-password', async (req, res) => {
  try {
    const user = await UserModel.findOne({ 'email': req.body.email.trim() });
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'you dont have an account with us, kindly register'
      });
      return;
    }

    // Compose email
    sgMail.setApiKey(env.sendgrid_api_key);
    const msg = {
      to: req.body.email,
      from: 'info@majasave.com',
      subject: 'Verify your majasave account',
      text: `Hi ${user.first_name},
      You need to set new password before you can login!
      Click the link below to create a new password
      http://localhost:3000/user/create-password?email=${userUpdate.email}&&secret_token=${user.secret_token}
      to proceed.`,
      html: `<p>Hi ${user.first_name},
        TYou need to set new password before you can login!<br>
        Click the link below to create a new password:<br>
        Copy or click on this link: http://localhost:3000/user/create-password?email=${userUpdate.email}
        to proceed.</p>`,
    };
    sgMail.send(msg);

    const token = jwt.sign({ id: user.id }, env.jwt_secret, {
      expiresIn: '1h',
    });
    const resetInfo = 'user found, mail on how to reset your account has been sent to you';
    res.status(200).json({
      status: 'success',
      data: { resetInfo, token }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'server error encounter while confirming your records'
    });

  }
});

router.post('/create-password', AuthMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findOne({ 'email': req.query.email }, '+password');


    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'detail inputted not correct'
      })
      return;
    }

    const isValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log(isValid);
    if (isValid) {
      res.status(404).json({
        status: 'error',
        message: 'input a stronger password'
      });
      return;
      console.log('ji');

    }

    req.body.password = await bcrypt.hash(req.body.password, 10);
    // req.body.password = await bcrypt.hash(req.body.password, 10);
    const token = jwt.sign({ id: user.id }, env.jwt_secret);
    const userUpdate = await UserModel.findByIdAndUpdate(
      { '_id': user._id },
      { ...req.body }
    );

    const userDisp = userUpdate.toJSON();
    delete userDisp.password;
    delete userDisp.secret_token;
    res.status(200).json({
      status: 'success',
      data: userDisp
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'server error encounter while confirming your records'
    })
  }
});




// admin signup
router.post('/admin',
  JoiValidator(AdminUserValidator),
  async function (req, res) {
    try {
      if (req.body.admin_key) {
        if (req.body.admin_key !== env.admin_key) {
          res.status(404).json({ status: 'error', message: 'you are not an admin' })
          return;
        }


        // Checking if email is already taken
        const checkUser = await UserModel.findOne({ 'email': req.body.email.trim() });
        if (checkUser) {
          console.log(checkUser);

          if ((checkUser !== null && checkUser.is_active === false)) {
            // Compose email
            sgMail.setApiKey(env.sendgrid_api_key);
            const msg = {
              to: checkUser.email,
              from: 'info@majasave.com',
              subject: 'Verify your majasave account',
              text: 'and easy to do anywhere, even with Node.js',
              text: `Hi ${req.body.first_name},
              Thank you for registering!
              Please verify your email by typing the following token:
              Token: ${checkUser.secret_token}
              On the following page: http://localhost:3000/user/verify
              Have a pleasant day.`,
              html: `<p>Hi ${req.body.first_name},
              Thank you for registering!
              Please verify your email by typing the following token:<br>
              Token id: <strong> ${checkUser.secret_token}</strong> <br>
              On the following page: http://localhost:3000/user/verify
              Have a pleasant day.</p>`,
            };
            sgMail.send(msg);
            // res.redirect(301, 'http://localhost:3000/user/verify');
            res.status(200).json({
              status: 'success',
              message: 'email already exist check your email to verify',
              url: '/user/verify',
            });

          }
          else if ((checkUser !== null && checkUser.is_active === true)) {
            res.status(202).json({
              status: 'success',
              message: 'email already exist, you have already verified please login',
              url: '/signin',
            });
            // res.redirect('http://localhost:3000/user/verify');
          }

          return;
        }

        req.body.password = await bcrypt.hash(req.body.password, 10);

        //step1 activate user Generate secret token
        const secretToken = randomstring.generate();
        //step1 activate user Generate secret token
        const refererToken = randomstring.generate(7);
        // Save secret token Is_active to the DB
        const user = await UserModel.create({
          ...req.body,
          secret_token: secretToken,
          referer_token: refererToken,
          is_admin: true,
          is_active: false
        });
        const result = user.toJSON();
        console.log(result.user_image);
        delete result.password;



        const token = jwt.sign({ id: user.id }, env.jwt_secret, {
          expiresIn: '1h',
        });

        // Compose email
        sgMail.setApiKey(env.sendgrid_api_key);
        const msg = {
          to: req.body.email,
          from: 'info@majasave.com',
          subject: 'Verify your majasave account',
          text: 'and easy to do anywhere, even with Node.js',
          text: `Hi ${req.body.first_name},
          Thank you for registering!
          Please verify your email by typing the following token:
          Token: ${result.secret_token}
          On the following page: http://localhost:3000/user/verify
          Have a pleasant day.`,
          html: `<p>Hi ${req.body.first_name},
          Thank you for registering!<br>
          Please verify your email by typing the following token:
          Token: <strong>${result.secret_token}</strong><br>
          On the following page: http://localhost:3000/user/verify
          Have a pleasant day.</p>`,
        };
        sgMail.send(msg);

        delete result.secret_token;
        delete result.is_active;
        res.status(201).json({
          status: 'success',
          message: 'Registration successful, please check your mail to verify',
          url: '/user/verify',
          data: { user: result, token },
        });
        // res.redirect('http://localhost:3000/verify');
      }



    } catch (err) {
      console.log(err);

      res.status(500).json({
        status: 'error',
        message: 'An error occured while creating your account 😭',
      });
    }
  });


// Get's a user's profile
router.get('/profile', AuthMiddleware, async function (req, res) {
  try {
    console.log(req.user);
    const user = await UserModel.findById(req.user);
    const result = user.toJSON();
    delete result.password;
    delete result.secret_token;
    delete result.is_active;

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.log(err);

    res.status(401).json({ status: 'error', message: err.message });
  }
});
// user signin
router.post('/signin', async function (req, res, next) {
  passport.authenticate('local', (e, user, message) => {
    if (e) return next(e);
    if (message) {
      console.log(message);

      // Compose email
      UserModel.findOne({ 'email': req.body.email })
        .then(response => {
          const checkUser = response;
          console.log(typeof checkUser.secret_token);

          if (checkUser.secret_token.length > 1) {
            res.status(404).json({
              status: 'error',
              message: `account has not being verified earlier check your email for code`,
              url: '/verify'
            })
            return;
          }


        })
      // catch(error => {
      //   console.log(error);
      // });
      //  res.send(info);
      res.status(404).json({
        status: 'error',
        message: message,

      });
      return;
    }
    req.logIn(user, e => {
      if (e) return next(e);

      const token = jwt.sign({ id: user.id }, env.jwt_secret);
      const result = user.toJSON();
      delete result.password;
      delete result.secret_token;
      delete result.is_active;
      return res.send({ status: 'success', message: `Hi ${result.first_name} ${result.last_name}`, url: '/dashboard', data: { token, result } });
    });
  })(req, res, next);
});

router.post('/verify', async function (req, res, next) {
  try {
    const { secret_token } = req.body;
    if (typeof secret_token !== 'string') {
      res.status(404).json({
        status: 'error',
        message: 'variable type not acceptable. 😭',
      });
      return;
    }
    // Find account with matching secret token
    const user = await UserModel.findOne({ 'secret_token': secret_token.trim() });
    if (!user) {
      // res.redirect('/user/verify');
      res.status(404).json({
        status: 'error',
        message: 'No user found for that record. 😭',

      });
      return;
    }
    if (user.is_active === true) {

      // res.redirect('/user/signin');
      res.status(201).json({
        status: 'success',
        message: 'account has already being verified. 😭',
        url: '/signin'
      });

      return;
    }

    //  step 2
    user.is_active = true;
    user.secret_token = '';
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'user found, account has been verified . 😭',
      url: '/signin'
    });
    ;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'An error occured while updating the user 😭',
    });
    // next(error);
  }
});



// Update a user
router.put('/:email', AuthMiddleware, async function (req, res) {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );


    // Check if the user was found and updated
    if (!updatedUser) {
      res.status(404).json({
        status: 'error',
        message: 'Sorry that user does not exist 😭',
      });
    }

    res.json({
      status: 'success',
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: 'error',
      message: 'An error occured while updating the user 😭',
    });
  }
});


// Delete a user
router.delete('/:email', AuthMiddleware, async function (req, res) {
  try {
    const deletedUser = await UserModel.findOneAndDelete({
      email: req.params.email,
    });

    if (!deletedUser) {
      res.status(404).json({
        status: 'error',
        message: 'Sorry you cannot delete a user that does not exist',
      });
      return;
    }

    res.json({
      status: 'success',
      message: '👋🏿 successfully deleted user',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'An error occured while deleting the user',
    });
  }
});


// Get a user by email
router.get('/:email', AuthMiddleware, async function (req, res) {
  try {
    const user = await UserModel.findOne({ email: req.params.email });

    // Check if a user was found
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'The user was not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: 'error',
      message: 'An error occured while getting the user 😭',
    });
  }
});

// Get all users
router.get('', AuthMiddleware, async function (req, res) {
  try {
    const search = req.query.gender ? { gender: req.query.gender } : {};

    const users = await UserModel.find(search);
    res.json({
      status: 'succcess',
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: "An error occured while getting user's",
    });
  }
});

module.exports = router;
