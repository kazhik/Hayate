"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LogView = function() {
    function init() {
        $("#logList").listview().listview("refresh");
        $("#delete-log").on("tap", clearLog);

        $("#Log").on("pageshow", onPageShow);
        initLog();
    }
    function onPageShow() {
        $('#logList').height(Hayate.ViewUtil.getContentHeight());
    }
    function initLog() {
        var consolelog = console.log;
        console.log = function (message) {
            var log = {
                timestamp: Date.now(),
                message: message,
            };
            Hayate.Database.add("ConsoleLog", log);

            var logmsg = Hayate.StringUtil.formatTime(log.timestamp) + " " + message;
            $("#logList")
                .append($("<li/>")
                    .append(logmsg))
                .listview("refresh");            

            consolelog.apply(console, arguments);
        };
        
    }

    function clearLog() {
        function onConfirm() {
            Hayate.Database.clear("ConsoleLog");
            $('#logList').children().remove('li');
        }

        Hayate.PopupView.openConfirmDialog(
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