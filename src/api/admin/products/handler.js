const autoBind = require('auto-bind');

class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postProductHandler(request, h) {
    this._validator.validateProductPayload(request.payload);
    const {
      name, description, price, status, categoryId,
    } = request.payload;

    const productId = await this._service.addProduct({
      name, description, price, status, categoryId,
    });

    const response = h.response({
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data: {
        productId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllProductsHandler() {
    const products = await this._service.getAllProducts();

    return {
      status: 'success',
      data: {
        products,
      },
    };
  }

  async getProductByIdHandler(request) {
    const { id } = request.params;

    const product = await this._service.getProductById(id);

    return {
      status: 'success',
      data: {
        product,
      },
    };
  }

  async putProductByIdHandler(request) {
    this._validator.validateProductPayload(request.payload);
    const { id } = request.params;

    const product = await this._service.editProductById(id, request.payload);

    return {
      status: 'success',
      message: 'Produk berhasil diperbarui',
      data: {
        product,
      },
    };
  }

  async deleteProductByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteProductById(id);

    return {
      status: 'success',
      message: 'Produk berhasil dihapus',
    };
  }
}

module.exports = ProductsHandler;
