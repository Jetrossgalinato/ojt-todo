import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTodoDto } from './create-todo.dto';
import { UpdateTodoDto } from './update-todo.dto';

function normalizeTodo(todo: any) {
  return {
    ...todo,
    list: todo.listName ?? '',
    dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '',
    dueTime: todo.dueTime ?? '',
  };
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const todos = await this.prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return todos.map(normalizeTodo);
  }

  async create(userId: string, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueTime: dto.dueTime ?? null,
        priority: dto.priority ?? 'medium',
        tags: dto.tags ?? null,
        listName: (dto as any).list ?? dto.listName ?? null,
        userId,
      },
    });

    return normalizeTodo(todo);
  }

  async update(userId: string, id: string, dto: UpdateTodoDto) {
    const todo = await this.prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) throw new NotFoundException('Task not found');

    const updated = await this.prisma.todo.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description ?? null }
          : {}),
        dueDate:
          dto.dueDate !== undefined
            ? dto.dueDate
              ? new Date(dto.dueDate)
              : null
            : undefined,
        dueTime: dto.dueTime ?? undefined,
        priority: dto.priority ?? undefined,
        tags: dto.tags ?? undefined,
        listName:
          (dto as any).list !== undefined
            ? (dto as any).list
            : dto.listName !== undefined
              ? dto.listName
              : undefined,
        completed: dto.completed ?? undefined,
      },
    });

    return normalizeTodo(updated);
  }

  async remove(userId: string, id: string) {
    const todo = await this.prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) throw new NotFoundException('Task not found');

    return this.prisma.todo.delete({ where: { id } });
  }
}
