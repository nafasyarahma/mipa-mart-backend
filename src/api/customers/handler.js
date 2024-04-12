const autoBind = require('auto-bind');

class CustomersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCustomerHandler(request, h) {
    this._validator.validateCustomerPayload(request.payload);

    const customerId = await this._service.addCustomer(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Customer berhasil ditambahkan',
      data: {
        customerId,
      },
    });
    response.code(201);
    return response;
  }

  async getAllCustomersHandler() {
    const customers = await this._service.getAllCustomers();

    return {
      status: 'success',
      data: {
        customers,
      },
    };
  }

  async getCustomerByIdHandler(request) {
    const { id } = request.params;

    const customer = await this._service.getCustomerById(id);

    return {
      status: 'success',
      data: {
        customer,
      },
    };
  }

  async putCustomerByIdHandler(request) {
    this._validator.validateCustomerPayload(request.payload);
    const { id } = request.params;

    const customer = await this._service.editCustomerById(id, request.payload);

    return {
      status: 'success',
      message: 'Data customer berhasil diperbarui',
      data: {
        customer,
      },
    };
  }

  async deleteCustomerByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteCustomerById(id);

    return {
      status: 'success',
      message: 'Customer berhasil dihapus',
    };
  }
}

module.exports = CustomersHandler;
