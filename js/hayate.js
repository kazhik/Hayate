"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.start = function() {
    function initUI() {
        Hayate.ViewUtil.init();        
        
        // Panel
        Hayate.StorageView.init();
        Hayate.ConfigView.init();
        Hayate.RecordsView.init();
        Hayate.PanelView.init();

        // Main Tabs
        Hayate.WatchView.init();
        Hayate.MapView.init();
        Hayate.LapsView.init();

        if (Hayate.Config.get(["debug"]) === "on") {
            Hayate.LogView.init();
        }
        
    }
   function startApp() {
        $.event.special.tap.emitTapOnTaphold = false;
        
        Hayate.Recorder.init();
        Hayate.Storage.init();

        initUI();
        
        console.log("Hayate started");
    
    }
    function onFail(e) {
        console.log(e);
    }

    
    function preventAppQuit() {
        if (!window.navigator) {
            return;
        }
        var ua = navigator.userAgent;
        if (ua.match(/Mobile/) === null) {
            return;
        }
        
        // TODO: This API consumes CPU too much
        // should be replaced if background service API is implemented
        window.navigator.requestWakeLock("cpu");
    }
    function localize() {
        function onLocalized() {
            dfd.resolve();    
            
        }
        var dfd = new $.Deferred();
    
        // https://bugzilla.mozilla.org/show_bug.cgi?id=882592
        window.addEventListener("localized", onLocalized, false);
            
        return dfd.promise();
        
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
    if (typeof Hayate.StorageView === "undefined") {
        console.log("Hayate.StorageView undefined");
        return;
    }
    if (typeof Hayate.LogView === "undefined") {
        console.log("Hayate.LogView undefined");
        return;
    }    
    if (typeof Hayate.ConfigView === "undefined") {
        console.log("Hayate.ConfigView undefined");
        return;
    }
    if (typeof Hayate.RecordsView === "undefined") {
        console.log("Hayate.RecordsView undefined");
        return;
    }
    if (typeof Hayate.LapsView === "undefined") {
        console.log("Hayate.LapsView undefined");
        return;
    }
    if (typeof Hayate.PanelView === "undefined") {
        console.log("Hayate.PanelView undefined");
        return;
    }
    if (typeof Hayate.ViewUtil === "undefined") {
        console.log("Hayate.ViewUtil undefined");
        return;
    }
    
    preventAppQuit();
        
    var dbInfo = {
        name: "Hayate",
        version: 14,
        objStore: [
            {
                name: "Config",
                keyPath: "appname"
            },
            {
                name: "ConsoleLog",
                keyPath: null
            },
            {
                name: "GeoLocation",
                keyPath: "StartTime"
            }
        ]
    };
    
    Hayate.Database.open(dbInfo)
        .then(localize)
        .then(Hayate.Config.load)
        .done(startApp)
        .fail(onFail);

    
};
$(document).on("pagecreate", "#Stopwatch", Hayate.start);

