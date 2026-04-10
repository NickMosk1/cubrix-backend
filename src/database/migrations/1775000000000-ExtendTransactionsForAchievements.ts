import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ExtendTransactionsForAchievements1775000000000
  implements MigrationInterface
{
  name = 'ExtendTransactionsForAchievements1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'transactions';

    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    let transactionsTable = await queryRunner.getTable(tableName);

    if (!transactionsTable) {
      return;
    }

    const addColumnIfMissing = async (column: TableColumn): Promise<void> => {
      if (!transactionsTable?.findColumnByName(column.name)) {
        await queryRunner.addColumn(tableName, column);
        transactionsTable = await queryRunner.getTable(tableName);
      }
    };

    await addColumnIfMissing(
      new TableColumn({
        name: 'productId',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'collectionId',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    if (
      !transactionsTable.indices.some(
        (index) => index.name === 'IDX_transactions_productId',
      )
    ) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'IDX_transactions_productId',
          columnNames: ['productId'],
        }),
      );
      transactionsTable = await queryRunner.getTable(tableName);
    }

    if (
      !transactionsTable?.indices.some(
        (index) => index.name === 'IDX_transactions_collectionId',
      )
    ) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'IDX_transactions_collectionId',
          columnNames: ['collectionId'],
        }),
      );
      transactionsTable = await queryRunner.getTable(tableName);
    }

    if (
      !transactionsTable?.indices.some(
        (index) => index.name === 'UQ_transactions_user_product_type',
      )
    ) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'UQ_transactions_user_product_type',
          columnNames: ['userId', 'productId', 'type'],
          isUnique: true,
        }),
      );
      transactionsTable = await queryRunner.getTable(tableName);
    }

    if (
      !transactionsTable?.indices.some(
        (index) => index.name === 'UQ_transactions_user_collection_type',
      )
    ) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'UQ_transactions_user_collection_type',
          columnNames: ['userId', 'collectionId', 'type'],
          isUnique: true,
        }),
      );
      transactionsTable = await queryRunner.getTable(tableName);
    }

    const typeColumn = transactionsTable?.findColumnByName('type');

    if (!typeColumn?.enum?.includes('achievement_reward')) {
      await queryRunner.query(
        "ALTER TABLE `transactions` MODIFY `type` enum('deposit','purchase','achievement_reward') NOT NULL",
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'transactions';

    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    await queryRunner.query(
      "DELETE FROM `transactions` WHERE `type` = 'achievement_reward'",
    );
    await queryRunner.query(
      "ALTER TABLE `transactions` MODIFY `type` enum('deposit','purchase') NOT NULL",
    );

    let transactionsTable = await queryRunner.getTable(tableName);

    if (!transactionsTable) {
      return;
    }

    const dropIndexIfExists = async (indexName: string): Promise<void> => {
      const index = transactionsTable?.indices.find(
        (currentIndex) => currentIndex.name === indexName,
      );

      if (index) {
        await queryRunner.dropIndex(tableName, index);
        transactionsTable = await queryRunner.getTable(tableName);
      }
    };

    await dropIndexIfExists('UQ_transactions_user_collection_type');
    await dropIndexIfExists('UQ_transactions_user_product_type');
    await dropIndexIfExists('IDX_transactions_collectionId');
    await dropIndexIfExists('IDX_transactions_productId');

    if (transactionsTable?.findColumnByName('collectionId')) {
      await queryRunner.dropColumn(tableName, 'collectionId');
      transactionsTable = await queryRunner.getTable(tableName);
    }

    if (transactionsTable?.findColumnByName('productId')) {
      await queryRunner.dropColumn(tableName, 'productId');
    }
  }
}
