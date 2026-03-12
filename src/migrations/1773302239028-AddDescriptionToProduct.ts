import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToProduct1773302239028 implements MigrationInterface {
    name = 'AddDescriptionToProduct1773302239028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`description\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`description\``);
    }

}
