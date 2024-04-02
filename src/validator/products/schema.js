const Joi = require('joi');

const ProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  status: Joi.string().valid('ready', 'preorder', 'soldout'),
  productImages: Joi.required(),
  categoryId: Joi.string(),
});

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').required(),
}).unknown();

module.exports = { ProductPayloadSchema, ImageHeadersSchema };
