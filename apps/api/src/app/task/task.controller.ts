import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../user/users.service';

@Controller('tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req) {
    console.log('Incoming DTO:', dto);
    console.log('User from JWT:', req.user);

    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.taskService.createTask(dto, user);
  }
}