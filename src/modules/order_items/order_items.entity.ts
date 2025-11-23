import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { OrdersEntity } from "../orders/orders.entity";
import { ProductsEntity } from "../products/products.entity";

@Entity({ name: 'order_items' })
export class OrderItemsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  order_id: string;

  @ManyToOne(() => OrdersEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrdersEntity;

  @Column({ type: 'uuid', nullable: false })
  product_id: string;

  @ManyToOne(() => ProductsEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductsEntity;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total_price: number;
}

