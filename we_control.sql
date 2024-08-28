CREATE DATABASE IF NOT EXISTS we_controol;
USE we_controol;
CREATE TABLE empresas(
    id_empresa INT AUTO_INCREMENT PRIMARY,
    name VARCHAR(255),
    s3_bucket VARCHAR(255) UNIQUE,
    stripe_id VARCHAR(255),
    is_despacho BOOLEAN DEFAULT 0,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES empresas(id_empresa)
);

CREATE TABLE users(
    id_user  INT AUTO_INCREMENT PRIMARY KEY,
    id_cognito VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email   VARCHAR(255) NOT NULL,
    role    VARCHAR(255),
    is_responsable BOOLEAN DEFAULT 0,
    is_gestor   BOOLEAN DEFAULT 0,
    belongs_to  INT,
    FOREIGN KEY (belongs_to) REFERENCES empresas(id_empresa)
);


CREATE TABLE controles(
    id_control  INT AUTO_INCREMENT PRIMARY KEY,
    number_name  VARCHAR(64) NOT NULL,
    name    VARCHAR(255) NOT NULL,
    evidences   VARCHAR(255),
    periodicity VARCHAR(255),
    control_values  VARCHAR(255),
    belongs_to  INT,
    FOREIGN KEY (belongs_to) REFERENCES empresas(id_empresa)
    -- A la empresa no a al despacho
);

CREATE TABLE riesgos(
    id_riesgo INT AUTO_INCREMENT PRIMARY KEY,
    number_name VARCHAR(255),
    description VARCHAR(512),
    value DECIMAL(4,2),
    create_date DATE,
    belongs_to INT,
    FOREIGN KEY (belongs_to) REFERENCES empresas(id_empresa)
    -- A la empresa no a al despacho
);

CREATE TABLE riesgos_controles(
    id_control INT,
    id_riesgo INT,
    FOREIGN KEY (id_control) REFERENCES controles(id_control),
    FOREIGN KEY (id_riesgo) REFERENCES riesgos(id_riesgo),
    PRIMARY KEY (id_control, id_riesgo)
);
/*
CREATE TABLE controles_empresas(
    id_control INT,
    id_empresa INT,
    FOREIGN KEY (id_control) REFERENCES controles(id_control),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
    
);
*/
CREATE TABLE auditorias(
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    create_date DATE,
    belongs_to INT,
    FOREIGN KEY (belongs_to) REFERENCES empresas(id_empresa)
);

CREATE TABLE auditorias_controles(
    id_auditoria INT,
    id_control INT,
    id_responsable INT,
    limit_date DATE,
    create_date DATE,
    archive VARCHAR(255),
    state VARCHAR(255),
    FOREIGN KEY (id_auditoria) REFERENCES auditorias(id_auditoria),
    FOREIGN KEY (id_control) REFERENCES controles(id_control),
    FOREIGN KEY (id_responsable) REFERENCES users(id_user),
    PRIMARY KEY (id_auditoria, id_control)
);

INSERT INTO empresas VALUES
(1,'Mora-Rey Asesoría', NULL, NULL, 1, NULL),
(2, 'Inditex', NULL, NULL, 0, 1);

INSERT INTO users VALUES
(1,'d2c5d454-5051-700b-aec7-7248acf149eb','Enrique', '622924124', 'enriquemorarey@gmail.com', 'admin', 0, 0, 1),
(2,'32b5e444-70e1-7067-e6f4-2b858abe5187', 'Enrique Gestor', '123123123', 'kikemoeste@gmail.com', 'gestor', 0, 1, 2),
(3, '02f5c434-10b1-70d4-494e-6410a4b71ae8', 'Prueba', '103020103', 'prueba@prueba.com', 'CTO', 1, 0, 2),
(4, 'a215b4e4-f081-70b0-cf8b-106233d61967', 'Gestor prueba', '103020103', 'gestor@prueba.com', 'CTO', 1, 0, 2);

INSERT INTO riesgos VALUES
(1, 'R1', 'Contabilidad', 0.05, 2, '2024-02-20'),
(2, 'R2', 'Seguridad en el puesto de trabajo', 0.2, 2, '2024-04-05'),
(3, 'R3', 'Ambiente Laboral', 0.05, 2, '2024-07-23');

INSERT INTO controles VALUES
(1, 'C1', 'Segregación funciones compras', 'Trazabilidad programa SAP', 'Anual', 'Transversal', 2),
(2, 'C2', 'Código de conducta', 'Protocolo vigente', 'Trimestral', 'Específico', 2),
(3, 'C3', 'Política antifraude y anticorrupción', 'Protocolo vigente', 'Anual', 'Específico', 2),
(4, 'C4', 'Política de la empresa', 'Protocolo vigente', 'Anual', 'Específico', 2),
(5, 'C5', 'Antiincendios', 'Prevención de Riesgos Laborales', 'Anual', 'Específico', 2),
(6, 'C6', 'Precaución ante tsunami', 'Prevención de Riesgos Laborales', 'Anual', 'Específico', 2),
(7, 'C7', 'Presentación de impuestos', 'Hacienda', 'Anual', 'Específico', 2);
/*
INSERT INTO controles_empresas VALUES
(1,2),
(2,2),
(3,2),
(4,2),
(5,2),
(6,2),
(7,2);
*/

INSERT INTO riesgo_control VALUES 
(1,1),
(1,2),
(2,1),
(2,2),
(3,3);

INSERT INTO auditorias VALUES
(1, '2023', '2023-01-20',2),
(2, '2024', '2024-07-23',2);

INSERT INTO auditorias_controles VALUES
(1, 1, 3, '2024-06-01', '2024-01-1', 'archivo.pdf', 'Verificado'),
(1, 2, 4, '2024-12-01', '2024-01-1', NULL, 'Pendiente'),
(1, 3, 4, '2024-12-01', '2024-01-1', 'archivo2.pdf', 'Pendiente de verificar'),
(1, 4, 3, '2024-12-01', '2024-01-1', NULL, 'Pendiente'),
(1, 5, 4, '2024-12-01', '2024-01-1', NULL, 'Pendiente'),
(1, 6, 3, '2024-12-01', '2024-01-1', NULL, 'Pendiente'),
(1, 7, 4, '2024-12-01', '2024-01-1', NULL, 'Pendiente'),
(2, 1, 3, '2024-06-01', '2024-01-1', 'archivo.pdf', 'Verificado'),
(2, 3, 4, '2024-12-01', '2024-01-1', 'archivo2.pdf', 'Pendiente de verificar'),
(2, 5, 4, '2024-12-01', '2024-01-1', 'archivo3.pdf', 'Rechazado'),
(2, 7, 4, '2024-12-01', '2024-01-1', NULL, 'Pendiente');



--  GET USER INFO --
--  ADMIN --
SELECT * FROM empresas WHERE  created_by = id;

SELECT * FROM riesgos WHERE belongs_to = id_empresa;

SELECT * FROM controles WHERE belongs_to = id_empresa;

SELECT * FROM users WHERE belongs_to IN (SELECT id_empresa FROM empresas WHERE created_by = id_empresa) and is_gestor= 1;

SELECT * FROM auditorias WHERE belongs_to IN (SELECT id_empresa FROM empresas WHERE created_by = id_empresa);

-- GESTOR --

SELECT * FROM controles WHERE belongs_to = empresa_id;
SELECT * FROM auditorias WHERE belongs_to = empresa_id;
SELECT * FROM users WHERE belongs_to = empresa_id AND is_responsable = 1;
