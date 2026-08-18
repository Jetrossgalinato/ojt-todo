import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';

interface AuthRequest extends Request {
  user: { id: string; email: string; name: string | null };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport redirects to Google — this handler is never reached
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req: AuthRequest, @Res() res: Response) {
    const auth = this.authService.googleLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const token = JSON.stringify(auth.accessToken);
    const user = JSON.stringify(auth.user);
    const origin = JSON.stringify(frontendUrl);

    res.send(`<!DOCTYPE html><html><body><script>
(function(){
  var t=${token},u=${user},o=${origin};
  if(window.opener){window.opener.postMessage({token:t,user:u},o);window.close();}
  else{window.location.href=o+'/auth/callback?token='+t;}
})();</script></body></html>`);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() dto: { name?: string; email?: string },
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: AuthRequest,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Request() req: AuthRequest) {
    return this.authService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  async updatePreferences(
    @Request() req: AuthRequest,
    @Body()
    dto: {
      defaultView?: string;
      timezone?: string;
      theme?: string;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    },
  ) {
    return this.authService.updatePreferences(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Request() req: AuthRequest,
    @Body() dto: { password: string },
  ) {
    return this.authService.deleteAccount(req.user.id, dto.password);
  }
}
