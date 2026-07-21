import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './todos.controller';
import { TasksService } from './dto/tasks.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

describe('TasksController', () => {
  let controller: TasksController;

  const mockUserId = 'user-uuid-123';

  const mockTask = {
    id: 'task-uuid-123',
    title: 'Test Task',
    description: 'A test task',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-07-25',
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

  const mockReq = { user: { id: mockUserId } } as unknown as AuthRequest;

  const mockTasksService = {
    findAll: jest.fn(),
    getStats: jest.fn(),
    findToday: jest.fn(),
    getTodayStats: jest.fn(),
    findUpcoming: jest.fn(),
    getUpcomingStats: jest.fn(),
    findCompleted: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    toggleComplete: jest.fn(),
    restore: jest.fn(),
    batchDelete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const result = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockTasksService.findAll.mockResolvedValue(result);

      const req = mockReq;
      const output = await controller.findAll(req);

      expect(output).toEqual(result.data);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(mockUserId, {
        page: undefined,
        limit: undefined,
        priority: undefined,
        listId: undefined,
        tag: undefined,
        status: undefined,
        sort: undefined,
      });
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      mockTasksService.create.mockResolvedValue(mockTask);

      const req = mockReq;
      const dto = { title: 'Test Task' };
      const output = await controller.create(req, dto);

      expect(output).toEqual(mockTask);
      expect(mockTasksService.create).toHaveBeenCalledWith(mockUserId, dto);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const req = mockReq;
      const output = await controller.findOne(req, 'task-uuid-123');

      expect(output).toEqual(mockTask);
      expect(mockTasksService.findOne).toHaveBeenCalledWith(
        mockUserId,
        'task-uuid-123',
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updated = { ...mockTask, title: 'Updated Task' };
      mockTasksService.update.mockResolvedValue(updated);

      const req = mockReq;
      const dto = { title: 'Updated Task' };
      const output = await controller.update(req, 'task-uuid-123', dto);

      expect(output).toEqual(updated);
      expect(mockTasksService.update).toHaveBeenCalledWith(
        mockUserId,
        'task-uuid-123',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(mockTask);

      const req = mockReq;
      const output = await controller.remove(req, 'task-uuid-123');

      expect(output).toEqual(mockTask);
      expect(mockTasksService.remove).toHaveBeenCalledWith(
        mockUserId,
        'task-uuid-123',
      );
    });
  });

  describe('toggleComplete', () => {
    it('should toggle task completion', async () => {
      const completed = {
        ...mockTask,
        status: 'completed',
        completedAt: new Date(),
      };
      mockTasksService.toggleComplete.mockResolvedValue(completed);

      const req = mockReq;
      const output = await controller.toggleComplete(req, 'task-uuid-123');

      expect(output).toEqual(completed);
      expect(mockTasksService.toggleComplete).toHaveBeenCalledWith(
        mockUserId,
        'task-uuid-123',
      );
    });
  });

  describe('batchDelete', () => {
    it('should batch delete tasks', async () => {
      mockTasksService.batchDelete.mockResolvedValue({ deleted: 2 });

      const req = mockReq;
      const output = await controller.batchDelete(req, { ids: ['id1', 'id2'] });

      expect(output).toEqual({ deleted: 2 });
      expect(mockTasksService.batchDelete).toHaveBeenCalledWith(mockUserId, [
        'id1',
        'id2',
      ]);
    });
  });
});
