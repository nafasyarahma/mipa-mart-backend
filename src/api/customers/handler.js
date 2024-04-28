const autoBind = require('auto-bind');

class CustomersHandler {
  constructor(service, adminService, emailService, validator) {
    this._service = service;
    this._adminService = adminService;
    this._emailService = emailService;
    this._validator = validator;

    autoBind(this);
  }

  /* ================================ CUSTOMER SCOPE ================================ */

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

  async getCustomerProfileHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const customer = await this._service.getCustomerById(credentialId);

    return {
      status: 'success',
      data: {
        customer,
      },
    };
  }

  async putCustomerProfileHandler(request) {
    this._validator.validatePutCustomerPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    const customer = await this._service.editCustomerById(credentialId, request.payload);

    return {
      status: 'success',
      message: 'Data Member berhasil diperbarui. Jika email diubah harap verifikasi segera',
      data: {
        customer,
      },
    };
  }

  async postCustomerEmailVerification(request) {
    const { id: credentialId } = request.auth.credentials;
    const customer = await this._service.getCustomerById(credentialId);
    const { email } = customer.email;

    await this._emailService.sendEmailVerification(credentialId, email);

    return {
      status: 'success',
      message: 'Email verifikasi berhasil dikirimkan',
    };
  }

  /* ================================ ADMIN SCOPE ================================ */

  async getAllCustomersHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const customers = await this._service.getAllCustomers();

    return {
      status: 'success',
      data: {
        customers,
      },
    };
  }

  async getCustomerByIdHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

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
    this._validator.validatePutCustomerPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

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
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    await this._service.deleteCustomerById(id);

    return {
      status: 'success',
      message: 'Customer berhasil dihapus',
    };
  }

  /* ================================ COMMON ================================ */

  async verifyCustomerEmailHandler(request) {
    const { token } = request.params;

    const jwtPayload = this._emailService.verifyEmail(token);
    const { id } = jwtPayload;
    await this._service.changeEmailVerifStatus(id);

    return {
      status: 'success',
      message: 'Email berhasil diverifikasi',
    };
  }

  async customerForgotPasswordHandler(request) {
    const { email } = request.payload;

    const customerData = await this._service.checkCustomerEmail(email);
    const checkedEmail = customerData.email;
    const { id } = customerData.id;

    await this._emailService.sendResetPasswordEmail(id, checkedEmail);

    return {
      status: 'success',
      message: 'Berhasil mengirimkan email. Periksa kotak masuk untuk mendapatkan link reset password',
    };
  }

  async resetCustomerPasswordHandler(request) {
    const { token } = request.params;
    const { password, confirmPassword } = request.payload;

    const jwtPayload = this._emailService.verifyEmail(token);
    const { email } = jwtPayload;

    await this._service.resetCustomerPassword(email, password, confirmPassword);

    return {
      status: 'success',
      message: 'Berhasil memperbarui password',
    };
  }
}

module.exports = CustomersHandler;
