const InvariantError = require('../../exceptions/InvariantError');
const { PaymentMethodPayloadSchema } = require('./schema');

const PaymentMethodsValidator = {
  validatePaymentMethodPayload: (payload) => {
    const validationResult = PaymentMethodPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PaymentMethodsValidator;
