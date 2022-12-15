import passport from '../config/passport';

export const googleRequest = passport.authenticate('google', {
  scope: ['email', 'profile'],
});
