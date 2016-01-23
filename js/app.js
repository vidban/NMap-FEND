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

// create a map and setup markers for desired establishment
function initialize() {
	"use strict";

	var loc = new google.maps.LatLng(37.383977, -122.081295);

	map = new google.maps.Map(document.getElementById('map'), {
		center: loc,
		zoom: 15
	});

	infowindow = new google.maps.InfoWindow({maxWidth: 200});

	service  = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: loc,
		radius: 1000,
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

		// move map vertically down 40 pixels when on small screens to show infowindow properly
		if (swidth <= 600){
			console.log('here');
			map.panBy(0,-200);
		}

		service.getDetails({placeId: place.place_id}, function(place, status){
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				alert(status);
				return;
			}
		loadYelp(place.name,place.formatted_address);
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
	});

	// populate arrays with results of google placesearch
   	placeArray.push({"num": i,"name": place.name, "iconimage":markerIcon, "placeResult":place}); 
   	marker.push(marker[i]);	

}


function loadYelp(pname,paddress){
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
  var near = 'Mountain+View';
  var parameters = [];

  parameters.push(['term', terms]);
  parameters.push(['location', near]);
  parameters.push(['limit', 1]);
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
    'jsonpCallback' : 'cb',
    'success' : function(data) {
                    var result = data.businesses[0];
                    var raddress = result.location.address[0].slice(0,3);
                    var windowContent ='';
                    if (raddress==placeAddress){ 
	                    windowContent += '<div id="infowindow"><img src="img/yelp_powered_btn_red.png"><br><img id= "bimage" src= "' + result.image_url + '"><br><strong>' + result.name + '</strong><div>' + result.location.display_address.toString() + '</div><div>' + result.display_phone + '</div><br><img src="' + result.rating_img_url_small + '" alt="rating"> (' + result.rating + ')<br><div>Number of Reviews:' + result.review_count + '</div><br><div>' + result.snippet_text + '</div><a href= "' + result.url + '">...Read More</div>';}
	                else {windowContent = 'No Yelp Reviews Found for this address!';}
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
	for (var k in this.markers()){
		if (this.markers()[k].name === filteredPin){
			google.maps.event.trigger(this.markers()[k], 'click');
		}
	}
}, placeViewModel);

ko.applyBindings(placeViewModel);
