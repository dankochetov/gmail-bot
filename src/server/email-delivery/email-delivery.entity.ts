import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import User from '@/server/user/user.entity';
import EmailDeliveryRecipient from '@/server/email-delivery-recipient/email-delivery-recipient.entity';

export enum Status {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('email_deliveries')
export default class EmailDelivery {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (u) => u.deliveries)
    @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
    created_by_user!: Promise<User>;

    @Column('text')
    created_by!: User['id'];

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column('text')
    sender!: string;

    @OneToMany(() => EmailDeliveryRecipient, (r) => r.email_delivery)
    recipients!: Promise<EmailDeliveryRecipient[]>;

    @Column('enum', {
        enumName: 'delivery_status',
        enum: Object.values(Status),
        default: Status.IN_PROGRESS,
    })
    status!: Status;

    @Column('text')
    subject!: string;

    @Column('text')
    content!: string;
}
