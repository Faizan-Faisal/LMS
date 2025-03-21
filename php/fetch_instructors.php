<?php
include 'connect.php';

$sql = "SELECT * FROM instructor";
$result = $conn->query($sql);

$instructors = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $instructors[] = $row;
    }
}

echo json_encode($instructors);
$conn->close();
?>
