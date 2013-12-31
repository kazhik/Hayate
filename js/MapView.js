"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.MapView = function() {

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
    function onPosition(newPosition) {
        if (typeof newPosition === "undefined") {
            return;
        }
        if (typeof newPosition.coords === "undefined") {
            return;
        }
        var newCoords = newPosition.coords;

        if (prevCoords !== null &&
            newCoords.latitude === prevCoords.latitude &&
            newCoords.longitude === prevCoords.longitude) {
            return;
        }
        newPosition.type = "position";

        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(newPosition), '*');

        prevPosition = newPosition;
    }
    function drawRoute(latLngArray) {
        console.log("drawRoute");
        
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
        function getRealContentHeight() {
            var header = $.mobile.activePage.find("div[data-role='header']:visible");
            var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
            var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
            var viewport_height = $(window).height();
        
            var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
            if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
                content_height -= (content.outerHeight() - content.height());
            } 
            return content_height;
        }
        function onPageShow(e, data) {
            if (prevCoords !== null) {
                return;
            }
            $('#map-iframe').height(getRealContentHeight());
        
            var mapIframe = document.getElementById("map-iframe");
            config.type = "init";
            mapIframe.contentWindow.postMessage(JSON.stringify(config), '*');
        
        }
        
        if (typeof Hayate.Config === "undefined") {
            console.log("Config undefined");
            return;
        }
        if (typeof Hayate.Recorder === "undefined") {
            console.log("Recorder undefined");
            return;
        }
        
        config = Hayate.Config.get(["map"]);
        Hayate.Recorder.addListener(onPosition);
        
        $("#Map").on("pageshow", onPageShow);
        
        
    }
    
    var publicObj = {};
    var recorder;
    var prevCoords = null;
    var config = null;
    
    publicObj.start = function() {
        init();
    };
    publicObj.loadPositionList = function(positionList) {
        loadPositionList(positionList);
    }
    
    return publicObj;
}();
