const Joi = require('joi');

const ProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  status: Joi.string().valid('ready', 'preorder', 'soldout'),
  productImages: Joi.required(),
  categoryId: Joi.string().allow(null, '').optional(),
});

const ProductStatusPayloadSchema = Joi.object({
  status: Joi.string().valid('ready', 'preorder', 'soldout'),
});

const ProductReviewPayloadSchema = Joi.object({
  comment: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5)
    .required(),
  orderId: Joi.string().required(),
});

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpg', 'image/jpeg', 'image/png').required(),
}).unknown();

module.exports = {
  ProductPayloadSchema,
  ImageHeadersSchema,
  ProductStatusPayloadSchema,
  ProductReviewPayloadSchema,
};
