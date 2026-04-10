import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Balance } from 'src/balance/entities/balance.entity';
import { Transaction } from 'src/balance/entities/transaction.entity';
import { TransactionResponseDto } from 'src/balance/dto/transaction-response.dto';
import { TransactionType } from 'src/balance/interfaces/transaction-type.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { toProductResponseDto } from './product.mapper';

const ACHIEVEMENT_REWARD_AMOUNT = 1000;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      image: createProductDto.image ?? null,
      collectionId: null,
    });

    const savedProduct = await this.productRepository.save(product);
    return this.toResponseDto(savedProduct);
  }

  async findAll(query: GetProductsQueryDto): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const [products, totalItems] = await this.productRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      totalPages,
      hasPreviousPage: totalPages > 0 && page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
      limit,
      offset,
      items: products.map(toProductResponseDto),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponseDto(product);
  }

  async purchase(
    userId: string,
    id: string,
  ): Promise<TransactionResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      let balance = await queryRunner.manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        balance = queryRunner.manager.create(Balance, {
          userId,
          value: 0,
        });
        balance = await queryRunner.manager.save(balance);
      }

      const existingPurchase = await queryRunner.manager.findOne(Transaction, {
        where: {
          userId,
          type: TransactionType.PURCHASE,
          productId: product.id,
        },
      });

      if (existingPurchase) {
        throw new BadRequestException('Product already purchased');
      }

      if (balance.value < product.price) {
        throw new BadRequestException('Insufficient balance');
      }

      const purchaseTransaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.PURCHASE,
        amount: product.price,
        productId: product.id,
      });

      const savedPurchaseTransaction =
        await queryRunner.manager.save(purchaseTransaction);

      balance.value -= product.price;
      await queryRunner.manager.save(balance);

      if (product.collectionId) {
        await this.rewardCompletedAchievement(
          queryRunner.manager,
          userId,
          product.collectionId,
          balance,
        );
      }

      await queryRunner.commitTransaction();

      return this.toTransactionResponseDto(savedPurchaseTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = this.productRepository.merge(product, {
      ...updateProductDto,
      image: updateProductDto.image ?? product.image,
    });

    const savedProduct = await this.productRepository.save(updatedProduct);
    return this.toResponseDto(savedProduct);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  private toResponseDto(product: Product): ProductResponseDto {
    return toProductResponseDto(product);
  }

  private toTransactionResponseDto(
    transaction: Transaction,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      productId: transaction.productId ?? null,
      collectionId: transaction.collectionId ?? null,
      createdAt: transaction.createdAt,
    };
  }

  private async rewardCompletedAchievement(
    manager: EntityManager,
    userId: string,
    collectionId: string,
    balance: Balance,
  ): Promise<void> {
    const collectionProducts = await manager
      .getRepository(Product)
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .where('product.collectionId = :collectionId', { collectionId })
      .getRawMany<{ id: string }>();

    const productIds = collectionProducts.map(({ id: productId }) => productId);

    if (productIds.length === 0) {
      return;
    }

    const purchasedProducts = await manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .select('DISTINCT transaction.productId', 'productId')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.PURCHASE,
      })
      .andWhere('transaction.productId IN (:...productIds)', { productIds })
      .getRawMany<{ productId: string | null }>();

    const collectedProductsCount = purchasedProducts.reduce(
      (count, { productId }) => (productId ? count + 1 : count),
      0,
    );

    if (collectedProductsCount !== productIds.length) {
      return;
    }

    const existingReward = await manager.findOne(Transaction, {
      where: {
        userId,
        type: TransactionType.ACHIEVEMENT_REWARD,
        collectionId,
      },
    });

    if (existingReward) {
      return;
    }

    const rewardTransaction = manager.create(Transaction, {
      userId,
      type: TransactionType.ACHIEVEMENT_REWARD,
      amount: ACHIEVEMENT_REWARD_AMOUNT,
      collectionId,
    });

    await manager.save(rewardTransaction);

    balance.value += ACHIEVEMENT_REWARD_AMOUNT;
    await manager.save(balance);
  }
}
