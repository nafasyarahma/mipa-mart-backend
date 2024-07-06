const autoBind = require('auto-bind');

class CartsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postItemToCartHandler(request, h) {
    this._validator.validateCartPayload(request.payload);

    const { productId, quantity } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const cartId = await this._service.addItemToCart({
      customerId: credentialId, productId, quantity,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan item ke keranjang',
      data: {
        cartId,
      },
    });
    response.code(201);
    return response;
  }

  async getCartsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const carts = await this._service.getCarts(credentialId);

    return {
      status: 'success',
      data: {
        carts,
      },
    };
  }

  async getCartByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyCartCustomer(id, credentialId);
    const cart = await this._service.getCartById(id);

    return {
      status: 'success',
      data: {
        cart,
      },
    };
  }

  async putQuantityHandler(request) {
    this._validator.validateQuantityPayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyCartItemCustomer(id, credentialId);
    await this._service.changeQuantity(id, request.payload);

    return {
      status: 'success',
      message: 'Kuantitas berhasil diperbarui',
    };
  }

  async deleteItemFromCartHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyCartItemCustomer(id, credentialId);
    await this._service.removeItemFromCart(id);

    return {
      status: 'success',
      message: 'Item berhasil dihapus dari cart',
    };
  }
}

module.exports = CartsHandler;
