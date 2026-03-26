import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBalanceAndTransactions1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу транзакций
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            // Убираем default: 'UUID()'
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['deposit', 'purchase'],
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Добавляем индекс на userId
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_TRANSACTIONS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    // Создаем таблицу балансов
    await queryRunner.createTable(
      new Table({
        name: 'balances',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            // Убираем default: 'UUID()'
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'value',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'balances',
      new TableIndex({
        name: 'IDX_BALANCES_USER_ID',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('balances');
  }
}