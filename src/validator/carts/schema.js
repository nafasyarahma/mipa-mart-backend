const Joi = require('joi');

const CartPayloadSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const QuantityPayloadSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = { CartPayloadSchema, QuantityPayloadSchema };
