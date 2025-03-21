<?php
// Create database connection
$conn = new mysqli("localhost", "root", "");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS lms";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select the database
$conn->select_db("lms");

// Create instructor table
$sql = "CREATE TABLE IF NOT EXISTS instructor (
    instructor_id VARCHAR(10) PRIMARY KEY,
    ins_fname VARCHAR(50) NOT NULL,
    ins_lname VARCHAR(50) NOT NULL,
    ins_email VARCHAR(100) NOT NULL,
    ins_phone VARCHAR(15) NOT NULL,
    ins_cnic VARCHAR(15) NOT NULL,
    ins_qualification VARCHAR(100) NOT NULL,
    ins_specialization VARCHAR(100) NOT NULL,
    ins_yoe INT NOT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "Instructor table created successfully or already exists<br>";
} else {
    echo "Error creating instructor table: " . $conn->error . "<br>";
}

$conn->close();
echo "Database setup completed!";
?> 