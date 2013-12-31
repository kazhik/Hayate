"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.maptest = function() {
    function initUI() {
        $(".lblStopwatch").i18n();
        $(".lblMap").i18n();
        $(".lblLog").i18n();
    }
    
    function sendPosition() {
        
    }
    
    function onLoad() {
        initUI();
        Hayate.MapView.start();
        Hayate.Recorder.init();

//        var link = $("#Map");
//        link.click();
//        window.location.href = link.attr("href");
    }
    
    if (typeof Hayate.Config === "undefined") {
        console.log("Hayate.Config undefined");
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

    var i18nOption = {
        lng: Hayate.Config.get(["i18n", "locale"]),
        debug: Hayate.Config.get(["i18n","debug"])
    };
    $.i18n.init(i18nOption)
        .done(onLoad);
    

    
};

$(document).ready(Hayate.maptest);

