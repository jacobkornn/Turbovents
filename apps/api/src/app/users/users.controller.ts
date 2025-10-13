import { Post, Body, Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './create-user.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
  
@Post('register')
register(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
}
