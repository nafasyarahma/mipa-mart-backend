const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CartsService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  // -- MENAMBAHKAN PRODUK KE KERANJANG --
  async addItemToCart({ customerId, productId, quantity }) {
    const id = `cartitem-${nanoid(16)}`;

    // memeriksa apakah produk yang ditambahkan ada di db
    const product = await this._prisma.product.findFirst({
      where: {
        id: productId,
      },
    });
    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }
    // dapatkan member_id dari product yang ditambahkan
    const productMemberId = product.member_id;

    // periksa item di cart
    const cartItems = await this._prisma.cartItem.findMany({
      where: {
        customer_id: customerId,
      },
    });

    // jika ada item, dapatkan data member_id dari produk pertama di keranjang
    if (cartItems.length > 0) {
      const firstProductInCart = cartItems[0];
      const firstProductId = firstProductInCart.product_id;
      const firstProduct = await this._prisma.product.findUnique({
        where: {
          id: firstProductId,
        },
      });
      const cartMemberId = firstProduct.member_id;

      // jika member_id produk yang ditambahkan tidak sama dengan member id pada item di ketanjang
      if (productMemberId !== cartMemberId) {
        throw new InvariantError('Produk yang ditambahkan harus berasal dari penjual yang sama. Harap hapus terlebih dahulu produk dalam keranjang');
      }
    }

    const result = await this._prisma.cartItem.create({
      data: {
        id, customer_id: customerId, product_id: productId, quantity,
      },
    });

    if (!result.id) {
      throw new InvariantError('Gagal menambahkan produk ke keranjang');
    }
    return result.id;
  }

  // -- MENDAPATKAN PRODUK DALAM CART
  async getCarts(customerId) {
    const result = await this._prisma.cartItem.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        product: true,
      },
    });
    return result;
  }

  // -- MENGUBAH JUMLAH PRODUK --
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
  }

  // -- MENGHAPUS ITEM DARI CART
  async removeItemFromCart(id) {
    await this._prisma.cartItem.delete({
      where: {
        id,
      },
    });
  }

  async verifyCartItemCustomer(id, customerId) {
    const result = await this._prisma.cartItem.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Item tidak ditemukan pada cart');
    }

    const cartItemCustoner = result.customer_id;

    if (cartItemCustoner !== customerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CartsService;
