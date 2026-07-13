import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './dto/todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Get()
  findAll(@Request() req) {
    return this.todosService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateTodoDto) {
    return this.todosService.create(req.user.id, dto);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.todosService.remove(req.user.id, id);
  }
}
