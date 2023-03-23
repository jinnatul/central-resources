const Joi = require('joi');

exports.validateSignUp = Joi.object({
  f_name: Joi.string().required().error(new Error('Please provide your first name!')),
  l_name: Joi.string().required().error(new Error('Please provide your last name!')),
  email: Joi.string().email().required().error(new Error('Please provide your email!')),
  phone: Joi.string().required().error(new Error('Please provide your phone!')),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required()
    .error(new Error('Please provide your password!')),
});

exports.validateResentOtp = Joi.object({
  email: Joi.string().email().required().error(new Error('Please provide your email!')),
});

exports.validateOtpVerification = Joi.object({
  email: Joi.string().email().required().error(new Error('Please provide your email!')),
  otp: Joi.string().required().error(new Error('Please provide your otp!')),
});

exports.validateSignIn = Joi.object({
  email: Joi.string().email().required().error(new Error('Please provide your email!')),
  password: Joi.string().required().error(new Error('Please provide your password!')),
});

exports.validateMfaVerification = Joi.object({
  id: Joi.number().required().error(new Error('Please provide your info!')),
  token: Joi.string().required().error(new Error('Please provide your mfa token!')),
});

exports.validateResetPassword = Joi.object({
  reset_link: Joi.string().required().error(new Error('Please provide reset link!')),
  password: Joi.string().required().error(new Error('Please provide your password!')),
});
