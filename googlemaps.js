// Reference 1: https://developers.google.com/maps/documentation/directions/intro#DirectionsResponses
// Reference 2: xhr_example.js example in the help page for 'maxurl' object 

outlets = 2;
var ajaxreq; 

function anything() {
	var orig = arrayfromargs(messagename, arguments)[0]; // Earl+V.+Moore+Building
	var origWithPlus = orig.replace(/ /g, '+')
	var dest = arrayfromargs(messagename, arguments)[1];
	var destWithPlus = dest.replace(/ /g, '+')
	var url = 'https://maps.googleapis.com/maps/api/directions/json?origin='+origWithPlus+'&destination='+destWithPlus+'&key=AIzaSyDVc-hRaC7_ZXenakrVC4G9Mj3HVjfxPFQ';
	
	ajaxreq = new XMLHttpRequest();
	ajaxreq.open("GET",url);
	ajaxreq.onreadystatechange = readystatechange;
	ajaxreq.send();
}

// Here we fetch data and use javascript's internal JSON.parse method to read
// individual elements from and array of objects (aka dictionaries)
function readystatechange() {
	if (this.readyState ==4) {
		var json = JSON.parse(this.responseText);
		
		// global informations
		var r = json.routes[0].legs[0]
		var start = r.start_address;
		var end = r.end_address;
		var distance = r.distance.value;
		var duration = r.duration.value;
		var b = json.routes[0].bounds
		var startX = b.southwest.lng;
		var startY = b.southwest.lat;
		var endX = b.northeast.lng;
		var endY = b.northeast.lat;
		// send data as list
		outlet(0, 0, start, end, distance, duration, startX, startY, endX, endY);

		var steps = json.routes[0].legs[0].steps
		for (i = 0; i < steps.length; i++) { 
			// information of each step
			var s = steps[i];

			// remove html tags, parse direction .
			// http://stackoverflow.com/questions/1499889/remove-html-tags-in-javascript-with-regex
			var regex = /(<([^>]+)>)/ig
			,   instruction = s.html_instructions.replace(regex, "");
			var result = s.html_instructions.match(/<b>(.*?)<\/b>/g).map(function(val){
			   return val.replace(/<\/?b>/g,'');
			}); 
			
			var direction, road;
			if (result.length == 1) {
				direction = 'continue';
				road = result[0];
			} else {
				direction = result[0];
				road = result[1];
			}
			var distance = s.distance.value;
			var duration = s.duration.value;
			var startX = s.start_location.lng;
			var startY = s.start_location.lat;
			var endX = s.end_location.lng;
			var endY = s.end_location.lat;
						
			// send data as list, this will feed into coll.
			outlet(0, i+1, direction, road, distance, duration, startX, startY, endX, endY, instruction); 
		}
		
		outlet(1, "bang"); // bang when it finishes.
	}
}
