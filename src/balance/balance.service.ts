import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { Transaction } from './entities/transaction.entity';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { DepositDto } from './dto/deposit.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionType } from './interfaces/transaction-type.enum';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    let balance = await this.balanceRepository.findOne({
      where: { userId },
    });

    if (!balance) {
      balance = await this.createBalance(userId);
    }

    return {
      id: balance.id,
      userId: balance.userId,
      value: balance.value,
      updatedAt: balance.updatedAt,
    };
  }

  async deposit(
    userId: string,
    depositDto: DepositDto,
  ): Promise<TransactionResponseDto> {
    const { amount } = depositDto;

    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.DEPOSIT,
        amount,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      balance.value += amount;
      await queryRunner.manager.save(balance);

      await queryRunner.commitTransaction();

      return this.toTransactionResponseDto(savedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(
    userId: string,
    amount: number,
  ): Promise<TransactionResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balance = await queryRunner.manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        throw new NotFoundException('Balance not found');
      }

      if (balance.value < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.PURCHASE,
        amount,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      balance.value -= amount;
      await queryRunner.manager.save(balance);

      await queryRunner.commitTransaction();

      return this.toTransactionResponseDto(savedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createBalance(userId: string): Promise<Balance> {
    const balance = this.balanceRepository.create({
      userId,
      value: 0,
    });

    return this.balanceRepository.save(balance);
  }

  async getTransactionHistory(userId: string): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return transactions.map((transaction) =>
      this.toTransactionResponseDto(transaction),
    );
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
}
