"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StorageView = (function() {

    function onFileList(gpxFiles) {
        function getTrackNameCallback(filename, trackname) {
            $("#importSourceList")
                .append($("<li/>")
                .append($("<a/>", {
                    "href": "#",
                    "data-filename": filename,
                    "text": trackname
                    })));
            $("#importSourceList").listview("refresh");
            
        }
        function onError(err) {
            $.mobile.back();
            Hayate.PopupView.toast("Failed to get track name: " + err);
        }       
        files = gpxFiles;
        var keys = Object.keys(gpxFiles);
        if (keys.length === 0) {
            $.mobile.back();
            Hayate.PopupView.toast("No file");
            return;
        }
        for (var i = 0; i < keys.length; i++) {
            
            Hayate.Storage.getTrackName(gpxFiles[keys[i]])
                .done(getTrackNameCallback)
                .fail(onError);
            
        }
    }
    function onPageShow() {
        function onUnavailable(err) {
            $.mobile.back();
            Hayate.PopupView.toast(err);
        }
        $("#importSourceList").children().remove("li");
        
        $('#importSourceList').height(Hayate.ViewUtil.getContentHeight());
        Hayate.Storage.checkIfAvailable()
            .then(Hayate.Storage.getGpxFiles)
            .done(onFileList)
            .fail(onUnavailable);
    }

    function onSelectListItem() {
        function onDone() {
            Hayate.PopupView.toast("Import complete");
        }
        function onFail(err) {
            Hayate.PopupView.toast(err);
        }
        var selectedFile = files[$(this).attr("data-filename")];
        Hayate.Recorder.importGpxFile(selectedFile)
            .done(onDone)
            .fail(onFail);
                    
        $.mobile.back();
    }
    function init() {
        $("#Import").on("pageshow", onPageShow);
        $("#importSourceList").on("tap", "li a", onSelectListItem);     
    }
    var files = {};
    
    return {
        init: init
    };
}());