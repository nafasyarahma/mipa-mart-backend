const Joi = require('joi');

const MemberPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  npm: Joi.string().required(),
  major: Joi.string().valid('biologi', 'matematika', 'fisika', 'kimia', 'ilmu_komputer'),
  ktmImage: Joi.any().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
  bio: [Joi.string(), Joi.allow(null)],
});

const PutMemberPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
  bio: [Joi.string(), Joi.allow(null)],
});

const MemberStatusPayloadSchema = Joi.object({
  verifStatus: Joi.string().valid('pending', 'approved', 'rejected'),
});

module.exports = { MemberPayloadSchema, PutMemberPayloadSchema, MemberStatusPayloadSchema };
