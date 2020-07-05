import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsers1593870378036 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create table users
            (
                id            text not null,
                google_tokens jsonb,

                constraint users__pk
                    primary key (id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            drop table users
        `);
    }
}
