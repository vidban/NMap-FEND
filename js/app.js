// called if there is error loading google maps API
function googleError(){
	alert("There was an error loading Google Maps. Please check your console for details!");
}

var map = ko.observable();
var infowindow, service;
var placeArray = ko.observableArray();
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var marker = ko.observableArray();
var currentMarker = '';
var autocomplete;
var countryRestrict = {'country':'us'};
var cityName;


// create a map and setup markers for desired establishment
function initialize() {
	"use strict";

	// set initial location to whole of continental U.S.
	var loc = new google.maps.LatLng(37.1, -95.7);
	map = new google.maps.Map(document.getElementById('map'), {
		center: loc,
		zoom: 3,
		mayTypeControl: false,
		zoomControl: false,
		streetViewControl:false
	}); 

	//gets autocomplete input for city
	getCityInput();
}

// Capture inputs for city
function getCityInput(){
	// Create the autocomplete object and associate it with the UI input control.
  	// Restrict the search to the default country, and to place type "cities".
  	autocomplete = new google.maps.places.Autocomplete((document.getElementById('ecity')), {
													        types: ['(cities)'],
													        componentRestrictions: countryRestrict
												    	});
	service  = new google.maps.places.PlacesService(map);

	autocomplete.addListener('place_changed', onPlaceChanged);
}

// zoom map to entered city and change heading of page accordingly
function onPlaceChanged(){

	var place= autocomplete.getPlace();

	// var to get latitude and longitude of city to map using google maps API
	loc= new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());

	// variable to store city,state and country for yelp matching
	cityName = place.formatted_address;

	//Empty previous list and markers
	placeArray([]);
	marker([]);

	// set heading based on place 
	$('#heading').html("Restaurants around " + place.name);

	// if place found zoom to place else ask user to enter a valid city
	if (place.geometry) {
		map.panTo(place.geometry.location);
		if (screen.width < 600) {
			map.setZoom(12);
		} else {
    		map.setZoom(15);
    	}

    	//hide citysearch input field
		$('.csearch').toggleClass("hidden");

		//perform location search
    	search();
    	
    	var check = $('.menu').hasClass('closed');
    	if (screen.width > 600 && check) {
    		toggleMenu();
    	}
	} else {
		alert("Enter a valid city");
		getCityInput();
	}
}


function search(){
	infowindow = new google.maps.InfoWindow({maxWidth: 200});

	service.nearbySearch({
		bounds: map.getBounds(),
		types: ['restaurant']
	}, callback);
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
    	for (var i = 0; i < results.length; i++) {
      		createMarker(results[i], i);
	    }
	} else {
		alert(status);
	}	
}

//create markers
function createMarker(place, i) {
	var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
   	var markerIcon = MARKER_PATH + markerLetter + '.png';
   	var markerLabel = place.name;

	marker[i] = new google.maps.Marker({
		map: map,
	    position: place.geometry.location,
	    animation: google.maps.Animation.DROP,
	    icon: markerIcon,
	    visible: false,
	    name: markerLabel,
	});

	// Load infowindow on marker click and toggle marker bounce
	google.maps.event.addListener(marker[i], 'click', function() {
		var swidth = screen.width;
		map.panTo(this.position);
		map.panBy(0,-200);

		service.getDetails({placeId: place.place_id}, function(place, status){
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				alert(status);
				return;
			}
			loadYelp(place.name,place.formatted_address,cityName);
		});
		infowindow.open(map, this);

		// add bounce feature to marker upon click and stop earlier marker from bouncing
		if (currentMarker!=='') currentMarker.setAnimation(null);
		currentMarker= this;
		this.setAnimation(google.maps.Animation.BOUNCE);
	});


	//stops marker bounce on close of infowindow
	google.maps.event.addListener(infowindow,'closeclick', function(){
		marker[i].setAnimation(null);
		$('.listview').removeClass("selected");
		map.panTo(place.geometry.location);
		if (screen.width < 600) {
			map.setZoom(12);
		} else {
    		map.setZoom(15);
    	}
	});

	// populate arrays with results of google placesearch
   	placeArray.push({"num": i,"name": place.name, "iconimage":markerIcon, "placeResult":place}); 

   	// push newly created marker into array
   	marker.push(marker[i]);	

   	// attach remove marker listener to marker when change city button clicked
   	var button = document.querySelector("button");
   	button.addEventListener("click", function(){
   		marker[i].setMap(null);
   		marker([]);
   	})
}

