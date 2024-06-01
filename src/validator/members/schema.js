const Joi = require('joi');

const MemberPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).trim().regex(/\S/)
    .required(),
  name: Joi.string().required(),
  npm: Joi.string().required(),
  major: Joi.string().valid('biologi', 'matematika', 'fisika', 'kimia', 'ilmu_komputer'),
  ktmImage: Joi.any().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
  bio: [Joi.string(), Joi.allow(null, '')],
});

const PutMemberPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
  bio: [Joi.string(), Joi.allow(null)],
});

const KtmImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpg', 'image/jpeg', 'image/png').required(),
}).unknown();

const MemberStatusPayloadSchema = Joi.object({
  verifStatus: Joi.string().valid('pending', 'approved', 'rejected'),
});

const ForgotPasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  MemberPayloadSchema,
  KtmImageHeadersSchema,
  PutMemberPayloadSchema,
  MemberStatusPayloadSchema,
  ForgotPasswordPayloadSchema,
};
