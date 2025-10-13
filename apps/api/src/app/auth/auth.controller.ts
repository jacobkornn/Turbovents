import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    const user = this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) return { error: 'Invalid credentials' };
    return this.authService.login(user);
  }
}