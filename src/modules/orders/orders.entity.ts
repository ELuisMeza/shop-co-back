import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { UsersEntity } from "../users/users.entity";
import { SellersEntity } from "../sellers/sellers.entity";
import { OrderTrackerStatus, PaymentTokenStatus } from "@paypal/paypal-server-sdk";

@Entity({ name: 'orders' })
export class OrdersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  buyer_id: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: UsersEntity;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paypal_order_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  status: OrderTrackerStatus;

  @Column({ type: 'varchar', length: 20, nullable: false, default: PaymentTokenStatus.Created })
  payment_status: PaymentTokenStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total_amount: number;

  @Column({ type: 'varchar', length: 10, nullable: false })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

