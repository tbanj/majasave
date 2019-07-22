module.exports = {
  mongodb_url: process.env.MONGODB_URL,
  jwt_secret: process.env.JWT_SECRET,
  domain: process.env.DOMAIN,
  api_key: process.env.API_KEY,
  port: process.env.PORT || 6004,
  paystack_secret_key: process.env.PAYSTACK_SECRET_KEY,
  sendgrid_api_key: process.env.SENDGRID_API_KEY,
  mailgun_email_sender: process.env.MAILGUN_EMAIL_SENDER,
  admin_key: process.env.ADMIN_KEY,

};
