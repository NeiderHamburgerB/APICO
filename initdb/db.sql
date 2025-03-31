-- ==========================
-- Tabla roles
-- ==========================
CREATE TABLE roles (
    id serial PRIMARY KEY,
    name varchar(50) NOT NULL
);

-- datos dummy en roles:
-- 1: administrador, 2: cliente, 3: transportador
INSERT INTO roles (name) VALUES 
('administrador'),
('cliente'),
('transportador');

-- ==========================
-- Tabla cities
-- ==========================
CREATE TABLE cities (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL
);

-- datos dummy en cities:
-- 1: Bogotá, 2: Medellín, 3: Cali, 4: Barranquilla, 5: Cartagena, 6: Bucaramanga, 7: Cúcuta, 8: Pereira, 9: Manizales, 10: Santa Marta
INSERT INTO cities (name) VALUES
('Bogotá'),
('Medellín'),
('Cali'),
('Barranquilla'),
('Cartagena'),
('Bucaramanga'),
('Cúcuta'),
('Pereira'),
('Manizales'),
('Santa Marta');

-- ==========================
-- Tabla vehicles
-- ==========================
CREATE TABLE vehicles (
    id serial PRIMARY KEY,
    licensePlate varchar(20) NOT NULL,
    capacity numeric NOT NULL,
    maxVolume numeric NOT NULL DEFAULT 10,  -- Volumen máximo en m³
    maxWidth numeric NOT NULL DEFAULT 2.5,    -- Ancho máximo en metros
    maxHeight numeric NOT NULL DEFAULT 3,     -- Altura máxima en metros
    maxLength numeric NOT NULL DEFAULT 6      -- Largo máximo en metros
);

-- datos dummy en vehicles:
-- 1: VEH001, 2: VEH002, 3: VEH003, 4: VEH004, 5: VEH005
INSERT INTO vehicles (licensePlate, capacity, maxVolume, maxWidth, maxHeight, maxLength) VALUES
('VEH001', 3000, 12, 2.5, 3, 6),
('VEH002', 4000, 15, 2.7, 3.2, 7),
('VEH003', 5000, 18, 3, 3.5, 8),
('VEH004', 3500, 14, 2.6, 3.1, 6.5),
('VEH005', 4500, 16, 2.8, 3.3, 7.5);

-- ==========================
-- Tabla users
-- ==========================
CREATE TABLE users (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    email varchar(150) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    roleId int NOT NULL,
    isAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (roleId) REFERENCES roles(id)
);

-- datos dummy en users:
-- 1: administrador, 2: cliente, 3: transportador
-- password: password123 
INSERT INTO users (name, email, password, roleId, isAvailable) VALUES
('Admin User', 'admin@example.com', '$2b$10$gznlJNclQj30aJF0IGW.uOe.ZTo.iV.eqSyqPX3C.WKTdlPOdYxI6', 1, TRUE),
('Transporter One', 'trans1@example.com', '$2b$10$gznlJNclQj30aJF0IGW.uOe.ZTo.iV.eqSyqPX3C.WKTdlPOdYxI6', 3, TRUE),
('Transporter Two', 'trans2@example.com', '$2b$10$gznlJNclQj30aJF0IGW.uOe.ZTo.iV.eqSyqPX3C.WKTdlPOdYxI6', 3, TRUE),
('Transporter Three', 'trans3@example.com', '$2b$10$gznlJNclQj30aJF0IGW.uOe.ZTo.iV.eqSyqPX3C.WKTdlPOdYxI6', 3, TRUE);

-- ==========================
-- Tabla routes
-- ==========================
CREATE TABLE routes (
    id serial PRIMARY KEY,
    originCityId int NOT NULL,
    destinationCityId int NOT NULL,
    vehicleId int NOT NULL,
    assignedCarrierId int,
    assignedOrders INT[] DEFAULT '{}',
    estimatedGeneralFinish timestamptz,
    startDateTime timestamptz,
    createdAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routes_origin_city FOREIGN KEY (originCityId) REFERENCES cities(id),
    CONSTRAINT fk_routes_destination_city FOREIGN KEY (destinationCityId) REFERENCES cities(id),
    CONSTRAINT fk_routes_vehicle FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
    CONSTRAINT fk_routes_assigned_carrier FOREIGN KEY (assignedCarrierId) REFERENCES users(id)
);

-- rutas dummy
-- Ruta 1: De Medellín (id=2) a Bogotá (id=1), vehículo 1, sin transportista asignado.
-- Ruta 2: De Cali (id=3) a Barranquilla (id=4), vehículo 2, sin transportista asignado.
-- Ruta 3: De Cartagena (id=5) a Bucaramanga (id=6), vehículo 3, sin transportista asignado.
-- Se establece estimatedGeneralFinish el 5 de abril.
INSERT INTO routes (originCityId, destinationCityId, vehicleId, assignedCarrierId, estimatedGeneralFinish, startDateTime)
VALUES
(2, 1, 1, NULL, '2025-04-05 18:00:00', '2025-04-05 09:00:00'),
(3, 4, 2, NULL, '2025-04-05 20:00:00', '2025-04-05 10:00:00'),
(5, 6, 3, NULL, '2025-04-05 16:00:00', '2025-04-05 08:30:00');

-- ==========================
-- Tabla orders
-- ==========================
CREATE TABLE orders (
    id serial PRIMARY KEY,
    code varchar(50),
    userId int NOT NULL,
    packageWeight numeric NOT NULL,
    packageDimensionWidth numeric NOT NULL,
    packageDimensionHeight numeric NOT NULL,
    packageDimensionLength numeric NOT NULL,
    typeProduct varchar(100),
    originCityId int NOT NULL,
    destinationCityId int NOT NULL,
    destinationAddress varchar(255),
    status varchar(50) NOT NULL,
    estimatedDeliveryTime timestamptz,
    deliveredAt timestamptz,
    routeId int,
    createdAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES users(id),
    CONSTRAINT fk_orders_origin_city FOREIGN KEY (originCityId) REFERENCES cities(id),
    CONSTRAINT fk_orders_destination_city FOREIGN KEY (destinationCityId) REFERENCES cities(id),
    CONSTRAINT fk_orders_route FOREIGN KEY (routeId) REFERENCES routes(id)
);
