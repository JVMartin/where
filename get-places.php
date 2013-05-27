<?php

if(!isset($_POST['column']))
	die("Incomplete data sent.");
$column = $_POST['column'];
	
require_once("common/base.php");

$sql = "SELECT `Name`,
				`Address1`,
				`Address2`,
				`Zipcode`,
				X(`Location`) as lng,
				Y(`Location`) as lat
		FROM `locations`
		WHERE `$column` <> 'No'
		AND `Location` <> ''";
		
$stmt = $db->prepare($sql);
$stmt->execute();
$places = array();
while ($row = $stmt->fetch()) {
	$place['name'] = $row['Name'];
	$place['address1'] = $row['Address1'];
	$place['address2'] = $row['Address2'];
	$place['zip'] = $row['Zipcode'];
	$place['lat'] = $row['lat'];
	$place['lng'] = $row['lng'];
	array_push($places, $place);
}
$stmt->closeCursor();
$err = $stmt->errorInfo();
if ($err[2]) die("Database error: " . $err[2]);

echo json_encode($places);

?>