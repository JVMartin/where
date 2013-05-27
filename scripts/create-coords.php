<pre>
<?php
function lookup($string) {
	$string = str_replace (" ", "+", urlencode($string));
	$details_url = "http://maps.googleapis.com/maps/api/geocode/json?address=".$string."&sensor=false";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $details_url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = json_decode(curl_exec($ch), true);

	// If Status Code is ZERO_RESULTS, OVER_QUERY_LIMIT, REQUEST_DENIED or INVALID_REQUEST
	if ($response['status'] != 'OK') {
		return null;
	}

	//print_r($response);
	$geometry = $response['results'][0]['geometry'];

	$longitude = $geometry['location']['lat'];
	$latitude = $geometry['location']['lng'];

	$array = array(
		'latitude' => $geometry['location']['lng'],
		'longitude' => $geometry['location']['lat'],
		'location_type' => $geometry['location_type'],
	);

	return $array;
}


require_once("../common/base.php");

$sql = "SELECT *
		FROM `locations`";
		
$stmt = $db->prepare($sql);
$stmt->execute();
$places = array();
while ($row = $stmt->fetch()) {
	array_push($places, $row);
}
$stmt->closeCursor();
$err = $stmt->errorInfo();
if ($err[2]) die("Database error: " . $err[2]);

$sql = "UPDATE `locations`
		SET `location` = GeomFromText(:point)
		WHERE `id`=:id";
$stmt = $db->prepare($sql);

foreach ($places as $place) {
	if(empty($place['Address1']))
		continue;
	$address = $place['Address1'].$place['Address2']." Albuquerque NM ".$place['Zipcode'];
	if (strstr($address, "PO B")
		|| strstr($address, "P.O. B")
		|| strstr($address, "P.O.B"))
		continue;
	/*$array = lookup($address);
	$point = "POINT(".$array['latitude']." ".$array['longitude'].")";
	echo $point . "\n";
	$stmt->bindParam(':point', $point, PDO::PARAM_STR);
	$stmt->bindParam(':id', $place['id'], PDO::PARAM_STR);
	$stmt->execute();*/
}

$stmt->closeCursor();
$err = $stmt->errorInfo();
if ($err[2]) die("Database error: " . $err[2]);
echo "\nSuccessful exit.\n";
?>
</pre>