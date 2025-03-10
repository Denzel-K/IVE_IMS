http://localhost:3000/api/equipment-sharing/request
http://localhost:3000/api/equipment-sharing/requests
http://localhost:3000/api/equipment-sharing/available
http://localhost:3000/api/equipment-sharing/approve/:id
http://localhost:3000/api/equipment-sharing/reject/:id

http://localhost:3000/api/maintenance/log
http://localhost:3000/api/maintenance/schedule
http://localhost:3000/api/maintenance/upcoming
http://localhost:3000/api/maintenance/request
http://localhost:3000/api/maintenance/approve/:id
http://localhost:3000/api/maintenance/requests

http://localhost:3000/api/bookings/approved
http://localhost:3000/api/bookings/approve/:id
http://localhost:3000/api/bookings/timeslots
http://localhost:3000/api/bookings/equipment
http://localhost:3000/api/bookings/reserve
http://localhost:3000/api/bookings/pending
http://localhost:3000/api/bookings/logs

http://localhost:3000/api/inventory/list
http://localhost:3000/api/inventory/list/:id
http://localhost:3000/api/inventory/list/:type
http://localhost:3000/api/inventory/list/:code
http://localhost:3000/api/inventory/add
http://localhost:3000/api/inventory/update/:id
http://localhost:3000/api/inventory/delete/:id

http://localhost:3000/api/bookings/timeslots
http://localhost:3000/api/bookings/equipment
http://localhost:3000/api/bookings/pending
http://localhost:3000/api/bookings/approved
http://localhost:3000/api/bookings/logs
http://localhost:3000/api/bookings/usage-logs
http://localhost:3000/api/bookings/reserve
http://localhost:3000/api/bookings/report-misuse
http://localhost:3000/api/bookings/approve/:id
http://localhost:3000/api/bookings/reservations/:id - get
http://localhost:3000/api/bookings/reservations/:id - delete

http://localhost:3000/api/usage/logs
http://localhost:3000/api/usage/export
http://localhost:3000/api/usage/misuse-reports
http://localhost:3000/api/usage/logs/report-misuse
http://localhost:3000/api/usage/add-log


INSERT INTO equipment_requests (equipment_name, from_lab, to_lab, quantity, purpose, time_slot, requested_by)
VALUES 
('Ultimaker S5 3D Printer', 'design-studio', 'medtech-lab', 2, '3D Printing medical device prototypes', '09:00 - 11:00', 1),
('Laser Cutter', 'cezeri-lab', 'design-studio', 1, 'Cutting acrylic sheets for model-making', '14:00 - 16:00', 2),
('CNC Milling Machine', 'medtech-lab', 'cezeri-lab', 1, 'Prototyping for research', '10:00 - 12:00', 1),
('3D Scanner', 'design-studio', 'cezeri-lab', 1, 'Scanning architectural models', '13:00 - 15:00', 1);


-- Insert sample equipment request
INSERT INTO equipment_requests (id, equipment_name, from_lab, to_lab, quantity, purpose, time_slot, status, requested_by) 
VALUES (1, 'Ultimaker S5 3D Printer', 'design-studio', 'cezeri-lab', 1, 'For 3D Printing a prototype', '14:00 - 16:00', 'pending', 3);

ALTER TABLE equipment ADD COLUMN type ENUM('electrical', 'mechanical', 'consumables') NOT NULL;

SELECT * FROM EquipmentItems WHERE equipment_id = '?' AND status = 'available';

INSERT INTO Equipment (name, type, lab, quantity) VALUES
    ('3D Printer', 'electrical', 'design-studio', 10),
    ('Pipette', 'consumable', 'cezeri', 5),
    ('Centrifuge', 'mechanical', 'medtech', 3);




-- Create the database
CREATE DATABASE IF NOT EXISTS informgt;
USE informgt;

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

-- Table structure for table `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `lab` enum('cezeri','design_studio','medtech') NOT NULL,
  `role` enum('admin','technician','student','lab_manager') NOT NULL,
  `approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;