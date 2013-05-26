<?php

require_once("common/base.php");

$sql = "SELECT *
		FROM `locations`";
		
$stmt = $db->prepare($sql);
$stmt->execute();
while ($row = $stmt->fetch()) {
	print_r($row);
}
$stmt->closeCursor();

?>