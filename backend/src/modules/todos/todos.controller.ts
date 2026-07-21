import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './dto/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('priority') priority?: string,
    @Query('listId') listId?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.tasksService.findAll(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      priority,
      listId,
      tag,
      status,
      sort,
    });
  }

  @Get('stats')
  getStats(@Request() req: AuthRequest) {
    return this.tasksService.getStats(req.user.id);
  }

  @Get('today')
  findToday(
    @Request() req: AuthRequest,
    @Query('includeOverdue') includeOverdue?: string,
  ) {
    return this.tasksService.findToday(req.user.id, includeOverdue !== 'false');
  }

  @Get('stats/today')
  getTodayStats(@Request() req: AuthRequest) {
    return this.tasksService.getTodayStats(req.user.id);
  }

  @Get('upcoming')
  findUpcoming(@Request() req: AuthRequest) {
    return this.tasksService.findUpcoming(req.user.id);
  }

  @Get('stats/upcoming')
  getUpcomingStats(@Request() req: AuthRequest) {
    return this.tasksService.getUpcomingStats(req.user.id);
  }

  @Get('completed')
  findCompleted(
    @Request() req: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.findCompleted(req.user.id, {
      from,
      to,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.id, id, dto);
  }

  @Patch(':id/complete')
  toggleComplete(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.toggleComplete(req.user.id, id);
  }

  @Patch(':id/restore')
  restore(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.restore(req.user.id, id);
  }

  @Delete('batch')
  batchDelete(@Request() req: AuthRequest, @Body() body: { ids: string[] }) {
    return this.tasksService.batchDelete(req.user.id, body.ids);
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(req.user.id, id);
  }
}
