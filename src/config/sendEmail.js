import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, subject, message) => {
  console.log('mail info', {
    email,
    subject,
  });
  await transporter.sendMail({
    from: `<${process.env.EMAIL}>`,
    to: email,
    subject,
    html: message,
  });
};

export default sendEmail;
