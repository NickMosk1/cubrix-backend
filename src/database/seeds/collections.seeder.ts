import { EntityManager } from 'typeorm';
import { Collection } from '../../collection/entities/collection.entity';
import { SEED_COLLECTIONS } from './seed-data';

export async function seedCollections(
  manager: EntityManager,
): Promise<Collection[]> {
  const repository = manager.getRepository(Collection);

  const collections = repository.create(
    SEED_COLLECTIONS.map((collection) => ({
      ...collection,
    })),
  );

  return repository.save(collections);
}
