import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ListsService } from './dto/lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private listsService: ListsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.listsService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateListDto) {
    return this.listsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string },
  ) {
    return this.listsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.listsService.remove(req.user.id, id);
  }
}
