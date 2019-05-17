const jwt = require('jsonwebtoken');
const env = require('../env');

/**
 * Auth middleware that checks if an authorization header exists in the request and if the token contained within is valid
 */
module.exports = function(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const authIsAdmin = req.headers.isadmin;

    if (!(authHeader && authIsAdmin ) )
      return res.status(401).json({
        status: 'error',
        message: 'Please specify an authorization header',
      });

    const token = authHeader.split(' ')[1];
    const isAdmin = authIsAdmin.split(' ')[1];
    var isadminBol;
  if(isAdmin === 'false'){
      isadminBol = false;
     
  } else if(isAdmin=== 'true') { isadminBol = true;
  } else{ console.log('bad character inputted 🔥 ⚱️');}
  
  
  
    const tokenData = jwt.verify(token, env.jwt_secret);

    req.user = tokenData.id;
    req.isadmin= isadminBol;
   
   

    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'You are not authorized!',
    });
  }
};
