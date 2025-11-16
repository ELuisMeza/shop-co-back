import { GlobalTypesFiles } from "src/globals/enums/global-types-files";

export interface FileData {
  file: Express.Multer.File;
  is_main: boolean;
}

export interface UploadFilesData {
  parent_id: string;
  parent_type: GlobalTypesFiles;
  files: FileData[];
}
