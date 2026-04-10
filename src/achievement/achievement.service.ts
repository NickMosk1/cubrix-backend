import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Transaction } from '../balance/entities/transaction.entity';
import { TransactionType } from '../balance/interfaces/transaction-type.enum';
import { Collection } from '../collection/entities/collection.entity';
import { Product } from '../product/entities/product.entity';
import { AchievementListResponseDto } from './dto/achievement-list-response.dto';
import { AchievementResponseDto } from './dto/achievement-response.dto';
import { GetAchievementsQueryDto } from './dto/get-achievements-query.dto';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(
    userId: string,
    query: GetAchievementsQueryDto,
  ): Promise<AchievementListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const [collections, totalItems] =
      await this.collectionRepository.findAndCount({
        skip: offset,
        take: limit,
        order: { name: 'ASC' },
      });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      totalPages,
      hasPreviousPage: totalPages > 0 && page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
      limit,
      offset,
      items: await this.toAchievementResponseDtos(userId, collections),
    };
  }

  private async toAchievementResponseDtos(
    userId: string,
    collections: Collection[],
  ): Promise<AchievementResponseDto[]> {
    if (collections.length === 0) {
      return [];
    }

    const collectionIds = collections.map((collection) => collection.id);
    const products = await this.productRepository.find({
      select: {
        id: true,
        collectionId: true,
      },
      where: {
        collectionId: In(collectionIds),
      },
    });

    const totalProductsCountByCollectionId = new Map<string, number>();
    const collectedProductsCountByCollectionId = new Map<string, number>();

    for (const collectionId of collectionIds) {
      totalProductsCountByCollectionId.set(collectionId, 0);
      collectedProductsCountByCollectionId.set(collectionId, 0);
    }

    const productIds = products.map((product) => product.id);
    const purchasedProductIds = new Set<string>();

    if (productIds.length > 0) {
      const purchasedProducts = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('DISTINCT transaction.productId', 'productId')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.type = :type', {
          type: TransactionType.PURCHASE,
        })
        .andWhere('transaction.productId IN (:...productIds)', { productIds })
        .getRawMany<{ productId: string | null }>();

      for (const { productId } of purchasedProducts) {
        if (productId) {
          purchasedProductIds.add(productId);
        }
      }
    }

    for (const product of products) {
      if (!product.collectionId) {
        continue;
      }

      totalProductsCountByCollectionId.set(
        product.collectionId,
        (totalProductsCountByCollectionId.get(product.collectionId) ?? 0) + 1,
      );

      if (purchasedProductIds.has(product.id)) {
        collectedProductsCountByCollectionId.set(
          product.collectionId,
          (collectedProductsCountByCollectionId.get(product.collectionId) ?? 0) +
            1,
        );
      }
    }

    return collections.map((collection) => {
      const totalProductsCount =
        totalProductsCountByCollectionId.get(collection.id) ?? 0;
      const collectedProductsCount =
        collectedProductsCountByCollectionId.get(collection.id) ?? 0;

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        logo: collection.logo,
        collectedProductsCount,
        totalProductsCount,
        isCompleted:
          totalProductsCount > 0 &&
          collectedProductsCount === totalProductsCount,
      };
    });
  }
}
