import { Router } from 'express';
import { googleRequest } from '../middlewares/google';
import {
  googleAuth,
  signUp,
  resentOtp,
  otpVerification,
  signIn,
  mfaVerification,
  getProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import authorizedUser from '../middlewares/authorizedUser';

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

export default router;
