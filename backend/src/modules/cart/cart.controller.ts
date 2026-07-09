import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity?: number,
  ) {
    return this.cartService.addToCart(userId, productId, quantity);
  }
}