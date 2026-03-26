import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Balance } from './entities/balance.entity';
import { TransactionType } from './interfaces/transaction-type.enum';
import { DepositDto } from './dto/deposit.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    private dataSource: DataSource,
  ) {}

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    let balance = await this.balanceRepository.findOne({
      where: { userId },
    });

    if (!balance) {
      // Если баланса нет, создаем новый с нулевым балансом
      balance = await this.createBalance(userId);
    }

    return {
      id: balance.id,
      userId: balance.userId,
      value: balance.value,
      updatedAt: balance.updatedAt,
    };
  }

  async deposit(userId: string, depositDto: DepositDto): Promise<TransactionResponseDto> {
    const { amount } = depositDto;

    if (amount <= 0) {
      throw new BadRequestException('Сумма пополнения должна быть положительной');
    }

    // Используем транзакцию базы данных для обеспечения целостности
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Получаем или создаем баланс пользователя
      let balance = await queryRunner.manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' }, // Блокируем запись для избежания race condition
      });

      if (!balance) {
        balance = queryRunner.manager.create(Balance, {
          userId,
          value: 0,
        });
        balance = await queryRunner.manager.save(balance);
      }

      // 2. Создаем транзакцию
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.DEPOSIT,
        amount,
      });
      
      const savedTransaction = await queryRunner.manager.save(transaction);

      // 3. Обновляем баланс
      balance.value += amount;
      await queryRunner.manager.save(balance);

      // 4. Коммитим транзакцию
      await queryRunner.commitTransaction();

      return {
        id: savedTransaction.id,
        userId: savedTransaction.userId,
        type: savedTransaction.type,
        amount: savedTransaction.amount,
        createdAt: savedTransaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Метод для списания средств (будет использоваться при покупке товаров)
  async withdraw(userId: string, amount: number): Promise<TransactionResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Сумма списания должна быть положительной');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Получаем баланс с блокировкой
      const balance = await queryRunner.manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        throw new NotFoundException('Баланс пользователя не найден');
      }

      // 2. Проверяем достаточно ли средств
      if (balance.value < amount) {
        throw new BadRequestException('Недостаточно средств на балансе');
      }

      // 3. Создаем транзакцию списания
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.PURCHASE,
        amount,
      });
      
      const savedTransaction = await queryRunner.manager.save(transaction);

      // 4. Обновляем баланс
      balance.value -= amount;
      await queryRunner.manager.save(balance);

      await queryRunner.commitTransaction();

      return {
        id: savedTransaction.id,
        userId: savedTransaction.userId,
        type: savedTransaction.type,
        amount: savedTransaction.amount,
        createdAt: savedTransaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Вспомогательный метод для создания баланса
  async createBalance(userId: string): Promise<Balance> {
    const balance = this.balanceRepository.create({
      userId,
      value: 0,
    });
    return this.balanceRepository.save(balance);
  }

  // Метод для получения истории транзакций пользователя
  async getTransactionHistory(userId: string): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
    }));
  }
}