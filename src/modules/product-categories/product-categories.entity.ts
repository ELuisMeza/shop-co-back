import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { ProductsEntity } from "../products/products.entity";
import { CategoriesEntity } from "../categories/categories.entity";

@Entity({ name: 'product_categories' })
export class ProductCategoriesEntity {
  @PrimaryColumn({ type: 'uuid' })
  product_id: string;

  @PrimaryColumn({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => ProductsEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductsEntity;

  @ManyToOne(() => CategoriesEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoriesEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

