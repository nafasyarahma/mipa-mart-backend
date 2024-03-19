const Joi = require('joi');

const ProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  status: Joi.string().valid('ready', 'preorder', 'soldout'),
});

module.exports = { ProductPayloadSchema };
