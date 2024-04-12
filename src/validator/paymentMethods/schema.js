const Joi = require('joi');

const PaymentMethodPayloadSchema = Joi.object({
  provider: Joi.string().required(),
  name: Joi.string().required(),
  accountNumber: Joi.string().required(),
});

module.exports = { PaymentMethodPayloadSchema };
