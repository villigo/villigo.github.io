<?php
    $email_to = 'info@guineagold.co.uk';

    $email = $_POST['email'];
    $name = $_POST['name'];
    $subject = $_POST['subject'];
    $body = $_POST['message'];
    $headers = "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $email" . "\r\n" .
    "Reply-To: $email" . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

    $message = "<strong>Name:</strong> $name <br>
    <strong>Mailbox:</strong> $email<br><br>
    $body";


    if(mail($email_to, $subject, $message, $headers)){
        header("location:https://guineagold.co.uk/");

    }else{
        echo 'failed';
    }
?>