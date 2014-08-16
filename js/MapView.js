"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.MapView = (function() {

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
        newPosition.type = "position";

        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(newPosition), '*');

        prevCoords = newCoords;
    }
    function stop() {
        Hayate.Recorder.removeListener(onPosition);
        
    }
    function clear() {
        var msg = {};
        msg.type = "clear";
        mapIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        
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
            var mapConfig = $.extend(true, {}, config);

            mapConfig.type = "init";
            console.log("Sending init message to: " + mapIframe.src);
            mapIframe.contentWindow.postMessage(JSON.stringify(mapConfig), '*');
            
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

        $("#map-iframe").attr("src", config["url"][config["type"]]);
        
        $("#Map").on("pageshow", onPageShow);
        $("#map-iframe").on("load", onLoadMap);
        
    }
    
    var recorder;
    var prevCoords;
    var config;
    
    return {
        init: init,
        stop: stop,
        clear: clear
    };
}());
