CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone_number VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    gender  ENUM('male', 'female') DEFAULT 'male',
    image VARCHAR(255) DEFAULT 'https://res.cloudinary.com/dmerqdsm3/image/upload/v1724317816/profile-picture/tvrg2tuayakndkpoldqj.jpg',
    public_id VARCHAR(255) DEFAULT 'profile-picture/tvrg2tuayakndkpoldqj',
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
