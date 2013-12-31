"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Map = function() {

    function loadPositionList(positionList) {
        if (!Array.isArray(positionList)) {
            return;
        }
        var latLngArray = [];
        for (var i = 0; i < positionList.length; i++) {
            var latLng = new google.maps.LatLng(
                positionList[i].latitude,
                positionList[i].longitude);
            latLngArray.push(latLng);
        }
        drawRoute(latLngArray);
    }
    function onPosition(position) {
        var currentCoords = position.coords;
        if (typeof currentCoords === "undefined") {
            return;
        }
        if (typeof mapMarker === "undefined") {
            return;
        }
        var newPosition = new google.maps.LatLng(
            currentCoords.latitude,
            currentCoords.longitude);        

        if (prevPosition !== null && newPosition.equals(prevPosition)) {
            return;
        }
            
        map.setCenter(newPosition);

        mapMarker.setPosition(newPosition);
        
        mapCircle.setCenter(newPosition);
        mapCircle.setRadius(currentCoords.accuracy);
        
        if (prevPosition !== null) {
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
      
        newPath.setMap(mapMarker.getMap());        
    }
    function drawNewRoute(newPosition) {
        var newPathCoords = [
            prevPosition,
            newPosition
        ];

        drawRoute(newPathCoords);
    }
    
    function init() {

        if (prevPosition !== null) {
            return;
        }
    
        if (config === null) {
            return;
        }
        
        if (typeof google === "undefined") {
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
        }
    }
    
    var publicObj = {};
    var map;
    var mapMarker;
    var mapCircle;
    var prevPosition = null;
    var config = null;

    window.addEventListener('message', receiveMessage, false);

    return publicObj;
}();
