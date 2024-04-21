/* eslint-disable consistent-return */
const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class OrdersService {
  constructor(storageService) {
    this._prisma = new PrismaClient();
    this._storageService = storageService;
  }

  async createOrder({
    customerId, paymentMethodId, paymentImage, deliveryMethodId, note,
  }) {
    return this._prisma.$transaction(async (tx) => {
      // mendapatkan semua cart item
      const cartItems = await tx.cartItem.findMany({
        where: {
          customer_id: customerId,
        },
        include: {
          product: true,
        },
      });

      // jika kosong tampilkan pesan
      if (cartItems.length === 0) {
        throw new NotFoundError('Keranjang kosong. Harap tambahkan produk');
      }

      const id = `order-${nanoid(16)}`;
      const memberId = cartItems[0].product.member_id;

      // hitung total harga
      const price = cartItems.reduce((prev, current) => {
        return prev + (current.quantity * current.product.price);
      }, 0);

      const paymentImageUrl = await this.handlePaymentImage(paymentImage);

      // buat order dan product order
      const order = await tx.order.create({
        data: {
          id,
          customer_id: customerId,
          member_id: memberId,
          total_price: price,
          payment_method_id: paymentMethodId,
          payment_image: paymentImageUrl,
          delivery_method_id: deliveryMethodId,
          note,
          products: {
            create: cartItems.map(cart => {
              return {
                product_id: cart.product_id,
                quantity: cart.quantity,
              };
            }),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          customer_id: customerId,
        },
      });

      if (!order) {
        throw new InvariantError('Gagal membuat order');
      }
      return order;
    });
  }

  async getCustomerOrderList(customerId) {
    const result = await this._prisma.order.findMany({
      where: {
        customer_id: customerId,
      },
    });

    return result;
  }

  async getMemberOrderList(memberId) {
    const result = await this._prisma.order.findMany({
      where: {
        member_id: memberId,
      },
    });

    return result;
  }

  async getOrderById(id) {
    const result = await this._prisma.order.findFirst({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });
    if (!result) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }
    return result;
  }

  // ================= MEMBER SCOPE ====================
  async changeOrderStatus(id, { status }) {
    const result = await this._prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui status');
    }
    return result;
  }

  async handlePaymentImage(paymentImage) {
    if (paymentImage && paymentImage.hapi && paymentImage.hapi.filename) {
      // Jika gambar pembayaran ada, simpan file dan dapatkan URL-nya
      const filename = await this._storageService.writeFile(paymentImage, paymentImage.hapi);
      const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/payment/${filename}`;
      return imageUrl;
    }
    // Jika tidak ada gambar pembayaran, kembalikan null
    return null;
  }

  // Memeriksa apakah produk milik member yang sesuai
  async verifyOrderMember(id, memberId) {
    const result = await this._prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Order tidak ditemukan');
    }

    const orderMember = result.member_id;

    if (orderMember !== memberId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyOrderCustomer(id, customerId) {
    const result = await this._prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Order tidak ditemukan');
    }

    const orderCustomer = result.customer_id;

    if (orderCustomer !== customerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = OrdersService;
