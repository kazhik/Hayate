"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LapsView = function() {

    function init() {
        $("#datetimeList").listview().listview("refresh");
        $("#laptimeList").listview().listview("refresh");
        
        Hayate.Recorder.addLapListener(onNewLap);
    }
    function onNewLap(newLap) {
        var strTime = Hayate.ViewUtil.formatTime(newLap.timestamp);
        $("#datetimeList").append($("<li/>")
            .append(strTime))
            .listview("refresh");

        var strLap = Hayate.ViewUtil.formatElapsedTime(newLap.laptime);
        $("#laptimeList").append($("<li/>")
            .append(strLap))
            .listview("refresh");
        
    }    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };

    return publicObj;
}();