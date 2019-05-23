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
const env = require('../env');
const router = express.Router();


// Authorization 
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('error:'+ 'Sorry, but you must be registered first !');
    
    res.redirect('/');
  }
};

const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('error'+ 'Sorry, but you are already logged in!');
    
    res.redirect('user/signin');
  } else {
    return next();
  }
};





// Sign up a user
router.post('/', 
JoiValidator(CreateUserValidator),
async function(req, res) {
  try {
    
    // Checking if email is already taken
    const checkUser = await UserModel.findOne({ 'email': req.body.email });
    if (checkUser) {
      console.log(checkUser);
      
      if(checkUser !== null && checkUser.is_active === false){
        // Compose email
        sgMail.setApiKey(env.sendgrid_api_key);
        const msg = {
          to: checkUser.email,
          from: 'info@majasave.com',
          subject: 'Verify your majasave account sendgrid',
          text: 'and easy to do anywhere, even with Node.js',
          text: `Hi ${req.body.first_name},
          Thank you for registering!
          Please verify your email by typing the following token:
          Token: ${result.secret_token}
          On the following page: http://localhost:3000/user/verify
          Have a pleasant day.`,
          html: `<p>Hi ${req.body.first_name},
            Thank you for registering!
            Please verify your email by typing the following token:<br>
            Token id: <strong> ${result.secret_token}</strong> <br>
            On the following page: http://localhost:3000/user/verify
            Have a pleasant day.</p>`,
        };
        sgMail.send(msg);
        
        

        res.status(201).json({
          status: '402', 
          message: 'email already exist check your email to verify',
          
        })
      }
      else {res.status(203).json({
        status: 'success', 
        message: 'email already exist, you have already verified please login',
      });}
      
      return true;
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);

    //step1 activate user Generate secret token
    const secretToken = randomstring.generate();
    // Save secret token Is_active to the DB
    const user = await UserModel.create({
      ...req.body,
        secret_token: secretToken,
        is_active: false});

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
      subject: 'Verify your majasave account sendgrid',
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


    res.status(200).json({
      status: 'success',
      data: { user: result, token },
    });


  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: 'error',
      message: 'An error occured while creating your account 😭',
    });

     
  }
});







// admin signup
router.post('/', AuthMiddleware,async function(req, res) {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    
    const user = await UserModel.create(req.body);
    const result = user.toJSON();
    
    delete result.password;

    const token = jwt.sign({ id: user.id }, env.jwt_secret, {
      expiresIn: '1h',
    });

    res.status(200).json({
      status: 'success',
      data: { user: result, token },
    });
  } catch (err) {
    console.log(err);



    res.status(500).json({
      status: 'error',
      message: 'An error occured while creating your account 😭',
    });
  }
});

// Get's a user's profile
router.get('/profile', AuthMiddleware, async function(req, res) {
  try {
    console.log(req.user);
    const user = await UserModel.findById(req.user);
    const result = user.toJSON();
    
    delete result.password;
    delete result.secret_token;

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.log(err);

    res.status(401).json({ status: 'error', message: err.message });
  }
});

// Post investment amount for savings plan
router.get('/savings-packages', AuthMiddleware, async function(req, res) {
  try {
    console.log(req.header);
    
    const user = await UserModel.findById(req.user);
    const result = user.toJSON();
    
    delete result.password;
    delete result.secret_token;

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.log(err);

    res.status(401).json({ status: 'error', message: err.message });
  }
});

// user signin
router.post('/signin', async function (req, res, next) {

  passport.authenticate('local', (e, user, info) => {
      if(e) return next(e);
      if(info) {
       // Compose email
          UserModel.findOne({ 'email': req.body.email })
                              .then(response=>{
                                const checkUser = response;
                                console.log(checkUser.secret_token);
                                sgMail.setApiKey(env.sendgrid_api_key);
                                const msg = {
                                  to: req.body.email,
                                  from: 'info@majasave.com',
                                  subject: 'Verify your majasave account sendgrid',
                                  text: 'and easy to do anywhere, even with Node.js',
                                  text: `Hi ${checkUser.first_name},
                                  Thank you for registering!
                                  Please verify your email by typing the following token:
                                  Token: ${checkUser.secret_token}
                                  On the following page: http://localhost:3000/user/verify
                                  Have a pleasant day.`,
                                  html: `<p>Hi ${checkUser.first_name},
                                    Thank you for registering!<br>
                                    Please verify your email by typing the following token:
                                    Token: <strong>${checkUser.secret_token}</strong><br>
                                    On the following page: http://localhost:3000/user/verify
                                    Have a pleasant day.</p>`,
                                };
                                    sgMail.send(msg);
                              }).
                              catch(error=>{console.log(error);
                              });
          
          
       
       return res.send(info);
      }
      req.logIn(user, e => {
          if(e) return next(e);
          const token = jwt.sign({ id: user.id }, env.jwt_secret);
          const result = user.toJSON();
          delete result.password;
          delete result.secret_token;
          return res.send({ status: 'success', data: { token, result } });
      });
  })(req, res, next);
});



router.post('/verify', async function(req, res, next) {
  try {
    const { secret_token } = req.body;

    // Find account with matching secret token
    const user =  await UserModel.findOne({ 'secret_token': secret_token });
    if (!user) {
      // res.redirect('/user/verify');
      res.status(404).json({
        status: 'error',
        message: 'No user found for that record. 😭',
      });
      return;
    }
    if(user.is_active === true) {
      req.flash('success', 'account has already being verified');
      // res.redirect('/user/signin');
      res.status(201).json({
        status: 'success',
        message: 'account has already being verified. 😭',
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
    });
;
  } catch(error) {
    console.log(error);
    res.status(500).json({
              status: 'error',
              message: 'An error occured while updating the user 😭',
            });
    // next(error);
  }
});


// router.get('/dashboard', AuthMiddleware, async function(req, res) {
//   // try {
//   //   console.log('how are you');
    
//   //   // res.status(200).json({
//   //   //   status: 'error',
//   //   //   message: 'An error occured while updating the user 😭',
//   //   // });
//   // } catch (error) {console.log(error);
//   // }
//   console.log('how are you');
// })


// Update a user
router.put('/:email', AuthMiddleware, async function(req, res) {
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
router.delete('/:email', AuthMiddleware, async function(req, res) {
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
router.get('/:email', AuthMiddleware,async function(req, res) {
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
router.get('', AuthMiddleware, async function(req, res) {
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
