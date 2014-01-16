"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Map = function() {

    function loadPositionList(positionList) {
        if (!Array.isArray(positionList)) {
            alert("Invalid positionList data: " + JSON.stringify(positionList));
            return;
        }
        if (positionList.length === 0) {
            alert("No positionList data: " + positionList.length);
            return;
        }
        
        clearRoute();
        mapMarker.setMap(null);
        mapCircle.setMap(null);
        
        var latLngArray = [];
        var latLng;
        var bounds = new google.maps.LatLngBounds();        
        var i;
        for (i = 0; i < positionList.length; i++) {
            latLng = new google.maps.LatLng(
                positionList[i].coords.latitude,
                positionList[i].coords.longitude);
            latLngArray.push(latLng);
            
            bounds.extend(latLng);
        }

        /*
        var mapOptions = {
            center: bounds.getCenter(),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        */
        
        drawRoute(latLngArray);
        map.setCenter(bounds.getCenter());

        map.fitBounds(bounds);
//        map.panToBounds(bounds);

    }
    function clearRoute() {
        var newPath = new google.maps.Polyline({
          map: mapMarker.getMap()
        });
        newPath.setMap(null);
    }
    function onPosition(position) {
        var currentCoords = position.coords;
        if (typeof currentCoords === "undefined") {
            alert("Invalid position data: " + JSON.stringify(position));
            return;
        }
        if (typeof mapMarker === "undefined") {
            alert("google map not initialized");
            return;
        }
        var newPosition = new google.maps.LatLng(
            currentCoords.latitude,
            currentCoords.longitude);        

        if (typeof prevPosition !== "undefined" && newPosition.equals(prevPosition)) {
            return;
        }
            
        map.setCenter(newPosition);

        mapMarker.setPosition(newPosition);
        
        mapCircle.setCenter(newPosition);
        mapCircle.setRadius(currentCoords.accuracy);
        
        if (typeof prevPosition !== "undefined") {
            drawNewRoute(newPosition);
        }
        prevPosition = newPosition;
    }
    function drawRoute(latLngArray) {
        
        var newPath = new google.maps.Polyline({
          path: latLngArray,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
      
        newPath.setMap(map);        
    }
    function drawNewRoute(newPosition) {
        var newPathCoords = [
            prevPosition,
            newPosition
        ];

        drawRoute(newPathCoords);
    }
    
    function init() {

        if (typeof prevPosition !== "undefined") {
            return;
        }
    
        if (typeof config === "undefined") {
            return;
        }
        
        if (typeof google === "undefined") {
            alert("init error: google undefined");
            return;
        }
        var initialPosition = new google.maps.LatLng(
            config["latitude"],config["longitude"]);

        var mapOptions = {
            center: initialPosition,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: config["zoom"]
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        
        var markerOption = {
            map: map,
            position: initialPosition
        };
        mapMarker = new google.maps.Marker(markerOption);

        var circleOption = {
            center: initialPosition,
            radius: 1,
            map: map,
            fillColor: "#0000ff",
            fillOpacity: 0.1,
            strokeColor: "#ff0000",
            strokeOpacity: 0.1
        };
        mapCircle = new google.maps.Circle(circleOption);
    }
    function receiveMessage(event) {
        var jsonObj = JSON.parse(event.data);
        if (jsonObj.type === "init") {
            config = jsonObj;
            init();
        } else if (jsonObj.type === "position") {
            onPosition(jsonObj);
        } else if (jsonObj.type === "positionlist") {
            loadPositionList(jsonObj.list);
        } else {
            alert("Unknown message: " + event.data);
        }
    }
    
    var publicObj = {};
    var map;
    var mapMarker;
    var mapCircle;
    var prevPosition;
    var config;

    window.addEventListener('message', receiveMessage, false);

    return publicObj;
}();
