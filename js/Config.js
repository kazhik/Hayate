"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Config = function() {
    var config = {
        "appname": "Hayate",
        "geolocation": {
            "min" : {
                "accuracy": 200,
                "altAccuracy": 200,
                "timeInterval": 5,
                "distanceInterval": 10
            },
            "autoLap": {
                "on": "on",
                "distance": 1000
            },
            "distanceUnit": "mile"
        },
        "map": {
            "url": "http://kazhik.github.io/Hayate/map/gmap.html",
            "zoom": 16
        },
        "debug": {
            "log": "on",
            "export": "position"
        }
    };
    
    var publicObj = {};
    
    publicObj.get = function(keys) {
        var conf = config;
        for (var i = 0; i < keys.length; i++) {
            if (typeof conf[keys[i]] === "undefined") {
                console.log("config get error: " + keys[i]);
                return "";
            }
            conf = conf[keys[i]];
        }
        return conf;
    };
    publicObj.set = function(keys, value) {
        if (keys.length < 1) {
            return;
        }
        var conf = config;
        for (var i = 0; i < keys.length - 1; i++) {
            conf = conf[keys[i]];
        }
        conf[keys[keys.length - 1]] = value;
    };

    publicObj.save = function(newConfig) {
        var onSuccess = function () {
            dfd.resolve();
        };
        var onError = function(err) {
            dfd.reject(err);
        };

        config["geolocation"] = newConfig["geolocation"];
        config["map"]["zoom"] = newConfig["map"]["zoom"];
        config["debug"] = newConfig["debug"];

        var dfd = new $.Deferred();
        Hayate.Database.put("Config", config)
            .done(onSuccess)
            .fail(onError);
    }
    publicObj.load = function() {
        var onSuccess = function (result) {
            if (typeof result !== "undefined") {
                config = result;
            }
            dfd.resolve();
        };
        var onError = function(err) {
            dfd.reject(err);
        };
        var dfd = new $.Deferred();

        Hayate.Database.get("Config", "Hayate")
            .done(onSuccess)
            .fail(onError);

        return dfd.promise();        
    };
    
    return publicObj;
}();
