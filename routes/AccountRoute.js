const express = require('express');
const jwt = require('jsonwebtoken');
const AccountModel = require('../models/AccountModel');
const WithdrawalModel = require('../models/WithdrawalModel');
const TransactionModel = require('../models/TransactionModel');
const PackageModel = require('../models/PackageModel');

const UserModel = require('../models/UserModel');
const axios = require('axios');
const env = require('../env')
const AuthMiddleware = require('../middlewares/auth');
const JoiValidator = require('../middlewares/validator');
const { CreateAccountValidator } = require('../validators/AccountValidator');
const { SavingPackageValidator } = require('../validators/SavingPackageValidator');
const { InitializePayValidator } = require('../validators/InitializePayValidator');

const { PaymentValidator } = require('../validators/PaymentValidator');
const { WithdrawalValidator } = require('../validators/WithdrawalValidator');
const { SavingValidator } = require('../validators/SavingValidator');
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
router.post('/verify_account',AuthMiddleware, JoiValidator(SavingValidator), async function (req, res){
  try {
    if(typeof req.body.account_number !== 'string'){ return;}
      detail_code =new Set();
      const verify_info = await axios.get('https://api.paystack.co/bank')
        .then(function (response) { 
              const verify_detail =response.data.data;
              // return verify_detail;
              verify_detail.forEach(data => {
                detail_code.add({bank_name: data['name'], slug: data['slug'], code: data['code']});
          
                var check_account;
                if(req.body.bank_name===data['slug']) {
                  const user_bank_code= data['code'];
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
            console.log(result.data);
            
          const accountdl = await WithdrawalModel.findOne({'account_number': req.body.account_number});
          if (accountdl) {
                res.status(203).json({
                status: 'success', 
                message: 'account verification has been done earlier',
              });
              return true;
          } 

          
      
          const new_account= await WithdrawalModel.create({
            // using spread operator 
            
            bank_name: req.body.bank_name,
            account_number: result.data.account_number,
            account_name: result.data.account_name,
            user: req.user,
            created_date: new Date(),
          });

          res.status(201).json({ 
            status: 'success', 
            account_verify: result, 
            data: new_account });
          
          }).catch(error=>{console.log(error)});
      } catch (error) {
          res.status(500).json({ 
          status: 'success', 
          account_verify:  `server error experienced`, 
          data: 'error encounter' });
          console.error(error);
      }
  
}); 

        // step 2 
router.post('/initialize-payment', AuthMiddleware,JoiValidator(InitializePayValidator), async (req, res) =>{
      try {
        let amount_kobo = req.body.amount.trim();
        const amount_kobo_c = parseFloat(amount_kobo)*100;
        console.log(req.user);
        const user = await UserModel.findById(req.user);
        if(!user){
          res.status(404).json({
            status: 'success', 
            message: `record not found for this user`
          });
          return;
        }
        
        const user_data = {
          amount: amount_kobo_c.toString(),
          email: user.email
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

  // create a new package
  router.post('/select-package', AuthMiddleware, JoiValidator(SavingPackageValidator), async (req, res) => {
    try {
      let interest_rate;
      const amount_b = parseFloat(req.body.amount.trim());
      if (amount_b>= 1000 && amount_b <= 5000) {
        interest_rate = 0.02;

      } else if (amount_b >= 5001 &&amount_b <= 50000) {
        interest_rate = 0.03;
      }else if (amount_b >= 50001 && amount_b <=200000) {
        interest_rate = 0.04;
      } else if (amount_b > 20000 && amount_b <= 3000000) {
        interest_rate = 0.05;
      } else if (amount_b > 3000000) {
        res.status(404).json({
          status: 'error',
          // message: `unable to verify transaction, ${error.response.data}`,
          message: 'our costomer representative will reachout to you'
        })
        return;
      }
      else {
        
        res.status(404).json({
          status: 'error',
          // message: `unable to verify transaction, ${error.response.data}`,
          message: 'value inputted for amount not acceptable'
        });
      }
      console.log(interest_rate);

      // req.body.confirm is optionla which is use to create new package
      const check_package = await PackageModel.findOne({package_name: req.body.package_name.trim()});
      if(check_package && req.body.confirm=== undefined){
        res.status(200).json({
          status: 'success',
          // message: `unable to verify transaction, ${error.response.data}`,
          message: 'you have a package on this plan already, click cancel to return to dashboard or continue to create  new one'
        });
        return;
      }
        const stop_date = new Date(req.body.duration.trim());
        const endd =new Date(stop_date);
        const starr =new Date()
        const dif = endd - starr
        const mili_per_day = 86400 * 1000;
        const days_duration =Math.round(dif/mili_per_day);

        const milli_duration =new Date().getTime() +dif
        const save_duration = new Date(milli_duration);
        console.log(save_duration);

      
      const package_selected = await PackageModel.create({
        package_name : req.body.package_name.trim(),
        rate: interest_rate.toString(),
        saving_term: req.body.saving_term,
        duration: save_duration,
        created_date: new Date
      });


      res.status(201).json({
        status: 'success',
        // message: `unable to verify transaction, ${error.response.data}`,
        data: {rate: interest_rate, days: days_duration },package_selected
      });

    } catch (error) {
      console.error(error);
      
      res.status(404).json({
        status: 'error',
        // message: `unable to verify transaction, ${error.response.data}`,
        message: 'You are yet to input account details and verify it'
      });
    }
  })


    // step 3
router.post('/verify-payment', AuthMiddleware, async (req, res) => {
    try {
      
        const reference = req.body.reference.trim();
        
        const user = await UserModel.findById(req.user);
        
        // const account = await AccountModel.find({user: req.user});
        if(!user){
          res.status(404).json({
            status: 'error',
            message: 'invalid user details '
          });
          return;
        }
        
        let interest_rate ;
        amount_b = parseFloat(req.body.amount.trim());
        
        
        // console.log(amount_b);
        // const account_id = account[0].id;

        
        // update package selected
        const select_pack = await PackageModel.find({package_name: req.body.package_name.trim()});
        
        
        if(!select_pack){ 
        res.status(404).json({
        status: 'error',
        message: 'package selected is not available, kindly contact customer care'
        }); 
        return;}
        const verify_transact = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        // console.log(verify_transact.data);

        // fetch transaction
        const fetch_transact = await axios.get(`https://api.paystack.co/transaction/${verify_transact.data.data.id}`,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        // console.log(fetch_transact.data);
        
        const amount_kobo_c = parseFloat(req.body.amount.trim())*100;
        // console.log(amount_kobo_c.toString());
        // post charge transaction request
        
        
        const customer_detail = {
          amount: amount_kobo_c.toString(),
          email: user.email,
          authorization_code: fetch_transact.data.data.authorization.authorization_code
        }
        const post_transact = await axios.post(`https://api.paystack.co/transaction/charge_authorization/`,customer_detail,
        {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
        
        
        if(post_transact.data.data.status === 'success') {
          console.log(` completed ${post_transact.data.data.status}`);
          // const available_balance = account[0].package_type[0].current_balance;
          // const amount_bal =parseFloat(account[0].package_type[0].current_balance)
          if(select.pack.name.trim() === 'quicksave') {

            

            // interest to receive on amount saved daily
            const interest_per_saving = post_transact.data.data.amount * interest_rate;
            console.log(post_transact.data);
            const transaction_data = await TransactionModel.create({
              user: req.user,
              package_type: select_package.id,
              paysatack_reference: reference,
              transaction_date: post_transact.data.data.transaction_date,
              amount_invested:  post_transact.data.data.amount,
              start_date: new Date,
              end_date: req.body.end_date

            }); 
            
              // console.log(transaction_data);
          } 
          
          
        }
        // console.log(post_transact.data.data.amount);
        
        
        
        res.status(201).json({
          status: 'success',
          data: post_transact.data
        })

        } catch (error) {
            res.status(500).json({
              status: 'error',
              // message: `unable to verify transaction, ${error.response.data}`,
              message: 'server error or no data found'
            })
    }
});


    // step 4 add money to existing transaction
    router.post('/add-money', AuthMiddleware, JoiValidator(PaymentValidator), async (req, res) => {
      try {
          const reference = req.body.reference.trim();
          const user = await UserModel.findById(req.user);
          console.log(req.user);
          
          const account = await AccountModel.find({user: req.user});
          if(!account){
            res.status(404).json({
              status: 'error',
              // message: `unable to verify transaction, ${error.response.data}`,
              message: 'You are yet to input account details and verify it'
            });
            return;
          }
  
          let interest_rate ;
          amount_b = parseFloat(req.body.amount)
          
          
          console.log(account[0].id );
          const account_id = account[0].id;
  
          
          // update package selected
          const select_package = await PackageModel.findOne({package_name: req.body.package_name.trim()});
          if(!select_package) 
          res.status(404).json({
          status: 'error',
          // message: `unable to verify transaction, ${error.response.data}`,
          message: 'package selected is not available, kindly contact customer care'
          }); 
          return;
  
  
          
          // console.log(ser);
          // verify transaction
          const verify_transact = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,
          {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
          console.log(verify_transact.data);
  
          // fetch transaction
          const fetch_transact = await axios.get(`https://api.paystack.co/transaction/${verify_transact.data.data.id}`,
          {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
          // console.log(fetch_transact.data);
          
          const amount_kobo_c = parseFloat(req.body.amount.trim())*100;
          console.log(amount_kobo_c.toString());
          // post charge transaction request
          
          
          const customer_detail = {
            amount: amount_kobo_c.toString(),
            email: user.email,
            authorization_code: fetch_transact.data.data.authorization.authorization_code
          }
          const post_transact = await axios.post(`https://api.paystack.co/transaction/charge_authorization/`,customer_detail,
          {headers: {Authorization: `Bearer ${env.paystack_secret_key}`}});
          console.log(post_transact.data);
          
          if(post_transact.data.data.status === 'success') {
            console.log(` completed ${post_transact.data.data.status}`);
            const available_balance = account[0].package_type[0].current_balance;
            const amount_bal =parseFloat(account[0].package_type[0].current_balance)
            if(req.body.account_type.trim() === 'quicksave') {
  
              
  
              // interest to receive on amount saved daily
              const interest_per_saving = post_transact.data.data.amount * interest_rate;
              const transaction_data = await TransactionModel.findByIdAndUpdate(
                {'_id': req.body.transaction_id},{
                user: req.user,
                package_type: select_package.id,
                paysatack_reference: reference,
                transaction_date: post_transact.data.data.transaction_date,
                amount_invested:  post_transact.data.data.amount,
                start_date: new Date,
                end_date: req.body.end_date
  
              }); 
              
                console.log(transaction_data);
            } 
            
            
          }
          console.log(post_transact.data.data.amount);
          
          
          
          res.status(201).json({
            status: 'success',
            data: post_transact.data
          })
  
          } catch (error) {
              res.status(500).json({
                status: 'error',
                // message: `unable to verify transaction, ${error.response.data}`,
                message: 'server error or no data found'
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
    if (req.query.is_admin) {
      if (req.query.is_admin !== adminK_ey) {
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
