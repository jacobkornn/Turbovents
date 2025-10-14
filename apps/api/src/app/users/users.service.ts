import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users = [
    { id: 1, username: 'admin', password: 'password', role: 'admin' },
    { id: 2, username: 'user', password: '123456', role: 'user' },
  ];

  findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  async create(user: { username: string; password: string; role: string }) {
    const exists = this.users.find(u => u.username === user.username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const id = this.users.length + 1;
    const newUser = { id, username: user.username, password: hashedPassword, role: user.role };
    this.users.push(newUser);
    return { id: newUser.id, username: newUser.username };
  }

  promoteRole(id: number, role: string) {
  const user = this.users.find(u => u.id === id);
  if (!user) throw new BadRequestException('User not found');
  user.role = role;
  return { id: user.id, username: user.username, role: user.role };
}

}