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

    function onPosition(position) {
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
        
        positionHistory.push(posJson);
        
        // store position in db
        Hayate.Database.add(objStoreName, posJson);

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
        var newRec = {};
        newRec.timestamp = Date.now();
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
        watchId = navigator.geolocation.watchPosition(onPosition, onError, option);
    }
    function stopWatchPosition() {
        if (!("geolocation" in navigator)) {
            return;
        }
        navigator.geolocation.clearWatch(watchId);
    }

    var publicObj = {};
    var config = null;
    var intervalId = 0;
    var objStoreName = null;
    publicObj.init = function(osname) {
        objStoreName = osname;
        config = Hayate.Config.get(["geolocation"]);
        
        startWatchPosition();
    };
    publicObj.terminate = function() {
        stopWatchPosition();
    };
    publicObj.start = function() {
        intervalId = setInterval(onTimeout, 100);
    };
    publicObj.stop = function() {
        clearInterval(intervalId);
    };
    publicObj.addListener = function(listener) {
        listeners[listener.name] = listener;
    };
    publicObj.removeListener = function(listener) {
        delete listeners[listener.name];
    };
   
    
    return publicObj;
}();
