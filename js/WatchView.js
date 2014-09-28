"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.WatchView = (function() {

    function updatePace(speed) {
        var pace;
        if (config["pace"]["type"] === "current-pace") {
            pace = speed;
        } else {
            pace = Hayate.RunRecord.getAveragePace();
        }
        if (pace === 0) {
            return;
        }
        var ms; // milliseconds per km/mi
        if (config["distanceUnit"] === "metre") {
            // pace === metre / sec
            ms = (1 / pace) * 1000 * 1000;
        } else {
            ms = (1 / pace) * 1609.344 * 1000;
        }
        $("#txtPace").text(Hayate.StringUtil.formatElapsedTime(ms));
    }
    function updateElevationGain(gain) {
        if (gain === 0) {
            return;
        }
        
        $("#txtGain").text(convertDistance(gain));
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
            distanceUnitStr = navigator.mozL10n.get("distance-unit-kilometre");
        } else {
            distanceUnitStr = navigator.mozL10n.get("distance-unit-mile");
        }
        if (distanceUnitStr !== $("#lblDistanceUnit").text()) {
            updateDistance(distance);
            $("#txtPace").text("00:00");
        }
        $("#lblDistanceUnit").text(distanceUnitStr);
        $("#lblPaceUnit").text(distanceUnitStr);
        $("#lblGainUnit").text(distanceUnitStr);
        
    }
    function updateSplitTime(splitTime) {
        $("#txtSplitTime").text(Hayate.StringUtil.formatElapsedTime(splitTime));
    }
    function updateLapTime(lapTime) {
        $("#txtLapTime").text(Hayate.StringUtil.formatElapsedTime(lapTime));
    }

    function onNewRecord(newRec) {
        updateSplitTime(newRec.splitTime);
        updateLapTime(newRec.lapTime);
        updateDistance(newRec.distance);
        updatePace(newRec.speed);
        updateElevationGain(newRec.elevationGain);
        
        distance = newRec.distance;
    }
    function onTapStart() {
        obtainCpuLock();
        Hayate.MapView.clear();
        Hayate.LapsView.clear();
        clearView();

        recorder.start();
        Hayate.Alarm.start();
        $("#btnStart").text(navigator.mozL10n.get("stop"));
        status.Start = "started";
        
        if (config["autoLap"]["on"] === "off") {
            $("#btnLap").text(navigator.mozL10n.get("lap"));
            $("#btnLap").button("enable");
            status.Lap = "lap";
        } else {
            $("#btnLap").button("disable");
            status.Lap = "disabled";
        }
    }
    function onTapStop() {
        releaseCpuLock();
        Hayate.MapView.stop();
        recorder.stop();
        Hayate.Alarm.stop();
        $("#btnStart").text(navigator.mozL10n.get("start"));
        status.Start = "stopped";

        $("#btnLap").text(navigator.mozL10n.get("reset"));
        $("#btnLap").button("enable");
        status.Lap = "reset";
        
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
    function clearView() {
        $("#txtSplitTime").text("00:00:00");
        $("#txtLapTime").text("00:00:00");
        $("#txtDistance").text("0");
        $("#txtPace").text("00:00");
        $("#txtGain").text("0");
    }
    function onTapReset() {
        $("#btnLap").button("disable");
        status.Lap = "disabled";
        
        clearView();
        
        Hayate.MapView.clear();
        Hayate.LapsView.clear();

    }

    function onTapLap() {
        recorder.lap();
//        $("#txtLapTime").text(Hayate.StringUtil.formatElapsedTime(laptime));
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
    function obtainCpuLock() {
        if (!window.navigator) {
            return;
        }
        var ua = navigator.userAgent;
        if (ua.match(/Mobile/) === null) {
            return;
        }
        
        lock = window.navigator.requestWakeLock("cpu");
        
    }
    
    function checkGeolocation() {
        function onGeolocationAvailable() {
            $.mobile.loading("hide");
            Hayate.PopupView.toast(
                navigator.mozL10n.get("geolocation-available"));
            Hayate.Recorder.startWatchPosition();
        }
        function onGeolocationUnavailable(error) {
            $.mobile.loading("hide");
            Hayate.PopupView.toast(
                navigator.mozL10n.get("geolocation-unavailable", {errmsg: error.message}));
        }
        
        var loaderOption = {
            text: navigator.mozL10n.get("checking-geolocation"),
            textVisible: true
        };

        $.mobile.loading("show", loaderOption);
        
        Hayate.Recorder.checkGeolocation()
            .done(onGeolocationAvailable)
            .fail(onGeolocationUnavailable);
        
    }
    
    function releaseCpuLock() {
        lock.unlock();
    }
    function localize() {
        $("#btnStart").text(navigator.mozL10n.get("start"));
        $("#btnLap").text(navigator.mozL10n.get("reset"));
        
        updateDistanceUnit();
    }
    
    function initUI() {
        
        $("#btnLap").button().button("disable");
        
        $("#btnStart").on("tap", onTapStartStop);
        $("#btnLap").on("tap", onTapLapReset);
        $("#check-geolocation").on("tap", checkGeolocation);

        $(document).on("visibilitychange", onVisibilityChange);
    }
    function onVisibilityChange() {
//        console.log("document.visibilityState: " + document.visibilityState);
    }
    function onPageShow() {
        config = Hayate.Config.get(["geolocation"]);
        
        updateDistanceUnit();
        
    }
    function init() {
        config = Hayate.Config.get(["geolocation"]);
        
        recorder = Hayate.Recorder;
        recorder.addTimeListener(onNewRecord);
        
        initUI();
        localize();
        
        $("#Stopwatch").on("pageshow", onPageShow);
        
        checkGeolocation();
    }
    var lock;
    var distance = 0;
    var recorder;

    var status = {
        Start: "stopped",
        Lap: "disabled"
    };
    var config = null;
    
    return {
        init: init
    };    
}());
