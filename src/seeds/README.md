# Seeds para la Base de Datos

## Seed de Productos

Este seed genera al menos 100 productos con imágenes en la base de datos.

### Requisitos Previos

1. Asegúrate de tener configuradas las variables de entorno en el archivo `.env`:
   - `DB_HOST`
   - `DB_PORT` (opcional, por defecto 5432)
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SCHEMA` (opcional, por defecto 'public')

2. **Es necesario tener al menos un seller creado** en la base de datos antes de ejecutar el seed. Si no hay sellers, el script se detendrá con un mensaje de advertencia.

### Ejecución

Para ejecutar el seed de productos, usa el siguiente comando:

```bash
npm run seed:products
```

### Características

- Genera **mínimo 100 productos** con datos realistas
- Cada producto incluye:
  - Nombre y descripción
  - Precio y stock
  - Imagen principal (descargada desde Picsum Photos)
  - 1-3 imágenes adicionales por producto
- Si no existen categorías en la BD, crea 9 categorías por defecto
- Asigna sellers aleatorios a cada producto

### Notas

- **Las imágenes se descargan desde Unsplash** usando términos de búsqueda relevantes según el tipo de producto:
  - Tecnología → imágenes de laptops, computadoras, dispositivos
  - Ropa → imágenes de prendas y accesorios
  - Deportes → imágenes de equipamiento deportivo
  - Y así para cada categoría de producto
- Cada producto obtiene imágenes relacionadas con su nombre y descripción
- Las imágenes son de alta calidad (800x600px) y se guardan como Buffer en la base de datos
- El proceso puede tardar varios minutos dependiendo de tu conexión a internet y la velocidad de la base de datos
- Si ya existen productos en la base de datos, el seed agregará más productos adicionales
- El script muestra progreso cada 10 productos procesados y también indica qué imagen está descargando
