import { Module } from '@nestjs/common';
import { TodosModule } from './modules/todos/todos.module';
import { ListsModule } from './modules/lists/lists.module';
import { TagsModule } from './modules/tags/tags.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule, AuthModule, TodosModule, ListsModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
