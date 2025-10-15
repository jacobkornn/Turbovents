import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      username: 'admin',
      password: 'password', // optionally hash this if needed
      role: UserRole.ADMIN,
      tasksOwned: [],
      tasksAssigned: [],
    },
  ];

  findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  findById(id: number): User | null {
    const raw = this.users.find(user => user.id === id);
    if (!raw) return null;

    const user = new User();
    user.id = raw.id;
    user.username = raw.username;
    user.password = raw.password;
    user.role = raw.role;
    user.tasksOwned = raw.tasksOwned;
    user.tasksAssigned = raw.tasksAssigned;
    return user;
  }

  async create(user: { username: string; password: string; role: string }) {
    const exists = this.users.find(u => u.username === user.username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const id = this.users.length + 1;
    const newUser = {
      id,
      username: user.username,
      password: hashedPassword,
      role: user.role === 'admin' ? UserRole.ADMIN : UserRole.VIEWER,
      tasksOwned: [],
      tasksAssigned: [],
    };
    this.users.push(newUser);
    return { id: newUser.id, username: newUser.username };
  }

  promoteRole(id: number, role: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new BadRequestException('User not found');
    user.role = role === 'admin' ? UserRole.ADMIN : UserRole.VIEWER;
    return { id: user.id, username: user.username, role: user.role };
  }
}