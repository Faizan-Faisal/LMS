<?php
// Prevent any output before headers
ob_start();

// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Log connection attempt
error_log("Attempting database connection...");

// Create connection
$conn = new mysqli("localhost", "root", "", "lms");

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection error: ' . $conn->connect_error
    ]));
}

error_log("Database connection successful");

// Set the connection to use UTF-8
if (!$conn->set_charset("utf8")) {
    error_log("Error loading character set utf8: " . $conn->error);
    die(json_encode([
        'success' => false,
        'message' => 'Character set error: ' . $conn->error
    ]));
}
?>
 

