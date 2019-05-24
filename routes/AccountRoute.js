const express = require('express');
const jwt = require('jsonwebtoken');
const AccountModel = require('../models/AccountModel');
const axios = require('axios');
const env = require('../env')
const AuthMiddleware = require('../middlewares/auth');
const JoiValidator = require('../middlewares/validator');
const { CreateAccountValidator } = require('../validators/AccountValidator');
const router = express.Router();
const adminKey = 'LevelUp'
// Create an Majasave Account for User 
router.post(
  '/',
  AuthMiddleware,
  JoiValidator(CreateAccountValidator),
  async function(req, res) {
    try {
      const account = await AccountModel.create({
        // using spread operator 
        ...req.body,
        created_date: new Date(),
        user: req.user,
        
      });
      res.json({ status: 'success', data: account });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: '🤦🏾 an error occured while creating your account',
      });
      console.error(err);
    }
  }
);

// verification of account number step1
router.post('/verify_account',AuthMiddleware, async function (req, res){
  try {
    // use set
  detail_code =new Set();
  const verify_info = await axios.get('https://api.paystack.co/bank')
    .then(function (response) { 
          const verify_detail =response.data.data;
          // return verify_detail;
          verify_detail.forEach(data => {
            detail_code.add({bank_name: data['name'], slug: data['slug'], code: data['code']});
      
            var check_account;
            if(req.body.bank_name===data['slug']) {
              console.log(`bank code is ${data['code']} and bank name ${data['name']}`);
              const user_bank_code= data['code'];
              console.log(user_bank_code);
      
              
              bank_detail_confirm = axios.get(`https://api.paystack.co/bank/resolve?account_number=${req.body.account_number}&bank_code=${data['code']}`, 
              {headers: {Authorization:`Bearer ${env.paystack_secret_key}`}})
              .then(async function (response){
                check_account = await response.data;
                 return check_account;
      
                })
              .catch(async function(error) {
                    check_account = await error.response.data;
                    res.status(422).json({
                      status: 'error',
                      message: check_account,
                    });
                    console.error(error.response.data);
                    return false;
              })
            }
      
          });
      })
      .catch(error=> console.log(error));
      error_bank_detail_confirm = await bank_detail_confirm;
      if(error_bank_detail_confirm === false){
        console.log('it cant proceed further due to account number not verifiable');
        return;
      }
      bank_detail_confirm.then(async function(result) { 
      const accountdl = await AccountModel.findOne({'account_number': req.body.account_number});
      if (accountdl) {
          console.log('new user');
            res.status(203).json({
            status: 'success', 
            message: 'account verification has been earlier completed',
          });
          return true;
      } 
  
      const new_account= await AccountModel.create({
        // using spread operator 
        ...req.body,
        account_number: result.data.account_number,
        account_name: result.data.account_name,
        bank_name: req.body.bank_name,
        package_type: [
          { account_type: 'quicksave',
              current_balance: 0,
              rate: [{junior: 0.05, senior: 0.01}],
              duration: [{option_a: 'monthly',option_b: 'yearly'}],
              created_date: new Date(),
            },
          {  account_type: 'majaflex',
              current_balance: 0,
              rate: [{junior: 0.10, senior: 0.12}],
              duration: [{option_a: 'monthly',option_b: 'yearly'}],
              created_date: new Date()
          }],
        created_date: new Date(),
        user: req.user,
        
      });
      res.status(201).json({ 
        status: 'success', 
        account_verify: result, 
        data: new_account });
      
       }).catch(error=>{console.log(error)});
  } catch (error) {
      res.status(500).json({ 
      status: 'success', 
      account_verify:  `server error`, 
      data: new_account });
      console.error(error);
  }
  
}); 

        // step 2 
