const Joi = require('joi');

const CustomerPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
});

const PutCustomerPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  whatsappNumber: Joi.string().regex(/^(0)8[1-9][0-9]{6,9}$/).required(),
  address: Joi.string().required(),
});

const ForgotPasswordPayloadSchema = Joi.object.apply({
  email: Joi.string().email(),
});

module.exports = {
  CustomerPayloadSchema, PutCustomerPayloadSchema, ForgotPasswordPayloadSchema,
};
