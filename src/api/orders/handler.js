const autoBind = require('auto-bind');

class OrdersHandler {
  constructor(service, paymentMethodsService, deliveryMethodsService, validator) {
    this._service = service;
    this._paymentMethodsService = paymentMethodsService;
    this._deliveryMethodsService = deliveryMethodsService;
    this._validator = validator;

    autoBind(this);
  }

  async postOrdersHandler(request, h) {
    const {
      paymentMethodId, paymentImage, deliveryMethodId, note,
    } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._validator.validateOrderPayload(request.payload);
    await this._validator.validatePaymentImageHeaders(paymentImage.hapi.headers);

    await this._paymentMethodsService.verifyPaymentMethod({
      customerId: credentialId, paymentMethodId,
    });
    await this._deliveryMethodsService.verifyDeliveryMethod({
      customerId: credentialId, deliveryMethodId,
    });

    const order = await this._service.createOrder({
      customerId: credentialId, paymentMethodId, paymentImage, deliveryMethodId, note,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil membuat order',
      data: {
        order,
      },
    });
    response.code(201);
    return response;
  }

  async getCustomerOrderListHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const orders = await this._service.getCustomerOrderList(credentialId);

    return {
      status: 'success',
      data: {
        orders,
      },
    };
  }

  async getMemberOrderListHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const orders = await this._service.getMemberOrderList(credentialId);

    return {
      status: 'success',
      data: {
        orders,
      },
    };
  }

  async getMemberOrderDetailHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyOrderMember(id, credentialId);
    const order = await this._service.getOrderById(id);

    return {
      status: 'success',
      data: {
        order,
      },
    };
  }

  async getCustomerOrderDetailHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyOrderCustomer(id, credentialId);
    const order = await this._service.getOrderById(id);

    return {
      status: 'success',
      data: {
        order,
      },
    };
  }

  async changeOrderStatusHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._validator.validateOrderStatusPayload(request.payload);
    await this._service.verifyOrderMember(id, credentialId);
    const order = await this._service.changeOrderStatus(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui status order',
      data: {
        order,
      },
    };
  }
}

module.exports = OrdersHandler;
