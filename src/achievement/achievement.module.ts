import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../balance/entities/transaction.entity';
import { Collection } from '../collection/entities/collection.entity';
import { Product } from '../product/entities/product.entity';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Product, Transaction])],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
