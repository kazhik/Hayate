"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LapsView = (function() {

    function init() {
        $("#laptimeList").listview().listview("refresh");
        
        Hayate.Recorder.addLapListener(onNewLap);

        $("#Laps").on("pageshow", onPageShow);
    }
    function onPageShow() {
        $('#laptimeList').height(Hayate.ViewUtil.getContentHeight());
    }

    function addListviewItem(lapInfo) {
        var strTime = Hayate.StringUtil.formatTime(lapInfo.timestamp);
        var strLap = Hayate.StringUtil.formatElapsedTime(lapInfo.laptime);
        $("#laptimeList")
            .append($("<li/>")
                .append($("<div/>", {
                                        "class": "ui-grid-a"
                                    })
                    .append($("<div/>", {
                                        "class": "ui-block-a"
                                        })
                        .append(strTime))
                    .append($("<div/>", {
                                        "class": "ui-block-b"
                                        })
                        .append(strLap))
                )
            )        
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
        $('#laptimeList').children().remove('li');
    }
    
    return {
        init: init,
        clear: clear
    };
}());