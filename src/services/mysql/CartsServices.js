/* eslint-disable no-param-reassign */
/* eslint-disable no-cond-assign */
/* eslint-disable no-restricted-syntax */
const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CartsService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  /* MENAMBAHKAN PRODUK KE KERANJANG */
  async addItemToCart({ customerId, productId, quantity }) {
    // periksa apakah produk yang ditambahkan ada di db
    const product = await this._prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    if (product.status === 'soldout') {
      throw new InvariantError('Produk ini sudah habis');
    }

    // dapatkan member_id dari product yang ditambahkan
    const memberId = product.member_id;

    // Temukan keranjang dengan member dan customer yang sama
    let cart = await this._prisma.cart.findFirst({
      where: {
        customer_id: customerId,
        member_id: memberId,
      },
      include: {
        cartItems: true,
      },
    });

    // Jika tidak ada, buat keranjang baru
    if (!cart) {
      const cartId = `cart-${nanoid(16)}`;
      cart = await this._prisma.cart.create({
        data: {
          id: cartId,
          customer_id: customerId,
          member_id: memberId,
          total_price: 0,
        },
      });
    }

    if (!cart.cartItems) {
      cart.cartItems = [];
    }

    // periksa apakah produk sudah ada di keranjang
    const existingItem = cart.cartItems.find(item => item.product_id === productId);

    // jika produk ada, tambah kuantitas
    if (existingItem) {
      await this._prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    } else {
      // jika produk belum ada, tambahkan
      await this._prisma.cartItem.create({
        data: {
          id: `cartitem-${nanoid(16)}`,
          cart_id: cart.id,
          product_id: productId,
          quantity,
        },
      });
    }

    await this.updateCartTotalPrice(cart.id);

    return cart.id;
  }

  /* MENDAPATKAN SEMUA CART */
  async getCarts(customerId) {
    const carts = await this._prisma.cart.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
        cartItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    const processedResult = carts.map(cart => {
      cart.cartItems.map(item => {
        if (item.product.images.length > 0) {
          item.product.images = item.product.images[0].url;
        }
        return item;
      });
      return cart;
    });

    return processedResult;
  }

  /* MENDAPATKAN CART BY ID */
  async getCartById(id) {
    const cart = await this._prisma.cart.findUnique({
      where: {
        id,
      },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new InvariantError('Keranjang tidak ditemukan');
    }

    return cart;
  }

  /* MENGUBAH JUMLAH PRODUK */
  async changeQuantity(id, { quantity }) {
    const result = await this._prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui kuantitas');
    }

    await this.updateCartTotalPrice(result.cart_id);
  }

  /* MENGHAPUS ITEM DARI CART */
  async removeItemFromCart(id) {
    const cartItem = await this._prisma.cartItem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        cart_id: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    await this._prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    const cartId = cartItem.cart_id;
    await this.updateCartTotalPrice(cartId);

    const currentItems = await this._prisma.cartItem.findMany({
      where: {
        cart_id: cartId,
      },
    });

    if (currentItems.length === 0) {
      await this._prisma.cart.delete({
        where: {
          id: cartId,
        },
      });
    }
  }

  async verifyCartItemCustomer(id, customerId) {
    const item = await this._prisma.cartItem.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      throw new NotFoundError('Item tidak ditemukan pada cart');
    }

    const cartId = item.cart_id;

    const cart = await this._prisma.cart.findUnique({
      where: {
        id: cartId,
      },
    });

    const cartCustomerId = cart.customer_id;

    if (cartCustomerId !== customerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyCartCustomer(id, customerId) {
    const cart = await this._prisma.cart.findUnique({
      where: {
        id,
      },
    });

    const cartCustomerId = cart.customer_id;

    if (cartCustomerId !== customerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async updateCartTotalPrice(cartId) {
    // perbarui total harga keranjang
    const cartItems = await this._prisma.cartItem.findMany({
      where: {
        cart_id: cartId,
      },
      include: {
        product: true,
      },
    });

    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.quantity * item.product.price);
    }, 0);

    await this._prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        total_price: totalPrice,
      },
    });
  }
}

module.exports = CartsService;
