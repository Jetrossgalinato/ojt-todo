import { Module } from '@nestjs/common';
import { TasksController } from './todos.controller';
import { TasksService } from './dto/tasks.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TodosModule {}
