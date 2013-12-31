"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Recorder = function() {

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
    var listeners = {};
    
    function sendPosition() {
        var posJson = {
            timestamp: Date.now(),
            coords: {
                latitude: 35.692332,
                longitude: 139.815398,
                altitude: 0,
                accuracy: 100,
                altitudeAccuracy: 1,
                heading: null,
                speed: null
            }
        };
        callEventListeners(posJson);
        
        posJson.timestamp = Date.now();
        posJson.coords.latitude = 35.692472;
        posJson.coords.longitude = 139.820033;
        callEventListeners(posJson);
        
        posJson.timestamp = Date.now();
        posJson.coords.latitude = 35.6851;
        posJson.coords.longitude = 139.820741;
        callEventListeners(posJson);
        
    }

    var publicObj = {};
    var intervalId = 0;
    publicObj.init = function() {
        setTimeout(sendPosition, 1000);
    };
    publicObj.terminate = function() {
    };
    publicObj.start = function() {
        intervalId = setInterval(onTimeout, 10000);
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