function loadYelp(pname,paddress,cityName){
  	var placeName = pname;

	/*variables to check whether address on google maps matches yelp address */
	var placeAddress = paddress.slice(0,3);

	/*Variable for OAuth Authentication. */
	var auth = {
	    consumerKey: "rb0_f_10ZvwVLb-ouicNzQ",
	    consumerSecret: "rppLm7P8oempuQYXa4AiS9ij26Y",
	    accessToken: "VZp-IvJfl6hGPyU93vX-Il-oVIR3U72e",
	    accessTokenSecret: "YpfDA6iodkeNOIaAlympNA-ntHU",
	    serviceProvider : {signatureMethod : "HMAC-SHA1"}
	};

	var accessor = {
	    consumerSecret : auth.consumerSecret,
	    tokenSecret : auth.accessTokenSecret
	};
	/*Terms to search */
	var terms = placeName.replace(' ','+');
	var cntry = 'US';
	var parameters = [];

	parameters.push(['term', terms]);
	parameters.push(['location', cityName]);
	parameters.push(['cc', cntry]);
	parameters.push(['limit', 3]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

	var message = {
	    'action' : 'http://api.yelp.com/v2/search',
	    'method' : 'GET',
	    'parameters' : parameters
	};

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	var parameterMap = OAuth.getParameterMap(message.parameters);

	$.ajax({
		'cache': true,
		'url' : message.action,
		'data' : parameterMap,
	    'dataType' : 'jsonp',
	    'success' : function(data) {
			    		var found = false;
	    				// Loop over businesses if more than one with same name found
	    				if ((data.businesses.length >= 1) && !found) {
	    					for (var x in data.businesses){
			    				// to check thoroughly through all given addresses for that location:
			    				var resultlen = data.businesses[x].location.address.length;
			                    var result = data.businesses[x];
			                    // loop over addresses to check for matching Google maps api returned address
			                	for (var n=0; n<resultlen; n++){
			                		raddress = result.location.address[n].slice(0,3);
			                			if (raddress==placeAddress){ 
			                    			var windowContent ='';
				                   			windowContent += '<div id="infowindow"><img src="img/yelp_powered_btn_red.png"><br><img id= "bimage" src= "' + result.image_url + '"><br><strong>' + result.name + '</strong><div>' + result.location.display_address.toString() + '</div><div>' + result.display_phone + '</div><br><img src="' + result.rating_img_url_small + '" alt="rating"> (' + result.rating + ')<br><div>Number of Reviews:' + result.review_count + '</div><br><div>' + result.snippet_text + '</div><a href= "' + result.url + '">...Read More</div>';
				                   			found = true;
				                		}
				                }
	    					}
	    				}
		                if (!found) {
		                	windowContent = 'Cannot find Yelp Review for this location! It could be reviewed under a different name or it might have CLOSED!';
		                }
	                    infowindow.setContent(windowContent);
	                },
	    'error' : function(XMLHttpRequest, textStats, errorThrown) {
	      alert('Error: Problem connecting to Yelp.');
	    }

	});
}

// controls List menu transition on screens below 600 px width
function toggleMenu(){
	if ($(".menu").hasClass("open")){
		$(".menu").removeClass("open").addClass("closed");
		$(".main").removeClass("hidemap").addClass("showmap");

	}else {
		$(".menu").removeClass("closed").addClass("open");
		$(".main").removeClass("showmap").addClass("hidemap");
	}
}

//add functionality to Change City button
function toggleCitySearch(){
	placeArray([]);
	map.setCenter(new google.maps.LatLng(37.1, -95.7));
	map.setZoom(3);
	$('.csearch').toggleClass('hidden');
	$('.csearch input').val(" ").focus();
	infowindow.close();
	if (screen.width < 600) {
		toggleMenu();
	}
}

var placeViewModel = {
	names: placeArray,
	markers: marker,
	currentSelected: ko.observable(),
	selectItem: function(that, ind){
		that.currentSelected(ind.num);
		that.filteredPin(ind.name);
	},
	filter: ko.observable(""),
	filteredPin: ko.observable("")
};

// filters list and markers based on search
placeViewModel.filteredItems = ko.computed(function() {
	var filter = this.filter().toLowerCase();
	if (!filter){
		for (var k in this.markers()){
			this.markers()[k].visible = true;
		}
		return this.names();
	} else {
		infowindow.close();  		//close infowindow if filter location does not match

		ko.utils.arrayFilter(this.markers(), function(pin) {
			var matches = pin.name.toLowerCase().indexOf(filter) >= 0;
			pin.setVisible(matches);
		});
		return ko.utils.arrayFilter(this.names(), function(item) {
			return item.name.toLowerCase().indexOf(filter) !== -1;
		});
	}
}, placeViewModel);

// triggers click for associated marker on menu click
placeViewModel.selectedPin = ko.computed(function() {
	if (screen.width <= 600) {
		$(".menu").removeClass("open").addClass("closed");
		$(".main").removeClass("hidemap").addClass("showmap");
	}

	var filteredPin = this.filteredPin();
	if (filteredPin){
		for (var k in this.markers()){
			if (this.markers()[k].name === filteredPin){
				google.maps.event.trigger(this.markers()[k], 'click');
			}
		}
	}
}, placeViewModel);

ko.applyBindings(placeViewModel);
