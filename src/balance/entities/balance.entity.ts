import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column({ type: 'int', default: 0 })
  value: number;

  @UpdateDateColumn()
  updatedAt: Date;
}