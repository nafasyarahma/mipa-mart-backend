const autoBind = require('auto-bind');

class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCategoryHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);
    const { name, description } = request.payload;
    const categoryId = await this._service.addCategory({ name, description });

    const response = h.response({
      status: 'success',
      message: 'Kategori berhasil ditambahkan',
      data: {
        categoryId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllCategoryHandler() {
    const categories = await this._service.getAllCategories();

    return {
      status: 'success',
      data: {
        categories,
      },
    };
  }

  async putCategoryByIdHandler(request) {
    this._validator.validateCategoryPayload(request.payload);
    const { id } = request.params;

    const category = await this._service.editCategoryById(id, request.payload);

    return {
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: {
        category,
      },
    };
  }

  async deleteCategoryByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteCategoryById(id);

    return {
      status: 'success',
      message: 'Kategori berhasil dihapus',
    };
  }
}

module.exports = CategoriesHandler;
