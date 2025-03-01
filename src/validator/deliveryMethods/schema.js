const Joi = require('joi');

const DeliveryMethodPayloadSchema = Joi.object({
  method: Joi.string().required(),
  description: Joi.string().required(),
});

const PutDeliveryMethodPayloadSchema = Joi.object({
  description: Joi.string().required(),
});

module.exports = { DeliveryMethodPayloadSchema, PutDeliveryMethodPayloadSchema };
