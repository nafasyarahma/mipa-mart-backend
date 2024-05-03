const autoBind = require('auto-bind');

class CategoriesHandler {
  constructor(service, adminService, validator) {
    this._service = service;
    this._adminService = adminService;
    this._validator = validator;

    autoBind(this);
  }

  async postCategoryHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const categoryId = await this._service.addCategory(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan kategori',
      data: {
        categoryId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllCategoryHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const categories = await this._service.getAllCategories();

    return {
      status: 'success',
      data: {
        categories,
      },
    };
  }

  async putCategoryByIdHandler(request) {
    this._validator.validatePutCategoryPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    await this._service.editCategoryById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui kategori',
    };
  }

  async deleteCategoryByIdHandler(request) {
    const { role: credentialRole } = request.auth.credentials;

    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;
    await this._service.deleteCategoryById(id);

    return {
      status: 'success',
      message: 'Berhasil menghapus kategori',
    };
  }
}

module.exports = CategoriesHandler;
