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
        console.log("send positionlist");
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
            console.log("onPageShow: " + getRealContentHeight());
            config = Hayate.Config.get(["map"]);
            $('#map-iframe').height(getRealContentHeight());
        
        }
        function onLoadMap() {
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
