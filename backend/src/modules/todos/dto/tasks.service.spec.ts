import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../../database/prisma.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockUserId = 'user-uuid-123';
  const mockTaskId = 'task-uuid-123';

  const mockTaskRecord = {
    id: mockTaskId,
    title: 'Test Task',
    description: 'A test task',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2026-07-25'),
    dueTime: '10:00:00',
    completedAt: null,
    starred: false,
    userId: mockUserId,
    listId: null,
    list: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    tag: {
      upsert: jest.fn(),
    },
    taskTag: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      prismaMock.task.findMany.mockResolvedValue([mockTaskRecord]);
      prismaMock.task.count.mockResolvedValue(1);

      const result = await service.findAll(mockUserId, {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].title).toBe('Test Task');
    });

    it('should apply priority filter', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(0);

      await service.findAll(mockUserId, { priority: 'high' });

      const findManyCall = prismaMock.task.findMany.mock.calls[0] as Array<{
        where: Record<string, unknown>;
      }>;
      expect(findManyCall[0].where.priority).toBe('high');
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      prismaMock.task.findFirst.mockResolvedValue(mockTaskRecord);

      const result = await service.findOne(mockUserId, mockTaskId);
      expect(result.title).toBe('Test Task');
    });

    it('should throw NotFoundException when task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      prismaMock.task.create.mockResolvedValue(mockTaskRecord);

      const result = await service.create(mockUserId, {
        title: 'Test Task',
      });

      expect(result.title).toBe('Test Task');
      expect(prismaMock.task.create).toHaveBeenCalled();
    });

    it('should create task with listId', async () => {
      const taskWithList = { ...mockTaskRecord, listId: 'list-1' };
      prismaMock.task.create.mockResolvedValue(taskWithList);

      const result = await service.create(mockUserId, {
        title: 'Task with list',
        listId: 'list-1',
      });

      expect(result.listId).toBe('list-1');
    });

    it('should upsert tags by name', async () => {
      prismaMock.tag.upsert.mockResolvedValue({ id: 'tag-1', name: 'work' });
      prismaMock.task.create.mockResolvedValue({
        ...mockTaskRecord,
        tags: [{ Tag: { id: 'tag-1', name: 'work' } }],
      });

      const result = await service.create(mockUserId, {
        title: 'Tagged task',
        tags: ['work'],
      });

      expect(prismaMock.tag.upsert).toHaveBeenCalledWith({
        where: { userId_name: { userId: mockUserId, name: 'work' } },
        create: { name: 'work', userId: mockUserId },
        update: {},
      });
      expect(result.tags).toEqual([{ id: 'tag-1', name: 'work' }]);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      prismaMock.task.findFirst.mockResolvedValue(mockTaskRecord);
      const updated = { ...mockTaskRecord, title: 'Updated' };
      prismaMock.task.update.mockResolvedValue(updated);

      const result = await service.update(mockUserId, mockTaskId, {
        title: 'Updated',
      });

      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException when task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockUserId, 'nonexistent', { title: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      prismaMock.task.findFirst.mockResolvedValue(mockTaskRecord);
      prismaMock.task.delete.mockResolvedValue(mockTaskRecord);

      const result = await service.remove(mockUserId, mockTaskId);
      expect(result).toEqual(mockTaskRecord);
    });

    it('should throw NotFoundException when task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleComplete', () => {
    it('should mark pending task as completed', async () => {
      prismaMock.task.findFirst.mockResolvedValue(mockTaskRecord);
      const completed = {
        ...mockTaskRecord,
        status: 'completed',
        completedAt: new Date(),
      };
      prismaMock.task.update.mockResolvedValue(completed);

      const result = await service.toggleComplete(mockUserId, mockTaskId);
      expect(result.status).toBe('completed');
    });

    it('should mark completed task as pending', async () => {
      const completedTask = {
        ...mockTaskRecord,
        status: 'completed',
        completedAt: new Date(),
      };
      prismaMock.task.findFirst.mockResolvedValue(completedTask);
      prismaMock.task.update.mockResolvedValue(mockTaskRecord);

      const result = await service.toggleComplete(mockUserId, mockTaskId);
      expect(result.status).toBe('pending');
    });
  });

  describe('restore', () => {
    it('should restore a completed task', async () => {
      const completedTask = {
        ...mockTaskRecord,
        status: 'completed',
        completedAt: new Date(),
      };
      prismaMock.task.findFirst.mockResolvedValue(completedTask);
      prismaMock.task.update.mockResolvedValue(mockTaskRecord);

      const result = await service.restore(mockUserId, mockTaskId);
      expect(result.status).toBe('pending');
    });

    it('should throw BadRequestException if task is not completed', async () => {
      prismaMock.task.findFirst.mockResolvedValue(mockTaskRecord);

      await expect(service.restore(mockUserId, mockTaskId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('batchDelete', () => {
    it('should batch delete tasks', async () => {
      prismaMock.task.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.batchDelete(mockUserId, ['id1', 'id2']);
      expect(result.deleted).toBe(2);
    });

    it('should throw BadRequestException when no IDs provided', async () => {
      await expect(service.batchDelete(mockUserId, [])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStats', () => {
    it('should return task stats', async () => {
      prismaMock.task.count
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(3) // completed
        .mockResolvedValueOnce(1) // overdue
        .mockResolvedValueOnce(8); // total

      const result = await service.getStats(mockUserId);
      expect(result).toEqual({
        pending: 5,
        completed: 3,
        overdue: 1,
        total: 8,
      });
    });
  });
});
