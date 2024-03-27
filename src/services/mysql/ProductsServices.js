/* eslint-disable no-restricted-syntax */
const { PrismaClient } = require('@prisma/client');
const autoBind = require('auto-bind');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ProductsService {
  constructor(storageService) {
    this._prisma = new PrismaClient();
    this._storageService = storageService;

    autoBind(this);
  }

  async addProduct({
    name, description, price, status, productImages, categoryId,
  }) {
    const id = `product-${nanoid(16)}`;

    const result = await this._prisma.product.create({
      data: {
        id,
        name,
        description,
        price,
        status,
        category_id: categoryId,
        member_id: 'member-Yj8_ctWY0pNv3su6',
      },
    });

    await this.addProductImages(productImages, id);

    if (!result.id) {
      throw new InvariantError('Kategori gagal ditambahkan');
    }
    return result.id;
  }

  // Mendapatkan semua produk
  async getAllProducts() {
    const result = await this._prisma.product.findMany();
    return result;
  }

  // Mendapatkan detail produk
  async getProductById(id) {
    await this.checkProductId(id);
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

  // Mengedit Produk berdasarkan id
  async editProductById(id, {
    name, description, price, status,
  }) {
    await this.checkProductId(id);
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
    return result;
  }

  async deleteProductById(id) {
    await this.checkProductId(id);
    await this.deleteProductFromStorage(id);

    await this._prisma.product.delete({
      where: {
        id,
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

  async addProductImages(images, productId) {
    try {
      const uploadedImages = await Promise.all(images.map(async (image) => {
        const filename = await this._storageService.writeFile(image, image.hapi);
        const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/product/${filename}`;

        const savedImage = await this._prisma.productImages.create({
          data: {
            product_id: productId,
            url: imageUrl,
          },
        });
        return savedImage;
      }));

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // delete from storage
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
  }
}

module.exports = ProductsService;
