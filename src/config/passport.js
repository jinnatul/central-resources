const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const users = require('../models/users');
const userRoleMaps = require('../models/userRoleMaps');
const createJWT = require('../utils/createJWT');

const generateToken = async (profile) => {
  const { given_name, family_name, email } = profile._json;

  let userInfo = await users.findOne({
    where: { email: email },
  });

  if (!userInfo) {
    const { mfa_secret, mfa_qr } = await createJWT();
    userInfo = await users.create({
      f_name: given_name,
      l_name: family_name,
      email,
      is_google: true,
      is_verified: true,
      mfa_secret,
      mfa_qr,
    });

    await userRoleMaps.create({
      user_id: userInfo.id,
      role_id: 2,
    });
  }

  return userInfo
    ? {
        status: 'success',
        id: userInfo.id,
        f_name: given_name,
        l_name: family_name,
        token: createJWT(userInfo.id, given_name, family_name, email, 2, '7d'),
      }
    : {
        status: 'fail',
      };
};

passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      accessType: 'offline',
    },
    (accessToken, refreshToken, profile, cb) => {
      cb(null, generateToken(profile));
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

module.exports = passport;
