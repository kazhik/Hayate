"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.MapView = (function() {

    function loadData(posArray) {
        status = "fixed";
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

        if (typeof prevCoords === "undefined") {
        } else if (newCoords.latitude === prevCoords.latitude &&
            newCoords.longitude === prevCoords.longitude) {
            return;
        }
        
        if (status === "fixed") {
            return;
        }
        newPosition.type = "position";

        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(newPosition), '*');

        prevCoords = newCoords;
    }
    function stop() {
        status = "fixed";
    }
    function clear() {
        var msg = {};
        msg.type = "clear";
        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        
        status = "free";
    }
    function init() {
        function showMap() {
            if (typeof prevCoords === "undefined") {
                Hayate.Recorder.getCurrentPosition();
            }
            $('#map-iframe').height(Hayate.ViewUtil.getContentHeight());

            var msg = {};
            msg.type = "view";
            var mapIframe = document.getElementById("map-iframe");
            mapIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
            
        }
        function onPageShow(e, data) {
            var currentMapType = config["type"];
            config = Hayate.Config.get(["map"]);
            if (config["type"] !== currentMapType) {
                if (navigator.onLine) {
                    loadMap();
                } else {
                    $(window).on("online", loadMap);
                }
                reload = true;
            } else {
                reload = false;
                showMap();
            }
        
        }
        function loadMap() {
            $("#map-iframe").attr("src", config["url"][config["type"]]);
        }
        function onLoadMap() {
            var mapIframe = document.getElementById("map-iframe");
            var mapConfig = $.extend(true, {}, config);

            mapConfig.type = "init";
            console.log("Sending init message to: " + mapIframe.src);
            mapIframe.contentWindow.postMessage(JSON.stringify(mapConfig), '*');
            
            if (reload) {
                showMap();
            }
        }
        
        config = Hayate.Config.get(["map"]);
        
        Hayate.Recorder.addPositionListener(onPosition);
        
        if (navigator.onLine) {
            loadMap();
        } else {
            $(window).on("online", loadMap);
        }
        $("#Map").on("pageshow", onPageShow);
        $("#map-iframe").on("load", onLoadMap);
        
        status = "free";
    }
    var reload = false;
    var recorder;
    var prevCoords;
    var config;
    var status = "";
    
    return {
        init: init,
        stop: stop,
        clear: clear
    };
}());
