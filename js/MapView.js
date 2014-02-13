"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.MapView = function() {

    function loadData(posArray) {
        var positionlist = {
            type: "positionlist",
            list: posArray
        }
        
        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(positionlist), '*');            
    }
    function onPosition(newPosition) {
        if (typeof newPosition === "undefined") {
            return;
        }
        if (Array.isArray(newPosition)) {
            loadData(newPosition);
            return;
        }
        if (typeof newPosition.coords === "undefined") {
            return;
        }
 
        var newCoords = newPosition.coords;

        if (typeof prevCoords !== "undefined" &&
            newCoords.latitude === prevCoords.latitude &&
            newCoords.longitude === prevCoords.longitude) {
            return;
        }
        console.log("new position: " + JSON.stringify(newPosition));
        newPosition.type = "position";

        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(newPosition), '*');

        prevCoords = newCoords;
    }
    function stop() {
        Hayate.Recorder.removeListener(onPosition);
        
    }
    function init() {
        function onPageShow(e, data) {
            $('#map-iframe').height(Hayate.ViewUtil.getContentHeight());

            var mapIframe = document.getElementById("map-iframe");
                
            var msg = {};
            msg.type = "view";
            mapIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        
        }
        function onLoadMap() {
            var mapIframe = document.getElementById("map-iframe");
            config.type = "init";
            console.log("MapView onLoadMap: " + mapIframe.src);
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
        
        Hayate.Recorder.addPositionListener(onPosition);

        $("#map-iframe").attr("src", config["url"]);
        
        $("#Map").on("pageshow", onPageShow);
        $("#map-iframe").on("load", onLoadMap);
        
    }
    
    var publicObj = {};
    var recorder;
    var prevCoords;
    var config;
    
    publicObj.init = function() {
        init();
    };
    publicObj.stop = function() {
        stop();
    };

    
    return publicObj;
}();
