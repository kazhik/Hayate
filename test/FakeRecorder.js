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
        
        var posJson2 = JSON.parse(JSON.stringify(posJson));
        posJson2.timestamp = Date.now();
        posJson2.coords.latitude = 35.692472;
        posJson2.coords.longitude = 139.820033;
        callEventListeners(posJson2);
        
        var posJson3 = JSON.parse(JSON.stringify(posJson));
        posJson3.timestamp = Date.now();
        posJson3.coords.latitude = 35.6851;
        posJson3.coords.longitude = 139.820741;
        callEventListeners(posJson3);
        
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
