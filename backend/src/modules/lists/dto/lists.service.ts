import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateListDto } from './create-list.dto';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.list.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async create(userId: string, dto: CreateListDto) {
    const existing = await this.prisma.list.findFirst({
      where: { userId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('List already exists');
    }

    return this.prisma.list.create({
      data: { name: dto.name, userId },
    });
  }

  async update(userId: string, id: string, dto: { name?: string }) {
    const list = await this.prisma.list.findFirst({ where: { id, userId } });
    if (!list) throw new NotFoundException('List not found');

    if (dto.name && dto.name !== list.name) {
      const existing = await this.prisma.list.findFirst({
        where: { userId, name: dto.name },
      });
      if (existing) throw new ConflictException('List name already exists');
    }

    return this.prisma.list.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(userId: string, id: string) {
    const list = await this.prisma.list.findFirst({ where: { id, userId } });
    if (!list) throw new NotFoundException('List not found');

    return this.prisma.list.delete({ where: { id } });
  }
}
