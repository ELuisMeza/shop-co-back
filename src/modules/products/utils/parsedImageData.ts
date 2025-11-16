import { ImageMetadataDto } from "../dto/update-product.dto";

export const parsedImageData = (
  metadata: string,
  files: Express.Multer.File[],
) => {
  const imagesData: Array<{ file: Express.Multer.File; is_main: boolean }> = [];
  let imageMainId: string | null = null;

  const metadataArray: ImageMetadataDto[] = JSON.parse(metadata as string);
  if (Array.isArray(metadataArray)) {
    const result = metadataArray.map((item) => {
      const file = files.find((f) => f.fieldname === item.file_id);
      
      // Guardar el file_id de la imagen principal
      if (item.is_main && imageMainId === null && !item.file_id.includes('file_')) {
        imageMainId = item.file_id;
      }
      
      return {
        is_main: item.is_main,
        file,
      };
    });

    imagesData.push(
      ...result
        .filter((item) => item.file)
        .map((item) => ({
          file: item.file!,
          is_main: item.is_main,
        })),
    );
  }

  return {
    images: imagesData,
    imageMainId,
  };
};
