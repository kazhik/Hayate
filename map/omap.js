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
        
        function makeLatLngArray(position) {
            return [position.coords.latitude, position.coords.longitude];
        }
        var latLngArray = positionList.map(makeLatLngArray);
        bounds = L.latLngBounds(latLngArray);

        if (map !== null) {
            map.remove();
        }
        var mapOption = {
            latLng: latLngArray[0],
            zoom: config["zoom"]
        };
        createMap(mapOption);
        
        drawRoute(latLngArray);

    }
    function changeView(option) {
        if (bounds !== null) {
            map.fitBounds(bounds);
        }
    }
    function clear() {
        if (!polyline) {
            return;
        }
        polyline.setLatLngs([]);
    }
    function onPosition(position) {
        var currentCoords = position.coords;
        if (typeof currentCoords === "undefined") {
            alert("Invalid position data: " + JSON.stringify(position));
            return;
        }
        
        var newPosition = [currentCoords.latitude, currentCoords.longitude];
        if (map === null) {
            var mapOption = {
                latLng: newPosition,
                zoom: config["zoom"]
            };
            createMap(mapOption);
            var markerOption = {
                latLng: newPosition,
                radius: currentCoords.accuracy
            };
            createMarker(markerOption);
        } else if (newPosition[0] !== prevPosition[0] || newPosition[1] !== prevPosition[1]) {
            map.setView(newPosition);
            mapMarker.setLatLng(newPosition);
            mapCircle.setLatLng(newPosition);
            mapCircle.setRadius(currentCoords.accuracy);
            
            if (position.started) {
                drawNewRoute(newPosition);
            }
        }
        
        prevPosition = newPosition;
    }
    function drawRoute(latLngArray) {
        polyline = L.polyline(latLngArray, {weight: 3}).addTo(map);        
    }
    function drawNewRoute(newPosition) {
        var newPathCoords = [
            prevPosition,
            newPosition
        ];

        drawRoute(newPathCoords);
    }
    
    function createMap(option) {
        map = L.map("map-canvas").setView(option.latLng, option.zoom);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
    function createMarker(option) {
        mapMarker = L.marker(option.latLng).addTo(map);
        var circleOption = {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        };
        mapCircle = L.circle(option.latLng, option.radius, circleOption)
            .addTo(map);        
    }
    
    function init() {
        if (typeof prevPosition !== "undefined") {
            return;
        }
    
        if (typeof config === "undefined") {
            return;
        }
        
        if (typeof L === "undefined") {
            alert("init error: L undefined");
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
    var polyline = null;
    var prevPosition;
    var bounds = null;
    var config;
    window.addEventListener("message", receiveMessage, false);

    return {};
}());
