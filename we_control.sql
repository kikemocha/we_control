CREATE DATABASE IF NOT EXISTS we_control;

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
    FOREIGN KEY (belongs_to) REFERENCES users(id_user)
);

CREATE TABLE controles(
    id_control  INT AUTO_INCREMENT PRIMARY KEY,
    number_name  VARCHAR(64) NOT NULL,
    name    VARCHAR(255) NOT NULL,
    evidences   VARCHAR(255),
    periodicity VARCHAR(255),
    control_values  VARCHAR(255),
    belongs_to  INT,
    FOREIGN KEY (belongs_to) REFERENCES users(id_user)
);

CREATE TABLE riesgos(
    id_riesgo INT AUTO_INCREMENT PRIMARY KEY,
    number_name VARCHAR(255),
    description VARCHAR(512),
    value DECIMAL(4,2),
    belongs_to INT,
    FOREIGN KEY (belongs_to) REFERENCES users(id_user)
);

CREATE TABLE riesgo_control(
    id_control INT,
    id_riesgo INT,
    FOREIGN KEY (id_control) REFERENCES controles(id_control),
    FOREIGN KEY (id_riesgo) REFERENCES riesgos(id_riesgo)
);

CREATE TABLE auditorias(
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    user_in_charge INT,
    limit_date DATE,
    create_date DATE,
    archive VARCHAR(255),
    state VARCHAR(255),
    FOREIGN KEY (user_in_charge) REFERENCES users(id_user)
);

CREATE TABLE auditorias_controles(
    id_auditoria INT,
    id_control INT,
    FOREIGN KEY (id_auditoria) REFERENCES auditorias(id_auditoria),
    FOREIGN KEY (id_control) REFERENCES controles(id_control),
    PRIMARY KEY (id_auditoria, id_control)
);
