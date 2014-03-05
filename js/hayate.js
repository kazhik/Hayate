"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.start = function() {
    function initUI() {
        
        Hayate.PopupView.init();        
        
        // Panel
        Hayate.StorageView.init();
        Hayate.ConfigView.init();
        Hayate.RecordsView.init();
        Hayate.PanelView.init();

        // Main Tabs
        Hayate.WatchView.init();
        Hayate.MapView.init();
        Hayate.LapsView.init();

    }
   function startApp() {
        $.event.special.tap.emitTapOnTaphold = false;
        
        // initialize console.log first
        if (Hayate.Config.get(["debug", "log"]) === "on") {
            Hayate.LogView.init();
        }
        
        Hayate.Recorder.init();
        Hayate.Storage.init();

        initUI();
        
        console.log("Hayate started");
    
    }
    function onFail(e) {
        console.log(e);
    }

    function localize() {
        function onLocalized() {
            dfd.resolve();    
            
        }
        var dfd = new $.Deferred();
    
        navigator.mozL10n.ready(onLocalized);
            
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

