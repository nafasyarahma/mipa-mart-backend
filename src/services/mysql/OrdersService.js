/* eslint-disable no-restricted-syntax */
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

  /* MEMBUAT ORDER */
  async createOrder({
    customerId, cartId, paymentMethodId, paymentImage, deliveryMethodId, note,
  }) {
    return this._prisma.$transaction(async (tx) => {
      // mendapatkan semua cart item
      const cart = await tx.cart.findUnique({
        where: {
          id: cartId,
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

      // jika kosong tampilkan pesan
      if (!cart) {
        throw new NotFoundError('Keranjang tidak ditemukan');
      }

      for (const item of cart.cartItems) {
        if (item.product.status !== 'ready' && item.product.status !== 'preorder') {
          throw new InvariantError(`Produk ${item.product.name} telah habis. Silahkan pesan kembali saat produk sudah tersedia.`);
        }
      }

      const id = `order-${nanoid(16)}`;
      const memberId = cart.member_id;

      const totalPrice = cart.total_price;

      // Mengunggah gambar pembayaran jika ada
      const paymentImageUrl = await this.handlePaymentImage(paymentImage);

      // Membuat order baru
      const order = await tx.order.create({
        data: {
          id,
          customer_id: customerId,
          member_id: memberId,
          total_price: totalPrice,
          payment_image: paymentImageUrl,
          note,
        },
      });

      // Menambahkan produk ke tabel order produk
      const orderProducts = cart.cartItems.map(item => ({
        order_id: id,
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0].url,
        quantity: item.quantity,
      }));

      await tx.orderProduct.createMany({ data: orderProducts });

      // Mengambil data metode pembayaran
      const paymentMethod = await tx.paymentMethod.findUnique({
        where: {
          id: paymentMethodId,
        },
      });

      if (!paymentMethod) {
        throw new NotFoundError('Metode pembayaran tidak ditemukan.');
      }

      await tx.orderPaymentMethod.create({
        data: {
          order_id: id,
          provider: paymentMethod.provider,
          no_account: paymentMethod.no_account,
          name: paymentMethod.name,
        },
      });

      // Mengambil data metode pengririman
      const deliveryMethod = await tx.deliveryMethod.findUnique({
        where: {
          id: deliveryMethodId,
        },
      });

      if (!deliveryMethod) {
        throw new NotFoundError('Metode pengiriman tidak ditemukan.');
      }

      await tx.orderDeliveryMethod.create({
        data: {
          order_id: id,
          method: deliveryMethod.method,
          description: deliveryMethod.description,
        },
      });

      await tx.cart.delete({
        where: {
          id: cartId,
        },
      });

      if (!order.id) {
        throw new InvariantError('Gagal membuat order');
      }
      return order.id;
    });
  }

  /* MENDAPATKAN DATA ORDER CUSTOMER TERTENTU */
  async getCustomerOrderList(customerId) {
    const result = await this._prisma.order.findMany({
      where: {
        customer_id: customerId,
        order_status: {
          in: ['pending', 'processed', 'ready'],
        },
      },
    });

    return result;
  }

  async getCustomerOrderHistory(customerId) {
    const result = await this._prisma.order.findMany({
      where: {
        customer_id: customerId,
        order_status: {
          in: ['completed', 'rejected', 'canceled'],
        },
      },
      include: {
        reviews: true,
        products: true,
      },

    });
    return result;
  }

  /* MENDAPATKAN SEMUA ORDER MEMBER */
  async getMemberOrderList(memberId) {
    const result = await this._prisma.order.findMany({
      where: {
        member_id: memberId,
        order_status: {
          in: ['pending', 'processed', 'ready'],
        },
      },
      include: {
        payment_method: true,
        delivery_method: true,
      },
    });

    return result;
  }

  /* MENDAPATKAN SEMUA ORDER MEMBER DENGAN STATUS COMPLETED */
  async getMemberOrderHistory(memberId) {
    const result = await this._prisma.order.findMany({
      where: {
        member_id: memberId,
        order_status: {
          in: ['completed', 'rejected', 'canceled'],
        },
      },
      include: {
        payment_method: true,
        delivery_method: true,
      },
    });

    return result;
  }

  /* MENDAPATKAN DETAIL ORDER */
  async getOrderById(id) {
    const order = await this._prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
        payment_method: true,
        delivery_method: true,
        member: {
          select: {
            name: true,
            email: true,
            no_wa: true,
            address: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            no_wa: true,
            address: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }
    return order;
  }

  /* MENGUBAH STATUS ORDER */
  async changeOrderStatus(id, { orderStatus }) {
    const result = await this._prisma.order.update({
      where: {
        id,
      },
      data: {
        order_status: orderStatus,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui status');
    }
    return result;
  }

  /* MENGUBAH STATUS PEMBAYARAN */
  async changePaymentStatus(id, { paymentStatus }) {
    const result = await this._prisma.order.update({
      where: {
        id,
      },
      data: {
        payment_status: paymentStatus,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui status pembayaran');
    }
    return result;
  }

  /* MENANGANI GAMBAR BUKTI PEMBAYARAN */
  async handlePaymentImage(paymentImage) {
    if (paymentImage && paymentImage.hapi && paymentImage.hapi.filename) {
      // Jika gambar pembayaran ada, simpan file dan dapatkan URL-nya
      const filename = await this._storageService.writeFile(paymentImage, paymentImage.hapi);
      const imageUrl = `${process.env.BE_URL}/upload/images/payment/${filename}`;
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

  /* MEMVERIFIKASI ORDER MILIK CUSTOMER YANG SAH */
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

  /* CEK STATUS ORDER, HANYA PENDING YG DAPAT DICANCEL */
  async checkIfOrderCancelable(orderId) {
    const order = await this._prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order tidak ditemukan');
    }

    if (order.order_status !== 'pending') {
      throw new InvariantError('Anda sudah tidak dapat membatalkan pesanan ini');
    }
  }

  async getOrderReviewHistory(orderId, customerId) {
    const reviews = await this._prisma.review.findMany({
      where: {
        AND: [
          { customer_id: customerId },
          { order_id: orderId },
        ],
      },
      include: {
        product: true,
      },
    });
    if (!reviews) {
      throw new NotFoundError('Ulasan tidak ditemukan');
    }
    return reviews;
  }
}

module.exports = OrdersService;
