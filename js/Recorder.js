"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Recorder = function() {

    var positionHistory = [];
    
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
        
        onPosition(posJson);
    }
    function storePosition(posJson) {
        // store position
        if (positionHistory.length === 0) {
            var data = {
                StartTime: posJson.timestamp,
                Position: posJson
            }
            Hayate.Database.add(objStoreName, data);
        } else {
            Hayate.Database.addItem(objStoreName,
                positionHistory[0].timestamp, "Position", posJson);
        }
        positionHistory.push(posJson);
    }
    function onPosition(posJson) {
        if (intervalId === 0) {
            return;
        }
        storePosition(posJson);
        
        // call event listeners
        callEventListeners(posJson);
    }

    function onError(posErr) {
        console.log("code:" + posErr.code + "; error:" + posErr.message);
    }
    function callEventListeners(newRec) {
        var keys = Object.getOwnPropertyNames(listeners);
        
        for (var i = 0; i < keys.length; i++) {
            listeners[keys[i]](newRec);
        }
    }
    function onTimeout() {
        var newRec = {
            timestamp: Date.now()
        };
        if (positionHistory.length > 0) {
            newRec.coords = positionHistory[positionHistory.length - 1].coords;
        }

        callEventListeners(newRec);
    }
    var watchId = 0;
    var listeners = {};
    var db = Hayate.Database;
    
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
	function importTrackPoint(idx) {
        var posJson = {
            timestamp: Date.parse($(this).find("time").text()),
            coords: {
                latitude: parseFloat($(this).attr("lat")),
                longitude: parseFloat($(this).attr("lon")),
                altitude: parseInt($(this).find("ele").text(), 10),
                accuracy: 1,
                altitudeAccuracy: 1,
                heading: null,
                speed: null
            }
        };
        positionHistory.push(posJson);		
	}
	function importGpxFile(file) {
        function onLoaded() {
            var $xml = $($.parseXML(reader.result));
            
            $xml.find("trkseg").children().each(importTrackPoint);
			finishImport();

        }
		console.log("start import");
		stop();
		clear();
		
        var reader = new FileReader();
        reader.readAsText(file);
        
        reader.onloadend = onLoaded;
		
	}

    function finishImport() {
        console.log("finishImport");
        callEventListeners(positionHistory);

        var data = {
            StartTime: positionHistory[0].timestamp,
            Position: positionHistory
        };
        Hayate.Database.add(objStoreName, data);

    }
    function load(startTime) {
        function onFail(err) {
            console.log(err.name + "(" + err.message + ")" );
        }
        function onGet(result) {
            if (typeof result === "undefined") {
                return;
            }
            callEventListeners(result["Position"]);
        }

        Hayate.Database.get("GeoLocation", startTime)
            .done(onGet)
            .fail(onFail);
        
    }

    var publicObj = {};
    var config = null;
    var intervalId = 0;
    var objStoreName = "GeoLocation";
    publicObj.init = function() {
        config = Hayate.Config.get(["geolocation"]);
        
        startWatchPosition();
    };
    publicObj.terminate = function() {
        stopWatchPosition();
    };
    publicObj.start = function() {
        clear();
        intervalId = setInterval(onTimeout, 100);
    };
    publicObj.clear = function() {
        clear();
    }
    publicObj.stop = function() {
        clearInterval(intervalId);
        intervalId = 0;
    };
    publicObj.addListener = function(listener) {
        listeners[listener.name] = listener;
    };
    publicObj.removeListener = function(listener) {
        delete listeners[listener.name];
    };
    publicObj.importGpxFile = function(file) {
        importGpxFile(file);
    };
    publicObj.load = function(startTime) {
        load(startTime);  
    };
    
    return publicObj;
}();
