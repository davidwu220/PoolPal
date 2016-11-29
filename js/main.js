/**
 * Created by davidwu on 6/30/15.
 */

var map;
var userLcn;
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var origin            = null;
var destination       = null;
var waypoints         = [];
var markers           = [];
var directionsVisible = false;

// TODO: still need to import many functions from the example
// TODO: maybe add reorganizible functions
function initialize() {
    // Initialize stuff
    //directionsDisplay = new google.maps.DirectionsRenderer();

    $("#opt-menu").mmenu({
        // options
        extensions: ["widescreen", "multiline"],
        onClick: { setSelected: false }
        // offCanvas: { zposition: "front" }
    // }, {
    //     // configuration
    //     classNames: {
    //         divider: "title",
    //         selected: "active"
    //     }
    });

    // Setting up the map
    var mapOptions = {
        zoom: 14,
        disableDefaultUI: true
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // try HTML5 geoloctation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            var GeoMarker = new GeolocationMarker(map);

            map.setCenter(pos);
            userLcn = pos;
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));

    google.maps.event.addListener(map, 'click', function (event) {
        if(origin == null && document.getElementById('userLocation').checked){
            origin = userLcn;
            addMarker(origin);
        }
        if(origin == null) {
            origin = event.latLng;
            addMarker(origin);
        }
        else if (destination == null) {
            destination = event.latLng;
            addMarker(destination);
        }
        else {
            if(waypoints.length < 9) {
                waypoints.push({
                    location: destination,
                    stopover: true
                });
                destination = event.latLng;
                addMarker(destination);
            }
            else {
                alert('Maximum number of waypoints reached!');
            }
        }
    });
}

function handleNoGeolocation(errorFlag) {
    var content;
    if (errorFlag) {
        content = 'Error: The Geolocation service failed.';
    } else {
        content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

function addMarker(latlng) {
    markers.push(new google.maps.Marker({
        position: latlng,
        map: map,
        icon: {
            url: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=' +
                String.fromCharCode(markers.length + 65) +
                '&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=2',
            scaledSize: new google.maps.Size(22, 40)
        }
    }));
}

// Perform route calculation
function calcRoute() {
    if(origin == null) {
        alert('Click on the map to add a start point');
        return;
    }

    if(destination == null) {
        alert('Click on the map to add an end point');
        return;
    }

    var request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        optimizeWaypoints: document.getElementById('optimize').checked,
        avoidHighways: document.getElementById('highways').checked,
        avoidTolls: document.getElementById('tolls').checked
    };

    directionsService.route(request, function (response, status) {
        if(status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });

    clearMarkers();
    directionsVisible = true;
}

// Update the route if the user changes the mode
function updateMode() {
    if(directionsVisible) {
        calcRoute();
    }
}

function clearMarkers() {
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function clearWaypoints() {
    markers = [];
    origin = null;
    destination = null;
    waypoints = [];
    directionsVisible = false;
}

function reset() {
    clearMarkers();
    clearWaypoints();
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    map.panTo(userLcn);
    map.setZoom(15);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}