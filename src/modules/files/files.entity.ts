import { GlobalStatus } from "src/globals/enums/global-status.enum";
import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity({ name: 'files' })
export class FilesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  filename: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimetype: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  path_file: string;

  @Column({ type: 'uuid', nullable: false })
  parent_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  parent_type: string;

  @Column({ type: 'bool', default: false, nullable: true })
  is_main: boolean;

  @Column({ type: 'enum', enum: GlobalStatus, default: GlobalStatus.ACTIVE })
  status: GlobalStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date;
}

