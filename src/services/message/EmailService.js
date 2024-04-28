/* eslint-disable class-methods-use-this */
const nodemailer = require('nodemailer');
const jwt = require('@hapi/jwt');
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

  async sendEmailVerification(id, userEmail) {
    try {
      const token = jwt.token.generate({ id, email: userEmail }, process.env.EMAIL_KEY, { expiresIn: '1h' });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Email Verification',
        html: `<p>Please click <a href="http://${process.env.HOST}:${process.env.PORT}/verify-email/${token}">here</a> to verify your email.</p>`,
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
      jwt.token.verifySignature(artifacts, process.env.EMAIL_KEY);

      // ambil payload
      const { id } = artifacts.decoded.payload;
      return id;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = EmailService;
