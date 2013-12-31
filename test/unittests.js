test( "RunRecord test", function() {
    
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
     
});


asyncTest( "database: add & get", 1, function() {
    
    var dbInfo = {
        name: "Hayate",
        version: 1,
        objStore: [
            {
                name: "GeoLocation",
                indexes: ["StartTime"]
            }
        ]
    };

    var osname = dbInfo.objStore[0].name;
    var startTime = Date.now();
    
    var data = {
        StartTime: startTime,
        CurrentTime: Date.now()
    };
    var data2 = {
        StartTime: startTime,
        CurrentTime: Date.now()
    };

    var data3 = {
        StartTime: startTime,
        CurrentTime: Date.now()
    };

    var data4 = {
        StartTime: startTime + 1,
        CurrentTime: Date.now()
    };

    var data5 = {
        StartTime: startTime + 2,
        CurrentTime: Date.now()
    };
    Hayate.Database.open(dbInfo)
        .then(Hayate.Database.clear.bind(null, osname))
        .then(Hayate.Database.add.bind(null, osname, data))
        .then(Hayate.Database.add.bind(null, osname, data2))
        .then(Hayate.Database.add.bind(null, osname, data3))
        .then(Hayate.Database.add.bind(null, osname, data4))
        .then(Hayate.Database.add.bind(null, osname, data5))
        .then(getData)
        .then(onGet)
        .fail(onFail);
        
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onGet(results) {
        console.log(JSON.stringify(results));
        ok( 3 === results.length, "Passed!" );
        start();
    }
    function getData() {
        var keyrange = IDBKeyRange.only(startTime);
        return Hayate.Database.get(osname, "StartTime", startTime);
    }

});

asyncTest( "database: add, get, remove", 4, function() {
    
    var dbInfo = {
        name: "Hayate",
        version: 1,
        objStore: [
            {
                name: "GeoLocation",
                indexes: ["StartTime"]
            }
        ]
    }

    var osname = dbInfo.objStore[0].name;
    var startTime = Date.now();
    
    var data = {
        StartTime: startTime,
        CurrentTime: Date.now(),
        DataNo: 1
    };
    var data2 = {
        StartTime: startTime,
        CurrentTime: Date.now(),
        DataNo: 2
    };
    Hayate.Database.open(dbInfo)
        .then(Hayate.Database.clear.bind(null, osname))
        .then(Hayate.Database.add.bind(null, osname, data))
        .then(Hayate.Database.add.bind(null, osname, data2))
        .then(Hayate.Database.get.bind(null, osname, "StartTime", startTime))
        .then(onGet1)
        .then(Hayate.Database.remove.bind(null, osname, "StartTime", startTime))
        .then(Hayate.Database.get.bind(null, osname, "StartTime", startTime))
        .then(onGet2)
        .done(onDone)
        .fail(onFail);
        
    function onDone() {
        start();
    }
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onGet1(results) {
        console.log(JSON.stringify(results));
        ok( 2 === results.length, "get results.length" );
        ok(results[0].DataNo === 1, "add success");
        ok(results[1].DataNo === 2, "add success");
    }
    function onGet2(results) {
        console.log(JSON.stringify(results));
        ok( 0 === results.length, "get results.length" );
    }

});

asyncTest( "database: config", 3, function() {
    
    var dbInfo = {
        name: "Hayate",
        version: 4,
        objStore: [
            {
                name: "Config",
                keyPath: "appname",
                indexes: []
            }
        ]
    }

    var config = {
        "appname": "Hayate",
        "geolocation": {
            "min" : {
                "accuracy": 5000,
                "altAccuracy": 2000,
                "timeInterval": 1000 * 5,
                "distanceInterval": 10
            },
            "autoLap": {
                "on": true,
                "distance": 1000
            },
            "distanceUnit": "metre"
        },
        "map": {
            "latitude": 35.693134,
            "longitude": 139.851058,
            "zoom": 16
        },
        "debug": true
    };
    var config2 = {
        "appname": "Hayate",
        "geolocation": {
            "min" : {
                "accuracy": 5000,
                "altAccuracy": 2000,
                "timeInterval": 1000 * 5,
                "distanceInterval": 10
            },
            "autoLap": {
                "on": true,
                "distance": 1000
            },
            "distanceUnit": "miles"
        },
        "map": {
            "latitude": 35.693134,
            "longitude": 139.851058,
            "zoom": 16
        },
        "debug": false
    };
        
    var osname = dbInfo.objStore[0].name;
    
    Hayate.Database.open(dbInfo)
        .then(Hayate.Database.put.bind(null, osname, config))
        .then(Hayate.Database.getObject.bind(null, osname, "Hayate"))
        .then(onGetObject1)
        .then(Hayate.Database.put.bind(null, osname, config2))
        .then(Hayate.Database.getObject.bind(null, osname, "Hayate"))
        .then(onGetObject2)
        .done(onDone)
        .fail(onFail);
        
    function onDone() {
        start();
    }
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onGetObject1(result) {
        
        strictEqual(result["map"]["zoom"], 16, "map.zoom");
    }
    function onGetObject2(result) {
        
        strictEqual(result["geolocation"]["distanceUnit"], "miles", "geolocation.distanceUnit");
        strictEqual(result["debug"], false, "map.zoom");
    }
});
