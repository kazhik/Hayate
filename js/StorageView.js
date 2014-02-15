"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StorageView = function() {

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
       
        files = gpxFiles;
        var keys = Object.keys(gpxFiles);
        if (keys.length === 0) {
            $.mobile.back();
            Hayate.PopupView.toast("No file");
            return;
        }
        for (var i = 0; i < keys.length; i++) {
            
            Hayate.Storage.getTrackName(gpxFiles[keys[i]], getTrackNameCallback);
            
        }
    }
    function onPageShow() {
        function onUnavailable(err) {
            console.warn("sdcard unavailable: " + err);
            $.mobile.back();
            Hayate.PopupView.toast("sdcard unavailable: " + err);
        }
        $("#importSourceList").children().remove("li");
        
        $('#importSourceList').height(Hayate.ViewUtil.getContentHeight());
        console.log("StorageView onPageShow");
        Hayate.Storage.checkIfAvailable()
            .then(Hayate.Storage.getGpxFiles)
            .done(onFileList)
            .fail(onUnavailable);
    }

    function onSelectListItem() {
        var selectedFile = files[$(this).attr("data-filename")];
        Hayate.Recorder.importGpxFile(selectedFile);
                    
        $.mobile.back();
    }
    
    var publicObj = {};
    var files = {};
    
    publicObj.init = function() {
        $("#Import").on("pageshow", onPageShow);
        $("#importSourceList").on("tap", "li a", onSelectListItem);     
    };
   
    return publicObj;
}();