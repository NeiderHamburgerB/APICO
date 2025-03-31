# APICO - Proyecto de Gestión de Envíos

Este proyecto es una API para la gestión de envíos que incluye funcionalidades de autenticación, manejo de órdenes, rutas y usuarios.

## Requisitos

- **Node.js**: Versión 20.13.0  
- **Docker**: Asegúrate de tener Docker instalado en tu máquina.  
- **Dependencias**: Instala todas las dependencias del proyecto ejecutando:
  ```bash
  npm install
Variables de entorno: Coloca el archivo .env en la raíz del proyecto con la configuración necesaria.
Levantar el Proyecto en Local

El proyecto utiliza Docker Compose para levantar los servicios de la base de datos y Redis. Asegúrate de tener el siguiente archivo docker-compose.yml en la raíz del proyecto:
```bash
  version: '3'
  services:
    postgresDb:
      image: postgres:13
      container_name: 'postgresDB-APICO'
      environment:
        POSTGRES_USER: 'root'
        POSTGRES_PASSWORD: 'root'
        POSTGRES_DB: 'apicoDev'
      volumes:
        - ./postgres-data:/var/lib/postgresql/data
        - ./initdb:/docker-entrypoint-initdb.d
      ports:
        - 5435:5432
      restart: always
    redis:
      image: redis:latest
      container_name: 'redis-APICO'
      ports:
        - 6379:6379
      volumes:
        - ./redis-data:/data
      restart: always
```
La carpeta initdb contiene los scripts necesarios para crear las tablas y poblar la base de datos con datos dummy. Al levantar PostgreSQL se crearán los siguientes datos:

# Tabla	Datos Dummy
```bash
roles
  - 1: administrador
  - 2: cliente
  - 3: transportador

cities
  - Bogotá
  - Medellín
  - Cali
  - Barranquilla
  - Cartagena
  - Bucaramanga
  - Cúcuta
  - Pereira
  - Manizales
  - Santa Marta

vehicles
  - VEH001
  - VEH002
  - VEH003
  - VEH004
  - VEH005 (cada uno con capacidades y dimensiones definidas)

users	- Admin User (administrador)
  - Transporter One
  - Transporter Two
  - Transporter Three (transportadores, password: password123)

routes
  - Ruta 1: Medellín → Bogotá, vehículo VEH001, sin transportista asignado, estimated finish 5 de abril
  - Ruta 2: Cali → Barranquilla, vehículo VEH002, sin transportista asignado, estimated finish 5 de abril
  - Ruta 3: Cartagena → Bucaramanga, vehículo VEH003, sin transportista asignado, estimated finish 5 de abril

orders	Estructura de órdenes creada, sin datos dummy precargados
```

## Para levantar los contenedores, abre una terminal en el directorio raíz del proyecto y ejecuta:
```bash
docker compose up
```
Esto levantará PostgreSQL y Redis, y se inicializarán los datos dummy en la base de datos.

## Endpoints / Casos de Uso
```bash
Auth
  POST /auth/login: Inicia sesión en la aplicación.

Orders
  POST /orders/create: Crea una nueva orden de envío.
  PATCH /orders/{orderId}/update-status-delivered: Actualiza el estado de un pedido a "Entregado".
  GET /orders/{code}/getOrdersStatus: Obtiene el estado de un pedido a partir de su código.
  GET /orders/query: Consulta pedidos con filtros avanzados.

Routes
  PATCH /{routeId}/assign: Asigna una orden a una ruta específica.
  PATCH /{routeId}/assign/carrier: Asigna un carrier (transportista) a una ruta específica.

Users
  POST /users/register: Registra un nuevo usuario.
```

## Documentación y Pruebas

La documentación interactiva de la API está habilitada y se puede acceder a ella en el endpoint /api-docs. Se han implementado pruebas unitarias utilizando Jest y Mockito, logrando una cobertura de pruebas superior al 95%.

## Consideraciones Adicionales

Se utiliza el servicio externo api.mapbox.com para la validación de direcciones, el cual provee un número generoso de peticiones gratuitas. Se han cumplido los 5 casos de uso definidos para el sistema. La expiración del token de autenticación es de 4 horas. Además, el estado de las órdenes se guarda en la caché durante 30 minutos para pruebas y las órdenes se almacenan en la caché por 5 días, actualizándose su estado según lo especificado.

Con estos pasos y configuraciones, podrás correr el proyecto en tu entorno local, realizar pruebas y utilizar la API de forma interactiva
