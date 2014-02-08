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
            
            Hayate.Database.setItem("GeoLocation", selected, "Name", recordName);
            
        }
        function onLoad(data) {
            var recordName = data["Name"];
            if (typeof recordName === "undefined") {
                recordName = Hayate.ViewUtil.formatDateTime(selected)
            }
            $("#record-name").val(recordName);
        
            $("#save").on("tap", saveRecord);

            $("#edit-dialog").popup().popup("open");
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
                .then(Hayate.Database.getItemList.bind(null, "GeoLocation", ["Name"]))
                .done(onGetItemList)
                .fail(onFail);

        }
        Hayate.ViewUtil.openConfirmDialog(
            document.webL10n.get("delete-record-title"),
            document.webL10n.get("delete-record-message"),
            document.webL10n.get("delete"),
            onConfirm);
        
    }
    function onTapExportRecord() {
        function onError(err) {
            console.log(err);
            Hayate.ViewUtil.toast(err);
        }
        function onWriteComplete() {
            Hayate.ViewUtil.toast("Exported to sdcard");
        }
        function makeFilename(startTime) {
            var datetime = new Date(startTime);
            
            return datetime.toISOString().replace(/\D/g, "") + ".gpx";
        }
        var selectedStartTime = selected;
        
        var filename = makeFilename(selectedStartTime);
        Hayate.Storage.fileNotFound(filename)
            .then(Hayate.Storage.checkIfAvailable)
            .then(Hayate.Recorder.makeGpxFileObject.bind(null, selectedStartTime))
            .then(Hayate.Storage.writeFile.bind(null, filename))
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