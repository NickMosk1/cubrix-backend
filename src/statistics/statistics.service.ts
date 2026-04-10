import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Balance } from '../balance/entities/balance.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { TransactionType } from '../balance/interfaces/transaction-type.enum';
import { Collection } from '../collection/entities/collection.entity';
import { Product } from '../product/entities/product.entity';
import { StatisticsResponseDto } from './dto/statistics-response.dto';

type TransactionAggregateRow = {
  transactionsCount: string | number | null;
  totalDeposited: string | number | null;
  totalSpent: string | number | null;
  achievementRewardsCount: string | number | null;
  achievementRewardsAmount: string | number | null;
};

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCurrentUserStatistics(
    userId: string,
  ): Promise<StatisticsResponseDto> {
    const [
      balance,
      totalAchievementsCount,
      transactionAggregates,
      collectionProducts,
      purchasedProducts,
    ] = await Promise.all([
      this.balanceRepository.findOne({
        select: {
          value: true,
        },
        where: { userId },
      }),
      this.collectionRepository.count(),
      this.getTransactionAggregates(userId),
      this.productRepository.find({
        select: {
          id: true,
          collectionId: true,
        },
        where: {
          collectionId: Not(IsNull()),
        },
      }),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('DISTINCT transaction.productId', 'productId')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.type = :purchaseType', {
          purchaseType: TransactionType.PURCHASE,
        })
        .andWhere('transaction.productId IS NOT NULL')
        .getRawMany<{ productId: string | null }>(),
    ]);

    const purchasedProductIds = new Set<string>();

    for (const { productId } of purchasedProducts) {
      if (productId) {
        purchasedProductIds.add(productId);
      }
    }

    const collectionProgress = new Map<
      string,
      {
        totalProductsCount: number;
        collectedProductsCount: number;
      }
    >();

    for (const product of collectionProducts) {
      if (!product.collectionId) {
        continue;
      }

      const progress = collectionProgress.get(product.collectionId) ?? {
        totalProductsCount: 0,
        collectedProductsCount: 0,
      };

      progress.totalProductsCount += 1;

      if (purchasedProductIds.has(product.id)) {
        progress.collectedProductsCount += 1;
      }

      collectionProgress.set(product.collectionId, progress);
    }

    let startedAchievementsCount = 0;
    let inProgressAchievementsCount = 0;
    let completedAchievementsCount = 0;

    for (const { totalProductsCount, collectedProductsCount } of collectionProgress.values()) {
      if (collectedProductsCount === 0) {
        continue;
      }

      startedAchievementsCount += 1;

      if (
        totalProductsCount > 0 &&
        collectedProductsCount === totalProductsCount
      ) {
        completedAchievementsCount += 1;
        continue;
      }

      inProgressAchievementsCount += 1;
    }

    return {
      balance: balance?.value ?? 0,
      transactionsCount: this.toNumber(transactionAggregates.transactionsCount),
      purchasedProductsCount: purchasedProductIds.size,
      totalDeposited: this.toNumber(transactionAggregates.totalDeposited),
      totalSpent: this.toNumber(transactionAggregates.totalSpent),
      achievementRewardsCount: this.toNumber(
        transactionAggregates.achievementRewardsCount,
      ),
      achievementRewardsAmount: this.toNumber(
        transactionAggregates.achievementRewardsAmount,
      ),
      totalAchievementsCount,
      startedAchievementsCount,
      inProgressAchievementsCount,
      completedAchievementsCount,
    };
  }

  private async getTransactionAggregates(
    userId: string,
  ): Promise<TransactionAggregateRow> {
    const aggregates = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)', 'transactionsCount')
      .addSelect(
        `COALESCE(SUM(CASE WHEN transaction.type = :depositType THEN transaction.amount ELSE 0 END), 0)`,
        'totalDeposited',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN transaction.type = :purchaseType THEN transaction.amount ELSE 0 END), 0)`,
        'totalSpent',
      )
      .addSelect(
        `COALESCE(COUNT(DISTINCT CASE WHEN transaction.type = :rewardType THEN transaction.collectionId END), 0)`,
        'achievementRewardsCount',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN transaction.type = :rewardType THEN transaction.amount ELSE 0 END), 0)`,
        'achievementRewardsAmount',
      )
      .where('transaction.userId = :userId', { userId })
      .setParameters({
        depositType: TransactionType.DEPOSIT,
        purchaseType: TransactionType.PURCHASE,
        rewardType: TransactionType.ACHIEVEMENT_REWARD,
      })
      .getRawOne<TransactionAggregateRow>();

    return (
      aggregates ?? {
        transactionsCount: 0,
        totalDeposited: 0,
        totalSpent: 0,
        achievementRewardsCount: 0,
        achievementRewardsAmount: 0,
      }
    );
  }

  private toNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return Number(value);
    }

    return 0;
  }
}
