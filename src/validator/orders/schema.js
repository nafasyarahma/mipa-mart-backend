const Joi = require('joi');

const OrderPayloadSchema = Joi.object({
  paymentMethodId: Joi.string().required(),
  paymentImage: Joi.allow(null),
  deliveryMethodId: Joi.string().required(),
  note: [Joi.string(), Joi.allow(null)],
});

const OrderStatusPayloadSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed'),
});

module.exports = { OrderPayloadSchema, OrderStatusPayloadSchema };
