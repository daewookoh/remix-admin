import { prisma } from "~/lib/prisma.server";

export const productService = {
  // 모든 제품 가져오기 (이미지 포함)
  async getAll() {
    return await prisma.product.findMany({
      include: {
        images: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // ID로 제품 가져오기
  async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // 제품 생성 (Admin only)
  async create(data: {
    name: string;
    description: string | null;
    price: number;
    adminId: string;
  }) {
    return await prisma.product.create({
      data,
      include: {
        images: true,
      },
    });
  },

  // 제품 업데이트
  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      price?: number;
    }
  ) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    });
  },

  // 제품 삭제
  async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  },

  // 이미지 추가
  async addImage(productId: string, url: string, publicId: string) {
    return await prisma.image.create({
      data: {
        url,
        publicId,
        productId,
      },
    });
  },

  // 이미지 삭제
  async deleteImage(imageId: string) {
    return await prisma.image.delete({
      where: { id: imageId },
    });
  },
};
