import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailDeliveryInit1593870483285 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create type delivery_status as enum(
                'in_progress',
                'completed',
                'cancelled'
            )
        `);

        await queryRunner.query(`
            create table email_deliveries
            (
                id         uuid            default uuid_generate_v4(),
                created_by text      not null,
                created_at timestamp not null default current_timestamp,
                sender     text      not null,
                status     delivery_status default 'in_progress',
                subject    text      not null,
                content    text      not null,

                constraint email_deliveries__pk
                    primary key (id),

                constraint email_deliveries__created_by
                    foreign key (created_by) references users (id)
            )
        `);

        await queryRunner.query(`
            create table email_delivery_recipients
            (
                id                uuid default uuid_generate_v4(),
                email             text not null,
                index             int  not null,
                delivered_at      timestamp,
                email_delivery_id uuid not null,

                constraint email_delivery_recipients__pk
                    primary key (id),
                constraint email_delivery_recipients__email_delivery_id
                    foreign key (email_delivery_id) references email_deliveries (id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            drop table email_delivery_recipients
        `);

        await queryRunner.query(`
            drop table email_deliveries
        `);

        await queryRunner.query(`
            drop type delivery_status
        `);
    }
}
