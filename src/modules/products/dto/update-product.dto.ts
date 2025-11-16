import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsArray, IsUUID, ArrayMinSize, ValidateNested, IsBoolean } from "class-validator";
import { Transform, Type, Expose, plainToInstance } from "class-transformer";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class ImageMetadataDto {
  @ApiProperty({ example: 'file_1', description: 'ID del campo del archivo en FormData' })
  @Expose()
  @IsString({ message: 'file_id debe ser un texto' })
  @IsNotEmpty({ message: 'file_id es requerido' })
  file_id: string;

  @ApiProperty({ example: false, description: 'Indica si es la imagen principal' })
  @Expose()
  @IsBoolean({ message: 'is_main debe ser un booleano' })
  @IsNotEmpty({ message: 'is_main es requerido' })
  is_main: boolean;
}

export class CreateOrUpdateProductDto {
  @ApiProperty({ example: 'Laptop HP 15', description: 'Nombre del producto' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({ example: 'Laptop ideal para trabajo y estudio', description: 'Descripción del producto' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({ example: 899.99, description: 'Precio del producto' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price: number;

  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'El stock debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El stock es requerido' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock: number;

  @ApiProperty({ example: GlobalStatus.ACTIVE, description: 'Estado del producto' })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;

  @ApiProperty({
    type: 'string',
    description: 'Metadata de las imágenes en formato JSON string. Para nuevas imágenes: [{ "file_id": "uuid", "is_main": boolean }]. Ejemplo: \'[{"file_id":"file-id","is_main":true}]\'',
    required: false,
    example: '[{"file_id":"file-id","is_main":true}]'
  })
  @Transform(({ value }) => {
    let array: any[] = [];
    
    if (Array.isArray(value)) {
      array = value.filter((item: any) => item && typeof item === 'object');
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        array = Array.isArray(parsed) ? parsed.filter((item: any) => item && typeof item === 'object') : [parsed];
      } catch {
        return [];
      }
    }
    
    // Transformar cada objeto en una instancia de ImageMetadataDto
    return array.map(item => plainToInstance(ImageMetadataDto, item, { 
      excludeExtraneousValues: false,
      enableImplicitConversion: true 
    }));
  })
  @Type(() => ImageMetadataDto)
  @IsArray({ message: 'metadata debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una imagen' })
  @ValidateNested({ each: true })
  metadata?: ImageMetadataDto[];

  @ApiProperty({ 
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'], 
    description: 'IDs de las categorías. En FormData enviar como categories[0], categories[1], etc.',
    type: [String],
    required: true
  })
  @Transform(({ value, obj }) => {
    if (Array.isArray(value)) {
      return value.filter((cat: string) => cat && cat.trim() !== '');
    }
        
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((cat: string) => cat && cat.trim() !== '') : [parsed];
      } catch {
        return [value].filter((cat: string) => cat && cat.trim() !== '');
      }
    }
    
    return [];
  })
  @IsArray({ message: 'Las categorías deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una categoría' })
  @IsUUID(undefined, { each: true, message: 'Cada categoría debe ser un UUID válido' })
  @IsNotEmpty({ message: 'Las categorías son requeridas' })
  categories: string[];

  @ApiProperty({
    type: [String],
    description: 'Array de IDs de imágenes a eliminar. En FormData enviar como deleteImages[0], deleteImages[1], etc.',
    required: false,
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
  })
  @Transform(({ value, obj }) => {
    if (Array.isArray(value)) {
      return value.filter((cat: string) => cat && cat.trim() !== '');
    }
        
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((cat: string) => cat && cat.trim() !== '') : [parsed];
      } catch {
        return [value].filter((cat: string) => cat && cat.trim() !== '');
      }
    }
    
    return [];
  })
  @IsOptional()
  @IsArray({ message: 'deleteImages debe ser un array' })
  @IsUUID(undefined, { each: true, message: 'Cada ID en deleteImages debe ser un UUID válido' })
  deleteImages?: string[];


  
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Primera imagen del producto (file_0). Debe corresponder con el primer elemento del array metadata.',
    required: false
  })
  @IsOptional()
  file_0?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Segunda imagen del producto (file_1). Debe corresponder con el segundo elemento del array metadata.',
    required: false
  })
  @IsOptional()
  file_1?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Tercera imagen del producto (file_2). Puedes agregar más archivos siguiendo el patrón file_3, file_4, etc.',
    required: false
  })
  @IsOptional()
  file_2?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Cuarta imagen del producto (file_3). Puedes agregar más archivos siguiendo el patrón file_4, file_5, etc.',
    required: false
  })
  @IsOptional()
  file_3?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Quinta imagen del producto (file_4). Puedes agregar más archivos siguiendo el patrón file_5, file_6, etc.',
    required: false
  })
  @IsOptional()
  file_4?: any;
}

