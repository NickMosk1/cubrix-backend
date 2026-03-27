import { EntityManager } from 'typeorm';
import { Transaction } from '../../balance/entities/transaction.entity';
import { SEED_TRANSACTIONS } from './seed-data';

export async function seedTransactions(
  manager: EntityManager,
): Promise<Transaction[]> {
  const repository = manager.getRepository(Transaction);

  const transactions = repository.create(
    SEED_TRANSACTIONS.map((transaction) => ({
      ...transaction,
    })),
  );

  return repository.save(transactions);
}
