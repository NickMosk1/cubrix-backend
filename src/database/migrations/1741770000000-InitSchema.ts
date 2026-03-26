import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class InitSchema1741770000000 implements MigrationInterface {
  name = 'InitSchema1741770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureUsersTable(queryRunner);
    await this.ensureProductsTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('products')) {
      await queryRunner.dropTable('products');
    }

    if (await queryRunner.hasTable('users')) {
      await queryRunner.dropTable('users');
    }
  }

  private async ensureUsersTable(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'users';

    if (!(await queryRunner.hasTable(tableName))) {
      await queryRunner.createTable(
        new Table({
          name: tableName,
          columns: [
            {
              name: 'id',
              type: 'varchar',
              length: '36',
              isPrimary: true,
            },
            {
              name: 'username',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'email',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'password',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'role',
              type: 'enum',
              enum: ['admin', 'user'],
              default: "'user'",
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
          indices: [
            {
              name: 'IDX_users_username_unique',
              columnNames: ['username'],
              isUnique: true,
            },
            {
              name: 'IDX_users_email_unique',
              columnNames: ['email'],
              isUnique: true,
            },
          ],
        }),
        true,
      );

      return;
    }

    let usersTable = await queryRunner.getTable(tableName);

    if (!usersTable) {
      return;
    }

    const addColumnIfMissing = async (column: TableColumn): Promise<void> => {
      if (!usersTable?.findColumnByName(column.name)) {
        await queryRunner.addColumn(tableName, column);
        usersTable = await queryRunner.getTable(tableName);
      }
    };

    await addColumnIfMissing(
      new TableColumn({
        name: 'id',
        type: 'varchar',
        length: '36',
        isPrimary: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'username',
        type: 'varchar',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'email',
        type: 'varchar',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'password',
        type: 'varchar',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['admin', 'user'],
        default: "'user'",
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
      }),
    );

    if (!this.hasUniqueIndexOnColumns(usersTable, ['username'])) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'IDX_users_username_unique',
          columnNames: ['username'],
          isUnique: true,
        }),
      );
      usersTable = await queryRunner.getTable(tableName);
    }

    if (!this.hasUniqueIndexOnColumns(usersTable, ['email'])) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: 'IDX_users_email_unique',
          columnNames: ['email'],
          isUnique: true,
        }),
      );
    }
  }

  private async ensureProductsTable(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'products';

    if (!(await queryRunner.hasTable(tableName))) {
      await queryRunner.createTable(
        new Table({
          name: tableName,
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
              name: 'price',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'image',
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

      return;
    }

    let productsTable = await queryRunner.getTable(tableName);

    if (!productsTable) {
      return;
    }

    const addColumnIfMissing = async (column: TableColumn): Promise<void> => {
      if (!productsTable?.findColumnByName(column.name)) {
        await queryRunner.addColumn(tableName, column);
        productsTable = await queryRunner.getTable(tableName);
      }
    };

    await addColumnIfMissing(
      new TableColumn({
        name: 'id',
        type: 'varchar',
        length: '36',
        isPrimary: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'price',
        type: 'decimal',
        precision: 10,
        scale: 2,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'image',
        type: 'varchar',
        length: '2048',
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
      }),
    );
  }

  private hasUniqueIndexOnColumns(
    table: Table | undefined,
    columnNames: string[],
  ): boolean {
    if (!table) {
      return false;
    }

    const sortedColumns = [...columnNames].sort().join('|');

    return table.indices.some((index) => {
      return index.isUnique && [...index.columnNames].sort().join('|') === sortedColumns;
    });
  }
}
