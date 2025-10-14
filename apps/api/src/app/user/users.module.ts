import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SeedAdminService } from './seed-admin.service';
import { PromoteRoleController } from './promote-role.controller';


@Module({
  providers: [UsersService, SeedAdminService],
  controllers: [UsersController, PromoteRoleController],
})
export class UsersModule {}