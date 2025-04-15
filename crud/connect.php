<?php
$con = new mysqli('localhost', 'root', '', 'lms');
if (!$con) {
    die(mysqli_error($con));
}
?>