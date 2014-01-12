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
        $("#txtSplitTime").text(Hayate.Util.formatElapsedTime(splitTime));

        var lapTime = record.getLapTime(timestamp);
        $("#txtLapTime").text(Hayate.Util.formatElapsedTime(lapTime));
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
    function onTapStart() {
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
    function onTapStop() {
        recorder.stop();
        $("#btnStart").text(document.webL10n.get("start"));
        status.Start = "stopped";

        $("#btnLap").text(document.webL10n.get("reset"));
        $("#btnLap").button("enable");
        status.Lap = "reset";
        
        onTapLap();
    }

    function onTapStartStop() {
        // stopped -> started
        if (status.Start === "stopped") {
            onTapStart();
        // started -> stopped
        } else {
            onTapStop();
        }
    }
    function addLaptime(latestTime) {
        var laptime = record.getLapTime(latestTime);
        
        $("#txtLapTime").text(Hayate.Util.formatElapsedTime(laptime));

        Hayate.LapsView.addLaptime(latestTime, laptime);
        
    }
    function onTapReset() {
        $("#btnLap").button("disable");
        status.Lap = "disabled";
        
        record.init();
        $("#txtSplitTime").text("00:00:00");
        $("#txtLapTime").text("00:00:00");
        $("#txtDistance").text("0");

        $('#datetimeList').children().remove('li');
        $('#laptimeList').children().remove('li');
        
    }
    function onTapLap() {
        var now = Date.now();
        addLaptime(now);

        record.addLap(now);
    }
    function onTapLapReset() {
        // lap -> lap
        if (status.Lap === "lap") {
            onTapLap();
        // reset -> disabled
        } else {
            onTapReset();
        }
    }
    function localize() {
        $("#btnStart").html(document.webL10n.get("start"));
        $("#btnLap").html(document.webL10n.get("reset"));
        $("#lblDistanceUnit").html(document.webL10n.get("distance-unit-metre"));
        
    }
    
    function initUI() {
        
        $("#btnLap").button().button("disable");
        
        $("#btnStart").on("tap", onTapStartStop);
        $("#btnLap").on("tap", onTapLapReset);
        
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
        config = Hayate.Config.get(["geolocation"]);
        
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
