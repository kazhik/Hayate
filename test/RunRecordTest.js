
asyncTest( "timestamp and distance", 16, function() {
    function initialized() {
        timestampAndDistance();
        timestampOnly();

    }
    function timestampAndDistance() {
        ok(Hayate.Recorder !== 'undefined');
    
        Hayate.RunRecord.init();
    
        var posObj = {
            timestamp: Date.now(),
            coords: {
                latitude: 39.899004,
                longitude: -112.507396,
                altitude: 0,
                accuracy: 10,
                altitudeAccuracy: 10,
                heading: null,
                speed: null
            }
        };
        Hayate.RunRecord.onNewRecord(posObj);
        
        var distance;
        distance = Hayate.RunRecord.getDistance();
        strictEqual(distance, 0, "Started just now");
    
        var posObj2 = {
            timestamp: posObj.timestamp + (120 * 1000),
            coords: {
                latitude: 39.89907,
                longitude: -112.500272,
                altitude: 0,
                accuracy: 10,
                altitudeAccuracy: 10,
                heading: null,
                speed: null
            }
        };    
    
        Hayate.RunRecord.onNewRecord(posObj2);
        distance = Hayate.RunRecord.getDistance();
        strictEqual(Math.ceil(distance), 608, "calculated distance: " + distance);
        
        strictEqual(Hayate.RunRecord.getSplitTime(posObj2.timestamp), 120 * 1000, "SplitTime");
        strictEqual(Hayate.RunRecord.getLapTime(posObj2.timestamp), 120 * 1000, "LapTime");
    
        var posObj3 = {
            timestamp: posObj2.timestamp + (130 * 1000),
            coords: {
                latitude: 39.899004,
                longitude: -112.507396,
                altitude: 0,
                accuracy: 10,
                altitudeAccuracy: 10,
                heading: null,
                speed: null
            }
        };      
        
        Hayate.RunRecord.onNewRecord(posObj3);
    
        distance = Hayate.RunRecord.getDistance();
        strictEqual(Math.ceil(distance), 1216, "calculated distance: " + distance);
        
        strictEqual(Hayate.RunRecord.getSplitTime(posObj3.timestamp), 250 * 1000, "SplitTime");
        strictEqual(Hayate.RunRecord.getLapTime(posObj3.timestamp), 0 * 1000, "LapTime");
        
    }
    function timestampOnly() {
        ok(Hayate.Recorder !== 'undefined');
    
        Hayate.Config.set(["geolocation", "autoLap", "on"], false);
    
        Hayate.RunRecord.init();
    
        var posObj = {
            timestamp: Date.now()
        };
        Hayate.RunRecord.onNewRecord(posObj);
        
        var distance;
        distance = Hayate.RunRecord.getDistance();
        strictEqual(distance, 0, "Started just now");
    
        var posObj2 = {
            timestamp: posObj.timestamp + (120 * 1000)
        };    
    
        Hayate.RunRecord.onNewRecord(posObj2);
        distance = Hayate.RunRecord.getDistance();
        strictEqual(distance, 0, "No distance");
        
        strictEqual(Hayate.RunRecord.getSplitTime(posObj2.timestamp), 120 * 1000, "1st SplitTime");
        strictEqual(Hayate.RunRecord.getLapTime(posObj2.timestamp), 120 * 1000, "1st LapTime");
    
        var posObj3 = {
            timestamp: posObj2.timestamp + (130 * 1000)
        };      
        
        Hayate.RunRecord.onNewRecord(posObj3);
    
        distance = Hayate.RunRecord.getDistance();
        strictEqual(distance, 0, "No distance");
        
        strictEqual(Hayate.RunRecord.getSplitTime(posObj3.timestamp), 250 * 1000, "2nd SplitTime");
        strictEqual(Hayate.RunRecord.getLapTime(posObj3.timestamp), 250 * 1000, "2nd LapTime");
        QUnit.start();
        
    }
    function onFail() {
        console.log("Failed to initialize");
    }
    var dbInfo = {
        name: "Hayate",
        version: 12,
        objStore: [
            {
                name: "Config",
                keyPath: "appname"
            },
            {
                name: "ConsoleLog",
                keyPath: null
            },
            {
                name: "GeoLocation",
                keyPath: "StartTime"
            }
        ]
    };
    Hayate.Database.open(dbInfo)
        .then(Hayate.Config.load)
        .done(initialized)
        .fail(onFail);    
     
});


