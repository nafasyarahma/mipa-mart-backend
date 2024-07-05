const Joi = require('joi');

const OrderPayloadSchema = Joi.object({
  paymentMethodId: Joi.string().required(),
  paymentImage: Joi.allow(null, '').optional(),
  deliveryMethodId: Joi.string().required(),
  note: [Joi.string(), Joi.allow(null, '')],
});

const OrderStatusPayloadSchema = Joi.object({
  orderStatus: Joi.string().valid('accepted', 'rejected', 'completed'),
});

const PaymentStatusPayloadSchema = Joi.object({
  paymentStatus: Joi.string().valid('paid', 'unpaid'),
});

const PaymentImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpg', 'image/jpeg', 'image/png'),
}).unknown();

module.exports = {
  OrderPayloadSchema,
  OrderStatusPayloadSchema,
  PaymentStatusPayloadSchema,
  PaymentImageHeadersSchema,
};
