<?php
require 'connect.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug log
error_log("Received request: " . file_get_contents("php://input"));

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // Log received data
        error_log("Received data: " . print_r($data, true));

        // Validate required fields
        $required_fields = [
            'instructorId', 'firstName', 'lastName', 'email',
            'phone', 'cnic', 'department', 'qualification',
            'specialization', 'experience'
        ];

        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                throw new Exception("Missing required field: $field");
            }
        }

        // Prepare SQL statement
        $sql = "INSERT INTO instructors (
            instructor_id, first_name, last_name, email,
            phone_number, cnic, department, qualification,
            specialization, years_of_experience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $con->prepare($sql);
        
        if (!$stmt) {
            error_log("Database prepare error: " . $con->error);
            throw new Exception("Database error: " . $con->error);
        }

        $stmt->bind_param("sssssssssi",
            $data['instructorId'],
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $data['cnic'],
            $data['department'],
            $data['qualification'],
            $data['specialization'],
            $data['experience']
        );

        // Log the query that will be executed
        error_log("Executing query with values: " . print_r([
            $data['instructorId'],
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $data['cnic'],
            $data['department'],
            $data['qualification'],
            $data['specialization'],
            $data['experience']
        ], true));

        if ($stmt->execute()) {
            $response = [
                "success" => true,
                "message" => "Instructor registered successfully",
                "instructorId" => $data['instructorId']
            ];
            error_log("Success response: " . print_r($response, true));
            http_response_code(200);
            echo json_encode($response);
        } else {
            error_log("Execute error: " . $stmt->error);
            throw new Exception("Error executing query: " . $stmt->error);
        }

        $stmt->close();

    } catch (Exception $e) {
        error_log("Error caught: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
}
?>