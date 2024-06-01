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
    });
    return result;
  }

  /* MENDAPATKAN SEMUA PRODUK */
  async getAllProducts({ name }) {
    const whereClause = {};
    if (name) {
      whereClause.name = {
        contains: name, // Filter berdasarkan nama (menggunakan pencarian "contains")
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
    name, description, price, status, productImages,
  }) {
    // Hapus gambar-gambar lama terkait dengan produk
    await this.deleteProductFromStorage(id);

    // Tambahkan gambar-gambar baru
    await this.addProductImages(productImages, id);

    const result = await this._prisma.product.update({
      where: {
        id,
      },
      data: {
        name, description, price, status,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui produk');
    }

    // dev mode
    return result;
  }

  /* MENGHAPUS PRODUK */
  async deleteProductById(id) {
    await this.deleteProductFromStorage(id);

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
          const filename = await this._storageService.writeFile(image, image.hapi);
          const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/product/${filename}`;

          const savedImage = await this._prisma.productImages.create({
            data: {
              product_id: productId,
              url: imageUrl,
            },
          });
          uploadedImages.push(savedImage);
        }
      } else if (images !== null) {
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
  async deleteProductFromStorage(productId) {
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

    await this._prisma.productImages.deleteMany({
      where: {
        product_id: productId,
      },
    });
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
}

module.exports = ProductsService;
