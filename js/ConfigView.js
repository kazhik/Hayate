"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.ConfigView = function() {
    function onClose() {
        var config = {
            "geolocation": {
                "min" : {
                    "accuracy": parseInt($("#select-min-accuracy").val(), 10),
                    "altAccuracy": parseInt($("#select-min-alt-accuracy").val(), 10),
                    "timeInterval": parseInt($("#select-min-time-interval").val(), 10),
                    "distanceInterval": parseInt($("#select-min-distance-interval").val(), 10)
                },
                "autoLap": {
                    "on": $("#flip-autolap").val(),
                    "distance": parseInt($("#input-autolap-distance").val(), 10)
                },
                "pace" : {
                    "type": $("#select-pace-type").val()
                },
                "distanceUnit": $("#select-distance-unit").val()
            },
            "map": {
                "type": $("#select-maptype").val(),
                "url": Hayate.Config.get(["map", "url"]),
                "zoom": parseInt($("#select-zoom").val(), 10)
            },
            "debug": {
                "log": $("#flip-debug-log").val(),
                "export": $("#select-export").val()
            }
        };
        Hayate.Config.save(config);
    }
    function onOpen() {
        var config = Hayate.Config.get([]);
        $("#select-min-accuracy").val(config["geolocation"]["min"]["accuracy"].toString())
            .selectmenu( "refresh" );
        $("#select-min-alt-accuracy").val(config["geolocation"]["min"]["altAccuracy"].toString())
            .selectmenu( "refresh" );
        $("#select-min-time-interval").val(config["geolocation"]["min"]["timeInterval"].toString())
            .selectmenu( "refresh" );
        $("#select-min-distance-interval").val(config["geolocation"]["min"]["distanceInterval"].toString())
            .selectmenu("refresh");
        $("#select-pace-type").val(config["geolocation"]["pace"]["type"])
            .selectmenu("refresh");
        $("#flip-autolap").val(config["geolocation"]["autoLap"]["on"])
            .slider("refresh");
        $("#input-autolap-distance").val(config["geolocation"]["autoLap"]["distance"].toString());
        $("#select-distance-unit").val(config["geolocation"]["distanceUnit"])
            .selectmenu( "refresh" );

        $("#select-zoom").val(config["map"]["zoom"].toString())
            .selectmenu( "refresh" );
        $("#select-maptype").val(config["map"]["type"])
            .selectmenu( "refresh" );

        $("#flip-debug-log").val(config["debug"]["log"])
            .slider("refresh");
        $("#select-export").val(config["debug"]["export"])
            .selectmenu( "refresh" );
    }
    function init() {
        $("#flip-autolap").slider();
        $("#flip-debug-log").slider();

        $("#close-settings").on("tap", onClose);
        $("#reset-conf").on("tap", reset);
        
        $("#Settings").on("pageshow", onOpen);
        initValue();
    }
    function reset() {
        function onFail(err) {
            console.log(err);
        }
        function onConfirm() {
            Hayate.Config.reset()
                .done(onOpen)
                .fail(onFail);
        }

        Hayate.PopupView.openConfirmDialog(
            document.webL10n.get("reset-conf-title"),
            document.webL10n.get("reset-conf-message"),
            document.webL10n.get("reset"),
            onConfirm);
    }
    function initValue() {
        var distanceUnit = Hayate.Config.get(["geolocation", "distanceUnit"]);
        var distanceUnitStr;
        if (distanceUnit === "metre") {
            distanceUnitStr = document.webL10n.get("distance-unit-metre");
        } else {
            distanceUnitStr = document.webL10n.get("distance-unit-mile");
        }

        function appendDistanceOptions(eleSelect, value) {
            var optionAttr = {
                value: value,
                text: value + " " + distanceUnitStr
            };
            $(eleSelect).append($('<option>', optionAttr));        
        }
        [10, 50, 100, 200, 500, 1000].forEach(
            appendDistanceOptions.bind(null, "#select-min-accuracy"));
        [10, 50, 100, 200, 500, 1000].forEach(
            appendDistanceOptions.bind(null, "#select-min-alt-accuracy"));
        [1, 5, 10, 50, 100].forEach(
            appendDistanceOptions.bind(null, "#select-min-distance-interval"));
        
        function appendTimeOptions(eleSelect, value) {
            var optionAttr = {
                value: value,
                text: value + " " + document.webL10n.get("seconds")
            };
            $(eleSelect).append($('<option>', optionAttr));        
        }
        [0, 1, 5, 10, 30, 60].forEach(
            appendTimeOptions.bind(null, "#select-min-time-interval"));
        
        function appendStringOptions(eleSelect, value) {
            var optionAttr = {
                value: value,
                text: document.webL10n.get(value)
            };
            $(eleSelect).append($('<option>', optionAttr));        
        }
        ["average-pace", "current-pace"].forEach(
            appendStringOptions.bind(null, "#select-pace-type"));
        ["GoogleMap", "OpenStreetMap"].forEach(
            appendStringOptions.bind(null, "#select-maptype"));
        ["metre", "mile"].forEach(
            appendStringOptions.bind(null, "#select-distance-unit"));
        ["gpx", "position"].forEach(
            appendStringOptions.bind(null, "#select-export"));
        
        function appendNumberOptions(eleSelect, value) {
            var optionAttr = {
                value: value,
                text: value
            };
            $(eleSelect).append($('<option>', optionAttr));        
        }
        [12, 14, 16].forEach(
            appendNumberOptions.bind(null, "#select-zoom"));
            
        
        /* doesn't work
        values = ["on", "off"];
        for (i = 0; i < values.length; i++) {
            $('#flip-autolap').append($('<option>', {
                value: values[i],
                text: document.webL10n.get(values[i])
            }));        
            $('#flip-debug-log').append($('<option>', {
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
