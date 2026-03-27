import dataSource from '../data-source';
import { Balance } from '../../balance/entities/balance.entity';
import { Transaction } from '../../balance/entities/transaction.entity';
import { Collection } from '../../collection/entities/collection.entity';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { seedBalances } from './balances.seeder';
import { seedCollections } from './collections.seeder';
import { seedProducts } from './products.seeder';
import { SEED_USER_PASSWORDS } from './seed-data';
import { seedTransactions } from './transactions.seeder';
import { seedUsers } from './users.seeder';

async function isDatabaseEmpty(): Promise<boolean> {
  const [
    usersCount,
    collectionsCount,
    productsCount,
    balancesCount,
    transactionsCount,
  ] = await Promise.all([
    dataSource.getRepository(User).count(),
    dataSource.getRepository(Collection).count(),
    dataSource.getRepository(Product).count(),
    dataSource.getRepository(Balance).count(),
    dataSource.getRepository(Transaction).count(),
  ]);

  return (
    usersCount === 0 &&
    collectionsCount === 0 &&
    productsCount === 0 &&
    balancesCount === 0 &&
    transactionsCount === 0
  );
}

async function runSeeds(): Promise<void> {
  await dataSource.initialize();

  try {
    const shouldSeed = await isDatabaseEmpty();

    if (!shouldSeed) {
      console.log('Database is not empty. Skipping seeds.');
      return;
    }

    await dataSource.transaction(async (manager) => {
      await seedUsers(manager);
      await seedCollections(manager);
      await seedProducts(manager);
      await seedBalances(manager);
      await seedTransactions(manager);
    });

    console.log('Seed completed successfully.');
    console.log(`Admin credentials: admin / ${SEED_USER_PASSWORDS.admin}`);
    console.log(
      `User credentials: builder_anna / ${SEED_USER_PASSWORDS.user}, brick_max / ${SEED_USER_PASSWORDS.user}`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void runSeeds().catch((error: unknown) => {
  console.error('Seed failed.');
  console.error(error);
  process.exitCode = 1;
});
