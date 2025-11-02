import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { UsersEntity } from "../users/users.entity";

@Entity({ name: 'sellers' })
export class SellersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, nullable: false })
  user_id: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ type: 'varchar', length: 150, nullable: false })
  shop_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bytea', nullable: true })
  logo_image: Buffer;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  business_address: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  total_sales: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modified_at: Date;
}

