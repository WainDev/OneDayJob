-- Создание базы данных (если ещё не создана)
CREATE DATABASE IF NOT EXISTS `test_drive` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `test_drive`;

-- Таблица Admins
CREATE TABLE IF NOT EXISTS `Admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `login` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Admins` (`login`, `password`) VALUES
('avto2024', 'poehali');

-- Таблица Users
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `login` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(12) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Таблица Cars
CREATE TABLE IF NOT EXISTS `Cars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand` VARCHAR(50) NOT NULL,
  `model` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Cars` (`brand`, `model`) VALUES
('Toyota', 'Camry'),
('Toyota', 'Corolla');

-- Таблица Statuses
CREATE TABLE IF NOT EXISTS `Statuses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Statuses` (`name`) VALUES
('В обработке'),
('Одобрен'),
('Выполнен'),
('Отклоненный');

-- Таблица Applications
CREATE TABLE IF NOT EXISTS `Applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(12) NOT NULL,
  `driverLicenseSeries` VARCHAR(4) NOT NULL,
  `driverLicenseNumber` VARCHAR(6) NOT NULL,
  `driverLicenseDate` DATE NOT NULL,
  `carId` INT NOT NULL,
  `dateTime` DATETIME NOT NULL,
  `paymentType` ENUM('cash','card') NOT NULL,
  `statusId` INT NOT NULL,
  `rejectionReason` TEXT,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `carId` (`carId`),
  KEY `statusId` (`statusId`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`carId`) REFERENCES `Cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`statusId`) REFERENCES `Statuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
