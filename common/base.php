<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

include_once("constants.php");

date_default_timezone_set('America/Denver');

try {
	$dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME;
	$db = new PDO($dsn, DB_USER, DB_PASS);
} catch(PDOException $e) {
	die("Connection failed: " . $e->getMessage());
}

?>