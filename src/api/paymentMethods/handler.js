const autoBind = require('auto-bind');

class PaymentMethodsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPaymentMethodHandler(request, h) {
    this._validator.validatePaymentMethodPayload(request.payload);

    const { provider, accountNumber, name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const paymentMethodId = await this._service.addPaymentMethod({
      provider, accountNumber, name, memberId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan metode pembayaran',
      data: {
        paymentMethodId,
      },
    });
    response.code(201);
    return response;
  }

  async getMemberPaymentMethods(request) {
    const { id: credentialId } = request.auth.credentials;
    const paymentMethods = await this._service.getMemberPaymentMenthods(credentialId);

    return {
      status: 'success',
      data: {
        paymentMethods,
      },
    };
  }

  async deletePaymentMethodByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPaymentMethodMember(id, credentialId);
    await this._service.deletePaymentMethodById(id);

    return {
      status: 'success',
      message: 'Metode pembayaran berhasil dihapus',
    };
  }
}

module.exports = PaymentMethodsHandler;
