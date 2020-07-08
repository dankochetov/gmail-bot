import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailDeliveryInterval1594225491376
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table email_deliveries
                add delivery_interval_from int not null default 2,
                add delivery_interval_to   int not null default 2
        `);

        await queryRunner.query(`
            alter table email_deliveries
                alter delivery_interval_from drop default,
                alter delivery_interval_to drop default
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table email_deliveries
                drop delivery_interval_from,
                drop delivery_interval_to
        `);
    }
}
