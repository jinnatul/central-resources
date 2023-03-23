const passport = require('../config/passport');

exports.googleRequest = passport.authenticate('google', {
  scope: ['email', 'profile'],
});
