const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const cloudinary = require('../config/cloudinary');

const createMFA = async () => {
  const { base32, otpauth_url } = speakeasy.generateSecret();

  const base64Data = await qrcode.toDataURL(otpauth_url);
  const cloudData = await cloudinary.uploader.upload(base64Data);

  return {
    mfa_secret: base32,
    mfa_qr: cloudData.url,
  };
};

module.exports = createMFA;
