/* eslint-disable class-methods-use-this */
const nodemailer = require('nodemailer');
const jwt = require('@hapi/jwt');
const InvariantError = require('../../exceptions/InvariantError');
require('dotenv').config();

class EmailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmailVerification(id, email) {
    try {
      const role = id.split('-')[0];
      const token = jwt.token.generate({ id, email }, process.env.EMAIL_KEY, { expiresIn: '1h' });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Please click <a href="http://${process.env.HOST}:${process.env.PORT}/${role}/verify-email/${token}">here</a> to verify your email.</p>`,
      };

      await this._transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendResetPasswordEmail(id, email) {
    try {
      const role = id.split('-')[0];

      const token = jwt.token.generate({ id, email }, process.env.EMAIL_KEY, { expiresIn: '1h' });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        html: `<p>Please click <a href="${process.env.ALLOWED_ORIGINS}/${role}/reset-password/${token}">here</a> to change your password</p>`,
      };

      await this._transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(error);
    }
  }

  verifyEmail(token) {
    try {
      const artifacts = jwt.token.decode(token);
      // mengecek signature token sesuai/tidak
      jwt.token.verify(artifacts, process.env.EMAIL_KEY);
      // ambil payload
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Token tidak valid');
    }
  }
}

module.exports = EmailService;
