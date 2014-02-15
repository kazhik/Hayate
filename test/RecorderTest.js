
asyncTest( "Recorder TimeListener", 3, function() {
    function initialized() {
        testTimeListener();

    }
    function testTimeListener() {
        var counter = 0;
        function onNewTime(newTime) {
            counter++;
            if (counter === 100) {
                Hayate.Recorder.stop();
                ok(newTime.lapTime > 3800 && newTime.lapTime < 4200, "time 10sec: " + newTime.lapTime);
                console.log(JSON.stringify(newTime));
                start();
            } else if (counter === 60) {
                ok(newTime.lapTime > 5700 && newTime.lapTime < 6300, "time 6sec: " + newTime.lapTime);
                Hayate.Recorder.lap();
            }
        }
        ok(Hayate.Recorder !== 'undefined');
    
        Hayate.Config.set(["geolocation", "autoLap", "on"], "off");
        
        Hayate.Recorder.init();
        Hayate.Recorder.addTimeListener(onNewTime);
        
        
        Hayate.Recorder.start();
        
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

asyncTest( "Recorder LapListener", 3, function() {
    function initialized() {
        testLapListener();

    }
    function testLapListener() {
        var counter = 0;
        function onNewTime(newTime) {
            counter++;
            if (counter === 30) {
                Hayate.Recorder.lap();
            } else if (counter === 70) {
                Hayate.Recorder.stop();
            }
        }
        function onNewLap(newLap) {
            if (counter === 30) {
                console.log(JSON.stringify(newLap));
                ok(newLap.laptime > 2900 && newLap.laptime < 3100, "laptime: 3sec: " + newLap.laptime);
            } else if (counter === 70) {
                ok(newLap.laptime > 3900 && newLap.laptime < 4100, "laptime: 7sec: " + newLap.laptime);
                start();
            }
            
        }
        ok(Hayate.Recorder !== 'undefined');
    
        Hayate.Config.set(["geolocation", "autoLap", "on"], "off");
        
        Hayate.Recorder.init();
        Hayate.Recorder.addLapListener(onNewLap);
        Hayate.Recorder.addTimeListener(onNewTime);
        
        Hayate.Recorder.start();
        
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

