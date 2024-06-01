const Joi = require('joi');

const CategoryPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: [Joi.string(), Joi.allow(null, '')],
});

const PutCategoryPayloadSchema = Joi.object({
  description: [Joi.string(), Joi.allow(null, '')],
});

module.exports = { CategoryPayloadSchema, PutCategoryPayloadSchema };
