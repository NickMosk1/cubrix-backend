import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SEED_USERS } from './seed-data';

export async function seedUsers(manager: EntityManager): Promise<User[]> {
  const repository = manager.getRepository(User);
  const users: User[] = [];

  for (const seedUser of SEED_USERS) {
    const existingUser = await repository.findOne({
      where: [{ email: seedUser.email }, { username: seedUser.username }],
    });

    const password = await bcrypt.hash(seedUser.password, 10);

    const user = repository.create({
      ...(existingUser ?? {}),
      id: existingUser?.id ?? seedUser.id,
      username: seedUser.username,
      email: seedUser.email,
      password,
      role: seedUser.role,
    });

    users.push(await repository.save(user));
  }

  return users;
}
