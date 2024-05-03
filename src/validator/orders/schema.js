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

const PaymentImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpg', 'image/jpeg', 'image/png').required(),
}).unknown();

module.exports = { OrderPayloadSchema, OrderStatusPayloadSchema, PaymentImageHeadersSchema };
