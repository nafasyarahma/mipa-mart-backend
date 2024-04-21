/* eslint-disable no-restricted-syntax */
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
      name, description, price, status, productImages, categoryId,
    } = request.payload;

    if (Array.isArray(productImages)) {
      for (const image of productImages) {
        this._validator.validateImageHeaders(image.hapi.headers);
      }
    } else {
      this._validator.validateImageHeaders(productImages.hapi.headers);
    }

    const { id: credentialId } = request.auth.credentials;

    const productId = await this._service.addProduct({
      name, description, price, status, productImages, categoryId, memberId: credentialId,
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

  async getMemberProductsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const products = await this._service.getMemberProducts(credentialId);

    return {
      status: 'success',
      data: {
        products,
      },
    };
  }

  async getAllProductsHandler(request) {
    const products = await this._service.getAllProducts(request.query);

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
    const { id: credentialId } = request.auth.credentials;
    const { productImages } = request.payload;

    if (Array.isArray(productImages)) {
      for (const image of productImages) {
        this._validator.validateImageHeaders(image.hapi.headers);
      }
    } else {
      this._validator.validateImageHeaders(productImages.hapi.headers);
    }

    await this._service.verifyProductMember(id, credentialId);
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
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyProductMember(id, credentialId);
    await this._service.deleteProductById(id);

    return {
      status: 'success',
      message: 'Produk berhasil dihapus',
    };
  }
}

module.exports = ProductsHandler;