router.post('/quicksave', AuthMiddleware, async (req, res) =>{
      try {
        const user_data = {
          amount: req.body.amount.trim(),
          email: req.body.email.trim() 
        }
        // initialize transaction 
        const initialize_transact = await axios.post(`https://api.paystack.co/transaction/initialize`, user_data,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        console.log(initialize_transact.data);

        res.status(200).json({
          status: 'success', 
          data: initialize_transact.data,
        });

      } catch (error) {
        
        res.status(500).json({
          status: 'error', 
          message: ` 🔥  🎆`+JSON.stringify(error.response),
        });
      }
      
});


    // step 3
router.post('/verify-payment', AuthMiddleware, async (req, res) => {
    try {
        const {reference} = req.body;
        
        // verify transaction
        const verify_transact = await axios.get(`https://api.paystack.co/transaction/verify/${reference.trim()}`,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        console.log(verify_transact.data);

        // fetch transaction
        const fetch_transact = await axios.get(`https://api.paystack.co/transaction/${verify_transact.data.data.id}`,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        // console.log(fetch_transact.data);
        
        // post charge transaction request
        const customer_detail = {
          amount: req.body.amount.trim(),
          email: req.body.email.trim(),
          authorization_code: fetch_transact.data.data.authorization.authorization_code
        }
        const post_transact = await axios.post(`https://api.paystack.co/transaction/charge_authorization/`,customer_detail,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        console.log(post_transact.data);

        res.status(201).json({
          status: 'success',
          data: post_transact.data
        })

        } catch (error) {
            res.status(500).json({
              status: 'error',
              message: `unable to verify transaction, ${error.response.data}`
            })
    }
});




// Get all accounts for a particular use & query based on its fields
router.get('/user', AuthMiddleware,async function(req, res) {
  
  try {
    // to implement query
    var searchAdd ={};
    if( Object.keys(req.query).length === 1 && req.query.constructor === Object) {
    }
   
      else if(Object.keys(req.query).length > 1 && req.query.constructor === Object) {
        switch (true) {
          case Object.keys(req.query)[1].toString() === "created_date" :
            const createdDate = req.query.created_date ? { created_date: req.query.created_date } : {};
            searchAdd["created_date"] = createdDate["created_date"];
            break;

          case Object.keys(req.query)[1].toString() === "bank_name" :
            const bankName = req.query.bank_name ? { bank_name: req.query.bank_name } : {};
            searchAdd["bank_name"] = bankName['bank_name'];
            break;
      
          default:
            console.log('params not acceptable');
            console.log(searchAdd);
            break;
        }

        
      
      } else {

      }

      console.log(Object.values(searchAdd));
      
    const accounts = await AccountModel.find(searchAdd);
    res.json({
      status: 'succcess',
      data: accounts,
    });
    console.log(res.j);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: "An error occured while getting accounts's",
    });
  }
});


// Get's a user's profile
router.get('/profile', AuthMiddleware, async function(req, res) {
  try {
    console.log(req.user);
    const account = await AccountModel.findById(req.user);
    const result = account.toJSON();
    
    delete result.password;

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.log(err);

    res.status(401).json({ status: 'error', message: err.message });
  }
});




router.get('', AuthMiddleware,async function(req, res) {
  try {
    if (req.query.isAdmin) {
      if (req.query.isAdmin !== adminKey) {
        res.status(404).json({status: 'error', message: 'you are not an admin'})
        return;
      }

      var search= {}
      if( Object.keys(req.query).length ===1 && req.query.constructor === Object) {
        const accounts = await AccountModel.find({});
        res.status(200).json({status: 'success', data: accounts});
        return;}
  
        else if(Object.keys(req.query).length >1 && req.query.constructor === Object) {
          searchAdd ={};
          switch (true) {

            case Object.keys(req.query)[1].toString() === "account_name" :
              const accountName = req.query.account_name ? { account_name: req.query.account_name } : {};
              searchAdd["account_name"] = accountName['account_name'];
              break;

            case Object.keys(req.query)[1].toString() === "created_date" :
              const createdDate = req.query.created_date ? { created_date: req.query.created_date } : {};
              searchAdd["created_date"] = createdDate['created_date'];
              break;

            case Object.keys(req.query)[1].toString() === "bank_name" :
              const bankName = req.query.bank_name ? { bank_name: req.query.bank_name } : {};
              searchAdd["bank_name"] = bankName['bank_name'];
              break;
              
            default:
              console.log('params not acceptable');
          }
          const accounts = await AccountModel.find(searchAdd);
          res.status(200).json({status: 'success', data: accounts})
          return;
        } 
       else {
        res.status(403).json({status: 'success', message: '🔥 incomplete params sent'})
        return;
      }
      
    } else {
      res.status(403).json({status:'error', message: 'provide admin key'})
    }
 
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: "An error occured while getting account's",
    });
  }
});
module.exports = router;

// SavingModel.findByIdAndUpdate(   //findById(
