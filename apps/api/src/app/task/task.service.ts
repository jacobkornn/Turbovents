import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async getScopedTasks(user: User): Promise<Task[]> {
    const query = this.taskRepo.createQueryBuilder('task')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.organization', 'org');

    if (user.role === 'owner') {
      return query.getMany();
    }

    // if (user.role === 'admin') {
    //   return query.where('task.organizationId = :orgId', { orgId: user.organizationId }).getMany();
    // }

    return query.where('task.assignedToId = :userId OR task.ownerId = :userId', { userId: user.id }).getMany();
  }
}