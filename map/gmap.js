"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Map = (function() {

    function loadPositionList(positionList) {
        if (!Array.isArray(positionList)) {
            alert("Invalid positionList data: " + JSON.stringify(positionList));
            return;
        }
        if (positionList.length === 0) {
            alert("No positionList data: " + positionList.length);
            return;
        }
        
        bounds = new google.maps.LatLngBounds();        
        
        var latLngArray = [];
        var latLng;
        var i;
        for (i = 0; i < positionList.length; i++) {
            latLng = new google.maps.LatLng(
                positionList[i].coords.latitude,
                positionList[i].coords.longitude);
            latLngArray.push(latLng);
            
            bounds.extend(latLng);
        }

        if (map === null) {
            var option = {
                latlng: latLngArray[0],
                zoom: config["zoom"]
            };
            createMap(option);
        } else {
            clear();
        }
        
        drawRoute(latLngArray);

    }
    function clear() {
        var newPath = new google.maps.Polyline({
          map: map
        });
        newPath.setMap(null);
        
        if (mapMarker !== null) {
            mapMarker.setMap(null);
            mapCircle.setMap(null);
        }
        
    }
    function changeView(option) {
        function onIdle() {
            map.setZoom(map.getZoom() + 1);
            
        }
        if (bounds !== null) {
            map.fitBounds(bounds);
            google.maps.event.addListenerOnce(map, "idle", onIdle);
        }

    }

    function onPosition(position) {
        var currentCoords = position.coords;
        if (typeof currentCoords === "undefined") {
            alert("Invalid position data: " + JSON.stringify(position));
            return;
        }
        var newPosition = new google.maps.LatLng(
            currentCoords.latitude,
            currentCoords.longitude);
        
        if (map === null) {
            var mapOption = {
                latlng: newPosition,
                zoom: config["zoom"]
            };
            createMap(mapOption);
            var markerOption = {
                latlng: newPosition,
                radius: currentCoords.accuracy,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "yellow",
                    scale: 2
                },
            };
            createMarker(markerOption);
        } else if (!newPosition.equals(prevPosition)) {
            map.setCenter(newPosition);
            mapMarker.setPosition(newPosition);
            mapCircle.setCenter(newPosition);
            mapCircle.setRadius(currentCoords.accuracy);
            
            if (position.started) {
                drawNewRoute(newPosition);
            }
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
    
    function createMap(option) {
        var mapOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: option.latlng,
            zoom: option.zoom
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    }
    function createMarker(option) {
        
        var markerOption = {
            map: map,
            position: option.latlng
        };
        mapMarker = new google.maps.Marker(markerOption);

        var circleOption = {
            center: option.latlng,
            radius: option.radius,
            map: map,
            fillColor: "#0000ff",
            fillOpacity: 0.1,
            strokeColor: "#ff0000",
            strokeOpacity: 0.1
        };
        mapCircle = new google.maps.Circle(circleOption);
        
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
    }
    function receiveMessage(event) {
        var jsonObj = JSON.parse(event.data);
        if (jsonObj.type === "init") {
            config = jsonObj;
            init();
        } else if (jsonObj.type === "clear") {
            clear();
        } else if (jsonObj.type === "position") {
            onPosition(jsonObj);
        } else if (jsonObj.type === "view") {
            changeView(jsonObj);
        } else if (jsonObj.type === "positionlist") {
            loadPositionList(jsonObj.list);
        } else {
            alert("Unknown message: " + event.data);
        }
    }
    
    var map = null;
    var mapMarker = null;
    var mapCircle = null;
    var prevPosition;
    var bounds = null;
    var config;
    window.addEventListener("message", receiveMessage, false);

    return {};
}());
