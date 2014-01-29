"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LogView = function() {
    function init() {
        $("#logList").listview().listview("refresh");
        $("#delete-log").on("tap", clearLog);

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

            var logmsg = Hayate.ViewUtil.formatTime(log.timestamp) + " " + message;
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

        Hayate.ViewUtil.openConfirmDialog(
            document.webL10n.get("clear-log-title"),
            document.webL10n.get("clear-log-message"),
            document.webL10n.get("clear"),
            onConfirm);


    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();