"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RunRecord = function() {
    function toRad(x) {
        return x * Math.PI / 180;
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
            elevationGain += Math.abs(elevation);
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
    function autoLap(newTimestamp, latestRealMove) {
        if (config["autoLap"]["on"] === "off") {
            return;
        }
        var lapDistance = config["autoLap"]["distance"];
        
        var oldDistance = realDistance;
        var newDistance = realDistance + latestRealMove;
        if (Math.floor(oldDistance / lapDistance) !== Math.floor(newDistance / lapDistance)) {
            addLap(newTimestamp, realDistance + latestRealMove);
        }
    }

    function addLap(timestamp, distance) {
        var lapInfo = {
            timestamp: timestamp,
            distance: distance
        };
        
        laptimes.push(lapInfo);

        if (laptimes.length > 1) {
            return timestamp - laptimes[laptimes.length - 2].timestamp;
        } else {
            return 0;
        }
    }
    function setCurrentTime(timestamp) {

        if (timestamp > currentTime) {
            currentTime = timestamp;
        }
    }
    function setCurrentPosition(newRec) {
        setCurrentTime(newRec.timestamp);
        
        var latestMove = calculateDistance(newRec.coords);

        autoLap(newRec.timestamp, latestMove);
        
        positionHistory.push(newRec);
        
        realDistance += latestMove;

        prevCoords = newRec.coords;

    }

    function init() {
        if (typeof Hayate.Config === "undefined") {
            console.log("Config undefined");
            return;
        }

        config = Hayate.Config.get(["geolocation"]);

        // http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
        positionHistory.length = 0;
        laptimes.length = 0;
        
        prevCoords = undefined;
        realDistance = 0;
        currentTime = 0;
        elevationGain = 0;

    }

    var Constant = {
        earthRadius: 6371009
    };    
    var positionHistory = [];
    var laptimes = [];
    var realDistance = 0;
    var prevCoords;
    var currentTime;
    var elevationGain = 0;
    var config;
    
    var publicObj = {};
    
    
    publicObj.init = function() {
        init();
    };
    publicObj.setCurrentPosition = function(newRec) {
        setCurrentPosition(newRec);
    };
    publicObj.setCurrentTime = function(timestamp) {
        setCurrentTime(timestamp);
    };
    
    publicObj.getSpeed = function() {
        if (typeof prevCoords === "undefined") {
            return 0;
        }
        return prevCoords.speed;
    };
    publicObj.getSplitTime = function() {
        if (laptimes.length === 0) {
            return 0;
        }
        return currentTime - laptimes[0].timestamp;
    };
    publicObj.getLapTime = function() {
        if (laptimes.length === 0) {
            return 0;
        }
        
        return currentTime - laptimes[laptimes.length - 1].timestamp;

    };
    publicObj.getStartTime = function() {
        return laptimes[0].timestamp;
    }
    publicObj.getLaps = function() {
        function makeTimestampArray(lapInfo) {
            return lapInfo.timestamp;
        }
        return laptimes.map(makeTimestampArray);
    };
    publicObj.getPrevPositionTimestamp = function() {
        if (positionHistory.length === 0) {
            return 0;
        }
        return positionHistory[positionHistory.length - 1].timestamp;        
    };
    publicObj.getPositions = function() {
        return positionHistory;
    };
    publicObj.getDistance = function() {
        return realDistance;
    };
    
    publicObj.addLap = function(newTimestamp) {
        return addLap(newTimestamp, realDistance);
    };
    publicObj.getElevationGain = function() {
        return elevationGain;
    };
    return publicObj;
    
}();


