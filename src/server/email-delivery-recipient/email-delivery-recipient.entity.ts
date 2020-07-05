import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import EmailDelivery from '@/server/email-delivery/email-delivery.entity';

@Entity('email_delivery_recipients')
export default class EmailDeliveryRecipient {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('text')
    email!: string;

    @Column('int')
    index!: number;

    @Column('timestamp', { nullable: true })
    delivered_at!: Date | null;

    @ManyToOne(() => EmailDelivery, (d) => d.recipients, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'email_delivery_id', referencedColumnName: 'id' })
    email_delivery!: Promise<EmailDelivery>;

    @Column('uuid')
    email_delivery_id!: EmailDelivery['id'];
}
