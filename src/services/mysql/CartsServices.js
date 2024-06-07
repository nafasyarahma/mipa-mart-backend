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
    const id = `cartitem-${nanoid(16)}`;

    // periksa apakah produk yang ditambahkan ada di db
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

    // // periksa item di cart
    // const firstCartItem = await this._prisma.cartItem.findFirst({
    //   where: {
    //     customer_id: customerId,
    //   },
    //   include: {
    //     product: true,
    //   },
    // });

    const { cartItems } = await this.getCarts();

    for (const item of cartItems) {
      if (item.product_id === productId) {
        throw new InvariantError('Produk sudah ada di keranjang');
      }
    }

    if (cartItems.length > 0) {
      const cartMemberId = cartItems[0].product.member_id;
      if (productMemberId !== cartMemberId) {
        throw new InvariantError('Produk yang ditambahkan harus berasal dari penjual yang sama. Harap hapus terlebih dahulu produk dalam keranjang');
      }
    }

    // // jika cart tidak kosong
    // if (firstCartItem) {
    //   const cartMemberId = firstCartItem.product.member_id;
    //   // Periksa apakah `member_id` produk yang ingin ditambahkan sesuai dengan `cartMemberId`
    //   if (productMemberId !== cartMemberId) {
    //     throw new InvariantError('Produk yang ditambahkan harus berasal dari penjual yang sama.
    // Harap hapus terlebih dahulu produk dalam keranjang');
    //   }
    // }

    const result = await this._prisma.cartItem.create({
      data: {
        id,
        customer_id: customerId,
        product_id: productId,
        quantity,
      },
    });

    if (!result.id) {
      throw new InvariantError('Gagal menambahkan produk ke keranjang');
    }
    return result.id;
  }

  /* MENDAPATKAN PRODUK DALAM CART */
  async getCarts(customerId) {
    const cartItems = await this._prisma.cartItem.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        product: {
          include: {
            images: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    const processedResult = cartItems.map(item => {
      if (item.product.images && item.product.images.length > 0) {
        // eslint-disable-next-line no-param-reassign
        item.product.images = item.product.images[0].url; // Hanya mengambil gambar pada indeks ke-0
      }
      return item;
    });

    const totalPrice = cartItems.reduce((prev, current) => {
      return prev + (current.quantity * current.product.price);
    }, 0);

    return {
      cartItems: processedResult,
      totalPrice,
    };
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
  }

  /* MENGHAPUS ITEM DARI CART */
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
