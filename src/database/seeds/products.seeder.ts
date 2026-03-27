import { EntityManager } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { SEED_PRODUCTS } from './seed-data';

export async function seedProducts(manager: EntityManager): Promise<Product[]> {
  const repository = manager.getRepository(Product);

  const products = repository.create(
    SEED_PRODUCTS.map((product) => ({
      ...product,
    })),
  );

  return repository.save(products);
}
