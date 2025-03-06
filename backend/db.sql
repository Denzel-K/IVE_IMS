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

CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lab VARCHAR(100) NOT NULL,  -- Which lab owns this item
    status ENUM('available', 'in use', 'maintenance', 'damaged') DEFAULT 'availabel',
    unique_code VARCHAR(255) UNIQUE NOT NULL, -- Barcode/QR Code scanning
    current_location VARCHAR(255) NOT NULL, -- Tracks where the item is
    last_maintenance DATE DEFAULT NULL,
    next_maintenance DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_lab VARCHAR(100) NOT NULL
);

CREATE TABLE machines (
    id INT PRIMARY KEY, -- Same ID as equipment
    power_rating VARCHAR(50), -- e.g., "220V, 3HP"
    manufacturer VARCHAR(255),
    FOREIGN KEY (id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE maintenance_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    reminder_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE asset_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    from_lab VARCHAR(100) NOT NULL,
    to_lab VARCHAR(100) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lab VARCHAR(25) NOT NULL,
    items VARCHAR(255) NOT NULL,
    status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
    start_date DATE,
    end_date DATE,
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

ALTER TABLE projects ADD COLUMN admin_approval ENUM('pending', 'approved', 'denied') DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    project_id INT NOT NULL,
    reserved_by INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reserved_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE project_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE timeslots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    equipment_id INT NOT NULL, -- Replacing resource_id with equipment_id
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) -- Assuming an 'equipment' table exists
);

CREATE TABLE usage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE usage_history ADD COLUMN workspace_id INT NOT NULL;

CREATE TABLE workspaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    availabel BOOLEAN DEFAULT TRUE
);

CREATE TABLE workspace_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    project_id INT NOT NULL,
    reserved_by INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY (reserved_by) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE workspace_usage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Insert sample data into the equipment table
INSERT INTO equipment (name, type, unique_code, status, power_rating, manufacturer, lab, quantity)
VALUES
    ('Oscilloscope', 'electrical', 'EQ-123456789', 'available', '100W', 'Tektronidesign-studiox', 'cezeri', 5),
    ('Centrifuge', 'mechanical', 'EQ-987654321', 'in-use', '500W', 'Eppendorf', 'design-studio', 2),
    ('Microscope', 'electrical', 'EQ-456789123', 'maintenance', '50W', 'Nikon', 'cezeri', 3),
    ('Pipettes', 'consumables', 'EQ-321654987', 'available', NULL, 'Gilson', 'design-studio', 10),
    ('Autoclave', 'mechanical', 'EQ-789123456', 'available', '1500W', 'Tuttnauer', 'cezeri', 1),
    ('Hot Plate', 'electrical', 'EQ-654987321', 'in-use', '200W', 'Corning', 'design-studio', 4),
    ('Vortex Mixer', 'mechanical', 'EQ-147258369', 'available', '100W', 'Scientific Industries', 'medtech', 2),
    ('Glassware Set', 'consumables', 'EQ-369258147', 'available', NULL, 'Pyrex', 'cezeri', 20),
    ('Spectrophotometer', 'electrical', 'EQ-258369147', 'maintenance', '300W', 'Thermo Fisher', 'medtech', 1),
    ('Microcentrifuge', 'mechanical', 'EQ-951753852', 'in-use', '250W', 'Beckman Coulter', 'medtech', 3);
cezeri-lab