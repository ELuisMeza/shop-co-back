import { GlobalStatus } from "src/globals/enums/global-status.enum";
import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { ProductsEntity } from "../products/products.entity";

@Entity({ name: 'photos_products' })
export class PhotosProductsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  filename: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimetype: string;

  @Column({ type: 'bytea', nullable: false })
  data: Buffer;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  @ManyToOne(() => ProductsEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductsEntity;

  @Column({ type: 'bool', default: false, nullable: true })
  is_main: boolean;

  @Column({ type: 'enum', enum: GlobalStatus, default: GlobalStatus.ACTIVE })
  status: GlobalStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date;
}

