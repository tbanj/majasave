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
        createddate: new Date(),
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

// verification of account number
router.post('/verify_account',AuthMiddleware, async function (req, res){
  // use set
  detail_code =new Set();
  const verify_info = await axios.get('https://api.paystack.co/bank')
    .then(function (response) { 
          const verify_detail =response.data.data;
          return verify_detail;
      })
      .catch(error=> console.log(error));
      let bank_detail_confirm;
    verify_info.forEach(data => {
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
              createddate: new Date(),
              user: req.user,
              
            });
            res.json({ 
              status: 'success', 
              account_verify: result, 
              data: new_account });
            
         }).catch(error=>{console.log(error)});
  
}); 



router.put('/:id/public', AuthMiddleware, async (req, res) => {
  try {
    const account = await AccountModel.findByIdAndUpdate(
      {
        _id: req.params.id,
        user: req.user,
      },
      { is_public: true },
      { new: true }
    );

    res.json({ status: 'success', data: account });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An error occured while setting account to public',
    });
  }
});

/**
 * Returns a list of public accounts
 */
router.get('/feed', async function(req, res) {
  try {
    const publicAccounts = await AccountModel.find({ is_public: true });
    res.json({ status: 'success', data: publicAccount });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'An error occured' });
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
          

          case Object.keys(req.query)[1].toString() === "current_balance" :
              const currentBalance = req.query.current_balance ? { current_balance: req.query.current_balance } : {};
              searchAdd["current_balance"] = req.query["current_balance"];
              break;

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
  console.log(req.user);
  console.log(req.isadmin);
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
        
      console.log(typeof Object.keys(req.query).length);
      console.log(req.query.constructor);
        console.log('its not null'); return;}
  
        else if(Object.keys(req.query).length >1 && req.query.constructor === Object) {
          searchAdd ={};
          switch (true) {
            case Object.keys(req.query)[1].toString() === "current_balance" :
              const currentBalance = req.query.current_balance ? { current_balance: req.query.current_balance } : {};
              searchAdd["current_balance"] = currentBalance['current_balance'];
              break;

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
              console.log(searchAdd);
              
          }
          console.log(typeof searchAdd);
          console.log(searchAdd);
          const accounts = await AccountModel.find(searchAdd);
          console.log(accounts);
          
          res.status(200).json({status: 'success', data: accounts})
          return;
        }
       
          
       else {
        console.log('its null');

        return;
         
      }
      


    } else {
      res.status(403).json({status:'error', message: 'provide admin key'})
    }
    
   
    
      
 
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: "An error occured while getting account's",
    });
  }
});
module.exports = router;
