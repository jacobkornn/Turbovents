import { Injectable } from '@nestjs/common';

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
}