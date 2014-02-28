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
        var strTime = Hayate.StringUtil.formatTime(lapInfo.timestamp);
        $("#datetimeList").append($("<li/>")
            .append(strTime))
            .listview("refresh");

        var strLap = Hayate.StringUtil.formatElapsedTime(lapInfo.laptime);
        $("#laptimeList").append($("<li/>")
            .append(strLap))
            .listview("refresh");
    }
    function onNewLap(newLap) {
        if (Array.isArray(newLap)) {
            clear();
            newLap.forEach(addListviewItem);
        } else {
            addListviewItem(newLap);
        }
        
    }
    function clear() {
        $('#datetimeList').children().remove('li');
        $('#laptimeList').children().remove('li');
    }
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    publicObj.clear = function() {
        clear();
    };

    return publicObj;
}();