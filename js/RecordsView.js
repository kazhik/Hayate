"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RecordsView = function() {
    function onGetSummary(result) {
        $('#recordList').children().remove('li');

        for (var i = 0; i < result.length && i < result.length < 4; i++) {
            var startTime = result[i]["StartTime"];
            var startTimeStr = Hayate.Util.formatDateTime(startTime);
            var recordName = result["Name"];
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
    function onOpenRecords() {
        
        Hayate.Database.getSummary("GeoLocation", ["Name"])
            .done(onGetSummary)
            .fail(onFail);
    }
    function onSelectRecord() {
        var selectedStartTime = parseInt($(this).find("a").attr("id"), 10);

    	$.mobile.back();
        
        Hayate.Recorder.load(selectedStartTime);
    }
    function clearAll() {
        function onConfirm() {
            Hayate.Database.clear("GeoLocation");
            $('#recordList').children().remove('li');
        }
        Hayate.Util.openConfirmDialog("Clear records", "Are you sure to clear all records?", "Clear", onConfirm);
        
    }

    function init() {
        $("#recordList").listview().listview("refresh");

        $("#open-records").on("tap", onOpenRecords);
        $("#recordList").on("tap", "li", onSelectRecord)

        $("#clear-allrecords").on("tap", clearAll);
        
    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();