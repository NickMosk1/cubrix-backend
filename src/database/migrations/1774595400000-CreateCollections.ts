import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCollections1774595400000 implements MigrationInterface {
  name = 'CreateCollections1774595400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureCollectionsTable(queryRunner);
    await this.ensureProductCollectionId(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const productsTable = await queryRunner.getTable('products');

    if (productsTable) {
      const collectionForeignKey = productsTable.foreignKeys.find(
        (foreignKey) => {
          return (
            foreignKey.columnNames.length === 1 &&
            foreignKey.columnNames[0] === 'collectionId'
          );
        },
      );

      if (collectionForeignKey) {
        await queryRunner.dropForeignKey('products', collectionForeignKey);
      }

      const collectionIndex = productsTable.indices.find(
        (index) => index.name === 'IDX_products_collectionId',
      );

      if (collectionIndex) {
        await queryRunner.dropIndex('products', collectionIndex);
      }

      if (productsTable.findColumnByName('collectionId')) {
        await queryRunner.dropColumn('products', 'collectionId');
      }
    }

    if (await queryRunner.hasTable('collections')) {
      await queryRunner.dropTable('collections');
    }
  }

  private async ensureCollectionsTable(
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (await queryRunner.hasTable('collections')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'collections',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
  }

  private async ensureProductCollectionId(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const tableName = 'products';

    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    let productsTable = await queryRunner.getTable(tableName);

    if (!productsTable?.findColumnByName('collectionId')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'collectionId',
          type: 'varchar',
          length: '36',
          isNullable: true,
        }),
      );

      productsTable = await queryRunner.getTable(tableName);
    }

    if (!productsTable) {
      return;
    }

    const hasCollectionIndex = productsTable.indices.some(
      (index) => index.name === 'IDX_products_collectionId',
    );

    if (!hasCollectionIndex) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'IDX_products_collectionId',
          columnNames: ['collectionId'],
        }),
      );
      productsTable = await queryRunner.getTable(tableName);
    }

    const hasCollectionForeignKey = productsTable?.foreignKeys.some(
      (foreignKey) => {
        return (
          foreignKey.columnNames.length === 1 &&
          foreignKey.columnNames[0] === 'collectionId' &&
          foreignKey.referencedTableName === 'collections'
        );
      },
    );

    if (!hasCollectionForeignKey) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['collectionId'],
          referencedTableName: 'collections',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }
}
