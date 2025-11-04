import { GlobalStatus } from "src/globals/enums/global-status.enum";
import { Column, PrimaryGeneratedColumn, Entity, BeforeInsert, JoinColumn, ManyToOne } from "typeorm";
import { RolesEntity } from "../roles/roles.entity";
import { SellersEntity } from "../sellers/sellers.entity";

@Entity({ name: 'users' })
export class UsersEntity {
  @BeforeInsert()
  generateUsername() {
    if (!this.username) {
      // Genera username basado en name.last_name_father
      const nameNormalized = this.name.toLowerCase().trim();
      const lastNameNormalized = this.last_name_father.toLowerCase().trim();
      this.username = `${nameNormalized}.${lastNameNormalized}.${this.num_document}`;
    }
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name_father: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name_mother: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  num_document: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type_document: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  username: string;

  @Column({ type: 'enum', enum: GlobalStatus, default: GlobalStatus.ACTIVE })
  status: GlobalStatus;

  @Column({ type: 'uuid', nullable: false })
  role_id: string;

  @ManyToOne(() => RolesEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: RolesEntity;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modified_at: Date;
}