"use strict";

if (typeof Hayate === "undefined") {
    var Hayate = {};
}

Hayate.MapViewTest = function() {
    function onFileSelected() {
        var f = this.files[0];
        Hayate.Recorder.importGpxFile(f);
    }

    if (typeof Hayate.Config === "undefined") {
        console.log("Hayate.Config undefined");
        return;
    }
    if (typeof Hayate.MapView === "undefined") {
        console.log("Hayate.MapView undefined");
        return;
    }
    
    Hayate.Recorder.init();
    Hayate.MapView.init();
    $("#select-file").on("change", onFileSelected);
    
};

$(document).on("pageinit", Hayate.MapViewTest);

