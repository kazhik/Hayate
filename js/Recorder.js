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
        var prevTimestamp = record.getPrevPositionTimestamp();
        if (prevTimestamp !== 0) {
            if (position.timestamp - prevTimestamp < config["min"]["timeInterval"] * 1000) {
                return;
            }
        }
        var currentCoords = position.coords;

        var posJson = convertPositionToJSON(position);

        var lapTime = 0;
        if (intervalId !== 0) {
            if (!checkAccuracy(posJson)) {
                return;
            }
            
            lapTime = record.setCurrentPosition(posJson);
            if (lapTime > 0) {
                var newLap = {
                    timestamp: posJson.timestamp,
                    laptime: lapTime
                };
                callLapListeners(newLap);

                posJson.started = true;
                callPositionListeners(posJson);
            }
        
        } else {
            posJson.started = false;
            callPositionListeners(posJson);
        }
        
    }
    function storeRecord() {
        if (db === null) {
            return;
        }
        
        var data = {
            StartTime: record.getStartTime(),
            Position: record.getPositions(),
            LapTimes: record.getLaps()
        };
        db.add(objStoreName, data);
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
            elevationGain: record.getElevationGain(),
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
        record.init();

    }
    function stop() {
        clearInterval(intervalId);
        intervalId = 0;
    }
    function importGpxFile(file) {
        function onFail(err) {
            console.log(err);
        }
        function onRead(recInfo, positions) {
            function onDone() {
                Hayate.PopupView.toast("Import complete");
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
            loadRecord(data);
            
            if (db === null) {
                return;
            }
            db.add(objStoreName, data)
                .done(onDone)
                .fail(onFail);

        }
        stop();
        clear();
        Hayate.GeopositionConverter.readGpxFile(file)
            .done(onRead)
            .fail(onFail);
        
    }
    function checkAccuracy(position) {
        if (position.coords.accuracy > config["min"]["accuracy"]) {
            return false;
        }
        if (position.coords.altAccuracy > config["min"]["altAccuracy"]) {
            return false;
        }
        return true;
    }

    function loadRecord(rec) {
        var confAutoLap = Hayate.Config.get(["geolocation", "autoLap", "on"]);

        Hayate.Config.set(["geolocation", "autoLap", "on"], "off");
        
        var laptimes = rec["LapTimes"];
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
        
        function setPosition(position, idx) {
            if (!checkAccuracy(position)) {
                return false;
            }
            record.setCurrentPosition(position);
            return true;
        }
        var positions = rec["Position"].filter(setPosition);
        callPositionListeners(positions);
        
        var timeRec = {
            splitTime: record.getSplitTime(),
            lapTime: record.getLapTime(),
            speed: 0,
            elevationGain: record.getElevationGain(),
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
        
        db.get("GeoLocation", startTime)
            .done(onGet)
            .fail(onFail);
        
        return dfd.promise();
    }
    function makePositionFileObject(startTime) {
        function onLoad(result) {
            var positions = result["Position"];
            var posStr = "";
            for (var i = 0; i < positions.length; i++) {
                posStr += JSON.stringify(positions[i]) + "\n";
            }
            var file = new Blob([posStr], {type: "application/json"});

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
    function makeGpxFileObject(startTime) {
        
        function onLoad(result) {
            var recInfo = {};
            if (typeof result["Name"] !== "undefined") {
                recInfo.Name = result["Name"];
                recInfo.Type = result["Type"];
                recInfo.Desc = result["Desc"];
            } else {
                recInfo.Name = Hayate.StringUtil.formatDateTime(startTime);
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

    var positionListeners = {};
    var timeListeners = {};
    var lapListeners = {};

    var publicObj = {};

    var config = null;

    var db = null;
    var objStoreName = "GeoLocation";

    var watchId = 0;
    var intervalId = 0;

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
        lap(Date.now());
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
    publicObj.makePositionFileObject = function(startTime) {
        return makePositionFileObject(startTime);  
    };
    publicObj.load = function(startTime) {
        load(startTime);  
    };
    
    return publicObj;
}();
