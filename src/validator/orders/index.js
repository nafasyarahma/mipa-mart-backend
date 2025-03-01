const InvariantError = require('../../exceptions/InvariantError');
const {
  OrderPayloadSchema,
  OrderStatusPayloadSchema,
  PaymentStatusPayloadSchema,
  PaymentImageHeadersSchema,
} = require('./schema');

const OrdersValidator = {
  validateOrderPayload: (payload) => {
    const validationResult = OrderPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateOrderStatusPayload: (payload) => {
    const validationResult = OrderStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePaymentStatusPayload: (payload) => {
    const validationResult = PaymentStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePaymentImageHeaders: (payload) => {
    const validationResult = PaymentImageHeadersSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = OrdersValidator;
