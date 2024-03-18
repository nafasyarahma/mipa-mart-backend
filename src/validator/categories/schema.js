const Joi = require('joi');

const CategoryPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required().allow(null),
});

module.exports = { CategoryPayloadSchema };
