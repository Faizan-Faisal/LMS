<?php
include 'connect.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Display Users</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container">
    <button class="btn btn-primary my-5"><a href="user.php" class="text-light text-decoration-none">Add User</a></button>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Password</th>
                <th>Operations</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $sql = "SELECT * FROM crud";
        $result = mysqli_query($con, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>
                <td>{$row['Id']}</td>
                <td>{$row['name']}</td>
                <td>{$row['email']}</td>
                <td>{$row['mobile']}</td>
                <td>{$row['password']}</td>
                <td>
                    <a href='update.php?updateid={$row['Id']}' class='btn btn-primary btn-sm'>Update</a>
                    <a href='delete.php?deleteid={$row['Id']}' class='btn btn-danger btn-sm'>Delete</a>
                </td>
            </tr>";
        }
        ?>
        </tbody>
    </table>
</div>
</body>
</html>