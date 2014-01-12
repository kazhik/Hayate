"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LogView = function() {
    function init() {
        if (Hayate.Config.get(["debug"]) === false) {
            return;
        }
        $("#logList").listview().listview("refresh");
        $("#delete-log").on("tap", clearLog);

        $("#panel-menu")
            .append($("<li/>")
            .append($("<a/>", {
                "href": "#Log",
                "id": "open-log",
                "text": "Log"
                })))
            .listview("refresh");

        initLog();
    }
    function initLog() {
        var consolelog = console.log;
        console.log = function (message) {
            var log = {
                timestamp: Date.now(),
                message: message,
            };
            Hayate.Database.add("ConsoleLog", log);

            var logmsg = Hayate.Util.formatTime(log.timestamp) + " " + message;
            $("#logList")
                .append($("<li/>")
                    .append(logmsg))
                .listview("refresh");            
            
            $("#message").text(message);
            consolelog.apply(console, arguments);
        };
        
    }

    function clearLog() {
        function onConfirm() {
            Hayate.Database.clear("ConsoleLog");
            $('#logList').children().remove('li');
        }
        Hayate.Util.openConfirmDialog("Clear log", "Are you sure to clear log?", "Clear", onConfirm);

    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();