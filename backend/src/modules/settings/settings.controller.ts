import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './dto/settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async findAll(@Request() req: AuthRequest) {
    return this.settingsService.findAll(req.user.id);
  }

  @Patch()
  async update(@Request() req: AuthRequest, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(req.user.id, dto);
  }
}
