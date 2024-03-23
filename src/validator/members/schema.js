const Joi = require('joi');

const MemberPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  major: Joi.string().valid('biologi', 'matematika', 'fisika', 'kimia', 'ilmu_komputer'),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
});

const MemberStatusPayloadSchema = Joi.object({
  verifStatus: Joi.string().valid('pending', 'approved', 'rejected'),
});

module.exports = { MemberPayloadSchema, MemberStatusPayloadSchema };
