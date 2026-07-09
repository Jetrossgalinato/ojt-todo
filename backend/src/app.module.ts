import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthModule as RegisterAuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [DatabaseModule, AuthModule, RegisterAuthModule, CartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}