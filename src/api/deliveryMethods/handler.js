const autoBind = require('auto-bind');

class DeliveryMethodsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postDeliveryMethodHandler(request, h) {
    this._validator.validateDeliveryMethodPayload(request.payload);

    const { method, description } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const deliveryMethodId = await this._service.addDeliveryMethod({
      method, description, memberId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan metode pengiriman',
      data: {
        deliveryMethodId,
      },
    });
    response.code(201);
    return response;
  }

  async getMemberDeliveryMethodsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const deliveryMethods = await this._service.getMemberDeliveryMenthods(credentialId);

    return {
      status: 'success',
      data: {
        deliveryMethods,
      },
    };
  }

  async putMemberDeliveryMethodByIdHandler(request) {
    this._validator.validateDeliveryMethodPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyDeliveryMethodMember(id, credentialId);
    await this._service.editDeliveryMethodById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui metode pengiriman',
    };
  }

  async deleteDeliveryMethodByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyDeliveryMethodMember(id, credentialId);
    await this._service.deleteDeliveryMethodById(id);

    return {
      status: 'success',
      message: 'Berhasil menghapus metode pengiriman',
    };
  }
}

module.exports = DeliveryMethodsHandler;
