"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Recorder = function() {
    
    function convertPositionToJSON(position) {
        var coords = position.coords;
        var posJson = {
            timestamp: position.timestamp,
            coords: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                altitude: coords.altitude,
                accuracy: coords.accuracy,
                altitudeAccuracy: coords.altitudeAccuracy,
                heading: coords.heading,
                speed: coords.speed
            }
        };
        return posJson;
    }

    function onNewPosition(position) {
        // store position in configured interval
        if (positionHistory.length !== 0) {
            var prevRecTimestamp = positionHistory[positionHistory.length - 1].timestamp;
            if (position.timestamp - prevRecTimestamp < config["min"]["timeInterval"]) {
                return;
            }
        }
        var currentCoords = position.coords;
        
        // discard inaccurate data        
        if (currentCoords.accuracy > config["min"]["accuracy"]) {
            console.log("accuracy: " + currentCoords.accuracy + "; min: " + config["min"]["accuracy"]);
            return;
        }

        var posJson = convertPositionToJSON(position);

        if (intervalId !== 0) {
            positionHistory.push(posJson);
            record.setCurrentPosition(posJson);
            posJson.started = true;
        } else {
            posJson.started = false;
        }
        
        // call event listeners
        callPositionListeners(posJson);
    }
    function storeRecord() {
        if (db === null) {
            return;
        }
        
        var data = {
            StartTime: record.getStartTime(),
            Position: positionHistory,
            LapTimes: record.getLaps()
        };
        Hayate.Database.add(objStoreName, data);
    }

    function onError(posErr) {
        console.log("code:" + posErr.code + "; error:" + posErr.message);
    }

    function callListeners(listeners, arg) {
        var keys = Object.keys(listeners);
        
        for (var i = 0; i < keys.length; i++) {
            listeners[keys[i]](arg);
        }
    }
    function callPositionListeners(newPosition) {
        callListeners(positionListeners, newPosition);
    }
    function callTimeListeners(newRec) {
        callListeners(timeListeners, newRec);
    }
    function callLapListeners(newLap) {
        callListeners(lapListeners, newLap);
    }
    function onTimeout() {
        record.setCurrentTime(Date.now());
        var newRec = {
            splitTime: record.getSplitTime(),
            lapTime: record.getLapTime(),
            speed: record.getSpeed(),
            distance: record.getDistance()
        };
        callTimeListeners(newRec);
    }
    function lap(timestamp) {
        var lapTime = record.addLap(timestamp);
        
        var newLap = {
            timestamp: timestamp,
            laptime: lapTime
        };
        callLapListeners(newLap);
    }
    function startWatchPosition() {
        if (!("geolocation" in navigator)) {
            return;
        }
        var option = {
            enableHighAccuracy: true,
            maximumAge: 0
        };
        watchId = navigator.geolocation.watchPosition(onNewPosition, onError, option);
    }
    function stopWatchPosition() {
        if (!("geolocation" in navigator)) {
            return;
        }
        navigator.geolocation.clearWatch(watchId);
    }
    function clear() {
        // http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
        positionHistory.length = 0;
    }
    function stop() {
        clearInterval(intervalId);
        intervalId = 0;
    }
    function importGpxFile(file) {
        function onFinished(recInfo, positions) {
            function onDone() {
                loadRecord(data);
            }
            function onFail(err) {
                console.log(err);
            }
            if (positions.length === 0) {
                return;
            }
   
            var data = {
                StartTime: positions[0].timestamp,
                Position: positions,
                LapTimes: [positions[0].timestamp, positions[positions.length - 1].timestamp]
            };
            if (typeof recInfo["Name"] !== "undefined") {
                data.Name = recInfo["Name"];
                data.Type = recInfo["Type"];
                data.Desc = recInfo["Desc"];
            }
            if (db === null) {
                loadRecord(data);
                return;
            }
            Hayate.Database.add(objStoreName, data)
                .done(onDone)
                .fail(onFail);

        }
        stop();
        clear();
        Hayate.GeopositionConverter.importGpxFile(file, onFinished);
        
    }

    function loadRecord(rec) {
        var confAutoLap = Hayate.Config.get(["geolocation", "autoLap", "on"]);

        Hayate.Config.set(["geolocation", "autoLap", "on"], "off");
        
        var laptimes = rec["LapTimes"];
        record.init();
        var laps = [];
        for (var i = 0; i < laptimes.length; i++) {
            var lapTime = record.addLap(laptimes[i]);
            var newLap = {
                timestamp: laptimes[i],
                laptime: lapTime
            };
            laps.push(newLap);
        }
        record.setCurrentTime(laptimes[laptimes.length - 1]);
        callLapListeners(laps);
        
        if (rec["Position"].length > 0) {
            positionHistory = rec["Position"];
            callPositionListeners(positionHistory);
            for (var i = 0; i < positionHistory.length; i++) {
                record.setCurrentPosition(positionHistory[i]);
            }
        }
        
        var timeRec = {
            splitTime: record.getSplitTime(),
            lapTime: record.getLapTime(),
            speed: 0,
            distance: record.getDistance()
        };
        callTimeListeners(timeRec);
        
        Hayate.Config.set(["geolocation", "autoLap", "on"], confAutoLap);
    }
    function loadFromDB(startTime) {
        function onFail(err) {
            dfd.reject(err.name + "(" + err.message + ")" );
        }
        function onGet(result) {
            dfd.resolve(result);
        }
        var dfd = new $.Deferred();
        
        Hayate.Database.get("GeoLocation", startTime)
            .done(onGet)
            .fail(onFail);
        
        return dfd.promise();
    }
    function makeGpxFileObject(startTime) {
        
        function onLoad(result) {
            var recInfo = {};
            if (typeof result["Name"] !== "undefined") {
                recInfo.Name = result["Name"];
                recInfo.Type = result["Type"];
                recInfo.Desc = result["Desc"];
            } else {
                recInfo.Name = Hayate.ViewUtil.formatDateTime(startTime);
                recInfo.Type = "";
                recInfo.Desc = "";
            }
            var file = Hayate.GeopositionConverter.makeGpxFileObject(result["Position"], recInfo);
            dfd.resolve(file);
        }
        function onError(err) {
            dfd.reject("Failed to load record from DB: " + err);
        }
        var dfd = new $.Deferred();

        loadFromDB(startTime)
            .done(onLoad)
            .fail(onError);

        return dfd.promise();
    }

    function load(startTime) {
        function onLoad(result) {
            if (typeof result === "undefined") {
                return;
            }
            loadRecord(result);
        }
        function onError(err) {
            console.log(err);
        }
        stop();
        clear();
        loadFromDB(startTime)
            .done(onLoad)
            .fail(onError);
        
    }
    var watchId = 0;
    var positionListeners = {};
    var timeListeners = {};
    var lapListeners = {};

    var positionHistory = [];
    var publicObj = {};
    var config = null;
    var db = null;
    var intervalId = 0;
    var distance;
    var objStoreName = "GeoLocation";
    var record;
    
    publicObj.init = function() {
        config = Hayate.Config.get(["geolocation"]);
        
        if (typeof Hayate.Database !== "undefined") {
            db = Hayate.Database;
        }
        record = Hayate.RunRecord;
        
        startWatchPosition();
    };
    publicObj.terminate = function() {
        stopWatchPosition();
    };
    publicObj.start = function() {
        clear();
        record.init();
        record.addLap(Date.now());
        intervalId = setInterval(onTimeout, 100);
    };
    publicObj.clear = function() {
        clear();
    };
    publicObj.stop = function() {
        lap(Date.now());
        stop();
        
        storeRecord();
        
    };
    publicObj.lap = function() {
        lap(Date.now());
    };
    
    publicObj.addPositionListener = function(listener) {
        positionListeners[listener.name] = listener;   
    };
    publicObj.removePositionListener = function(listener) {
        delete positionListeners[listener.name];
    };
    publicObj.addTimeListener = function(listener) {
        timeListeners[listener.name] = listener;   
    };
    publicObj.removeTimeListener = function(listener) {
        delete timeListeners[listener.name];
    };
    publicObj.addLapListener = function(listener) {
        lapListeners[listener.name] = listener;   
    };
    publicObj.removeLapListener = function(listener) {
        delete lapListeners[listener.name];
    };
    
    publicObj.importGpxFile = function(file) {
        importGpxFile(file);
    };
    publicObj.makeGpxFileObject = function(startTime) {
        return makeGpxFileObject(startTime);  
    };
    publicObj.load = function(startTime) {
        load(startTime);  
    };
    
    return publicObj;
}();
