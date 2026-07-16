import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './dto/lists.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
