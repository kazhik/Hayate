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
    function calculateFlatDistance(prevCoords, newCoords) {
        var prevLat = prevCoords.latitude;
        var prevLon = prevCoords.longitude;
        var newLat = newCoords.latitude;
        var newLon = newCoords.longitude;
        var x = toRad(newLon - prevLon) * Math.cos(toRad(prevLat + newLat) / 2);
        var y = toRad(newLat - prevLat);
        var latestFlatMove = Math.sqrt(x * x + y * y) * Constant.earthRadius;
        return latestFlatMove;
    }
    // calculates real distance(considers altitude)
    function calculateRealDistance(latestFlatMove, elevation) {

        return Math.sqrt((latestFlatMove * latestFlatMove) + (elevation * elevation));
    }
    function calculateDistance(newCoords) {
        var result = {
            distance: 0,
            elevation: 0
        };
        if (typeof newCoords === "undefined") {
            return result;
        }
        if (typeof prevCoords === "undefined") {
            return result;
        }
        var latestFlatMove = calculateFlatDistance(prevCoords, newCoords);
        
        if (newCoords.accuracy > latestFlatMove) {
            return result;
        }
        result.distance = latestFlatMove;
        
        if (prevCoords.altitude !== null && newCoords.altitude !== null) {
            var elevation = Math.abs(newCoords.altitude - prevCoords.altitude);
            if (elevation > newCoords.altitudeAccuracy) {
                result.elevation = elevation;
                result.distance = calculateRealDistance(latestFlatMove, elevation);
            }
        }
        
        return result;
        
    }
    function autoLap(newTimestamp, latestRealMove) {
        if (config["autoLap"]["on"] === "off") {
            return 0;
        }
        var lapDistance = config["autoLap"]["distance"];
        
        var oldDistance = realDistance;
        var newDistance = realDistance + latestRealMove;
        if (Math.floor(oldDistance / lapDistance) !== Math.floor(newDistance / lapDistance)) {
            return addLap(newTimestamp, realDistance + latestRealMove);
        }
        return 0;
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
        if (prevCoords && latestMove.distance === 0) {
            return 0;
        }

        var lapTime = autoLap(newRec.timestamp, latestMove.distance);
        
        positionHistory.push(newRec);

        if (!prevCoords) {
            // Deep copy
            prevCoords = $.extend(true, {}, newRec.coords);
        } else {
            if (latestMove.distance > 0) {
                realDistance += latestMove.distance;
                prevCoords.latitude = newRec.coords.latitude;
                prevCoords.longitude = newRec.coords.longitude;
            }
            if (latestMove.elevation > 0) {
                elevationGain += latestMove.elevation;
                prevCoords.altitude = newRec.coords.altitude;
            }
        }
        
        return lapTime;

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
        return setCurrentPosition(newRec);
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
    publicObj.getAveragePace = function() {
        return realDistance / ((currentTime - laptimes[0].timestamp) / 1000); 
    };
    return publicObj;
    
}();


