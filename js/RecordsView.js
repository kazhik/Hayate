"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RecordsView = function() {
    function onGetItemList(result) {
        $('#recordList').children().remove('li');

        for (var i = 0; i < result.length && i < result.length < 4; i++) {
            var startTime = result[i]["StartTime"];
            var startTimeStr = Hayate.ViewUtil.formatDateTime(startTime);
            var recordName = result[i]["Name"];
            if (typeof recordName === "undefined") {
                recordName = startTimeStr;
            }
            $("#recordList")
                .append($("<li/>")
                .append($("<a/>", {
                    "href": "#",
                    "id": startTime,
                    "text": recordName
                    })))
                .listview("refresh");
        }
        
    }
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onPageShow() {
        console.log("RecordsView onPageShow");
        Hayate.Database.getItemList("GeoLocation", ["Name"])
            .done(onGetItemList)
            .fail(onFail);
    }
    function onTapRecord() {
        var selectedStartTime = parseInt($(this).find("a").attr("id"), 10);

    	$.mobile.back();
        
        Hayate.Recorder.load(selectedStartTime);
    }
    function onTapholdRecord() {
    }
    function clearAll() {
        function onConfirm() {
            Hayate.Database.clear("GeoLocation");
            $('#recordList').children().remove('li');
        }
        
        Hayate.ViewUtil.openConfirmDialog(
            document.webL10n.get("clear-records-title"),
            document.webL10n.get("clear-records-message"),
            document.webL10n.get("clear"),
            onConfirm);
        
    }

    function init() {
        $("#recordList").listview().listview("refresh");

        $("#recordList").on("tap", "li", onTapRecord);
        $("#recordList").on("taphold", "li", onTapholdRecord);

        $("#clear-allrecords").on("tap", clearAll);
        
        $("#Records").on("pageshow", onPageShow);
    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();