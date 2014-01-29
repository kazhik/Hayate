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
        newPosition.type = "position";

        var mapIframe = document.getElementById("map-iframe");
        mapIframe.contentWindow.postMessage(JSON.stringify(newPosition), '*');

        prevCoords = newCoords;
    }
    function stop() {
        Hayate.Recorder.removeListener(onPosition);
        
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
//            config = Hayate.Config.get(["map"]);
            console.log("MapView onPageShow: " + getRealContentHeight());
            $('#map-iframe').height(getRealContentHeight());

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
