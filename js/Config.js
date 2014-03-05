"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Config = function() {
    var configDefault = {
        "appname": "Hayate",
        "geolocation": {
            "min" : {
                "accuracy": 50,
                "altAccuracy": 50,
                "timeInterval": 5,
                "distanceInterval": 10
            },
            "autoLap": {
                "on": "off",
                "distance": 1000
            },
            "pace": {
                "type": "average"  
            },
            "distanceUnit": "metre"
        },
        "map": {
            "type": "GoogleMap",
            "url": {
                "GoogleMap": "http://kazhik.github.io/Hayate/map/gmap.html",
                "OpenStreetMap": "http://kazhik.github.io/Hayate/map/omap.html"
            },
            "zoom": 16
        },
        "debug": {
            "log": "on",
            "export": "position"
        }
    };
    function get(keys) {
        var conf = config;
        for (var i = 0; i < keys.length; i++) {
            if (typeof conf[keys[i]] === "undefined") {
                console.log("config get error: " + keys[i]);
                return "";
            }
            conf = conf[keys[i]];
        }
        return conf;
    }
    function set(keys, value) {
        if (keys.length < 1) {
            return;
        }
        var conf = config;
        for (var i = 0; i < keys.length - 1; i++) {
            conf = conf[keys[i]];
        }
        conf[keys[keys.length - 1]] = value;
    }
    function save(newConfig) {
        var onSuccess = function () {
            dfd.resolve();
        };
        var onError = function(err) {
            dfd.reject(err);
        };

        config["geolocation"] = newConfig["geolocation"];
        config["map"] = newConfig["map"];
        config["debug"] = newConfig["debug"];

        var dfd = new $.Deferred();
        Hayate.Database.put("Config", config)
            .done(onSuccess)
            .fail(onError);
        
        return dfd.promise();
    }
    function load() {
        var onSuccess = function (result) {
            if (typeof result !== "undefined") {
                config = result;
            } else {
                config = configDefault;
            }
            dfd.resolve();
        };
        var onError = function(err) {
            config = configDefault;
            dfd.reject(err);
        };
        var dfd = new $.Deferred();

        Hayate.Database.get("Config", "Hayate")
            .done(onSuccess)
            .fail(onError);

        return dfd.promise();        
    }
    function reset() {
        config = configDefault;
        return save(config);
    }
    var config = {};
    
    var publicObj = {};
    
    publicObj.get = function(keys) {
        return get(keys);
    };
    publicObj.set = function(keys, value) {
        set(keys, value);
    };

    publicObj.save = function(newConfig) {
        return save(newConfig);
    };
    publicObj.load = function() {
        return load();
    };
    publicObj.reset = function() {
        return reset();
    };
    return publicObj;
}();
