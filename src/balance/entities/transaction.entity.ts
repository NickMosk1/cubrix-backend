import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from '../interfaces/transaction-type.enum';

@Index('IDX_transactions_productId', ['productId'])
@Index('IDX_transactions_collectionId', ['collectionId'])
@Index('UQ_transactions_user_product_type', ['userId', 'productId', 'type'], {
  unique: true,
})
@Index(
  'UQ_transactions_user_collection_type',
  ['userId', 'collectionId', 'type'],
  {
    unique: true,
  },
)
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: 'deposit' | 'purchase' | 'achievement_reward';

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  collectionId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
