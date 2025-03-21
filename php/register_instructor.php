<?php
// Prevent any output before headers
ob_start();

// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set response headers
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Function to send JSON response
function sendJsonResponse($success, $message, $data = null) {
    // Clear any previous output
    if (ob_get_length()) ob_clean();
    
    // Prepare response
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    // Send response
    echo json_encode($response);
    exit;
}

try {
    // Log the start of the request
    error_log("Starting instructor registration process");
    error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
    error_log("Raw POST data: " . file_get_contents('php://input'));
    error_log("POST array: " . print_r($_POST, true));
    error_log("FILES array: " . print_r($_FILES, true));
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        sendJsonResponse(false, "Invalid request method. Only POST is allowed.");
    }

    // Include database connection
    require_once __DIR__ . '/connect.php';

    // Validate required fields
    $required_fields = ['instructor_id', 'ins_fname', 'ins_lname', 'ins_email', 'ins_phone', 'ins_cnic', 'ins_qualification', 'ins_specialization', 'ins_yoe'];
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }
    if (!empty($missing_fields)) {
        error_log("Missing fields: " . implode(', ', $missing_fields));
        sendJsonResponse(false, "Missing required fields: " . implode(', ', $missing_fields));
    }

    // Handle profile picture upload
    $profile_picture_path = null;
    if (isset($_FILES['instructor_profile']) && $_FILES['instructor_profile']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . '/../uploads/instructor_profiles/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['instructor_profile']['name'], PATHINFO_EXTENSION);
        $filename = $_POST['instructor_id'] . '_' . time() . '.' . $file_extension;
        $target_path = $upload_dir . $filename;
        
        // Check file type
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $file_type = $_FILES['instructor_profile']['type'];
        if (!in_array($file_type, $allowed_types)) {
            throw new Exception("Invalid file type. Only JPG, PNG and GIF are allowed.");
        }
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['instructor_profile']['tmp_name'], $target_path)) {
            $profile_picture_path = 'uploads/instructor_profiles/' . $filename;
            error_log("Profile picture uploaded successfully: " . $profile_picture_path);
        } else {
            error_log("Failed to move uploaded file");
            throw new Exception("Failed to upload profile picture");
        }
    }

    // Get and sanitize form data
    $instructor_id = htmlspecialchars(trim($_POST['instructor_id']));
    $ins_fname = htmlspecialchars(trim($_POST['ins_fname']));
    $ins_lname = htmlspecialchars(trim($_POST['ins_lname']));
    $ins_email = filter_var($_POST['ins_email'], FILTER_SANITIZE_EMAIL);
    $ins_phone = htmlspecialchars(trim($_POST['ins_phone']));
    $ins_cnic = htmlspecialchars(trim($_POST['ins_cnic']));
    $ins_qualification = htmlspecialchars(trim($_POST['ins_qualification']));
    $ins_specialization = htmlspecialchars(trim($_POST['ins_specialization']));
    $ins_yoe = intval($_POST['ins_yoe']);

    // Log sanitized data
    error_log("Sanitized data: " . print_r([
        'instructor_id' => $instructor_id,
        'ins_fname' => $ins_fname,
        'ins_lname' => $ins_lname,
        'ins_email' => $ins_email,
        'ins_phone' => $ins_phone,
        'ins_cnic' => $ins_cnic,
        'ins_qualification' => $ins_qualification,
        'ins_specialization' => $ins_specialization,
        'ins_yoe' => $ins_yoe,
        'profile_picture' => $profile_picture_path
    ], true));

    // Validate instructor ID format
    if (!preg_match('/^INS\d{3}$/', $instructor_id)) {
        error_log("Invalid instructor ID format: " . $instructor_id);
        sendJsonResponse(false, "Invalid instructor ID format. Must be INS followed by 3 digits.");
    }

    // Check if instructor ID already exists
    $check_sql = "SELECT instructor_id FROM instructor WHERE instructor_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) {
        error_log("Database error (prepare check_stmt): " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }

    $check_stmt->bind_param("s", $instructor_id);
    if (!$check_stmt->execute()) {
        error_log("Database error (execute check_stmt): " . $check_stmt->error);
        throw new Exception("Failed to check instructor ID: " . $check_stmt->error);
    }
    $result = $check_stmt->get_result();

    if ($result->num_rows > 0) {
        error_log("Instructor ID already exists: " . $instructor_id);
        sendJsonResponse(false, "Instructor ID already exists.");
    }

    // Insert new instructor
    $sql = "INSERT INTO instructor (instructor_id, ins_fname, ins_lname, ins_email, ins_phone, ins_cnic, ins_qualification, ins_specialization, ins_yoe, profile_picture) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Database error (prepare insert stmt): " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }

    $stmt->bind_param("ssssssssss", 
        $instructor_id, 
        $ins_fname, 
        $ins_lname, 
        $ins_email, 
        $ins_phone, 
        $ins_cnic, 
        $ins_qualification, 
        $ins_specialization, 
        $ins_yoe,
        $profile_picture_path
    );

    if (!$stmt->execute()) {
        error_log("Database error (execute insert stmt): " . $stmt->error);
        throw new Exception("Failed to register instructor: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    error_log("Instructor registration successful for ID: " . $instructor_id);
    sendJsonResponse(true, "Instructor registered successfully!");

} catch (Exception $e) {
    error_log("Error in register_instructor.php: " . $e->getMessage());
    sendJsonResponse(false, "An error occurred: " . $e->getMessage());
}
?>
