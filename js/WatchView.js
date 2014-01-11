"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.WatchView = function() {

    function loadData(recArray) {
        record.init();
        for (var i = 0; i < recArray.length; i++) {
            record.onNewRecord(recArray[i]);
        }
        updateLapAndSplit(recArray[recArray.length - 1].timestamp);
        updateDistance();
        
    }
    function updateLapAndSplit(timestamp) {
        var splitTime = record.getSplitTime(timestamp);
        $("#txtSplitTime").text(Hayate.Util.formatTime(splitTime));

        var lapTime = record.getLapTime(timestamp);
        $("#txtLapTime").text(Hayate.Util.formatTime(lapTime));
    }
    function updateDistance() {
        // TODO: convert distance unit
        var distance = record.getDistance();
        $("#txtDistance").text(Math.ceil(distance));
    }
    function onNewRecord(newRec) {
        if (Array.isArray(newRec)) {
            loadData(newRec);
            return;
        }
        record.onNewRecord(newRec);
        
        updateLapAndSplit(newRec.timestamp);
        updateDistance();
        // TODO: Pace
    }
    function onClickStart() {
        record.init();
        recorder.start();
        $("#btnStart").text(document.webL10n.get("stop"));
        status.Start = "started";
        
        if (config["autoLap"]["on"] === false) {
            $("#btnLap").text(document.webL10n.get("lap"));
            $("#btnLap").button("enable");
            status.Lap = "lap";
        } else {
            $("#btnLap").button("disable");
            status.Lap = "disabled";
        }
    }
    function onClickStop() {
        recorder.stop();
        $("#btnStart").text(document.webL10n.get("start"));
        status.Start = "stopped";

        $("#btnLap").text(document.webL10n.get("reset"));
        $("#btnLap").button("enable");
        status.Lap = "reset";
        
        onClickLap();
    }

    function onClickStartStop() {
        // stopped -> started
        if (status.Start === "stopped") {
            onClickStart();
        // started -> stopped
        } else {
            onClickStop();
        }
    }
    function addLaptime(latestTime) {
        var laptime = record.getLapTime(latestTime);
        
        $("#txtLapTime").text(Hayate.Util.formatTime(laptime));

        Hayate.LapsView.addLaptime(latestTime, laptime);
        
    }
    function onClickReset() {
        $("#btnLap").button("disable");
        status.Lap = "disabled";
        
        record.init();
        $("#txtSplitTime").text("00:00:00");
        $("#txtLapTime").text("00:00:00");
        $("#txtDistance").text("0");

        $('#datetimeList').children().remove('li');
        $('#laptimeList').children().remove('li');
        
    }
    function onClickLap() {
        var now = Date.now();
        addLaptime(now);

        record.addLap(now);
    }
    function onClickLapReset() {
        // lap -> lap
        if (status.Lap === "lap") {
            onClickLap();
        // reset -> disabled
        } else {
            onClickReset();
        }
    }
    function localize() {
        $("#btnStart").html(document.webL10n.get("start"));
        $("#btnLap").html(document.webL10n.get("reset"));
        $("#lblDistanceUnit").html(document.webL10n.get("distance-unit-metre"));
        
    }
    
    function initUI() {
        
        $("#btnLap").button().button("disable");
        
        $("#btnStart").on("click", onClickStartStop);
        $("#btnLap").on("click", onClickLapReset);
        
    }
    function onPageShow() {
        console.log("WatchView onPageShow");
        config = Hayate.Config.get(["geolocation"]);
        
    }
    
    function init() {
        if (typeof Hayate.Config === "undefined") {
            console.log("Config undefined");
            return;
        }
        if (typeof Hayate.Recorder === "undefined") {
            console.log("Recorder undefined");
            return;
        }
        if (typeof Hayate.RunRecord === "undefined") {
            console.log("RunRecord undefined");
            return;
        }        
        
        recorder = Hayate.Recorder;
        recorder.addListener(onNewRecord);
        
        record = Hayate.RunRecord;
        record.init();
        
        initUI();
        
        $("#Stopwatch").on("pageshow", onPageShow);
        
    }
    var record;
    var recorder;

    var status = {
        Start: "stopped",
        Lap: "disabled"
    };
    var config = null;
    
    var publicObj = {};
    publicObj.init = function() {
        init();
    };
    publicObj.localize = function() {
        localize();
    }
    
    return publicObj;
}();
