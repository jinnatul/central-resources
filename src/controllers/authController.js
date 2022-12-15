import { AES } from 'crypto-js';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import speakeasy from 'speakeasy';
import users from '../models/users';
import userRoleMaps from '../models/userRoleMaps';
import sendEmail from '../config/sendEmail';
import { signUpTemplate } from '../utils/templates/signUpMail';
import { forgotTemplate } from '../utils/templates/forgotMail';
import sendMessage from '../utils/responses/sendMessage';
import sendData from '../utils/responses/sendData';
import createJWT from '../utils/createJWT';
import createMFA from '../utils/createMFA';
import {
  validateSignUp,
  validateResentOtp,
  validateOtpVerification,
  validateSignIn,
  validateMfaVerification,
  validateResetPassword,
} from '../models/validations';

export const googleAuth = async (req, res, next) => {
  try {
    const { status, id, f_name, l_name, token } = await req.user;
    if (status === 'success') {
      const encryptedToken = AES.encrypt(
        JSON.stringify({
          id,
          f_name,
          l_name,
          token,
        }),
        process.env.SESSION_SECRET
      );
      res.redirect(`${process.env.FRONT_END}/login?status=${status}&token=${encryptedToken}`);
    } else {
      res.redirect(`${process.env.FRONT_END}?status=${status}`);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const signUp = async (req, res, next) => {
  try {
    await validateSignUp.validateAsync(req.body);

    const { f_name, l_name, email, phone, password } = req.body;

    let userInfo = await users.findOne({
      where: {
        email,
      },
    });
    if (userInfo) {
      const error = new Error('Already use this email!');
      error.flag = true;
      error.statusCode = 409;
      return next(error);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otp_expire = moment().add(10, 'minutes');
    const hashPass = await bcrypt.hash(password, 12);
    const { mfa_secret, mfa_qr } = await createMFA();

    userInfo = await users.create({
      f_name,
      l_name,
      email,
      phone,
      password: hashPass,
      otp,
      otp_expire,
      mfa_secret,
      mfa_qr,
    });
    if (!userInfo) {
      const error = new Error('Something went wrong when creating an account!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    await userRoleMaps.create({
      user_id: userInfo.id,
      role_id: 2,
    });

    await sendEmail(email, `Email verification code: ${otp}`, signUpTemplate(otp, `${f_name} ${l_name}`));

    sendMessage(res, 'Please check your email for OTP verification');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const resentOtp = async (req, res, next) => {
  try {
    await validateResentOtp.validateAsync(req.body);

    const { email } = req.body;

    let userInfo = await users.findOne({
      where: {
        email,
        is_verified: false,
        is_delete: false,
      },
    });
    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 409;
      return next(error);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otp_expire = moment().add(10, 'minutes');
    const { f_name, l_name } = userInfo;

    userInfo = await users.update(
      {
        otp,
        otp_expire,
      },
      {
        where: {
          email,
        },
      }
    );
    if (!userInfo) {
      const error = new Error('Something went wrong when sending an otp!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    await sendEmail(email, `Email verification code: ${otp}`, SignUpTemplate(otp, `${f_name} ${l_name}`));

    sendMessage(res, 'Please check your email for OTP verification');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const otpVerification = async (req, res, next) => {
  try {
    await validateOtpVerification.validateAsync(req.body);

    const { email, otp } = req.body;

    let userInfo = await users.findOne({
      include: [
        {
          as: 'role_info',
          model: userRoleMaps,
        },
      ],
      where: {
        email,
        is_verified: false,
        is_delete: false,
      },
    });

    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 404;
      return next(error);
    }

    const { id, f_name, l_name, phone, otp_expire, role_info } = userInfo;

    if (otp !== userInfo.otp) {
      const error = new Error('Your otp has not to match!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    const isValid = moment().isBefore(otp_expire, 'seconds');
    if (!isValid) {
      const error = new Error('Your otp has been expired!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    await users.update(
      {
        is_verified: true,
      },
      {
        where: {
          email,
        },
      }
    );

    const { role_id } = role_info;
    sendData(res, {
      id,
      f_name,
      l_name,
      email,
      phone,
      role_id,
      token: createJWT(id, f_name, l_name, email, role_id, role_id === 1 ? '3h' : '7d'),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const signIn = async (req, res, next) => {
  try {
    await validateSignIn.validateAsync(req.body);

    const { email, password } = req.body;

    let userInfo = await users.findOne({
      include: [
        {
          as: 'role_info',
          model: userRoleMaps,
        },
      ],
      where: {
        email,
        is_delete: false,
      },
    });
    if (!userInfo) {
      const error = new Error('Email or password is incorrect!');
      error.flag = true;
      error.statusCode = 404;
      return next(error);
    }

    const { id, f_name, l_name, phone, is_verified, mfa_enables, role_info } = userInfo;

    const isEqual = await bcrypt.compare(password, userInfo.password);
    if (!isEqual) {
      const error = new Error('Email or password is incorrect!');
      error.flag = true;
      error.statusCode = 401;
      return next(error);
    }

    if (!is_verified) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otp_expire = moment().add(10, 'minutes');

      userInfo = await users.update(
        {
          otp,
          otp_expire,
        },
        {
          where: {
            email,
          },
        }
      );
      if (!userInfo) {
        const error = new Error('Something went wrong when sending an otp!');
        error.flag = true;
        error.statusCode = 500;
        return next(error);
      }

      await sendEmail(email, `Email verification code: ${otp}`, signUpTemplate(otp, `${f_name} ${l_name}`));

      return sendData(res, {
        is_verified,
        email,
        message: 'Please check your email for OTP verification',
      });
    }

    const { role_id } = role_info;
    if (mfa_enables) {
      sendData(res, {
        is_verified,
        id,
        role_id,
        mfa_enables,
      });
    } else {
      sendData(res, {
        is_verified,
        id,
        f_name,
        l_name,
        email,
        phone,
        role_id,
        mfa_enables,
        token: createJWT(id, f_name, l_name, email, role_id, role_id === 1 ? '3h' : '7d'),
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const mfaVerification = async (req, res, next) => {
  try {
    await validateMfaVerification.validateAsync(req.body);

    const { id, token } = req.body;

    const userInfo = await users.findOne({
      include: [
        {
          as: 'role_info',
          model: userRoleMaps,
        },
      ],
      where: {
        id,
      },
    });
    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 404;
      return next(error);
    }

    const { f_name, l_name, email, phone, mfa_secret, role_info } = userInfo;

    const verified = speakeasy.totp.verify({
      secret: mfa_secret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      const error = new Error('Invalid token!');
      error.flag = true;
      error.statusCode = 402;
      return next(error);
    }

    const { role_id } = role_info;
    sendData(res, {
      id,
      f_name,
      l_name,
      email,
      phone,
      role_id,
      token: createJWT(id, f_name, l_name, email, role_id, role_id === 1 ? '3h' : '7d'),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const userInfo = await users.findOne({
      attributes: ['id', 'f_name', 'l_name', 'email', 'phone', 'mfa_enables', 'mfa_qr'],
      where: {
        id,
        is_verified: true,
        is_delete: false,
      },
    });
    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 404;
      return next(error);
    }

    sendData(res, userInfo);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await validateResentOtp.validateAsync(req.body);

    const { email } = req.body;

    let userInfo = await users.findOne({
      where: {
        email,
        is_delete: false,
      },
    });
    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 409;
      return next(error);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const reset_link = `${process.env.FRONT_END}/reset-password/otp=${otp}&&email=${email}`;
    const { f_name, l_name } = userInfo;

    userInfo = await users.update(
      {
        reset_link,
        otp_expire: moment().add(10, 'minutes'),
      },
      {
        where: {
          email,
        },
      }
    );
    if (!userInfo) {
      const error = new Error('Something went wrong when sending a verification link!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    await sendEmail(email, 'Reset your password', forgotTemplate(`${f_name} ${l_name}`, reset_link));

    sendMessage(res, 'Please check your email for verification');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await validateResetPassword.validateAsync(req.body);

    const { reset_link, password } = req.body;

    let userInfo = await users.findOne({
      where: {
        reset_link,
        is_delete: false,
      },
    });
    if (!userInfo) {
      const error = new Error('User not found!');
      error.flag = true;
      error.statusCode = 409;
      return next(error);
    }

    const { otp_expire } = userInfo;
    const isValid = moment().isBefore(otp_expire, 'seconds');
    if (!isValid) {
      const error = new Error('Your verification link has been expired!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    const hashPass = await bcrypt.hash(password, 12);
    userInfo = await users.update(
      {
        reset_link: '',
        password: hashPass,
      },
      {
        where: {
          reset_link,
        },
      }
    );
    if (!userInfo) {
      const error = new Error('Something went wrong when resetting the password!');
      error.flag = true;
      error.statusCode = 500;
      return next(error);
    }

    sendMessage(res, 'Password reset successfully');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
