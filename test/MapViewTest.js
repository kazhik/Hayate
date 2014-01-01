"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.MapViewTest = function() {

    if (typeof Hayate.Config === "undefined") {
        console.log("Hayate.Config undefined");
        return;
    }
    if (typeof Hayate.MapView === "undefined") {
        console.log("Hayate.MapView undefined");
        return;
    }

    Hayate.MapView.start();
    Hayate.Recorder.init();
    
};

$(document).on("pageinit", Hayate.MapViewTest);

