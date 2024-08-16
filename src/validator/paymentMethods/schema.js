const Joi = require('joi');

const PaymentMethodPayloadSchema = Joi.object({
  provider: Joi.string().required(),
  name: Joi.string().allow(null, ''),
  accountNumber: Joi.string().allow(null, ''),
});

module.exports = { PaymentMethodPayloadSchema };
