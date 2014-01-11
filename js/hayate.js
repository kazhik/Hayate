"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.start = function() {
    function initUI() {
        
        // Panel
        $("#LeftPanel").panel();
        $("#panel-menu").listview().listview("refresh");
        
        Hayate.LogView.init();
        Hayate.StorageView.init();
        Hayate.ConfigView.init();
        Hayate.RecordsView.init();

        // Main Tabs
        Hayate.WatchView.init();
        Hayate.MapView.init();
        Hayate.LapsView.init();

        Hayate.Util.init();        
        
    }
    function startApp() {
        Hayate.Recorder.init();

        initUI();
        
        $("#message").text("Hayate started");
        
    }
    function onFail(e) {
        console.log(e);
    }
    function onLocalized() {
        Hayate.WatchView.localize();
    }
    
    function preventAppQuit() {
        if (window.navigator) {
            var ua = navigator.userAgent;
            if (ua.match(/Mobile/) !== null && ua.match(/Mobile; rv/) === null) {
                window.navigator.requestWakeLock("cpu");
            }
        }        
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
    
    preventAppQuit();

    // https://bugzilla.mozilla.org/show_bug.cgi?id=882592
    window.addEventListener("localized", onLocalized, false);
    
    var dbInfo = {
        name: "Hayate",
        version: 12,
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
        .then(Hayate.Config.load)
        .done(startApp)
        .fail(onFail);

    
};

$(document).on("pagecreate", "#Stopwatch", Hayate.start);

