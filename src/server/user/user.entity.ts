import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import EmailDelivery from '../email-delivery/email-delivery.entity';

@Entity('users')
export default class User {
    @PrimaryColumn('text')
    id!: string;

    @Column('jsonb', { nullable: true })
    google_tokens!: {
        access: string;
        refresh: string;
        expiry_date: number;
    } | null;

    @OneToMany(() => EmailDelivery, (d) => d.created_by)
    deliveries!: Promise<EmailDelivery[]>;
}
