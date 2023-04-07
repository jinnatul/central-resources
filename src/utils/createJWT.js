const jwt = require('jsonwebtoken');

const createJWT = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: data.expiresIn ? data.expiresIn : process.env.JWT_EXPIRES_IN,
  });
  return token;
};

module.exports = createJWT;
