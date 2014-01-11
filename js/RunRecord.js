"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RunRecord = function() {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    function autoLap(newTimestamp, latestRealMove) {
        if (config["autoLap"]["on"] === false) {
            return;
        }
        var lapDistance = config["autoLap"]["distance"];
        
        var oldDistance = realDistance;
        var newDistance = realDistance + latestRealMove;
        if (Math.floor(oldDistance / lapDistance) !== Math.floor(newDistance / lapDistance)) {
            addLap(newTimestamp, realDistance + latestRealMove);
        }
    }
    function moved(newCoords) {
        if (newCoords.latitude !== prevCoords.latitude) {
            return true;
        }
        if (newCoords.longitude !== prevCoords.longitude) {
            return true;
        }
        return false;
    }
    // calculates flat distance
    function calculateFlatDistance(newLat, newLon) {
        var prevLat = prevCoords.latitude;
        var prevLon = prevCoords.longitude;
        var x = toRad(newLon - prevLon) * Math.cos(toRad(prevLat + newLat) / 2);
        var y = toRad(newLat - prevLat);
        var latestFlatMove = Math.sqrt(x * x + y * y) * Constant.earthRadius;
        return latestFlatMove;
    }
    // calculates real distance(considers altitude)
    function calculateRealDistance(latestFlatMove, newAlt, altAccuracy) {
        var realMove = 0;
        if (altAccuracy > config["min"]["altAccuracy"]) {
            console.log("altAccuracy: " + altAccuracy);
            realMove = latestFlatMove;
        }
        var prevAlt = prevCoords.altitude;
        if (newAlt === null || prevAlt === null) {
            realMove = latestFlatMove;
        }
        if (realMove === 0) {
            var elevation = newAlt - prevAlt;
            realMove = Math.sqrt((latestFlatMove * latestFlatMove) + (elevation * elevation));
        }
        
        return realMove;
    }
    function calculateDistance(newCoords) {
        if (typeof newCoords === "undefined") {
            return 0;
        }
        if (typeof prevCoords === "undefined") {
            return 0;
        }
        var latestFlatMove = calculateFlatDistance(
            newCoords.latitude, newCoords.longitude);
        var latestRealMove = calculateRealDistance(
            latestFlatMove, newCoords.altitude, newCoords.altitudeAccuracy);
        
        return latestRealMove;
        
    }
    function addLap(timestamp, distance) {
        var lapInfo = {
            timestamp: timestamp,
            distance: distance
        };
        laptimes.push(lapInfo);
    }   
    function onNewRecord(newRec) {
        var currentCoords = newRec.coords;
        if (laptimes.length === 0) {
            addLap(newRec.timestamp, 0);
        } else if (typeof currentCoords !== "undefined") {
            var latestRealMove = calculateDistance(currentCoords);
            
            autoLap(newRec.timestamp, latestRealMove);
            
            realDistance += latestRealMove;
 
            if (currentCoords.speed !== null) {
                // converts metres/sec to min/km or min/miles
            }
            
            prevCoords = currentCoords;
        }           

    }
    function init() {
        if (typeof Hayate.Config === "undefined") {
            console.log("Config undefined");
            return;
        }

        config = Hayate.Config.get(["geolocation"]);
        
        prevCoords = undefined;
        laptimes.length = 0;
        realDistance = 0;
        
    }

    var Constant = {
        earthRadius: 6371009
    };    
    var laptimes = [];
    var realDistance = 0;
    var prevCoords;
    
    var config;
    
    var publicObj = {};
    
    
    publicObj.init = function() {
        init();
    };
    publicObj.onNewRecord = function(newRec) {
        onNewRecord(newRec);
    };
    
    publicObj.getSplitTime = function(newTimestamp) {
        if (laptimes.length === 0) {
            return 0;
        }
        return newTimestamp - laptimes[0].timestamp;
    }
    publicObj.getLapTime = function(newTimestamp) {
        if (laptimes.length === 0) {
            return 0;
        }
        
        return newTimestamp - laptimes[laptimes.length - 1].timestamp;

    }
    publicObj.getDistance = function() {
        return realDistance;
    }
    
    publicObj.addLap = function(newTimestamp) {
        addLap(newTimestamp, realDistance);
    }
    return publicObj;
    
}();


