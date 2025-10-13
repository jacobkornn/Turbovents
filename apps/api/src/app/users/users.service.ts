import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users = [
    { id: 1, username: 'admin', password: 'password' },
    { id: 2, username: 'user', password: '123456' },
  ];

  findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  async create(user: { username: string; password: string }) {
    const exists = this.users.find(u => u.username === user.username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const id = this.users.length + 1;
    const newUser = { id, username: user.username, password: hashedPassword };
    this.users.push(newUser);
    return { id: newUser.id, username: newUser.username };
  }
}