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

