CREATE DATABASE distribuidora_medica;



CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    user VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE clientes(
  id_cliente int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nombre_cliente varchar(100) NOT NULL,
  domicilio_cliente  varchar(100) DEFAULT NULL
); 

CREATE TABLE registros(
  id_registros INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fecha_registro DATE NOT NULL,
  cliente_registro VARCHAR(255) NOT NULL,
  total_registro DECIMAL(10,2) NOT NULL,
  pdf_respaldo VARCHAR(255) NOT NULL
);

//nueva tabla

CREATE TABLE detalles_registro (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_registro INT NOT NULL,
  cantidad INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (id_registro) REFERENCES registros(id_registros) ON DELETE CASCADE
);



//usuarios

INSERT INTO usuarios VALUES (1,'onix','onixburnedead','$2b$10$dvXXydbKwYiGy4XnIekuV.Opmt1y7218NtLFrGscSKTfBlSh.vrnC');
INSERT INTO usuarios VALUES (2,'Hector Manuel Fernandez Díaz','hector','');

