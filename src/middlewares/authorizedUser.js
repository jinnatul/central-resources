import jwt from 'jsonwebtoken';

const authorizedUser = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.flag = true;
    error.statusCode = 401;
    return next(error);
  }
  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.message === 'jwt expired') {
      error.message = 'Session Expired';
    }
    error.statusCode = 500;
    return next(error);
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    return next(error);
  }

  // Grant access to protect route
  req.user = decodedToken;
  req.token = token;
  return next();
};

export default authorizedUser;
