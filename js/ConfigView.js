"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.ConfigView = function() {
    function onClose() {
        var config = {
            "geolocation": {
                "min" : {
                    "accuracy": parseInt($("#select-min-accurary").val(), 10),
                    "altAccuracy": parseInt($("#select-min-alt-accuracy").val(), 10),
                    "timeInterval": parseInt($("#select-min-time-interval").val(), 10),
                    "distanceInterval": parseInt($("#select-min-distance-interval").val(), 10)
                },
                "autoLap": {
                    "on": $("#flip-autolap").val(),
                    "distance": parseInt($("#input-autolap-distance").val(), 10)
                },
                "distanceUnit": $("#select-distance-unit").val()
            },
            "map": {
                "zoom": parseInt($("#select-zoom").val(), 10)
            },
            "debug": $("#flip-debug").val()
        };
        Hayate.Config.save(config);
    }
    function onOpen() {
        var config = Hayate.Config.get([]);
        $("#select-min-accurary").val(config["geolocation"]["min"]["accuracy"].toString())
            .selectmenu( "refresh" );
        $("#select-min-alt-accuracy").val(config["geolocation"]["min"]["altAccuracy"].toString())
            .selectmenu( "refresh" );
        $("#select-min-time-interval").val(config["geolocation"]["min"]["timeInterval"].toString())
            .selectmenu( "refresh" );
        $("#select-min-distance-interval").val(config["geolocation"]["min"]["distanceInterval"].toString())
            .selectmenu("refresh");
        $("#flip-autolap").val(config["geolocation"]["autoLap"]["on"])
            .slider("refresh");
        $("#input-autolap-distance").val(config["geolocation"]["autoLap"]["distance"].toString());
        $("#select-distance-unit").val(config["geolocation"]["distanceUnit"])
            .selectmenu( "refresh" );

        $("#select-zoom").val(config["map"]["zoom"].toString())
            .selectmenu( "refresh" );

        $("#flip-debug").val(config["debug"])
            .slider("refresh");
    }
    function init() {
        $("#flip-autolap").slider();
        $("#flip-debug").slider();
        $("#close-settings").on("tap", onClose);
        
        $("#Settings").on("pageshow", onOpen);
        initValue();
    }
    function initValue() {
        var distanceUnit = Hayate.Config.get(["geolocation", "distanceUnit"]);
        var distanceUnitStr;
        if (distanceUnit === "metre") {
            distanceUnitStr = document.webL10n.get("distance-unit-metre");
        } else {
            distanceUnitStr = document.webL10n.get("distance-unit-mile");
        }
        
        var values;
        var i;
        
        values = [10, 50, 100, 200];
        for (i = 0; i < values.length; i++) {
            $('#select-min-accuracy').append($('<option>', {
                value: values[i],
                text: values[i] + " " + distanceUnitStr
            }));        
            $('#select-min-alt-accuracy').append($('<option>', {
                value: values[i],
                text: values[i] + " " + distanceUnitStr
            }));        
        }
        values = [1, 5, 10, 30, 60];
        for (i = 0; i < values.length; i++) {
            $('#select-min-time-interval').append($('<option>', {
                value: values[i],
                text: values[i] + " " + document.webL10n.get("seconds")
            }));        
        }
        values = [1, 5, 10, 50, 100];
        for (i = 0; i < values.length; i++) {
            $('#select-min-distance-interval').append($('<option>', {
                value: values[i],
                text: values[i] + " " + distanceUnitStr
            }));        
        }
        values = [12, 14, 16];
        for (i = 0; i < values.length; i++) {
            $('#select-zoom').append($('<option>', {
                value: values[i],
                text: values[i]
            }));        
        }
        
        values = ["metre", "mile"];
        for (i = 0; i < values.length; i++) {
            $('#select-distance-unit').append($('<option>', {
                value: values[i],
                text: document.webL10n.get(values[i])
            }));        
        }
        
        /* doesn't work
        values = ["on", "off"];
        for (i = 0; i < values.length; i++) {
            $('#flip-autolap').append($('<option>', {
                value: values[i],
                text: document.webL10n.get(values[i])
            }));        
            $('#flip-debug').append($('<option>', {
                value: values[i],
                text: document.webL10n.get(values[i])
            }));        
        }
        */
        
    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
        
    };
    
    
    return publicObj;
}();
