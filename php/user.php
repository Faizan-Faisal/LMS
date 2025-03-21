<?php
include 'connect.php';
if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $mobile = $_POST['mobile'];
    $password = $_POST['password'];

    $sql = "insert into crud (name, email, mobile, password) values ('$name','$email','$mobile','$password')";

    $result = mysqli_query($con, $sql);
    if($result){
        // echo "Data inserted successfully";
        header('location:display.php'); 
    } else {
        die(mysqli_error($con));
    }
}
?>

<form>
  <div class="form-group">
    <label> Name </label>
    <input type="text" class="form-control" placeholder="Enter Your Name" name = "name" autocomplete= "off">
  </div>

  <div class="form-group">
    <label>Email</label>
    <input type="email" class="form-control" placeholder="Enter email" name = "email" autocomplete= "off">
  </div>

  <div class="form-group">
    <label>Mobile</label>
    <input type="text" class="form-control" placeholder="Enter mobile" name = "mobile" autocomplete= "off">

  <div class="form-group">
    <label>Password</label>
    <input type="password" class="form-control" placeholder="Password" name = "password" autocomplete = "off">
  </div>

</form>