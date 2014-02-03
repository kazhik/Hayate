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
        var selectedStartTime = parseInt($(this).find("a").attr("id"), 10);
        
        // TODO: open context menu, edit/delete/export
        exportRecord(selectedStartTime);

    }
    function exportRecord(startTime) {
        function onWriteComplete(err) {
            if (err) {
                console.log("Failed to write " + filename + ": " + err.name);
            }
        }
        function onGpxFile(file) {
            Hayate.Storage.writeFile(file, filename, onWriteComplete);
            
        }
        function makeFilename(startTime) {
            var datetime = new Date(startTime);
            
            return datetime.toISOString().replace(/\D/g, "") + ".gpx";
        }
        function onCheckResult(result) {
            if (result === null || result.name !== "NotFoundError") {
                console.log("File check error(" + filename + "): "  + result.name);
                return;
            }
            // TODO: User should be able to modify metadata
            var metadata = {
                name: Hayate.ViewUtil.formatDateTime(startTime),
                desc: "",
                type: ""
            };
            Hayate.Recorder.makeGpxFileObject(startTime, metadata, onGpxFile);
            
        }
        
        var filename = makeFilename(startTime);
        Hayate.Storage.checkIfFileExists(filename, onCheckResult);
        
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