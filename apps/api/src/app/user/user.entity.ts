import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
//import { Organization } from '../organization/organization.entity';
import { Task } from '../task/task.entity';

export type UserRole = 'viewer' | 'admin' | 'owner';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: 'viewer' })
  role: UserRole;

//   @ManyToOne(() => Organization, org => org.users)
//   organization: Organization;

  @OneToMany(() => Task, task => task.owner)
  tasksOwned: Task[];

  @OneToMany(() => Task, task => task.assignedTo)
  tasksAssigned: Task[];
}