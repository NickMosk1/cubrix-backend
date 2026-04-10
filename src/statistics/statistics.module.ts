import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from '../balance/entities/balance.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { Collection } from '../collection/entities/collection.entity';
import { Product } from '../product/entities/product.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Balance, Transaction, Collection, Product])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
