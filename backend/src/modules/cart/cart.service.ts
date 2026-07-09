import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
  }
}