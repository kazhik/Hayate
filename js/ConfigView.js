"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.ConfigView = function() {
    function onClose() {
        var config = {
            "geolocation": {
                "min" : {
                    "accuracy": parseInt($("#select-minAccurary").val(), 10),
                    "altAccuracy": parseInt($("#select-minAltAccurary").val(), 10),
                    "timeInterval": parseInt($("#select-minTimeInterval").val(), 10),
                    "distanceInterval": parseInt($("#select-minDistanceInterval").val(), 10)
                },
                "autoLap": {
                    "on": ($("#flip-autolap").val() === "true"),
                    "distance": parseInt($("#input-autolap-distance").val(), 10)
                },
                "distanceUnit": $("#select-distance-unit").val()
            },
            "map": {
                "zoom": parseInt($("#select-zoom").val(), 10)
            },
            "debug": ($("#flip-debug").val() === true)
        };
        Hayate.Config.save(config);
    }
    function onOpen() {
        var config = Hayate.Config.get([]);
        $("#select-minAccurary").val(config["geolocation"]["min"]["accuracy"].toString());
        $("#select-minAltAccurary").val(config["geolocation"]["min"]["altAccuracy"].toString());
        $("#select-minTimeInterval").val(config["geolocation"]["min"]["timeInterval"].toString());
        $("#select-minDistanceInterval").val(config["geolocation"]["min"]["distanceInterval"].toString());
        $("#flip-autolap").val(config["geolocation"]["autoLap"]["on"].toString()).slider("refresh");
        $("#input-autolap-distance").val(config["geolocation"]["autoLap"]["distance"].toString());
        $("#select-distance-unit").val(config["geolocation"]["distanceUnit"].toString());

        $("#select-zoom").val(config["map"]["zoom"].toString());

        $("#flip-debug").val(config["debug"].toString()).slider("refresh");
    }
    var publicObj = {};
    
    publicObj.init = function() {
        $("#flip-autolap").slider();
        $("#flip-debug").slider();
        $("#open-settings").on("tap", onOpen);
        $("#close-settings").on("tap", onClose);
        
    };
    
    return publicObj;
}();
