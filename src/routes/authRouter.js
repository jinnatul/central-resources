const { Router } = require('express');
const { googleRequest } = require('../middlewares/google');
const {
  googleAuth,
  signUp,
  resentOtp,
  otpVerification,
  signIn,
  mfaVerification,
  getProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const authorizedUser = require('../middlewares/authorizedUser');

const router = Router();

router.get('/google', googleRequest);
router.get('/google/callback', googleRequest, googleAuth);
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/resent-otp', resentOtp);
router.post('/verify-otp', otpVerification);
router.post('/verify-mfa', mfaVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(authorizedUser);
router.get('/profile', getProfile);

module.exports = router;
