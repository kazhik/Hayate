"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RecordsView = function() {

    function onGetItemList(result) {
        $('#recordList').children().remove('li');

        for (var i = 0; i < result.length; i++) {
            var startTime = result[i]["StartTime"];
            var startTimeStr = Hayate.StringUtil.formatDateTime(startTime);
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
        $('#recordList').height(Hayate.ViewUtil.getContentHeight());
        
    }
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onPageShow() {
        console.log("RecordsView onPageShow");
        initList();
    }
    function initList() {
        disableToolbarButtons();   

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
        selected = parseInt($(this).find("a").attr("id"), 10);
        
        enableToolbarButtons();

    }
    function onTapEditRecord() {
        function saveRecord() {
            var recordName = $("#record-name").val();
            
            Hayate.Database.setItem("GeoLocation", selected, "Name", recordName)
                .done(initList)
                .fail(onFail);
            
        }
        function onLoad(data) {
            var recordName = data["Name"];
            if (typeof recordName === "undefined") {
                recordName = Hayate.StringUtil.formatDateTime(selected)
            }
            Hayate.PopupView.openEditRecordDialog(recordName, saveRecord);
        }
        function onGet(data) {
            $("#popup").load("edit-dialog.html", onLoad.bind(null, data));
            
        }
        function onFail(err) {
            console.log("Failed to get record: " + err.name);
        }
        Hayate.Database.get("GeoLocation", selected)
            .done(onGet)
            .fail(onFail);
    }
    function onTapDeleteRecord() {
        function onConfirm() {
            Hayate.Database.remove("GeoLocation", selected)
                .done(initList)
                .fail(onFail);

        }
        Hayate.PopupView.openConfirmDialog(
            document.webL10n.get("delete-record-title"),
            document.webL10n.get("delete-record-message"),
            document.webL10n.get("delete"),
            onConfirm);
        
    }
    function onTapExportRecord() {
        function onError(err) {
            Hayate.PopupView.toast(err);
        }
        function onWriteComplete() {
            Hayate.PopupView.toast("Exported to sdcard");
        }
        function makeFilename(startTime) {
            var datetime = new Date(startTime);
            
            return datetime.toISOString().replace(/\D/g, "") + exportInfo[exportType]["extension"];
        }

        var exportInfo = {
            "gpx": {
                extension: ".gpx",
                makeFile: Hayate.Recorder.makeGpxFileObject,
                writeFile: Hayate.Storage.writeGpxFile
            },
            "position": {
                extension: ".position",
                makeFile: Hayate.Recorder.makePositionFileObject,
                writeFile: Hayate.Storage.writePositionFile
            }
        }
        var selectedStartTime = selected;

        var exportType = Hayate.Config.get(["debug", "export"]);
        
        if (typeof exportInfo[exportType] === "undefined") {
            console.log("Invalid export type");
            return;
        }
        
        var filename = makeFilename(selectedStartTime);
        Hayate.Storage.fileNotFound(filename)
            .then(Hayate.Storage.checkIfAvailable)
            .then(exportInfo[exportType]["makeFile"].bind(null, selectedStartTime))
            .then(exportInfo[exportType]["writeFile"].bind(null, filename))
            .done(onWriteComplete)
            .fail(onError);
        
    }
    // http://stackoverflow.com/questions/6438659/how-to-disable-a-link-button-in-jquery-mobile
    function enableToolbarButtons() {
        $("#edit-record").removeClass("ui-disabled");
        $("#delete-record").removeClass("ui-disabled");
        $("#export-record").removeClass("ui-disabled");
    }
    function disableToolbarButtons() {
        $("#edit-record").addClass("ui-disabled");
        $("#delete-record").addClass("ui-disabled");
        $("#export-record").addClass("ui-disabled");
        
    }
    function clearAll() {
        function onConfirm() {
            Hayate.Database.clear("GeoLocation");
            $('#recordList').children().remove('li');
        }
        
        Hayate.PopupView.openConfirmDialog(
            document.webL10n.get("clear-records-title"),
            document.webL10n.get("clear-records-message"),
            document.webL10n.get("clear"),
            onConfirm);
        
    }

    function init() {
        $("#recordList").listview().listview("refresh");

        $("#recordList").on("tap", "li", onTapRecord);
        $("#recordList").on("taphold", "li", onTapholdRecord);

        $("#edit-record").on("tap", onTapEditRecord);
        $("#delete-record").on("tap", onTapDeleteRecord);
        $("#export-record").on("tap", onTapExportRecord);
        
        $("#clear-allrecords").on("tap", clearAll);
        
        $("#Records").on("pageshow", onPageShow);
     
    }
    var selected;
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();