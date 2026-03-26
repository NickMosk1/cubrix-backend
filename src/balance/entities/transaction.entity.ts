import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['deposit', 'purchase'],
  })
  type: 'deposit' | 'purchase';

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}