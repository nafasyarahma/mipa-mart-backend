/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { PrismaClient } = require('@prisma/client');
const autoBind = require('auto-bind');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ProductsService {
  constructor(storageService) {
    this._prisma = new PrismaClient();
    this._storageService = storageService;

    autoBind(this);
  }

  /* MENAMBAHKAN PRODUK */
  async addProduct({
    name, description, price, status, productImages, categoryId, memberId,
  }) {
    const id = `product-${nanoid(16)}`;

    const productData = {
      id,
      name,
      description,
      price,
      status,
      member_id: memberId,
    };

    if (categoryId) {
      productData.category_id = categoryId;
    }

    const result = await this._prisma.product.create({
      data: productData,
    });

    await this.addProductImages(productImages, id);

    if (!result.id) {
      throw new InvariantError('Kategori gagal ditambahkan');
    }
    return result.id;
  }

  /* MENDAPATKAN PRODUK YANG DIMILIKI MEMBER */
  async getMemberProducts(memberId) {
    const result = await this._prisma.product.findMany({
      where: {
        member_id: memberId,
      },
      include: {
        category: true,
      },
    });
    return result;
  }

  /* MENDAPATKAN SEMUA PRODUK */
  async getAllProducts({ name, category }) {
    const whereClause = {};
    if (name) {
      whereClause.name = {
        contains: name, // Filter berdasarkan nama (menggunakan pencarian "contains")
      };
    }

    if (category) {
      whereClause.category = {
        name: {
          equals: category, // Filter berdasarkan kategori menggunakan pencarian "contains"
        },
      };
    }

    const result = await this._prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          select: {
            url: true,
          },
        },
        category: true,
      },
    });

    // Memproses hasil untuk hanya mengembalikan gambar pada indeks ke-0
    const processedResult = result.map(product => {
      if (product.images && product.images.length > 0) {
        // eslint-disable-next-line no-param-reassign
        product.images = product.images[0].url; // Hanya mengambil gambar pada indeks ke-0
      }
      return product;
    });

    return processedResult;
  }

  /* MENDAPATKAN DETAIL PRODUK */
  async getProductById(id) {
    if (!id) {
      throw new NotFoundError('ID produk tidak valid');
    }
    const result = await this._prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
        seller: {
          select: {
            email: true,
            name: true,
            no_wa: true,
            address: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundError('Gagal mendapatkan detail produk');
    }

    // Transform the images data to match the desired format
    const imagesArray = result.images.map(image => {
      const { url } = image;
      return url;
    });

    // Create the modified result with the desired structure
    const modifiedResult = {
      ...result,
      images: imagesArray,
    };

    return modifiedResult;
  }

  /* MENGEDIT DETAIL PRODUK */
  async editProductById(id, {
    name, description, price, status, productImages, categoryId,
  }) {
    const product = await this._prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    const updateData = {
      name,
      description,
      price,
      status,
    };

    // Perbarui category_id hanya jika categoryId dikirim
    if (categoryId !== undefined) {
      updateData.category_id = categoryId || null;
    }

    // Proses gambar baru jika ada
    if (productImages !== undefined) {
    // Hapus gambar-gambar lama terkait dengan produk
      const oldImages = product.images.map(image => image.url);

      let newUrls = [];

      if (Array.isArray(productImages)) {
        // Filter gambar baru untuk menemukan file baru yang diupload
        const newUploadedImages = productImages.filter(image => typeof image !== 'string');
        newUrls = productImages.filter(image => typeof image === 'string');

        // Tambahkan URL dari gambar yang baru diupload ke newUrls
        const uploadedImageUrls = await this.addProductImages(newUploadedImages, id);
        newUrls.push(...uploadedImageUrls.map(image => image.url));
      } else if (productImages !== null) {
        // Jika productImages adalah objek tunggal (file atau URL)
        if (typeof productImages === 'string') {
          newUrls.push(productImages);
        } else {
          const uploadedImageUrls = await this.addProductImages([productImages], id);
          newUrls.push(...uploadedImageUrls.map(image => image.url));
        }
      }

      await this.deleteRemovedImageFromStorage(id, oldImages, newUrls);
    }

    const result = await this._prisma.product.update({
      where: {
        id,
      },
      data: updateData,
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui produk');
    }

    // // dev mode
    // return result;
  }

  /* MENGUBAH STATUS PRODUK */
  async editProductStatusById(id, { status }) {
    await this.checkProductId(id);

    const result = await this._prisma.product.update({
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

  /* MENGHAPUS PRODUK */
  async deleteProductById(id) {
    await this.deleteProductImageFromStorage(id);

    await this._prisma.product.delete({
      where: {
        id,
      },
    });
  }

  // Menampahkan Foto Produk
  async addProductImages(images, productId) {
    try {
      const uploadedImages = [];

      if (Array.isArray(images)) {
        // Jika images adalah array (multiple file)
        for (const image of images) {
          let imageUrl;
          if (typeof image === 'string') {
            imageUrl = image;
          } else {
            const filename = await this._storageService.writeFile(image, image.hapi);
            imageUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/product/${filename}`;
          }

          const savedImage = await this._prisma.productImages.create({
            data: {
              product_id: productId,
              url: imageUrl,
            },
          });
          uploadedImages.push(savedImage);
        }
      } else if (images !== null && images.hapi && images.hapi.headers) {
        // Jika images adalah objek tunggal (file tunggal)
        const filename = await this._storageService.writeFile(images, images.hapi);
        const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/product/${filename}`;
        const savedImage = await this._prisma.productImages.create({
          data: {
            product_id: productId,
            url: imageUrl,
          },
        });
        uploadedImages.push(savedImage);
      }

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // Menghapus Gambar dari Direktori saat Gambar Dihapus --
  async deleteRemovedImageFromStorage(productId, oldImages, newUrls) {
    for (const oldImage of oldImages) {
      if (!newUrls.includes(oldImage)) {
        // Memisahkan bagian URL berdasarkan tanda '/'

        const parts = oldImage.split('/');
        // Mengambil nama file dari bagian terakhir array
        const fileName = parts[parts.length - 1];

        const imagePath = path.resolve(__dirname, `../../../static/upload/images/product/${fileName}`);

        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) throw err;
          });
        }

        // hapus gambar dari db yg tidak ada pada newUrls
        await this._prisma.productImages.deleteMany({
          where: {
            AND: [
              { product_id: productId },
              { url: oldImage },
            ],
          },
        });
      }
    }
  }

  async addProductReview(customerId, productId, orderId, comment) {
    const id = `review-${nanoid(16)}`;
    const review = await this._prisma.review.create({
      data: {
        id,
        customer_id: customerId,
        product_id: productId,
        order_id: orderId,
        comment,
      },
    });

    if (!review.id) {
      throw new Error('Gagal menambahkan ulasan');
    }

    return review.id;
  }

  // Mengecek id produk di db
  async checkProductId(id) {
    const productId = await this._prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!productId || id === null) {
      throw new NotFoundError('Id produk tidak ditemukan');
    }
  }

  async deleteProductImageFromStorage(productId) {
    const productImages = await this._prisma.productImages.findMany({
      where: {
        product_id: productId,
      },
    });

    for (const image of productImages) {
      // Memisahkan bagian URL berdasarkan tanda '/'
      const parts = image.url.split('/');
      // Mengambil nama file dari bagian terakhir array
      const fileName = parts[parts.length - 1];

      const imagePath = path.resolve(__dirname, `../../../static/upload/images/product/${fileName}`);

      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) throw err;
        });
      }
    }
  }

  // Memeriksa apakah produk milik member yang sesuai
  async verifyProductMember(id, memberId) {
    const result = await this._prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    const productMember = result.member_id;

    if (productMember !== memberId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async checkIfProductPurchased(customerId, productId) {
    // Query untuk memeriksa apakah produk telah dibeli oleh pelanggan
    const purchasedProducts = await this._prisma.orderProduct.findMany({
      where: {
        AND: [
          { order: { customer_id: customerId } },
          { product_id: productId },
        ],
      },
    });

    if (purchasedProducts.length === 0) {
      throw new AuthorizationError('Anda belum membeli produk ini');
    }
  }

  async checkIfProductReviewed(customerId, productId, orderId) {
    const existingReview = await this._prisma.review.findFirst({
      where: {
        AND: [
          { customer_id: customerId },
          { product_id: productId },
          { order_id: orderId },
        ],
      },
    });

    if (existingReview) {
      throw new InvariantError('Anda sudah memberikan ulasan untuk produk ini pada pesanan ini.');
    }
  }

  async getProductReviews(productId) {
    const reviews = await this._prisma.review.findMany({
      where: {
        product_id: productId,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!reviews) {
      throw new Error('Gagal mengambil ulasan');
    }

    return reviews;
  }
}

module.exports = ProductsService;
