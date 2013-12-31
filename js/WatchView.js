"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.WatchView = function() {

    function formatTime(msec) {
        var hour = ("0" + Math.floor(msec / (1000 * 60 * 60))).slice(-2);
        var min = ("0" + (Math.floor(msec / (1000 * 60)) - (hour * 60))).slice(-2);
        var sec = ("0" + Math.floor((msec % (1000 * 60)) / 1000)).slice(-2);
        
        return hour + ":" + min + ":" + sec; 
    }
    function formatDateTime(msec) {
        var datetime = new Date(msec);
//        return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString(); 
        return datetime.toLocaleTimeString(); 
    }

    function onNewRecord(newRec) {
        $("#message").text("WatchView.onNewRecord: " + JSON.stringify(newRec));
        
        record.onNewRecord(newRec);

        var splitTime = record.getSplitTime(newRec.timestamp);
        $("#txtSplitTime").text(formatTime(splitTime));
        var lapTime = record.getLapTime(newRec.timestamp);
        $("#txtLapTime").text(formatTime(lapTime));
        
        // TODO: convert distance unit
        var distance = record.getDistance();
        $("#txtDistance").text(Math.ceil(distance));

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
    function addLaptimeToList(latestTime) {
        var strTime = formatDateTime(latestTime);
        $("#datetimeList").append("<li>")
            .append(strTime)
            .listview("refresh");

        var lastLaptime = record.getLastLaptime();
        var strLap = formatTime(latestTime - lastLaptime);
        $("#laptimeList").append("<li>")
            .append(strLap)
            .listview("refresh");
        
        $("#txtLapTime").text(strLap);
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
        addLaptimeToList(now);

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

    
    function initUI() {
        
        $("#btnStart").html(document.webL10n.get("start"));
        $("#btnLap").html(document.webL10n.get("reset"));

        $("#btnLap").button().button("disable");

        $("#lblDistanceUnit").html(document.webL10n.get("distance-unit-metre"));
        
        $("#btnStart").on("click", onClickStartStop);
        $("#btnLap").on("click", onClickLapReset);
        
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
        
        initUI();
        
    }
    var record;
    var recorder;

    var status = {
        Start: "stopped",
        Lap: "disabled"
    };
    var config = null;
    
    var publicObj = {};
    publicObj.start = function() {
        init();
    };
    
    return publicObj;
}();
