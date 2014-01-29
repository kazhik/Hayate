
asyncTest( "config test", 4, function() {
    function startTest() {
        set();

    }
    function set() {
    
        var conf;
        
        Hayate.Config.set(["geolocation", "autoLap", "on"], "off");
        conf = Hayate.Config.get(["geolocation", "autoLap", "on"]);
        strictEqual(conf, "off", "set and get");        

        Hayate.Config.set(["geolocation", "autoLap", "on"], "on");
        conf = Hayate.Config.get(["geolocation", "autoLap", "on"]);
        strictEqual(conf, "on", "set and get 2");        

        var obj = {
            on: "off",
            distance: 455
        };
        Hayate.Config.set(["geolocation", "autoLap"], obj);
        conf = Hayate.Config.get(["geolocation", "autoLap"]);
        strictEqual(conf["on"], "off", "set and get 3");        
        strictEqual(conf["distance"], 455, "set and get 4");        
        

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
        .done(startTest)
        .fail(onFail);    
     
});


