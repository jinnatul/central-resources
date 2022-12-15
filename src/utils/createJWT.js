import jwt from 'jsonwebtoken';

const createJWT = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

export default createJWT;
