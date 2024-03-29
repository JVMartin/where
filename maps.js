var map;
var geocoder;
var Albuquerque = new google.maps.LatLng(35.109494,-106.617079);
var kmlMarkers = [], stepMarkers = [], markers = [];
var descs = [];
var userMarker;
var infoWindow = new google.maps.InfoWindow();
var directionsService;
var fromAddress, toAddress;
var transportType = 'Car';

function getKMLMarkers() {
	$.get("where.kml", function(data) {
		html = "";
		
		$(data).find("Placemark").each(function(index, value) {
			var coords = $(this).find("coordinates").text().split(",");
			var name = $(this).find("name").text();
			var desc = $(this).find("description").text();
			descNoTooltip = '<b>'+name+'</b><br />'+desc;
			descs.push(descNoTooltip);
			desc = '<div class="tooltips"><b>'+name+'</b><br />'+desc+'</div>';
			
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(coords[1],coords[0]),
				map: map,
				title: name,
				icon: 'http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-dot.png'
			});
			kmlMarkers.push(marker);
			var index = kmlMarkers.indexOf(marker);
			google.maps.event.addListener(kmlMarkers[index], 'click', function() {
				infoWindow.setContent(desc);
				infoWindow.open(map, kmlMarkers[index]);
			});
		});
	});
}

function initialize() {
	var mapOptions = {
		center: Albuquerque,
		zoom:11,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	map=new google.maps.Map(document.getElementById("googleMap"), mapOptions);
	geocoder = new google.maps.Geocoder();
	directionsService = new google.maps.DirectionsService();
	
	//getKMLMarkers();
	getMarkers('Aluminum Cans');
}
google.maps.event.addDomListener(window, 'load', initialize);

function codeAddress() {
	var address = $("#addressInput").val() + " Albuquerque, NM";
	fromAddress = address;
	geocoder.geocode({'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (userMarker) {
				userMarker.setMap(null);
				userMarker = null;
			}
			userMarker = new google.maps.Marker({
				position: results[0].geometry.location,
				map: map,
				title: 'Your Location'
			});
			google.maps.event.addListener(userMarker, 'click', function() {
				infoWindow.setContent('<div class="tooltips"><b>Your Location</b></div>');
				infoWindow.open(map, userMarker);
			});
			map.panTo(results[0].geometry.location);
			map.setZoom(12);
			
			var userLocation = results[0].geometry.location;
			var otherLocation;
			var i, distance, temp;
			var distanceArray = [];
			for (i = 0; i < kmlMarkers.length; i++) {
				otherLocation = kmlMarkers[i].getPosition();
				distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, otherLocation);
				temp = [distance, i]; 
				distanceArray.push(temp);
			}
			distanceArray.sort(function(a, b) {
				return a[0] - b[0];
			});
			
			var index, theHtml;
			$("#locationsDiv").children().remove();

			var isActive;
			for (i = 0; i < kmlMarkers.length; i++) {
				index = distanceArray[i][1];
				if (i==0) isActive = ' active';
				else isActive = '';
				theHtml = '<div class="locationDiv'+isActive+'" data-marker-id="'+index+'"><div class="locationInner"><img src="http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-dot.png" />'+descs[index]+'</div></div>';
				$("#locationsDiv").append(theHtml);
			}
			toAddress = $(".locationDiv").first().find('p').text() + ' Albuquerque, NM';
			setTimeout(function() {
				google.maps.event.trigger(kmlMarkers[distanceArray[0][1]], "click");
			}, 1000);
			
			$("#moreDiv").slideDown();
		} else {
			alert("Geocode was not successful: " + status);
		}
	});
}

$(document).on('click', '.locationDiv', function() {
	var index = $(this).data('marker-id');
	google.maps.event.trigger(kmlMarkers[index], "click");
	toAddress = $(this).find('p').text() + ' Albuquerque, NM';
	$(".locationDiv.active").removeClass('active');
	$(this).addClass('active');
});

