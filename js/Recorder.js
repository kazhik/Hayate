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
    function callTimeListeners(newTimestamp) {
        callListeners(timeListeners, newTimestamp);
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
        }
        callTimeListeners(newRec);
    }
    function lap() {
        var now = Date.now();

        var lapTime = record.addLap(now);
        
        var newLap = {
            timestamp: now,
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
    
    function makeCDATA(str) {
        return "<![CDATA[" + str + "]]>";
    }
    function exportGpxFile(trackName, trackDesc, trackType) {
        var gpxDoc = document.implementation.createDocument(null, "gpx", null);
        
        var trkElement = gpxDoc.createElement("trk");
        
        var trkName = gpxDoc.createElement("name");
        var trkNameText = gpxDoc.createTextNode(makeCDATA(trackName));
        trkName.appendChild(trkNameText);
        trkElement.appendChild(trkName);

        var trkDesc = gpxDoc.createElement("desc");
        var trkDescText = gpxDoc.createTextNode(makeCDATA(trackDesc));
        trkDesc.appendChild(trkDescText);
        trkElement.appendChild(trkDesc);

        var trkType = gpxDoc.createElement("type");
        var trkTypeText = gpxDoc.createTextNode(makeCDATA(trackType));
        trkType.appendChild(trkTypeText);
        trkElement.appendChild(trkType);
        
        var trkSeg = gpxDoc.createElement("trkseg");
        for (var i = 0; i < positionHistory.length; i++) {
            var trkPt = gpxDoc.createElement("trkpt");
            trkPt.setAttribute("lat", positionHistory[i].coords.latitude);
            trkPt.setAttribute("lon", positionHistory[i].coords.longitude);
            
            var trkEle = gpxDoc.createElement("ele");
            var trkEleText = gpxDoc.createTextNode(positionHistory[i].coords.altitude);
            trkEle.appendChild(trkEleText);
            trkPt.appendChild(trkEle);

            var trkTime = gpxDoc.createElement("time");
            var trkTimestamp = new Date(positionHistory[i].timestamp);
            var trkTimeText = gpxDoc.createTextNode(trkTimestamp.toISOString());
            trkTime.appendChild(trkTimeText);
            trkPt.appendChild(trkTime);
            
            trkSeg.appendChild(trkPt);
        }
        trkElement.appendChild(trkSeg);
        
        gpxDoc.appendChild(trkElement);
        
        var gpxStr = new XMLSerializer().serializeToString(gpxDoc); 
        
        return new Blob([gpxStr], {type: "text/xml"});
    }
	function importGpxFile(file) {
        function onLoaded() {
            var $xml = $($.parseXML(reader.result));
            
            $xml.find("trkseg").children().each(importTrackPoint);
			finishImport();

        }
		stop();
		clear();
		
        var reader = new FileReader();
        reader.readAsText(file);
        
        reader.onloadend = onLoaded;
		
	}

    function finishImport() {
        callPositionListeners(positionHistory);
        
        if (db === null) {
            return;
        }

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
            callPositionListeners(result["Position"]);
        }
        
        if (db === null) {
            return;
        }

        Hayate.Database.get("GeoLocation", startTime)
            .done(onGet)
            .fail(onFail);
        
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
        record.init(Date.now());
        intervalId = setInterval(onTimeout, 100);
    };
    publicObj.clear = function() {
        clear();
    }
    publicObj.stop = function() {
        lap();
        clearInterval(intervalId);
        intervalId = 0;
        
        storeRecord();
        
    };
    publicObj.lap = function() {
        lap();
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
    publicObj.exportGpxFile = function(name, desc, type) {
        return exportGpxFile(name, desc, type);  
    };
    publicObj.load = function(startTime) {
        load(startTime);  
    };
    
    return publicObj;
}();
