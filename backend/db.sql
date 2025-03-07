CREATE DATABASE infomgt;

USE infomgt;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255)  UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    lab ENUM('cezeri', 'design_studio', 'medtech') NOT NULL,
    role ENUM('admin', 'technician', 'student', 'lab_manager') NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `activity_logs`
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` text NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `bookinglogs`
CREATE TABLE IF NOT EXISTS `bookinglogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `equipment_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `lab` enum('design-studio','cezeri-lab','medtech-lab') NOT NULL,
  `purpose` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `user_id` (`user_id`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `bookinglogs_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookinglogs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookinglogs_ibfk_3` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `equipment`
CREATE TABLE IF NOT EXISTS `equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('electrical','mechanical','consumables') NOT NULL,
  `unique_code` varchar(255) NOT NULL,
  `status` enum('available','in-use','maintenance') DEFAULT 'available',
  `power_rating` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lab` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`unique_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `equipment_requests`
CREATE TABLE IF NOT EXISTS `equipment_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_name` varchar(255) NOT NULL,
  `from_lab` varchar(255) NOT NULL,
  `to_lab` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `purpose` text NOT NULL,
  `time_slot` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `requested_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requested_by` (`requested_by`),
  CONSTRAINT `equipment_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `equipmentitems`
CREATE TABLE IF NOT EXISTS `equipmentitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `unique_code` varchar(255) NOT NULL,
  `status` enum('available','in-use','maintenance') DEFAULT 'available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`unique_code`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `equipmentitems_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `maintenance_logs`
CREATE TABLE IF NOT EXISTS `maintenance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `technician_id` int NOT NULL,
  `last_maintenance` date NOT NULL,
  `next_maintenance` date NOT NULL,
  `maintenance_type` enum('routine','repair','calibration') NOT NULL,
  `issue` text NOT NULL,
  `status` enum('completed','pending','in-progress') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `technician_id` (`technician_id`),
  CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_logs_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `maintenance_requests`
CREATE TABLE IF NOT EXISTS `maintenance_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `issue` text NOT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `requested_by` (`requested_by`),
  CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `misuse_reports`
CREATE TABLE IF NOT EXISTS `misuse_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `reported_by` int NOT NULL,
  `issue` text NOT NULL,
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `misuse_reports_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `misuse_reports_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `Reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_item_id` int NOT NULL,
  `user_id` int NOT NULL,
  `time_slot_id` int NOT NULL,
  `date` date NOT NULL,
  `lab` varchar(255) NOT NULL,
  `purpose` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `equipment_item_id` (`equipment_item_id`),
  KEY `user_id` (`user_id`),
  KEY `time_slot_id` (`time_slot_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`equipment_item_id`) REFERENCES `EquipmentItems` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `timeslots`
CREATE TABLE IF NOT EXISTS `timeslots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slot_time` varchar(50) NOT NULL,
  `available` tinyint(1) DEFAULT '1',
  `date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `usage_logs`
CREATE TABLE IF NOT EXISTS `usage_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `usage_logs_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usage_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lab VARCHAR(25) NOT NULL,
    items VARCHAR(255) NOT NULL,
    status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
    approval_stat ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE project_team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
