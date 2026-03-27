import { EntityManager } from 'typeorm';
import { Balance } from '../../balance/entities/balance.entity';
import { SEED_BALANCES } from './seed-data';

export async function seedBalances(manager: EntityManager): Promise<Balance[]> {
  const repository = manager.getRepository(Balance);
  const balances: Balance[] = [];

  for (const seedBalance of SEED_BALANCES) {
    const existingBalance = await repository.findOne({
      where: { userId: seedBalance.userId },
    });

    const balance = repository.create({
      ...(existingBalance ?? {}),
      id: existingBalance?.id ?? seedBalance.id,
      userId: seedBalance.userId,
      value: seedBalance.value,
    });

    balances.push(await repository.save(balance));
  }

  return balances;
}
