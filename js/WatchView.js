"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.WatchView = function() {

    function updatePace(speed) {
        if (speed === 0) {
            return;
        }
        
        var ms; // milliseconds per km/mi
        if (config["distanceUnit"] === "metre") {
            // 5 metre / sec
            ms = (1 / speed) * 1000 * 1000;
        } else {
            ms = (1 / speed) * 1609.344 * 1000;
        }
        $("#txtPace").text(Hayate.ViewUtil.formatElapsedTime(ms));
    }
    
    function updateDistance(distance) {
        var distanceStr = convertDistance(distance);
        $("#txtDistance").text(distanceStr);
    }
    // convert metre to kilometre or mile
    function convertDistance(distance) {
        if (config["distanceUnit"] === "metre") {
            return (distance / 1000).toFixed(2);
        } else {
            return (distance / 1609.344).toFixed(2);
        }
    }
    function updateDistanceUnit() {
        var distanceUnitStr;
        if (config["distanceUnit"] === "metre") {
            distanceUnitStr = document.webL10n.get("distance-unit-kilometre");
        } else {
            distanceUnitStr = document.webL10n.get("distance-unit-mile");
        }
        if (distanceUnitStr !== $("#lblDistanceUnit").text()) {
            updateDistance(distance);
            $("#txtPace").text("00:00");
        }
        $("#lblDistanceUnit").text(distanceUnitStr);
        $("#lblPaceUnit").text(distanceUnitStr);
        
    }
    function updateSplitTime(splitTime) {
        $("#txtSplitTime").text(Hayate.ViewUtil.formatElapsedTime(splitTime));
    }
    function updateLapTime(lapTime) {
        $("#txtLapTime").text(Hayate.ViewUtil.formatElapsedTime(lapTime));
    }

    function onNewRecord(newRec) {
        updateSplitTime(newRec.splitTime);
        updateLapTime(newRec.lapTime);
        updateDistance(newRec.distance);
        updatePace(newRec.speed);
        
        distance = newRec.distance;
    }
    function onTapStart() {
        obtainCpuLock();
        recorder.start();
        $("#btnStart").text(document.webL10n.get("stop"));
        status.Start = "started";
        
        if (config["autoLap"]["on"] === "off") {
            $("#btnLap").text(document.webL10n.get("lap"));
            $("#btnLap").button("enable");
            status.Lap = "lap";
        } else {
            $("#btnLap").button("disable");
            status.Lap = "disabled";
        }
    }
    function onTapStop() {
        releaseCpuLock();
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
    function onTapReset() {
        $("#btnLap").button("disable");
        status.Lap = "disabled";
        
        $("#txtSplitTime").text("00:00:00");
        $("#txtLapTime").text("00:00:00");
        $("#txtDistance").text("0");
        $("#txtPace").text("00:00");

        $('#datetimeList').children().remove('li');
        $('#laptimeList').children().remove('li');
        
    }

    function onTapLap() {
        recorder.lap();
//        $("#txtLapTime").text(Hayate.ViewUtil.formatElapsedTime(laptime));
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
    
    // Prevents the system to quit this app
    function obtainCpuLock() {
        if (!window.navigator) {
            return;
        }
        var ua = navigator.userAgent;
        if (ua.match(/Mobile/) === null) {
            return;
        }
        
        // TODO: This API consumes CPU too much
        // should be replaced with other way
        lock = window.navigator.requestWakeLock("cpu");
        
    }
    function releaseCpuLock() {
        lock.unlock();
    }
    
    function localize() {
        $("#btnStart").text(document.webL10n.get("start"));
        $("#btnLap").text(document.webL10n.get("reset"));
        
        updateDistanceUnit();
    }
    
    function initUI() {
        
        $("#btnLap").button().button("disable");
        
        $("#btnStart").on("tap", onTapStartStop);
        $("#btnLap").on("tap", onTapLapReset);
        
    }
    function onPageShow() {
        console.log("WatchView onPageShow");
        config = Hayate.Config.get(["geolocation"]);
        
        updateDistanceUnit();
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
        recorder.addTimeListener(onNewRecord);
        
        initUI();
        localize();
        
        $("#Stopwatch").on("pageshow", onPageShow);
        
    }
    var lock;
    var distance = 0;
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

    
    return publicObj;
}();
