module.exports = {
  mongodb_url: process.env.MONGODB_URL,
  jwt_secret: process.env.JWT_SECRET,
  domain: process.env.DOMAIN,
  api_key: process.env.API_KEY,
  port: process.env.PORT || 6004,
};
