"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.start = function() {
    function initLog() {
        var consolelog = console.log;
        console.log = function (message) {
            var log = {
                timestamp: Date.now(),
                message: message,
            };
            Hayate.Database.add("ConsoleLog", log);
            
            $("#logList").prepend("<li>")
                .append(message)
                .listview("refresh");
            
            $("#message").text(message);
            consolelog.apply(console, arguments);
        };
        
    }
    function onOpenRecords() {
        console.log("onOpenRecords");
    }
    function onCloseSettings() {
        var config = {
            "geolocation": {
                "min" : {
                    "accuracy": $("#select-minAccurary").val(),
                    "altAccuracy": $("#select-minAltAccurary").val(),
                    "timeInterval": $("#select-minTimeInterval").val(),
                    "distanceInterval": $("#select-minDistanceInterval").val()
                },
                "autoLap": {
                    "on": $("#flip-autolap").val(),
                    "distance": $("#input-autolap-distance").val()
                },
                "distanceUnit": $("#select-distance-unit").val()
            },
            "map": {
                "zoom": $("#select-zoom").val()
            },
            "debug": $("#flip-debug").val()
        };
        Hayate.Config.save(config);
    }
    function startApp() {
        function onLocalized() {
            Hayate.WatchView.start();
            Hayate.MapView.start();
        }
        if (Hayate.Config.get(["debug"]) === true) {
            initLog();
        }
        
        Hayate.Recorder.init("GeoLocation");

        $("#logList").listview().listview("refresh");
        
        $( "body>[data-role='panel']" ).panel();
        $( "body>[data-role='panel'] ul" ).listview();
        
        $("#message").text("Hayate started");

        window.addEventListener('localized', onLocalized, false);

        $("#close-settings").click(onCloseSettings);
        $("#open-records").click(onOpenRecords);
    }
    function onFail(e) {
        console.log(e);
    }
    
    if (typeof Hayate.Config === "undefined") {
        console.log("Hayate.Config undefined");
        return;
    }
    if (typeof Hayate.Database === "undefined") {
        console.log("Hayate.Database undefined");
        return;
    }
    if (typeof Hayate.Recorder === "undefined") {
        console.log("Hayate.Recorder undefined");
        return;
    }
    if (typeof Hayate.WatchView === "undefined") {
        console.log("Hayate.WatchView undefined");
        return;
    }
    if (typeof Hayate.MapView === "undefined") {
        console.log("Hayate.MapView undefined");
        return;
    }
    
    var dbInfo = {
        name: "Hayate",
        version: 10,
        objStore: [
            {
                name: "Config",
                keyPath: "appname",
                indexes: []
            },
            {
                name: "ConsoleLog",
                indexes: ["timestamp"]
            },
            {
                name: "GeoLocation",
                indexes: ["StartTime"]
            }
        ]
    };
    var lock = window.navigator.requestWakeLock('screen');
    
    Hayate.Database.open(dbInfo)
        .then(Hayate.Config.load)
        .done(startApp)
        .fail(onFail);
    
};

$(document).on("pageinit", Hayate.start);