$(document).ready(function() {
	$("#addressInput").focus();
	$('#addressInput').keydown(function(e) {
		if (e.keyCode == 13) {
			codeAddress();
		}
	});
	$("#addressDoneButton").click(codeAddress);
	$(".transportDiv").click(function() {
		$(".transportDiv.active").removeClass('active');
		$(this).addClass('active');
		transportType = $(this).data('type');
	});
	
	$("#getDirectionsButton").click(function() {
		if (!fromAddress) {
			alert("You must first enter an address!");
			return;
		} else if (!toAddress) {
			alert("You must first select a recycling location from the 3 listed!");
		}
		
		$("#enterAddressDiv").hide();
		
		var userTravelMode;
		switch(transportType) {
			case 'Car': userTravelMode = google.maps.TravelMode.DRIVING; break;
			case 'Bike': userTravelMode = google.maps.TravelMode.BICYCLING; break;
			case 'Walk': userTravelMode = google.maps.TravelMode.WALKING; break;
			case 'Bus': userTravelMode = google.maps.TravelMode.TRANSIT; break;
		}
		
		var directionsRequest = {
			origin: fromAddress,
			destination: toAddress,
			travelMode: userTravelMode
		};
		
		directionsService.route(directionsRequest, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				new google.maps.DirectionsRenderer({
					map: map,
					directions: response,
					panel: document.getElementById('directionsDiv')
				});
				hideMarkers();
				showSteps(response);
				//$("html, body").animate({ scrollTop: 0 }, "slow");
				$("#moreDiv").hide();
			} else {
				alert('Directions error.');
			}
		});
	});
});

$(document).on('click', '#directionsDiv td', function() {
	infoWindow.close();
});

function hideMarkers() {
	for(var i = 0; i < kmlMarkers.length; i++) {
		kmlMarkers[i].setMap(null);
	}
	kmlMarkers = [];
	
	userMarker.setMap(null);
	userMarker = null;
}

function showSteps(directionResult) {
	infoWindow.close();
	var myRoute = directionResult.routes[0].legs[0];
	/*for (i = 0; i < stepMarkers.length; i++) {
		stepMarkers[i].setMap(null);
	}
	stepMarkers = [];*/
	for (var i = 0; i < myRoute.steps.length; i++) {
		var marker = new google.maps.Marker({
			position: myRoute.steps[i].start_point,
			map: map
		});
		attachInstructionText(marker, myRoute.steps[i].instructions);
		stepMarkers.push(marker);
	}
}

function attachInstructionText(marker, text) {
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent('<div class="tooltipsDirections">'+text+'</div>');
		infoWindow.open(map, marker);
	});
}

function getMarkers(column) {
	$.post('get-places.php', {column:column}, function(data) {
		var it;
		try {
			it = JSON.parse(data);
		} catch(e) {
			alert(data);
		}
		for(var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
		// alert(JSON.stringify(it[0]));
		$.each(it, function(index, item) {
			console.log(item.lat+" "+item.lng);
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(item.lat,item.lng),
				map: map,
				icon: 'http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-dot.png'
			});
			markers.push(marker);
			var theHTML = '<div class="tooltips">'
						+'<b>'+item.name+'</b><br />'
						+'<p>'+item.address1+'</p>'
						+item.address2+'<br />'
						+'</div>';
			var index = markers.indexOf(marker);
			google.maps.event.addListener(markers[index], 'click', function() {
				infoWindow.setContent(theHTML);
				infoWindow.open(map, markers[index]);
			});
		});
	});
}

$(document).ready(function() {
	$("#categoryUL > li").click(function() {
		$(this).closest('ul').children('.active').removeClass('active');
		$(this).addClass('active');
	});
	
	$(".typeUL > li").click(function() {
		$('.typeUL > li.active').removeClass('active');
		$(this).addClass('active');
		getMarkers($(this).html());
	});
	
	$("#automotiveLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#automotiveUL').addClass('active');
	});
	$("#electronicLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#electronicUL').addClass('active');
	});
	$("#paperLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#paperUL').addClass('active');
	});
	$("#commonLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#commonUL').addClass('active');
	});
	$("#healthLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#healthUL').addClass('active');
	});
	$("#constructionLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#constructionUL').addClass('active');
	});
	$("#foodLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#foodUL').addClass('active');
	});
	$("#lawnLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#lawnUL').addClass('active');
	});
	$("#miscLI").click(function() {
		$('#categoryUL > li.active').removeClass('active');
		$(this).addClass('active');
		$('.typeUL.active').removeClass('active');
		$('#miscUL').addClass('active');
	});
});