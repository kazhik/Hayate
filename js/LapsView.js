"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LapsView = function() {

    function init() {
        $("#datetimeList").listview().listview("refresh");
        $("#laptimeList").listview().listview("refresh");
        
        Hayate.Recorder.addLapListener(onNewLap);

        $("#Laps").on("pageshow", onPageShow);
    }
    function onPageShow() {
        $('#datetimeList').height(Hayate.ViewUtil.getContentHeight());
        $('#laptimeList').height(Hayate.ViewUtil.getContentHeight());
    }

    function addListviewItem(lapInfo) {
        var strTime = Hayate.ViewUtil.formatTime(lapInfo.timestamp);
        $("#datetimeList").append($("<li/>")
            .append(strTime))
            .listview("refresh");

        var strLap = Hayate.ViewUtil.formatElapsedTime(lapInfo.laptime);
        $("#laptimeList").append($("<li/>")
            .append(strLap))
            .listview("refresh");
    }
    function onNewLap(newLap) {
        if (Array.isArray(newLap)) {
            $('#datetimeList').children().remove('li');
            $('#laptimeList').children().remove('li');
            for (var i = 0; i < newLap.length; i++) {
                addListviewItem(newLap[i]);
            }
        } else {
            addListviewItem(newLap);
        }
        
    }    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };

    return publicObj;
}();