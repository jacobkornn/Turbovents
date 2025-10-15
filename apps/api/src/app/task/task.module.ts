import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersModule } from '../user/users.module'; 
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    UsersModule, // ✅ Add this to make UsersService available
  ],
  providers: [TaskService, JwtAuthGuard],
  controllers: [TaskController],
})
export class TaskModule {}