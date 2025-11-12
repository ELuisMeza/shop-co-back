import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './files.entity';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FilesEntity]),
    StorageModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

