import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTagDto } from './create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async create(userId: string, dto: CreateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: { userId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.create({
      data: { name: dto.name, userId },
    });
  }

  async update(userId: string, id: string, dto: { name?: string }) {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) throw new NotFoundException('Tag not found');

    if (dto.name && dto.name !== tag.name) {
      const existing = await this.prisma.tag.findFirst({
        where: { userId, name: dto.name },
      });
      if (existing) throw new ConflictException('Tag name already exists');
    }

    return this.prisma.tag.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(userId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) throw new NotFoundException('Tag not found');

    return this.prisma.tag.delete({ where: { id } });
  }
}
