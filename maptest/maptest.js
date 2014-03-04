"use strict";

window.onload = function() {
    
    function init() {
        var data = {
            type: "init",
            zoom: 16
        };
        
        window.postMessage(JSON.stringify(data), '*');
    }
    function position() {
        var data = {
            type: "position",
            timestamp: Date.now(),
            coords: {
                latitude: 35.692332,
                longitude: 139.815398,
                altitude: 0,
                accuracy: 4,
                altitudeAccuracy: 1,
                heading: null,
                speed: null
            },
            started: true
        };
        
        window.postMessage(JSON.stringify(data), '*');
    }
    function position2() {
        var data = {
            type: "position",
            timestamp: Date.now(),
            coords: {
                latitude: 35.692472,
                longitude: 139.820033,
                altitude: 0,
                accuracy: 5,
                altitudeAccuracy: 1,
                heading: null,
                speed: null
            },
            started: true
        };
        
        window.postMessage(JSON.stringify(data), '*');
    }

    init();
    setTimeout(position, 1 * 1000);
    setTimeout(position2, 2 * 1000);
    
}