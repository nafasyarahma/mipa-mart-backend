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
    const { name, category } = request.query;
    const products = await this._service.getAllProducts({ name, category });

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
        if (typeof image !== 'string') {
          this._validator.validateImageHeaders(image.hapi.headers);
        }
      }
    } else if (typeof productImages !== 'string') {
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

  async putProductStatusByIdHandler(request) {
    this._validator.validateProductStatusPayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyProductMember(id, credentialId);
    await this._service.editProductStatusById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui status produk',
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

  async postProductReview(request) {
    await this._validator.validateProductReviewPayload(request.payload);

    const productId = request.params.id;
    const { id: customerId } = request.auth.credentials;
    const { comment, orderId } = request.payload;

    await this._service.checkIfProductPurchased(customerId, productId);
    await this._service.checkIfProductReviewed(customerId, productId, orderId);
    await this._service.addProductReview(customerId, productId, orderId, comment);

    return {
      status: 'success',
      message: 'Berhasil menambahkan ulasan',
    };
  }

  async getProductReviewsHandler(request) {
    const { id } = request.params;

    const reviews = await this._service.getProductReviews(id);

    return {
      status: 'success',
      data: {
        reviews,
      },
    };
  }
}

module.exports = ProductsHandler;
