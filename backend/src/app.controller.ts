import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('setup-todo-table')
  async setupTodoTable() {
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Todo" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "description" text,
        "completed" boolean NOT NULL DEFAULT false,
        "userId" text NOT NULL,
        "dueDate" timestamp with time zone,
        "dueTime" text,
        "priority" text NOT NULL DEFAULT 'medium',
        "tags" text,
        "listName" text,
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `;

    await this.prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Todo_userId_index" ON "Todo" ("userId");
    `;

    return { message: 'Todo table is ready' };
  }
}
