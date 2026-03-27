import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from './entities/product.entity';

export const toProductResponseDto = (product: Product): ProductResponseDto => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    collectionId: product.collectionId ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};
